---
name: Prospection Locale Freelance
description: Outil de prospection locale pour freelances (Sourcing Google Maps, Pistes d'opportunités, Prise de contact Gmail).
colors:
  primary: "var(--primary)"
  secondary: "var(--secondary)"
  canvas: "var(--canvas)"
  surface: "var(--surface)"
  surface-subtle: "var(--surface-subtle)"
  border-subtle: "var(--border-subtle)"
  border-strong: "var(--border-strong)"
  text-main: "var(--text-main)"
  text-muted: "var(--text-muted)"
  success-bg: "#ecfdf5"
  success-text: "#065f46"
  warning-bg: "rgba(245, 158, 11, 0.15)"
  warning-text: "#78350f"
  error-bg: "rgba(136, 19, 55, 0.35)"
  error-text: "#fb7185"
  info-bg: "rgba(30, 58, 138, 0.45)"
  info-text: "#93c5fd"
  glow-emerald: "rgba(16, 185, 129, 0.5)"
  glow-amber: "rgba(245, 158, 11, 0.5)"
  glow-blue: "rgba(59, 130, 246, 0.5)"
  glow-zinc: "rgba(24, 24, 27, 0.3)"
  shadow-btn: "rgba(0, 0, 0, 0.08)"
  shadow-micro: "rgba(0, 0, 0, 0.02)"
  scrollbar-thumb: "rgba(212, 212, 216, 0.7)"
  scrollbar-hover: "rgba(161, 161, 170, 0.9)"
typography:
  display:
    fontFamily: "sans-serif"
    fontSize: "1rem"
    fontWeight: 600
  headline:
    fontFamily: "sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  body:
    fontFamily: "sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  caption:
    fontFamily: "sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "var(--primary-fg)"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
---

# Design System: Prospection Locale Freelance

## Overview

**Creative North Star: "L'Efficacité Silencieuse"**

Le design de cette application privilégie la clarté, la scanabilité et l'action directe. Conçu pour le mode "Operate", l'interface s'efface au profit des données de prospection (fiches entreprises, coordonnées, angles d'approche et génération d'emails). Inspiré de l'écosystème macOS/iOS, il utilise des ombres extrêmement diffuses, des bordures très fines et transparentes (`border-border-subtle`), et des tokens sémantiques pour hiérarchiser l'information sans bruit visuel.

**Key Characteristics:**
- **Zéro fioriture** : Les actions principales sont pleines (`bg-primary text-primary-fg`), les secondaires sont douces (`bg-secondary text-secondary-fg`) ou contourées (`border-border-subtle`).
- **Contraste doux & multi-thème** : Le fond de l'application est en `bg-canvas`, et les cartes en `bg-surface` pour créer un détachement subtil, sans aucune couleur brute en dur.
- **Indicateurs lumineux** : L'état du système et les sélections sont indiqués par des points de couleur (émeraude, ambre, bleu) dotés d'un effet lumineux de statut (`Status Glow`).

## Colors

Palette neutre et fonctionnelle entièrement pilotée par des variables CSS multi-thèmes, rehaussée par des touches sémantiques ciblées. L'interface est entièrement découplée des palettes brutes (`zinc-*`) grâce à des variables CSS mappées dans `@theme` (Tailwind CSS v4). Le thème par défaut est `zinc`, et l'application supporte le thème `dark` via l'attribut `data-theme="dark"`.

### Primary
- **Deep Slate / Inverse White** (#18181b to #fafafa): Boutons d'action principale, états actifs prioritaires et icônes d'action forte (`--primary`).

### Secondary
- **Subtle Gray / Slate** (#f4f4f5 to #27272a): Arrière-plan des actions secondaires, tags neutres et onglets inactifs (`--secondary`).

### Neutral
- **Canvas Background** (#fafafa to #09090b): Arrière-plan global de l'application (`--canvas`).
- **Surface Container** (#ffffff to #121215): Arrière-plan des cartes, panneaux et modales (`--surface`).
- **Surface Subtle** (#f9fafb to #18181b): Fonds des champs de recherche, barres d'outils et blocs imbriqués (`--surface-subtle`).
- **Border Subtle** (rgba(228, 228, 231, 0.7) to rgba(63, 63, 70, 0.6)): Délimitation ultra-légère des conteneurs (`--border-subtle`).
- **Border Strong** (#d4d4d8 to #52525b): Bordures actives, états de focus ou séparateurs marqués (`--border-strong`).
- **Text Main** (#18181b to #f4f4f5): Titres, labels majeurs et contenu textuel principal (`--text-main`).
- **Text Muted** (#71717a to #a1a1aa): Textes secondaires, placeholders et métadonnées (`--text-muted`).

### Status & Semantic
- **Success & Sélection** (#10b981): Prospects retenus, statuts validés et connexion Gmail active (`emerald-500` / `#ecfdf5`).
- **Warning & À Contacter** (#f59e0b): Opportunités détectées et relances en attente (`amber-500` / `rgba(245, 158, 11, 0.15)`).
- **Info & Prise de contact** (#3b82f6): Prospects déjà contactés et repères cartographiques (`blue-500` / `rgba(30, 58, 138, 0.45)`).
- **Error & Danger** (#f43f5e): Actions de suppression, alertes et erreurs de validation (`rose-500` / `rgba(136, 19, 55, 0.35)`).

### Named Rules
**The Semantic Token Rule.** Il est strictement interdit d'utiliser des classes brutes de palette (`zinc-900`, `zinc-100`, etc.) dans les composants. Tout élément d'interface doit employer les tokens sémantiques ci-dessus pour préserver l'interchangeabilité des thèmes.
**The Status Glow Rule.** Les indicateurs de statut (les petits points dans les badges ou légendes) portent toujours une ombre portée de leur propre couleur pour simuler une LED allumée (`shadow-[0_0_6px_rgba(...)]`).

## Typography

**Display Font:** Inter, SF Pro, system-ui (with sans-serif)
**Body Font:** Inter, SF Pro, system-ui (with sans-serif)
**Label Font:** SFMono-Regular, Consolas (with monospace)

**Character:** Typographie sobre et ultra-lisible typique des applications bureautiques professionnelles modernes, combinant une structure sans-serif dense pour la navigation et du mono pour les métriques.

### Hierarchy
- **Display** (weight 600, 1rem, line-height 1.25): Titres des panneaux principaux et modales (`text-base tracking-tight font-semibold`).
- **Headline** (weight 600, 0.875rem, line-height 1.25): Titres de sections et noms des fiches prospects (`text-sm tracking-tight font-semibold`).
- **Body** (weight 400, 0.875rem, line-height 1.5): Textes descriptifs, coordonnées, adresses et corps d'emails (`text-xs` / `text-sm`).
- **Label** (weight 500, 0.75rem, font-mono): Compteurs numériques des onglets, notes Google, nombre d'avis et badges de statut (`text-xs font-mono`).

### Named Rules
**The Numeric Scannability Rule.** Les compteurs de résultats, notes Google et volumétries de prospection sont systématiquement typés en fonte mono (`font-mono`) pour garantir un alignement tabulaire immédiat lors du scan visuel.

## Layout

Modèle d'interface en split-view (panneau latéral de prospection + vue cartographique/détaillée) s'adaptant de manière fluide entre écrans desktop et mobiles.

### Spatial Model & Grid
- **Desktop (>= 1024px)** : Vue scindée en colonnes coordonnées avec panneau latéral de largeur fixe/flexible (400px - 480px) et surface cartographique ou vue combinée plein écran.
- **Mobile (< 1024px)** : Navigation unifiée par onglets/vues avec volets coulissants et modales pleine hauteur (`h-auto` ou plein écran adapté).
- **Densité & Espacement** : Rythme modulaire compact basé sur des pas de 8px (`p-2`, `p-3`, `p-4`, `p-6`) favorisant l'affichage dense des métadonnées de prospection.

### Named Rules
**The No-Crop Dynamic Content Rule.** Les données textuelles variables ou issues de l'IA (pistes d'angles, opportunités, résumés, descriptions) ne doivent **jamais être rognées ou coupées** : interdiction absolue du `line-clamp` sur les conteneurs avec padding interne, hauteur automatique obligatoire (`h-auto`) et rupture systématique des mots (`break-words`).

## Elevation & Depth

Le système repose sur un style "presque flat" inspiré de macOS, privilégiant des bordures transparentes très douces à faible opacité.

### Shadow Vocabulary
- **Micro-élévation** (`box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02)`): Appliquée systématiquement sur toutes les cartes et panneaux pour créer un détachement subtil du fond canvas.
- **Bouton Primary** (`box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08)`): Donne un léger volume tactile au bouton noir principal.
- **Status Glow** (`box-shadow: 0 0 6px rgba(16, 185, 129, 0.5)`): Appliqué sur les pastilles de couleur pour simuler un rétro-éclairage lumineux (vert, ambre, bleu).
- **Modales** (`box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)`): Élévation réservée aux fenêtres modales et dialogues d'envoi.

### Named Rules
**The Flat-By-Default Rule.** L'application évite les ombres profondes (`shadow-lg`, `shadow-xl`) sauf pour les modales. Les surfaces standard sont à plat avec une bordure transparente douce.

## Shapes

Vocabulaire de formes géométriques douces et cohérentes, renforçant la distinction claire entre conteneurs structurels et éléments d'action cliquables.

- **Cartes & Conteneurs principaux** : Rayon de 16px (`rounded-2xl`) offrant une enveloppe moderne et chaleureuse.
- **Boutons standard & Inputs** : Rayon intermédiaire de 12px (`rounded-xl`) assurant une surface d'interaction ergonomique.
- **Petits boutons & Badges** : Rayon de 8px (`rounded-lg`) ou pilule complète (`rounded-full`) pour les pastilles de filtre.

### Named Rules
**The Structural Radius Rule.** Les conteneurs majeurs de niveau supérieur utilisent strictement un rayon de 16px (`rounded-2xl`), tandis que les éléments cliquables et contrôles interactifs sont contraints à un rayon de 12px (`rounded-xl`) pour maintenir une hiérarchie tactile immédiate.

## Components

Composants d'interface sobres, réactifs et typés pour l'efficacité opérationnelle.

### Buttons
- **Shape:** Rayon de 12px (`rounded-xl`)
- **Primary:** Fond sombre inversé (`bg-primary text-primary-fg`), padding ergonomique (`px-4 py-2.5`), micro-ombre portée
- **Secondary:** Fond neutre doux (`bg-secondary text-secondary-fg`), bordure subtile (`border border-border-subtle`)
- **Hover / Focus:** Transition rapide de 150ms (`transition-colors duration-150`), anneau de focus accessible

### Cards / Containers
- **Corner Style:** Rayon de 16px (`rounded-2xl`)
- **Background:** Fond de surface pur (`bg-surface`)
- **Shadow Strategy:** Micro-élévation subtile (`shadow-micro`) et bordure légère (`border border-border-subtle`)
- **Internal Padding:** Rythme confortable de 16px à 20px (`p-4` à `p-5`)

### Inputs / Fields
- **Style:** Fond feutré (`bg-surface-subtle`), bordure douce (`border border-border-subtle`), rayon de 12px (`rounded-xl`)
- **Focus:** Accentuation de la bordure (`border-border-strong`), suppression de l'outline natif
- **Typography:** Texte standard (`text-sm text-text-main`), placeholder atténué (`placeholder:text-text-muted`)

### Badges & Chips
- **Style:** Fond teinté à faible opacité (succès, alerte, info ou neutre), texte contrasté associé
- **Indicator:** Pastille lumineuse circulaire avec effet Status Glow
- **Shape:** Rayon pilule (`rounded-full`) ou modéré (`rounded-lg`)

## Do's and Don'ts

Directives concrètes et inaltérables pour la conception et l'évolution des écrans.

### Do:
- **Do** utiliser systématiquement les tokens sémantiques (`bg-canvas`, `bg-surface`, `text-main`, `text-muted`, `border-border-subtle`).
- **Do** imposer `h-auto` et `break-words` sur tous les conteneurs de contenu textuel généré ou dynamique.
- **Do** ajouter l'effet lumineux (`Status Glow`) sur les pastilles colorées d'indicateur d'état.
- **Do** vérifier systématiquement la lisibilité en thème clair et en thème sombre (`data-theme="dark"`).

### Don't:
- **Don't** utiliser de classes Tailwind de palette brute (`zinc-900`, `zinc-100`, `gray-500`, etc.) dans les composants.
- **Don't** appliquer de `line-clamp` sur des blocs avec padding interne sous peine de tronquer visuellement le texte IA.
- **Don't** utiliser d'ombres lourdes (`shadow-lg`, `shadow-2xl`) sur des éléments à plat ou des cartes standards.
- **Don't** introduire de labels ou sous-titres verbeux superflus ("Cliquez ici pour...") quand l'action est évidente.
