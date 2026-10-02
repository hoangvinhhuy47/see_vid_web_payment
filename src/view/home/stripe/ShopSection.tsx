import React, { useState, useEffect, useCallback } from "react";
import { Mail } from "lucide-react";
import ResultVideoCard from "../components/result_video_card";
import { StripePlan } from "@/model/stripe_plan";
import PlanCards, { getPlanMeta } from "./PlanCard";
import StripeElementsPayment from "./StripeElementsPayment";
import { TestCardHelper } from "./TestCardHelper";
import FullAccessPass from "./FullAccessPass";

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ShopSection({ email }: { email: string }) {
  // ── Plan fetching state ──
  const [plans, setPlans] = useState<StripePlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  // ── Selection & payment state ──
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [currentOrderId, setCurrentOrderId] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState<number | null>(null);
  const [renewalDate, setRenewalDate] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isLoadingSecret, setIsLoadingSecret] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);

  const activePlan = plans.find((p) => p.priceId === selectedPriceId) ?? null;

  // ── 1. Fetch plans from Stripe ────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    setIsLoadingPlans(true);
    setPlansError(null);
    try {
      const res = await fetch("/api/stripe/get-plans");
      const data = await res.json();
      console.log("Fetched plans from Stripe:", data);
      if (!res.ok)
        throw new Error(data.error || "Không thể tải gói cước từ Stripe.");
      const fetchedPlans: StripePlan[] = data.plans ?? [];
      setPlans(fetchedPlans);

      // Auto-select yearly plan by default
      if (fetchedPlans.length > 0 && !selectedPriceId) {
        const yearlyPlan = fetchedPlans.find(
          (p) =>
            p.interval === "year" ||
            p.productName.toLowerCase().includes("year"),
        );
        setSelectedPriceId(
          yearlyPlan?.priceId ?? fetchedPlans[fetchedPlans.length - 1].priceId,
        );
      }
    } catch (err: any) {
      setPlansError(err.message || "Lỗi kết nối tới Stripe.");
    } finally {
      setIsLoadingPlans(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Sync email prop
  useEffect(() => {
    setCustomerEmail(email || "");
  }, [email]);

  // ── 2. Create Subscription / PaymentIntent whenever selected plan changes ──
  useEffect(() => {
    if (!activePlan) return;

    let isMounted = true;
    const generatedOrderId = `ORD-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;
    setCurrentOrderId(generatedOrderId);

    const fetchPaymentIntent = async () => {
      setIsLoadingSecret(true);
      setInitError(null);
      const { priceUSD } = getPlanMeta(activePlan);
      try {
        const response = await fetch("/api/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: activePlan.priceId,
            productId: activePlan.productId,
            amount: activePlan.unitAmount,
            currency: activePlan.currency || "usd",
            description: `Subscription: ${activePlan.productName} ($${priceUSD})`,
            orderId: generatedOrderId,
            planType: activePlan.interval ?? "week",
            lookupKey: activePlan.lookupKey ?? undefined,
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
          setSubscriptionId(data.subscriptionId ?? null);
          setCustomerId(data.customerId ?? null);
          setCurrentPeriodEnd(data.currentPeriodEnd ?? null);
          setRenewalDate(
            data.renewalDate ??
              (data.currentPeriodEnd
                ? new Date(data.currentPeriodEnd * 1000).toISOString()
                : null),
          );
          setSubscriptionStatus(data.subscriptionStatus ?? null);
          if (data.orderId) setCurrentOrderId(data.orderId);
        }
      } catch (err: any) {
        if (isMounted) {
          setInitError(
            err.message || "Lỗi kết nối tới cổng thanh toán Stripe.",
          );
        }
      } finally {
        if (isMounted) setIsLoadingSecret(false);
      }
    };

    fetchPaymentIntent();
    return () => {
      isMounted = false;
    };
  }, [selectedPriceId, activePlan?.unitAmount, activePlan?.priceId]);

  const activePlanMeta = activePlan ? getPlanMeta(activePlan) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <section id="shop-section" className="w-full mx-auto my-10 px-4">
      {/* ── 1 ResultVideoCard ── */}
      <ResultVideoCard />

      {/* ── 2 Plan Cards (Radio Selection) ── */}
      <PlanCards
        plans={plans}
        isLoading={isLoadingPlans}
        error={plansError}
        selectedPriceId={selectedPriceId}
        onSelectPlan={setSelectedPriceId}
        onRetry={fetchPlans}
      />

      {/* Customer Email */}
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

      {/* ── Stripe Elements Payment Section ── */}
      {activePlan && activePlanMeta && (
        <StripeElementsPayment
          activePlan={activePlan}
          priceUSD={activePlanMeta.priceUSD}
          clientSecret={clientSecret}
          subscriptionId={subscriptionId}
          customerId={customerId}
          currentPeriodEnd={currentPeriodEnd}
          renewalDate={renewalDate}
          subscriptionStatus={subscriptionStatus}
          orderId={currentOrderId}
          customerEmail={customerEmail}
          isLoading={isLoadingSecret}
          error={initError}
        />
      )}
      {/* Dev Test Card Simulator Helper */}
      {/* <TestCardHelper /> */}
      {/* Full Access */}
      <FullAccessPass />
    </section>
  );
}
