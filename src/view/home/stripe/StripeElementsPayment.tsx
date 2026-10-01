import { Elements } from "@stripe/react-stripe-js";
import { Appearance, StripeElementsOptions } from "@stripe/stripe-js";
import { getStripe } from "@/utils/stripe";
import { CheckoutForm } from "./CheckoutForm";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { StripePlan } from "@/model/stripe_plan";

// ─── Props ────────────────────────────────────────────────────────────────────
interface StripeElementsPaymentProps {
  activePlan: StripePlan;
  priceUSD: number;
  clientSecret: string | null;
  orderId: string;
  customerEmail: string;
  isLoading: boolean;
  error: string | null;
}

// ─── Stripe Elements light-mode appearance ────────────────────────────────────
const appearance: Appearance = {
  theme: "stripe",
  variables: {
    colorPrimary: "#a855f7",
    colorBackground: "#ffffff",
    colorText: "#1e293b",
    colorDanger: "#f43f5e",
    fontFamily: "system-ui, -apple-system, sans-serif",
    borderRadius: "0.75rem",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid #e2e8f0",
      backgroundColor: "#ffffff",
      boxShadow: "none",
      color: "#1e293b",
    },
    ".Input:focus": {
      border: "1px solid #a855f7",
      boxShadow: "0 0 0 1px #a855f7",
    },
    ".Tab": { border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" },
    ".Tab--selected": { borderColor: "#a855f7", backgroundColor: "#faf5ff" },
    ".Label": { color: "#475569" },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function StripeElementsPayment({
  activePlan,
  priceUSD,
  clientSecret,
  orderId,
  customerEmail,
  isLoading,
  error,
}: StripeElementsPaymentProps) {
  const options: StripeElementsOptions | undefined = clientSecret
    ? { clientSecret, appearance }
    : undefined;

  return (
    <div className="w-full bg-white border border-purple-300/50 rounded-2xl shadow-lg p-6 md:p-8 relative">
      {/* ── Header ── */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-purple-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-600">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Thanh Toán Trực Tiếp:{" "}
              <span className="text-purple-600">{activePlan.productName}</span>{" "}
              (${priceUSD.toFixed(2)})
            </h3>
            <p className="text-xs text-slate-500">
              Form Stripe Elements tích hợp trực tiếp
            </p>
          </div>
        </div>
        <div className="px-3 py-1 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-600 text-xs font-semibold">
          ${priceUSD.toFixed(2)} {activePlan.currency.toUpperCase()}
        </div>
      </div>

      {/* ── Loading ── */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-sm text-slate-500">
            Đang chuẩn bị phiên thanh toán Stripe Elements...
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {!isLoading && error && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl space-y-3">
          <div className="flex items-start gap-2.5 text-rose-600">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Chưa thể tải Stripe Elements</p>
              <p className="text-xs text-rose-500/80 mt-1">{error}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-purple-700 border border-slate-200">
            💡 <strong>Hướng dẫn:</strong> Điền khóa test vào file{" "}
            <span className="text-amber-600">.env.dev</span>:
            <div className="mt-1 text-slate-500">
              NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
            </div>
            <div className="text-slate-500">STRIPE_SECRET_KEY=sk_test_...</div>
          </div>
        </div>
      )}

      {/* ── Stripe Elements Form ── */}
      {!isLoading && !error && options && clientSecret && (
        <Elements key={clientSecret} stripe={getStripe()} options={options}>
          <CheckoutForm
            amount={activePlan.unitAmount}
            currency={activePlan.currency}
            itemName={activePlan.productName}
            orderId={orderId}
            customerEmail={customerEmail}
          />
        </Elements>
      )}
    </div>
  );
}
