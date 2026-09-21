import { supabase } from "../lib/supabase";
import { Prospect, ProspectStatus, FreelanceProfile } from "../types";

const isTestEnv =
  (typeof process !== "undefined" && process.env.NODE_ENV === "test") ||
  (typeof import.meta !== "undefined" && import.meta.env?.MODE === "test");

// In-memory storage for test runners (Vitest / JSDOM) to avoid network mocks interference
let memoryProspects: Map<string, Prospect[]> = new Map();
let memoryProfiles: Map<string, FreelanceProfile> = new Map();

export function resetMemoryStore() {
  memoryProspects.clear();
  memoryProfiles.clear();
}

export function rowToProspect(row: any): Prospect {
  return {
    id: row.id,
    name: row.name,
    activity: row.activity || "",
    location: row.location || "",
    address: row.address || undefined,
    phone: row.phone || undefined,
    website: row.website || undefined,
    email: row.email || undefined,
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : undefined,
    reviewCount: row.review_count !== null && row.review_count !== undefined ? Number(row.review_count) : undefined,
    notes: row.notes || undefined,
    identified: Boolean(row.identified),
    status: (row.status as ProspectStatus) || "searched",
    relevanceScore: row.relevance_score !== null && row.relevance_score !== undefined ? Number(row.relevance_score) : undefined,
    keyAngle: row.key_angle || undefined,
    lat: row.lat !== null && row.lat !== undefined ? Number(row.lat) : undefined,
    lng: row.lng !== null && row.lng !== undefined ? Number(row.lng) : undefined,
    generatedEmail: row.generated_email || undefined,
    emailSentAt: row.email_sent_at || undefined,
  };
}

export function prospectToRow(p: Prospect, userId: string) {
  return {
    id: p.id,
    user_id: userId,
    name: p.name,
    activity: p.activity || "",
    location: p.location || "",
    address: p.address || null,
    phone: p.phone || null,
    website: p.website || null,
    email: p.email || null,
    rating: p.rating !== undefined ? p.rating : null,
    review_count: p.reviewCount !== undefined ? p.reviewCount : null,
    notes: p.notes || null,
    identified: p.identified,
    status: p.status,
    relevance_score: p.relevanceScore !== undefined ? p.relevanceScore : null,
    key_angle: p.keyAngle || null,
    lat: p.lat !== undefined ? p.lat : null,
    lng: p.lng !== undefined ? p.lng : null,
    generated_email: p.generatedEmail || null,
    email_sent_at: p.emailSentAt || null,
    updated_at: new Date().toISOString(),
  };
}

export function rowToProfile(row: any): FreelanceProfile {
  return {
    title: row.title || "",
    services: row.services || "",
    targetSector: row.target_sector || "",
    targetCity: row.target_city || "",
    portfolioUrl: row.portfolio_url || undefined,
    valueProposition: row.value_proposition || "",
    signature: row.signature || undefined,
  };
}

export function profileToRow(profile: FreelanceProfile, userId: string) {
  return {
    user_id: userId,
    title: profile.title,
    services: profile.services,
    target_sector: profile.targetSector,
    target_city: profile.targetCity || "",
    portfolio_url: profile.portfolioUrl || null,
    value_proposition: profile.valueProposition,
    signature: profile.signature || null,
    updated_at: new Date().toISOString(),
  };
}

