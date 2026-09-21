import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, RotateCcw, ChevronDown, ShieldAlert } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; resetError: () => void }) => ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught render error caught by ErrorBoundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public handleReload = (): void => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === "function") {
          return this.props.fallback({
            error: this.state.error || new Error("Erreur inconnue"),
            resetError: this.resetError,
          });
        }
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-4 text-main font-sans antialiased">
          <div className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-[0_4px_24px_rgba(0,0,0,0.06)] space-y-5 text-center">
            {/* Header Icon */}
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/70 text-rose-600 flex items-center justify-center shadow-micro">
              <ShieldAlert className="w-6 h-6" />
            </div>

            {/* Error Message */}
            <div className="space-y-1.5">
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/70 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.5)]" />
                  Interruption d'affichage
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-semibold text-main tracking-tight">
                Une anomalie inattendue est survenue
              </h1>
              <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
                Un incident de rendu a interrompu l'interface. Vos prospects et configurations stockés localement sont en sécurité.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-primary-fg rounded-xl text-xs font-semibold shadow-primary-btn transition-all active:scale-95 cursor-pointer h-10 select-none"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recharger l'application</span>
              </button>

              <button
                type="button"
                onClick={this.resetError}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-secondary hover:bg-surface-subtle text-secondary-fg rounded-xl text-xs font-medium border border-border-subtle transition-all active:scale-95 cursor-pointer h-10 select-none"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Tenter de restaurer</span>
              </button>
            </div>

            {/* Technical details accordion */}
            {this.state.error && (
              <details className="text-left bg-surface-subtle border border-border-subtle rounded-xl p-3 text-xs group cursor-pointer">
                <summary className="font-medium text-secondary-fg flex items-center justify-between select-none list-none">
                  <span className="flex items-center gap-1.5 text-muted">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Détails techniques
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-2.5 pt-2 border-t border-border-subtle font-mono text-xs text-muted space-y-1.5 overflow-x-auto max-h-48 scrollbar-thin">
                  <p className="font-semibold text-rose-700 break-words">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-muted whitespace-pre-wrap leading-tight">
                      {this.state.error.stack}
                    </pre>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <pre className="text-xs text-muted/80 whitespace-pre-wrap leading-tight mt-1 border-t border-border-subtle pt-1">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
