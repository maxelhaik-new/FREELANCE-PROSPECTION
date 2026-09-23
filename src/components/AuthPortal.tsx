import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { Mail, Lock, Loader2, ArrowRight } from "lucide-react";

interface AuthPortalProps {
  onAuthSuccess?: () => void;
  onNavigate?: (path: string) => void;
}

export function AuthPortal({ onAuthSuccess, onNavigate }: AuthPortalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
      onAuthSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-surface border border-border-subtle rounded-2xl shadow-xl overflow-hidden p-8 space-y-8 h-auto break-words">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-main">
            {isLogin ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="text-sm text-muted">
            {isLogin
              ? "Accédez à votre espace prospection"
              : "Démarrez votre prospection locale en quelques clics"}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-sm h-auto break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-main" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="vous@email.com"
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border-subtle rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-main" htmlFor="password">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/60" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className="w-full pl-9 pr-4 py-2.5 bg-background border border-border-subtle rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-fg py-2.5 rounded-xl text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 shadow-primary-btn cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLogin ? "Se connecter" : "S'inscrire"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted hover:text-primary transition-colors cursor-pointer"
          >
            {isLogin
              ? "Pas encore de compte ? S'inscrire"
              : "Déjà un compte ? Se connecter"}
          </button>
        </div>

        <div className="relative flex items-center pt-2">
          <div className="flex-grow border-t border-border-subtle"></div>
          <span className="flex-shrink-0 px-3 text-xs text-muted">Ou</span>
          <div className="flex-grow border-t border-border-subtle"></div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError(null);
            try {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  scopes: "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify",
                  redirectTo: window.location.origin
                }
              });
              if (error) throw error;
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : "Erreur de connexion Google";
              setError(message);
              setLoading(false);
            }
          }}
          className="w-full flex items-center justify-center gap-3 bg-surface border border-border-subtle py-2.5 rounded-xl text-sm font-medium hover:bg-secondary active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 cursor-pointer text-main"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </button>

        {/* Footer legal links */}
        <div className="pt-2 text-center text-xs text-muted flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.("/privacy")}
            className="hover:text-main underline cursor-pointer"
          >
            Confidentialité
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => onNavigate?.("/terms")}
            className="hover:text-main underline cursor-pointer"
          >
            Conditions d'utilisation
          </button>
        </div>
      </div>
    </div>
  );
}
