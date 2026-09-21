import React, { useState, useEffect, useCallback } from "react";
import { Mail, CheckCircle2, AlertCircle, LogOut, RefreshCw, Clock } from "lucide-react";
import { googleSignIn, logout, initAuth } from "../lib/firebase";
import { Button } from "./ui";

interface GmailAuthProps {
  token: string | null;
  onTokenChange: (token: string | null, email?: string, uid?: string) => void;
  userEmail: string | null;
  isExpired?: boolean;
}

// Google OAuth access tokens expire after 3600 seconds (60 mins)
const TOKEN_LIFETIME_MS = 55 * 60 * 1000; // Alerte à 55 minutes

export const GmailAuth: React.FC<GmailAuthProps> = ({
  token,
  onTokenChange,
  userEmail,
  isExpired: externalExpired,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(() => {
    if (!token) return false;
    const issuedAt = sessionStorage.getItem("gmail_token_issued_at");
    if (!issuedAt) return false;
    return Date.now() - parseInt(issuedAt, 10) > TOKEN_LIFETIME_MS;
  });

  // Check token expiration periodically and on focus
  const checkTokenFreshness = useCallback(() => {
    if (!token) {
      setIsExpired(false);
      return;
    }
    const issuedAt = sessionStorage.getItem("gmail_token_issued_at");
    if (issuedAt) {
      const age = Date.now() - parseInt(issuedAt, 10);
      if (age > TOKEN_LIFETIME_MS) {
        setIsExpired(true);
      } else {
        setIsExpired(false);
      }
    }
  }, [token]);

  useEffect(() => {
    checkTokenFreshness();
    const interval = setInterval(checkTokenFreshness, 60000);
    const handleFocus = () => checkTokenFreshness();
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkTokenFreshness]);

  useEffect(() => {
    if (externalExpired) {
      setIsExpired(true);
    }
  }, [externalExpired]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, cachedToken) => {
        onTokenChange(cachedToken, user.email || undefined, user.uid);
        if (!sessionStorage.getItem("gmail_token_issued_at")) {
          sessionStorage.setItem("gmail_token_issued_at", Date.now().toString());
        }
      },
      () => {
        // Not logged in or logged out
      }
    );
    return () => unsubscribe();
  }, [onTokenChange]);

  const handleConnect = async () => {
    setError(null);

    // Vérification réseau avant d'ouvrir la popup OAuth
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setError("Connexion impossible en mode hors-ligne. Veuillez rétablir votre accès Internet.");
      return;
    }

    setLoading(true);

    try {
      const result = await googleSignIn();
      if (result?.accessToken) {
        sessionStorage.setItem("gmail_token_issued_at", Date.now().toString());
        setIsExpired(false);
        onTokenChange(result.accessToken, result.user.email || undefined, result.user.uid);
      }
    } catch (err: any) {
      console.error("Erreur OAuth:", err);
      // Traduction conviviale des codes d'erreurs Firebase OAuth
      if (err.code === "auth/popup-closed-by-user") {
        setError("Connexion interrompue : la fenêtre Google a été fermée.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Fenêtre pop-up bloquée par le navigateur. Veuillez autoriser les pop-ups pour ce site.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Erreur réseau : impossible de joindre les serveurs d'authentification Google.");
      } else if (err.code === "auth/cancelled-popup-request") {
        // Ignorer silencieusement si une autre popup a pris le relais
      } else {
        setError(err.message || "Erreur d'authentification Google OAuth");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
      sessionStorage.removeItem("gmail_token_issued_at");
      setIsExpired(false);
      onTokenChange(null);
    } catch (err: any) {
      console.error("Erreur déconnexion:", err);
      sessionStorage.removeItem("gmail_token_issued_at");
      setIsExpired(false);
      onTokenChange(null);
    }
  };

  const effectiveExpired = Boolean(token && (isExpired || externalExpired));

  const iconClass = token
    ? effectiveExpired
      ? "bg-amber-50 text-amber-800 border border-amber-200/70"
      : "bg-emerald-50 text-emerald-800 border border-emerald-200/70"
    : "bg-secondary text-secondary-fg border border-border-subtle";

  return (
    <div className="relative inline-flex flex-col">
      <div className="inline-flex items-center justify-between gap-2.5 px-3 py-1 bg-surface border border-border-subtle rounded-xl text-xs shadow-micro h-8.5 max-w-full sm:max-w-[290px]">
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              token
                ? effectiveExpired
                  ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)] animate-pulse"
                  : "bg-emerald-500 shadow-glow-emerald"
                : "bg-muted"
            }`}
          />
          <span className="font-medium text-main truncate" title={token ? userEmail || "Gmail connecté" : "Gmail non connecté"}>
            {token ? (effectiveExpired ? "Session expirée" : userEmail || "Gmail connecté") : "Gmail"}
          </span>
        </div>

        <div className="shrink-0 flex items-center gap-1">
          {token ? (
            <>
              {effectiveExpired && (
                <Button
                  variant="amber"
                  size="xs"
                  onClick={handleConnect}
                  disabled={loading}
                  loading={loading}
                  leftIcon={!loading && <RefreshCw className="w-3 h-3" />}
                  title="Renouveler le jeton de sécurité"
                  aria-label="Renouveler la session Gmail"
                >
                  Renouveler
                </Button>
              )}
              <Button
                id="disconnect-gmail-btn"
                variant="ghost"
                size="icon-sm"
                onClick={handleDisconnect}
                title="Déconnecter le compte Gmail"
                aria-label="Déconnecter le compte Gmail"
                className="text-muted hover:text-main"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button
              id="connect-gmail-btn"
              variant="primary"
              size="xs"
              onClick={handleConnect}
              disabled={loading}
              loading={loading}
              leftIcon={!loading && <Mail className="w-3 h-3 text-primary-fg/80" />}
              aria-label="Connecter un compte Gmail"
            >
              Connecter
            </Button>
          )}
        </div>
      </div>

      {effectiveExpired && !error && (
        <div className="absolute top-full right-0 mt-1 z-30 w-72 text-amber-900 bg-amber-50 border border-amber-200/90 rounded-xl p-2.5 text-xs font-medium shadow-lg flex items-start gap-1.5" role="alert">
          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-tight flex-1">
            Session Google expirée. Cliquez sur <strong>Renouveler</strong> pour réactiver l'envoi d'emails.
          </span>
        </div>
      )}

      {error && (
        <div className="absolute top-full right-0 mt-1 z-30 w-72 text-rose-800 bg-rose-50 border border-rose-200/90 rounded-xl p-2.5 text-xs font-medium shadow-lg flex items-start justify-between gap-1.5" role="alert">
          <div className="flex items-start gap-1.5 min-w-0">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
            <span className="break-words leading-tight flex-1">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-800 text-xs font-semibold p-0.5 cursor-pointer shrink-0"
            aria-label="Fermer le message d'erreur"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

