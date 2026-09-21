import dotenv from "dotenv";
dotenv.config();

import { autocompleteCityNew, searchPlacesNew } from "../server/services/placesService";
import { searchLocalProspects, generateProspectEmail } from "../server/services/geminiService";

interface SmokeCheckResult {
  name: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
  durationMs: number;
}

const results: SmokeCheckResult[] = [];

async function runCheck(name: string, fn: () => Promise<string>): Promise<void> {
  const start = Date.now();
  try {
    const detail = await fn();
    const durationMs = Date.now() - start;
    results.push({ name, status: "PASS", detail, durationMs });
    console.log(`  ✅ [PASS] ${name} (${durationMs}ms) - ${detail}`);
  } catch (err: any) {
    const durationMs = Date.now() - start;
    results.push({ name, status: "FAIL", detail: err?.message || String(err), durationMs });
    console.error(`  ❌ [FAIL] ${name} (${durationMs}ms) - ${err?.message || String(err)}`);
  }
}

async function smokeTest() {
  console.log("\n=======================================================");
  console.log("🔍 SMOKE TEST API & SERVICES LIVE (Zero-Mock Verification)");
  console.log("=======================================================\n");

  const placesKey = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;

  console.log(`Places API Key detected: ${placesKey ? "Oui (longueur " + placesKey.length + ")" : "NON"}`);
  console.log(`Gemini API Key detected: ${geminiKey ? "Oui (longueur " + geminiKey.length + ")" : "NON"}\n`);

  if (!placesKey && !geminiKey) {
    console.error("❌ Aucune clé API configurée dans l'environnement (.env). Le smoke test nécessite des clés valides.");
    process.exit(1);
  }

  // 1. Check Places Autocomplete (New)
  await runCheck("Google Places API (New) - Autocomplete Ville", async () => {
    const suggestions = await autocompleteCityNew("Lyon");
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error("Aucune suggestion retournée pour 'Lyon'");
    }
    const match = suggestions.find((s) => s.mainText.toLowerCase().includes("lyon") || s.text.toLowerCase().includes("lyon"));
    if (!match) {
      throw new Error(`Suggestions reçues mais aucune ne mentionne Lyon: ${JSON.stringify(suggestions)}`);
    }
    return `${suggestions.length} suggestions trouvées (ex: "${match.mainText}" [${match.placeId}])`;
  });

  // 2. Check Places Text Search (New)
  await runCheck("Google Places API (New) - Recherche Textuelle Lieux", async () => {
    const places = await searchPlacesNew({ city: "Lyon", sector: "Boulangerie" });
    if (!Array.isArray(places)) {
      throw new Error("Le résultat n'est pas un tableau de lieux");
    }
    return `${places.length} établissements trouvés sur Google Places`;
  });

  // 3. Check Complete Prospect Pipeline (Places API + Fallback / Normalisation)
  await runCheck("Prospect Pipeline - Acquisition de prospects locaux", async () => {
    const searchResult = await searchLocalProspects({
      city: "Lyon",
      sector: "Boulangerie",
      forceRefresh: true,
      freelanceProfile: {
        title: "Développeur Web",
        services: "Création de site vitrine",
      },
    });

    const prospects = searchResult?.prospects;

    if (!Array.isArray(prospects) || prospects.length === 0) {
      throw new Error("Aucun prospect acquis par le pipeline");
    }

    const first = prospects[0];
    if (!first.id || !first.name || !first.activity || !first.location) {
      throw new Error(`Prospect incomplet: ${JSON.stringify(first)}`);
    }

    return `${prospects.length} prospects générés/acquis. Exemple: "${first.name}" (${first.activity} - ${first.location})`;
  });

  // 4. Check Gemini Email Generation
  await runCheck("Gemini AI Service - Génération d'email personnalisé", async () => {
    const email = await generateProspectEmail({
      prospect: {
        id: "smoke-test-p1",
        name: "Boulangerie Saint-Jean",
        activity: "Boulangerie & Pâtisserie",
        location: "Lyon 5",
        status: "to_contact",
        identified: false,
        keyAngle: "Refonte de site et commande en ligne",
      },
      freelanceProfile: {
        title: "Développeur Web Full-Stack",
        services: "Création de sites rapides et modernes",
        valueProposition: "Augmentez vos commandes directes sans intermédiaire",
      },
      objective: "Proposition de refonte site web",
      tone: "professional",
    });

    if (!email || !email.subject || !email.body) {
      throw new Error(`Structure email invalide: ${JSON.stringify(email)}`);
    }

    return `Email généré avec succès. Objet: "${email.subject.slice(0, 45)}..."`;
  });

  // Summary
  console.log("\n=======================================================");
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`📊 BILAN SMOKE TEST : ${passed} / ${results.length} PASS`);
  console.log("=======================================================\n");

  if (failed > 0) {
    console.error(`❌ ${failed} vérification(s) live ont échoué.`);
    process.exit(1);
  } else {
    console.log("🎉 Tous les services externes répondent correctement en conditions réelles.");
    process.exit(0);
  }
}

smokeTest().catch((err) => {
  console.error("Erreur fatale smoke test:", err);
  process.exit(1);
});
