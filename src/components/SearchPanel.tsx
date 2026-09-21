import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Briefcase, Sparkles, RefreshCw, UserCheck, AlertCircle, X, ChevronUp, SlidersHorizontal } from "lucide-react";
import { FreelanceProfile, SearchQuery } from "../types";
import { Button, Input, Textarea, Modal } from "./ui";

interface SearchPanelProps {
  onSearch: (query: SearchQuery, forceRefresh?: boolean) => void;
  loading: boolean;
  freelanceProfile: FreelanceProfile;
  onUpdateProfile: (profile: FreelanceProfile) => void;
  searchError?: string | null;
  onClearError?: () => void;
  onRetry?: () => void;
}

const PROFILE_PRESETS = [
  {
    name: "Développeur Web & Mobile",
    title: "Développeur Web Full-Stack & Mobile",
    services: "Création de sites sur-mesure rapides, applications web, refonte responsive, intégration réservation",
    valueProposition: "Moderniser votre outil digital pour offrir une expérience fluide sur smartphone et booster vos commandes.",
  },
  {
    name: "Consultant SEO & Visibilité Locale",
    title: "Consultant SEO Local & Google Maps",
    services: "Optimisation de fiche Google Business, référencement local, acquisition de trafic qualifié",
    valueProposition: "Positionner votre établissement dans le Top 3 Google Maps sur votre zone de chalandise pour capter les clients à proximité.",
  },
  {
    name: "Webdesigner & Refonte UI/UX",
    title: "Webdesigner & Expert Image de Marque",
    services: "Refonte d'identité visuelle, design de site web percutant, valorisation de vos créations et réalisations",
    valueProposition: "Créer une vitrine en ligne esthétique qui reflète la qualité de vos prestations et séduit vos clients.",
  },
];

const SECTOR_SUGGESTIONS = [
  "Restaurants & Brasseries",
  "Artisans du Bâtiment (Menuiserie, Plomberie, Rénovation)",
  "Cabinets de Santé (Ostéopathes, Kinés, Dentistes)",
  "Salons de Coiffure & Instituts de Beauté",
  "Commerces de Proximité & Boutiques",
  "Agences Immobilières Locales",
];

const CITY_SUGGESTIONS = [
  "Paris",
  "Lyon",
  "Marseille",
  "Nantes",
];

