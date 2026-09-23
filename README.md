<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.
https://ai.studio/apps/bd408dce-a016-4c31-9d2e-ca4b616d2f32

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
   `npm run dev`

## Déploiement sur Vercel

Le projet est configuré pour être déployé sur Vercel sans configuration complexe. Le frontend (React + Vite) sera servi de façon statique, et le backend (Express) sera exécuté sous forme de fonctions Serverless (`api/index.ts`).

### Étapes restantes à faire manuellement :

1. **Créer le projet sur Vercel**
   - Connectez-vous à Vercel et importez votre dépôt GitHub.
   - Assurez-vous que le **Framework Preset** est réglé sur `Vite`.
   - Vercel configurera automatiquement `npm run build` et le dossier de sortie `dist`.

2. **Configurer les Variables d'Environnement**
   Dans les réglages du projet Vercel (Settings > Environment Variables), ajoutez toutes les variables présentes dans votre `.env` local :
   - Les clés Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.)
   - Les clés Google/Firebase (le cas échéant)
   - Toute autre API clé utilisée par votre serveur Express.

3. **Déployer**
   - Cliquez sur Deploy.
   - Vercel va construire le frontend (`dist`) et préparer la fonction Serverless pour le backend Node.js (`api/index.ts`).
   - Vos routes API (`/api/*`) seront automatiquement redirigées vers votre backend Express grâce au fichier `vercel.json` fraîchement ajouté.