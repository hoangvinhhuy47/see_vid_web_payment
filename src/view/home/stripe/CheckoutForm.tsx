import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Lock, Loader2, AlertCircle, Mail, Hash } from 'lucide-react';
import { TestCardHelper } from './TestCardHelper';
import { savePaymentToFirestore } from '@/utils/savePayment';

interface CheckoutFormProps {
  amount: number; // in cents
  currency?: string;
  itemName: string;
  orderId?: string;
  customerEmail?: string;
  lookupKey?: string | null; // Stripe Price Lookup Key
  priceId?: string | null;
  productId?: string | null;
  interval?: "week" | "month" | "year" | "day" | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  currentPeriodEnd?: number | null;
  renewalDate?: string | null;
  subscriptionStatus?: string | null;
  onSuccess?: (paymentIntentId: string, orderId?: string) => void;
  onCancel?: () => void;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  amount,
  currency = 'USD',
  itemName,
  orderId,
  customerEmail,
  lookupKey,
  priceId,
  productId,
  interval,
  subscriptionId,
  customerId,
  currentPeriodEnd,
  renewalDate,
  subscriptionStatus,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const formattedPrice = (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Return URL with order_id and payment_intent
      const queryParams = new URLSearchParams();
      if (orderId) queryParams.set('order_id', orderId);

      const returnUrl = `${window.location.origin}/payment/success?${queryParams.toString()}`;

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required', // Only redirect when 3DS / external bank requires it
      });

      if (result.error) {
        setErrorMessage(result.error.message || 'Thanh toán thất bại, vui lòng kiểm tra lại.');
        setIsProcessing(false);
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // ── Lưu thông tin subscription lên Firestore ─────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const intent = result.paymentIntent;
        const intentAny = intent as any;
        const paidAtTimestamp = intentAny?.created ?? Math.floor(Date.now() / 1000);

        // Tính ngày gia hạn (currentPeriodEnd & renewalDate)
        let periodEndTimestamp: number = currentPeriodEnd ?? 0;
        if (!periodEndTimestamp) {
          if (interval === 'year') {
            periodEndTimestamp = paidAtTimestamp + 365 * 24 * 3600;
          } else if (interval === 'month') {
            periodEndTimestamp = paidAtTimestamp + 30 * 24 * 3600;
          } else {
            periodEndTimestamp = paidAtTimestamp + 7 * 24 * 3600; // default week
          }
        }

        const renewalDateStr =
          renewalDate || new Date(periodEndTimestamp * 1000).toISOString();

        await savePaymentToFirestore({
          orderId: orderId || intent.id,
          paymentIntentId: intent.id,
          subscriptionId: subscriptionId || intentAny?.metadata?.subscriptionId || null,
          customerId: customerId || intentAny?.customer || null,
          customerEmail: customerEmail || intent.receipt_email || null,
          status: 'active', // Trạng thái subscription đã kích hoạt
          subscriptionStatus: 'active', // Trạng thái gói: active
          isPaid: true,
          amount: intent.amount,
          currency: intent.currency,
          planType: intentAny?.metadata?.planType || interval || 'week',
          productId: lookupKey || productId || intentAny?.metadata?.productId || 'null',
          priceId: priceId || intentAny?.metadata?.priceId || null,
          lookupKey: lookupKey || intentAny?.metadata?.lookupKey || null,
          paidAt: paidAtTimestamp,
          currentPeriodStart: paidAtTimestamp,
          currentPeriodEnd: periodEndTimestamp, // Ngày gia hạn (timestamp seconds)
          renewalDate: renewalDateStr, // Ngày gia hạn (ISO String)
          isActivated: false,
          activatedAt: null,
        });
        setIsProcessing(false);
        if (onSuccess) {
          onSuccess(intent.id, orderId);
        } else {
          // Chuyển hướng sang màn hình thông báo thành công và Download App
          window.location.href = `/payment/success?order_id=${encodeURIComponent(
            orderId || ''
          )}&payment_intent=${encodeURIComponent(intent.id)}`;
        }
      } else {
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Đã có lỗi xảy ra.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Order Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-900/90 border border-purple-500/20 rounded-xl gap-2">
        <div>
          <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider">
            Gói Đăng Ký
          </div>
          <div className="text-base font-bold text-white flex items-center gap-2">
            <span>{itemName}</span>
          </div>
          {orderId && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Hash className="w-3 h-3 text-purple-400" />
              <span className='text-white'>Mã Đơn: </span>
              <span className="font-mono text-purple-200">{orderId}</span>
            </div>
          )}
        </div>
        <div className="sm:text-right">
          <div className="text-xs text-slate-400">Số tiền thanh toán</div>
          <div className="text-xl font-black text-emerald-400">{formattedPrice}</div>
        </div>
      </div>

      {customerEmail && (
        <div className="flex items-center gap-2 p-2.5 bg-purple-950/30 border border-purple-800/40 rounded-lg text-xs text-purple-200">
          <Mail className="w-4 h-4 text-pink-400 shrink-0" />
          <span>
            Hóa đơn điện tử (Receipt) sẽ tự động gửi tới: <strong>{customerEmail}</strong>
          </span>
        </div>
      )}

      {/* Stripe Payment Element */}
      <div className="p-4 bg-white border border-slate-700/60 rounded-xl">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Thanh toán bảo mật trực tiếp qua Stripe</span>
          </div>
          <span className="text-[11px] text-purple-400 font-mono">Test Mode</span>
        </div>
        <PaymentElement
          options={{
            layout: 'accordion',
            
          }}
        />
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium transition-colors"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang xử lý giao dịch...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Xác nhận Thanh toán ({formattedPrice})</span>
            </>
          )}
        </button>
      </div>

     
    </form>
  );
};
