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
          <MapPin className="text-muted-foreground w-3.5 h-3.5" />
          <span className="text-xs font-medium text-muted-foreground">
            Region
          </span>
        </div>
        <Select
          value={filters.region}
          onValueChange={(value) =>
            onFilterChange({ region: value as Region | "all" })
          }
        >
          <SelectTrigger className="store-locator-control-surface store-locator-focus-accent-select h-10 rounded-md">
            <SelectValue placeholder="Alla regioner" />
          </SelectTrigger>
          <SelectContent className="rounded-md border-border bg-popover text-popover-foreground">
            <SelectItem
              value="all"
              className="rounded-sm text-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Alla regioner
            </SelectItem>
            {regions.map((region) => (
              <SelectItem
                key={region}
                value={region}
                className="rounded-sm text-foreground focus:bg-accent focus:text-accent-foreground"
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
          <Store className="text-muted-foreground w-3.5 h-3.5" />
          <span className="text-xs font-medium text-muted-foreground">
            Butikstyp
          </span>
        </div>
        <Select
          value={filters.storeType}
          onValueChange={(value) =>
            onFilterChange({ storeType: value as StoreType | "all" })
          }
        >
          <SelectTrigger className="store-locator-control-surface store-locator-focus-accent-select h-10 rounded-md">
            <SelectValue placeholder="Alla typer" />
          </SelectTrigger>
          <SelectContent className="max-h-75 rounded-md border-border bg-popover text-popover-foreground">
            <SelectItem
              value="all"
              className="rounded-sm text-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Alla typer
            </SelectItem>
            {storeTypes.map((type) => (
              <SelectItem
                key={type}
                value={type}
                className="rounded-sm text-foreground focus:bg-accent focus:text-accent-foreground"
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
          <ArrowUpDown className="text-muted-foreground w-3.5 h-3.5" />
          <span className="text-xs font-medium text-muted-foreground">
            Sortera efter
          </span>
        </div>
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            onFilterChange({ sortBy: value as "name" | "city" | "distance" })
          }
        >
          <SelectTrigger className="store-locator-control-surface store-locator-focus-accent-select h-10 rounded-md">
            <SelectValue placeholder="Sortera efter" />
          </SelectTrigger>
          <SelectContent className="rounded-md border-border bg-popover text-popover-foreground">
            <SelectItem
              value="name"
              className="rounded-sm text-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Namn
            </SelectItem>
            <SelectItem
              value="city"
              className="rounded-sm text-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Stad
            </SelectItem>
            <SelectItem
              value="distance"
              className="rounded-sm text-foreground focus:bg-accent focus:text-accent-foreground"
            >
              Avstånd
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
