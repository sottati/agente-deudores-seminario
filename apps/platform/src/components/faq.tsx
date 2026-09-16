import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useResolvedDark } from "@/hooks/use-resolved-dark"
import { cn } from "@/lib/utils"

const items = [
  {
    question: "¿Qué tipos de deuda se pueden gestionar?",
    answer:
      "Expensas de consorcios, cuotas escolares y otras deudas B2B recurrentes. Cargás el saldo, el historial y las reglas de negociación para cada caso.",
  },
  {
    question: "¿El agente puede ofrecer cualquier descuento o plan?",
    answer:
      "No. Vos definís el máximo de cuotas, la quita de intereses permitida y lo que no se negocia. El agente solo propone planes dentro de esa política.",
  },
  {
    question: "¿Cómo intervengo si un caso se sale de regla?",
    answer:
      "Cuando el deudor pide algo fuera de política o el caso requiere criterio humano, el agente te avisa y el caso queda pendiente en el dashboard para que lo resuelvas vos.",
  },
  {
    question: "¿Qué pasa si el deudor no responde?",
    answer:
      "El agente hace seguimiento según la cadencia que configures. Si no hay respuesta, el caso queda visible en el dashboard con el estado actualizado para que decidas el próximo paso.",
  },
  {
    question: "¿Cómo se cobra el servicio?",
    answer:
      "Hay un costo fijo mensual por el dashboard y la línea de WhatsApp Business, más una comisión del 1,5% al 3% solo sobre el capital de mora que el agente logra recuperar.",
  },
  {
    question: "¿Los datos están seguros?",
    answer:
      "Cada acuerdo queda registrado con texto, plan y saldo. La información de deudores y políticas de cobro se maneja con acceso restringido a tu equipo.",
  },
] as const

export function Faq() {
  const isDark = useResolvedDark()

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="mt-56 w-full max-w-3xl scroll-mt-28 sm:mt-72 lg:mt-96"
    >
      <h2
        id="faq-heading"
        className={cn(
          "text-center text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-5xl",
          isDark
            ? "text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)]"
            : "text-foreground drop-shadow-[0_1px_14px_rgba(255,255,255,0.9)]"
        )}
      >
        Preguntas frecuentes
      </h2>

      <div className="relative mt-12 sm:mt-16">
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -inset-x-10 -inset-y-8 -z-10 rounded-full blur-3xl",
            isDark ? "bg-black/45" : "bg-white/75"
          )}
        />

        <Accordion className="relative">
          {items.map((item) => (
            <AccordionItem
              key={item.question}
              value={item.question}
              className={cn(
                "not-last:border-b",
                isDark ? "border-white/15" : "border-foreground/15"
              )}
            >
              <AccordionTrigger
                className={cn(
                  "py-4 text-base font-medium hover:no-underline sm:py-5",
                  isDark
                    ? "text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.75)] **:data-[slot=accordion-trigger-icon]:text-white/70"
                    : "text-foreground drop-shadow-[0_1px_14px_rgba(255,255,255,0.9)] **:data-[slot=accordion-trigger-icon]:text-foreground/60"
                )}
              >
                {item.question}
              </AccordionTrigger>
              <AccordionContent
                className={cn(
                  "text-base leading-7",
                  isDark
                    ? "text-white/80 drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)]"
                    : "text-foreground/70 drop-shadow-[0_1px_12px_rgba(255,255,255,0.85)]"
                )}
              >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
