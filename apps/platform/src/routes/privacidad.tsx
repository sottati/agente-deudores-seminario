import { Link, createFileRoute } from "@tanstack/react-router"

import { BrandLogo } from "@/components/brand-logo"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const Route = createFileRoute("/privacidad")({
  component: PrivacyNoticePage,
  head: () => ({
    meta: [
      { title: "Aviso de Privacidad al Deudor | pacta.ia" },
      {
        name: "description",
        content:
          "Información sobre el tratamiento de datos personales conforme a la Ley N° 25.326 (LPDP) y directrices de la AAIP.",
      },
    ],
  }),
})

function PrivacyNoticePage() {
  return (
    <main className="min-h-dvh bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center justify-between gap-4">
          <BrandLogo asLink />
          <Link
            to="/"
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Volver al inicio
          </Link>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              Aviso de Privacidad para Personas Deudoras
            </CardTitle>
            <CardDescription>
              Cumplimiento de la Ley N° 25.326 de Protección de los Datos
              Personales (LPDP), Resolución AAIP N° 2/2024 y Ley N° 6.171
              (CABA).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-sm leading-relaxed text-foreground">
            <section className="space-y-2">
              <h2 className="text-base font-semibold">
                1. Responsable y Encargado del Tratamiento
              </h2>
              <p className="text-muted-foreground">
                La administración del consorcio o institución educativa que te
                envió el enlace de negociación actúa como{" "}
                <strong className="text-foreground">
                  Responsable de la Base de Datos
                </strong>{" "}
                (titular del vínculo jurídico y quien determina la finalidad del
                tratamiento).{" "}
                <strong className="text-foreground">pacta.ia</strong> interviene
                exclusivamente como{" "}
                <strong className="text-foreground">
                  Encargado del Tratamiento
                </strong>{" "}
                en los términos del artículo 25 de la Ley N° 25.326, procesando
                la información por cuenta y orden de dicha administración.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold">
                2. Finalidad del Tratamiento y Minimización de Datos
              </h2>
              <p className="text-muted-foreground">
                Los datos vinculados a la unidad funcional o legajo, el saldo
                pendiente, los mensajes de la conversación y la evidencia de
                aceptación del acuerdo se utilizan{" "}
                <strong className="text-foreground">
                  únicamente para gestionar y documentar una propuesta de pago
                  extrajudicial
                </strong>{" "}
                sobre la deuda específica informada. Queda estrictamente
                prohibida su venta, cesión a terceros o utilización para
                perfilado crediticio comercial ajeno a la administración.
              </p>
              <p className="text-muted-foreground">
                Antes de exhibir montos o detalles de la deuda se solicita una
                verificación de identidad (últimos 3 dígitos del DNI). Para
                proteger tu privacidad, el modelo de lenguaje recibe un
                identificador acotado de la unidad o cuenta y nunca tu DNI
                completo.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold">
                3. Transparencia Algorítmica e Intervención Humana
              </h2>
              <p className="text-muted-foreground">
                El canal es atendido inicialmente por un{" "}
                <strong className="text-foreground">
                  asistente virtual automatizado
                </strong>
                . Las opciones de pago, quitas de intereses y cuotas son
                calculadas de forma determinística según las reglas fijadas por
                la administración. En cualquier momento podés solicitar la
                intervención de una persona escribiendo{" "}
                <span className="font-mono text-xs text-foreground">
                  &quot;hablar con una persona&quot;
                </span>{" "}
                o presionando el botón correspondiente en el encabezado del
                chat.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold">
                4. Seguridad y Evidencia del Acuerdo
              </h2>
              <p className="text-muted-foreground">
                La información se almacena con cifrado en tránsito (TLS) y en
                reposo (AES-256), con aislamiento por organización (Row Level
                Security). En caso de aceptar un plan de pago, se registran la
                fecha y hora de aceptación, la dirección IP, el navegador
                (user-agent) y una huella criptográfica (SHA-256) de la
                conversación como constancia de firma electrónica conforme a la
                Ley N° 25.506 y al Código Civil y Comercial de la Nación.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold">
                5. Derechos ARCO (Acceso, Rectificación, Cancelación y
                Oposición)
              </h2>
              <p className="text-muted-foreground">
                Como titular de los datos personales tenés derecho a solicitar
                el acceso, la rectificación, la actualización o la supresión de
                tus datos ante la administración responsable (artículos 14 y 16
                de la Ley N° 25.326), ya sea comunicándote directamente con la
                administración o pidiendo hablar con una persona desde el mismo
                chat.
              </p>
              <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                La{" "}
                <strong className="text-foreground">
                  Agencia de Acceso a la Información Pública (AAIP)
                </strong>
                , en su carácter de Órgano de Control de la Ley N° 25.326, tiene
                la atribución de atender las denuncias y reclamos que
                interpongan quienes resulten afectados en sus derechos por
                incumplimiento de las normas vigentes en materia de protección
                de datos personales.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
