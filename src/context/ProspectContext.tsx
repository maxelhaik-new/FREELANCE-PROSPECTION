import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Prospect, FreelanceProfile, SearchQuery, ProspectStatus } from "../types";
import { OfflineBanner } from "../components/OfflineBanner";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { supabaseProspectService } from "../services/supabaseProspectService";
import { resolveUserId } from "../lib/supabase";

export interface UndoToastState {
  message: string;
  prospect: Prospect;
  index: number;
}

export const INITIAL_PROFILE: FreelanceProfile = {
  title: "Freelance Web & Visibilité Locale",
  services: "Refonte de site moderne, SEO Google Maps, optimisation conversion, devis en ligne",
  targetSector: "Commerces & Artisans",
  targetCity: "",
  valueProposition: "Aider les acteurs locaux à transformer leurs visiteurs en clients et moderniser leur image.",
  signature: "Bien cordialement,\nMaxime - Consultant Web & Digital\n06 00 00 00 00",
};

export const INITIAL_PROSPECTS: Prospect[] = [];

interface ProspectContextType {
  prospects: Prospect[];
  filteredProspects: Prospect[];
  freelanceProfile: FreelanceProfile;
  setFreelanceProfile: React.Dispatch<React.SetStateAction<FreelanceProfile>>;
  selectedProspect: Prospect | null;
  setSelectedProspect: (prospect: Prospect | null) => void;
  modalProspect: Prospect | null;
  setModalProspect: (prospect: Prospect | null) => void;
  searchLoading: boolean;
  searchError: string | null;
  clearSearchError: () => void;
  filterStatus: string;
  setFilterStatus: (filter: string) => void;
  searchFilterText: string;
  setSearchFilterText: (text: string) => void;
  filterWithoutWebsite: boolean;
  setFilterWithoutWebsite: (val: boolean) => void;
  filterWithEmail: boolean;
  setFilterWithEmail: (val: boolean) => void;
  currentSearchInfo: {
    city: string;
    sector: string;
    prospectIds: string[];
  };
  gmailToken: string | null;
  userEmail: string | null;
  userId: string;
  isDbLoading: boolean;
  handleTokenChange: (token: string | null, email?: string, uid?: string) => void;
  handleSearch: (query: SearchQuery, forceRefresh?: boolean) => Promise<void>;
  retryLastSearch: () => Promise<void>;
  isOnline: boolean;
  handleToggleIdentified: (id: string) => void;
  handleUpdateStatus: (id: string, status: ProspectStatus) => void;
  handleUpdateProspect: (updated: Prospect) => void;
  handleDeleteProspect: (id: string) => void;
  undoToast: UndoToastState | null;
  handleUndoDelete: () => void;
  dismissUndoToast: () => void;
  exportProspectsCSV: () => void;
  exportProspectsJSON: () => void;
}

const ProspectContext = createContext<ProspectContextType | null>(null);

