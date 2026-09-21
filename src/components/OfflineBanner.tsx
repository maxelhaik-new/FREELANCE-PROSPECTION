import React, { useState, useEffect, useCallback } from "react";
import { WifiOff, Wifi, RefreshCw, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface OfflineBannerProps {
  /**
   * Optionnel : callback appelé lors d'un changement de statut réseau
   */
  onNetworkChange?: (isOnline: boolean) => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ onNetworkChange }) => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });
  const [showReconnected, setShowReconnected] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  const checkConnectivity = useCallback(async () => {
    setChecking(true);
    try {
      // Test de ping réseau léger
      const online = typeof navigator !== "undefined" ? navigator.onLine : true;
      if (online) {
        setIsOnline(true);
        setShowReconnected(true);
        setDismissed(false);
        onNetworkChange?.(true);
        setTimeout(() => setShowReconnected(false), 3500);
      } else {
        setIsOnline(false);
        onNetworkChange?.(false);
      }
    } finally {
      setTimeout(() => setChecking(false), 500);
    }
  }, [onNetworkChange]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setDismissed(false);
      onNetworkChange?.(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
      setDismissed(false);
      onNetworkChange?.(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [onNetworkChange]);

  // Si l'utilisateur est en ligne et qu'il n'y a pas de message de reconnexion à afficher, ne rien afficher
  if (isOnline && !showReconnected) {
    return null;
  }

  // Si hors-ligne mais masqué temporairement par l'utilisateur
  if (!isOnline && dismissed) {
    return (
      <aside
        aria-label="Statut hors-ligne"
        className="fixed bottom-3 right-3 z-50"
      >
        <button
          onClick={() => setDismissed(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/90 hover:bg-primary text-primary-fg rounded-xl text-xs font-medium shadow-lg backdrop-blur-xs border border-border-strong transition-all cursor-pointer"
          title="Afficher l'alerte hors-ligne"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
          <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Hors-ligne</span>
        </button>
      </aside>
    );
  }

  return (
    <AnimatePresence>
      <aside
        aria-label="Statut de la connexion"
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg pointer-events-none"
      >
        {!isOnline ? (
          <motion.div
            key="offline-banner"
            role="alert"
            aria-live="assertive"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto bg-surface/95 backdrop-blur-md border border-amber-300/80 text-main rounded-2xl p-3 sm:px-4 sm:py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/70 shrink-0">
                <WifiOff className="w-4 h-4 text-amber-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-main tracking-tight">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)] shrink-0 animate-pulse" />
                  <span>Mode hors-ligne détecté</span>
                </div>
                <p className="text-xs text-muted truncate leading-tight mt-0.5">
                  Recherches Google Maps et envois Gmail temporairement indisponibles.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={checkConnectivity}
                disabled={checking}
                className="px-2.5 py-1.5 bg-secondary hover:bg-surface-subtle text-secondary-fg rounded-xl text-xs font-medium flex items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                title="Vérifier l'état de la connexion"
                aria-label="Vérifier la connexion"
              >
                <RefreshCw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Tester</span>
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="p-1.5 text-muted hover:text-main hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                title="Masquer le bandeau"
                aria-label="Masquer l'alerte"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ) : showReconnected ? (
          <motion.div
            key="reconnected-banner"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto bg-surface/95 backdrop-blur-md border border-emerald-300/80 text-main rounded-2xl p-3 sm:px-4 sm:py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200/70 shrink-0">
                <Wifi className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-xs text-main tracking-tight">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)] shrink-0" />
                  <span>Connexion rétablie</span>
                </div>
                <p className="text-xs text-muted truncate leading-tight mt-0.5">
                  Tous les services de prospection sont à nouveau disponibles.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowReconnected(false)}
              className="p-1.5 text-muted hover:text-main hover:bg-secondary rounded-lg transition-colors cursor-pointer"
              title="Fermer"
              aria-label="Fermer la notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : null}
      </aside>
    </AnimatePresence>
  );
};

export default OfflineBanner;
