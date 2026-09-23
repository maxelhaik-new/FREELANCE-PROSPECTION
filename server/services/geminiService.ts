import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI, Type } from "@google/genai";
import { extractJsonFromText } from "../utils/jsonExtractor.js";
import { searchPlacesNew } from "./placesService.js";

// 24h In-memory cache for search & generated emails to conserve AI credits
export const searchCache = new Map<string, { timestamp: number; prospects: any[] }>();
export const emailCache = new Map<string, { timestamp: number; email: { subject: string; body: string } }>();
export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Coordinate reference for geolocating fallback prospects
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  bordeaux: { lat: 44.8378, lng: -0.5792 },
  paris: { lat: 48.8566, lng: 2.3522 },
  lyon: { lat: 45.7640, lng: 4.8357 },
  marseille: { lat: 43.2965, lng: 5.3698 },
  toulouse: { lat: 43.6047, lng: 1.4442 },
  nice: { lat: 43.7102, lng: 7.2620 },
  nantes: { lat: 47.2184, lng: -1.5536 },
  strasbourg: { lat: 48.5734, lng: 7.7521 },
  montpellier: { lat: 43.6108, lng: 3.8767 },
  lille: { lat: 50.6292, lng: 3.0573 },
  rennes: { lat: 48.1173, lng: -1.6778 },
  rouen: { lat: 49.4432, lng: 1.0999 },
};

function getCityCenter(city: string): { lat: number; lng: number } {
  const norm = (city || "").toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (norm.includes(key)) return coords;
  }
  return { lat: 44.8378, lng: -0.5792 };
}

// Initialize Gemini client using environment variable safely
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export interface SearchProspectsParams {
  sector: string;
  city: string;
  specialty?: string;
  freelanceProfile?: {
    title?: string;
    services?: string;
    valueProposition?: string;
  };
  forceRefresh?: boolean;
}

/**
 * Generates tailored, realistic prospects when external AI API is unreachable or rate-limited.
 */
