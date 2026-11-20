import React from "react";
import { useTheme } from "@frontend/hooks/useTheme";
import { useI18n } from "@frontend/hooks/useI18n";

export interface ThemeToggleProps {
  variant?: "icon" | "segmented";
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
};

const segSize = {
  sm: "h-8 px-2 text-xs",
  md: "h-10 px-3 text-sm",
};

const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const MonitorIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "icon",
  size = "md",
  showLabel = false,
  className = "",
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { t } = useI18n();

  if (variant === "segmented") {
    const options: { value: "light" | "dark" | "system"; label: string; icon: React.ReactNode }[] = [
      { value: "light", label: t("theme.light"), icon: <SunIcon /> },
      { value: "dark", label: t("theme.dark"), icon: <MoonIcon /> },
      { value: "system", label: t("theme.system"), icon: <MonitorIcon /> },
    ];
    return (
      <div
        role="radiogroup"
        aria-label={t("theme.toggle")}
        className={`inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1 ${className}`}
      >
        {options.map((opt) => {
          const active = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(opt.value)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                active ? "bg-primary-light text-primary-darker" : "text-text-muted hover:text-text"
              } ${segSize[size]}`}
              title={opt.label}
            >
              {opt.icon}
              {(showLabel || variant === "segmented") && <span>{opt.label}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  const icon =
    theme === "system" ? <MonitorIcon /> : resolvedTheme === "dark" ? <MoonIcon /> : <SunIcon />;
  const label = t("theme.toggle");

  return (
    <button
      type="button"
      role="switch"
      aria-checked={resolvedTheme === "dark"}
      aria-label={label}
      title={label}
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-surface-elevated hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${sizeClasses[size]} ${className}`}
    >
      {icon}
      {showLabel && <span className="ml-1 text-sm">{label}</span>}
    </button>
  );
};

export default ThemeToggle;