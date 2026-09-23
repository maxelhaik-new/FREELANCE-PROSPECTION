import React, { useState } from "react";
import { 
  Map as MapIcon, 
  List as ListIcon,
  LogOut
} from "lucide-react";
import { ProspectProvider, useProspects } from "./context/ProspectContext";
import { StatsBento } from "./components/StatsBento";
import { SearchPanel } from "./components/SearchPanel";
import { ProspectList } from "./components/ProspectList";
import { ProspectDetailModal } from "./components/ProspectDetailModal";
import { GmailAuth } from "./components/GmailAuth";
import { GoogleMapView } from "./components/GoogleMapView";
import { AuthPortal } from "./components/AuthPortal";
import { PrivacyPolicy } from "./components/PrivacyPolicy";
import { TermsOfService } from "./components/TermsOfService";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface MainDashboardProps {
  onNavigate?: (path: string) => void;
}

function MainDashboard({ onNavigate }: MainDashboardProps) {
  const {
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
    retryLastSearch,
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
    handleTokenChange,
    handleSearch,
    handleToggleIdentified,
    handleUpdateStatus,
    handleUpdateProspect,
    handleDeleteProspect,
  } = useProspects();

  const [activeTab, setActiveTab] = useState<"split" | "list" | "map">(() => 
    typeof window !== "undefined" && window.innerWidth < 768 ? "list" : "split"
  );

  return (
    <div className="min-h-screen bg-canvas text-main font-sans antialiased flex flex-col">
      {/* Top Bar Header */}
      <header className="border-b border-border-subtle bg-surface/90 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-fg flex items-center justify-center font-bold text-sm shadow-primary-btn">
              P
            </div>
            <div>
              <h1 className="text-sm font-semibold text-main leading-tight tracking-tight">
                Prospection Locale
              </h1>
              <p className="text-xs text-muted">
                Sourcing Google Maps & prise de contact Gmail
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Gmail Authentication Pill */}
            <GmailAuth
              token={gmailToken}
              onTokenChange={handleTokenChange}
              userEmail={userEmail}
            />
            <button
              onClick={() => supabase.auth.signOut()}
              className="flex items-center justify-center p-2 text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* Step Pipeline Navigation */}
        <StatsBento
          prospects={prospects}
          activeFilter={filterStatus}
          onFilterSelect={setFilterStatus}
          currentSearchCount={currentSearchInfo.prospectIds.length}
        />

        {/* Bloc Recherche (3 colonnes sur ordinateur) */}
        <SearchPanel
          onSearch={handleSearch}
          loading={searchLoading}
          freelanceProfile={freelanceProfile}
          onUpdateProfile={setFreelanceProfile}
          searchError={searchError}
          onClearError={clearSearchError}
          onRetry={retryLastSearch}
        />

        {/* Layout Switcher & Active City indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-xs text-muted font-medium tracking-tight min-w-0 flex-1 truncate">
            <span>{currentSearchInfo.city}</span>
            <span className="text-muted/60 mx-1.5">·</span>
            <span>{currentSearchInfo.sector}</span>
          </div>

          <div className="inline-flex rounded-xl border border-border-subtle bg-surface p-1 text-xs shadow-micro shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all active:scale-95 cursor-pointer h-7.5 ${
                activeTab === "split"
                  ? "bg-primary text-primary-fg shadow-primary-btn font-semibold"
                  : "text-muted hover:text-main hover:bg-secondary"
              }`}
            >
              <span>Vue combinée</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all active:scale-95 cursor-pointer h-7.5 ${
                activeTab === "list"
                  ? "bg-primary text-primary-fg shadow-primary-btn font-semibold"
                  : "text-muted hover:text-main hover:bg-secondary"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all active:scale-95 cursor-pointer h-7.5 ${
                activeTab === "map"
                  ? "bg-primary text-primary-fg shadow-primary-btn font-semibold"
                  : "text-muted hover:text-main hover:bg-secondary"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Carte</span>
            </button>
          </div>
        </div>

        {/* Espace de travail sous la Recherche : Prospect (5 cols) et Carte (7 cols) */}
        <div>
          {activeTab === "split" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Bloc Prospect : 5 colonnes sur ordinateur (~42%) */}
              <div className="lg:col-span-5 min-h-[580px] h-[calc(100vh-300px)] max-h-[880px]">
                <ProspectList
                  prospects={prospects}
                  filteredProspects={filteredProspects}
                  onSelectProspect={(p) => setSelectedProspect(p)}
                  onOpenEmailModal={(p) => setModalProspect(p)}
                  onUpdateStatus={handleUpdateStatus}
                  onToggleIdentified={handleToggleIdentified}
                  onDeleteProspect={handleDeleteProspect}
                  selectedId={selectedProspect?.id || null}
                  filterStatus={filterStatus}
                  onFilterChange={setFilterStatus}
                  searchFilterText={searchFilterText}
                  onSearchFilterChange={setSearchFilterText}
                  filterWithoutWebsite={filterWithoutWebsite}
                  onFilterWithoutWebsiteChange={setFilterWithoutWebsite}
                  filterWithEmail={filterWithEmail}
                  onFilterWithEmailChange={setFilterWithEmail}
                  currentSearchQuery={{
                    city: currentSearchInfo.city,
                    sector: currentSearchInfo.sector,
                  }}
                  layoutMode="split"
                />
              </div>

              {/* Bloc Carte Google Maps : 7 colonnes sur ordinateur (~58%) */}
              <div className="lg:col-span-7 min-h-[580px] h-[calc(100vh-300px)] max-h-[880px]">
                <GoogleMapView
                  prospects={filteredProspects}
                  selectedProspect={selectedProspect}
                  onSelectProspect={(p) => setSelectedProspect(p)}
                  targetCity={currentSearchInfo.city}
                  searchSector={currentSearchInfo.sector}
                  activeFilter={filterStatus}
                  searchFilterText={searchFilterText}
                />
              </div>
            </div>
          )}

          {activeTab === "list" && (
            <div className="min-h-[580px] h-[calc(100vh-300px)] max-h-[880px]">
              <ProspectList
                prospects={prospects}
                filteredProspects={filteredProspects}
                onSelectProspect={(p) => setSelectedProspect(p)}
                onOpenEmailModal={(p) => setModalProspect(p)}
                onUpdateStatus={handleUpdateStatus}
                onToggleIdentified={handleToggleIdentified}
                onDeleteProspect={handleDeleteProspect}
                selectedId={selectedProspect?.id || null}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                searchFilterText={searchFilterText}
                onSearchFilterChange={setSearchFilterText}
                filterWithoutWebsite={filterWithoutWebsite}
                onFilterWithoutWebsiteChange={setFilterWithoutWebsite}
                filterWithEmail={filterWithEmail}
                onFilterWithEmailChange={setFilterWithEmail}
                currentSearchQuery={{
                  city: currentSearchInfo.city,
                  sector: currentSearchInfo.sector,
                }}
                layoutMode="list"
              />
            </div>
          )}

          {activeTab === "map" && (
            <div className="min-h-[580px] h-[calc(100vh-300px)] max-h-[880px]">
              <GoogleMapView
                prospects={filteredProspects}
                selectedProspect={selectedProspect}
                onSelectProspect={(p) => setSelectedProspect(p)}
                targetCity={currentSearchInfo.city}
                searchSector={currentSearchInfo.sector}
                activeFilter={filterStatus}
                searchFilterText={searchFilterText}
              />
            </div>
          )}
        </div>
      </main>

      {/* Prospect Detail Modal only when specifically triggered */}
      {modalProspect && (
        <ProspectDetailModal
          prospect={modalProspect}
          onClose={() => setModalProspect(null)}
          freelanceProfile={freelanceProfile}
          onUpdateProspect={handleUpdateProspect}
          gmailToken={gmailToken}
          userEmail={userEmail}
        />
      )}

      {/* Pied de page avec liens réglementaires */}
      <footer className="border-t border-border-subtle mt-auto py-5 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <p>© {new Date().getFullYear()} Prospection Locale — Outil de prospection B2B locale pour freelances</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate?.("/privacy")}
              className="hover:text-main underline cursor-pointer"
            >
              Politique de confidentialité
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
      </footer>
    </div>
  );
}

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [currentPath, setCurrentPath] = React.useState<string>(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname;
    }
    return "/";
  });

  const navigate = React.useCallback((path: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.provider_token) {
        sessionStorage.setItem("gmail_access_token", session.provider_token);
        if (session.user.email) {
          sessionStorage.setItem("gmail_user_email", session.user.email);
        }
      }
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        sessionStorage.setItem("gmail_access_token", session.provider_token);
        if (session.user.email) {
          sessionStorage.setItem("gmail_user_email", session.user.email);
        }
      } else if (!session) {
        sessionStorage.removeItem("gmail_access_token");
        sessionStorage.removeItem("gmail_user_email");
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Pages réglementaires publiques (accessibles sans connexion pour validation Google OAuth)
  if (currentPath === "/privacy" || currentPath === "/confidentialite") {
    return <PrivacyPolicy onBack={() => navigate("/")} onNavigate={navigate} />;
  }

  if (currentPath === "/terms" || currentPath === "/conditions") {
    return <TermsOfService onBack={() => navigate("/")} onNavigate={navigate} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AuthPortal onAuthSuccess={() => {}} onNavigate={navigate} />;
  }

  return (
    <ProspectProvider key={session.user.id} userId={session.user.id}>
      <MainDashboard onNavigate={navigate} />
    </ProspectProvider>
  );
}
