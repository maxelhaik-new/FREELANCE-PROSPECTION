import React from "react";

export type BadgeVariant =
  | "neutral"
  | "emerald"
  | "amber"
  | "blue"
  | "rose"
  | "purple"
  | "dark";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  withDot?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-secondary text-secondary-fg border border-border-subtle",
  emerald: "bg-emerald-50 text-emerald-800 border border-emerald-200/70",
  amber: "bg-amber-50 text-amber-900 border border-amber-200/70",
  blue: "bg-blue-50 text-blue-800 border border-blue-200/70",
  rose: "bg-rose-50 text-rose-700 border border-rose-200/70",
  purple: "bg-purple-50 text-purple-700 border border-purple-200/70",
  dark: "bg-primary text-primary-fg shadow-primary-btn",
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-muted",
  emerald: "bg-emerald-500 shadow-glow-emerald",
  amber: "bg-amber-500 shadow-glow-amber",
  blue: "bg-blue-500 shadow-glow-blue",
  rose: "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]",
  purple: "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]",
  dark: "bg-primary-fg shadow-glow-zinc",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs font-medium rounded-full",
  md: "px-2.5 py-1 text-xs font-medium rounded-full",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  size = "sm",
  withDot = false,
  className = "",
  children,
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 shrink-0 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {withDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_CLASSES[variant]}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};

Badge.displayName = "Badge";
export default Badge;
