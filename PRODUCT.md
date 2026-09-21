# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Freelances, consultants indépendants, webdesigners, développeurs web et agences de marketing digital opérant sur le marché local français.
- **Situation** : Recherche active de nouveaux clients locaux (artisans, commerçants, restaurants, professions libérales) sur une zone géographique définie.
- **Job to be done** : Identifier en quelques clics les entreprises à fort potentiel de transformation numérique (absence de site, mauvaise fiche Maps, faiblesses UX), obtenir immédiatement un angle d'approche commercial différenciant et leur envoyer un email de prise de contact ultra-personnalisé sans friction.

## Product Purpose

Fournir un cockpit tout-en-un de prospection locale pour freelances. Le produit élimine les allers-retours entre Google Maps, les tableurs Excel, ChatGPT et le client mail en unifiant le sourcing cartographique, la qualification d'opportunités par IA et l'envoi d'emails réels via Gmail dans une interface unique, fluide et épurée.
- **Critère de succès** : Transformer 15 minutes de recherche fastidieuse en une campagne ciblée de 10 prises de contact personnalisées prêtes à être expédiées.

## Positioning

Contrairement aux outils de scraping massifs (Phantombuster, Apollo) qui produisent des listes froides et impersonnelles, et aux CRMs lourds (Hubspot, Pipedrive), **Prospection Locale Freelance** propose une approche chirurgicale et qualitative :
- Intégration directe d'une carte interactive synchronisée avec le pipeline.
- Détection fine de l'opportunité locale spécifique (site absent, mauvaise note, manque d'outils digitaux).
- Rédaction d'accroches contextuelles par IA adaptées à l'expertise du freelance et envoi direct via l'adresse Gmail de l'utilisateur.

## Operating Context

- **Environnement** : Dashboard web sur poste de travail (macOS / desktop et responsive tablette/mobile).
- **Flux utilisateur typique** :
  1. Définition du profil freelance et signature (optionnel, mémorisé).
  2. Recherche par ville et secteur d'activité (Google Maps / Places API).
  3. Visualisation combinée liste / carte avec statut des opportunités.
  4. Sélection et qualification des prospects pertinents.
  5. Génération assistée par IA de l'email de prospection avec choix du ton et de l'objectif.
  6. Envoi immédiat ou création de brouillon dans Gmail.
  7. Export éventuel des fiches au format CSV.

## Capabilities and Constraints

- **Capacités confirmées** :
  - Recherche cartographique géolocalisée et géocodage de villes françaises.
  - Pipeline de prospection à 5 étapes (`all`, `to_contact`, `contacted`, `interested`, `declined`) + Shortlist favoris (`identified`).
  - IA générative intégrée via Google Gemini API (`@google/genai`) pour la détection d'opportunités et la rédaction d'emails sur-mesure.
  - Authentification Google OAuth et intégration Gmail API pour envoi direct et brouillons.
  - Suppression réversible avec toast d'annulation (Undo).
  - Export CSV complet des prospects filtrés.
- **Contraintes techniques** :
  - Conformité stricte à l'accessibilité WCAG 2.2 AA (contraste, focus, réduction de mouvement).
  - Absence de dépendance lourde, performance de chargement rapide (<300ms au build).
  - Sécurité : confirmation obligatoire de l'utilisateur avant tout envoi réel d'email via Gmail.

## Brand Commitments

- **Creative North Star** : "L'Efficacité Silencieuse".
- **Identité visuelle** : Minimalisme utilitaire inspiré de l'écosystème Apple / macOS :
  - Fond doux `#FAFAFA`, cartes blanches `#FFFFFF`, bordures ultra-fines `border-zinc-200/70`.
  - Pas d'ombres lourdes superflues (*Flat-By-Default*), micro-élévation diffuse.
  - Diodes et indicateurs de statut lumineux (*Status Glow*).
  - Feedback tactile réactif (`active:scale-95`).

## Evidence on Hand

- Code source TypeScript complet avec serveur Express (`server.ts`) et client Vite React 19 (`src/`).
- Intégration fonctionnelle avec Firebase Auth pour la synchronisation des tokens Gmail.
- Système de design documenté dans `DESIGN.md`.

## Product Principles

1. **Moins de bruit, plus d'action** : L'interface s'efface devant les données et l'action principale.
2. **Hyper-personnalisation plutôt que volume** : Privilégier des angles d'approche percutants et spécifiques plutôt que du spam automatisé.
3. **Contrôle et transparence** : L'utilisateur garde le contrôle final sur chaque email avant envoi réel.
4. **Fluidité locale** : La carte et la liste fonctionnent en symbiose permanente sans rechargement de page.

## Accessibility & Inclusion

- Conformité WCAG 2.2 AA avec ratios de contraste testés ≥ 4.5:1.
- Support total de la navigation au clavier (`Tab`, `Escape`, `Enter`, `Space`) et piège de focus sur les modales.
- Respect strict des préférences système `prefers-reduced-motion`.
