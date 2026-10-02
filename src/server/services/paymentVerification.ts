import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export interface PaymentVerificationResult {
  isPaid: boolean;
  orderId?: string;
  paymentIntentId?: string;
  subscriptionId?: string | null;
  subscriptionStatus?: string | null;
  currentPeriodStart?: number | null;
  currentPeriodEnd?: number | null;
  renewalDate?: string | null;
  status: string;
  amount?: number; // in cents
  amountFormatted?: string;
  currency?: string;
  customerEmail?: string | null;
  receiptUrl?: string | null;
  paidAt?: number;
  metadata?: Record<string, string>;
  message: string;
}

/**
 * Hàm Backend kiểm tra & xác thực xem một Order ID đã được thanh toán thành công qua Stripe chưa.
 * @param orderId - Mã đơn hàng cần xác thực (ví dụ: ORD-1727500000-A1B2)
 */
export async function verifyPaymentByOrderId(orderId: string): Promise<PaymentVerificationResult> {
  if (!orderId || typeof orderId !== 'string') {
    return {
      isPaid: false,
      status: 'missing_order_id',
      message: 'Mã đơn hàng orderId không được để trống.',
    };
  }

  if (!stripe) {
    return {
      isPaid: false,
      status: 'stripe_unconfigured',
      message: 'STRIPE_SECRET_KEY chưa được cấu hình trên server.',
    };
  }

  try {
    // 1. Tìm kiếm PaymentIntent theo metadata orderId
    const searchResult = await stripe.paymentIntents.search({
      query: `metadata['orderId']:'${orderId}'`,
      limit: 1,
    });

    if (!searchResult.data || searchResult.data.length === 0) {
      return {
        isPaid: false,
        orderId,
        status: 'not_found',
        message: `Không tìm thấy đơn hàng nào có mã: ${orderId}`,
      };
    }

    const paymentIntent = searchResult.data[0];
    const isPaid = paymentIntent.status === 'succeeded';
    const piAny = paymentIntent as any;

    // 2. Lấy thông tin Subscription nếu có
    let subscriptionId = paymentIntent.metadata?.subscriptionId || null;
    let subscriptionStatus: string | null = null;
    let currentPeriodStart: number | null = null;
    let currentPeriodEnd: number | null = null;
    let renewalDate: string | null = null;

    if (!subscriptionId && piAny.invoice) {
      try {
        const invoiceId =
          typeof piAny.invoice === 'string'
            ? piAny.invoice
            : piAny.invoice.id;
        const invoice: any = await stripe.invoices.retrieve(invoiceId);
        if (invoice?.subscription) {
          subscriptionId =
            typeof invoice.subscription === 'string'
              ? invoice.subscription
              : invoice.subscription.id;
        }
      } catch {
        // ignore
      }
    }

    if (subscriptionId) {
      try {
        const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
        const item = subscription?.items?.data?.[0];
        subscriptionStatus = subscription?.status ?? null;
        currentPeriodStart = item?.current_period_start ?? subscription?.current_period_start ?? null;
        currentPeriodEnd = item?.current_period_end ?? subscription?.current_period_end ?? null;
        if (currentPeriodEnd) {
          renewalDate = new Date(currentPeriodEnd * 1000).toISOString();
        }
      } catch {
        // ignore
      }
    }

    // Lấy link hóa đơn trực tuyến từ Stripe Charge nếu có
    let receiptUrl: string | null = null;
    if (paymentIntent.latest_charge) {
      try {
        const chargeId =
          typeof paymentIntent.latest_charge === 'string'
            ? paymentIntent.latest_charge
            : paymentIntent.latest_charge.id;
        const charge = await stripe.charges.retrieve(chargeId);
        receiptUrl = charge.receipt_url || null;
      } catch {
        // ignore charge retrieve error
      }
    }

    const amountFormatted = (paymentIntent.amount / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: (paymentIntent.currency || 'usd').toUpperCase(),
    });

    return {
      isPaid,
      orderId,
      paymentIntentId: paymentIntent.id,
      subscriptionId,
      subscriptionStatus: subscriptionStatus || (isPaid ? 'active' : paymentIntent.status),
      currentPeriodStart,
      currentPeriodEnd,
      renewalDate,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      amountFormatted,
      currency: paymentIntent.currency,
      customerEmail: paymentIntent.receipt_email || paymentIntent.metadata?.customerEmail || null,
      receiptUrl,
      paidAt: paymentIntent.created,
      metadata: paymentIntent.metadata,
      message: isPaid
        ? 'Xác thực thành công: Đơn hàng đã được thanh toán.'
        : `Đơn hàng chưa thanh toán thành công (Trạng thái: ${paymentIntent.status}).`,
    };
  } catch (error: any) {
    console.error(`[Stripe Verification Error] orderId=${orderId}:`, error);
    return {
      isPaid: false,
      orderId,
      status: 'error',
      message: error.message || 'Lỗi khi kiểm tra giao dịch trên Stripe.',
    };
  }
}

