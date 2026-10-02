import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";

// ─── Collection name ──────────────────────────────────────────────────────────
const COLLECTION = "payment_web";

// ─── Data shape saved to Firestore ───────────────────────────────────────────
export interface PaymentWebData {
  orderId: string;
  paymentIntentId: string;
  subscriptionId?: string | null;
  customerId?: string | null;
  customerEmail: string | null;
  status: string;                   // "active" | "succeeded" | ...
  subscriptionStatus?: string;      // "active" | "trialing" | "past_due" | "canceled" | "incomplete"
  isPaid: boolean;
  amount: number;                   // cents, e.g. 6900 = $69.00
  currency: string;                 // "usd"
  planType?: string;                // "year" | "week" | "month" | "one-time"
  productId?: string;               // Stripe Product ID or Lookup Key
  priceId?: string | null;          // Stripe Price ID
  lookupKey?: string | null;        // Stripe Price Lookup Key
  paidAt?: number | null;           // Unix timestamp from Stripe (seconds)
  currentPeriodStart?: number | null; // Unix timestamp in seconds
  currentPeriodEnd?: number | null;   // Unix timestamp in seconds (ngày gia hạn gói)
  renewalDate?: string | null;        // ISO String / Formatted Date (ngày gia hạn gói)
  environment: string;
  // Flutter activation — set false at web, updated by Cloud Function later
  isActivated: boolean;
  activatedAt: null;
}

/**
 * Lưu thông tin thanh toán thành công lên Firestore collection `payment_web`.
 * Document ID = orderId để Flutter dễ query.
 *
 * @param data - Thông tin payment cần lưu
 */
export async function savePaymentToFirestore(data: PaymentWebData): Promise<void> {
  try {
    const ref = doc(db, COLLECTION, data.orderId);

    // ── Debug log (xóa khi deploy production) ────────────────────────────────
    console.log('[Firestore] Attempting to write:', {
      collection: COLLECTION,
      docId: data.orderId,
      projectId: db.app.options.projectId,
      path: ref.path,
      orderId: data.orderId,
      subscriptionId: data.subscriptionId,
      subscriptionStatus: data.subscriptionStatus,
      currentPeriodEnd: data.currentPeriodEnd,
      renewalDate: data.renewalDate,
    });
    // ─────────────────────────────────────────────────────────────────────────

    await setDoc(
      ref,
      {
        ...data,
        // Server timestamp — chính xác hơn client time
        createdAt: serverTimestamp(),
      },
      { merge: true } // Nếu doc đã tồn tại thì update, không ghi đè
    );
    console.log(`[Firestore] ✅ Saved successfully: ${COLLECTION}/${data.orderId}`);
  } catch (error: unknown) {
    // Log đầy đủ để debug
    const fsError = error as { code?: string; message?: string };
    console.error('[Firestore] ❌ Failed to save payment:', {
      code: fsError?.code,       // e.g. "permission-denied", "unavailable"
      message: fsError?.message,
      orderId: data.orderId,
      collection: COLLECTION,
    });
    // Không throw để không block UX — lỗi đã được log
  }
}
