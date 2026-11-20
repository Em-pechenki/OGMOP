import React from "react";
import { NavLink } from "react-router-dom";
import { useI18n } from "@frontend/hooks/useI18n";
import ThemeToggle from "@frontend/components/ui/ThemeToggle";
import LanguageSwitcher from "@frontend/components/ui/LanguageSwitcher";

export const Header: React.FC = () => {
  const { t } = useI18n();

  const navItems = [
    { to: "/", label: t("nav.home"), key: "home" },
    { to: "/editor", label: t("nav.editor"), key: "editor" },
    { to: "/runs", label: t("nav.runs"), key: "runs" },
    { to: "/templates", label: t("nav.templates"), key: "templates" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-border dark:bg-surface/90">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <img src="/OGMOP/logo.svg" alt="OGMOP" className="h-8 w-auto" />
        </NavLink>
        <nav className="flex items-center gap-1 overflow-x-auto" aria-label={t("header.aria")}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-light text-primary-darker" : "text-secondary hover:bg-surface"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher variant="compact" size="sm" />
          <ThemeToggle variant="icon" size="sm" />
        </div>
      </div>
    </header>
  );
};

export default Header;