interface SuggestionItem {
  text: string;
  mainText: string;
  secondaryText?: string;
  placeId: string;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
  onSearch,
  loading,
  freelanceProfile,
  onUpdateProfile,
  searchError,
  onClearError,
  onRetry,
}) => {
  const [city, setCity] = useState(freelanceProfile.targetCity || "");
  const [sector, setSector] = useState(freelanceProfile.targetSector || "Restaurants & Brasseries");
  const [specialty, setSpecialty] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<SuggestionItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Prevents autocomplete fetch when city is set programmatically (suggestion pick, quick button)
  const skipFetchRef = useRef(false);

  // Debounced autocomplete via Google Places API (New) avec AbortController
  useEffect(() => {
    if (skipFetchRef.current) {
      skipFetchRef.current = false;
      return;
    }

    if (!city || city.trim().length < 2) {
      setCitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/prospects/autocomplete?q=${encodeURIComponent(city.trim())}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            if (Array.isArray(data.suggestions)) {
              setCitySuggestions(data.suggestions);
              setShowSuggestions(data.suggestions.length > 0);
            }
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.warn("Autocomplete error:", err);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [city]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent, forceRefresh = false) => {
    e.preventDefault();
    if (!city.trim() || !sector.trim()) return;
    onSearch({ city, sector, specialty }, forceRefresh);
  };

  const applyPreset = (preset: typeof PROFILE_PRESETS[0]) => {
    onUpdateProfile({
      ...freelanceProfile,
      title: preset.title,
      services: preset.services,
      valueProposition: preset.valueProposition,
    });
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  const renderProfileModal = () => (
    <Modal
      isOpen={isEditingProfile}
      onClose={() => setIsEditingProfile(false)}
      title="Profil & Signature Freelance"
      subtitle="Ces informations personnalisent l'accroche et la signature des emails rédigés par l'IA."
      maxWidth="2xl"
      ariaLabelledBy="profile-modal-title"
      footer={
        <div className="flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setIsEditingProfile(false)}>
            Enregistrer & Fermer
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Presets */}
        <div>
          <span className="text-xs font-medium text-muted block mb-1.5">
            Modèles rapides :
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PROFILE_PRESETS.map((preset) => {
              const isActive = freelanceProfile.title === preset.title;
              return (
                <Button
                  key={preset.name}
                  variant={isActive ? "primary" : "outline"}
                  size="xs"
                  onClick={() => applyPreset(preset)}
                >
                  {preset.name}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="profile-title" className="block font-medium text-main mb-1">
              Titre / Expertise
            </label>
            <Input
              id="profile-title"
              type="text"
              value={freelanceProfile.title}
              onChange={(e) => onUpdateProfile({ ...freelanceProfile, title: e.target.value })}
              placeholder="Ex: Développeur Web & SEO Local"
              inputSize="sm"
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor="profile-services" className="block font-medium text-main mb-1">
              Services proposés
            </label>
            <Input
              id="profile-services"
              type="text"
              value={freelanceProfile.services}
              onChange={(e) => onUpdateProfile({ ...freelanceProfile, services: e.target.value })}
              placeholder="Ex: Refonte de site, Click & Collect, fiche Google"
              inputSize="sm"
              maxLength={250}
            />
          </div>
          <div>
            <label htmlFor="profile-value-prop" className="block font-medium text-main mb-1">
              Proposition de valeur
            </label>
            <Textarea
              id="profile-value-prop"
              rows={3}
              value={freelanceProfile.valueProposition}
              onChange={(e) => onUpdateProfile({ ...freelanceProfile, valueProposition: e.target.value })}
              className="resize-none"
              placeholder="Ex: J'aide les commerces locaux à doubler leurs réservations"
              maxLength={400}
            />
          </div>
          <div>
            <label htmlFor="profile-signature" className="block font-medium text-main mb-1">
              Signature email
            </label>
            <Textarea
              id="profile-signature"
              rows={3}
              value={freelanceProfile.signature || ""}
              onChange={(e) => onUpdateProfile({ ...freelanceProfile, signature: e.target.value })}
              className="resize-none font-mono"
              placeholder="Bien cordialement,\nVotre Nom - Consultant Web"
              maxLength={500}
            />
          </div>
        </div>
      </div>
    </Modal>
  );

  if (isCollapsed) {
    return (
      <div className="bg-surface border border-border-subtle rounded-2xl px-4 py-3 shadow-micro flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 bg-secondary rounded-xl text-secondary-fg shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-main truncate">
              {city || "Toutes zones"}
            </span>
            <span className="text-muted/60">·</span>
            <span className="text-muted truncate">{sector}</span>
            {specialty && (
              <>
                <span className="text-muted/60">·</span>
                <span className="text-muted italic truncate">{specialty}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setIsEditingProfile(true)}
            leftIcon={<SlidersHorizontal className="w-3 h-3 text-muted" />}
            title="Modifier mon profil et ma signature"
          >
            <span className="hidden sm:inline">Profil</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="xs"
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />}
            title="Actualiser la recherche"
            aria-label="Actualiser la recherche"
          >
            <span>Actualiser</span>
          </Button>
          <Button
            type="button"
            variant="primary"
            size="xs"
            onClick={() => setIsCollapsed(false)}
            aria-label="Modifier la recherche"
          >
            <span>Modifier</span>
          </Button>
        </div>

        {renderProfileModal()}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-4 sm:p-5 shadow-micro">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-secondary rounded-xl text-secondary-fg">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-main tracking-tight">Recherche</h2>
              <p className="text-xs text-muted">Google Maps & web</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingProfile(true)}
              leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-secondary-fg" />}
              aria-haspopup="dialog"
            >
              <span>Profil & Signature</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              leftIcon={<ChevronUp className="w-3.5 h-3.5 text-muted" />}
              title="Réduire le panneau de recherche"
              aria-label="Réduire le panneau de recherche"
            >
              <span className="hidden sm:inline">Réduire</span>
            </Button>
          </div>
        </div>

        {renderProfileModal()}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            {/* Colonne 1 : Ville ou zone */}
            <div className="flex flex-col justify-between">
              <div ref={wrapperRef} className="relative">
                <label htmlFor="search-city" className="sr-only">
                  Ville ou zone
                </label>
                <Input
                  id="search-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onFocus={() => {
                    if (citySuggestions.length > 0) setShowSuggestions(true);
                  }}
                  required
                  maxLength={100}
                  leftIcon={<MapPin className="w-3.5 h-3.5" />}
                  placeholder="Ville ou zone (ex: Paris, Lyon...)"
                />

                {showSuggestions && citySuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-border-subtle rounded-xl shadow-lg z-50 overflow-hidden py-1 max-h-56 overflow-y-auto">
                    {citySuggestions.map((item, idx) => (
                      <button
                        key={item.placeId || idx}
                        type="button"
                        onClick={() => {
                          skipFetchRef.current = true;
                          setCity(item.mainText || item.text);
                          setCitySuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-secondary flex items-center justify-between text-main transition-colors"
                      >
                        <span className="font-medium">{item.mainText}</span>
                        {item.secondaryText && (
                          <span className="text-xs text-muted truncate max-w-[140px] ml-2">
                            {item.secondaryText}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggestions rapides de ville */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {CITY_SUGGESTIONS.map((c) => {
                  const isSelected = city.toLowerCase() === c.toLowerCase();
                  return (
                    <Button
                      key={c}
                      variant={isSelected ? "primary" : "secondary"}
                      size="xs"
                      onClick={() => { skipFetchRef.current = true; setCity(c); setShowSuggestions(false); }}
                    >
                      {c}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Colonne 2 : Secteur d'activité */}
            <div className="flex flex-col justify-between">
              <div>
                <label htmlFor="search-sector" className="sr-only">
                  Secteur d'activité
                </label>
                <Input
                  id="search-sector"
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  required
                  maxLength={100}
                  leftIcon={<Briefcase className="w-3.5 h-3.5" />}
                  placeholder="Activité (ex: Restaurants)"
                />
              </div>

              {/* Suggestions rapides de secteur */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SECTOR_SUGGESTIONS.slice(0, 3).map((sec) => {
                  const isSelected = sector === sec;
                  return (
                    <Button
                      key={sec}
                      variant={isSelected ? "primary" : "secondary"}
                      size="xs"
                      onClick={() => setSector(sec)}
                    >
                      {sec.split(" (")[0]}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Colonne 3 : Spécificité & Lancement de recherche */}
            <div className="flex flex-col justify-between h-full">
              <div>
                <label htmlFor="search-specialty" className="sr-only">
                  Spécificité (optionnel)
                </label>
                <Input
                  id="search-specialty"
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  maxLength={150}
                  placeholder="Critères (ex: sans site, mal noté)"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  loading={loading}
                  leftIcon={!loading && <Sparkles className="w-4 h-4 text-amber-300" />}
                  className="flex-1"
                >
                  {loading ? "Recherche..." : "Rechercher"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  size="icon-md"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  title="Forcer l'actualisation"
                  aria-label="Actualiser la recherche"
                >
                  <RefreshCw className="w-4 h-4 text-secondary-fg" />
                </Button>
              </div>
            </div>
          </div>

          {searchError && (
            <div role="alert" className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start justify-between gap-2">
              <div className="flex items-start gap-1.5 min-w-0 flex-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="break-words leading-tight">{searchError}</span>
                  {onRetry && (
                    <div>
                      <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 text-rose-900 hover:text-rose-950 cursor-pointer pt-0.5"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Réessayer
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {onClearError && (
                <button
                  type="button"
                  onClick={onClearError}
                  className="text-rose-500 hover:text-rose-800 p-0.5 cursor-pointer shrink-0"
                  aria-label="Fermer le message"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
