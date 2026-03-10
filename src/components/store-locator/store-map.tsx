"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { useTheme } from "next-themes"
import { Store } from "@/types/store"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, LocateFixed, ExternalLink, X } from "lucide-react"

declare global {
  interface Window {
    google: typeof google
    gm_authFailure?: () => void
  }
}

interface StoreMapProps {
  stores: Store[]
  selectedStoreId: string | null
  onStoreSelect: (storeId: string) => void
}

// Map styles for dark theme
const darkMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#333333" }],
  },
  {
    featureType: "administrative.land_parcel",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "administrative.neighborhood",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#2d3a2d" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a1a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3a3a3a" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1a1a1a" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2a2a2a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#1e3a4a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#5e5e5e" }],
  },
]

const lightMapStyles: google.maps.MapTypeStyle[] = []

// Custom yellow marker
const createCustomMarkerIcon = (isSelected: boolean) => ({
  path: google.maps.SymbolPath.CIRCLE,
  fillColor: "#f5db00",
  fillOpacity: isSelected ? 1 : 0.9,
  strokeColor: isSelected ? "#000" : "#333",
  strokeWeight: isSelected ? 3 : 2,
  scale: isSelected ? 12 : 10,
})

const OVERLAY_CARD_WIDTH = 300
const OVERLAY_CARD_HEIGHT = 210

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

