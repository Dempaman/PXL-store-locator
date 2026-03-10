"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isDarkTheme = resolvedTheme === "dark"

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
      className="h-9 rounded-md border-border bg-background/70 px-2.5 text-foreground shadow-none backdrop-blur hover:border-pxl-yellow hover:bg-pxl-yellow/10"
      title={isDarkTheme ? "Vaxla till ljust lage" : "Vaxla till morkt lage"}
      aria-label={
        isDarkTheme ? "Vaxla till ljust lage" : "Vaxla till morkt lage"
      }
    >
      {isMounted && isDarkTheme ? (
        <Sun className="h-4 w-4 text-pxl-yellow" />
      ) : (
        <Moon className="h-4 w-4 text-pxl-yellow" />
      )}
      <span className="ml-2 hidden sm:inline">
        {isMounted ? (isDarkTheme ? "Ljust lage" : "Morkt lage") : "Tema"}
      </span>
    </Button>
  )
}
