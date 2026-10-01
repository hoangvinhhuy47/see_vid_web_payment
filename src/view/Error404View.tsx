import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/utils/i18n';
import { Button } from '@/components/Button';
import { Compass, Home, Sparkles, Wand2 } from 'lucide-react';
import { ROUTES } from '@/routers/routes';

export const Error404View: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center relative overflow-hidden">
      {/* Background magical glow */}
      <div className="absolute w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulseGlow" />

      {/* Runic Floating Circle & 404 Emblem */}
      <div className="relative mb-8 animate-float">
        <div className="w-48 h-48 rounded-full border-2 border-dashed border-purple-400/30 flex items-center justify-center p-4 bg-gradient-to-b from-purple-950/40 to-slate-950/80 backdrop-blur-xl shadow-2xl">
          <div className="w-36 h-36 rounded-full border border-purple-500/40 flex flex-col items-center justify-center bg-purple-900/20">
            <Compass className="w-12 h-12 text-pink-400 mb-1 animate-spin" style={{ animationDuration: '18s' }} />
            <span className="font-mono text-3xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              404
            </span>
          </div>
        </div>
        {/* Orbiting Sparkles */}
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-purple-500/20 border border-purple-400/40">
          <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
        </div>
        <div className="absolute bottom-2 left-2 p-1.5 rounded-full bg-pink-500/20 border border-pink-400/40">
          <Wand2 className="w-4 h-4 text-pink-300 animate-pulse" />
        </div>
      </div>

      {/* Error Message */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight max-w-2xl">
        {t('errors.404.title', 'Spell Disrupted: Page Not Found')}
      </h1>

      <p className="text-slate-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
        {t(
          'errors.404.description',
          'The enchanted portal you seek has vanished into another dimension. Check the address or teleport back safely.'
        )}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href={ROUTES.HOME}>
          <Button variant="magic" size="lg" className="gap-2">
            <Home className="w-5 h-5" />
            {t('errors.404.back_home', 'Return to Sanctuary')}
          </Button>
        </Link>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => window.history.back()}
          className="gap-2"
        >
          {t('errors.404.try_again', 'Go Back')}
        </Button>
      </div>
    </div>
  );
};
