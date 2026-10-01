import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { SupportedLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE, LanguageInfo } from '@/model/locale';

type TranslationDictionary = Record<string, any>;

interface I18nContextType {
  locale: SupportedLocale;
  currentLanguage: LanguageInfo;
  supportedLocales: LanguageInfo[];
  t: (key: string, fallback?: string) => string;
  changeLanguage: (newLocale: SupportedLocale) => Promise<void>;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

function getNestedValue(obj: Record<string, any>, keyPath: string): string | undefined {
  const parts = keyPath.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLocale }) => {
  const router = useRouter();
  const activeLocale = (router.locale as SupportedLocale) || initialLocale || DEFAULT_LOCALE;

  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>(activeLocale);
  const [translations, setTranslations] = useState<TranslationDictionary>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load translation JSON file for the active locale
  const loadTranslations = useCallback(async (loc: SupportedLocale) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/locales/${loc}/common.json`);
      if (response.ok) {
        const data = await response.json();
        setTranslations(data);
      } else {
        // Fallback to English if file not found
        const fallbackRes = await fetch(`/locales/en/common.json`);
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          setTranslations(fallbackData);
        }
      }
    } catch (error) {
      console.warn(`[i18n] Failed to fetch translations for ${loc}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loc = (router.locale as SupportedLocale) || DEFAULT_LOCALE;
    setCurrentLocale(loc);
    loadTranslations(loc);
  }, [router.locale, loadTranslations]);

  const changeLanguage = useCallback(
    async (newLocale: SupportedLocale) => {
      const { pathname, asPath, query } = router;
      await router.push({ pathname, query }, asPath, { locale: newLocale });
      setCurrentLocale(newLocale);
      document.documentElement.lang = newLocale;
    },
    [router]
  );

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const val = getNestedValue(translations, key);
      if (val !== undefined) return val;
      return fallback || key;
    },
    [translations]
  );

  const currentLanguage = useMemo(() => {
    return SUPPORTED_LOCALES.find((item) => item.code === currentLocale) || SUPPORTED_LOCALES[0];
  }, [currentLocale]);

  const value = useMemo(
    () => ({
      locale: currentLocale,
      currentLanguage,
      supportedLocales: SUPPORTED_LOCALES,
      t,
      changeLanguage,
      isLoading,
    }),
    [currentLocale, currentLanguage, t, changeLanguage, isLoading]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
