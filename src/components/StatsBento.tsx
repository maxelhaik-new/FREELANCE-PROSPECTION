import React from "react";
import { Search, Clock, Send, CheckCircle2, XCircle, History } from "lucide-react";
import { Prospect } from "../types";

interface StatsBentoProps {
  prospects: Prospect[];
  activeFilter: string;
  onFilterSelect: (filter: string) => void;
  currentSearchCount?: number;
}

export const StatsBento: React.FC<StatsBentoProps> = ({
  prospects,
  activeFilter,
  onFilterSelect,
  currentSearchCount,
}) => {
  const totalCount = currentSearchCount !== undefined ? currentSearchCount : prospects.length;
  const searchedCount = prospects.filter((p) => p.status === "searched").length;
  const toContactCount = prospects.filter((p) => p.status === "to_contact").length;
  const contactedCount = prospects.filter((p) => p.status === "contacted").length;
  const interestedCount = prospects.filter((p) => p.status === "interested").length;
  const declinedCount = prospects.filter((p) => p.status === "declined").length;

  const conversionRate = contactedCount > 0 ? Math.round((interestedCount / contactedCount) * 100) : 0;

  const tabs = [
    { id: "all", label: "Tous", count: totalCount, icon: Search },
    { id: "to_contact", label: "À contacter", count: toContactCount, icon: Clock },
    { id: "contacted", label: "Contactés", count: contactedCount, icon: Send },
    { id: "interested", label: "Intéressés", count: interestedCount, icon: CheckCircle2 },
    { id: "declined", label: "Sans suite", count: declinedCount, icon: XCircle },
  ];

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-2.5 sm:p-3 shadow-micro flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Pipeline Tabs */}
      <div className="relative flex-1 min-w-0 after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0 after:w-8 after:pointer-events-none after:bg-gradient-to-l after:from-surface after:to-transparent md:after:hidden">
        <div 
          role="tablist" 
          aria-label="Filtres du pipeline"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none pr-6 md:pr-0"
        >
          {tabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onFilterSelect(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer active:scale-95 h-8.5 select-none ${
                  isActive
                    ? "bg-primary text-primary-fg shadow-primary-btn font-semibold"
                    : "text-muted hover:text-main hover:bg-secondary"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-primary-fg/80" : "text-muted"}`} />
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.2 rounded-full font-mono font-medium ${
                    isActive
                      ? "bg-primary-hover text-primary-fg"
                      : "bg-secondary text-secondary-fg"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right controls: History panel toggle & conversion rate */}
      <div className="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-border-subtle text-xs shrink-0">
        <button
          type="button"
          onClick={() => onFilterSelect(activeFilter === "searched" ? "all" : "searched")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer active:scale-95 h-8.5 select-none ${
            activeFilter === "searched"
              ? "bg-primary text-primary-fg shadow-primary-btn font-semibold"
              : "bg-secondary text-secondary-fg hover:bg-surface-subtle border border-border-subtle"
          }`}
          aria-pressed={activeFilter === "searched"}
          title="Afficher l'historique des recherches"
        >
          <History className={`w-3.5 h-3.5 ${activeFilter === "searched" ? "text-primary-fg/80" : "text-muted"}`} />
          <span>Historique</span>
          <span className={`text-xs px-1.5 py-0.2 rounded-full font-mono font-medium ${
            activeFilter === "searched" ? "bg-primary-hover text-primary-fg" : "bg-surface text-secondary-fg"
          }`}>
            {searchedCount}
          </span>
        </button>

        {contactedCount > 0 && (
          <div className="flex items-center gap-1.5 text-muted font-medium text-xs pl-2.5 border-l border-border-subtle shrink-0">
            <span>Taux de retour :</span>
            <span className="font-semibold text-main font-mono">{conversionRate}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
