"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Header } from "@/components/store-locator/header"
import { SearchBar } from "@/components/store-locator/search-bar"
import { FilterPanel } from "@/components/store-locator/filter-panel"
import { StoreList } from "@/components/store-locator/store-list"
import { StoreMap } from "@/components/store-locator/store-map"
import { stores as fallbackStores } from "@/data/stores"
import { FilterState, Store, UserLocation } from "@/types/store"
import { Button } from "@/components/ui/button"
import { Locate, RefreshCw, ChevronDown } from "lucide-react"

export default function Home() {
  const [allStores, setAllStores] = useState<Store[]>(fallbackStores)
  const [isLoadingStores, setIsLoadingStores] = useState(true)
  const [storesLoadError, setStoresLoadError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    region: "all",
    storeType: "all",
    sortBy: "name",
  })
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

  const loadStores = useCallback(async () => {
    try {
      setIsLoadingStores(true)
      setStoresLoadError(null)

      const response = await fetch("/api/stores", { cache: "no-store" })
      if (!response.ok) {
        throw new Error(`Store fetch failed (${response.status})`)
      }

      const payload = (await response.json()) as {
        stores?: Store[]
        source?: "kml" | "fallback"
        error?: string
      }

      if (!payload.stores || payload.stores.length === 0) {
        throw new Error("No stores returned from API")
      }

      setAllStores(payload.stores)
      if (payload.source === "fallback") {
        setStoresLoadError(
          "Kunde inte hamta externa butiker just nu. Visar lokal fallback-data.",
        )
      }
    } catch {
      setAllStores(fallbackStores)
      setStoresLoadError(
        "Kunde inte hamta externa butiker just nu. Visar lokal fallback-data.",
      )
    } finally {
      setIsLoadingStores(false)
    }
  }, [])

  // Load stores at app startup from API (KML-backed endpoint).
  useEffect(() => {
    void loadStores()
  }, [loadStores])

  const refreshStores = useCallback(() => {
    void loadStores()
  }, [loadStores])

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Get user location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Din webbläsare stöder inte geolokalisering")
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setIsLocating(false)
        // Automatically sort by distance when location is available
        setFilters((prev) => ({ ...prev, sortBy: "distance" }))
      },
      (error) => {
        setIsLocating(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Platsåtkomst nekades. Aktivera platsåtkomst i din webbläsare.",
            )
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Platsinformation är inte tillgänglig.")
            break
          case error.TIMEOUT:
            setLocationError("Begäran om plats tog för lång tid.")
            break
          default:
            setLocationError("Ett okänt fel inträffade vid hämtning av plats.")
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371 // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180
      const dLon = ((lon2 - lon1) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },
    [],
  )

  const availableRegions = useMemo(
    () =>
      Array.from(new Set(allStores.map((store) => store.region))).sort((a, b) =>
        a.localeCompare(b, "sv"),
      ),
    [allStores],
  )

  const availableStoreTypes = useMemo(
    () =>
      Array.from(new Set(allStores.map((store) => store.storeType))).sort(
        (a, b) => a.localeCompare(b, "sv"),
      ),
    [allStores],
  )

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let result = [...allStores]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (store) =>
          store.name.toLowerCase().includes(searchLower) ||
          store.city.toLowerCase().includes(searchLower) ||
          store.address.toLowerCase().includes(searchLower) ||
          store.storeType.toLowerCase().includes(searchLower),
      )
    }

    // Region filter
    if (filters.region !== "all") {
      result = result.filter((store) => store.region === filters.region)
    }

    // Store type filter
    if (filters.storeType !== "all") {
      result = result.filter((store) => store.storeType === filters.storeType)
    }

    // Sort
    switch (filters.sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name, "sv"))
        break
      case "city":
        result.sort((a, b) => a.city.localeCompare(b.city, "sv"))
        break
      case "distance":
        if (userLocation) {
          result.sort((a, b) => {
            const distA = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              a.latitude,
              a.longitude,
            )
            const distB = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              b.latitude,
              b.longitude,
            )
            return distA - distB
          })
        } else {
          result.sort((a, b) => a.name.localeCompare(b.name, "sv"))
        }
        break
    }

    return result
  }, [filters, userLocation, calculateDistance, allStores])

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Handle store selection
  const handleStoreSelect = useCallback((storeId: string) => {
    setSelectedStoreId((prev) => (prev === storeId ? null : storeId))
  }, [])

  // Scroll selected store into view
  useEffect(() => {
    if (selectedStoreId) {
      const element = document.getElementById(`store-${selectedStoreId}`)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [selectedStoreId])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      region: "all",
      storeType: "all",
      sortBy: "name",
    })
    setSelectedStoreId(null)
  }, [])

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Search, Filters, Store List */}
        <div className="w-full lg:w-[420px] xl:w-[480px] flex flex-col border-r border-gray-800 bg-black/50">
          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-800 space-y-4">
            <SearchBar
              value={filters.search}
              onChange={(value) => handleFilterChange({ search: value })}
            />
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              regions={availableRegions}
              storeTypes={availableStoreTypes}
            />

            {/* Location Button */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={getUserLocation}
                disabled={isLocating}
                className="flex-1 h-9 border-gray-700 text-gray-300 hover:text-white hover:border-[#f5db00] hover:bg-[#f5db00]/10"
              >
                {isLocating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Söker plats...
                  </>
                ) : (
                  <>
                    <Locate className="w-4 h-4 mr-2" />
                    {userLocation ? "Uppdatera min plats" : "Hitta min plats"}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshStores}
                disabled={isLoadingStores}
                className="h-9 border-gray-700 text-gray-300 hover:text-white hover:border-[#f5db00] hover:bg-[#f5db00]/10"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoadingStores ? "animate-spin" : ""}`}
                />
                <span className="ml-2 hidden sm:inline">Uppdatera butiker</span>
              </Button>
              {(filters.search ||
                filters.region !== "all" ||
                filters.storeType !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-9 text-gray-400 hover:text-white"
                >
                  Rensa
                </Button>
              )}
            </div>

            {locationError && (
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                {locationError}
              </p>
            )}

            {storesLoadError && (
              <p className="text-xs text-amber-300 bg-amber-500/10 px-3 py-2 rounded-lg">
                {storesLoadError}
              </p>
            )}

            {isLoadingStores && (
              <p className="text-xs text-gray-400">Laddar butiker...</p>
            )}
          </div>

          {/* Store List */}
          <div className="flex-1 overflow-hidden p-4">
            <StoreList
              stores={filteredStores}
              selectedStoreId={selectedStoreId}
              onStoreSelect={handleStoreSelect}
              userLocation={userLocation}
            />
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 h-[50vh] lg:h-auto min-h-[400px] lg:min-h-0">
          <StoreMap
            stores={filteredStores}
            selectedStoreId={selectedStoreId}
            onStoreSelect={handleStoreSelect}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-gray-400 text-sm">
              © 2024 PXL Energy AB, 556813-1436
            </p>
            <p className="text-gray-500 text-xs mt-1">This is your power-up!</p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/pxlpowerup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#f5db00] transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://pxlpowerup.se"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#f5db00] transition-colors text-sm"
            >
              pxlpowerup.se
            </a>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          className="fixed bottom-24 right-4 lg:hidden h-10 w-10 rounded-full bg-[#f5db00] text-black hover:bg-[#f5db00]/90 shadow-lg"
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronDown className="w-5 h-5 rotate-180" />
        </Button>
      )}
    </div>
  )
}
