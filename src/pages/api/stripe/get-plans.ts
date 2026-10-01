import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// Product IDs của 2 gói weekly và yearly trên Stripe
const PRODUCT_IDS = [
  'prod_VMI5zknCNJfnFd', // weekly
  'prod_VMIBcWWBY7STF5', // yearly
];

export interface StripePlan {
  priceId: string;
  productId: string;
  productName: string;
  productDescription: string | null;
  unitAmount: number; // in cents
  currency: string;
  interval: 'week' | 'month' | 'year' | 'day' | null; // recurring interval
  intervalCount: number | null;
  nickname: string | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!stripe) {
    return res.status(400).json({
      error: 'Vui lòng cấu hình STRIPE_SECRET_KEY hợp lệ trong file .env.dev!',
    });
  }

  try {
    const plans: StripePlan[] = [];

    for (const productId of PRODUCT_IDS) {
      // Lấy thông tin product
      const product = await stripe.products.retrieve(productId);

      // Lấy danh sách prices active của product này
      const pricesResponse = await stripe.prices.list({
        product: productId,
        active: true,
        limit: 5,
      });

      for (const price of pricesResponse.data) {
        const rawInterval = price.recurring?.interval as string | undefined;
        const validIntervals = ['week', 'month', 'year', 'day'];
        const interval = validIntervals.includes(rawInterval ?? '')
          ? (rawInterval as 'week' | 'month' | 'year' | 'day')
          : null;

        plans.push({
          priceId: price.id,
          productId: productId,
          productName: product.name,
          productDescription: product.description,
          unitAmount: price.unit_amount ?? 0,
          currency: price.currency,
          interval,
          intervalCount: price.recurring?.interval_count ?? null,
          nickname: price.nickname,
        });
      }
    }

    // Sort: weekly trước, yearly sau
    plans.sort((a, b) => (a.unitAmount ?? 0) - (b.unitAmount ?? 0));

    return res.status(200).json({ plans });
  } catch (error: any) {
    console.error('Error fetching Stripe plans:', error);
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  }
}
