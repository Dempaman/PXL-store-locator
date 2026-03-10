"use client";

import { Store } from "@/types/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  Navigation,
} from "lucide-react";

interface StoreCardProps {
  store: Store;
  isSelected: boolean;
  onClick: () => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

const storeTypeColors: Record<string, string> = {
  "GameStop": "bg-red-500/20 text-red-400 border-red-500/30",
  "Kandy'z": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Game Store": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Kiosk": "bg-green-500/20 text-green-400 border-green-500/30",
  "Gaming Cafe": "bg-[#f5db00]/20 text-[#f5db00] border-[#f5db00]/30",
  "Pressbyrån": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "7-Eleven": "bg-green-500/20 text-green-400 border-green-500/30",
  "Circle K": "bg-red-500/20 text-red-400 border-red-500/30",
  "Hemköp": "bg-green-500/20 text-green-400 border-green-500/30",
  "ICA": "bg-red-500/20 text-red-400 border-red-500/30",
  "Coop": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Willys": "bg-green-500/20 text-green-400 border-green-500/30",
  "Netto": "bg-red-500/20 text-red-400 border-red-500/30",
  "Lidl": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Åhléns": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Elgiganten": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Webhallen": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Inet": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Komplett": "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function StoreCard({ store, isSelected, onClick, userLocation }: StoreCardProps) {
  const distance = userLocation
    ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        store.latitude,
        store.longitude
      )
    : null;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`;

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-[#f5db00]/10 border-[#f5db00] ring-1 ring-[#f5db00]/50"
          : "bg-gray-900/50 border-gray-700 hover:border-[#f5db00]/50 hover:bg-gray-800/50"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">{store.name}</h3>
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${
                storeTypeColors[store.storeType] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
              }`}
            >
              {store.storeType}
            </Badge>
          </div>
          {distance !== null && (
            <div className="flex items-center gap-1 text-[#f5db00] text-sm font-medium">
              <Navigation className="w-3.5 h-3.5" />
              <span>{distance.toFixed(1)} km</span>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2 text-sm text-gray-300">
            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">
              {store.address}, {store.postalCode} {store.city}
            </span>
          </div>

          {store.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>{store.phone}</span>
            </div>
          )}

          {store.openingHours && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>{store.openingHours}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
          <Badge variant="outline" className="text-xs bg-gray-800 text-gray-400 border-gray-600">
            {store.region}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 px-2 text-[#f5db00] hover:text-[#f5db00] hover:bg-[#f5db00]/10"
            onClick={(e) => {
              e.stopPropagation();
              window.open(googleMapsUrl, "_blank");
            }}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            Karta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
