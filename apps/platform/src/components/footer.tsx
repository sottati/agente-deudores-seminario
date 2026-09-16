import { Link } from "@tanstack/react-router"

import { BrandLogo } from "@/components/brand-logo"
import { useResolvedDark } from "@/hooks/use-resolved-dark"
import { cn } from "@/lib/utils"

const links = [
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Para quién", href: "#para-quien" },
  { label: "Precios", href: "#precios" },
  { label: "FAQ", href: "#faq" },
] as const

export function Footer() {
  const isDark = useResolvedDark()
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn(
        "relative z-10 w-full min-h-48 border-t",
        isDark
          ? "border-white/10 bg-black text-white"
          : "border-border bg-muted text-foreground"
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl flex-col justify-between gap-8 px-5 py-10 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-3">
            <BrandLogo
              asLink
              wordmarkClassName={isDark ? "text-white" : "text-foreground"}
            />
            <p
              className={cn(
                "max-w-xs text-sm leading-6",
                isDark ? "text-white/65" : "text-muted-foreground"
              )}
            >
              Cobranzas B2B con IA. Reglas claras, acuerdos trazables.
            </p>
          </div>

          <nav aria-label="Enlaces del sitio">
            <ul className="flex flex-col gap-2 sm:items-end">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      "text-sm transition-colors",
                      isDark
                        ? "text-white/75 hover:text-white"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  className={cn(
                    "text-sm transition-colors",
                    isDark
                      ? "text-white/75 hover:text-white"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Ingresar
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p
          className={cn(
            "text-xs",
            isDark ? "text-white/45" : "text-muted-foreground"
          )}
        >
          © {year} pacta.ia. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}
