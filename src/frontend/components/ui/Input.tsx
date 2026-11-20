import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...rest }, ref) => {
    const inputId = id || (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-text placeholder:text-text-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            error ? "border-error" : "border-border"
          } ${className}`}
          {...rest}
        />
        {error && <span className="text-xs text-error">{error}</span>}
        {!error && hint && <span className="text-xs text-text-muted">{hint}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;