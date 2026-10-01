import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '@/utils/i18n';
import { SupportedLocale } from '@/model/locale';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { currentLanguage, supportedLocales, changeLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (code: SupportedLocale) => {
    await changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-purple-500/20 text-slate-200 hover:border-purple-500/50 hover:bg-slate-800 transition-all text-sm font-medium backdrop-blur-md"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-purple-400" />
        <span className="text-base leading-none">{currentLanguage.flag}</span>
        <span className="hidden sm:inline-block">{currentLanguage.nativeName}</span>
        <span className="sm:hidden font-mono uppercase text-xs">{currentLanguage.code}</span>
        <ChevronDown
          className={cn('w-3.5 h-3.5 text-slate-400 transition-transform duration-200', {
            'rotate-180': isOpen,
          })}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-purple-500/30 shadow-2xl backdrop-blur-xl py-2 z-50 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20">
          <div className="px-3 py-1.5 text-xs font-semibold text-purple-300 uppercase tracking-wider border-b border-purple-500/10 mb-1">
            Select Language ({supportedLocales.length})
          </div>
          {supportedLocales.map((lang) => {
            const isSelected = lang.code === currentLanguage.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors',
                  isSelected
                    ? 'bg-purple-600/20 text-purple-200 font-medium'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{lang.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400">{lang.name}</span>
                    <span className="font-medium text-slate-200">{lang.nativeName}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-purple-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
