import { useResolvedDark } from "@/hooks/use-resolved-dark"
import { cn } from "@/lib/utils"

const parts = [
  {
    amount: "$15",
    unit: "USD al mes",
    body: "Dashboard, infraestructura y la línea de WhatsApp Business.",
  },
  {
    amount: "1,5% a 3%",
    unit: "sobre lo recuperado",
    body: "Solo del capital de mora que el agente cobra. Si no hay recupero, no hay comisión.",
  },
] as const

export function Pricing() {
  const isDark = useResolvedDark()

  return (
    <section
      id="precios"
      aria-labelledby="precios-heading"
      className="mt-56 w-full max-w-5xl scroll-mt-28 sm:mt-72 lg:mt-96"
    >
      <h1
        id="precios-heading"
        className={cn(
          "text-center text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-5xl",
          isDark
            ? "text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]"
            : "text-foreground drop-shadow-[0_1px_14px_rgba(255,255,255,0.9)]"
        )}
      >
        Precio
      </h1>

      <div className="mt-16 grid gap-16 sm:mt-24 sm:grid-cols-2 sm:gap-x-24 lg:gap-x-32">
        {parts.map((part) => (
          <article key={part.amount} className="relative text-center">
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-full blur-3xl",
                isDark ? "bg-black/45" : "bg-white/75"
              )}
            />
            <h2
              className={cn(
                "relative text-5xl leading-none font-semibold tracking-[-0.05em] text-balance sm:text-6xl",
                isDark
                  ? "text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]"
                  : "text-foreground drop-shadow-[0_1px_14px_rgba(255,255,255,0.9)]"
              )}
            >
              {part.amount}
            </h2>
            <p
              className={cn(
                "relative mt-3 text-sm font-medium tracking-[-0.01em]",
                isDark
                  ? "text-white/70 drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)]"
                  : "text-foreground/60 drop-shadow-[0_1px_12px_rgba(255,255,255,0.85)]"
              )}
            >
              {part.unit}
            </p>
            <p
              className={cn(
                "relative mt-4 text-lg leading-8 text-pretty",
                isDark
                  ? "text-white/80 drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)]"
                  : "text-foreground/70 drop-shadow-[0_1px_12px_rgba(255,255,255,0.85)]"
              )}
            >
              {part.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
