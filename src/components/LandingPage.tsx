import React from "react";
import {
  ArrowRight,
  MapPin,
  Mail,
  Sparkles,
  ShieldCheck,
  Search,
  Eye,
  CheckCircle2,
  ChevronRight
} from "lucide-react";
import { Button } from "./ui/Button";
import { motion } from "motion/react";

/* ─── Types ─────────────────────────────────────── */

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

/* ─── Scroll-animated Section ────────────────────── */

function FadeInSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ type: "spring", stiffness: 80, damping: 20, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────── */

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-canvas text-main font-sans antialiased overflow-x-hidden">
      
      {/* ── Header ───────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 h-16 bg-canvas/80 backdrop-blur-xl border-b border-border-subtle z-50 flex items-center justify-between px-6 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-accent text-accent-fg flex items-center justify-center font-bold text-sm shadow-micro">
            FP
          </div>
          <span className="font-semibold text-main tracking-tight">
            Freelance Prospection
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate("/auth")}
            className="text-sm font-medium text-muted hover:text-main transition-colors hidden sm:block"
          >
            Connexion
          </button>
          <Button
            onClick={() => onNavigate("/auth")}
            size="sm"
            className="bg-accent text-accent-fg hover:bg-accent-hover shadow-primary-btn"
          >
            Démarrer
          </Button>
        </div>
      </header>

      <main className="relative z-10 pt-32">
        {/* ═══════════ HERO ═══════════════════════ */}
        <section className="px-6 mb-24 max-w-6xl mx-auto">
          <div className="text-center space-y-10 flex flex-col items-center">
            
            <FadeInSection>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-subtle border border-accent/20 text-sm font-semibold text-accent">
                <Sparkles className="w-4 h-4" />
                <span>Nouveau : Le moteur de prospection local B2B</span>
              </div>
            </FadeInSection>

            <FadeInSection delay={0.1}>
              <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-main leading-[1] max-w-5xl text-balance mx-auto">
                Trouvez vos clients.
                <br />
                <span className="text-muted font-bold">Pas des leads.</span>
              </h1>
            </FadeInSection>

            <FadeInSection delay={0.15}>
              <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto text-balance leading-relaxed">
                La plateforme qui aide les freelances à sourcer des entreprises locales, 
                détecter leurs besoins numériques, et envoyer des e-mails ultra-personnalisés 
                depuis leur propre compte Gmail.
              </p>
            </FadeInSection>

            <FadeInSection delay={0.2} className="w-full flex flex-col items-center gap-8">
              <button
                onClick={() => onNavigate("/auth")}
                className="group relative inline-flex items-center justify-center h-14 px-8 rounded-2xl bg-accent text-accent-fg font-semibold text-lg shadow-primary-btn hover:bg-accent-hover transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-accent"
              >
                Commencer gratuitement
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted">
                <div className="flex -space-x-2">
                  {['A', 'L', 'M', 'C', 'S'].map((initial, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-canvas bg-accent-subtle text-accent font-bold flex items-center justify-center text-xs shadow-micro">
                      {initial}
                    </div>
                  ))}
                </div>
                <span>Rejoignez plus de <strong>500 freelances</strong> francophones</span>
              </div>
            </FadeInSection>

            {/* ── Hero Mockup ─────────────────────── */}
            <FadeInSection delay={0.3} className="w-full mt-16 max-w-[900px] mx-auto">
              {/* Conteneur avec ratio respecté pour éviter que l'image ne soit floue (trop étirée) */}
              <div className="relative rounded-2xl overflow-hidden border border-border-subtle shadow-2xl bg-surface mx-auto">
                {/* Browser-like header */}
                <div className="h-12 border-b border-border-subtle bg-surface-subtle flex items-center px-4 gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-border-strong opacity-50" />
                    <div className="w-3 h-3 rounded-full bg-border-strong opacity-50" />
                    <div className="w-3 h-3 rounded-full bg-border-strong opacity-50" />
                  </div>
                  <div className="ml-4 px-4 py-1.5 rounded-md bg-canvas border border-border-subtle text-xs text-muted flex-1 max-w-sm mx-auto flex items-center justify-center gap-2 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    freelance-prospection.app
                  </div>
                </div>
                <div className="bg-canvas p-1 md:p-2">
                  <img
                    src="/hero-mockup.png"
                    alt="Aperçu de l'interface"
                    className="w-full h-auto object-contain rounded-xl border border-border-subtle shadow-sm"
                    loading="eager"
                  />
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ═══════════ FEATURE 1: FULL BLEED ════════════ */}
        <section className="bg-surface-subtle border-y border-border-subtle py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-6">
            <FadeInSection>
              <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
                <div className="space-y-8 order-2 md:order-1">
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle shadow-micro flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-main tracking-tight">
                      Sourcing ciblé sur Google Maps
                    </h2>
                    <p className="text-lg text-muted leading-relaxed">
                      Trouvez vos clients locaux en quelques secondes. Recherchez par métier 
                      et ville, la plateforme agrège les contacts publics instantanément : 
                      nom, adresse, téléphone, email, et note Google.
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {["Recherche instantanée et illimitée", "Agrégation des données de contact directes", "Analyse de la réputation Google"].map((text, i) => (
                      <li key={i} className="flex items-start gap-3 text-main font-medium">
                        <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 md:order-2">
                  <div className="relative rounded-2xl border border-border-subtle bg-surface p-8 shadow-micro">
                    <div className="space-y-5">
                      <div className="h-12 bg-canvas border border-border-subtle rounded-xl flex items-center px-4 gap-3 shadow-sm">
                        <Search className="w-5 h-5 text-accent" />
                        <span className="text-main font-medium">Plombier Marseille</span>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-canvas border border-border-subtle rounded-xl p-5 flex gap-4 transition-all hover:border-accent/30 cursor-pointer">
                            <div className="w-12 h-12 rounded-lg bg-surface-subtle border border-border-subtle flex-shrink-0" />
                            <div className="space-y-3 flex-1 pt-1">
                              <div className="h-4 w-3/4 bg-border-strong/30 rounded-md" />
                              <div className="h-3 w-1/2 bg-border-subtle rounded-md" />
                            </div>
                            <ChevronRight className="w-5 h-5 text-border-strong self-center" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ═══════════ FEATURE 2 ════════════ */}
        <section className="bg-canvas py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-6">
            <FadeInSection>
              <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
                <div>
                  <div className="relative rounded-2xl border border-border-subtle bg-surface-subtle p-8 overflow-hidden shadow-micro">
                    <div className="bg-surface border border-border-subtle rounded-xl p-8 space-y-8 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-full bg-accent-subtle text-accent flex items-center justify-center font-bold">
                          O
                        </div>
                        <div className="px-3 py-1.5 bg-accent-subtle text-accent border border-accent/20 rounded-full text-sm font-semibold tracking-wide">
                          Opportunité
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                          <span className="text-muted font-medium">Site Web</span>
                          <span className="text-main font-bold">Aucun site détecté</span>
                        </div>
                        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                          <span className="text-muted font-medium">Avis Google</span>
                          <span className="text-main font-bold">3.2 / 5 (12 avis)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted font-medium">Coordonnées</span>
                          <span className="text-main font-bold">Email public trouvé</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle shadow-micro flex items-center justify-center">
                    <Eye className="w-7 h-7 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-main tracking-tight">
                      Qualification intelligente
                    </h2>
                    <p className="text-lg text-muted leading-relaxed">
                      Ne perdez plus de temps à analyser manuellement chaque profil. 
                      Repérez immédiatement les entreprises sans site web ou celles 
                      dont la fiche Google n'est pas optimisée.
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {["Détection des sites manquants ou non sécurisés", "Analyse du volume et de la qualité des avis", "Identification immédiate de l'angle d'approche"].map((text, i) => (
                      <li key={i} className="flex items-start gap-3 text-main font-medium">
                        <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ═══════════ FEATURE 3: FULL BLEED ════════════ */}
        <section className="bg-surface-subtle border-y border-border-subtle py-24 md:py-32">
          <div className="max-w-6xl mx-auto px-6">
            <FadeInSection>
              <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">
                <div className="space-y-8 order-2 md:order-1">
                  <div className="w-14 h-14 rounded-2xl bg-surface border border-border-subtle shadow-micro flex items-center justify-center">
                    <Mail className="w-7 h-7 text-accent" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-main tracking-tight">
                      L'email 1-to-1, sans automatisation
                    </h2>
                    <p className="text-lg text-muted leading-relaxed">
                      Le mass-mailing de masse est mort. Générez des brouillons 
                      hyper-personnalisés et envoyez-les directement depuis votre 
                      propre adresse Gmail. Délivrabilité maximale, relationnel authentique.
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {["Génération contextuelle via IA", "Envoi direct via votre compte Gmail", "Aucun risque de spam ou de ban de domaine"].map((text, i) => (
                      <li key={i} className="flex items-start gap-3 text-main font-medium">
                        <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                        <span>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-1 md:order-2">
                  <div className="relative rounded-2xl border border-border-subtle bg-surface p-6 md:p-8 shadow-micro">
                    <div className="bg-canvas border border-border-subtle rounded-xl shadow-sm overflow-hidden">
                      <div className="h-12 border-b border-border-subtle bg-surface flex items-center px-5">
                        <span className="text-sm font-semibold text-main">Nouveau message</span>
                      </div>
                      <div className="p-5 space-y-5">
                        <div className="border-b border-border-subtle pb-3 text-sm text-main font-medium">
                          <span className="text-muted">À : </span> contact@entreprise.fr
                        </div>
                        <div className="border-b border-border-subtle pb-3 text-sm text-main font-medium">
                          <span className="text-muted">Objet : </span> Amélioration de votre visibilité locale
                        </div>
                        <div className="space-y-3 pt-3">
                          <div className="h-3 w-full bg-border-strong/20 rounded" />
                          <div className="h-3 w-[90%] bg-border-strong/20 rounded" />
                          <div className="h-3 w-[75%] bg-border-strong/20 rounded" />
                          <div className="h-3 w-[85%] bg-border-strong/20 rounded" />
                        </div>
                        <div className="pt-6 flex justify-between items-center">
                          <div className="text-xs text-muted font-medium">Enregistré dans brouillons</div>
                          <div className="px-5 py-2.5 bg-accent rounded-xl text-accent-fg text-sm font-semibold shadow-primary-btn cursor-pointer">
                            Envoyer via Gmail
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ═══════════ TRUST / GOOGLE API ═════════ */}
        <section className="bg-canvas py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-6">
            <FadeInSection>
              <div className="text-center space-y-6 mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-main tracking-tight">
                  Transparence totale et sécurité
                </h2>
                <p className="text-lg text-muted max-w-2xl mx-auto">
                  Votre prospection mérite des outils qui respectent la confidentialité absolue de vos données et de celles de vos clients.
                </p>
              </div>
              <div className="bg-surface border border-border-subtle rounded-3xl p-8 sm:p-12 shadow-micro">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-surface-subtle border border-border-subtle flex items-center justify-center shadow-micro">
                    <ShieldCheck className="w-10 h-10 text-accent" />
                  </div>
                  <div className="space-y-5">
                    <h3 className="text-xl font-bold text-main tracking-tight">
                      Accès restreint à l'API Gmail
                    </h3>
                    <div className="space-y-4 text-muted leading-relaxed">
                      <p>
                        Freelance Prospection se connecte à votre compte Gmail uniquement pour faciliter votre prospection manuelle. 
                        L'accès est restreint à la portée <code className="text-sm font-mono bg-surface-subtle px-1.5 py-0.5 rounded border border-border-subtle mx-1">gmail.send</code>.
                      </p>
                      <ul className="space-y-3 text-left inline-block w-full pt-2">
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                          <span>Vos données ne sont ni vendues ni partagées à des tiers.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                          <span>Vos e-mails ne servent pas à entraîner des modèles d'Intelligence Artificielle.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2.5 shrink-0" />
                          <span>L'application accède uniquement au strict nécessaire pour générer les brouillons.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ═══════════ FINAL CTA (ACCENT) ═════════════════ */}
        <section className="bg-accent text-accent-fg py-24 md:py-32">
          <div className="max-w-4xl mx-auto px-6">
            <FadeInSection>
              <div className="text-center space-y-10">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">
                  Prêt à trouver vos prochains clients locaux ?
                </h2>
                <p className="text-xl opacity-90 max-w-2xl mx-auto text-balance">
                  Rejoignez la plateforme et commencez à prospecter de manière qualifiée, chirurgicale et authentique dès aujourd'hui.
                </p>
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => onNavigate("/auth")}
                    className="group flex items-center h-16 px-10 rounded-2xl bg-surface text-accent font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Créer mon compte
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </FadeInSection>
          </div>
        </section>
      </main>

      {/* ═══════════ FOOTER ══════════════════════ */}
      <footer className="relative z-10 border-t border-border-subtle bg-canvas py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-accent text-accent-fg flex items-center justify-center font-bold text-xs shadow-micro">
              FP
            </div>
            <span className="font-semibold text-main text-sm tracking-tight">
              Freelance Prospection
            </span>
          </div>
          <div className="flex gap-8 text-sm text-muted font-medium">
            <button
              onClick={() => onNavigate("/privacy")}
              className="hover:text-main transition-colors"
            >
              Confidentialité
            </button>
            <button
              onClick={() => onNavigate("/terms")}
              className="hover:text-main transition-colors"
            >
              Conditions d'utilisation
            </button>
          </div>
          <div className="text-sm text-muted">
            © {new Date().getFullYear()} Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};
