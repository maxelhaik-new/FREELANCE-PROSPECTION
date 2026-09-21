import dotenv from "dotenv";
dotenv.config();

export interface PlaceNewResult {
  id: string;
  name: string;
  activity: string;
  location: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  reviewCount: number;
  lat?: number;
  lng?: number;
  googleMapsUri?: string;
  businessStatus?: string;
}

export interface AutocompleteSuggestion {
  text: string;
  mainText: string;
  secondaryText?: string;
  placeId: string;
}

function getApiKey(): string | null {
  const key = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!key || key.trim() === "") return null;
  return key.trim();
}

/**
 * Searches real local places using Google Places API (New) - searchText
 * Docs: https://places.googleapis.com/v1/places:searchText
 */
export async function searchPlacesNew({
  sector,
  city,
  specialty,
}: {
  sector: string;
  city: string;
  specialty?: string;
}): Promise<PlaceNewResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("Places API (New): No Google Maps API key found in environment.");
    return [];
  }

  const queryParts = [specialty, sector, "in", city].filter(Boolean);
  const textQuery = queryParts.join(" ");

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,places.primaryTypeDisplayName,places.businessStatus",
      },
      body: JSON.stringify({
        textQuery,
        languageCode: "fr",
        maxResultCount: 15,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Places API (New) searchText failed with status ${response.status}:`, errorText);
      return [];
    }

    const data = (await response.json()) as { places?: any[] };
    if (!data.places || !Array.isArray(data.places)) {
      return [];
    }

    return data.places.map((place: any) => ({
      id: place.id || `place_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: place.displayName?.text || "Commerce local",
      activity: place.primaryTypeDisplayName?.text || sector,
      location: city,
      address: place.formattedAddress || "",
      phone: place.nationalPhoneNumber || "",
      website: place.websiteUri || "",
      rating: typeof place.rating === "number" ? place.rating : 0,
      reviewCount: typeof place.userRatingCount === "number" ? place.userRatingCount : 0,
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      googleMapsUri: place.googleMapsUri,
      businessStatus: place.businessStatus,
    }));
  } catch (error: any) {
    console.warn("Places API (New) searchText error:", error?.message || error);
    return [];
  }
}

/**
 * Autocompletes cities and localities using Google Places API (New) - autocomplete
 * Docs: https://places.googleapis.com/v1/places:autocomplete
 */
export async function autocompleteCityNew(input: string): Promise<AutocompleteSuggestion[]> {
  const apiKey = getApiKey();
  if (!apiKey || !input || input.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: input.trim(),
        includedRegionCodes: ["fr"],
        includedPrimaryTypes: ["locality", "administrative_area_level_1", "administrative_area_level_2"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Places API (New) autocomplete failed with status ${response.status}:`, errorText);
      return [];
    }

    const data = (await response.json()) as { suggestions?: any[] };
    if (!data.suggestions || !Array.isArray(data.suggestions)) {
      return [];
    }

    return data.suggestions
      .filter((s: any) => s.placePrediction)
      .map((s: any) => {
        const pred = s.placePrediction;
        return {
          text: pred.text?.text || "",
          mainText: pred.structuredFormat?.mainText?.text || pred.text?.text || "",
          secondaryText: pred.structuredFormat?.secondaryText?.text,
          placeId: pred.placeId || pred.place || "",
        };
      });
  } catch (error: any) {
    console.warn("Places API (New) autocomplete error:", error?.message || error);
    return [];
  }
}
