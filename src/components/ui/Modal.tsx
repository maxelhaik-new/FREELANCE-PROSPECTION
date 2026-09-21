import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerRight?: React.ReactNode;
  maxWidth?: "md" | "lg" | "xl" | "2xl" | "3xl";
  children: React.ReactNode;
  footer?: React.ReactNode;
  ariaLabelledBy?: string;
}

const MAX_WIDTH_CLASSES = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  headerRight,
  maxWidth = "xl",
  children,
  footer,
  ariaLabelledBy = "modal-title",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement as HTMLElement | null;

    const timer = setTimeout(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.16 }}
            className={`bg-surface border border-border-subtle rounded-2xl w-full ${MAX_WIDTH_CLASSES[maxWidth]} max-h-[92vh] sm:max-h-[88vh] shadow-xl overflow-hidden flex flex-col my-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || subtitle || headerRight) && (
              <div className="p-4 sm:p-5 border-b border-border-subtle flex items-start justify-between gap-3 bg-surface-subtle shrink-0">
                <div className="min-w-0 flex-1">
                  {typeof title === "string" ? (
                    <h3
                      id={ariaLabelledBy}
                      className="text-sm sm:text-base font-semibold text-main tracking-tight"
                    >
                      {title}
                    </h3>
                  ) : (
                    title
                  )}
                  {subtitle && (
                    <div className="text-xs text-muted mt-0.5">
                      {subtitle}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {headerRight}
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-muted hover:text-main hover:bg-secondary transition-colors min-w-8 min-h-8 flex items-center justify-center cursor-pointer"
                    aria-label="Fermer"
                    title="Fermer (Échap)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Content */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 min-h-0">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="p-3.5 sm:px-5 sm:py-3.5 border-t border-border-subtle bg-surface-subtle shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

Modal.displayName = "Modal";
export default Modal;
