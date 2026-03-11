"use client"

import { Store } from "@/types/store"
import { StoreCard } from "./store-card"
import { Store as StoreIcon, MapPin } from "lucide-react"

interface StoreListProps {
  stores: Store[]
  selectedStoreId: string | null
  onStoreSelect: (storeId: string) => void
  userLocation?: { latitude: number; longitude: number } | null
}

export function StoreList({
  stores,
  selectedStoreId,
  onStoreSelect,
  userLocation,
}: StoreListProps) {
  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <StoreIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-foreground">
          Inga butiker hittades
        </h3>
        <p className="text-sm text-muted-foreground">
          Prova att ändra dina filter eller sökord
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Results count */}
      <div className="flex items-center gap-2 border-b border-border px-1 py-3">
        <MapPin className="text-muted-foreground h-4 w-4" />
        <span className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{stores.length}</span>{" "}
          butiker hittades
        </span>
      </div>

      {/* Store list */}
      <div className="flex-1 overflow-y-auto -mx-4 px-4 min-h-0">
        <div className="space-y-3 py-4">
          {stores.map((store) => (
            <div key={store.id} id={`store-${store.id}`}>
              <StoreCard
                store={store}
                isSelected={selectedStoreId === store.id}
                onClick={() => onStoreSelect(store.id)}
                userLocation={userLocation}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