export function StoreMap({
  stores,
  selectedStoreId,
  onStoreSelect,
}: StoreMapProps) {
  const { resolvedTheme } = useTheme()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map())
  const isInitializingRef = useRef(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [overlayPosition, setOverlayPosition] = useState<{
    left: number
    top: number
    pointerLeft: number
  } | null>(null)
  const isDarkTheme = resolvedTheme !== "light"
  const selectedStore = useMemo(
    () => stores.find((store) => store.id === selectedStoreId) ?? null,
    [stores, selectedStoreId],
  )

  // Check API key validity
  const apiKeyStatus = useMemo(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
      return {
        valid: false,
        error:
          "Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.",
      }
    }
    return { valid: true, apiKey }
  }, [])

  // Create map - memoized callback
  const createMapInstance = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const mapOptions: google.maps.MapOptions = {
      center: { lat: 62.0, lng: 15.0 },
      zoom: 5,
      styles: isDarkTheme ? darkMapStyles : lightMapStyles,
      disableDefaultUI: true,
    }

    mapInstanceRef.current = new window.google.maps.Map(
      mapRef.current,
      mapOptions,
    )
    setIsLoaded(true)
  }, [isDarkTheme])

  const updateOverlayPosition = useCallback(() => {
    const map = mapInstanceRef.current
    const mapElement = mapRef.current

    if (!map || !mapElement || !selectedStore) {
      setOverlayPosition(null)
      return
    }

    const projection = map.getProjection()
    const bounds = map.getBounds()
    const zoom = map.getZoom()

    if (!projection || !bounds || zoom === undefined) {
      setOverlayPosition(null)
      return
    }

    const northEast = bounds.getNorthEast()
    const southWest = bounds.getSouthWest()
    const worldPoint = projection.fromLatLngToPoint(
      new window.google.maps.LatLng(
        selectedStore.latitude,
        selectedStore.longitude,
      ),
    )
    const northEastPoint = projection.fromLatLngToPoint(northEast)
    const southWestPoint = projection.fromLatLngToPoint(southWest)

    if (!worldPoint || !northEastPoint || !southWestPoint) {
      setOverlayPosition(null)
      return
    }

    const scale = Math.pow(2, zoom)
    const x = (worldPoint.x - southWestPoint.x) * scale
    const y = (worldPoint.y - northEastPoint.y) * scale

    const margin = 12
    const rawLeft = x - OVERLAY_CARD_WIDTH / 2
    const rawTop = y - OVERLAY_CARD_HEIGHT - 22

    const left = clamp(
      rawLeft,
      margin,
      Math.max(margin, mapElement.clientWidth - OVERLAY_CARD_WIDTH - margin),
    )
    const top = clamp(
      rawTop,
      margin,
      Math.max(margin, mapElement.clientHeight - OVERLAY_CARD_HEIGHT - margin),
    )

    const pointerLeft = clamp(x - left, 24, OVERLAY_CARD_WIDTH - 24)

    setOverlayPosition({ left, top, pointerLeft })
  }, [selectedStore])

  const handleZoomIn = useCallback(() => {
    if (!mapInstanceRef.current) return
    const z = mapInstanceRef.current.getZoom() ?? 5
    mapInstanceRef.current.setZoom(z + 1)
  }, [])

  const handleZoomOut = useCallback(() => {
    if (!mapInstanceRef.current) return
    const z = mapInstanceRef.current.getZoom() ?? 5
    mapInstanceRef.current.setZoom(Math.max(1, z - 1))
  }, [])

  const handleCenterSweden = useCallback(() => {
    if (!mapInstanceRef.current) return
    mapInstanceRef.current.panTo({ lat: 62.0, lng: 15.0 })
    mapInstanceRef.current.setZoom(5)
  }, [])

  // Load Google Maps script
  useEffect(() => {
    if (!apiKeyStatus.valid) return

    // Google script already available.
    if (window.google?.maps) {
      requestAnimationFrame(() => {
        setLoadError(null)
        createMapInstance()
      })
      return
    }

    if (isInitializingRef.current) return
    isInitializingRef.current = true

    const reportLoadFailure = (message: string) => {
      setLoadError(message)
      isInitializingRef.current = false
    }

    window.gm_authFailure = () => {
      reportLoadFailure(
        "Google Maps authentication failed. Verify your API key and referrer restrictions.",
      )
    }

    let script = document.querySelector(
      'script[data-google-maps-script="true"]',
    ) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKeyStatus.apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.dataset.googleMapsScript = "true"
      document.head.appendChild(script)
    }

    const onLoad = () => {
      if (!window.google?.maps) {
        reportLoadFailure(
          "Google Maps loaded incompletely. Please refresh and try again.",
        )
        return
      }

      script.dataset.googleMapsLoaded = "true"
      requestAnimationFrame(() => {
        setLoadError(null)
        createMapInstance()
        isInitializingRef.current = false
      })
    }

    const onError = () => {
      reportLoadFailure(
        "Unable to load Google Maps. Check your internet connection and API key restrictions.",
      )
    }

    script.addEventListener("load", onLoad)
    script.addEventListener("error", onError)

    // If another render already loaded the script, initialize immediately.
    if (script.dataset.googleMapsLoaded === "true" && window.google?.maps) {
      onLoad()
    }

    const timeoutId = window.setTimeout(() => {
      if (!window.google?.maps || !mapInstanceRef.current) {
        reportLoadFailure(
          "Google Maps timed out while loading. Please try again.",
        )
      }
    }, 12000)

    return () => {
      window.clearTimeout(timeoutId)
      script?.removeEventListener("load", onLoad)
      script?.removeEventListener("error", onError)
      if (window.gm_authFailure) {
        delete window.gm_authFailure
      }
    }
  }, [apiKeyStatus, createMapInstance])

  // Update markers when stores change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    mapInstanceRef.current.setOptions({
      styles: isDarkTheme ? darkMapStyles : lightMapStyles,
    })
  }, [isDarkTheme, isLoaded])

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    const map = mapInstanceRef.current
    const bounds = new window.google.maps.LatLngBounds()
    const newMarkers = new Map<string, google.maps.Marker>()

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current.clear()

    // Create markers for each store
    stores.forEach((store) => {
      const position = new window.google.maps.LatLng(
        store.latitude,
        store.longitude,
      )

      const marker = new window.google.maps.Marker({
        position,
        map,
        title: store.name,
        icon: createCustomMarkerIcon(selectedStoreId === store.id),
      })

      marker.addListener("click", () => {
        onStoreSelect(store.id)
      })

      newMarkers.set(store.id, marker)
      bounds.extend(position)
    })

    markersRef.current = newMarkers

    if (stores.length > 0) {
      map.fitBounds(bounds, 50)

      const listener = window.google.maps.event.addListener(map, "idle", () => {
        const zoom = map.getZoom()
        if (zoom && zoom > 15) {
          map.setZoom(15)
        }
        window.google.maps.event.removeListener(listener)
      })
    }

    return () => {
      newMarkers.forEach((marker) => marker.setMap(null))
    }
  }, [stores, isLoaded, onStoreSelect, selectedStoreId])

  // Highlight selected marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    markersRef.current.forEach((marker, storeId) => {
      marker.setIcon(createCustomMarkerIcon(selectedStoreId === storeId))

      if (selectedStoreId === storeId) {
        const store = stores.find((s) => s.id === storeId)
        if (store) {
          mapInstanceRef.current?.panTo({
            lat: store.latitude,
            lng: store.longitude,
          })
          mapInstanceRef.current?.setZoom(15)
        }
      }
    })
  }, [selectedStoreId, isLoaded, stores])

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return

    const frameId = window.requestAnimationFrame(updateOverlayPosition)
    const idleListener = window.google.maps.event.addListener(
      mapInstanceRef.current,
      "idle",
      updateOverlayPosition,
    )
    const onResize = () => updateOverlayPosition()
    window.addEventListener("resize", onResize)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.google.maps.event.removeListener(idleListener)
      window.removeEventListener("resize", onResize)
    }
  }, [isLoaded, updateOverlayPosition])

  if (!apiKeyStatus.valid) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-md bg-card p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <svg
              className="h-8 w-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Kartan kunde inte laddas
          </h3>
          <p className="max-w-md text-sm text-muted-foreground">
            {apiKeyStatus.error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-hidden relative">
      <div ref={mapRef} className="w-full h-full" />

      {!isLoaded && !loadError && (
        <div className="absolute inset-0">
          <Skeleton className="h-full w-full bg-muted" />
        </div>
      )}

      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 p-8">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Kartan kunde inte laddas
            </h3>
            <p className="max-w-md text-sm text-muted-foreground">
              {loadError}
            </p>
          </div>
        </div>
      )}

      {isLoaded && selectedStore && overlayPosition && (
        <div className="pointer-events-none absolute inset-0 z-20">
          <div
            className={`pointer-events-auto absolute w-75 rounded-md border shadow-xl transition-all duration-200 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 ${
              isDarkTheme
                ? "border-pxl-yellow/25 bg-[#090909]/95 text-white"
                : "border-slate-200/95 bg-[#fffdf5]/95 text-slate-900"
            }`}
            style={{ left: overlayPosition.left, top: overlayPosition.top }}
          >
            <div className="h-1 rounded-t-md bg-linear-to-r from-pxl-yellow/90 via-pxl-yellow/35 to-transparent" />
            <div className="space-y-3 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-pxl-yellow">
                    Power up point
                  </p>
                  <h3 className="truncate text-base font-black leading-tight">
                    {selectedStore.name}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => onStoreSelect(selectedStore.id)}
                  title="Stang"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="inline-flex max-w-full truncate rounded-full border border-pxl-yellow/30 bg-pxl-yellow/12 px-2.5 py-1 text-[11px] font-semibold text-pxl-yellow">
                {selectedStore.storeType}
              </div>

              <div
                className={`space-y-1.5 text-xs ${isDarkTheme ? "text-slate-300" : "text-slate-700"}`}
              >
                <p>
                  {selectedStore.address}, {selectedStore.postalCode}{" "}
                  {selectedStore.city}
                </p>
                {selectedStore.phone && <p>{selectedStore.phone}</p>}
                {selectedStore.openingHours && (
                  <p>{selectedStore.openingHours}</p>
                )}
              </div>

              <div
                className={`flex items-center justify-between gap-2 border-t pt-2.5 ${isDarkTheme ? "border-slate-700/70" : "border-slate-300/80"}`}
              >
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isDarkTheme ? "bg-slate-800 text-slate-300" : "bg-slate-200 text-slate-700"}`}
                >
                  {selectedStore.region}
                </span>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedStore.latitude},${selectedStore.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-pxl-yellow px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.08em] text-black transition hover:brightness-95"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open map
                </a>
              </div>
            </div>

            <div
              className="pointer-events-none absolute -bottom-5"
              style={{ left: overlayPosition.pointerLeft }}
            >
              <div className="relative -translate-x-1/2">
                <div
                  className={`mx-auto h-3 w-px ${
                    isDarkTheme ? "bg-pxl-yellow/70" : "bg-amber-500/70"
                  }`}
                />
                <div
                  className={`mx-auto h-2 w-2 rounded-full ring-1 ${
                    isDarkTheme
                      ? "bg-pxl-yellow ring-pxl-yellow/70"
                      : "bg-amber-500 ring-amber-600/60"
                  }`}
                />
              </div>
            </div>

            <div
              className={`pointer-events-none absolute -bottom-2 h-4 w-4 rotate-45 border-r border-b ${
                isDarkTheme
                  ? "border-pxl-yellow/25 bg-[#090909]/95"
                  : "border-slate-200/95 bg-[#fffdf5]/95"
              }`}
              style={{ left: `calc(${overlayPosition.pointerLeft}px - 8px)` }}
            />
          </div>
        </div>
      )}

      {isLoaded && (
        <div className="absolute right-3 bottom-10 z-10 flex flex-col gap-1">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-md border-border bg-background/90 text-foreground shadow-none backdrop-blur-sm hover:border-pxl-yellow hover:text-pxl-yellow dark:bg-card/90"
            onClick={handleZoomIn}
            title="Zooma in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-md border-border bg-background/90 text-foreground shadow-none backdrop-blur-sm hover:border-pxl-yellow hover:text-pxl-yellow dark:bg-card/90"
            onClick={handleZoomOut}
            title="Zooma ut"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="my-0.5 border-t border-border/70" />
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-md border-pxl-yellow/40 bg-background/90 text-pxl-yellow shadow-none backdrop-blur-sm hover:bg-pxl-yellow hover:text-black dark:bg-card/90"
            onClick={handleCenterSweden}
            title="Centrera på Sverige"
          >
            <LocateFixed className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