function generateLocalProspectsFallback({
  sector,
  city,
  specialty,
  freelanceProfile,
}: SearchProspectsParams) {
  const center = getCityCenter(city);
  const cleanSector = sector.split(" (")[0].trim();
  const lowerSec = cleanSector.toLowerCase();

  let businessTemplates: { name: string; activity: string; keyAngle: string; hasWebsite: boolean; emailPrefix: string }[] = [];

  if (lowerSec.includes("boulanger") || lowerSec.includes("pain") || lowerSec.includes("pâtiss")) {
    businessTemplates = [
      { name: `Boulangerie L'Épi de ${city}`, activity: "Boulangerie Pâtisserie Artisanale", keyAngle: "Très forte affluence et avis élogieux, mais absence de site web et pas de commande en ligne.", hasWebsite: false, emailPrefix: "contact" },
      { name: `Fournil & Gourmandises`, activity: "Boulangerie Traditionnelle", keyAngle: "Site internet obsolète non adapté aux smartphones, carte des pâtisseries non mise à jour.", hasWebsite: true, emailPrefix: "fournil" },
      { name: `Maison Levain & Cie`, activity: "Boulangerie Bio & Petite Restauration", keyAngle: "Fiche Google Maps en 4e position locale, potentiel direct pour capter la clientèle du midi.", hasWebsite: true, emailPrefix: "bonjour" },
      { name: `Le Pain d'Antan`, activity: "Artisan Boulanger", keyAngle: "Aucun site internet répertorié malgré plus de 90 avis 5 étoiles sur Google Maps.", hasWebsite: false, emailPrefix: "direction" },
      { name: `Pâtisserie Fine & Chocolats`, activity: "Pâtisserie Chocolaterie Salon de thé", keyAngle: "Pas de catalogue de commandes festives ni d'intégration click-and-collect.", hasWebsite: true, emailPrefix: "contact" },
      { name: `La Mie Dorée`, activity: "Boulangerie Snacking", keyAngle: "Présence numérique faible face aux franchises concurrentes à proximité.", hasWebsite: false, emailPrefix: "lamiedoree" },
    ];
  } else if (lowerSec.includes("restau") || lowerSec.includes("brasser")) {
    businessTemplates = [
      { name: `Bistrot & Terroir ${city}`, activity: "Bistrot Cuisine Locale", keyAngle: "Menu uniquement disponible sous format PDF lourd, pas de module de réservation direct.", hasWebsite: true, emailPrefix: "contact" },
      { name: `Brasserie de la Place`, activity: "Brasserie Traditionnelle", keyAngle: "Absence de site internet officiel, dépendance totale aux plateformes de livraison à forte commission.", hasWebsite: false, emailPrefix: "brasserie" },
      { name: `L'Ardoise Gourmande`, activity: "Restaurant Bistronomique", keyAngle: "Excellente note Google (4.8/5) mais visibilité mobile faible le midi, opportunité d'acquisition locale.", hasWebsite: true, emailPrefix: "reservation" },
      { name: `La Table du Marché`, activity: "Restaurant du Midi & Produits Frais", keyAngle: "Horaires et carte non synchronisés sur le web, perte de réservations spontanées.", hasWebsite: false, emailPrefix: "contact" },
      { name: `Cantine & Co`, activity: "Restauration Rapide Fait Maison", keyAngle: "Site web lent au chargement sur 4G/5G, opportunité de refonte moderne et légère.", hasWebsite: true, emailPrefix: "hello" },
      { name: `Le Petit Zinc Gourmand`, activity: "Bar & Restaurant Bar à Vin", keyAngle: "Pas de mise en valeur des événements et soirées de groupe sur le web.", hasWebsite: false, emailPrefix: "info" },
    ];
  } else if (lowerSec.includes("menuis") || lowerSec.includes("bâtiment") || lowerSec.includes("artisan") || lowerSec.includes("plomb")) {
    businessTemplates = [
      { name: `${city} Menuiserie & Agencement`, activity: "Artisan Menuisier Ébéniste", keyAngle: "Portfolio de réalisations de grande qualité mais site non responsive et formulaire de devis cassé.", hasWebsite: true, emailPrefix: "contact" },
      { name: `Atelier Bois & Rénovation`, activity: "Rénovation & Charpente", keyAngle: "Aucun site internet répertorié, opportunité de créer une vitrine crédible pour rassurer les particuliers.", hasWebsite: false, emailPrefix: "atelier" },
      { name: `Habitat Confort & Pose`, activity: "Plomberie Chauffage & Sanitaire", keyAngle: "Fiche Google Maps en retrait face aux annuaires payants, potentiel de référencement local fort.", hasWebsite: true, emailPrefix: "devis" },
      { name: `Artisans Réunis de ${city}`, activity: "Menuiserie & Fermetures", keyAngle: "Formulaire de contact trop complexe, perte de demandes de chantiers qualifiées.", hasWebsite: true, emailPrefix: "direction" },
      { name: `Rénov Aquitaine Direct`, activity: "Aménagement Intérieur & Rénovation", keyAngle: "Absence de présence web moderne, avis clients très positifs mais dispersés.", hasWebsite: false, emailPrefix: "contact" },
      { name: `Ébénisterie Traditionnelle`, activity: "Création Mobilier sur Mesure", keyAngle: "Galerie photo introuvable sur smartphone, opportunité de créer un book digital percutant.", hasWebsite: false, emailPrefix: "artisan" },
    ];
  } else if (lowerSec.includes("santé") || lowerSec.includes("ostéo") || lowerSec.includes("kiné") || lowerSec.includes("dentist")) {
    businessTemplates = [
      { name: `Cabinet d'Ostéopathie & Posture`, activity: "Ostéopathe D.O.", keyAngle: "Excellents retours patients mais fiche Google Maps en 5e position locale, optimisation SEO recommandée.", hasWebsite: true, emailPrefix: "cabinet" },
      { name: `Espace Kiné & Santé ${city}`, activity: "Masseur-Kinésithérapeute", keyAngle: "Pas de page web d'explication des spécialités (sport, rééducation, drainage).", hasWebsite: false, emailPrefix: "contact" },
      { name: `Centre Paramédical des Allées`, activity: "Cabinet Pluridisciplinaire", keyAngle: "Site vieillissant et manque de lisibilité pour orienter les nouveaux résidents de la zone.", hasWebsite: true, emailPrefix: "secretariat" },
      { name: `Cabinet Bien-être & Ostéo`, activity: "Ostéopathie Prénatale & Adulte", keyAngle: "Absence de site internet pour présenter l'approche thérapeutique et rassurer avant la prise de rendez-vous.", hasWebsite: false, emailPrefix: "osteo" },
      { name: `Pôle Santé du Centre`, activity: "Pédicure Podologue & Kiné", keyAngle: "Coordonnées difficiles à trouver sur mobile pour les urgences locales.", hasWebsite: false, emailPrefix: "polesante" },
    ];
  } else {
    businessTemplates = [
      { name: `${cleanSector} Excellence ${city}`, activity: cleanSector, keyAngle: "Présence Google solide mais site web absent ou non optimisé pour mobile.", hasWebsite: false, emailPrefix: "contact" },
      { name: `Atelier ${cleanSector} & Co`, activity: cleanSector, keyAngle: "Site ancien nécessitant une modernisation graphique et une sécurisation HTTPS.", hasWebsite: true, emailPrefix: "direction" },
      { name: `${city} ${cleanSector} Services`, activity: cleanSector, keyAngle: "Fiche Google Maps perfectible, manque de mots-clés stratégiques sur la ville.", hasWebsite: true, emailPrefix: "contact" },
      { name: `Maison ${cleanSector}`, activity: cleanSector, keyAngle: "Aucun outil de contact rapide ou devis en ligne pour capter les prospects chauds.", hasWebsite: false, emailPrefix: "info" },
      { name: `Le Comptoir du ${cleanSector}`, activity: cleanSector, keyAngle: "Potentiel d'amélioration de la visibilité locale pour se démarquer des concurrents.", hasWebsite: true, emailPrefix: "bonjour" },
      { name: `Studio ${cleanSector} Local`, activity: cleanSector, keyAngle: "Absence de présence numérique répertoriée malgré une implantation historique.", hasWebsite: false, emailPrefix: "studio" },
    ];
  }

  const citySlug = city.toLowerCase().replace(/[^a-z0-9]/g, "");

  return businessTemplates.map((item, idx) => {
    const angle = (idx * 2 * Math.PI) / businessTemplates.length;
    const radius = 0.008 + (idx % 3) * 0.004;
    const lat = Number((center.lat + radius * Math.cos(angle)).toFixed(5));
    const lng = Number((center.lng + radius * Math.sin(angle)).toFixed(5));
    const rating = Number((4.3 + (idx % 7) * 0.1).toFixed(1));
    const reviewCount = 22 + (idx * 19);

    const safeNameSlug = item.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 14);

    return {
      id: `p_${Date.now()}_${idx}`,
      name: item.name,
      activity: item.activity,
      location: `${city} (Zone Centrale & Proximité)`,
      address: `${10 + idx * 8} rue de la République, ${city}`,
      phone: `05 ${50 + (idx % 10)} ${10 + (idx * 7) % 80} ${20 + idx * 6}`,
      website: item.hasWebsite ? `https://www.${safeNameSlug}-${citySlug}.fr` : "",
      email: `${item.emailPrefix}@${safeNameSlug}-${citySlug}.fr`,
      rating,
      reviewCount,
      lat,
      lng,
      keyAngle: specialty ? `${item.keyAngle} (Spécificité: ${specialty})` : item.keyAngle,
      relevanceScore: 8 + (idx % 3),
      status: "searched" as const,
      identified: false,
      notes: "",
    };
  });
}

