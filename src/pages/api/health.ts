import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/model/api';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ status: string; env: string; timestamp: string }>>
) {
  res.status(200).json({
    success: true,
    statusCode: 200,
    data: {
      status: 'healthy',
      env: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
  });
}