/**
 * Hàm Backend kiểm tra & xác thực trực tiếp qua PaymentIntent ID của Stripe (pi_...)
 * @param paymentIntentId - Mã PaymentIntent (ví dụ: pi_3PzXYZ...)
 */
export async function verifyPaymentByIntentId(paymentIntentId: string): Promise<PaymentVerificationResult> {
  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    return {
      isPaid: false,
      status: 'missing_intent_id',
      message: 'Mã paymentIntentId không được để trống.',
    };
  }

  if (!stripe) {
    return {
      isPaid: false,
      status: 'stripe_unconfigured',
      message: 'STRIPE_SECRET_KEY chưa được cấu hình.',
    };
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const isPaid = paymentIntent.status === 'succeeded';
    const piAny = paymentIntent as any;

    // Lấy thông tin Subscription nếu có
    let subscriptionId = paymentIntent.metadata?.subscriptionId || null;
    let subscriptionStatus: string | null = null;
    let currentPeriodStart: number | null = null;
    let currentPeriodEnd: number | null = null;
    let renewalDate: string | null = null;

    if (!subscriptionId && piAny.invoice) {
      try {
        const invoiceId =
          typeof piAny.invoice === 'string'
            ? piAny.invoice
            : piAny.invoice.id;
        const invoice: any = await stripe.invoices.retrieve(invoiceId);
        if (invoice?.subscription) {
          subscriptionId =
            typeof invoice.subscription === 'string'
              ? invoice.subscription
              : invoice.subscription.id;
        }
      } catch {
        // ignore
      }
    }

    if (subscriptionId) {
      try {
        const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);
        const item = subscription?.items?.data?.[0];
        subscriptionStatus = subscription?.status ?? null;
        currentPeriodStart = item?.current_period_start ?? subscription?.current_period_start ?? null;
        currentPeriodEnd = item?.current_period_end ?? subscription?.current_period_end ?? null;
        if (currentPeriodEnd) {
          renewalDate = new Date(currentPeriodEnd * 1000).toISOString();
        }
      } catch {
        // ignore
      }
    }

    let receiptUrl: string | null = null;
    if (paymentIntent.latest_charge) {
      try {
        const chargeId =
          typeof paymentIntent.latest_charge === 'string'
            ? paymentIntent.latest_charge
            : paymentIntent.latest_charge.id;
        const charge = await stripe.charges.retrieve(chargeId);
        receiptUrl = charge.receipt_url || null;
      } catch {
        // ignore
      }
    }

    const amountFormatted = (paymentIntent.amount / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: (paymentIntent.currency || 'usd').toUpperCase(),
    });

    return {
      isPaid,
      orderId: paymentIntent.metadata?.orderId,
      paymentIntentId: paymentIntent.id,
      subscriptionId,
      subscriptionStatus: subscriptionStatus || (isPaid ? 'active' : paymentIntent.status),
      currentPeriodStart,
      currentPeriodEnd,
      renewalDate,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      amountFormatted,
      currency: paymentIntent.currency,
      customerEmail: paymentIntent.receipt_email || paymentIntent.metadata?.customerEmail || null,
      receiptUrl,
      paidAt: paymentIntent.created,
      metadata: paymentIntent.metadata,
      message: isPaid
        ? 'Xác thực thành công: Giao dịch đã thanh toán.'
        : `Giao dịch chưa hoàn tất (Trạng thái: ${paymentIntent.status}).`,
    };
  } catch (error: any) {
    return {
      isPaid: false,
      paymentIntentId,
      status: 'error',
      message: error.message || 'Lỗi khi kiểm tra PaymentIntent trên Stripe.',
    };
  }
}
