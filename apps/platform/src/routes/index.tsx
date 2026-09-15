import { Link, createFileRoute } from "@tanstack/react-router"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { DashboardPreview } from "@/components/dashboard-preview"
import { HeroShaderGradient } from "@/components/hero-shader-gradient"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { useResolvedDark } from "@/hooks/use-resolved-dark"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "Cobro | Cobranzas B2B con IA" },
      {
        name: "description",
        content:
          "Negociá deuda vencida con reglas claras, acuerdos trazables y menos trabajo manual.",
      },
    ],
  }),
})

function HomePage() {
  const isDark = useResolvedDark()

  return (
    <div className="relative isolate min-h-svh overflow-hidden bg-background">
      <HeroShaderGradient />

      <Navigation />

      <main className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-5 pt-24 pb-12 sm:px-8 sm:pt-28 sm:pb-16 lg:px-10 lg:pt-32 lg:pb-24">
        <section className="max-w-2xl text-center">
          <h1
            className={cn(
              "text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-5xl lg:text-6xl",
              isDark ? "text-white" : "text-foreground"
            )}
          >
            Recuperá deuda sin convertir cada cobro en una pelea.
          </h1>
          <p
            className={cn(
              "mx-auto mt-6 max-w-xl text-base leading-7 sm:text-lg",
              isDark ? "text-white/80" : "text-muted-foreground"
            )}
          >
            Cobro conversa con cada deudor, propone planes dentro de tu política
            y registra el acuerdo. Vos intervenís cuando hace falta.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-11 px-4"
              render={<Link to="/dashboard" />}
            >
              Probar el dashboard
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={cn(
                "h-11 px-4 backdrop-blur",
                isDark
                  ? "border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white"
                  : "bg-background/70"
              )}
              render={<a href="#producto" />}
            >
              Ver cómo funciona
            </Button>
          </div>
        </section>

        <div className="mt-14 w-full max-w-6xl">
          <DashboardPreview />
        </div>
      </main>
    </div>
  )
}
