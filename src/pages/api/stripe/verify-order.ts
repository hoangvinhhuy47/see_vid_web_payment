import type { NextApiRequest, NextApiResponse } from 'next';
import {
  verifyPaymentByOrderId,
  verifyPaymentByIntentId,
  PaymentVerificationResult,
} from '@/server/services/paymentVerification';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentVerificationResult | { error: string }>
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use GET or POST.' });
  }

  const orderId = (req.query.orderId as string) || (req.body?.orderId as string);
  const paymentIntentId =
    (req.query.paymentIntentId as string) || (req.body?.paymentIntentId as string);

  if (!orderId && !paymentIntentId) {
    return res.status(400).json({
      error: 'Vui lòng cung cấp orderId hoặc paymentIntentId để xác thực giao dịch.',
    });
  }

  try {
    let result: PaymentVerificationResult;

    if (orderId) {
      result = await verifyPaymentByOrderId(orderId);
    } else {
      result = await verifyPaymentByIntentId(paymentIntentId!);
    }

    const statusCode = result.isPaid ? 200 : result.status === 'not_found' ? 404 : 400;
    return res.status(statusCode).json(result);
  } catch (error: any) {
    console.error('Error verifying order API:', error);
    return res.status(500).json({
      error: error.message || 'Internal Server Error during payment verification.',
    });
  }
}
