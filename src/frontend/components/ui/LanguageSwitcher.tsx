import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "@frontend/hooks/useI18n";

export interface LanguageSwitcherProps {
  variant?: "compact" | "full";
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 px-2 text-xs",
  md: "h-10 px-3 text-sm",
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = "compact",
  size = "md",
  className = "",
}) => {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const options: { code: "ru" | "en"; label: string }[] = [
    { code: "ru", label: t("language.ru") },
    { code: "en", label: t("language.en") },
  ];

  if (variant === "full") {
    return (
      <div className={`flex flex-col gap-1 ${className}`} role="radiogroup" aria-label={t("language.switch")}>
        {options.map((opt) => {
          const active = locale === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setLocale(opt.code)}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                active ? "border-primary bg-primary-light text-primary-darker" : "border-border bg-surface text-text-muted hover:text-text"
              }`}
              title={opt.label}
            >
              <span>{opt.label}</span>
              <span className="text-xs font-semibold uppercase">{opt.code}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language.switch")}
        title={t("language.switch")}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-elevated hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${sizeClasses[size]}`}
      >
        <span className="text-xs font-semibold uppercase">{locale.toUpperCase()}</span>
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t("language.switch")}
          className="absolute right-0 z-50 mt-1 min-w-[140px] rounded-lg border border-border bg-surface-elevated py-1 shadow-modal"
        >
          {options.map((opt) => {
            const active = locale === opt.code;
            return (
              <li
                key={opt.code}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setLocale(opt.code);
                  setOpen(false);
                }}
                className={`cursor-pointer px-3 py-2 text-sm transition-colors hover:bg-surface ${
                  active ? "text-primary-darker font-medium" : "text-text"
                }`}
                title={opt.label}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;