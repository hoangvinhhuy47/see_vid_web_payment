import React from 'react';
import { useTranslation } from '@/utils/i18n';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-purple-500/10 bg-[#07050e] py-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-slate-300">{t('app.title', 'SeeVid')}</span>
          <span>© {new Date().getFullYear()} All magic reserved.</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          <span>using Next.js & TypeScript</span>
        </div>
      </div>
    </footer>
  );
};