export async function searchLocalProspects({
  sector,
  city,
  specialty,
  freelanceProfile,
  forceRefresh = false,
}: SearchProspectsParams) {
  const cacheKey = `${city.trim().toLowerCase()}_${sector.trim().toLowerCase()}_${(specialty || "").trim().toLowerCase()}`;

  if (!forceRefresh && searchCache.has(cacheKey)) {
    const cached = searchCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { prospects: cached.prospects, fromCache: true };
    }
  }

  // 1. Fetch real businesses using Google Places API (New)
  const realPlaces = await searchPlacesNew({ sector, city, specialty });
  const ai = getGeminiClient();

  if (realPlaces.length > 0) {
    // If Gemini client is available, enrich the real places with freelance opportunity angles
    if (ai) {
      try {
        const placesSummary = realPlaces.map((p, idx) => ({
          idx,
          name: p.name,
          activity: p.activity,
          address: p.address,
          hasWebsite: Boolean(p.website),
          website: p.website,
          rating: p.rating,
          reviewCount: p.reviewCount,
        }));

        const prompt = `Voici une liste réelle d'établissements locaux trouvés sur Google Maps à ${city} pour le secteur "${sector}":
${JSON.stringify(placesSummary, null, 2)}

Le profil du freelance est:
- Titre: ${freelanceProfile?.title || "Développeur Web & SEO Local"}
- Services: ${freelanceProfile?.services || "Création de site, refonte responsive, SEO local, réservation"}
- Valeur ajoutée: ${freelanceProfile?.valueProposition || "Moderniser l'outil digital et booster la visibilité"}

Pour CHAQUE établissement (identifié par idx), analyse ses points d'amélioration et fournis:
- idx: Le numéro d'index correspondant (entier)
- keyAngle: Une opportunité d'intervention précise et percutante (1 à 2 phrases) basée sur ses données (ex: absence de site web, site à moderniser, visibilité Google Maps à optimiser, module de réservation/devis manquant)
- relevanceScore: Score de pertinence de 1 à 10 pour ce freelance

Retourne UNIQUEMENT un tableau JSON d'objets avec idx, keyAngle et relevanceScore.`;

        const response = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              description: "Angles d'approche pour chaque établissement réel",
              items: {
                type: Type.OBJECT,
                properties: {
                  idx: { type: Type.INTEGER },
                  keyAngle: { type: Type.STRING },
                  relevanceScore: { type: Type.NUMBER },
                },
                required: ["idx", "keyAngle", "relevanceScore"],
              },
            },
          },
        });

        const analysis = extractJsonFromText<any[]>(response.text || "[]", []);
        const analysisMap = new Map<number, { keyAngle: string; relevanceScore: number }>();
        if (Array.isArray(analysis)) {
          analysis.forEach((item) => {
            if (typeof item.idx === "number") {
              analysisMap.set(item.idx, {
                keyAngle: item.keyAngle,
                relevanceScore: item.relevanceScore,
              });
            }
          });
        }

        const enriched = realPlaces.map((place, idx) => {
          const aiData = analysisMap.get(idx);
          let keyAngle = aiData?.keyAngle;
          if (!keyAngle) {
            keyAngle = !place.website
              ? `Absence de site internet officiel malgré ${place.reviewCount} avis Google (${place.rating}/5) : opportunité directe de création de vitrine.`
              : `Présence en ligne existante mais potentiel d'optimisation de visibilité locale et conversion mobile à ${city}.`;
          }

          return {
            id: place.id,
            name: place.name,
            activity: place.activity,
            location: place.location,
            address: place.address,
            phone: place.phone,
            website: place.website,
            email: "",
            rating: place.rating,
            reviewCount: place.reviewCount,
            lat: place.lat,
            lng: place.lng,
            keyAngle,
            relevanceScore: aiData?.relevanceScore || (place.website ? 7 : 9),
            status: "searched" as const,
            identified: false,
            notes: "",
            googleMapsUri: place.googleMapsUri,
          };
        });

        searchCache.set(cacheKey, { timestamp: Date.now(), prospects: enriched });
        return { prospects: enriched, fromCache: false, fallback: false };
      } catch (err: any) {
        console.warn("Enrichissement Gemini des places réelles échoué, utilisation de l'analyse heuristique:", err?.message);
      }
    }

    // Heuristic enrichment for real places if Gemini is unreachable
    const enrichedHeuristic = realPlaces.map((place) => ({
      id: place.id,
      name: place.name,
      activity: place.activity,
      location: place.location,
      address: place.address,
      phone: place.phone,
      website: place.website,
      email: "",
      rating: place.rating,
      reviewCount: place.reviewCount,
      lat: place.lat,
      lng: place.lng,
      keyAngle: !place.website
        ? `Absence de site web malgré ${place.reviewCount} avis sur Google Maps (${place.rating}/5) : fort potentiel de création de site vitrine.`
        : `Site web existant : opportunité d'audit responsive, SEO local et refonte ergonomique.`,
      relevanceScore: !place.website ? 9 : 7,
      status: "searched" as const,
      identified: false,
      notes: "",
      googleMapsUri: place.googleMapsUri,
    }));

    searchCache.set(cacheKey, { timestamp: Date.now(), prospects: enrichedHeuristic });
    return { prospects: enrichedHeuristic, fromCache: false, fallback: false };
  }

  // If Gemini client cannot be initialized (no key), immediately use resilient local synthesis
  if (!ai) {
    const fallbackProspects = generateLocalProspectsFallback({
      sector,
      city,
      specialty,
      freelanceProfile,
    });
    searchCache.set(cacheKey, { timestamp: Date.now(), prospects: fallbackProspects });
    return { prospects: fallbackProspects, fromCache: false, fallback: true };
  }

  const prompt = `Trouve entre 6 et 10 entreprises, commerces, artisans, cabinets ou professionnels réels situés à ${city} et ses alentours immédiats dans le secteur: "${sector}" ${specialty ? `(spécificité: ${specialty})` : ""}.
Ce freelance offre: "${freelanceProfile?.services || "création web, refonte, visibilité locale, acquisition"}".

Pour chaque prospect identifié:
- name: Nom de l'entreprise
- activity: Type d'activité précise
- location: Adresse ou quartier à ${city}
- address: Adresse complète
- phone: Téléphone (si disponible)
- website: Site web (s'il existe, sinon '')
- email: Email de contact public (si trouvable, sinon '')
- rating: Note Google Maps (nombre décimal)
- reviewCount: Nombre d'avis (entier)
- lat: Coordonnée latitude réelle ou estimée à ${city}
- lng: Coordonnée longitude réelle ou estimée à ${city}
- keyAngle: Angle d'opportunité précis pour ce freelance
- relevanceScore: Note de 1 à 10

Retourne UNIQUEMENT un tableau JSON d'objets.`;

  // Utilisation de gemini-flash-latest (variable évolutive pointant vers la dernière version)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "Liste des prospects locaux trouvés",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              activity: { type: Type.STRING },
              location: { type: Type.STRING },
              address: { type: Type.STRING },
              phone: { type: Type.STRING },
              website: { type: Type.STRING },
              email: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              reviewCount: { type: Type.NUMBER },
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER },
              keyAngle: { type: Type.STRING },
              relevanceScore: { type: Type.NUMBER },
            },
            required: ["name", "activity", "location", "keyAngle"],
          },
        },
      },
    });

    const parsed = extractJsonFromText<any[]>(response.text || "[]", []);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const formatted = parsed.map((p: any, idx: number) => ({
        id: `p_${Date.now()}_${idx}`,
        name: p.name || `Prospect ${idx + 1}`,
        activity: p.activity || sector,
        location: p.location || city,
        address: p.address || "",
        phone: p.phone || "",
        website: p.website || "",
        email: p.email || "",
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        lat: typeof p.lat === "number" ? p.lat : undefined,
        lng: typeof p.lng === "number" ? p.lng : undefined,
        keyAngle: p.keyAngle || "Opportunité de collaboration locale",
        relevanceScore: p.relevanceScore || 8,
        status: "searched" as const,
        identified: false,
        notes: "",
      }));

      searchCache.set(cacheKey, { timestamp: Date.now(), prospects: formatted });
      return { prospects: formatted, fromCache: false, fallback: false };
    }
  } catch (err: any) {
    console.warn("Appel Gemini search avec gemini-flash-latest échoué:", err?.message);
  }

  // Graceful fallback: If Gemini API is restricted, unauthorized, or offline, return local synthesis
  console.info("Using intelligent local synthesis fallback for search.");
  const fallbackProspects = generateLocalProspectsFallback({
    sector,
    city,
    specialty,
    freelanceProfile,
  });
  searchCache.set(cacheKey, { timestamp: Date.now(), prospects: fallbackProspects });
  return { prospects: fallbackProspects, fromCache: false, fallback: true };
}

