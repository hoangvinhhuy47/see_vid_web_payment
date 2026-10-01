import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MainLayout } from '@/layouts/MainLayout';
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/routers/routes';
import OpenMagicSwapButton from '@/components/OpenMagicSwapButton';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { order_id, payment_intent, payment_intent_client_secret } = router.query;
  const [copiedOrderId, setCopiedOrderId] = useState<boolean>(false);

  const activeOrderId = (order_id as string) || '';
  const activeIntentId =
    (payment_intent as string) || (payment_intent_client_secret as string) || '';

  const handleCopyOrderId = () => {
    const idToCopy = activeOrderId || activeIntentId;
    if (idToCopy) {
      navigator.clipboard.writeText(idToCopy);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-screen px-4 py-12">
        <div className="w-full max-w-xl bg-slate-900/95 border border-purple-500/30 rounded-3xl p-6 sm:p-10 text-center shadow-2xl shadow-purple-950/60 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Success Animated Badge */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40 mb-6 shadow-xl shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Thanh Toán Hoàn Tất</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Thanh Toán Thành Công!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mb-8 max-w-md mx-auto">
            Giao dịch của bạn đã được ghi nhận. Nhấn nút{' '}
            <strong className="text-emerald-300">Download App</strong> bên dưới để mở ứng dụng và
            nhận kết quả mở khóa đặc quyền.
          </p>

          {/* Order Details Card */}
          <div className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 text-left space-y-3 mb-8 text-xs relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-slate-400 font-medium">Mã Đơn Hàng (Order ID):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-purple-300 font-bold text-sm">
                  {activeOrderId || 'ORD-COMPLETED'}
                </span>
                <button
                  onClick={handleCopyOrderId}
                  className="p-1 rounded bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 transition-colors"
                  title="Sao chép Order ID"
                >
                  {copiedOrderId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-between text-slate-400">
              <span>Trạng thái:</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Thành công (Succeeded)
              </span>
            </div>

            {activeIntentId && (
              <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800/60">
                <span>Stripe Intent ID:</span>
                <span className="font-mono text-slate-400 text-[11px] truncate max-w-[200px]">
                  {activeIntentId.split('_secret_')[0]}
                </span>
              </div>
            )}
          </div>

          {/* MAIN ACTION: DOWNLOAD APP BUTTON WITH DEEP LINKING */}
          <div className="space-y-3 mb-6">
            <OpenMagicSwapButton
              orderId={activeOrderId}
              type="payment_web"
              buttonText="DOWNLOAD APP"
            />
          </div>

          {/* Secondary Actions */}
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-purple-500/20 text-xs">
            <Link
              href={ROUTES.HOME}
              className="text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-800"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
