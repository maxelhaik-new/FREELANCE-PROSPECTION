import express from "express";
import { prospectsRouter } from "./routes/prospects.js";
import { gmailRouter } from "./routes/gmail.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  // Mount API routes
  app.use("/api/prospects", prospectsRouter);
  app.use("/api/gmail", gmailRouter);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
}

export const app = createApp();