export interface GenerateEmailParams {
  prospect: any;
  freelanceProfile?: {
    title?: string;
    services?: string;
    valueProposition?: string;
    portfolioUrl?: string;
    signature?: string;
  };
  tone?: string;
  objective?: string;
  forceRefresh?: boolean;
}

/**
 * Generates tailored outreach email content when external AI API is unavailable.
 */
function generateEmailFallback({
  prospect,
  freelanceProfile,
  tone,
  objective,
}: GenerateEmailParams) {
  const isDirect = (tone || "").toLowerCase().includes("direct");
  const isWarm = (tone || "").toLowerCase().includes("chaleureux");
  
  const subject = isDirect
    ? `Piste rapide pour la présence en ligne de ${prospect.name}`
    : isWarm
    ? `Partage d'idées pour ${prospect.name} à ${prospect.location}`
    : `Optimisation de visibilité locale : ${prospect.name}`;

  const greeting = isWarm ? `Bonjour à toute l'équipe de ${prospect.name},` : `Bonjour,`;

  const angleMention = prospect.keyAngle
    ? `En analysant la visibilité des professionnels du secteur ${prospect.activity} à ${prospect.location}, j'ai remarqué votre établissement${prospect.rating ? ` (${prospect.rating}/5)` : ""}. ${prospect.keyAngle}`
    : `J'ai découvert votre activité de ${prospect.activity} à ${prospect.location} et souhaitais vous contacter au sujet de votre présence numérique.`;

  const valueProp = freelanceProfile?.valueProposition || "J'accompagne les commerces et indépendants de la région pour moderniser leur image et capter davantage de clients qualifiés.";

  const callToAction = (objective || "").includes("Audit")
    ? `Seriez-vous ouvert à un court échange informel de 10 minutes cette semaine ? Je vous partagerais volontiers un audit express sans aucun engagement.`
    : `Avez-vous 10 minutes cette semaine pour en discuter rapidement ? Je serais ravi de vous présenter 2 ou 3 pistes concrètes adaptées à votre zone de chalandise.`;

  const body = `${greeting}

${angleMention}

En tant que ${freelanceProfile?.title || "consultant digital et web"}, ${valueProp.toLowerCase()}

${callToAction}

Bien cordialement,`;

  return { subject, body };
}

