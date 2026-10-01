import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

// ─── Shared Types ─────────────────────────────────────────────────────────────
export interface StripePlan {
  priceId: string;
  productId: string;
  productName: string;
  productDescription: string | null;
  unitAmount: number; // cents
  currency: string;
  interval: "week" | "month" | "year" | "day" | null;
  intervalCount: number | null;
  nickname: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getPlanMeta(plan: StripePlan) {
  const priceUSD = plan.unitAmount / 100;
  const isYearly =
    plan.interval === "year" ||
    plan.productName.toLowerCase().includes("year") ||
    plan.productName.toLowerCase().includes("yearly");

  const periodLabel =
    plan.interval === "week"
      ? "/ tuần"
      : plan.interval === "month"
        ? "/ tháng"
        : plan.interval === "year"
          ? "/ năm"
          : `/ ${plan.intervalCount ?? 1} ${plan.interval ?? "lần"}`;

  const badge = isYearly ? "Limited deal - Save 81%" : undefined;

  let perWeekEquivalent: string | undefined;
  if (isYearly) {
    const perWeek = priceUSD / 52;
    perWeekEquivalent = `~$${perWeek.toFixed(2)} / week`;
  }

  return { priceUSD, periodLabel, badge, perWeekEquivalent, isYearly };
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function PlanCardSkeleton() {
  return (
    <div className="relative rounded-2xl p-6 border-2 border-slate-800 bg-slate-900/60 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-slate-700" />
          <div className="h-5 w-40 rounded-lg bg-slate-700" />
        </div>
        <div className="text-right space-y-1">
          <div className="h-7 w-20 rounded-lg bg-slate-700 ml-auto" />
          <div className="h-3 w-16 rounded-lg bg-slate-800 ml-auto" />
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between">
        <div className="h-3 w-28 rounded bg-slate-700" />
        <div className="h-3 w-16 rounded bg-slate-700" />
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface PlanCardsProps {
  plans: StripePlan[];
  isLoading: boolean;
  error: string | null;
  selectedPriceId: string | null;
  onSelectPlan: (priceId: string) => void;
  onRetry: () => void;
}

// ─── PlanCards Component ──────────────────────────────────────────────────────
export default function PlanCards({
  plans,
  isLoading,
  error,
  selectedPriceId,
  onSelectPlan,
  onRetry,
}: PlanCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 my-5">
      {/* Loading skeletons */}
      {isLoading && (
        <>
          <PlanCardSkeleton />
          <PlanCardSkeleton />
        </>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col items-start gap-3">
          <div className="flex items-center gap-2.5 text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            <p className="text-sm font-semibold">Không thể tải gói cước</p>
          </div>
          <p className="text-xs text-rose-200/80 ml-7">{error}</p>
          <button
            onClick={onRetry}
            className="ml-7 flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 rounded-lg text-xs text-rose-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Thử lại
          </button>
        </div>
      )}

      {/* Plan Cards */}
      {!isLoading &&
        !error &&
        plans.map((plan) => {
          const isSelected = selectedPriceId === plan.priceId;
          const meta = getPlanMeta(plan);

          return (
            <div
              key={plan.priceId}
              onClick={() => onSelectPlan(plan.priceId)}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 border-2 select-none flex flex-col justify-between items-center ${
                isSelected
                  ? "bg-[linear-gradient(273.93deg,rgba(250,31,152,0.5)_0%,rgba(148,19,90,0.5)_100.61%)] border-[#FF61CA] shadow-xl shadow-[#FF61CA]/20 scale-[1.01]"
                  : "bg-slate-900/60 border-slate-800 hover:border-[#FF61CA]/40 opacity-80 hover:opacity-100"
              }`}
            >
              {/* Badge */}
              {meta.badge && (
                <span className="absolute -top-3 px-5 py-[3px] bg-[linear-gradient(90deg,#8304C6_0%,#CB56D0_51.44%,#FF52A5_100%)] text-white text-[8px] font-bold uppercase tracking-wider rounded-full shadow-md">
                  {meta.badge}
                </span>
              )}

              <div className="flex items-center justify-between w-full mb-4">
                {/* Radio + Name */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-purple-400 bg-purple-600 shadow-sm shadow-[#FF61CA]"
                        : "border-slate-600 bg-slate-800"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-white">
                      {plan.productName}
                    </span>
                    {meta.perWeekEquivalent && (
                      <span className="text-[11px] text-[#FFFFFF99] font-medium">
                        {meta.perWeekEquivalent}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0 ml-3">
                  <div className="text-2xl font-black text-white">
                    ${meta.priceUSD.toFixed(2)}
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      {meta.periodLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
