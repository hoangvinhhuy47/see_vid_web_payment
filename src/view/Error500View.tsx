import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/utils/i18n';
import { Button } from '@/components/Button';
import { Home, RotateCcw } from 'lucide-react';
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
      <img
        src="/images/img_logo.png"
        alt="SeeVid"
        className="mb-8 h-12 w-auto max-w-full object-contain"
      />
      <p className="mb-3 text-sm font-semibold tracking-widest text-slate-400">500</p>

      {/* Error Message */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight max-w-2xl">
        {t('errors.500.title', 'Server Error')}
      </h1>

      <p className="text-slate-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
        {t(
          'errors.500.description',
          'Something went wrong. Please try again.'
        )}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button variant="magic" size="lg" onClick={handleReload} className="gap-2">
          <RotateCcw className="w-5 h-5" />
          {t('errors.500.reload', 'Try Again')}
        </Button>
        <Link href={ROUTES.HOME}>
          <Button variant="secondary" size="lg" className="gap-2">
            <Home className="w-5 h-5" />
            {t('errors.500.back_home', 'Go Home')}
          </Button>
        </Link>
      </div>
    </div>
  );
};
