# Directives et Règles Agents

## Règles relatives à l'API Gemini
- **Modèle immuable** :
Ne me propose jamais de changer le modele IA. Les modèles que tu connais sont obsolètes. 

Pour les modeles IA de google les variables à utiliser sont les variables evolutives gemini-flash-latest pour le modele Flash et gemini-pro-latest pour le modèle Pro (pas d'obsolescence)

### Browser Agent
Préviens moi toujours dans le chat quand tu utilise un browser agent même si c'est demandé dans les skills que tu parcoures, cela me permettra de comprendre ce que tu fais. Dans la mesure du possible, joue le browser agent en mode visible (pas headless) mais sans focus (je peux effectuer d'autres activités sur mon ordinateur sans que mon navigateur apparaisse en application on focus)

Si tu fais un `walkthrough.md`, integre des captures du browser agent dedans
- Réponses concises et factuelles dans le chat.
- **Anti-duplication stricte des artefacts** : Ne jamais résumer ni répéter dans le chat le contenu de `implementation_plan.md` ou `walkthrough.md`. Se limiter au lien vers l'artefact (1 à 2 phrases max) et aux éventuelles questions requérant un choix utilisateur, afin de minimiser les tokens sortants.

## Stack technique
- **Frontend** : React 19, Vite, Tailwind CSS v4, Motion, Lucide
- **Backend** : Express (Node.js/TypeScript)
- **Base de données** : Supabase (PostgreSQL, RLS)
- **Authentification & Intégrations** : Firebase Auth (Google Sign-In / scopes Gmail)

## Configuration MCP Supabase
> ⚠️ **Multi-projet Supabase** : Utiliser **exclusivement** le serveur MCP `supabase-freelance` (`cjbniohrsrxzfmbyotbv`). Ne jamais appeler `supabase-wander` (projet Wander tiers).

## Règles de code & Bonnes pratiques
- Respecter `./DESIGN.md` pour toute modification UI.
- **Contenu dynamique & Non-rognage** : Aucun texte dynamique / IA ne doit être cropé. Interdiction de `line-clamp` sur les conteneurs avec padding ; imposer systématiquement `h-auto` et `break-words`.
- **Sobriété UI & Textes** : Interdire les sous-titres redondants ou explications de type "Cliquez ici pour..." ou "Ce panneau permet de...". Remplacer les labels verbeux par un placeholder pertinent lorsque le sens est évident. Les actions secondaires doivent être discrètes.
- Pas de `any` en TypeScript.
- Réutiliser les composants de base de `src/components/ui/` (ne pas recréer de boutons/inputs).
- Sécuriser les accès Supabase (politiques RLS et scoping par utilisateur).
- Ne jamais commiter de secrets ou clés sensibles (`GEMINI_API_KEY`, tokens, etc.).

## Definition of Done (DoD)
Une tâche est considérée terminée uniquement si l'ensemble des contrôles suivants passe à 100% :
1. Typecheck : `npm run typecheck`
2. Tests : `npm test`
3. Build : `npm run build`

