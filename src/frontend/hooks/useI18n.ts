import { useI18nContext } from "@frontend/i18n/I18nContext";

export function useI18n() {
  return useI18nContext();
}

export function useTranslation() {
  const ctx = useI18nContext();
  return { t: ctx.t, i18n: { language: ctx.locale, changeLanguage: ctx.changeLanguage }, locale: ctx.locale };
}

export default useI18n;