export const ProspectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>(() => resolveUserId(null));
  const [isDbLoading, setIsDbLoading] = useState<boolean>(true);

  // Initialisation immédiate : lecture du cache local s'il existe pour affichage instantané sans scintillement
  const [prospects, setProspects] = useState<Prospect[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored =
          localStorage.getItem("freelance_prospects_cache") ||
          localStorage.getItem("freelance_prospects");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return INITIAL_PROSPECTS;
  });

  const [freelanceProfile, setFreelanceProfile] = useState<FreelanceProfile>(INITIAL_PROFILE);

  // Garde une référence toujours à jour sur prospects pour éviter les closures périmées
  const prospectsRef = useRef<Prospect[]>(prospects);
  useEffect(() => {
    prospectsRef.current = prospects;
  }, [prospects]);

  // Synchronisation du cache local pour résilience hors-ligne
  useEffect(() => {
    if (typeof window !== "undefined" && !isDbLoading) {
      try {
        localStorage.setItem("freelance_prospects_cache", JSON.stringify(prospects));
      } catch {
        // ignore
      }
    }
  }, [prospects, isDbLoading]);

  // Hydratation asynchrone depuis Supabase à l'initialisation ou au changement d'utilisateur
  useEffect(() => {
    let isCancelled = false;

    async function hydrateFromSupabase() {
      setIsDbLoading(true);
      try {
        // 1. Migration automatique d'anciens prospects localStorage vers Supabase si existants
        if (typeof window !== "undefined") {
          const legacy = localStorage.getItem("freelance_prospects");
          if (legacy) {
            try {
              const parsed = JSON.parse(legacy);
              if (Array.isArray(parsed) && parsed.length > 0) {
                await supabaseProspectService.upsertProspects(userId, parsed);
                localStorage.removeItem("freelance_prospects");
              }
            } catch {
              // ignore parse errors
            }
          }
        }

        // 2. Chargement des prospects depuis Supabase (source de vérité)
        const dbProspects = await supabaseProspectService.fetchProspects(userId);
        if (!isCancelled) {
          if (dbProspects.length > 0) {
            setProspects(dbProspects);
          } else if (prospectsRef.current.length > 0) {
            // Si la base distante est encore vide mais que le cache en mémoire a des prospects, on les pousse
            await supabaseProspectService.upsertProspects(userId, prospectsRef.current);
          }
        }

        // 3. Chargement du profil freelance depuis Supabase
        const dbProfile = await supabaseProspectService.fetchProfile(userId);
        if (!isCancelled && dbProfile) {
          setFreelanceProfile(dbProfile);
        }
      } catch (err) {
        console.error("Erreur lors de l'hydratation Supabase:", err);
      } finally {
        if (!isCancelled) {
          setIsDbLoading(false);
        }
      }
    }

    hydrateFromSupabase();

    return () => {
      isCancelled = true;
    };
  }, [userId]);

  // Sauvegarde automatique du profil freelance en base lorsqu'il est modifié par l'utilisateur
  useEffect(() => {
    if (isDbLoading) return;
    supabaseProspectService.saveProfile(userId, freelanceProfile);
  }, [freelanceProfile, userId, isDbLoading]);

  const [gmailToken, setGmailToken] = useState<string | null>(() => {
    return sessionStorage.getItem("gmail_access_token") || null;
  });

  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return sessionStorage.getItem("gmail_user_email") || null;
  });

  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [modalProspect, setModalProspect] = useState<Prospect | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchFilterText, setSearchFilterText] = useState("");
  const [filterWithoutWebsite, setFilterWithoutWebsite] = useState(false);
  const [filterWithEmail, setFilterWithEmail] = useState(false);

  // Network online status detection
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const clearSearchError = useCallback(() => setSearchError(null), []);

  // Track last search query for retry capability
  const lastSearchRef = useRef<{ query: SearchQuery; forceRefresh?: boolean } | null>(null);
  const isSearchingRef = useRef<boolean>(false);

  const [currentSearchInfo, setCurrentSearchInfo] = useState<{
    city: string;
    sector: string;
    prospectIds: string[];
  }>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("freelance_current_search");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.prospectIds)) {
            return parsed;
          }
        }
      } catch {
        // ignore
      }
    }
    return {
      city: "",
      sector: "Commerces & Artisans",
      prospectIds: [],
    };
  });

  const [undoToast, setUndoToast] = useState<UndoToastState | null>(null);
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTokenChange = useCallback((token: string | null, email?: string, uid?: string) => {
    setGmailToken(token);
    if (token) {
      sessionStorage.setItem("gmail_access_token", token);
      if (email) {
        setUserEmail(email);
        sessionStorage.setItem("gmail_user_email", email);
      }
      if (uid) {
        setUserId(resolveUserId(uid));
      }
    } else {
      sessionStorage.removeItem("gmail_access_token");
      sessionStorage.removeItem("gmail_user_email");
      setUserEmail(null);
      setUserId(resolveUserId(null));
    }
  }, []);

  const handleSearch = useCallback(async (query: SearchQuery, forceRefresh = false) => {
    // 0. Guard against concurrent duplicate submissions
    if (isSearchingRef.current) return;

    // 1. Guard against offline state
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSearchError("Vous êtes actuellement hors-ligne. Veuillez vérifier votre connexion Internet pour lancer une recherche.");
      return;
    }

    isSearchingRef.current = true;

    // Save for retry
    lastSearchRef.current = { query, forceRefresh };

    setSearchLoading(true);
    setSearchError(null);

    // Timeout protection with AbortController (35s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch("/api/prospects/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          sector: query.sector,
          city: query.city,
          specialty: query.specialty,
          freelanceProfile,
          forceRefresh,
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 400) {
          throw new Error(data.error || "Critères de recherche invalides ou incomplets. Veuillez vérifier la ville et le secteur saisis.");
        }
        if (res.status === 401 || res.status === 403) {
          throw new Error(data.error || "Accès non autorisé au service de recherche de prospects.");
        }
        if (res.status === 429) {
          throw new Error(data.error || "Limite de requêtes atteinte. Veuillez patienter quelques instants avant de relancer.");
        }
        if (res.status >= 500) {
          throw new Error(data.error || "Le service Google Maps / Gemini rencontre une indisponibilité momentanée (Erreur 500). Veuillez réessayer.");
        }
        throw new Error(data.error || `Erreur de récupération des prospects (${res.status})`);
      }

      if (data.prospects && Array.isArray(data.prospects)) {
        // Reset active filters to ensure newly found prospects are immediately visible
        setFilterStatus("all");
        setSearchFilterText("");
        setFilterWithoutWebsite(false);
        setFilterWithEmail(false);

        // Déduplication immédiate par rapport aux prospects actuellement connus
        const currentList = prospectsRef.current;
        const existingNames = new Map(currentList.map((p) => [(p.name || "").trim().toLowerCase(), p]));
        const uniqueToAdd: Prospect[] = [];
        const returnedIds: string[] = [];

        data.prospects.forEach((item: Prospect) => {
          const key = (item.name || "").trim().toLowerCase();
          if (existingNames.has(key)) {
            returnedIds.push(existingNames.get(key)!.id);
          } else {
            uniqueToAdd.push(item);
            returnedIds.push(item.id);
          }
        });

        // 1. Mise à jour de l'état React (UI instantanée)
        setProspects((prev) => {
          const prevMap = new Map(prev.map((p) => [(p.name || "").trim().toLowerCase(), p]));
          const unique: Prospect[] = [];
          data.prospects.forEach((item: Prospect) => {
            const key = (item.name || "").trim().toLowerCase();
            if (!prevMap.has(key)) {
              unique.push(item);
            }
          });
          return [...unique, ...prev];
        });

        // 2. Persistance asynchrone et immédiate dans Supabase
        const toSave = uniqueToAdd.length > 0 ? uniqueToAdd : data.prospects;
        if (toSave.length > 0) {
          await supabaseProspectService.upsertProspects(userId, toSave);
        }

        const newSearchInfo = {
          city: query.city,
          sector: query.sector,
          prospectIds: returnedIds,
        };
        setCurrentSearchInfo(newSearchInfo);
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("freelance_current_search", JSON.stringify(newSearchInfo));
          } catch {
            // ignore
          }
        }
        setFilterStatus("all");

        setFreelanceProfile((prev) => ({
          ...prev,
          targetCity: query.city,
          targetSector: query.sector,
        }));
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Search failed", err);
      if (err?.name === "AbortError") {
        setSearchError("Délai d'attente dépassé (timeout). Le serveur de recherche met trop de temps à répondre, veuillez réessayer.");
      } else if (err instanceof TypeError && (err.message?.includes("fetch") || err.message?.includes("network"))) {
        setSearchError("Impossible de contacter le serveur. Vérifiez votre connexion réseau.");
      } else {
        setSearchError(err?.message || "Erreur lors de la recherche des prospects.");
      }
    } finally {
      isSearchingRef.current = false;
      setSearchLoading(false);
    }
  }, [freelanceProfile, userId]);

  const retryLastSearch = useCallback(async () => {
    if (lastSearchRef.current) {
      await handleSearch(lastSearchRef.current.query, lastSearchRef.current.forceRefresh);
    }
  }, [handleSearch]);

  const handleToggleIdentified = useCallback((id: string) => {
    const target = prospectsRef.current.find((p) => p.id === id);
    if (!target) return;

    const nextIdentified = !target.identified;
    const nextStatus: ProspectStatus = nextIdentified ? "to_contact" : "searched";

    const updatedTarget: Prospect = {
      ...target,
      status: nextStatus,
      identified: nextIdentified,
    };

    setProspects((prev) =>
      prev.map((p) => (p.id === id ? updatedTarget : p))
    );
    setSelectedProspect((prev) => (prev?.id === id ? updatedTarget : prev));
    setModalProspect((prev) => (prev?.id === id ? updatedTarget : prev));

    // Synchro Supabase
    supabaseProspectService.toggleIdentified(userId, id, nextIdentified);
  }, [userId]);

  const handleUpdateProspect = useCallback((updated: Prospect) => {
    setProspects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedProspect((prev) => (prev?.id === updated.id ? updated : prev));
    setModalProspect((prev) => (prev?.id === updated.id ? updated : prev));

    // Synchro Supabase
    supabaseProspectService.updateProspect(userId, updated);
  }, [userId]);

  const handleUpdateStatus = useCallback((id: string, status: ProspectStatus) => {
    setProspects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
    // Synchro Supabase
    supabaseProspectService.updateStatus(userId, id, status);
  }, [userId]);

  const dismissUndoToast = useCallback(() => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }
    setUndoToast(null);
  }, []);

  const handleDeleteProspect = useCallback((id: string) => {
    setProspects((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx !== -1) {
        const deleted = prev[idx];
        if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
        setUndoToast({
          message: `"${deleted.name}" retiré de la liste`,
          prospect: deleted,
          index: idx,
        });
        undoTimeoutRef.current = setTimeout(() => {
          setUndoToast(null);
        }, 6000);
      }
      return prev.filter((p) => p.id !== id);
    });

    setCurrentSearchInfo((prev) => {
      const updated = {
        ...prev,
        prospectIds: prev.prospectIds.filter((pid) => pid !== id),
      };
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("freelance_current_search", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
    setSelectedProspect((prev) => (prev?.id === id ? null : prev));
    setModalProspect((prev) => (prev?.id === id ? null : prev));

    // Synchro Supabase
    supabaseProspectService.deleteProspect(userId, id);
  }, [userId]);

  const handleUndoDelete = useCallback(() => {
    if (!undoToast) return;
    const { prospect, index } = undoToast;
    setProspects((prev) => {
      const next = [...prev];
      const targetIndex = Math.min(Math.max(0, index), next.length);
      next.splice(targetIndex, 0, prospect);
      return next;
    });
    setCurrentSearchInfo((prev) => {
      const updated = {
        ...prev,
        prospectIds: [...prev.prospectIds, prospect.id],
      };
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("freelance_current_search", JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });

    // Restauration dans Supabase
    supabaseProspectService.upsertProspects(userId, [prospect]);

    dismissUndoToast();
  }, [undoToast, dismissUndoToast, userId]);

  // Filtered prospects memoized logic
  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      // 1. Status Filter
      if (filterStatus === "all") {
        // La vue "Tous" ne montre UNIQUEMENT que la recherche en cours
        if (currentSearchInfo.prospectIds.length === 0) return false;
        if (!currentSearchInfo.prospectIds.includes(p.id)) return false;
      } else if (filterStatus === "identified") {
        if (!p.identified) return false;
      } else if (p.status !== filterStatus) {
        return false;
      }

      // 2. Keyword Search filter
      if (searchFilterText.trim()) {
        const q = searchFilterText.toLowerCase();
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchAct = (p.activity || "").toLowerCase().includes(q);
        const matchLoc = (p.location || "").toLowerCase().includes(q);
        const matchAngle = (p.keyAngle || "").toLowerCase().includes(q);
        if (!matchName && !matchAct && !matchLoc && !matchAngle) return false;
      }

      // 3. Quick Toggles
      if (filterWithoutWebsite) {
        const site = (p.website || "").trim().toLowerCase();
        if (site && site !== "aucun site" && site !== "sans site") return false;
      }

      if (filterWithEmail && !p.email) {
        return false;
      }

      return true;
    });
  }, [prospects, filterStatus, currentSearchInfo.prospectIds, searchFilterText, filterWithoutWebsite, filterWithEmail]);

  // Synchronisation de la sélection : si le prospect sélectionné ne fait plus partie des prospects filtrés (changement d'onglet, filtre textuel, suppression), on le désélectionne
  useEffect(() => {
    if (selectedProspect) {
      const exists = filteredProspects.some((p) => p.id === selectedProspect.id);
      if (!exists) {
        setSelectedProspect(null);
      }
    }
  }, [filteredProspects, selectedProspect]);

  // Export to CSV
  const exportProspectsCSV = useCallback(() => {
    if (prospects.length === 0) return;

    const headers = [
      "Nom",
      "Activité",
      "Ville",
      "Statut",
      "Identifié",
      "Email",
      "Téléphone",
      "Site Web",
      "Note",
      "Avis",
      "Angle d'opportunité",
      "Email Envoyé le",
    ];

    const sanitizeCsvCell = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""');
      // Protection anti-injection de formules Excel / Calc
      if (/^[=+\-@\t\r]/.test(str)) {
        str = "'" + str;
      }
      return `"${str}"`;
    };

    const rows = filteredProspects.map((p) => {
      const formattedRating = p.rating ? p.rating.toString().replace(".", ",") : "";
      const formattedDate = p.emailSentAt
        ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(p.emailSentAt))
        : "";

      return [
        sanitizeCsvCell(p.name),
        sanitizeCsvCell(p.activity),
        sanitizeCsvCell(p.location),
        sanitizeCsvCell(p.status),
        sanitizeCsvCell(p.identified ? "Oui" : "Non"),
        sanitizeCsvCell(p.email),
        sanitizeCsvCell(p.phone),
        sanitizeCsvCell(p.website),
        sanitizeCsvCell(formattedRating),
        sanitizeCsvCell(p.reviewCount ?? ""),
        sanitizeCsvCell(p.keyAngle),
        sanitizeCsvCell(formattedDate),
      ];
    });

    const safeCitySlug = (currentSearchInfo.city || "recherche")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_");

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `prospects_${safeCitySlug}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [prospects.length, filteredProspects, currentSearchInfo.city]);

  // Export to JSON
  const exportProspectsJSON = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredProspects, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `prospects_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [filteredProspects]);

  const contextValue = useMemo(() => ({
    prospects,
    filteredProspects,
    freelanceProfile,
    setFreelanceProfile,
    selectedProspect,
    setSelectedProspect,
    modalProspect,
    setModalProspect,
    searchLoading,
    searchError,
    clearSearchError,
    filterStatus,
    setFilterStatus,
    searchFilterText,
    setSearchFilterText,
    filterWithoutWebsite,
    setFilterWithoutWebsite,
    filterWithEmail,
    setFilterWithEmail,
    currentSearchInfo,
    gmailToken,
    userEmail,
    userId,
    isDbLoading,
    handleTokenChange,
    handleSearch,
    retryLastSearch,
    isOnline,
    handleToggleIdentified,
    handleUpdateStatus,
    handleUpdateProspect,
    handleDeleteProspect,
    undoToast,
    handleUndoDelete,
    dismissUndoToast,
    exportProspectsCSV,
    exportProspectsJSON,
  }), [
    prospects,
    filteredProspects,
    freelanceProfile,
    selectedProspect,
    modalProspect,
    searchLoading,
    searchError,
    clearSearchError,
    filterStatus,
    searchFilterText,
    filterWithoutWebsite,
    filterWithEmail,
    currentSearchInfo,
    gmailToken,
    userEmail,
    userId,
    isDbLoading,
    handleTokenChange,
    handleSearch,
    retryLastSearch,
    isOnline,
    handleToggleIdentified,
    handleUpdateStatus,
    handleUpdateProspect,
    handleDeleteProspect,
    undoToast,
    handleUndoDelete,
    dismissUndoToast,
    exportProspectsCSV,
    exportProspectsJSON,
  ]);

  return (
    <ProspectContext.Provider value={contextValue}>
      <ErrorBoundary>
        <OfflineBanner />
        {children}
      </ErrorBoundary>
    </ProspectContext.Provider>
  );
};

export function useProspects() {
  const ctx = useContext(ProspectContext);
  if (!ctx) {
    throw new Error("useProspects must be used within a ProspectProvider");
  }
  return ctx;
}
