import { Router } from "express";
import { sendGmailMessage, createGmailDraft } from "../services/gmailService.js";

export const gmailRouter = Router();

// Middleware to extract Bearer token
function getBearerToken(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7).trim();
}

// Send email via Gmail
gmailRouter.post("/send", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        error: "Jeton d'autorisation Gmail manquant. Veuillez vous reconnecter.",
        isAuthError: true,
      });
    }

    const { to, subject, body } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ error: "Destinataire, objet et corps requis" });
    }

    const result = await sendGmailMessage(token, to, subject, body);
    return res.json({ success: true, messageId: result.id });
  } catch (error: any) {
    console.error("Gmail send error:", error);
    const status = error.status || (error.isAuthError ? 401 : 500);
    return res.status(status).json({
      error: error.message || "Erreur lors de l'envoi",
      isAuthError: error.isAuthError || status === 401,
    });
  }
});

// Create draft via Gmail
gmailRouter.post("/draft", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        error: "Jeton d'autorisation Gmail manquant. Veuillez vous reconnecter.",
        isAuthError: true,
      });
    }

    const { to, subject, body } = req.body;
    const result = await createGmailDraft(token, to, subject, body);
    return res.json({ success: true, draftId: result.id });
  } catch (error: any) {
    console.error("Gmail draft error:", error);
    const status = error.status || (error.isAuthError ? 401 : 500);
    return res.status(status).json({
      error: error.message || "Erreur lors de la création du brouillon",
      isAuthError: error.isAuthError || status === 401,
    });
  }
});
