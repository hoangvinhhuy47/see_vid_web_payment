import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/utils/i18n';
import { Button } from '@/components/Button';
import { ShieldAlert, Home, RotateCcw, Flame } from 'lucide-react';
import { ROUTES } from '@/routers/routes';

export const Error500View: React.FC = () => {
  const { t } = useTranslation();

  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center relative overflow-hidden">
      {/* Background magical glow */}
      <div className="absolute w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulseGlow" />

      {/* Runic Arcane Anomaly Emblem */}
      <div className="relative mb-8 animate-float">
        <div className="w-48 h-48 rounded-full border-2 border-dashed border-rose-500/40 flex items-center justify-center p-4 bg-gradient-to-b from-rose-950/40 to-slate-950/80 backdrop-blur-xl shadow-2xl">
          <div className="w-36 h-36 rounded-full border border-rose-500/50 flex flex-col items-center justify-center bg-rose-950/30">
            <ShieldAlert className="w-12 h-12 text-rose-400 mb-1 animate-bounce" />
            <span className="font-mono text-3xl font-black bg-gradient-to-r from-rose-300 via-amber-300 to-red-400 bg-clip-text text-transparent">
              500
            </span>
          </div>
        </div>
        {/* Orbiting Sparkles */}
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-500/20 border border-rose-400/40">
          <Flame className="w-4 h-4 text-rose-300 animate-pulse" />
        </div>
      </div>

      {/* Error Message */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight max-w-2xl">
        {t('errors.500.title', 'Arcane Catastrophe: Server Error')}
      </h1>

      <p className="text-slate-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
        {t(
          'errors.500.description',
          'A magical anomaly has destabilized our realm. Our wizards are actively restoring equilibrium.'
        )}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button variant="magic" size="lg" onClick={handleReload} className="gap-2">
          <RotateCcw className="w-5 h-5" />
          {t('errors.500.reload', 'Cast Recovery Spell')}
        </Button>
        <Link href={ROUTES.HOME}>
          <Button variant="secondary" size="lg" className="gap-2">
            <Home className="w-5 h-5" />
            {t('errors.500.back_home', 'Back to Safety')}
          </Button>
        </Link>
      </div>
    </div>
  );
};
