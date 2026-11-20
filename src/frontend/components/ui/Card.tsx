import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  padding?: "sm" | "md" | "lg";
  hoverable?: boolean;
}

const paddingClasses = { sm: "p-3", md: "p-4", lg: "p-6" };

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  padding = "md",
  hoverable = false,
  className = "",
  children,
  ...rest
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-border shadow-card transition-all duration-200 ease-out ${
        hoverable ? "hover:shadow-hover hover:-translate-y-0.5" : ""
      } ${paddingClasses[padding]} ${className}`}
      {...rest}
    >
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-base font-semibold text-text">{title}</h3>}
          {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;