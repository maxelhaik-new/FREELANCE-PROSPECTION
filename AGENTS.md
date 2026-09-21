# Directives et Règles Agents

## Règles relatives à l'API Gemini
- **Modèle immuable** : Utiliser exclusivement l'identifiant `gemini-flash-latest` configuré pour ce projet (pointe vers la dernière version de Flash). Ne jamais le modifier ou le remplacer sans demande explicite.
- **Interdiction absolue** : Ne jamais proposer ni utiliser `gemini-1.5-flash`.

## Règles de workflow
- Demander systématiquement l'accord manuel avant d'exécuter un agent navigateur.
- **Audit UI / Browser Agent** : Ne pas se limiter au DOM. Captures d'écran obligatoires (`page.screenshot()`) sur Desktop (1440px) et Mobile (375px) avec données réalistes, inspection visuelle des défauts et intégration dans `walkthrough.md`.
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

