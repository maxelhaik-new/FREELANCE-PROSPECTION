import React, { useEffect, useRef, useCallback, useState } from "react";
import { MapPin, Compass, Layers, Maximize2 } from "lucide-react";
import { Prospect } from "../types";
import { useGoogleMaps } from "../hooks/useGoogleMaps";

export interface GoogleMapViewProps {
  prospects: Prospect[];
  selectedProspect: Prospect | null;
  onSelectProspect: (prospect: Prospect | null) => void;
  targetCity: string;
  searchSector?: string;
  activeFilter?: string;
  searchFilterText?: string;
}

// Fallback coordinates for French cities with robust normalization
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  paris: { lat: 48.8566, lng: 2.3522 },
  marseille: { lat: 43.2965, lng: 5.3698 },
  lyon: { lat: 45.764, lng: 4.8357 },
  toulouse: { lat: 43.6047, lng: 1.4442 },
  nice: { lat: 43.7102, lng: 7.262 },
  nantes: { lat: 47.2184, lng: -1.5536 },
  montpellier: { lat: 43.6108, lng: 3.8767 },
  strasbourg: { lat: 48.5734, lng: 7.7521 },
  bordeaux: { lat: 44.8378, lng: -0.5792 },
  lille: { lat: 50.6292, lng: 3.0573 },
  rennes: { lat: 48.1173, lng: -1.6778 },
  reims: { lat: 49.2583, lng: 4.0317 },
  toulon: { lat: 43.1242, lng: 5.928 },
  "saint-etienne": { lat: 45.4397, lng: 4.3872 },
  havre: { lat: 49.4944, lng: 0.1079 },
  grenoble: { lat: 45.1885, lng: 5.7245 },
  dijon: { lat: 47.322, lng: 5.0415 },
  angers: { lat: 47.4784, lng: -0.5532 },
  nimes: { lat: 43.8367, lng: 4.3601 },
  villeurbanne: { lat: 45.7719, lng: 4.8902 },
  "clermont-ferrand": { lat: 45.7772, lng: 3.087 },
  "le mans": { lat: 48.0061, lng: 0.1996 },
  aix: { lat: 43.5297, lng: 5.4474 },
  brest: { lat: 48.3904, lng: -4.4861 },
  tours: { lat: 47.3941, lng: 0.6848 },
  amiens: { lat: 49.8941, lng: 2.2957 },
  limoges: { lat: 45.8336, lng: 1.2611 },
  annecy: { lat: 45.8992, lng: 6.1294 },
  perpignan: { lat: 42.6986, lng: 2.8956 },
  metz: { lat: 49.1193, lng: 6.1727 },
  besancon: { lat: 47.2378, lng: 6.0241 },
  orleans: { lat: 47.9029, lng: 1.9093 },
  rouen: { lat: 49.4431, lng: 1.0993 },
  caen: { lat: 49.1828, lng: -0.3707 },
  mulhouse: { lat: 47.7508, lng: 7.3359 },
  nancy: { lat: 48.6921, lng: 6.1844 },
  avignon: { lat: 43.9493, lng: 4.8055 },
  poitiers: { lat: 46.5802, lng: 0.3404 },
  pau: { lat: 43.2951, lng: -0.3708 },
  "la rochelle": { lat: 46.1603, lng: -1.1511 },
  calais: { lat: 50.9513, lng: 1.8587 },
  cannes: { lat: 43.5528, lng: 7.0174 },
  antibes: { lat: 43.5804, lng: 7.1251 },
  beziers: { lat: 43.3442, lng: 3.2158 },
  bourges: { lat: 47.081, lng: 2.3988 },
  colmar: { lat: 48.0794, lng: 7.3585 },
  dunkerque: { lat: 51.0343, lng: 2.3768 },
  "saint-nazaire": { lat: 47.2735, lng: -2.2137 },
  valence: { lat: 44.9334, lng: 4.8924 },
};

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .trim();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function findCityCoords(text: string): { lat: number; lng: number } | null {
  if (!text) return null;
  const norm = normalizeString(text);
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    const normKey = normalizeString(key);
    if (norm.includes(normKey)) {
      return coords;
    }
  }
  return null;
}

