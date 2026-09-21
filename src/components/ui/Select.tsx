import React from "react";
import { ChevronDown } from "lucide-react";
import { ProspectStatus } from "../../types";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  statusVariant?: ProspectStatus | "default";
}

const STATUS_CLASSES: Record<ProspectStatus | "default", string> = {
  default: "bg-surface text-main border-border-subtle focus:border-border-strong",
  searched: "bg-secondary text-secondary-fg border-border-subtle focus:border-border-strong",
  to_contact: "bg-amber-50 text-amber-900 border-amber-200/70 focus:border-amber-400",
  contacted: "bg-blue-50 text-blue-800 border-blue-200/70 focus:border-blue-400",
  interested: "bg-emerald-50 text-emerald-800 border-emerald-200/70 focus:border-emerald-400",
  declined: "bg-secondary text-secondary-fg border-border-subtle focus:border-border-strong",
};

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ statusVariant = "default", className = "", children, disabled, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full">
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full appearance-none h-8 py-1 pl-2.5 pr-6.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${STATUS_CLASSES[statusVariant]} ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 text-current" />
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
