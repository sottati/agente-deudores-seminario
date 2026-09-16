import { useResolvedDark } from "@/hooks/use-resolved-dark"
import { cn } from "@/lib/utils"

const audiences = [
  {
    title: "Administradores de consorcios",
    body: [
      "Expensas vencidas en varios edificios. El seguimiento hoy sale por WhatsApp o por teléfono.",
      "Cargás el saldo de cada unidad y hasta cuántas cuotas o quita de intereses aceptás. El agente negocia con esa política y deja el acuerdo escrito. El vecino no te tiene que atender a vos.",
    ],
  },
  {
    title: "Tesorería de colegios",
    body: [
      "Cuotas en mora. El cobro no debería ser una conversación con la familia.",
      "Definís el plan máximo y lo que no se negocia. El agente habla con el responsable de pago. Si el caso se sale de regla, te llega a tesorería.",
    ],
  },
] as const

export function WhoItsFor() {
  const isDark = useResolvedDark()

  return (
    <section
      id="para-quien"
      aria-labelledby="para-quien-heading"
      className="mt-56 w-full max-w-5xl scroll-mt-28 sm:mt-72 lg:mt-96"
    >
      <h1
        id="para-quien-heading"
        className={cn(
          "text-center text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-5xl",
          isDark
            ? "text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]"
            : "text-foreground drop-shadow-[0_1px_14px_rgba(255,255,255,0.9)]"
        )}
      >
        Para quién es
      </h1>

      <div className="mt-16 grid gap-16 sm:mt-24 sm:grid-cols-2 sm:gap-x-24 lg:gap-x-32">
        {audiences.map((audience) => (
          <article key={audience.title} className="relative text-center">
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-full blur-3xl",
                isDark ? "bg-black/45" : "bg-white/75"
              )}
            />
            <h2
              className={cn(
                "relative text-3xl leading-tight font-semibold tracking-[-0.03em] text-balance sm:text-4xl",
                isDark
                  ? "text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]"
                  : "text-foreground drop-shadow-[0_1px_14px_rgba(255,255,255,0.9)]"
              )}
            >
              {audience.title}
            </h2>
            <div className="relative mt-4 space-y-3">
              {audience.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className={cn(
                    "text-lg leading-8 text-pretty",
                    isDark
                      ? "text-white/80 drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)]"
                      : "text-foreground/70 drop-shadow-[0_1px_12px_rgba(255,255,255,0.85)]"
                  )}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
