import { useEffect } from "react";
import { Prospect } from "../types";

export interface UseKeyboardShortcutsOptions {
  filteredProspects: Prospect[];
  selectedId: string | null;
  onSelectProspect: (prospect: Prospect) => void;
  onOpenEmailModal: (prospect: Prospect) => void;
  onToggleIdentified: (id: string) => void;
  isShortcutsOpen: boolean;
  onToggleShortcuts: () => void;
  onCloseShortcuts: () => void;
  onDeselect?: () => void;
  enabled?: boolean;
}

/**
 * Hook de navigation clavier power-user pour la liste des prospects.
 * 
 * Raccourcis pris en charge :
 * - j / Flèche Bas : Prospect suivant
 * - k / Flèche Haut : Prospect précédent
 * - m / Entrée : Ouvrir modal email IA pour le prospect actif
 * - f / x : Basculer favori / retenu (shortlist)
 * - ? : Ouvrir / fermer le modal des raccourcis
 * - Échap : Fermer le modal d'aide ou désélectionner
 */
export function useKeyboardShortcuts({
  filteredProspects,
  selectedId,
  onSelectProspect,
  onOpenEmailModal,
  onToggleIdentified,
  isShortcutsOpen,
  onToggleShortcuts,
  onCloseShortcuts,
  onDeselect,
  enabled = true,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ignorer si l'utilisateur est en cours de saisie
      const target = e.target as HTMLElement | null;
      const isEditing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isEditing) {
        // Échap quitte le champ de saisie pour revenir à la navigation clavier
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      // 2. Ignorer si des touches modificatrices sont actives (Cmd, Ctrl, Alt)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      const key = e.key.toLowerCase();

      // ? : Basculer la modal des raccourcis clavier
      if (e.key === "?") {
        e.preventDefault();
        onToggleShortcuts();
        return;
      }

      // Escape : Fermer la modal des raccourcis ou désélectionner
      if (key === "escape") {
        if (isShortcutsOpen) {
          e.preventDefault();
          onCloseShortcuts();
        } else if (selectedId && onDeselect) {
          e.preventDefault();
          onDeselect();
        }
        return;
      }

      // Si la modal des raccourcis est ouverte, ne pas exécuter les actions de liste
      if (isShortcutsOpen) {
        return;
      }

      // j ou Flèche Bas : Prospect suivant
      if (key === "j" || key === "arrowdown") {
        if (filteredProspects.length === 0) return;
        e.preventDefault();
        const currentIndex = filteredProspects.findIndex((p) => p.id === selectedId);
        if (currentIndex === -1) {
          onSelectProspect(filteredProspects[0]);
        } else if (currentIndex < filteredProspects.length - 1) {
          onSelectProspect(filteredProspects[currentIndex + 1]);
        }
        return;
      }

      // k ou Flèche Haut : Prospect précédent
      if (key === "k" || key === "arrowup") {
        if (filteredProspects.length === 0) return;
        e.preventDefault();
        const currentIndex = filteredProspects.findIndex((p) => p.id === selectedId);
        if (currentIndex === -1) {
          onSelectProspect(filteredProspects[filteredProspects.length - 1]);
        } else if (currentIndex > 0) {
          onSelectProspect(filteredProspects[currentIndex - 1]);
        }
        return;
      }

      // m ou Entrée : Ouvrir modal email de prospection
      if (key === "m" || key === "enter") {
        if (filteredProspects.length === 0) return;
        const current = filteredProspects.find((p) => p.id === selectedId);
        if (current) {
          e.preventDefault();
          onOpenEmailModal(current);
        }
        return;
      }

      // f ou x : Basculer favori / shortlist
      if (key === "f" || key === "x") {
        if (filteredProspects.length === 0) return;
        const current = filteredProspects.find((p) => p.id === selectedId);
        if (current) {
          e.preventDefault();
          onToggleIdentified(current.id);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    enabled,
    filteredProspects,
    selectedId,
    onSelectProspect,
    onOpenEmailModal,
    onToggleIdentified,
    isShortcutsOpen,
    onToggleShortcuts,
    onCloseShortcuts,
    onDeselect,
  ]);
}
