"use client"

import { Store } from "@/types/store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, ExternalLink, Navigation } from "lucide-react"

interface StoreCardProps {
  store: Store
  isSelected: boolean
  onClick: () => void
  userLocation?: { latitude: number; longitude: number } | null
}

const storeTypeColors: Record<string, string> = {
  GameStop:
    "border-red-500/25 bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  "Kandy'z":
    "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "Game Store":
    "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  Kiosk:
    "border-green-500/25 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  "Gaming Cafe": "store-locator-accent-badge dark:bg-primary/15",
  Pressbyrån:
    "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  "7-Eleven":
    "border-green-500/25 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  "Circle K":
    "border-red-500/25 bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  Hemköp:
    "border-green-500/25 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  ICA: "border-red-500/25 bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  Coop: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  Willys:
    "border-green-500/25 bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  Netto:
    "border-red-500/25 bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  Lidl: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  Åhléns:
    "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  Elgiganten:
    "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  Webhallen:
    "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  Inet: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  Komplett:
    "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
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
}

export function StoreCard({
  store,
  isSelected,
  onClick,
  userLocation,
}: StoreCardProps) {
  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        store.latitude,
        store.longitude,
      )
    : null

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? "store-locator-selected-surface"
          : "rounded-md border-border bg-card/90 hover:border-primary/40 hover:bg-accent/50"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="truncate font-semibold text-foreground">
                {store.name}
              </h3>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${
                storeTypeColors[store.storeType] ||
                "border-border bg-muted text-muted-foreground"
              }`}
            >
              {store.storeType}
            </Badge>
          </div>
          {distance !== null && (
            <div className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
              <Navigation className="w-3.5 h-3.5" />
              <span>{distance.toFixed(1)} km</span>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="line-clamp-2">
              {store.address}, {store.postalCode} {store.city}
            </span>
          </div>

          {store.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{store.phone}</span>
            </div>
          )}

          {store.openingHours && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{store.openingHours}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-border/80 pt-3">
          <Badge
            variant="outline"
            className="rounded-full border-border bg-muted/60 text-xs text-muted-foreground"
          >
            {store.region}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground ml-auto h-7 rounded-sm px-2 hover:bg-accent hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              window.open(googleMapsUrl, "_blank")
            }}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            Karta
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
