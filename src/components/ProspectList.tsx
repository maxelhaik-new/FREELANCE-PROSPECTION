import React, { useEffect, useRef, useState } from "react";
import { 
  MapPin, 
  Star, 
  Trash2, 
  Heart, 
  Mail, 
  Search, 
  Check,
  FileSpreadsheet,
  RotateCcw,
  X,
  Phone,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Prospect, ProspectStatus } from "../types";
import { useProspects } from "../context/ProspectContext";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { Button, Input, Select, Badge } from "./ui";

interface ProspectListProps {
  prospects: Prospect[];
  filteredProspects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
  onOpenEmailModal: (prospect: Prospect) => void;
  onUpdateStatus: (id: string, status: ProspectStatus) => void;
  onToggleIdentified: (id: string) => void;
  onDeleteProspect: (id: string) => void;
  selectedId: string | null;
  filterStatus: string;
  onFilterChange: (status: string) => void;
  searchFilterText: string;
  onSearchFilterChange: (text: string) => void;
  filterWithoutWebsite: boolean;
  onFilterWithoutWebsiteChange: (val: boolean) => void;
  filterWithEmail: boolean;
  onFilterWithEmailChange: (val: boolean) => void;
  currentSearchQuery?: { city: string; sector: string } | null;
  layoutMode?: "split" | "list";
}

