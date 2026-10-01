import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/utils/i18n';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Sparkles, Gamepad2, Trophy, ShoppingBag } from 'lucide-react';
import { ROUTES } from '@/routers/routes';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-500/20 bg-[#0b0817]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href={ROUTES.HOME} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {t('app.title', 'SeeVid')}
            </span>
            <span className="text-[10px] font-medium tracking-wider text-purple-400 uppercase -mt-1">
              Web Edition
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            href={ROUTES.HOME}
            className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
          >
            {t('nav.home', 'Home')}
          </Link>
          <Link
            href={ROUTES.HOME}
            className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
          >
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            {t('nav.play', 'Play Game')}
          </Link>
          <Link
            href={ROUTES.HOME}
            className="hover:text-purple-300 transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4 text-pink-400" />
            <span>Cửa Hàng (Stripe)</span>
          </Link>
        </nav>

        {/* Language Switcher & Controls */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};
