import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { app } from "./server/app";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Vite middleware (dev) or static files serving (prod)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur Prospection démarré sur http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Erreur fatale au lancement du serveur:", err);
  process.exit(1);
});
