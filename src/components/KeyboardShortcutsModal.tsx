import React from "react";
import { Keyboard, Compass, Sparkles, Globe } from "lucide-react";
import { Modal } from "./ui";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  icon: React.ReactNode;
  shortcuts: ShortcutItem[];
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const shortcutCategories: ShortcutCategory[] = [
    {
      title: "Navigation dans la liste",
      icon: <Compass className="w-3.5 h-3.5 text-muted" />,
      shortcuts: [
        { keys: ["j", "↓"], description: "Sélectionner le prospect suivant" },
        { keys: ["k", "↑"], description: "Sélectionner le prospect précédent" },
      ],
    },
    {
      title: "Actions rapides",
      icon: <Sparkles className="w-3.5 h-3.5 text-muted" />,
      shortcuts: [
        { keys: ["m", "Entrée"], description: "Rédiger l'email de prospection IA" },
        { keys: ["f", "x"], description: "Retenir / basculer en sélectionné" },
      ],
    },
    {
      title: "Global & Contrôle",
      icon: <Globe className="w-3.5 h-3.5 text-muted" />,
      shortcuts: [
        { keys: ["?"], description: "Ouvrir ou fermer cette aide" },
        { keys: ["Échap"], description: "Fermer la fenêtre ou désélectionner" },
      ],
    },
  ];

  const titleNode = (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-primary text-primary-fg flex items-center justify-center shadow-primary-btn shrink-0">
        <Keyboard className="w-4 h-4 text-primary-fg" />
      </div>
      <div>
        <h3 id="shortcuts-modal-title" className="text-sm font-semibold text-main tracking-tight">
          Raccourcis clavier
        </h3>
        <p className="text-xs text-muted">
          Naviguez et traitez vos prospects sans quitter les mains du clavier
        </p>
      </div>
    </div>
  );

  const footerNode = (
    <div className="flex items-center justify-between text-xs text-muted font-sans">
      <span className="truncate">
        Désactivé automatiquement lors de la recherche dans les filtres
      </span>
      <span className="shrink-0 flex items-center gap-1 font-mono text-xs text-muted">
        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-surface-subtle border border-border-subtle rounded text-main shadow-xs">
          Échap
        </kbd>
        <span>fermer</span>
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleNode}
      maxWidth="lg"
      footer={footerNode}
      ariaLabelledBy="shortcuts-modal-title"
    >
      <div className="space-y-4">
        {shortcutCategories.map((category, catIdx) => (
          <div key={catIdx} className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-main">
              {category.icon}
              <span>{category.title}</span>
            </div>

            <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface-subtle/50 overflow-hidden">
              {category.shortcuts.map((shortcut, sIdx) => (
                <div
                  key={sIdx}
                  className="px-3.5 py-2.5 flex items-center justify-between gap-4 text-xs hover:bg-surface-subtle transition-colors"
                >
                  <span className="text-secondary-fg font-medium">
                    {shortcut.description}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {shortcut.keys.map((k, kIdx) => (
                      <React.Fragment key={kIdx}>
                        {kIdx > 0 && (
                          <span className="text-xs text-muted/70">ou</span>
                        )}
                        <kbd className="px-2 py-0.5 text-xs font-mono bg-surface border border-border-subtle rounded-md text-main shadow-xs">
                          {k}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
