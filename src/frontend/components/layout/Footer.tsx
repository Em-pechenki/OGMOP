import React from "react";
import { useI18n } from "@frontend/hooks/useI18n";

export const Footer: React.FC = () => {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
        <span>{t("footer.copy")}</span>
        <span>{t("footer.hackathon")}</span>
      </div>
    </footer>
  );
};

export default Footer;