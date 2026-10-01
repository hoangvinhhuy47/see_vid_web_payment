import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export interface PaymentVerificationResult {
  isPaid: boolean;
  orderId?: string;
  paymentIntentId?: string;
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
      } catch (err) {
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
