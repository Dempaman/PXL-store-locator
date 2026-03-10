"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Store } from "@/types/store";
import { Skeleton } from "@/components/ui/skeleton";

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps: () => void;
  }
}

interface StoreMapProps {
  stores: Store[];
  selectedStoreId: string | null;
  onStoreSelect: (storeId: string) => void;
}

// Map styles for dark theme
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#333333" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#2d3a2d" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3a3a3a" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1a1a1a" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#2a2a2a" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e3a4a" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#5e5e5e" }] },
];

// Custom yellow marker
const createCustomMarkerIcon = (isSelected: boolean) => ({
  path: google.maps.SymbolPath.CIRCLE,
  fillColor: "#f5db00",
  fillOpacity: isSelected ? 1 : 0.9,
  strokeColor: isSelected ? "#000" : "#333",
  strokeWeight: isSelected ? 3 : 2,
  scale: isSelected ? 12 : 10,
});

export function StoreMap({ stores, selectedStoreId, onStoreSelect }: StoreMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const isInitializingRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check API key validity
  const apiKeyStatus = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
      return { valid: false, error: "Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables." };
    }
    return { valid: true, apiKey };
  }, []);

  // Create map - memoized callback
  const createMapInstance = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const mapOptions: google.maps.MapOptions = {
      center: { lat: 62.0, lng: 15.0 },
      zoom: 5,
      styles: darkMapStyles,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
    infoWindowRef.current = new window.google.maps.InfoWindow();
    setIsLoaded(true);
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!apiKeyStatus.valid || isInitializingRef.current) return;

    isInitializingRef.current = true;

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      // Use requestAnimationFrame to defer setState
      requestAnimationFrame(() => {
        createMapInstance();
      });
      return;
    }

    // Set up callback
    window.initGoogleMaps = () => {
      requestAnimationFrame(() => {
        createMapInstance();
      });
    };

    // Load script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyStatus.apiKey}&callback=initGoogleMaps&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, [apiKeyStatus, createMapInstance]);

  // Update markers when stores change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const map = mapInstanceRef.current;
    const bounds = new window.google.maps.LatLngBounds();
    const newMarkers = new Map<string, google.maps.Marker>();

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    // Create markers for each store
    stores.forEach((store) => {
      const position = new window.google.maps.LatLng(store.latitude, store.longitude);

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: store.name,
        icon: createCustomMarkerIcon(selectedStoreId === store.id),
      });

      const infoContent = `
        <div style="color: #000; max-width: 250px; font-family: system-ui, sans-serif;">
          <h3 style="font-weight: 600; margin: 0 0 8px 0; font-size: 14px;">${store.name}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${store.storeType}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">${store.address}</p>
          <p style="margin: 0 0 4px 0; font-size: 12px;">${store.postalCode} ${store.city}</p>
          ${store.phone ? `<p style="margin: 0; font-size: 12px;">📞 ${store.phone}</p>` : ""}
        </div>
      `;

      marker.addListener("click", () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(infoContent);
          infoWindowRef.current.open(map, marker);
        }
        onStoreSelect(store.id);
      });

      newMarkers.set(store.id, marker);
      bounds.extend(position);
    });

    markersRef.current = newMarkers;

    if (stores.length > 0) {
      map.fitBounds(bounds, 50);

      const listener = window.google.maps.event.addListener(map, "idle", () => {
        const zoom = map.getZoom();
        if (zoom && zoom > 15) {
          map.setZoom(15);
        }
        window.google.maps.event.removeListener(listener);
      });
    }

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null));
    };
  }, [stores, isLoaded, onStoreSelect, selectedStoreId]);

  // Highlight selected marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    markersRef.current.forEach((marker, storeId) => {
      marker.setIcon(createCustomMarkerIcon(selectedStoreId === storeId));

      if (selectedStoreId === storeId) {
        const store = stores.find((s) => s.id === storeId);
        if (store) {
          mapInstanceRef.current?.panTo({ lat: store.latitude, lng: store.longitude });
          mapInstanceRef.current?.setZoom(15);
        }
      }
    });
  }, [selectedStoreId, isLoaded, stores]);

  if (!apiKeyStatus.valid) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900 rounded-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Kartan kunde inte laddas</h3>
          <p className="text-gray-400 text-sm max-w-md">{apiKeyStatus.error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full">
        <Skeleton className="w-full h-full rounded-lg bg-gray-800" />
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-lg overflow-hidden"
    />
  );
}
