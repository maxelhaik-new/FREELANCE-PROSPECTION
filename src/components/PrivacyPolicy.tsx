import React from "react";
import { ArrowLeft, ShieldCheck, Lock, EyeOff, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/Button";

interface PolicyPageProps {
  onBack: () => void;
  onNavigate?: (path: string) => void;
}

export const PrivacyPolicy: React.FC<PolicyPageProps> = ({ onBack, onNavigate }) => {
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
                Freelance Prospection
              </span>
              <span className="text-xs text-muted">Confidentialité & Données</span>
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
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conforme RGPD & Politiques Google API</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-main">
              Politique de Confidentialité
            </h1>
            <p className="text-xs text-muted">
              Dernière mise à jour : 23 septembre 2026 • Application : Freelance Prospection
            </p>
          </div>

          {/* Section 1 : Introduction */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-main">1. Introduction et Responsable de Traitement</h2>
            <p className="text-sm text-muted leading-relaxed">
              La présente Politique de Confidentialité décrit la manière dont l'application <strong>Freelance Prospection</strong> (« l'Application », « nous ») collecte, utilise, protège et partage les données personnelles de ses utilisateurs (« vous »).
            </p>
            <p className="text-sm text-muted leading-relaxed">
              L'Application est un outil d'aide à la prospection B2B locale conçu exclusivement pour les professionnels, indépendants et freelances. Nous accordons une importance primordiale au respect de votre vie privée et nous nous engageons à traiter l'ensemble des données dans le respect du Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679) et des exigences de confidentialité de Google.
            </p>
          </section>

          {/* Section 2 : Données collectées */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-main">2. Données Personnelles Collectées</h2>
            <p className="text-sm text-muted leading-relaxed">
              Dans le cadre de votre utilisation de l'Application, nous sommes amenés à traiter les catégories de données suivantes :
            </p>
            <ul className="text-sm text-muted space-y-2 list-disc list-inside pl-2 leading-relaxed">
              <li>
                <strong>Données de compte et d'authentification :</strong> adresse e-mail professionnelle, identifiant d'authentification unique (UUID Supabase), date de création du compte.
              </li>
              <li>
                <strong>Profil professionnel freelance :</strong> nom/prénom ou pseudonyme professionnel, intitulé de métier, compétences clés, tarifs indicatifs, lien de portfolio ou site web (renseignés librement par l'utilisateur).
              </li>
              <li>
                <strong>Données de prospection :</strong> historique de recherches locales (villes, secteurs d'activité ciblés), liste des fiches entreprises prospects identifiées, notes internes et statuts d'avancement de prospection.
              </li>
              <li>
                <strong>Données techniques de session :</strong> jetons d'accès OAuth temporaires nécessaires pour exécuter les requêtes autorisées par l'utilisateur, stockés exclusivement dans la session locale de votre navigateur.
              </li>
            </ul>
          </section>

          {/* Section 3 : Utilisation des API Google & Gmail */}
          <section className="space-y-4 rounded-xl bg-canvas border border-border-subtle p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary shrink-0" />
              <h2 className="text-lg font-semibold text-main">3. Utilisation des Données Google et de l'API Gmail</h2>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Lorsque vous choisissez de vous connecter avec votre compte Google ou d'activer l'intégration Gmail, nous demandons l'accès aux portées (scopes) suivantes :
            </p>
            <ul className="text-xs font-mono bg-surface border border-border-subtle rounded-lg p-3 space-y-1 text-main">
              <li>• https://www.googleapis.com/auth/gmail.send (envoi d'e-mails à votre demande)</li>
              <li>• https://www.googleapis.com/auth/gmail.compose (création de brouillons d'e-mails)</li>
              <li>• https://www.googleapis.com/auth/gmail.modify (gestion et suivi des e-mails envoyés)</li>
            </ul>

            <div className="space-y-3 text-sm text-muted leading-relaxed pt-2">
              <h3 className="font-semibold text-main">Finalité stricte de l'accès Gmail :</h3>
              <p>
                L'accès à l'API Gmail sert <strong>exclusivement</strong> à permettre à l'utilisateur d'envoyer directement ses e-mails de prospection commerciale B2B personnalisés depuis sa propre adresse Gmail, après validation explicite du contenu dans l'interface.
              </p>

              <h3 className="font-semibold text-main pt-2">Déclaration de conformité aux règles d'utilisation limitée de Google (Limited Use) :</h3>
              <blockquote className="border border-border-subtle px-4 py-3 italic bg-surface/70 rounded-xl text-main text-xs sm:text-sm">
                « L'utilisation par Freelance Prospection des informations reçues des API Google respecte la politique relative aux données utilisateur des services d'API Google (Google API Services User Data Policy), y compris les exigences d'utilisation limitée (Limited Use requirements). »
              </blockquote>
              <p className="text-xs text-muted italic">
                (English official disclosure: "Freelance Prospection's use and transfer to any other app of information received from Google APIs will adhere to the Google API Services User Data Policy, including the Limited Use requirements.")
              </p>

              <h3 className="font-semibold text-main pt-2">Garanties de protection des données Google :</h3>
              <ul className="space-y-2 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Aucune revente de données :</strong> Vos données Google ne sont jamais vendues, cédées, louées ni transmises à des courtiers de données ou à des tiers publicitaires.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Pas de publicité ciblée :</strong> Vos données issues de Google ne sont jamais utilisées pour diffuser de la publicité, y compris du reciblage (retargeting) ou de la publicité basée sur les centres d'intérêt.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Pas d'entraînement de modèles d'IA sur vos données Google :</strong> Les données reçues des API Google (contenu de vos e-mails ou métadonnées) ne sont <strong>en aucun cas</strong> utilisées pour former, entraîner ou affiner des modèles d'intelligence artificielle ou de machine learning (LLM).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Aucune lecture humaine :</strong> Aucun membre de notre équipe ne lit vos e-mails ou vos données Google, sauf accord exprès et préalable de votre part à des fins d'assistance technique ou sur réquisition judiciaire légale.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 : Sécurité et Stockage */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-main">4. Sécurité, Hébergement et Durée de Conservation</h2>
            <p className="text-sm text-muted leading-relaxed">
              Nous mettons en œuvre des mesures techniques et organisationnelles conformes aux standards de l'industrie pour protéger vos données :
            </p>
            <ul className="text-sm text-muted space-y-1.5 list-disc list-inside pl-2 leading-relaxed">
              <li><strong>Isolation des données :</strong> Base de données PostgreSQL hébergée sur Supabase avec activation systématique du <em>Row Level Security (RLS)</em>. Chaque utilisateur ne peut accéder qu'à ses propres données.</li>
              <li><strong>Chiffrement :</strong> Tous les échanges réseau s'effectuent via le protocole HTTPS/TLS 1.3 chiffré.</li>
              <li><strong>Durée de conservation :</strong> Vos données de prospects et votre profil sont conservés tant que votre compte utilisateur reste actif. En cas d'inactivité continue supérieure à 24 mois ou sur simple demande, l'ensemble des données est définitivement effacé.</li>
            </ul>
          </section>

          {/* Section 5 : Droits RGPD et Révocation */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-main">5. Vos Droits et Révocation des Accès</h2>
            <p className="text-sm text-muted leading-relaxed">
              Conformément à la réglementation européenne (RGPD), vous disposez des droits suivants sur vos données personnelles : droit d'accès (Art. 15), de rectification (Art. 16), d'effacement / droit à l'oubli (Art. 17), de limitation du traitement (Art. 18), et de portabilité (Art. 20).
            </p>
            <p className="text-sm text-muted leading-relaxed">
              <strong>Révocation de l'accès Google :</strong> Vous pouvez à tout moment et instantanément révoquer les autorisations accordées à l'Application directement depuis les paramètres de sécurité de votre compte Google à l'adresse suivante :{" "}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline font-medium hover:opacity-80"
              >
                https://myaccount.google.com/permissions
              </a>.
            </p>
          </section>

          {/* Section 6 : Contact */}
          <section className="space-y-3 border-t border-border-subtle pt-6">
            <h2 className="text-lg font-semibold text-main">6. Contact</h2>
            <p className="text-sm text-muted leading-relaxed">
              Pour toute question relative à cette politique de confidentialité ou pour exercer vos droits d'accès et de suppression, vous pouvez contacter notre responsable de la protection des données par email à l'adresse :{" "}
              <span className="font-mono text-main bg-canvas px-2 py-0.5 rounded border border-border-subtle text-xs">
                privacy@freelance-prospection.vercel.app
              </span>.
            </p>
          </section>

          {/* Footer inside card */}
          <div className="border-t border-border-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
            <span>© {new Date().getFullYear()} Freelance Prospection</span>
            {onNavigate && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate("/terms")}
                  className="hover:text-main underline cursor-pointer"
                >
                  Consulter les Conditions Générales d'Utilisation (CGU)
                </button>
              </div>
            )}
          </div>
        </article>
      </main>
    </div>
  );
};
