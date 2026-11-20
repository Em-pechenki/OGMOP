import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ru } from "./ru";
import { en } from "./en";

export type Locale = "ru" | "en";
export type Dictionary = typeof ru;

const dictionaries: Record<Locale, Dictionary> = { ru, en };

const STORAGE_KEY = "ogmop:locale";

function detectInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ru" || stored === "en") return stored;
  } catch {
    /* ignore */
  }
  try {
    const nav = (typeof navigator !== "undefined" ? navigator.language : "ru") || "ru";
    if (nav.toLowerCase().startsWith("en")) return "en";
  } catch {
    /* ignore */
  }
  return "ru";
}

function getByPath(dict: Dictionary, key: string): string | undefined {
  if (Object.prototype.hasOwnProperty.call(dict, key)) {
    return (dict as Record<string, string>)[key];
  }
  // nested support: a.b.c
  const parts = key.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

export interface I18nContextValue {
  locale: Locale;
  lang: Locale;
  language: Locale;
  setLocale: (l: Locale) => void;
  setLang: (l: Locale) => void;
  changeLanguage: (l: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const defaultLocale = detectInitialLocale();

const defaultValue: I18nContextValue = {
  locale: defaultLocale,
  lang: defaultLocale,
  language: defaultLocale,
  setLocale: () => {},
  setLang: () => {},
  changeLanguage: () => {},
  t: (key) => getByPath(dictionaries[defaultLocale], key) ?? key,
};

export const I18nContext = createContext<I18nContextValue>(defaultValue);

export interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children, initialLocale }) => {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? detectInitialLocale());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore */
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    if (l === "ru" || l === "en") setLocaleState(l);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let str = getByPath(dictionaries[locale], key) ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          str = str.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
        });
      }
      return str;
    },
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      lang: locale,
      language: locale,
      setLocale,
      setLang: setLocale,
      changeLanguage: setLocale,
      t,
    }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18nContext(): I18nContextValue {
  return useContext(I18nContext);
}

export default I18nProvider;