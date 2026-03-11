"use client"

import { ThemeToggle } from "@/components/store-locator/theme-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/92 backdrop-blur supports-backdrop-filter:bg-background/80 transition-colors duration-200 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary sm:h-12 sm:w-12">
                  <span className="text-primary-foreground font-black text-xl sm:text-2xl tracking-tighter">
                    PXL
                  </span>
                  <span className="text-primary-foreground font-bold text-lg sm:text-xl absolute -right-1 -top-1">
                    .
                  </span>
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-wide text-foreground">
                  PXL Energy
                </h1>
                <p className="store-locator-accent-text -mt-1 text-xs font-medium">
                  This is your power-up!
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <h2 className="truncate text-lg font-semibold text-foreground sm:text-xl">
              Butikssökare
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Stats */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="store-locator-accent-text text-lg font-bold">
                  50+
                </p>
                <p className="text-xs text-muted-foreground">Butiker</p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-right">
                <p className="store-locator-accent-text text-lg font-bold">
                  21
                </p>
                <p className="text-xs text-muted-foreground">Regioner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
