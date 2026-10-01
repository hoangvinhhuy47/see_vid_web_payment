// ─── Types ──────────────────────────────────────────────────────────────────
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
