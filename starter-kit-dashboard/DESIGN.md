---
name: Minimalist Dashboard Base
theme:
  base: "Palette Zinc (Monochromatique)"
  background: "Très clair, cassant le blanc pur"
  surfaces: "Blanc pur pour détacher les cartes"
  accents: "Couleurs sémantiques douces (émeraude, ambre, bleu, rose)"
---

# 🎨 Design System : Socle (Starter Kit)
> *Ce socle d'interface garantit une expérience premium, robuste et standardisée. Il définit les intentions visuelles que les agents doivent traduire techniquement.*

## Overview
**Creative North Star: "L'Efficacité Silencieuse"**
L'interface s'efface au profit de la donnée. Le design utilise la hiérarchie des gris, le contraste des surfaces et l'absence de bordures dures pour guider l'œil sans bruit visuel.

---

## 1. Principes Visuels Fondamentaux (Impeccable Rules)

### The Flat-By-Default Rule (Élévation)
L'application refuse les ombres profondes pour les éléments de surface. Les cartes et panneaux reposent à plat, simplement détachés par une micro-élévation imperceptible et une bordure extrêmement douce. Les ombres prononcées sont le privilège exclusif des éléments flottants (modales, menus déroulants, popovers).

### The Status Glow Rule (Sémantique lumineuse)
Les couleurs sémantiques sont rares. Lorsqu'un indicateur d'état est actif (une pastille, un badge), il doit émettre un halo lumineux diffus de sa propre couleur, simulant une diode LED allumée dans une interface autrement mate.

---

## 2. Layout Rules (Comportement et Résilience)
*Laissez l'agent déduire les propriétés CSS adéquates pour respecter ces comportements.*

### Fluidité des Listes et Conteneurs
Les conteneurs de listes ne doivent jamais avoir de hauteur statique bloquante. Ils doivent intelligemment absorber l'espace vertical disponible et déléguer le défilement à leur contenu interne, empêchant ainsi le parent de déborder.

### Safe Wrap des Zones d'Actions
Les barres d'outils et les pieds de page contenant des boutons doivent être conçus pour survivre au manque d'espace. Ils doivent s'enrouler naturellement à la ligne suivante plutôt que de compresser ou tronquer les éléments interactifs.

### Résilience au Contenu IA (Anti-Truncation)
Le texte généré par l'IA ou les bases de données est imprévisible. Ne contraignez jamais visuellement ces textes avec des coupes brutales (ellipses) s'ils sont dans des espaces confinés (comme des cartes avec padding). Privilégiez l'expansion verticale naturelle et forcez la césure des mots démesurés.

### Modales Sécurisées
Une modale doit posséder une architecture stricte : un en-tête fixe, un pied fixe, et un corps qui gère seul son défilement. Le fond (backdrop) derrière la modale ne doit jamais pouvoir être défilé.

---

## 3. UX Principles & Tone of Voice

### Sobriété & Évidence
- Remplacez les labels verbeux par des placeholders pertinents dès que le contexte est clair.
- Éliminez toute instruction prescriptive ("Cliquez ici pour", "Ce panneau sert à"). L'affordance visuelle doit suffire.

### Hiérarchie des Actions
- Une seule action visuellement pleine et proéminente par vue.
- Les actions secondaires ou destructrices s'effacent visuellement (boutons fantômes, grisés) jusqu'au survol de l'utilisateur.

### Responsive (Touch vs Click)
- Sur mobile, les cibles tactiles principales (boutons d'action) doivent s'étendre sur toute la largeur disponible pour être manipulées au pouce sans effort.
- Sur ordinateur, elles reprennent une dimension adaptée à leur contenu.
