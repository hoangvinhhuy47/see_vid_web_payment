import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!stripe || stripeSecretKey === 'sk_test_sample_key_replace_with_yours') {
    return res.status(400).json({
      error: 'Vui lòng cấu hình STRIPE_SECRET_KEY hợp lệ trong file .env.dev!',
      isDevMockWarning: true,
    });
  }

  try {
    const {
      amount = 6900,
      currency = 'usd',
      description = 'SeeVid - VIP Package',
      customerEmail,
      orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      planType = 'yearly',
    } = req.body;

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount), // in cents: 6900 = $69.00
      currency: currency.toLowerCase(),
      description,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId,
        planType,
        customerEmail: customerEmail || 'unspecified',
        appName: 'SeeVid',
        environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      },
    };

    // Nếu người dùng nhập email, Stripe sẽ gửi receipt tự động khi thành công
    if (customerEmail && typeof customerEmail === 'string' && customerEmail.includes('@')) {
      paymentIntentParams.receipt_email = customerEmail.trim();
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      orderId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error: any) {
    console.error('Error creating Stripe PaymentIntent:', error);
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  }
}
