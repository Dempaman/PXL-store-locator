"use client";

import { Store } from "@/types/store";
import { StoreCard } from "./store-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Store as StoreIcon, MapPin } from "lucide-react";

interface StoreListProps {
  stores: Store[];
  selectedStoreId: string | null;
  onStoreSelect: (storeId: string) => void;
  userLocation?: { latitude: number; longitude: number } | null;
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
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <StoreIcon className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">Inga butiker hittades</h3>
        <p className="text-gray-400 text-sm">
          Prova att ändra dina filter eller sökord
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Results count */}
      <div className="flex items-center gap-2 px-1 py-3 border-b border-gray-800">
        <MapPin className="w-4 h-4 text-[#f5db00]" />
        <span className="text-sm text-gray-300">
          <span className="font-semibold text-white">{stores.length}</span> butiker hittades
        </span>
      </div>

      {/* Store list */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3 py-4">
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              isSelected={selectedStoreId === store.id}
              onClick={() => onStoreSelect(store.id)}
              userLocation={userLocation}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
