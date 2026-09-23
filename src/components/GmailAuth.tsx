import React, { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabase";

interface GmailAuthProps {
  token: string | null;
  onTokenChange?: (token: string | null, email?: string, uid?: string) => void;
  userEmail?: string | null;
  isExpired?: boolean;
}

export const GmailAuth: React.FC<GmailAuthProps> = ({
  token,
  userEmail,
  isExpired = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.modify",
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Erreur OAuth Google:", err);
      setError(err.message || "Erreur de connexion avec Google");
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-full text-xs font-medium border border-red-100 h-auto break-words">
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="max-w-[150px] truncate" title={error}>
          {error}
        </span>
        <button
          onClick={() => setError(null)}
          className="ml-1 p-0.5 hover:bg-red-100 rounded-full cursor-pointer"
        >
          &times;
        </button>
      </div>
    );
  }

  if (token && !isExpired) {
    return (
      <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium border border-green-100 cursor-default" title={userEmail ? `Connecté en tant que ${userEmail}` : 'Connecté avec Google'}>
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Gmail Connecté</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-50 active:bg-gray-100 disabled:opacity-70 transition-colors shadow-sm cursor-pointer"
    >
      {loading ? (
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Mail className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">
        {isExpired ? "Reconnecter Gmail" : "Connecter Gmail"}
      </span>
    </button>
  );
};
