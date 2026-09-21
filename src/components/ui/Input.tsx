import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  hasError?: boolean;
  inputSize?: "sm" | "md";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      leftIcon,
      rightElement,
      hasError = false,
      inputSize = "md",
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClass = inputSize === "sm" ? "h-8 py-1.5 text-base sm:text-xs" : "h-9.5 py-2 text-base sm:text-xs";
    const paddingLeft = leftIcon ? "pl-9" : "px-3";
    const paddingRight = rightElement ? "pr-9" : "px-3";

    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={hasError ? "true" : undefined}
          className={`w-full ${paddingLeft} ${paddingRight} ${sizeClass} bg-surface-subtle border rounded-xl text-main placeholder:text-muted transition-colors focus:bg-surface focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
            hasError
              ? "border-rose-300 focus:border-rose-500 bg-rose-50/20 focus:ring-1 focus:ring-rose-400/30"
              : "border-border-subtle focus:border-border-strong focus:ring-1 focus:ring-border-strong/20"
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
