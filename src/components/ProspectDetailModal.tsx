import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  FileEdit, 
  Copy, 
  Check, 
  ExternalLink, 
  Phone, 
  Mail as MailIcon, 
  MapPin, 
  Star, 
  CheckCircle2,
  AlertCircle,
  Globe,
  ShieldAlert,
  RefreshCw,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from "lucide-react";
import { Prospect, FreelanceProfile, ProspectStatus } from "../types";
import { Button, Input, Textarea, Badge, Select, Modal } from "./ui";

// RFC 5322 regex simplifiée pour validation stricte du format email
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

interface ProspectDetailModalProps {
  prospect: Prospect | null;
  onClose: () => void;
  freelanceProfile: FreelanceProfile;
  onUpdateProspect: (updated: Prospect) => void;
  gmailToken: string | null;
  userEmail?: string | null;
}

export const ProspectDetailModal: React.FC<ProspectDetailModalProps> = ({
  prospect,
  onClose,
  freelanceProfile,
  onUpdateProspect,
  gmailToken,
  userEmail,
}) => {
  if (!prospect) return null;

  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);

  // Protection contre les double-clics et race conditions
  const isGeneratingRef = useRef(false);
  const isSendingRef = useRef(false);
  const isDraftingRef = useRef(false);

  const [subject, setSubject] = useState(prospect.generatedEmail?.subject || "");
  const [body, setBody] = useState(prospect.generatedEmail?.body || "");
  const [copied, setCopied] = useState(false);
  const [emailInput, setEmailInput] = useState(prospect.email || "");
  const [tone, setTone] = useState("Direct et courtois");
  const [objective, setObjective] = useState("Proposition d'audit gratuit de 10 min");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<"generate" | "send" | "draft" | null>(null);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showToneSettings, setShowToneSettings] = useState(false);

  const handleGenerateEmail = async () => {
    if (isGeneratingRef.current || generating) return;

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setActionError("Vous êtes actuellement hors-ligne. Impossible de générer l'email sans connexion Internet.");
      setLastFailedAction("generate");
      return;
    }

    isGeneratingRef.current = true;
    setGenerating(true);
    setActionError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch("/api/prospects/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          prospect,
          freelanceProfile,
          tone,
          objective,
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la génération de l'email");
      }

      setSubject(data.subject);
      setBody(data.body);

      onUpdateProspect({
        ...prospect,
        generatedEmail: {
          subject: data.subject,
          body: data.body,
          generatedAt: new Date().toISOString(),
        },
      });
      setLastFailedAction(null);
    } catch (err: any) {
      clearTimeout(timeoutId);
      setLastFailedAction("generate");
      if (err?.name === "AbortError") {
        setActionError("Délai de génération dépassé. L'API Gemini a mis trop de temps à répondre.");
      } else if (err instanceof TypeError && (err.message?.includes("fetch") || err.message?.includes("network"))) {
        setActionError("Erreur réseau : impossible de joindre le serveur.");
      } else {
        setActionError(err.message || "Impossible de générer l'email");
      }
    } finally {
      isGeneratingRef.current = false;
      setGenerating(false);
    }
  };

  const handleSendViaGmail = async () => {
    if (isSendingRef.current || sending) return;

    const targetEmail = emailInput.trim();
    if (!targetEmail) {
      setActionError("Veuillez renseigner une adresse email valide.");
      return;
    }

    if (!EMAIL_REGEX.test(targetEmail)) {
      setActionError("L'adresse email saisie n'a pas un format valide (ex: contact@domaine.fr).");
      return;
    }

    if (!gmailToken) {
      setActionError("Veuillez connecter votre compte Gmail en haut à droite.");
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setActionError("Vous êtes actuellement hors-ligne. Impossible d'envoyer l'email.");
      setLastFailedAction("send");
      return;
    }

    isSendingRef.current = true;
    setSending(true);
    setActionError(null);
    setActionSuccess(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gmailToken}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          to: targetEmail,
          subject,
          body,
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 || data.isAuthError) {
          throw new Error("Votre session Gmail a expiré. Veuillez vous reconnecter en haut à droite.");
        }
        throw new Error(data.error || "Échec de l'envoi de l'email");
      }

      setActionSuccess("Email envoyé avec succès via votre boîte Gmail !");
      onUpdateProspect({
        ...prospect,
        status: "contacted",
        email: targetEmail,
        emailSentAt: new Date().toISOString(),
      });
      setLastFailedAction(null);
    } catch (err: any) {
      clearTimeout(timeoutId);
      setLastFailedAction("send");
      if (err?.name === "AbortError") {
        setActionError("Délai d'envoi dépassé. Le serveur Gmail a mis trop de temps à répondre.");
      } else if (err instanceof TypeError && (err.message?.includes("fetch") || err.message?.includes("network"))) {
        setActionError("Erreur réseau : impossible de joindre le serveur Gmail.");
      } else {
        setActionError(err.message || "Erreur d'envoi");
      }
    } finally {
      isSendingRef.current = false;
      setSending(false);
    }
  };

  const handleCreateDraft = async () => {
    if (isDraftingRef.current || drafting) return;

    const targetEmail = emailInput.trim();
    if (targetEmail && !EMAIL_REGEX.test(targetEmail)) {
      setActionError("L'adresse email saisie n'a pas un format valide (ex: contact@domaine.fr).");
      return;
    }

    if (!gmailToken) {
      setActionError("Veuillez connecter votre compte Gmail en haut à droite.");
      return;
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setActionError("Vous êtes actuellement hors-ligne. Impossible de créer le brouillon.");
      setLastFailedAction("draft");
      return;
    }

    isDraftingRef.current = true;
    setDrafting(true);
    setActionError(null);
    setActionSuccess(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch("/api/gmail/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${gmailToken}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          to: targetEmail,
          subject,
          body,
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401 || data.isAuthError) {
          throw new Error("Votre session Gmail a expiré. Veuillez vous reconnecter en haut à droite.");
        }
        throw new Error(data.error || "Échec de la création du brouillon");
      }

      setActionSuccess("Brouillon créé avec succès dans votre boîte Gmail !");
      setLastFailedAction(null);
    } catch (err: any) {
      clearTimeout(timeoutId);
      setLastFailedAction("draft");
      if (err?.name === "AbortError") {
        setActionError("Délai de création de brouillon dépassé.");
      } else if (err instanceof TypeError && (err.message?.includes("fetch") || err.message?.includes("network"))) {
        setActionError("Erreur réseau : impossible de joindre le serveur Gmail.");
      } else {
        setActionError(err.message || "Erreur de création de brouillon");
      }
    } finally {
      isDraftingRef.current = false;
      setDrafting(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = `Objet: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trimmedEmail = emailInput.trim();
  const isEmailValid = trimmedEmail.length > 0 && EMAIL_REGEX.test(trimmedEmail);
  const hasEmailFormatError = trimmedEmail.length > 0 && !isEmailValid;

  const headerNode = (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {(prospect.status === "searched" || prospect.status === "to_contact") && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              const isCurrentlyLiked = prospect.status === "to_contact" || (prospect.identified && prospect.status !== "searched");
              const nextStatus: ProspectStatus = isCurrentlyLiked ? "searched" : "to_contact";
              const nextIdentified = !isCurrentlyLiked;
              onUpdateProspect({
                ...prospect,
                status: nextStatus,
                identified: nextIdentified,
              });
            }}
            className={
              prospect.status === "to_contact" || prospect.identified
                ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                : "text-muted hover:text-emerald-700 hover:bg-secondary"
            }
            aria-label={prospect.status === "to_contact" ? "Retirer de À contacter" : "Ajouter à À contacter"}
            title={prospect.status === "to_contact" ? "Retirer de À contacter (renvoyer vers l'historique)" : "Retenir pour À contacter"}
          >
            <Sparkles className={`w-4 h-4 ${prospect.status === "to_contact" || prospect.identified ? "fill-emerald-600 text-emerald-600" : ""}`} />
          </Button>
        )}
        <h3 id="modal-prospect-title" className="text-base font-semibold text-main tracking-tight break-words min-w-0">
          {prospect.name}
        </h3>
        <Badge variant="neutral">{prospect.activity}</Badge>
        {prospect.status === "to_contact" && (
          <Badge variant="amber" withDot>
            À contacter
          </Badge>
        )}
        {prospect.status === "contacted" && (
          <Badge variant="blue" withDot>
            Contacté
          </Badge>
        )}
        {prospect.status === "interested" && (
          <Badge variant="emerald" withDot>
            Intéressé
          </Badge>
        )}
        {prospect.status === "declined" && (
          <Badge variant="neutral">
            Sans suite
          </Badge>
        )}
        {prospect.status === "searched" && (
          <Badge variant="neutral">
            Recherché
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-muted">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
          <span className="truncate">{prospect.location}</span>
        </span>
        {prospect.rating ? (
          <span className="flex items-center gap-1 text-amber-700 font-medium shrink-0">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
            <span className="font-mono">{prospect.rating}</span>
            <span className="font-mono text-muted text-xs">({prospect.reviewCount} avis)</span>
          </span>
        ) : null}
        {prospect.website ? (
          <a
            href={prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-blue-700 hover:underline shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Site web
          </a>
        ) : (
          <span className="text-muted shrink-0">Sans site répertorié</span>
        )}
        <a
          href={`https://www.google.com/search?q=${encodeURIComponent(`${prospect.name} ${prospect.location}`)}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-secondary-fg hover:text-main font-medium shrink-0"
          title="Fiche Google"
        >
          <Globe className="w-3.5 h-3.5" />
          Fiche Google
        </a>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={Boolean(prospect)}
      onClose={onClose}
      title={headerNode}
      maxWidth="3xl"
      ariaLabelledBy="modal-prospect-title"
    >
      <div className="space-y-4">
        {/* Opportunité locale */}
        {prospect.keyAngle && (
          <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-xs">
            <span className="font-semibold text-amber-950 block mb-0.5">Opportunité détectée :</span>
            <p className="text-amber-900 leading-relaxed break-words h-auto">{prospect.keyAngle}</p>
          </div>
        )}

        {/* Informations de contact direct */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label htmlFor="modal-email-input" className="block font-medium text-main mb-1">
              Email de contact
            </label>
            <Input
              id="modal-email-input"
              type="email"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                if (actionError) setActionError(null);
              }}
              maxLength={254}
              hasError={hasEmailFormatError}
              leftIcon={<MailIcon className="w-3.5 h-3.5" />}
              placeholder="contact@entreprise.fr"
            />
            {hasEmailFormatError && (
              <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                <span>Format d'email non valide (ex: contact@domaine.fr)</span>
              </p>
            )}
          </div>
          <div className="min-w-0">
            <label htmlFor="modal-phone-input" className="block font-medium text-main mb-1">
              Téléphone
            </label>
            <Input
              id="modal-phone-input"
              type="text"
              value={prospect.phone || ""}
              readOnly
              leftIcon={<Phone className="w-3.5 h-3.5" />}
              placeholder="Non répertorié"
              className="cursor-default text-secondary-fg"
            />
          </div>
        </div>

        {/* Paramètres de rédaction IA */}
        <div className="p-3.5 bg-surface-subtle border border-border-subtle rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-main flex items-center gap-1.5 tracking-tight">
              <Sparkles className="w-3.5 h-3.5 text-main" />
              Génération de l'email
            </span>
            <button
              type="button"
              onClick={() => setShowToneSettings((prev) => !prev)}
              className="inline-flex items-center gap-1 text-muted hover:text-main text-xs font-medium cursor-pointer transition-colors select-none"
              aria-expanded={showToneSettings}
            >
              <SlidersHorizontal className="w-3 h-3 text-muted" />
              <span>{showToneSettings ? "Masquer options" : "Ajuster le ton"}</span>
              {showToneSettings ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showToneSettings && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label htmlFor="modal-tone-select" className="block font-medium text-main mb-1">
                  Ton
                </label>
                <Select
                  id="modal-tone-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="Direct et courtois">Direct et courtois</option>
                  <option value="Chaleureux et orienté entraide locale">Chaleureux & local</option>
                  <option value="Factuel et analytique">Factuel et axé ROI</option>
                </Select>
              </div>
              <div>
                <label htmlFor="modal-objective-select" className="block font-medium text-main mb-1">
                  Objectif
                </label>
                <Select
                  id="modal-objective-select"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                >
                  <option value="Proposition d'audit gratuit de 10 min">Audit offert (10 min)</option>
                  <option value="Partage d'idées concrètes d'optimisation">Partage de pistes</option>
                  <option value="Prise de contact informelle de proximité">Rencontre locale informelle</option>
                </Select>
              </div>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleGenerateEmail}
            disabled={generating || sending || drafting}
            loading={generating}
            leftIcon={!generating && <Sparkles className="w-4 h-4 text-amber-300" />}
            className="w-full"
          >
            {generating ? "Génération en cours..." : subject ? "Régénérer l'email" : "Générer l'email"}
          </Button>
        </div>

        {/* Email rédigé */}
        {subject && (
          <div className="space-y-3 text-xs">
            <div>
              <label htmlFor="modal-subject-input" className="block font-semibold text-main mb-1.5">
                Objet de l'email
              </label>
              <Input
                id="modal-subject-input"
                type="text"
                value={subject}
                maxLength={200}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="modal-body-textarea" className="block font-semibold text-main mb-1.5">
                Corps du message
              </label>
              <Textarea
                id="modal-body-textarea"
                rows={8}
                value={body}
                maxLength={4000}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {/* Send confirmation guard banner */}
            {showSendConfirm && (
              <div className="p-3.5 bg-amber-50 border border-amber-300/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-start gap-2 text-amber-900 font-semibold">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Confirmation d'envoi réel via votre compte Gmail</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Cet email sera réellement envoyé à <strong>{emailInput}</strong> depuis votre adresse <strong>{userEmail || "connectée"}</strong>. Voulez-vous confirmer l'envoi immédiat ?
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="success"
                    size="md"
                    disabled={sending}
                    loading={sending}
                    leftIcon={!sending && <Send className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setShowSendConfirm(false);
                      handleSendViaGmail();
                    }}
                  >
                    Confirmer l'envoi direct
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    disabled={sending}
                    onClick={() => setShowSendConfirm(false)}
                  >
                    Retour à l'édition
                  </Button>
                </div>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-border-subtle">
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCopy}
                  leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? "Copié" : "Copier"}
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCreateDraft}
                  disabled={drafting || sending || generating || !gmailToken}
                  loading={drafting}
                  leftIcon={!drafting && <FileEdit className="w-3.5 h-3.5" />}
                  title={!gmailToken ? "Connectez Gmail pour créer un brouillon" : ""}
                >
                  Créer un brouillon
                </Button>
              </div>

              <Button
                variant="success"
                size="md"
                onClick={() => {
                  if (!gmailToken) {
                    setActionError("Veuillez connecter votre compte Gmail en haut à droite pour envoyer l'email directement.");
                    return;
                  }
                  if (!trimmedEmail) {
                    setActionError("Veuillez renseigner l'adresse email de contact du prospect.");
                    return;
                  }
                  if (!isEmailValid) {
                    setActionError("Format d'adresse email invalide (ex: contact@domaine.fr).");
                    return;
                  }
                  if (!subject.trim() || !body.trim()) {
                    setActionError("L'objet et le corps de l'email ne peuvent pas être vides.");
                    return;
                  }
                  setActionError(null);
                  setShowSendConfirm(true);
                }}
                disabled={sending || drafting || generating || !gmailToken || !trimmedEmail || !isEmailValid}
                loading={sending}
                leftIcon={!sending && <Send className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto"
                title={!gmailToken ? "Connectez Gmail ci-dessus" : !trimmedEmail ? "Renseignez un email" : !isEmailValid ? "Format email invalide" : ""}
              >
                Envoyer via Gmail
              </Button>
            </div>
          </div>
        )}

        {actionSuccess && (
          <div role="status" aria-live="polite" className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between gap-2 font-medium">
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="break-words leading-tight">{actionError}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {lastFailedAction && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (lastFailedAction === "generate") handleGenerateEmail();
                    else if (lastFailedAction === "send") handleSendViaGmail();
                    else if (lastFailedAction === "draft") handleCreateDraft();
                  }}
                  disabled={generating || sending || drafting}
                  leftIcon={<RefreshCw className={`w-3 h-3 ${generating || sending || drafting ? "animate-spin" : ""}`} />}
                  title="Réessayer l'action précédente"
                >
                  Réessayer
                </Button>
              )}
              <button
                type="button"
                onClick={() => setActionError(null)}
                className="text-rose-600 hover:text-rose-900 p-1 cursor-pointer"
                title="Fermer l'alerte"
                aria-label="Fermer l'alerte"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
