import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-muted">
        <span>© 2026 OGMOP — Cyber Garden</span>
        <span>Банк «Центр-инвест»</span>
      </div>
    </footer>
  );
};

export default Footer;