export const ProspectList: React.FC<ProspectListProps> = ({
  prospects,
  filteredProspects,
  onSelectProspect,
  onOpenEmailModal,
  onUpdateStatus,
  onToggleIdentified,
  onDeleteProspect,
  selectedId,
  filterStatus,
  searchFilterText,
  onSearchFilterChange,
  filterWithoutWebsite,
  onFilterWithoutWebsiteChange,
  filterWithEmail,
  onFilterWithEmailChange,
  currentSearchQuery,
  layoutMode = "split",
}) => {
  const { undoToast, handleUndoDelete, dismissUndoToast, exportProspectsCSV, setSelectedProspect, currentSearchInfo } = useProspects();
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [copiedField, setCopiedField] = useState<{ id: string; field: "phone" | "email" } | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Historique de recherche contextuel
  const searchedProspects = prospects.filter((p) => p.status === "searched");
  const uniqueHistoryLocations = Array.from(
    new Set(
      searchedProspects
        .map((p) => (p.location || "").split("(")[0].trim())
        .filter(Boolean)
    )
  );

  // Navigation clavier Power-User (j/k, m/Entrée, f/x, ?, Échap)
  useKeyboardShortcuts({
    filteredProspects,
    selectedId,
    onSelectProspect,
    onOpenEmailModal,
    onToggleIdentified,
    isShortcutsOpen,
    onToggleShortcuts: () => setIsShortcutsOpen((prev) => !prev),
    onCloseShortcuts: () => setIsShortcutsOpen(false),
    onDeselect: () => setSelectedProspect(null),
  });

  // Scroll to selected card
  useEffect(() => {
    if (selectedId) {
      const el = itemRefs.current.get(selectedId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedId]);

  const handleCopySingle = (id: string, text: string, field: "phone" | "email", e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedField({ id, field });
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-micro flex flex-col h-full">
      {/* Undo Toast Banner */}
      <AnimatePresence>
        {undoToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            role="status"
            aria-live="polite"
            className="mb-3 p-3 bg-primary text-primary-fg rounded-xl text-xs flex items-center justify-between gap-3 shadow-xl"
          >
            <span className="font-medium truncate min-w-0 flex-1">{undoToast.message}</span>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="xs"
                onClick={handleUndoDelete}
                leftIcon={<RotateCcw className="w-3 h-3" />}
                className="font-semibold text-main bg-surface hover:bg-secondary"
              >
                Annuler
              </Button>
              <button
                type="button"
                onClick={dismissUndoToast}
                className="p-1 text-primary-fg/70 hover:text-primary-fg transition-colors cursor-pointer"
                aria-label="Fermer le message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Title and CSV Export */}
      <div className="flex flex-col gap-2.5 pb-3 border-b border-border-subtle">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 shrink-0">
            <h2 className="text-sm font-semibold text-main tracking-tight whitespace-nowrap">
              Prospects
            </h2>
            <span className="text-xs text-muted font-mono font-medium whitespace-nowrap">
              {filteredProspects.length} sur {filterStatus === "all" && currentSearchInfo?.prospectIds?.length ? currentSearchInfo.prospectIds.length : prospects.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsShortcutsOpen(true)}
              title="Afficher les raccourcis clavier (?)"
              aria-label="Afficher les raccourcis clavier"
              leftIcon={
                <kbd className="px-1.5 py-0.5 text-xs font-mono bg-surface-subtle border border-border-subtle rounded text-muted shadow-2xs">
                  ?
                </kbd>
              }
            >
              <span className={layoutMode === "split" ? "hidden xl:inline" : "hidden sm:inline"}>
                Raccourcis
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={exportProspectsCSV}
              disabled={filteredProspects.length === 0}
              leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              title="Exporter au format CSV"
              aria-label="Exporter les prospects au format CSV"
            >
              <span className="whitespace-nowrap">Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Search Input & Quick Attribute Checkboxes */}
        <div className={`flex ${layoutMode === "split" ? "flex-col gap-2" : "flex-col sm:flex-row sm:items-center justify-between gap-2.5"} text-xs`}>
          <div className="relative flex-1 min-w-0">
            <label htmlFor="prospect-search-input" className="sr-only">Rechercher un prospect</label>
            <Input
              id="prospect-search-input"
              type="text"
              value={searchFilterText}
              onChange={(e) => onSearchFilterChange(e.target.value)}
              placeholder="Rechercher par nom ou activité..."
              maxLength={100}
              leftIcon={<Search className="w-3.5 h-3.5 text-muted" />}
              rightElement={
                searchFilterText ? (
                  <button
                    type="button"
                    onClick={() => onSearchFilterChange("")}
                    className="text-muted hover:text-main p-0.5 rounded cursor-pointer"
                    title="Effacer la recherche"
                    aria-label="Effacer la recherche"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : undefined
              }
              inputSize="sm"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-muted shrink-0 font-medium">
            <label htmlFor="filter-no-website" className="inline-flex items-center gap-1.5 cursor-pointer select-none py-0.5 hover:text-main transition-colors">
              <input
                id="filter-no-website"
                type="checkbox"
                checked={filterWithoutWebsite}
                onChange={(e) => onFilterWithoutWebsiteChange(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border-strong text-primary accent-primary focus:ring-0 cursor-pointer"
              />
              <span className="whitespace-nowrap">Sans site</span>
            </label>

            <label htmlFor="filter-with-email" className="inline-flex items-center gap-1.5 cursor-pointer select-none py-0.5 hover:text-main transition-colors">
              <input
                id="filter-with-email"
                type="checkbox"
                checked={filterWithEmail}
                onChange={(e) => onFilterWithEmailChange(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-border-strong text-primary accent-primary focus:ring-0 cursor-pointer"
              />
              <span className="whitespace-nowrap">Avec email</span>
            </label>
          </div>
        </div>
      </div>

      {/* Contextual History Banner when viewing search history */}
      {filterStatus === "searched" && (
        <div className="mt-2.5 p-3 bg-surface-subtle border border-border-subtle rounded-xl space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-main min-w-0">
              <History className="w-3.5 h-3.5 text-muted shrink-0" />
              <span className="truncate">Historique des recherches ({searchedProspects.length} en attente)</span>
            </div>
            {searchFilterText && (
              <button
                type="button"
                onClick={() => onSearchFilterChange("")}
                className="text-xs text-muted hover:text-main underline cursor-pointer shrink-0"
              >
                Réinitialiser le filtre
              </button>
            )}
          </div>
          <p className="text-muted text-xs leading-relaxed">
            Naviguez dans vos recherches cumulées. Cliquez sur le cœur pour retenir une opportunité et la basculer dans <strong>À contacter</strong>.
          </p>
          {uniqueHistoryLocations.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-muted font-medium text-xs shrink-0">Villes :</span>
              <button
                type="button"
                onClick={() => onSearchFilterChange("")}
                className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  !searchFilterText
                    ? "bg-primary text-primary-fg"
                    : "bg-surface border border-border-subtle text-muted hover:bg-secondary"
                }`}
              >
                Toutes ({searchedProspects.length})
              </button>
              {uniqueHistoryLocations.map((loc) => {
                const count = searchedProspects.filter((p) =>
                  (p.location || "").toLowerCase().includes(loc.toLowerCase())
                ).length;
                const isCurrent = searchFilterText.toLowerCase() === loc.toLowerCase();
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => onSearchFilterChange(isCurrent ? "" : loc)}
                    className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                      isCurrent
                        ? "bg-primary text-primary-fg"
                        : "bg-surface border border-border-subtle text-muted hover:bg-secondary"
                    }`}
                  >
                    {loc} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Prospect cards list */}
      <div 
        role="region"
        aria-label="Liste des fiches prospects"
        className="mt-3 space-y-2.5 overflow-y-auto pr-1 scroll-smooth flex-1 min-h-0"
      >
        {filteredProspects.length === 0 ? (
          <div className="py-16 text-center text-muted text-xs flex flex-col items-center justify-center gap-2">
            <div className="p-3 bg-surface-subtle rounded-2xl border border-border-subtle text-muted shadow-micro">
              {filterStatus === "searched" ? (
                <History className="w-5 h-5 text-muted" />
              ) : filterStatus === "identified" ? (
                <Heart className="w-5 h-5 text-emerald-600" />
              ) : (
                <Search className="w-5 h-5 text-muted" />
              )}
            </div>
            <p className="max-w-[240px] leading-relaxed">
              {filterStatus === "searched"
                ? "Aucun prospect en attente dans l'historique de recherche. Lancez une recherche pour alimenter votre vivier."
                : filterStatus === "identified"
                ? "Aucun prospect sélectionné. Cliquez sur le cœur pour retenir vos cibles."
                : filterStatus === "all" && currentSearchInfo.city && currentSearchInfo.prospectIds.length === 0
                ? `Aucun établissement trouvé pour « ${currentSearchInfo.sector} » à ${currentSearchInfo.city}. Essayez d'élargir vos critères.`
                : filterStatus === "all" && !currentSearchInfo.city && currentSearchInfo.prospectIds.length === 0
                ? "Aucune recherche en cours. Lancez une recherche par ville et secteur ci-dessus, ou consultez votre Historique."
                : "Aucun prospect ne correspond à ces critères."}
            </p>
          </div>
        ) : (
          filteredProspects.map((prospect) => {
            const isSelected = selectedId === prospect.id;
            const isLiked = prospect.status === "to_contact" || (prospect.identified && prospect.status !== "searched");
            const showLikeButton =
              filterStatus === "searched" ||
              filterStatus === "to_contact" ||
              (filterStatus === "all" && (prospect.status === "searched" || prospect.status === "to_contact"));
            const isKanbanStage = filterStatus !== "all" && filterStatus !== "searched";

            return (
              <div
                key={prospect.id}
                data-prospect-id={prospect.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(prospect.id, el);
                  else itemRefs.current.delete(prospect.id);
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`${prospect.name}, ${prospect.activity}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectProspect(prospect);
                  }
                }}
                onClick={() => onSelectProspect(prospect)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-primary flex flex-col gap-2.5 active:scale-[0.99] relative ${
                  isSelected
                    ? "border-primary bg-surface-subtle ring-2 ring-primary/10 shadow-micro"
                    : "border-border-subtle hover:border-border-strong bg-surface shadow-micro"
                }`}
              >
                {/* Header: Title + Bookmark + Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      {isSelected && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-primary shadow-glow-zinc shrink-0 animate-pulse"
                          title="Prospect sélectionné au clavier"
                          aria-hidden="true"
                        />
                      )}
                      <h3 className="font-semibold text-sm text-main truncate tracking-tight min-w-0 flex-1">
                        {prospect.name}
                      </h3>
                      {prospect.generatedEmail && (
                        <Badge variant="purple" size="sm" className="shrink-0 whitespace-nowrap">
                          Email prêt
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {prospect.activity}
                    </p>
                  </div>

                  {/* Top Right Quick Actions */}
                  <div className="flex items-center gap-1 shrink-0 -mr-1 -mt-1">
                    {showLikeButton && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleIdentified(prospect.id);
                        }}
                        className={
                          isLiked
                            ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700"
                            : "text-muted hover:text-emerald-600"
                        }
                        aria-label={isLiked ? "Retirer de À contacter" : "Ajouter à À contacter"}
                        title={isLiked ? "Retirer de À contacter (renvoyer vers l'historique)" : "Retenir pour À contacter"}
                      >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-emerald-600" : ""}`} />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProspect(prospect.id);
                      }}
                      className="text-muted hover:text-rose-600"
                      title="Supprimer"
                      aria-label={`Supprimer ${prospect.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Row 2: Location, Rating, Website info */}
                <div className="flex items-center gap-2.5 text-xs text-muted font-medium w-full">
                  <span className="flex items-center gap-1 truncate flex-1 min-w-0">
                    <MapPin className="w-3 h-3 text-muted shrink-0" />
                    <span className="truncate">{prospect.location}</span>
                  </span>

                  {prospect.rating ? (
                    <span className="flex items-center gap-1 shrink-0 text-amber-700 font-medium whitespace-nowrap">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                      <span className="font-mono whitespace-nowrap">{prospect.rating}</span>
                      {prospect.reviewCount ? (
                        <span className="text-muted text-xs font-mono">({prospect.reviewCount})</span>
                      ) : null}
                    </span>
                  ) : null}

                  {prospect.website ? (
                    <a
                      href={prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-700 hover:text-blue-800 hover:underline shrink-0 text-xs ml-auto font-medium whitespace-nowrap"
                      title="Ouvrir le site web"
                    >
                      Site web ↗
                    </a>
                  ) : (
                    <span className="text-muted text-xs italic shrink-0 ml-auto whitespace-nowrap">Sans site</span>
                  )}
                </div>

                {/* Row 2.5: Direct Phone & Email Badges with animated copy feedback */}
                {(prospect.phone || prospect.email) && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
                    {prospect.phone && (
                      <div className="relative inline-flex shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleCopySingle(prospect.id, prospect.phone!, "phone", e)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-secondary hover:bg-surface-subtle text-secondary-fg hover:text-main border border-border-subtle text-xs font-mono transition-all active:scale-95 cursor-pointer group whitespace-nowrap"
                          title="Cliquer pour copier le numéro"
                          aria-label={`Copier le téléphone : ${prospect.phone}`}
                        >
                          <Phone className="w-3 h-3 text-muted group-hover:text-secondary-fg shrink-0" />
                          <span>{prospect.phone}</span>
                        </button>
                        <AnimatePresence>
                          {copiedField?.id === prospect.id && copiedField.field === "phone" && (
                            <motion.span
                              initial={{ opacity: 0, y: 4, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.9 }}
                              transition={{ duration: 0.15 }}
                              className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-fg text-xs font-medium rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20 flex items-center gap-1"
                            >
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                              Téléphone copié !
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {prospect.email && (
                      <div className="relative inline-flex min-w-0 max-w-full">
                        <button
                          type="button"
                          onClick={(e) => handleCopySingle(prospect.id, prospect.email!, "email", e)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-secondary hover:bg-surface-subtle text-secondary-fg hover:text-main border border-border-subtle text-xs font-mono transition-all active:scale-95 cursor-pointer group truncate max-w-full"
                          title="Cliquer pour copier l'email"
                          aria-label={`Copier l'email : ${prospect.email}`}
                        >
                          <Mail className="w-3 h-3 text-muted group-hover:text-secondary-fg shrink-0" />
                          <span className="truncate min-w-0">{prospect.email}</span>
                        </button>
                        <AnimatePresence>
                          {copiedField?.id === prospect.id && copiedField.field === "email" && (
                            <motion.span
                              initial={{ opacity: 0, y: 4, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.9 }}
                              transition={{ duration: 0.15 }}
                              className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-fg text-xs font-medium rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20 flex items-center gap-1"
                            >
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                              Email copié !
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}

                {/* Row 3: Opportunity Angle (distilled, no nested card, height auto, no text clipping) */}
                {prospect.keyAngle && (
                  <p className="text-xs text-muted leading-relaxed bg-canvas/80 px-2.5 py-2 rounded-xl border border-border-subtle break-words h-auto">
                    <span className="font-semibold text-main">Piste : </span>
                    {prospect.keyAngle}
                  </p>
                )}

                {/* Row 4: Card Footer (Status Selector + Secondary & Primary Actions) */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border-subtle">
                  {isKanbanStage ? (
                    <div onClick={(e) => e.stopPropagation()} className="shrink-0 max-w-[135px]">
                      <label htmlFor={`status-select-${prospect.id}`} className="sr-only">
                        Statut de {prospect.name}
                      </label>
                      <Select
                        id={`status-select-${prospect.id}`}
                        statusVariant={prospect.status}
                        value={prospect.status}
                        onChange={(e) => onUpdateStatus(prospect.id, e.target.value as ProspectStatus)}
                      >
                        <option value="to_contact">À contacter</option>
                        <option value="contacted">Contacté</option>
                        <option value="interested">Intéressé</option>
                        <option value="declined">Sans suite</option>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {prospect.status === "searched" ? (
                        <Badge variant="neutral" size="sm" className="whitespace-nowrap">Recherché</Badge>
                      ) : prospect.status === "to_contact" ? (
                        <Badge variant="amber" size="sm" className="whitespace-nowrap">À contacter</Badge>
                      ) : prospect.status === "contacted" ? (
                        <Badge variant="blue" size="sm" className="whitespace-nowrap">Contacté</Badge>
                      ) : prospect.status === "interested" ? (
                        <Badge variant="emerald" size="sm" className="whitespace-nowrap">Intéressé</Badge>
                      ) : (
                        <Badge variant="neutral" size="sm" className="whitespace-nowrap">Sans suite</Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center shrink-0 ml-auto">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEmailModal(prospect);
                      }}
                      leftIcon={<Mail className="w-3.5 h-3.5 text-primary-fg/80 shrink-0" />}
                      className="whitespace-nowrap"
                      title="Rédiger l'email personnalisé"
                      aria-label={`Rédiger l'email personnalisé pour ${prospect.name}`}
                    >
                      <span>Mail IA</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal d'aide des raccourcis clavier */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};
