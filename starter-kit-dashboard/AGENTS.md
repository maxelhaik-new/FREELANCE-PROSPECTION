# 🚀 Starter Kit : Règles Agents & Workflow (Vibecoding)
> *Ce socle est agnostique et doit être conservé pour tout nouveau projet.*

## 1. Comportement de l'Agent & Artefacts
- **Immutabilité du Modèle** : Utilisez strictement le modèle IA configuré. Ne proposez jamais de downgrade vers un modèle obsolète ou plus léger sans consigne explicite de l'utilisateur.
- **Économie de Tokens (Anti-Perroquet)** : Ne résumez jamais le contenu des artefacts (`implementation_plan.md`, `walkthrough.md`) dans le chat. Contentez-vous d'un lien markdown vers le fichier et posez uniquement les questions requérant un choix utilisateur. Soyez concis et factuel.

## 2. Protocole d'Exécution Autonome (Séquence `/goal`)
Lorsqu'une exécution complète est demandée (via `/goal`), l'Orchestrateur DOIT suivre cette séquence stricte, sans s'arrêter et sans demander d'aide intermédiaire :
1. **Pre-Flight Check** : Lire `PRODUCT.md`. En déduire les API/services requis. Utiliser `ask_question` pour réclamer les clés à l'utilisateur. Générer le `.env` de manière autonome.
2. **Infrastructure** : Gérer la configuration de la BDD (via MCP Supabase/Firebase) avant de coder.
3. **Délégation** : Invoquer des sous-agents pour développer en parallèle (modèle PRO pour l'UI et la logique).
4. **Validation (DoD)** : Coder la suite de tests (Vitest). Lancer `npm run test:all`. Si échec : invoquer un sous-agent QA pour debugger en boucle jusqu'au succès 100%.
5. **Check-out** : Effectuer le premier `git commit` fonctionnel et notifier l'utilisateur de la fin du processus.

## 3. Routage des Modèles (Workflow Multi-Agents)
- **PRO (`inherit`)** : Obligatoire pour l'Orchestrateur, les sous-agents de développement, et tout agent touchant à l'UI ou au contenu visuel.
- **FLASH (`gemini-flash-latest`)** : Strictement confiné à la tuyauterie invisible (correction de types `tsc`, scripts bash purs). Interdiction de l'utiliser pour générer ou auditer du code JSX/DOM.
- **Pattern Architecte / Ouvrier** : Si FLASH est utilisé, l'Orchestrateur (PRO) doit lui fournir un plan déterministe et interdire toute "liberté créative" sur les textes.

## 4. Stratégie de Tests (Pyramide) & E2E
- **Logique & Composants (Vitest)** : Couvrez systématiquement la nouvelle logique métier avec Vitest. Priorité absolue.
- **Parcours Clés (Playwright)** : Ne créez pas un test E2E par feature. Mettez à jour les scripts E2E des "Golden Paths" existants.
- **Validation Visuelle E2E** : Les scripts E2E doivent impérativement générer des captures d'écran (Desktop/Mobile). Le workflow n'est "Done" que lorsque les captures sont intégrées au `walkthrough.md`.

## 5. Architecture & Résilience du Code
- **Hygiène d'Import** : Lors d'imports de prototypes, moduler le backend, éliminer le prop-drilling (utiliser Context) et les valeurs hardcodées.
- **Résilience des Effets de Bord** : 
  - Ne conditionnez jamais des side-effects de prod derrière des flags de test (`process.env.NODE_ENV === 'test'`). Mockez.
  - Utilisez une `skipRef` (ref boolean) pour protéger les `useEffect` contre les boucles infinies.

## 6. Setup Base de données
- **Sécurité "Default-Deny"** : Le RLS doit être activé sur toutes les tables dès leur création.
- **Scoping Utilisateur** : Toute table métier doit inclure un champ `user_id uuid references auth.users`.
- **MCP Config** : Vérifier en permanence que le serveur MCP cible le bon projet.
