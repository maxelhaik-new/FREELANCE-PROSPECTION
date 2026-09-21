import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { GoogleMapView } from "../../../src/components/GoogleMapView";
import { Prospect } from "../../../src/types";

// Mock useGoogleMaps hook
vi.mock("../../../src/hooks/useGoogleMaps", () => ({
  useGoogleMaps: () => ({
    mapLoaded: true,
    loadError: null,
  }),
}));

const mockProspect1: Prospect = {
  id: "prospect-1",
  name: "Boulangerie Artisanale Saint-Michel",
  activity: "Boulangerie",
  location: "Bordeaux (33000)",
  lat: 44.8378,
  lng: -0.5792,
  status: "searched",
  identified: false,
};

const mockProspect2: Prospect = {
  id: "prospect-2",
  name: "Café des Arts",
  activity: "Café Restaurant",
  location: "Bordeaux (33000)",
  lat: 44.84,
  lng: -0.58,
  status: "to_contact",
  identified: true,
};

describe("Component - GoogleMapView Responsive & Centering", () => {
  let mockMapInstance: any;
  let mockMarkerInstances: any[];
  let mockInfoWindowInstances: any[];
  let mapListeners: Record<string, Function>;
  let resizeCallback: ((entries: any[]) => void) | null = null;

  beforeEach(() => {
    mockMarkerInstances = [];
    mockInfoWindowInstances = [];
    mapListeners = {};
    resizeCallback = null;

    // Mock Google Maps API
    mockMapInstance = {
      panTo: vi.fn(),
      setZoom: vi.fn(),
      getZoom: vi.fn(() => 14),
      fitBounds: vi.fn(),
      addListener: vi.fn((event: string, cb: Function) => {
        mapListeners[event] = cb;
      }),
    };

    const mockGoogle = {
      maps: {
        Map: vi.fn(function () {
          return mockMapInstance;
        }),
        Marker: vi.fn(function (opts: any) {
          const markerObj = {
            opts,
            setMap: vi.fn(),
            setIcon: vi.fn(),
            setZIndex: vi.fn(),
            addListener: vi.fn((evt: string, handler: Function) => {
              (markerObj as any)[`on_${evt}`] = handler;
            }),
          };
          mockMarkerInstances.push(markerObj);
          return markerObj;
        }),
        InfoWindow: vi.fn(function (opts: any) {
          const infoObj = {
            opts,
            open: vi.fn(),
            close: vi.fn(),
          };
          mockInfoWindowInstances.push(infoObj);
          return infoObj;
        }),
        LatLng: vi.fn(function (lat: number, lng: number) {
          return { lat: () => lat, lng: () => lng };
        }),
        LatLngBounds: vi.fn(function () {
          const points: any[] = [];
          return {
            extend: vi.fn((pt: any) => points.push(pt)),
            getNorthEast: vi.fn(),
            getSouthWest: vi.fn(),
            isEmpty: vi.fn(() => points.length === 0),
          };
        }),
        SymbolPath: {
          CIRCLE: "CIRCLE",
        },
        event: {
          trigger: vi.fn(),
          addListenerOnce: vi.fn((_obj: any, _event: string, cb: Function) => {
            cb();
            return { remove: vi.fn() };
          }),
          removeListener: vi.fn(),
        },
      },
    };

    (window as any).google = mockGoogle;

    // Mock ResizeObserver with callback capture
    window.ResizeObserver = class MockResizeObserver {
      constructor(cb: any) {
        resizeCallback = cb;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as any;
  });

  afterEach(() => {
    delete (window as any).google;
  });

  it("renders map container with header and legend", () => {
    render(
      <GoogleMapView
        prospects={[mockProspect1, mockProspect2]}
        selectedProspect={null}
        onSelectProspect={vi.fn()}
        targetCity="Bordeaux"
        searchSector="Boulangerie"
        activeFilter="all"
      />
    );

    expect(screen.getByText("Carte")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/Résultats à Bordeaux/i)).toBeInTheDocument();
    expect(screen.getByText("Recentrer")).toBeInTheDocument();
  });

  it("renders empty state overlay when prospects list is empty", () => {
    render(
      <GoogleMapView
        prospects={[]}
        selectedProspect={null}
        onSelectProspect={vi.fn()}
        targetCity="Bordeaux"
        activeFilter="all"
      />
    );

    expect(
      screen.getByText("Aucun prospect à afficher sur la carte pour ce filtre")
    ).toBeInTheDocument();
    expect(mockMapInstance.panTo).toHaveBeenCalled();
  });

  it("centers single prospect with panTo and optimal zoom (avoids excessive zoom fitBounds bug)", () => {
    render(
      <GoogleMapView
        prospects={[mockProspect1]}
        selectedProspect={null}
        onSelectProspect={vi.fn()}
        targetCity="Bordeaux"
        activeFilter="all"
      />
    );

    expect(mockMapInstance.panTo).toHaveBeenCalled();
    expect(mockMapInstance.setZoom).toHaveBeenCalledWith(15);
    expect(mockMapInstance.fitBounds).not.toHaveBeenCalled();
  });

  it("fits bounds with padding when multiple prospects are provided", () => {
    render(
      <GoogleMapView
        prospects={[mockProspect1, mockProspect2]}
        selectedProspect={null}
        onSelectProspect={vi.fn()}
        targetCity="Bordeaux"
        activeFilter="all"
      />
    );

    expect(mockMapInstance.fitBounds).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        top: 48,
        right: 48,
        bottom: 48,
        left: 48,
      })
    );
  });

  it("focuses and opens InfoWindow when selectedProspect is passed", () => {
    render(
      <GoogleMapView
        prospects={[mockProspect1, mockProspect2]}
        selectedProspect={mockProspect1}
        onSelectProspect={vi.fn()}
        targetCity="Bordeaux"
        activeFilter="all"
      />
    );

    expect(mockMapInstance.panTo).toHaveBeenCalled();
    expect(mockInfoWindowInstances[0].open).toHaveBeenCalledWith(
      mockMapInstance,
      mockMarkerInstances[0]
    );
  });

  it("deselects active prospect when clicking on map background", () => {
    const handleSelect = vi.fn();
    render(
      <GoogleMapView
        prospects={[mockProspect1, mockProspect2]}
        selectedProspect={mockProspect1}
        onSelectProspect={handleSelect}
        targetCity="Bordeaux"
        activeFilter="all"
      />
    );

    act(() => {
      if (mapListeners["click"]) {
        mapListeners["click"]();
      }
    });

    expect(handleSelect).toHaveBeenCalledWith(null);
  });

  it("triggers recenter when clicking the Recentrer button", () => {
    const handleSelect = vi.fn();
    render(
      <GoogleMapView
        prospects={[mockProspect1, mockProspect2]}
        selectedProspect={mockProspect1}
        onSelectProspect={handleSelect}
        targetCity="Bordeaux"
        activeFilter="all"
      />
    );

    const recenterBtn = screen.getByTitle(/Recentrer/i);
    fireEvent.click(recenterBtn);

    expect(handleSelect).toHaveBeenCalledWith(null);
    expect(mockMapInstance.fitBounds).toHaveBeenCalled();
  });

  it("responds to container resize via ResizeObserver", () => {
    vi.useFakeTimers();

    render(
      <GoogleMapView
        prospects={[mockProspect1, mockProspect2]}
        selectedProspect={null}
        onSelectProspect={vi.fn()}
        targetCity="Bordeaux"
        activeFilter="all"
      />
    );

    expect(resizeCallback).not.toBeNull();

    act(() => {
      if (resizeCallback) {
        resizeCallback([{ contentRect: { width: 600, height: 450 } }]);
      }
      vi.advanceTimersByTime(200);
    });

    expect(window.google.maps.event.trigger).toHaveBeenCalledWith(
      mockMapInstance,
      "resize"
    );

    vi.useRealTimers();
  });
});
