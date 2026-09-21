import React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ hasError = false, className = "", disabled, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        className={`w-full p-2.5 bg-surface-subtle border rounded-xl text-main text-xs leading-relaxed placeholder:text-muted transition-colors focus:bg-surface focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
          hasError
            ? "border-rose-300 focus:border-rose-500 bg-rose-50/20 focus:ring-1 focus:ring-rose-400/30"
            : "border-border-subtle focus:border-border-strong focus:ring-1 focus:ring-border-strong/20"
        } ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
