import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getThemePreference,
  setThemePreference,
  themePreferenceLabel,
} from "@/lib/theme"
import type { ThemePreference } from "@/lib/theme"

const options = Object.keys(themePreferenceLabel) as Array<ThemePreference>

export function ThemeSettingsCard() {
  // El servidor no conoce la preferencia: se lee del navegador al montar.
  const [preference, setPreference] = useState<ThemePreference>()

  useEffect(() => {
    setPreference(getThemePreference())
  }, [])

  function choose(next: ThemePreference) {
    setThemePreference(next)
    setPreference(next)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apariencia</CardTitle>
        <CardDescription>
          Elegí el tema del panel. &quot;Sistema&quot; sigue la configuración de
          tu dispositivo. Se guarda en este navegador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="radiogroup"
          aria-label="Tema"
          className="inline-flex flex-wrap gap-2"
        >
          {options.map((option) => {
            const selected = preference === option
            return (
              <Button
                key={option}
                type="button"
                role="radio"
                aria-checked={selected}
                variant={selected ? "default" : "outline"}
                onClick={() => choose(option)}
              >
                {themePreferenceLabel[option]}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
