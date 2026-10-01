import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { Appearance, StripeElementsOptions } from "@stripe/stripe-js";
import { getStripe } from "@/utils/stripe";
import { CheckoutForm } from "./CheckoutForm";
import {
  Sparkles,
  Zap,
  CheckCircle,
  CreditCard,
  Loader2,
  AlertCircle,
  Mail,
  ShieldCheck,
} from "lucide-react";

interface PricingPlan {
  id: "weekly" | "yearly";
  name: string;
  badge?: string;
  priceUSD: number;
  amountCents: number;
  periodText: string;
  perWeekEquivalent?: string;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "weekly",
    name: "Gói Tuần (Weekly)",
    priceUSD: 6.9,
    amountCents: 690,
    periodText: "/ tuần",
  },
  {
    id: "yearly",
    name: "Gói Năm (Yearly VIP)",
    badge: "Tiết kiệm 80% • Phổ biến nhất",
    priceUSD: 69,
    amountCents: 6900,
    periodText: "/ năm",
    perWeekEquivalent: "~$1.32 / tuần",
  },
];

export default function ShopSection({ email }: { email: string }) {
  const [selectedPlanId, setSelectedPlanId] = useState<"weekly" | "yearly">(
    "yearly",
  );
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingSecret, setIsLoadingSecret] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);

  const activePlan =
    PRICING_PLANS.find((p) => p.id === selectedPlanId) || PRICING_PLANS[1];

  // Khởi tạo PaymentIntent mỗi khi đổi gói hoặc đổi email
  useEffect(() => {
    let isMounted = true;
    const generatedOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setCurrentOrderId(generatedOrderId);
    setCustomerEmail(email || "");
    const fetchPaymentIntent = async () => {
      setIsLoadingSecret(true);
      setInitError(null);

      try {
        const response = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: activePlan.amountCents,
            currency: "usd",
            description: `Subscription: ${activePlan.name} ($${activePlan.priceUSD})`,
            orderId: generatedOrderId,
            planType: selectedPlanId,
            customerEmail: customerEmail.trim() || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Không thể tạo phiên thanh toán Stripe.",
          );
        }

        if (isMounted) {
          setClientSecret(data.clientSecret);
          if (data.orderId) {
            setCurrentOrderId(data.orderId);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setInitError(
            err.message || "Lỗi kết nối tới cổng thanh toán Stripe.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingSecret(false);
        }
      }
    };

    fetchPaymentIntent();

    return () => {
      isMounted = false;
    };
  }, [
    selectedPlanId,
    activePlan.amountCents,
    activePlan.name,
    activePlan.priceUSD,
  ]);

  // Giao diện Stripe Elements Dark Mode
  const appearance: Appearance = {
    theme: "night",
    variables: {
      colorPrimary: "#a855f7",
      colorBackground: "#0f172a",
      colorText: "#f8fafc",
      colorDanger: "#f43f5e",
      fontFamily: "system-ui, -apple-system, sans-serif",
      borderRadius: "0.75rem",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": {
        border: "1px solid #334155",
        backgroundColor: "#090d16",
        boxShadow: "none",
      },
      ".Input:focus": {
        border: "1px solid #a855f7",
        boxShadow: "0 0 0 1px #a855f7",
      },
      ".Tab": {
        border: "1px solid #334155",
        backgroundColor: "#1e293b",
      },
      ".Tab--selected": {
        borderColor: "#a855f7",
        backgroundColor: "#1e293b",
      },
    },
  };

  const options: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance,
      }
    : undefined;

  return (
    <section id="shop-section" className="w-full  mx-auto my-10 px-4">
      {/* 2 Plan Cards (Radio Selection) */}
      <div className="grid grid-row-1  gap-5 mb-8">
        {PRICING_PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2 select-none flex flex-col justify-between ${
                isSelected
                  ? "bg-gradient-to-b from-purple-900/40 via-slate-900/90 to-slate-950 border-purple-500 shadow-xl shadow-purple-500/20 scale-[1.01]"
                  : "bg-slate-900/60 border-slate-800 hover:border-purple-500/40 opacity-80 hover:opacity-100"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 right-6 px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[11px] font-bold uppercase tracking-wider rounded-full shadow-md">
                  {plan.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-purple-400 bg-purple-600 shadow-sm shadow-purple-500"
                          : "border-slate-600 bg-slate-800"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-lg font-bold text-white">
                      {plan.name}
                    </span>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black text-white">
                      ${plan.priceUSD}
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        {plan.periodText}
                      </span>
                    </div>
                    {plan.perWeekEquivalent && (
                      <span className="text-[11px] text-emerald-400 font-medium">
                        {plan.perWeekEquivalent}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs flex items-center justify-between">
                <span
                  className={
                    isSelected
                      ? "text-purple-300 font-semibold"
                      : "text-slate-500"
                  }
                >
                  {isSelected ? "✓ Đang chọn gói này" : "Nhấp để chọn gói"}
                </span>
                <span className="text-slate-400 font-mono">
                  {plan.id === "yearly" ? "$69.00 USD" : "$6.90 USD"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Email Input (Optional for Stripe Receipts) */}
      <div className="mb-6 p-4 bg-slate-900/70 border border-purple-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Mail className="w-4 h-4 text-pink-400 shrink-0" />
          <span>Email nhận hóa đơn (Bill thanh toán):</span>
        </div>
        <input
          type="email"
          placeholder="Ví dụ: yourname@gmail.com (tùy chọn)"
          disabled
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          className="w-full sm:w-80 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Inline Stripe Elements Payment Section */}
      <div className="w-full bg-slate-950 border border-purple-500/30 rounded-2xl shadow-2xl p-6 md:p-8 relative">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Thanh Toán Trực Tiếp:{" "}
                <span className="text-purple-400">{activePlan.name}</span> ($
                {activePlan.priceUSD})
              </h3>
              <p className="text-xs text-slate-400">
                Form Stripe Elements tích hợp trực tiếp • Chế độ Dev giả lập
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-semibold">
            ${activePlan.priceUSD} USD
          </div>
        </div>

        {/* Loading / Error / Stripe Elements Form */}
        {isLoadingSecret ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-sm text-slate-400">
              Đang chuẩn bị phiên thanh toán Stripe Elements...
            </p>
          </div>
        ) : initError ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5 text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">
                  Chưa thể tải Stripe Elements
                </p>
                <p className="text-xs text-rose-200/80 mt-1">{initError}</p>
              </div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-lg text-xs font-mono text-purple-300 border border-slate-800">
              💡 <strong>Hướng dẫn:</strong> Điền khóa test vào file{" "}
              <span className="text-amber-400">.env.dev</span>:
              <div className="mt-1 text-slate-400">
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
              </div>
              <div className="text-slate-400">
                STRIPE_SECRET_KEY=sk_test_...
              </div>
            </div>
          </div>
        ) : options && clientSecret ? (
          <Elements key={clientSecret} stripe={getStripe()} options={options}>
            <CheckoutForm
              amount={activePlan.amountCents}
              currency="usd"
              itemName={activePlan.name}
              orderId={currentOrderId}
              customerEmail={customerEmail}
            />
          </Elements>
        ) : null}
      </div>
    </section>
  );
};
