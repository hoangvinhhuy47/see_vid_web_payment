import React, { useState } from 'react';
import { Copy, Check, CreditCard } from 'lucide-react';

export const TEST_CARDS = [
  {
    type: 'Thành công (Default)',
    number: '4242 4242 4242 4242',
    raw: '4242424242424242',
    exp: '12/28',
    cvc: '123',
    desc: 'Thanh toán thành công ngay lập tức',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    type: 'Xác thực 3D Secure (OTP)',
    number: '4000 0027 6000 3184',
    raw: '4000002760003184',
    exp: '12/28',
    cvc: '123',
    desc: 'Hiện popup giả lập mã OTP ngân hàng',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  {
    type: 'Bị từ chối (Card Declined)',
    number: '4000 0000 0000 0002',
    raw: '4000000000000002',
    exp: '12/28',
    cvc: '123',
    desc: 'Giả lập ngân hàng từ chối thẻ',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  {
    type: 'Không đủ số dư (Insufficient Funds)',
    number: '4000 0000 0000 0116',
    raw: '4000000000000116',
    exp: '12/28',
    cvc: '123',
    desc: 'Giả lập tài khoản không đủ tiền thanh toán',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
];

export const TestCardHelper: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (cardRaw: string, index: number) => {
    navigator.clipboard.writeText(cardRaw);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-purple-500/30 rounded-xl p-4 text-xs mt-5">
      <div className="flex items-center gap-2 mb-3 text-purple-300 font-semibold">
        <CreditCard className="w-4 h-4" />
        <span>Stripe Test Mode Simulator (Thẻ Giả Lập)</span>
      </div>

      <p className="text-slate-400 mb-3 text-[11px]">
        Nhấp sao chép số thẻ test bên dưới để dán vào ô thanh toán:
      </p>

      <div className="space-y-2">
        {TEST_CARDS.map((card, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 hover:border-purple-500/40 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] border ${card.badge}`}>
                  {card.type}
                </span>
                <span className="font-mono text-white font-medium">{card.number}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                HSD: <strong className="text-slate-300">{card.exp}</strong> | CVC:{' '}
                <strong className="text-slate-300">{card.cvc}</strong> | ZIP:{' '}
                <strong className="text-slate-300">70000</strong> ({card.desc})
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleCopy(card.raw, idx)}
              className="px-2.5 py-1.5 rounded-md bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 flex items-center gap-1 transition-all active:scale-95"
              title="Sao chép số thẻ"
            >
              {copiedIndex === idx ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] text-emerald-300">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px]">Chép số</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
