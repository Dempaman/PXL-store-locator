"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Sök butik, stad eller adress..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="store-locator-control-surface store-locator-focus-accent h-10 rounded-md pl-10 pr-10 placeholder:text-muted-foreground"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-sm p-0 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
