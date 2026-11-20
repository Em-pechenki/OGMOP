import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@frontend/hooks/useI18n";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-2xl" };

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, size = "md" }) => {
  const { t } = useI18n();
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-hover border border-border animate-in fade-in`}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text text-xl leading-none"
              aria-label={t("common.close")}
            >
              ×
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-border flex justify-end gap-2">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;