function getProspectBaseCoords(
  prospect: Prospect,
  targetCity: string,
  searchFilterText?: string
): { lat: number; lng: number } {
  if (
    typeof prospect.lat === "number" &&
    typeof prospect.lng === "number" &&
    !isNaN(prospect.lat) &&
    !isNaN(prospect.lng)
  ) {
    return { lat: prospect.lat, lng: prospect.lng };
  }

  // 1. Prospect location text (e.g., "Bordeaux (33000)")
  if (prospect.location) {
    const locMatch = findCityCoords(prospect.location);
    if (locMatch) return locMatch;
  }

  // 2. Search filter text if user filtered by a specific city
  if (searchFilterText) {
    const searchMatch = findCityCoords(searchFilterText);
    if (searchMatch) return searchMatch;
  }

  // 3. Target search city
  if (targetCity) {
    const cityMatch = findCityCoords(targetCity);
    if (cityMatch) return cityMatch;
  }

  // 4. Default: Paris
  return { lat: 48.8566, lng: 2.3522 };
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  prospects,
  selectedProspect,
  targetCity,
  searchSector,
  activeFilter,
  searchFilterText,
  onSelectProspect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersMapRef = useRef<
    Map<string, { marker: any; position: any; infoWindow: any; prospect: Prospect }>
  >(new Map());
  const activeInfoWindowRef = useRef<any>(null);
  const [isCentered, setIsCentered] = useState(true);

  const { mapLoaded, loadError } = useGoogleMaps();

  // Helper to determine base fallback center
  const getFallbackCenter = useCallback((): { lat: number; lng: number; zoom: number } => {
    if (searchFilterText) {
      const match = findCityCoords(searchFilterText);
      if (match) return { ...match, zoom: 13 };
    }
    if (targetCity) {
      const match = findCityCoords(targetCity);
      if (match) return { ...match, zoom: 13 };
    }
    // France center default
    return { lat: 46.603354, lng: 1.888334, zoom: 6 };
  }, [searchFilterText, targetCity]);

  // Adjust view function (panTo single/selection or fitBounds for multiple)
  const fitMapView = useCallback((ignoreSelection = false) => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google?.maps) return;
    const map = mapInstanceRef.current;

    // A. Focus on selected prospect if one is selected and exists in markers
    if (selectedProspect && !ignoreSelection) {
      const data = markersMapRef.current.get(selectedProspect.id);
      if (data) {
        if (activeInfoWindowRef.current && activeInfoWindowRef.current !== data.infoWindow) {
          activeInfoWindowRef.current.close();
        }
        map.panTo(data.position);
        if (map.getZoom() < 15) {
          map.setZoom(15);
        }
        data.infoWindow.open(map, data.marker);
        activeInfoWindowRef.current = data.infoWindow;
        setIsCentered(true);
        return;
      }
    }

    // Close any open InfoWindow when framing all prospects
    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
      activeInfoWindowRef.current = null;
    }

    // B. No prospects visible (empty list / filter returned 0)
    if (prospects.length === 0) {
      const fallback = getFallbackCenter();
      map.panTo({ lat: fallback.lat, lng: fallback.lng });
      map.setZoom(fallback.zoom);
      setIsCentered(true);
      return;
    }

    // C. Single prospect visible
    if (prospects.length === 1) {
      const data = markersMapRef.current.get(prospects[0].id);
      if (data) {
        map.panTo(data.position);
        map.setZoom(15);
      }
      setIsCentered(true);
      return;
    }

    // D. Multiple prospects: calculate bounds
    const bounds = new window.google.maps.LatLngBounds();
    let hasPoints = false;

    markersMapRef.current.forEach(({ position }) => {
      bounds.extend(position);
      hasPoints = true;
    });

    if (hasPoints) {
      map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });

      // Cap zoom level once map completes fitting bounds
      const listener = window.google.maps.event.addListenerOnce(map, "idle", () => {
        const zoom = map.getZoom();
        if (zoom > 16) {
          map.setZoom(15);
        } else if (zoom < 5) {
          map.setZoom(6);
        }
        setIsCentered(true);
      });

      return () => {
        window.google.maps.event.removeListener(listener);
      };
    }
  }, [mapLoaded, selectedProspect, prospects, getFallbackCenter]);

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.google?.maps) return;

    if (!mapInstanceRef.current) {
      const fallback = getFallbackCenter();
      const mapOptions = {
        center: { lat: fallback.lat, lng: fallback.lng },
        zoom: fallback.zoom,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        gestureHandling: "greedy",
        styles: [
          {
            featureType: "poi.business",
            stylers: [{ visibility: "simplified" }],
          },
        ],
      };

      const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Click on map background deselects active prospect
      map.addListener("click", () => {
        if (activeInfoWindowRef.current) {
          activeInfoWindowRef.current.close();
          activeInfoWindowRef.current = null;
        }
        onSelectProspect(null);
      });

      // Detect user manual drag/zoom
      map.addListener("dragstart", () => {
        setIsCentered(false);
      });
    }
  }, [mapLoaded, getFallbackCenter, onSelectProspect]);

  // Populate & Update Markers when prospects or selection change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.google?.maps) return;

    // Clear previous markers
    markersMapRef.current.forEach(({ marker }) => marker.setMap(null));
    markersMapRef.current.clear();

    if (activeInfoWindowRef.current) {
      activeInfoWindowRef.current.close();
      activeInfoWindowRef.current = null;
    }

    // 1. Group prospects by raw coordinate key to detect collisions/overlaps
    const coordGroups = new Map<string, number>();
    const prospectCoords = prospects.map((p) => {
      const base = getProspectBaseCoords(p, targetCity, searchFilterText);
      const key = `${base.lat.toFixed(4)}_${base.lng.toFixed(4)}`;
      const indexInGroup = coordGroups.get(key) || 0;
      coordGroups.set(key, indexInGroup + 1);
      return { prospect: p, base, key, indexInGroup };
    });

    // 2. Create markers with dispersion if identical coordinates
    prospectCoords.forEach(({ prospect, base, key, indexInGroup }) => {
      const groupCount = coordGroups.get(key) || 1;
      let lat = base.lat;
      let lng = base.lng;

      // Subtle radial dispersion if multiple markers share the exact same location
      if (groupCount > 1 && indexInGroup > 0) {
        const angle = (indexInGroup * 2 * Math.PI) / groupCount;
        const radius = 0.003 + (indexInGroup % 3) * 0.002;
        lat += radius * Math.cos(angle);
        lng += radius * Math.sin(angle);
      }

      const position = new window.google.maps.LatLng(lat, lng);
      const isSelected = selectedProspect?.id === prospect.id;
      const isInterested = prospect.status === "interested";
      const isIdentified = prospect.identified || prospect.status === "to_contact";
      const isContacted = prospect.status === "contacted";
      const isDeclined = prospect.status === "declined";

      // Color coding & sizing per DESIGN.md
      let fillColor = "#3b82f6"; // Default blue
      let scale = 7;
      let zIndex = 20;

      if (isSelected) {
        fillColor = "#18181b";
        scale = 12;
        zIndex = 999;
      } else if (isInterested) {
        fillColor = "#059669"; // Emerald dark
        scale = 9;
        zIndex = 50;
      } else if (isIdentified) {
        fillColor = "#10b981"; // Emerald
        scale = 8.5;
        zIndex = 40;
      } else if (isContacted) {
        fillColor = "#2563eb"; // Blue
        scale = 7;
        zIndex = 30;
      } else if (isDeclined) {
        fillColor = "#71717a"; // Zinc
        scale = 6;
        zIndex = 10;
      }

      const marker = new window.google.maps.Marker({
        position,
        map: mapInstanceRef.current,
        title: prospect.name,
        animation: null,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale,
          fillColor,
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: isSelected ? 3 : 2,
        },
        zIndex,
      });

      const safeName = escapeHtml(prospect.name || "");
      const safeActivity = escapeHtml(prospect.activity || "");
      const safeLocation = prospect.location ? `• ${escapeHtml(prospect.location)}` : "";
      const safeRating = prospect.rating ? escapeHtml(String(prospect.rating)) : "";
      const safeReviewCount = prospect.reviewCount ? escapeHtml(String(prospect.reviewCount)) : "0";
      const safeKeyAngle = escapeHtml(prospect.keyAngle || "Opportunité locale identifiée");

      const infoContent = `
        <div style="padding: 10px 12px; font-family: system-ui, -apple-system, sans-serif; font-size: 0.75rem; max-width: 250px; line-height: 1.4; word-break: break-word; overflow-wrap: break-word;">
          <div style="font-weight: 600; font-size: 0.875rem; color: #18181b; margin-bottom: 2px; letter-spacing: -0.01em; word-break: break-word;">
            ${safeName}
          </div>
          <div style="color: #71717a; font-size: 0.75rem; margin-bottom: 4px; word-break: break-word;">
            ${safeActivity} ${safeLocation}
          </div>
          ${
            prospect.rating
              ? `<div style="color: #78350f; font-size: 0.75rem; margin-bottom: 4px; font-weight: 500;">★ ${safeRating} (${safeReviewCount} avis)</div>`
              : ""
          }
          <div style="font-size: 0.75rem; color: #18181b; background: #f4f4f5; padding: 6px 8px; border-radius: 8px; margin-top: 4px; line-height: 1.4; border: 1px solid rgba(228, 228, 231, 0.7); word-break: break-word; overflow-wrap: break-word; height: auto;">
            ${safeKeyAngle}
          </div>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener("click", () => {
        onSelectProspect(prospect);
      });

      markersMapRef.current.set(prospect.id, { marker, position, infoWindow, prospect });
    });

    // Auto-fit view to current set of markers
    fitMapView();
  }, [mapLoaded, prospects, targetCity, searchFilterText, fitMapView, onSelectProspect]);

  // Focus and open InfoWindow when selectedProspect updates
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !selectedProspect) return;

    const data = markersMapRef.current.get(selectedProspect.id);
    if (data) {
      if (activeInfoWindowRef.current && activeInfoWindowRef.current !== data.infoWindow) {
        activeInfoWindowRef.current.close();
      }

      data.marker.setIcon({
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 13,
        fillColor: "#18181b",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 3,
      });
      data.marker.setZIndex(999);

      mapInstanceRef.current.panTo(data.position);
      if (mapInstanceRef.current.getZoom() < 15) {
        mapInstanceRef.current.setZoom(15);
      }

      data.infoWindow.open(mapInstanceRef.current, data.marker);
      activeInfoWindowRef.current = data.infoWindow;
      setIsCentered(true);
    }
  }, [selectedProspect, mapLoaded]);

  // Responsive ResizeObserver: trigger map resize and re-fit on container dimension changes
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || typeof window.ResizeObserver === "undefined") return;

    let resizeTimer: NodeJS.Timeout | null = null;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          if (resizeTimer) clearTimeout(resizeTimer);
          resizeTimer = setTimeout(() => {
            if (mapInstanceRef.current && window.google?.maps) {
              window.google.maps.event.trigger(mapInstanceRef.current, "resize");
              fitMapView();
            }
          }, 150);
        }
      }
    });

    observer.observe(container);

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, [fitMapView]);

  // Contextual title for the map header
  const getMapContextLabel = (): string => {
    if (activeFilter === "searched") return "Historique des recherches";
    if (activeFilter === "to_contact") return "À contacter";
    if (activeFilter === "contacted") return "Contactés";
    if (activeFilter === "interested") return "Intéressés";
    if (activeFilter === "declined") return "Sans suite";
    return targetCity ? `Résultats à ${targetCity}` : "Vue globale";
  };

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-3 sm:p-4 shadow-micro flex flex-col h-full min-h-[380px] relative">
      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-semibold text-main tracking-tight truncate">
                Carte
              </h2>
              <span className="text-xs px-1.5 py-0.2 bg-secondary text-secondary-fg rounded-full font-mono font-medium">
                {prospects.length}
              </span>
            </div>
            <p className="text-xs text-muted truncate">
              {getMapContextLabel()}
              {searchSector ? ` · ${searchSector}` : ""}
            </p>
          </div>
        </div>

        {/* Legend & Action Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 text-xs text-secondary-fg font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-glow-blue inline-block shrink-0" />
              <span>Contact</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald inline-block shrink-0" />
              <span>Retenu</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary shadow-glow-zinc inline-block ring-2 ring-border-strong shrink-0" />
              <span>Actif</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onSelectProspect(null);
              fitMapView(true);
            }}
            title="Recentrer et adapter la carte à tous les prospects affichés"
            aria-label="Recentrer la carte"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer active:scale-95 ${
              isCentered
                ? "bg-secondary hover:bg-surface-subtle text-secondary-fg border-border-subtle"
                : "bg-primary text-primary-fg border-primary shadow-primary-btn"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Recentrer</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative flex-1 mt-3 rounded-xl overflow-hidden border border-border-subtle bg-surface-subtle">
        <div ref={mapContainerRef} className="w-full h-full min-h-[320px]" />

        {/* Empty state pill over map */}
        {mapLoaded && prospects.length === 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-surface/95 backdrop-blur-xs border border-border-subtle rounded-xl px-3.5 py-2 shadow-lg text-xs text-muted flex items-center gap-2 max-w-[90%] text-center pointer-events-none">
            <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
            <span>Aucun prospect à afficher sur la carte pour ce filtre</span>
          </div>
        )}

        {!mapLoaded && !loadError && (
          <div className="absolute inset-0 bg-surface/80 backdrop-blur-xs flex items-center justify-center text-xs text-muted gap-2">
            <Layers className="w-4 h-4 animate-spin text-muted" />
            <span>Chargement de la carte Google Maps...</span>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 bg-surface flex flex-col items-center justify-center text-xs text-muted p-4 text-center">
            <MapPin className="w-6 h-6 text-muted mb-2" />
            <span className="font-semibold text-main">{loadError}</span>
            <span className="text-xs text-muted mt-1">
              Vérifiez les restrictions d'origine HTTP de la clé.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