export const supabaseProspectService = {
  /**
   * Récupère tous les prospects associés à un utilisateur, ordonnés par date de création décroissante.
   */
  async fetchProspects(userId: string): Promise<Prospect[]> {
    if (isTestEnv) {
      return memoryProspects.get(userId) || [];
    }

    try {
      const { data, error } = await supabase
        .from("prospects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erreur de récupération des prospects depuis Supabase:", error);
        return [];
      }

      return (data || []).map(rowToProspect);
    } catch (err) {
      console.error("Exception lors de fetchProspects:", err);
      return [];
    }
  },

  /**
   * Sauvegarde ou met à jour une liste de prospects en base pour l'utilisateur.
   */
  async upsertProspects(userId: string, prospects: Prospect[]): Promise<void> {
    if (!prospects || prospects.length === 0) return;

    if (isTestEnv) {
      const current = memoryProspects.get(userId) || [];
      const map = new Map(current.map((p) => [p.id, p]));
      prospects.forEach((p) => map.set(p.id, p));
      memoryProspects.set(userId, Array.from(map.values()));
      return;
    }

    try {
      const rows = prospects.map((p) => prospectToRow(p, userId));
      const { error } = await supabase
        .from("prospects")
        .upsert(rows, { onConflict: "id" });

      if (error) {
        console.error("Erreur upsert prospects dans Supabase:", error);
      }
    } catch (err) {
      console.error("Exception lors de upsertProspects:", err);
    }
  },

  /**
   * Met à jour un prospect spécifique.
   */
  async updateProspect(userId: string, prospect: Prospect): Promise<void> {
    if (isTestEnv) {
      const current = memoryProspects.get(userId) || [];
      memoryProspects.set(
        userId,
        current.map((p) => (p.id === prospect.id ? prospect : p))
      );
      return;
    }

    try {
      const row = prospectToRow(prospect, userId);
      const { error } = await supabase
        .from("prospects")
        .update(row)
        .eq("id", prospect.id)
        .eq("user_id", userId);

      if (error) {
        console.error(`Erreur update prospect ${prospect.id}:`, error);
      }
    } catch (err) {
      console.error("Exception lors de updateProspect:", err);
    }
  },

  /**
   * Met à jour le statut du pipeline d'un prospect.
   */
  async updateStatus(userId: string, id: string, status: ProspectStatus): Promise<void> {
    if (isTestEnv) {
      const current = memoryProspects.get(userId) || [];
      memoryProspects.set(
        userId,
        current.map((p) => (p.id === id ? { ...p, status } : p))
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("prospects")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error(`Erreur update status ${id}:`, error);
      }
    } catch (err) {
      console.error("Exception lors de updateStatus:", err);
    }
  },

  /**
   * Alterne l'état shortlist (identifié) d'un prospect.
   */
  async toggleIdentified(userId: string, id: string, identified: boolean): Promise<void> {
    const nextStatus: ProspectStatus = identified ? "to_contact" : "searched";

    if (isTestEnv) {
      const current = memoryProspects.get(userId) || [];
      memoryProspects.set(
        userId,
        current.map((p) =>
          p.id === id ? { ...p, identified, status: nextStatus } : p
        )
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("prospects")
        .update({
          identified,
          status: nextStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error(`Erreur toggle identified ${id}:`, error);
      }
    } catch (err) {
      console.error("Exception lors de toggleIdentified:", err);
    }
  },

  /**
   * Supprime un prospect de la base de données.
   */
  async deleteProspect(userId: string, id: string): Promise<void> {
    if (isTestEnv) {
      const current = memoryProspects.get(userId) || [];
      memoryProspects.set(
        userId,
        current.filter((p) => p.id !== id)
      );
      return;
    }

    try {
      const { error } = await supabase
        .from("prospects")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        console.error(`Erreur delete prospect ${id}:`, error);
      }
    } catch (err) {
      console.error("Exception lors de deleteProspect:", err);
    }
  },

  /**
   * Récupère le profil freelance enregistré en base.
   */
  async fetchProfile(userId: string): Promise<FreelanceProfile | null> {
    if (isTestEnv) {
      return memoryProfiles.get(userId) || null;
    }

    try {
      const { data, error } = await supabase
        .from("freelance_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Erreur fetchProfile:", error);
        return null;
      }

      return data ? rowToProfile(data) : null;
    } catch (err) {
      console.error("Exception lors de fetchProfile:", err);
      return null;
    }
  },

  /**
   * Sauvegarde le profil freelance en base.
   */
  async saveProfile(userId: string, profile: FreelanceProfile): Promise<void> {
    if (isTestEnv) {
      memoryProfiles.set(userId, profile);
      return;
    }

    try {
      const row = profileToRow(profile, userId);
      const { error } = await supabase
        .from("freelance_profiles")
        .upsert(row, { onConflict: "user_id" });

      if (error) {
        console.error("Erreur saveProfile:", error);
      }
    } catch (err) {
      console.error("Exception lors de saveProfile:", err);
    }
  },
};
