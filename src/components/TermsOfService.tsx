import React from "react";
import { ArrowLeft, Scale, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";

interface TermsPageProps {
  onBack: () => void;
  onNavigate?: (path: string) => void;
}

export const TermsOfService: React.FC<TermsPageProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="min-h-screen bg-canvas text-main font-sans antialiased flex flex-col">
      {/* Header */}
      <header className="border-b border-border-subtle bg-surface/90 backdrop-blur-xs sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary text-primary-fg flex items-center justify-center font-bold text-sm shadow-primary-btn">
              P
            </div>
            <div>
              <span className="text-sm font-semibold text-main leading-tight tracking-tight block">
                Prospection Locale
              </span>
              <span className="text-xs text-muted">Conditions Générales d'Utilisation</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Retour à l'application
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article className="bg-surface border border-border-subtle rounded-2xl p-6 sm:p-10 shadow-sm space-y-8 h-auto break-words">
          {/* Header section */}
          <div className="border-b border-border-subtle pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium border border-blue-500/20">
              <Scale className="w-3.5 h-3.5" />
              <span>Cadre Juridique B2B & Règles d'Usage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
              Conditions Générales d'Utilisation (CGU)
            </h1>
            <p className="text-xs text-muted">
              Dernière mise à jour : 23 septembre 2026 • Application : Prospection Locale Freelance
            </p>
          </div>

          {/* Section 1 : Objet du service */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-main">1. Objet du Service</h2>
            <p className="text-sm text-muted leading-relaxed">
              L'application <strong>Prospection Locale</strong> est une solution logicielle en ligne (SaaS) conçue pour accompagner les indépendants, freelances et prestataires de services dans l'identification d'entreprises locales (sourcing cartographique) et la préparation de prises de contact professionnelles (B2B).
            </p>
            <p className="text-sm text-muted leading-relaxed">
              L'accès et l'utilisation de l'Application impliquent l'acceptation sans réserve des présentes Conditions Générales d'Utilisation.
            </p>
          </section>

          {/* Section 2 : Accès et Comptes Utilisateurs */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-main">2. Inscription et Sécurité du Compte</h2>
            <p className="text-sm text-muted leading-relaxed">
              L'Application est exclusivement réservée à un usage professionnel. Pour créer un compte, l'utilisateur s'engage à fournir des informations exactes et sincères.
            </p>
            <ul className="text-sm text-muted space-y-1.5 list-disc list-inside pl-2 leading-relaxed">
              <li>L'utilisateur est personnellement responsable de la confidentialité de ses identifiants de connexion et de l'ensemble des activités exécutées depuis son compte.</li>
              <li>Chaque compte est strictement individuel et ne peut être partagé entre plusieurs entités ou personnes sans accord préalable.</li>
            </ul>
          </section>

          {/* Section 3 : Réglementation de la Prospection Commerciale B2B */}
          <section className="space-y-4 rounded-xl bg-canvas border border-border-subtle p-5 sm:p-6">
            <div className="flex items-center gap-2 text-primary font-semibold text-base">
              <ShieldAlert className="w-4.5 h-4.5 text-primary" />
              <h2>3. Conformité Légale et Interdiction du Spam (Charte d'Usage Responsable)</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              L'utilisateur s'engage expressément à respecter les dispositions légales applicables en matière de prospection électronique professionnelle (notamment l'article L. 34-5 du Code des postes et des communications électroniques et les délibérations de la CNIL) :
            </p>

            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Pertinence professionnelle :</strong> Les prises de contact doivent impérativement être en relation directe avec la profession ou l'activité commerciale du destinataire contacté.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Faculté d'opposition claire :</strong> Tout e-mail adressé doit mentionner clairement l'identité de l'expéditeur et intégrer un moyen simple et gratuit pour le destinataire de manifester son opposition à de futures sollicitations.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Interdiction absolue du spam massif :</strong> L'Application n'est pas un outil de routage en masse d'e-mails non sollicités. Toute utilisation pour diffuser des campagnes abusives, trompeuses, malveillantes ou du phishing entraînera la clôture immédiate du compte.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 : Intégration Gmail & API Google */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-main">4. Connexion Google & Responsabilité des Envois</h2>
            <p className="text-sm text-muted leading-relaxed">
              Lorsque l'utilisateur connecte son compte Google et utilise l'envoi via Gmail, les e-mails sont expédiés sous sa seule et entière responsabilité. L'utilisateur veille au respect des quotas imposés par Google et aux conditions d'utilisation du service Gmail.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              L'Éditeur de l'Application ne saurait être tenu responsable du blocage éventuel d'un compte Gmail tiers résultant d'un usage excessif ou inapproprié de la part de l'utilisateur.
            </p>
          </section>

          {/* Section 5 : Propriété Intellectuelle */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-main">5. Propriété Intellectuelle</h2>
            <p className="text-sm text-muted leading-relaxed">
              L'Application, sa structure, ses textes, son design et ses algorithmes sont la propriété exclusive de l'Éditeur. L'utilisateur conserve quant à lui l'entière propriété de sa base de prospects et des textes d'approche qu'il rédige ou personnalise.
            </p>
          </section>

          {/* Section 6 : Disponibilité et Limitation de Responsabilité */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-main">6. Limitation de Responsabilité</h2>
            <p className="text-sm text-muted leading-relaxed">
              L'Application est mise à disposition « en l'état ». L'Éditeur s'efforce d'assurer une disponibilité maximale du service, mais ne saurait garantir une absence totale d'interruption ou de bogue. En aucun cas, l'Éditeur ne pourra être tenu responsable des pertes de chiffre d'affaires, de préjudices commerciaux ou de résultats de prospection de l'utilisateur.
            </p>
          </section>

          {/* Section 7 : Droit Applicable et Litiges */}
          <section className="space-y-3 border-t border-border-subtle pt-6">
            <h2 className="text-lg font-semibold text-main">7. Droit Applicable et Juridiction Compétente</h2>
            <p className="text-sm text-muted leading-relaxed">
              Les présentes CGU sont régies par le droit français. En cas de différend ou de litige relatif à leur validité, interprétation ou exécution, les parties s'engagent à rechercher préalablement une solution amiable avant de saisir les tribunaux compétents français.
            </p>
          </section>

          {/* Footer inside card */}
          <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
            <span>© {new Date().getFullYear()} Prospection Locale</span>
            {onNavigate && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate("/privacy")}
                  className="hover:text-main underline cursor-pointer"
                >
                  Consulter la Politique de Confidentialité
                </button>
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
};
