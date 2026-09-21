import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-ghost"
  | "success"
  | "amber";

export type ButtonSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "icon-xs"
  | "icon-sm"
  | "icon-md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary hover:bg-primary-hover text-primary-fg shadow-primary-btn font-semibold",
  secondary:
    "bg-secondary hover:bg-secondary-hover text-secondary-fg font-medium",
  outline:
    "bg-surface hover:bg-canvas text-main border border-border-subtle font-medium shadow-micro",
  ghost:
    "text-muted hover:text-main hover:bg-secondary font-medium",
  danger:
    "bg-rose-700 hover:bg-rose-800 text-white font-semibold shadow-sm",
  "danger-ghost":
    "text-muted hover:text-rose-600 hover:bg-secondary font-medium",
  success:
    "bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-primary-btn",
  amber:
    "bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs rounded-lg",
  sm: "h-8 px-2.5 text-xs rounded-xl",
  md: "h-9 px-3.5 text-xs rounded-xl",
  lg: "h-10 px-4 text-xs font-semibold rounded-xl",
  "icon-xs": "h-7 w-7 p-1 rounded-lg shrink-0",
  "icon-sm": "h-8 w-8 p-1.5 rounded-xl shrink-0",
  "icon-md": "h-9 w-9 p-2 rounded-xl shrink-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = "",
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const isIconOnly = size.startsWith("icon");
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading ? "true" : undefined}
        className={`inline-flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none focus-visible:outline-2 focus-visible:outline-primary ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
