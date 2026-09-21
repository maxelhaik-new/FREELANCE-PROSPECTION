import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  "https://cjbniohrsrxzfmbyotbv.supabase.co";

const supabaseAnonKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqYm5pb2hyc3J4emZtYnlvdGJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4OTg2ODUsImV4cCI6MjEwNTQ3NDY4NX0.yIvQH5CFrvj8aRt59fa9oEYZICVvve4HFCGXd9zkPdM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const USER_ID_STORAGE_KEY = "app_user_id";

/**
 * Récupère ou initialise un identifiant persistant pour l'utilisateur courant.
 * Si l'utilisateur est authentifié avec Firebase Auth (ou Supabase Auth plus tard),
 * son UID est utilisé prioritairement.
 */
export function getPersistentUserId(): string {
  if (typeof window !== "undefined") {
    try {
      let existingId = localStorage.getItem(USER_ID_STORAGE_KEY);
      if (!existingId) {
        existingId = "user_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
        localStorage.setItem(USER_ID_STORAGE_KEY, existingId);
      }
      return existingId;
    } catch {
      // Fallback si localStorage est inaccessible
    }
  }
  return "anonymous_default_user";
}

/**
 * Détermine le userId actif en prenant en compte une éventuelle session Firebase Auth.
 */
export function resolveUserId(authenticatedUid?: string | null): string {
  if (authenticatedUid && authenticatedUid.trim().length > 0) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(USER_ID_STORAGE_KEY, authenticatedUid);
      } catch {
        // ignore
      }
    }
    return authenticatedUid;
  }
  return getPersistentUserId();
}
