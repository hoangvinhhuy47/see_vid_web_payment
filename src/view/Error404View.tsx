import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/utils/i18n';
import { Button } from '@/components/Button';
import { Home } from 'lucide-react';
import { ROUTES } from '@/routers/routes';

export const Error404View: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center relative overflow-hidden">
      <img
        src="/images/img_logo.png"
        alt="SeeVid"
        className="mb-8 h-12 w-auto max-w-full object-contain"
      />
      <p className="mb-3 text-sm font-semibold tracking-widest text-slate-400">404</p>

      {/* Error Message */}
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight max-w-2xl">
        {t('errors.404.title', 'Page Not Found')}
      </h1>

      <p className="text-slate-300 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
        {t(
          'errors.404.description',
          'This page does not exist. Check the link or go home.'
        )}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link href={ROUTES.HOME}>
          <Button variant="magic" size="lg" className="gap-2">
            <Home className="w-5 h-5" />
            {t('errors.404.back_home', 'Go Home')}
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
