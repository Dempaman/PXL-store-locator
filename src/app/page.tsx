"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Header } from "@/components/store-locator/header"
import { SearchBar } from "@/components/store-locator/search-bar"
import { FilterPanel } from "@/components/store-locator/filter-panel"
import { StoreList } from "@/components/store-locator/store-list"
import { StoreMap } from "@/components/store-locator/store-map"
import { FilterState, Store, UserLocation } from "@/types/store"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Locate, RefreshCw, SlidersHorizontal } from "lucide-react"

export default function Home() {
  const [allStores, setAllStores] = useState<Store[]>([])
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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

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
        source?: "kml"
        error?: string
      }

      if (!payload.stores || payload.stores.length === 0) {
        throw new Error("No stores returned from API")
      }

      setAllStores(payload.stores)
    } catch {
      setStoresLoadError(
        "Kunde inte hamta butiker fran KML-kallan just nu. Forsok igen senare.",
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
    setIsMobileDrawerOpen(false)
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

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.region !== "all" ||
    filters.storeType !== "all"

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.region !== "all" ? 1 : 0) +
    (filters.storeType !== "all" ? 1 : 0)

  const controlsBlock = (
    <>
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

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={getUserLocation}
          disabled={isLocating}
          className="store-locator-control-surface store-locator-accent-hover h-9 flex-1 rounded-md"
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
          className="store-locator-control-surface store-locator-accent-hover h-9 rounded-md"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoadingStores ? "animate-spin" : ""}`}
          />
          <span className="ml-2 hidden sm:inline">Uppdatera butiker</span>
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-9 rounded-md text-muted-foreground hover:bg-accent/60 hover:text-foreground"
          >
            Rensa
          </Button>
        )}
      </div>

      {locationError && (
        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {locationError}
        </p>
      )}

      {storesLoadError && (
        <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {storesLoadError}
        </p>
      )}

      {isLoadingStores && (
        <p className="text-xs text-muted-foreground">Laddar butiker...</p>
      )}
    </>
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground transition-colors duration-200">
      <Header />

      <main className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left Panel - Search, Filters, Store List */}
        <div className="hidden min-h-0 flex-col border-r border-border bg-card/95 lg:flex lg:w-105 xl:w-120">
          <div className="h-0.5 shrink-0 bg-linear-to-r from-primary/80 via-primary/20 to-transparent" />
          <div className="shrink-0 space-y-4 border-b border-border/80 p-4">
            {controlsBlock}
          </div>

          <div className="flex-1 min-h-0 flex flex-col p-4">
            <StoreList
              stores={filteredStores}
              selectedStoreId={selectedStoreId}
              onStoreSelect={handleStoreSelect}
              userLocation={userLocation}
            />
          </div>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 min-h-0 relative">
          <StoreMap
            stores={filteredStores}
            selectedStoreId={selectedStoreId}
            onStoreSelect={handleStoreSelect}
          />

          {/* Mobile drawer trigger */}
          <div className="lg:hidden absolute top-3 left-3 z-20">
            <Drawer
              open={isMobileDrawerOpen}
              onOpenChange={setIsMobileDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="store-locator-control-surface-blur store-locator-accent-hover h-9 rounded-md"
                >
                  <SlidersHorizontal className="text-muted-foreground w-4 h-4 mr-2" />
                  Filter och lista
                  {activeFilterCount > 0 && (
                    <span className="ml-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-none font-black text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-[80vh] border-border bg-background text-foreground">
                <DrawerHeader>
                  <DrawerTitle>Butikssökare</DrawerTitle>
                </DrawerHeader>

                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-4">
                  <div className="space-y-4 border-b border-border pb-4">
                    {controlsBlock}
                  </div>

                  <div className="min-h-75">
                    <StoreList
                      stores={filteredStores}
                      selectedStoreId={selectedStoreId}
                      onStoreSelect={handleStoreSelect}
                      userLocation={userLocation}
                    />
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background px-6 py-4 transition-colors duration-200 lg:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-muted-foreground">
              © 2024 PXL Energy AB, 556813-1436
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              This is your power-up!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/pxlpowerup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary-foreground dark:hover:text-primary"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://pxlpowerup.se"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-primary-foreground dark:hover:text-primary"
            >
              pxlpowerup.se
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
