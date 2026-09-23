import { Router } from "express";
import { searchLocalProspects, generateProspectEmail } from "../services/geminiService.js";
import { autocompleteCityNew } from "../services/placesService.js";

export const prospectsRouter = Router();

// Autocomplete cities via Google Places API (New)
prospectsRouter.get("/autocomplete", async (req, res) => {
  try {
    const query = typeof req.query.q === "string" ? req.query.q : "";
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await autocompleteCityNew(query);
    return res.json({ suggestions });
  } catch (error: any) {
    console.error("Erreur autocomplete:", error);
    return res.status(500).json({ error: error.message || "Erreur autocomplete" });
  }
});

// Search prospects in a given sector and city
prospectsRouter.post("/search", async (req, res) => {
  try {
    const { sector, city, specialty, freelanceProfile, forceRefresh } = req.body;
    if (!sector || !city) {
      return res.status(400).json({ error: "Secteur et ville requis" });
    }

    const result = await searchLocalProspects({
      sector,
      city,
      specialty,
      freelanceProfile,
      forceRefresh,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("Erreur de recherche prospects:", error);
    return res.status(500).json({ error: error.message || "Erreur lors de la recherche" });
  }
});

// Generate bespoke prospect email
prospectsRouter.post("/generate-email", async (req, res) => {
  try {
    const { prospect, freelanceProfile, tone, objective, forceRefresh } = req.body;
    if (!prospect) {
      return res.status(400).json({ error: "Prospect requis" });
    }

    const result = await generateProspectEmail({
      prospect,
      freelanceProfile,
      tone,
      objective,
      forceRefresh,
    });

    return res.json(result);
  } catch (error: any) {
    console.error("Erreur génération email:", error);
    return res.status(500).json({ error: error.message || "Erreur de génération du mail" });
  }
});
