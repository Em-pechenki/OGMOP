import React from "react";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-secondary-light text-secondary",
  success: "bg-primary-light text-primary-darker",
  warning: "bg-warning text-warning-text",
  error: "bg-error/10 text-error",
  info: "bg-info text-secondary",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ variant = "default", className = "", children, ...rest }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Badge;