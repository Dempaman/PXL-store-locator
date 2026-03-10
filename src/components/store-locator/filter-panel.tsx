"use client"

import { Region, StoreType, FilterState } from "@/types/store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown, MapPin, Store } from "lucide-react"

interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  regions: Region[]
  storeTypes: StoreType[]
}

export function FilterPanel({
  filters,
  onFilterChange,
  regions,
  storeTypes,
}: FilterPanelProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Region Filter */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#f5db00]" />
          <span className="text-xs text-gray-400 font-medium">Region</span>
        </div>
        <Select
          value={filters.region}
          onValueChange={(value) =>
            onFilterChange({ region: value as Region | "all" })
          }
        >
          <SelectTrigger className="h-10 bg-gray-900/50 border-gray-700 focus:border-[#f5db00] focus:ring-[#f5db00]/20 text-white">
            <SelectValue placeholder="Alla regioner" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem
              value="all"
              className="text-white focus:bg-gray-800 focus:text-white"
            >
              Alla regioner
            </SelectItem>
            {regions.map((region) => (
              <SelectItem
                key={region}
                value={region}
                className="text-white focus:bg-gray-800 focus:text-white"
              >
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Store Type Filter */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <Store className="w-3.5 h-3.5 text-[#f5db00]" />
          <span className="text-xs text-gray-400 font-medium">Butikstyp</span>
        </div>
        <Select
          value={filters.storeType}
          onValueChange={(value) =>
            onFilterChange({ storeType: value as StoreType | "all" })
          }
        >
          <SelectTrigger className="h-10 bg-gray-900/50 border-gray-700 focus:border-[#f5db00] focus:ring-[#f5db00]/20 text-white">
            <SelectValue placeholder="Alla typer" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700 max-h-[300px]">
            <SelectItem
              value="all"
              className="text-white focus:bg-gray-800 focus:text-white"
            >
              Alla typer
            </SelectItem>
            {storeTypes.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className="text-white focus:bg-gray-800 focus:text-white"
              >
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#f5db00]" />
          <span className="text-xs text-gray-400 font-medium">
            Sortera efter
          </span>
        </div>
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            onFilterChange({ sortBy: value as "name" | "city" | "distance" })
          }
        >
          <SelectTrigger className="h-10 bg-gray-900/50 border-gray-700 focus:border-[#f5db00] focus:ring-[#f5db00]/20 text-white">
            <SelectValue placeholder="Sortera efter" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            <SelectItem
              value="name"
              className="text-white focus:bg-gray-800 focus:text-white"
            >
              Namn
            </SelectItem>
            <SelectItem
              value="city"
              className="text-white focus:bg-gray-800 focus:text-white"
            >
              Stad
            </SelectItem>
            <SelectItem
              value="distance"
              className="text-white focus:bg-gray-800 focus:text-white"
            >
              Avstånd
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
