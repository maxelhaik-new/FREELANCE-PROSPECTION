---
name: Freelance Automation
description: Outil de pilotage pour freelance (Coachings, Rétributions, Facturation).
colors:
  primary: "#18181b"
  secondary: "#f4f4f5"
  neutral-bg: "#fafafa"
  surface: "#ffffff"
  border: "rgba(228, 228, 231, 0.7)"
  success-bg: "#ecfdf5"
  success-text: "#065f46"
  warning-bg: "rgba(245, 158, 11, 0.15)"
  warning-text: "#78350f"
  error-bg: "rgba(136, 19, 55, 0.35)"
  error-text: "#fb7185"
  info-bg: "rgba(30, 58, 138, 0.45)"
  info-text: "#93c5fd"
typography:
  display:
    fontFamily: "sans-serif"
    fontSize: "1rem"
    fontWeight: 600
  body:
    fontFamily: "sans-serif"
    fontSize: "0.875rem"
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
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
---

# Design System: Freelance Automation

## Overview

**Creative North Star: "L'Efficacité Silencieuse"**

Le design de cette application privilégie la clarté et l'action. Conçu pour le mode "Operate", l'interface s'efface au profit des données (heures de coaching, factures en attente). Inspiré de l'écosystème macOS/iOS, il utilise des ombres extrêmement diffuses, des bordures très fines et transparentes (`zinc-200/70`), et des aplats de gris pour hiérarchiser l'information sans bruit visuel. 

**Key Characteristics:**
- **Zéro fioriture** : Les actions principales sont pleines (`bg-zinc-900`), les secondaires sont grises (`bg-zinc-100`) ou fantômes.
- **Contraste doux** : Le fond de l'application est en `#FAFAFA`, et les cartes en `#FFFFFF` pour créer un détachement subtil.
- **Indicateurs lumineux** : L'état du système est indiqué par des points de couleur (vert, ambre) souvent animés (pulse) ou dotés d'un effet lumineux (shadow).

## Colors

La palette est presque monochromatique (Zinc), ponctuée de couleurs sémantiques très ciblées pour les statuts.

### Primary
- **Zinc Sombre** (#18181b / `zinc-900`): Utilisé pour le texte principal (titres) et les boutons d'appel à l'action. C'est l'ancre visuelle de l'interface.

### Secondary
- **Zinc Clair** (#f4f4f5 / `zinc-100`): Utilisé pour les boutons secondaires, les arrière-plans de badges neutres et les états de survol.

### Neutral
- **Fond de l'application** (#fafafa / `bg-[#FAFAFA]`): Permet aux cartes blanches de ressortir.
- **Bordures Douces** (rgba(228, 228, 231, 0.7) / `border-zinc-200/70`): Délimite les cartes et sections sans alourdir le regard.

### Sémantique (Statuts)
- **Succès** (`emerald-50` / `emerald-800`): Pour tout ce qui est "À jour" ou "Connecté". Le point indicateur utilise `emerald-500`.
- **Alerte** (`amber-500/15` / `amber-900`): Pour les éléments "À facturer". Le point indicateur utilise `amber-500`.
- **Erreur & Suppression** (`rose-50` / `rose-700`): Pour les actions de suppression et les états d'erreur critique. Le point indicateur utilise `rose-500`.

### Named Rules
**The Status Glow Rule.** Les indicateurs de statut (les petits points dans les badges) portent toujours une ombre portée de leur propre couleur pour simuler une LED allumée (`shadow-[0_0_6px_rgba(...)]`).

## Typography

**Display Font:** Sans-serif système (Inter, SF Pro)
**Body Font:** Sans-serif système

**Character:** Moderne, dense, et utilitaire. Conçue pour lire des chiffres, des tableaux et des statuts rapidement. L'utilisation du `tracking-tight` (letter-spacing réduit) sur les titres renforce l'aspect "dashboard professionnel".

### Hierarchy
- **Display** (600, 1rem, `text-base`): Titres des panneaux principaux.
- **Headline** (600, 0.875rem, `text-sm`): Titres de sections dans les cartes.
- **Body** (400, 0.875rem, `text-sm` / `text-xs`): Textes descriptifs, dates, statuts.
- **Label / Mono** (500, 11px / 10px, `font-mono`): Utilisé pour les taux horaires (ex: "55 €/h") ou les compteurs (pastilles numériques).

## Layout

L'application suit une structure fluide et aérée. L'espacement standard entre les grands blocs est de `space-y-5`. Le padding interne des cartes varie entre `p-4 sm:p-5` (pour les contrôles denses) et `p-5 sm:p-6` (pour les vues détaillées).

## Elevation & Depth

Le système repose sur un style "presque flat". 

### Shadow Vocabulary
- **Micro-élévation** (`shadow-[0_1px_3px_rgba(0,0,0,0.02)]`): Appliquée systématiquement sur toutes les cartes et le PanelHeader. Crée un très léger détachement du fond `#FAFAFA`.
- **Bouton Primary** (`shadow-[0_1px_2px_rgba(0,0,0,0.08)]`): Donne un léger volume au bouton noir principal.
- **Status Glow** (`shadow-[0_0_6px_rgba(...)]`): Appliqué sur les pastilles de couleur pour simuler la lumière.

### Named Rules
**The Flat-By-Default Rule.** L'application évite les ombres profondes (`shadow-lg`, `shadow-xl`) sauf pour les modales (ex: Modale de confirmation d'envoi). Les surfaces standard sont à plat avec une bordure transparente.

## Shapes

Le langage des formes est résolument arrondi, contrastant avec la rigueur des données :
- **Cartes & Conteneurs principaux** : `rounded-2xl` (16px).
- **Boutons standard** : `rounded-xl` (12px).
- **Petits boutons & Badges** : `rounded-lg` ou `rounded-full`.

## Components

### Buttons
- **Shape:** Arrondi prononcé (12px / `rounded-xl` pour taille standard).
- **Primary:** Fond Zinc-900, texte blanc. Réduction au clic (`active:scale-95`).
- **Secondary:** Fond Zinc-100, texte Zinc-800.
- **Outline:** Fond blanc, bordure Zinc-200/80, texte Zinc-600.

### Cards / Containers
- **Corner Style:** 16px (`rounded-2xl`).
- **Background:** Blanc pur.
- **Shadow Strategy:** Micro-élévation (`shadow-[0_1px_3px_rgba(0,0,0,0.02)]`).
- **Border:** `border-zinc-200/70`.
- **Internal Padding:** Généralement `p-4 sm:p-5` (modéré) ou `p-5 sm:p-6` (large).

### Badges de Statut
- **Shape:** Pillule (`rounded-full`).
- **Style:** Texte gras sur fond très clair de la même teinte (ex: texte emeraude foncé sur fond emeraude très clair), avec une bordure semi-transparente.
- **Dot:** Inclusion d'un point `w-2 h-2` de couleur vive avec un glow. L'état critique (À facturer) est animé (`animate-pulse`).

## Do's and Don'ts

### Do:
- **Do** utiliser `text-zinc-500` pour les textes secondaires, afin de préserver la hiérarchie.
- **Do** utiliser l'effet `active:scale-95` sur tous les éléments cliquables majeurs pour un feedback tactile.
- **Do** centraliser les compteurs dans les boutons avec un style `font-mono`.

### Don't:
- **Don't** utiliser des couleurs criardes pour le layout de base. La couleur est réservée aux statuts (vert, orange, rouge).
- **Don't** appliquer de `shadow-lg` sur des conteneurs statiques. Seuls les éléments flottants (modales, popovers) y ont droit.
