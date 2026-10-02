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
      priceId,
      productId,
      amount = 6900,
      currency = 'usd',
      description = 'SeeVid - VIP Subscription',
      customerEmail,
      orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      planType = 'yearly',
      lookupKey,
    } = req.body;

    const trimmedEmail =
      customerEmail && typeof customerEmail === 'string' && customerEmail.includes('@')
        ? customerEmail.trim()
        : null;

    // ── Flow 1: Tạo Subscription nếu có priceId ──────────────────────────────
    if (priceId && typeof priceId === 'string') {
      // 1. Tạo hoặc lấy Customer trên Stripe
      let customer: Stripe.Customer;
      if (trimmedEmail) {
        const existingCustomers = await stripe.customers.list({
          email: trimmedEmail,
          limit: 1,
        });
        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: trimmedEmail,
            metadata: {
              initialOrderId: orderId,
            },
          });
        }
      } else {
        customer = await stripe.customers.create({
          metadata: {
            initialOrderId: orderId,
          },
        });
      }

      // 2. Tạo Subscription với trạng thái default_incomplete để Stripe Elements xác nhận
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          orderId,
          planType,
          priceId,
          productId: productId ?? '',
          lookupKey: lookupKey ?? '',
          customerEmail: trimmedEmail || 'unspecified',
          environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
        },
      });

      const invoice = subscription.latest_invoice as any;
      let paymentIntent: Stripe.PaymentIntent | null = null;

      if (invoice && typeof invoice === 'object') {
        if (typeof invoice.payment_intent === 'object' && invoice.payment_intent) {
          paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;
        } else if (typeof invoice.payment_intent === 'string') {
          paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
        }
      }

      if (!paymentIntent || !paymentIntent.client_secret) {
        throw new Error('Không thể khởi tạo PaymentIntent cho gói đăng ký.');
      }

      // Cập nhật metadata cho PaymentIntent để dễ tìm kiếm và gửi receipt
      await stripe.paymentIntents.update(paymentIntent.id, {
        description: description || `Subscription: ${planType}`,
        metadata: {
          orderId,
          subscriptionId: subscription.id,
          priceId,
          productId: productId ?? '',
          planType,
          lookupKey: lookupKey ?? '',
          customerEmail: trimmedEmail || 'unspecified',
          environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
        },
        ...(trimmedEmail ? { receipt_email: trimmedEmail } : {}),
      });

      const subAny = subscription as any;
      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        subscriptionId: subscription.id,
        customerId: customer.id,
        orderId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        currentPeriodStart: subAny.current_period_start ?? null,
        currentPeriodEnd: subAny.current_period_end ?? null,
        subscriptionStatus: subscription.status,
      });
    }

    // ── Flow 2: Fallback tạo PaymentIntent một lần thông thường ────────────────
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      description,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        orderId,
        planType,
        lookupKey: lookupKey ?? '',
        customerEmail: trimmedEmail || 'unspecified',
        environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      },
    };

    if (trimmedEmail) {
      paymentIntentParams.receipt_email = trimmedEmail;
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
    console.error('Error creating Stripe Payment / Subscription:', error);
    return res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  }
}