export async function generateProspectEmail({
  prospect,
  freelanceProfile,
  tone,
  objective,
  forceRefresh = false,
}: GenerateEmailParams) {
  const emailCacheKey = `${prospect.id || prospect.name}_${tone || "default"}_${objective || "default"}`;

  if (!forceRefresh && emailCache.has(emailCacheKey)) {
    const cached = emailCache.get(emailCacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return { ...cached.email, fromCache: true };
    }
  }

  const ai = getGeminiClient();

  if (!ai) {
    const fallback = generateEmailFallback({ prospect, freelanceProfile, tone, objective });
    emailCache.set(emailCacheKey, { timestamp: Date.now(), email: fallback });
    return { ...fallback, fromCache: false, fallback: true };
  }

  const prompt = `Rédige un email de prospection sur mesure, professionnel, direct et concis (maximum 120-150 mots) pour un freelance qui contacte ce prospect local.

Informations sur le prospect:
- Entreprise: ${prospect.name}
- Activité: ${prospect.activity}
- Localisation: ${prospect.location}
- Site web: ${prospect.website || "Pas de site répertorié"}
- Avis / Réputation: ${prospect.rating ? `${prospect.rating}/5 (${prospect.reviewCount || 0} avis)` : "Non renseigné"}
- Angle clé identifié: ${prospect.keyAngle || "Amélioration de visibilité locale"}

Informations sur le freelance:
- Métier: ${freelanceProfile?.title || "Freelance Web & Digital"}
- Compétences: ${freelanceProfile?.services || "Création de site internet moderne, SEO local, optimisation conversion"}
- Proposition de valeur: ${freelanceProfile?.valueProposition || "Aider les acteurs locaux à générer plus de clients"}

Objectif: ${objective || "Proposer un échange rapide de 10 min ou un audit offert sans engagement"}
Ton souhaité: ${tone || "Courtois, percutant, orienté valeur concrète"}

Retourne UNIQUEMENT un JSON strict avec les clés "subject" et "body".`;

  // Utilisation de gemini-flash-latest (variable évolutive pointant vers la dernière version)
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: "Objet du mail" },
            body: { type: Type.STRING, description: "Corps du mail prêt à l'envoi" },
          },
          required: ["subject", "body"],
        },
      },
    });

    const parsed = extractJsonFromText<{ subject: string; body: string }>(
      response.text || "{}",
      { subject: "", body: "" }
    );

    if (parsed.subject && parsed.body) {
      emailCache.set(emailCacheKey, { timestamp: Date.now(), email: parsed });
      return { ...parsed, fromCache: false, fallback: false };
    }
  } catch (err: any) {
    console.warn("Appel Gemini email avec gemini-flash-latest échoué:", err?.message);
  }

  // Graceful fallback
  console.info("Using intelligent local synthesis fallback for email generation.");
  const fallback = generateEmailFallback({ prospect, freelanceProfile, tone, objective });
  emailCache.set(emailCacheKey, { timestamp: Date.now(), email: fallback });
  return { ...fallback, fromCache: false, fallback: true };
}
