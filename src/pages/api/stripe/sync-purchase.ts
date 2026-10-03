import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import {
  collection,
  query,
  where,
  limit,
  getDocs,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  Timestamp,
  DocumentReference,
} from "firebase/firestore";
import { db } from "@/utils/firebase";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // CORS support
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-User-Id",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      code: "METHOD_NOT_ALLOWED",
    });
  }

  if (!stripe) {
    return res.status(500).json({
      success: false,
      code: "STRIPE_UNCONFIGURED",
      message: "STRIPE_SECRET_KEY is missing on server",
    });
  }

  try {
    const { deviceId, orderId, email, userId: bodyUserId } = req.body ?? {};

    // Lấy userId trực tiếp từ body hoặc header (không cần verify token phức tạp)
    const headerUserId =
      typeof req.headers["x-user-id"] === "string"
        ? req.headers["x-user-id"].trim()
        : typeof req.headers.authorization === "string" &&
            req.headers.authorization.startsWith("Bearer ")
          ? req.headers.authorization.slice(7).trim()
          : "";

    const userId = (bodyUserId || headerUserId || "default_user")
      .toString()
      .trim();

    if (
      typeof deviceId !== "string" ||
      !deviceId.trim() ||
      (!orderId && !email)
    ) {
      return res.status(400).json({
        success: false,
        code: "INVALID_ARGUMENT",
        message: "Provide deviceId and orderId or email",
      });
    }

    // 2. Tìm giao dịch trong Firestore collection `payment_web`
    const paymentCol = collection(db, "payment_web");
    const q = orderId
      ? query(
          paymentCol,
          where("orderId", "==", String(orderId).trim()),
          limit(2),
        )
      : query(
          paymentCol,
          where("customerEmail", "==", String(email).trim().toLowerCase()),
          limit(20),
        );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({
        success: false,
        code: "PURCHASE_NOT_FOUND",
        message: "No purchase found for this orderId/email",
      });
    }

    if (orderId && querySnapshot.size > 1) {
      return res.status(409).json({
        success: false,
        code: "DUPLICATE_ORDER",
      });
    }

    const paymentDocs = querySnapshot.docs;

    // 3. Kiểm tra thiết bị trước khi gọi Stripe
    for (const docSnap of paymentDocs) {
      const data = docSnap.data();

      if (data.activatedAt != null) {
        return res.status(409).json({
          success: false,
          code: "DEVICE_MISMATCH",
          message: "Subscription is activated on another device",
        });
      }

      if (data.claimedUserId && data.claimedUserId !== userId) {
        return res.status(409).json({
          success: false,
          code: "PURCHASE_ALREADY_CLAIMED",
          message: "This purchase has already been claimed by another user",
        });
      }
    }

    // 4. Xác minh subscription trực tiếp trên Stripe (Source of Truth)
    interface VerifiedItem {
      docRef: DocumentReference;
      data: any;
      subscription: Stripe.Subscription;
      periodEnd: number;
      periodStart: number;
      expiryMs: number;
      isExpired: boolean;
      isActive: boolean;
      creditsToAdd: number;
    }

    const verified: VerifiedItem[] = [];

    for (const docSnap of paymentDocs) {
      const data = docSnap.data() as any;

      if (typeof data.subscriptionId !== "string" || !data.subscriptionId) {
        return res.status(422).json({
          success: false,
          code: "MISSING_SUBSCRIPTION_ID",
          orderId: data.orderId,
        });
      }

      let subscription: Stripe.Subscription;

      try {
        subscription = await stripe.subscriptions.retrieve(
          data.subscriptionId,
          {
            expand: ["items.data.price.product"],
          },
        );
      } catch (error: any) {
        if (
          error instanceof Stripe.errors.StripeInvalidRequestError &&
          error.code === "resource_missing"
        ) {
          return res.status(404).json({
            success: false,
            code: "STRIPE_SUBSCRIPTION_NOT_FOUND",
            orderId: data.orderId,
          });
        }
        throw error;
      }

      // Lấy credit từ Product description hoặc metadata
      const product = subscription.items.data[0]?.price.product as any;
      let creditsToAdd = 0;

      if (product && typeof product === "object" && !product.deleted) {
        if (product.description) {
          const match = product.description.match(/(\d+[\d,.]*)/);
          if (match) {
            const num = parseInt(match[1].replace(/[,.]/g, ""), 10);
            if (Number.isSafeInteger(num) && num > 0) {
              creditsToAdd = num;
            }
          }
        }
        if (!creditsToAdd && product.metadata?.credits) {
          const num = parseInt(product.metadata.credits, 10);
          if (Number.isSafeInteger(num) && num > 0) {
            creditsToAdd = num;
          }
        }
      }

      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

      if (data.customerId && customerId !== data.customerId) {
        return res.status(409).json({
          success: false,
          code: "STRIPE_CUSTOMER_MISMATCH",
          orderId: data.orderId,
        });
      }

      const stripePriceIds = subscription.items.data.map(
        (item) => item.price.id,
      );

      if (data.priceId && !stripePriceIds.includes(data.priceId)) {
        return res.status(409).json({
          success: false,
          code: "STRIPE_PRICE_MISMATCH",
          orderId: data.orderId,
        });
      }

      // Trích xuất period ends từ subscription items
      const periodEnds = subscription.items.data
        .map((item: any) => item.current_period_end)
        .filter(
          (value: any): value is number =>
            typeof value === "number" && value > 0,
        );

      if (periodEnds.length === 0) {
        return res.status(422).json({
          success: false,
          code: "STRIPE_PERIOD_NOT_FOUND",
          orderId: data.orderId,
        });
      }

      const periodEnd = Math.max(...periodEnds);
      const periodStarts = subscription.items.data
        .map((item: any) => item.current_period_start)
        .filter((value: any): value is number => typeof value === "number");
      const periodStart =
        periodStarts.length > 0
          ? Math.min(...periodStarts)
          : Math.floor(Date.now() / 1000);

      const expiryMs = periodEnd * 1000;
      const isExpired = expiryMs <= Date.now();
      const isActive =
        ["active", "trialing"].includes(subscription.status) && !isExpired;

      verified.push({
        docRef: docSnap.ref,
        data,
        subscription,
        periodEnd,
        periodStart,
        expiryMs,
        isExpired,
        isActive,
        creditsToAdd,
      });
    }

    // 5. Đồng bộ Firestore bằng transaction (Chống Race Condition)
    const memberDocRef = doc(db, "members", userId);

    const result = await runTransaction(db, async (tx) => {
      // 1. Read phase: Đọc tất cả document cần thiết trước khi bắt đầu ghi
      const purchaseRefs = verified.map((item) =>
        doc(db, "purchase", `stripe_${item.data.orderId}`),
      );

      const latestPayments = await Promise.all(
        verified.map((item) => tx.get(item.docRef)),
      );

      const existingPurchases = await Promise.all(
        purchaseRefs.map((ref) => tx.get(ref)),
      );

      const memberSnap = await tx.get(memberDocRef);

      // Kiểm tra lại ownership và thiết bị trước khi ghi
      for (let i = 0; i < verified.length; i++) {
        const payment = latestPayments[i];

        if (!payment.exists()) {
          throw new Error("PURCHASE_NOT_FOUND");
        }

        const latest = payment.data() as any;

        if (latest.claimedUserId && latest.claimedUserId !== userId) {
          throw new Error("PURCHASE_ALREADY_CLAIMED");
        }

        if (
          latest.activatedAt != null &&
          latest.activatedDeviceId !== deviceId
        ) {
          throw new Error(
            latest.activatedDeviceId
              ? "DEVICE_MISMATCH"
              : "ACTIVATED_DEVICE_UNKNOWN",
          );
        }

        const existingPurchaseData = existingPurchases[i].exists()
          ? (existingPurchases[i].data() as any)
          : null;
        if (existingPurchaseData && existingPurchaseData.userId !== userId) {
          throw new Error("PURCHASE_ALREADY_CLAIMED");
        }
      }

      // 2. Write phase: Ghi dữ liệu vào purchase, payment_web và members
      const subscriptions = [];
      let totalCreditsAdded = 0;

      for (let i = 0; i < verified.length; i++) {
        const item = verified[i];
        const latest = latestPayments[i].data() as any;
        const purchaseRef = purchaseRefs[i];

        const createdAt = latest.createdAt;
        let purchaseDate: Timestamp;
        if (createdAt instanceof Timestamp) {
          purchaseDate = createdAt;
        } else if (createdAt && typeof createdAt.toDate === "function") {
          purchaseDate = createdAt;
        } else if (createdAt) {
          purchaseDate = Timestamp.fromDate(new Date(createdAt));
        } else {
          purchaseDate = Timestamp.now();
        }

        const purchasePayload = {
          deviceId: deviceId,
          expiryDate: Timestamp.fromMillis(item.expiryMs),
          iapSource: "stripe",
          orderId: latest.orderId,
          purchaseDate: purchaseDate,
          status: item.subscription.status,
          productId: latest.lookupKey ?? latest.productId ?? "subscription",
          type: "subscription",
          userId: userId,
          subscriptionId: item.subscription.id,
          priceId: item.data.priceId ?? null,
          isActive: item.isActive,
          isExpired: item.isExpired,
          credits: item.creditsToAdd,
          syncedAt: serverTimestamp(),
        };

        // Ghi vào collection `purchase`
        tx.set(purchaseRef, purchasePayload, { merge: true });

        // Cập nhật trạng thái và device lock trong `payment_web`
        const paymentUpdates: Record<string, any> = {
          subscriptionStatus: item.subscription.status,
          currentPeriodStart: item.periodStart,
          currentPeriodEnd: item.periodEnd,
          renewalDate: new Date(item.expiryMs).toISOString(),
          isActive: item.isActive,
          isExpired: item.isExpired,
          lastStripeVerifiedAt: serverTimestamp(),
          claimedUserId: userId,
        };

        // Chỉ cộng credits và khóa thiết bị khi subscription đang còn hiệu lực và chưa từng kích hoạt
        const isFirstActivation = item.isActive && latest.activatedAt == null;
        if (isFirstActivation) {
          paymentUpdates.activatedAt = serverTimestamp();
          paymentUpdates.activatedDeviceId = deviceId;
          paymentUpdates.activatedBy = userId;

          if (item.creditsToAdd > 0) {
            totalCreditsAdded += item.creditsToAdd;
            paymentUpdates.creditsGranted = true;
            paymentUpdates.creditsAmount = item.creditsToAdd;
          }
        }

        tx.update(item.docRef, paymentUpdates);

        subscriptions.push({
          orderId: latest.orderId,
          productId: latest.lookupKey ?? latest.productId ?? "subscription",
          subscriptionId: item.subscription.id,
          status: item.subscription.status,
          isActive: item.isActive,
          isExpired: item.isExpired,
          expiryDate: new Date(item.expiryMs).toISOString(),
          creditsAdded: isFirstActivation ? item.creditsToAdd : 0,
        });
      }

      // Cộng credits vào bảng `members`
      if (totalCreditsAdded > 0) {
        const currentCredits = memberSnap.exists()
          ? Number(memberSnap.data()?.credits ?? 0)
          : 0;

        tx.set(
          memberDocRef,
          {
            credits: currentCredits + totalCreditsAdded,
            userId: userId,
            last_login_time: serverTimestamp(),
          },
          { merge: true },
        );
      }

      return { subscriptions, totalCreditsAdded };
    });

    // 6. Đọc purchase từ Firestore sau khi cập nhật
    const purchaseSnapshots = await Promise.all(
      result.subscriptions.map((item) =>
        getDoc(doc(db, "purchase", `stripe_${item.orderId}`)),
      ),
    );

    const purchases = purchaseSnapshots
      .filter((docSnap) => docSnap.exists())
      .map((docSnap) => {
        const data = docSnap.data()!;
        return {
          id: docSnap.id,
          ...data,
          expiryDate:
            data.expiryDate instanceof Timestamp
              ? data.expiryDate.toDate().toISOString()
              : (data.expiryDate ?? null),
          purchaseDate:
            data.purchaseDate instanceof Timestamp
              ? data.purchaseDate.toDate().toISOString()
              : (data.purchaseDate ?? null),
        };
      });

    return res.status(200).json({
      success: true,
      userId,
      deviceId,
      creditsAdded: result.totalCreditsAdded,
      subscriptions: result.subscriptions,
      purchases,
    });
  } catch (error: any) {
    const message = error instanceof Error ? error.message : "";

    if (message === "DEVICE_MISMATCH") {
      return res.status(409).json({
        success: false,
        code: "DEVICE_MISMATCH",
        message: "Subscription is activated on another device",
      });
    }

    if (message === "ACTIVATED_DEVICE_UNKNOWN") {
      return res.status(409).json({
        success: false,
        code: "ACTIVATED_DEVICE_UNKNOWN",
        message: "Purchase was activated before, but device ID is missing",
      });
    }

    if (message === "PURCHASE_ALREADY_CLAIMED") {
      return res.status(409).json({
        success: false,
        code: "PURCHASE_ALREADY_CLAIMED",
        message: "Purchase has already been claimed by another account",
      });
    }

    if (message === "PURCHASE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        code: "PURCHASE_NOT_FOUND",
      });
    }

    console.error("[syncStripePurchase API Error]:", error);

    return res.status(500).json({
      success: false,
      code: "INTERNAL_ERROR",
      message: error?.message || "Internal server error",
    });
  }
}
