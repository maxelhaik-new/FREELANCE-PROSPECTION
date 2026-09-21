import { useState, useEffect } from "react";

declare global {
  interface Window {
    google?: any;
    initGoogleMapCallback?: () => void;
    gm_authFailure?: () => void;
  }
}

export function useGoogleMaps() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const apiKey =
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    "AIzaSyCGd-2iS0OSp9WG-dD5k_TYPLE2h3shJjI";

  useEffect(() => {
    let isMounted = true;

    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = "google-maps-sdk";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (isMounted) setMapLoaded(true);
      };
      script.onerror = () => {
        if (isMounted) setLoadError("Impossible de charger l'API Google Maps. Vérifiez la connexion ou la clé d'API.");
      };
      document.head.appendChild(script);
    } else {
      const handleLoad = () => {
        if (isMounted) setMapLoaded(true);
      };
      existingScript.addEventListener("load", handleLoad);
      return () => {
        existingScript.removeEventListener("load", handleLoad);
      };
    }

    window.gm_authFailure = () => {
      if (isMounted) {
        setLoadError("Authentification Google Maps échouée (clé non autorisée ou quota dépassé).");
      }
    };

    return () => {
      isMounted = false;
      delete window.gm_authFailure;
    };
  }, [apiKey]);

  return { mapLoaded, loadError };
}
