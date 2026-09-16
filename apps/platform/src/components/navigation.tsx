import { Link } from "@tanstack/react-router"
import { Building02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { useResolvedDark } from "@/hooks/use-resolved-dark"
import { cn } from "@/lib/utils"

export function Navigation() {
  const isDark = useResolvedDark()

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-4 sm:px-4 sm:pt-5">
      <nav
        aria-label="Navegación principal"
        className={cn(
          "pointer-events-auto flex h-12 w-full max-w-3xl items-center gap-2 rounded-lg border px-2 shadow-lg backdrop-blur-xl sm:h-14 sm:px-2.5",
          isDark
            ? "border-white/12 bg-black/45 text-white shadow-black/25"
            : "border-border/70 bg-background/80 text-foreground shadow-foreground/8"
        )}
      >
        <Link
          to="/"
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-lg py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDark ? "text-white" : "text-foreground"
          )}
          aria-label="pacta.ia, inicio"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm sm:size-8">
            <HugeiconsIcon icon={Building02Icon} strokeWidth={2} />
          </span>
          <span className="text-sm font-semibold tracking-tight">pacta.ia</span>
        </Link>

        <div className="ml-auto flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              isDark
                ? "text-white/90 hover:bg-white/10 hover:text-white aria-expanded:bg-white/10 aria-expanded:text-white"
                : "text-foreground"
            )}
            render={<Link to="/login" />}
          >
            Ingresar
          </Button>
        </div>
      </nav>
    </header>
  )
}
