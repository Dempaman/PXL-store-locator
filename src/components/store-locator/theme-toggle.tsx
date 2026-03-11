"use client"

import { useSyncExternalStore } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

const emptySubscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isMounted = useIsMounted()

  const isDarkTheme = resolvedTheme === "dark"
  const toggleLabel = !isMounted
    ? "Vaxla tema"
    : isDarkTheme
      ? "Vaxla till ljust lage"
      : "Vaxla till morkt lage"

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
      className="store-locator-control-surface-blur store-locator-accent-hover h-9 rounded-md px-2.5"
      title={toggleLabel}
      aria-label={toggleLabel}
    >
      {isMounted && isDarkTheme ? (
        <Sun className="text-muted-foreground h-4 w-4" />
      ) : (
        <Moon className="text-muted-foreground h-4 w-4" />
      )}
      <span className="ml-2 hidden sm:inline">
        {isMounted ? (isDarkTheme ? "Ljust lage" : "Morkt lage") : "Tema"}
      </span>
    </Button>
  )
}
