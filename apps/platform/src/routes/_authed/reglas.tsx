import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import { Field, FormError, MoneyField, TextField } from "@/components/form-field"
import { PageBody, PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { formValues, useAction } from "@/hooks/use-action"
import { centsToPesosInput } from "@/lib/format"
import { toneLabel, type AgentTone } from "@/lib/labels"
import { getPolicy, updatePolicy } from "@/server/settings"

export const Route = createFileRoute("/_authed/reglas")({
  loader: () => getPolicy(),
  component: PolicyPage,
  head: () => ({ meta: [{ title: "Reglas del agente | pacta.ia" }] }),
})

function PolicyPage() {
  const policy = Route.useLoaderData()
  const save = useAction(useServerFn(updatePolicy))
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)
    const values = formValues(event.currentTarget)
    const result = await save.run({
      data: {
        maxInstallments: values.maxInstallments,
        minDownPaymentPct: values.minDownPaymentPct,
        minInstallmentAmount: values.minInstallmentAmount,
        maxInterestWaiverPct: values.maxInterestWaiverPct,
        singlePaymentInterestWaiverPct: values.singlePaymentInterestWaiverPct,
        maxPrincipalDiscountPct: values.maxPrincipalDiscountPct,
        maxFirstDueDays: values.maxFirstDueDays,
        offerValidityHours: values.offerValidityHours,
        escalateAboveAmount: values.escalateAboveAmount,
        tone: values.tone as AgentTone,
        customInstructions: values.customInstructions,
      },
    })
    if (result.ok) setSaved(true)
  }

  const percent = { type: "number", min: 0, max: 100, step: 1, required: true } as const

  return (
    <>
      <PageHeader title="Reglas del agente" />
      <PageBody>
        {/* key: remonta el form con los valores guardados (inputs no controlados). */}
        <form
          key={policy?.updated_at ?? "nueva"}
          method="post"
          onSubmit={handleSubmit}
          onChange={() => setSaved(false)}
          className="grid max-w-3xl gap-4"
        >
          <p className="text-muted-foreground">
            El agente nunca ofrece condiciones fuera de estos límites: todas las
            cifras las calcula el motor de reglas. Los cambios aplican a las
            negociaciones nuevas; las que están en curso conservan las reglas con
            las que se crearon.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Planes de pago</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Cantidad máxima de cuotas"
                name="maxInstallments"
                type="number"
                min={1}
                max={24}
                required
                defaultValue={policy?.max_installments ?? 3}
              />
              <TextField
                label="Anticipo mínimo (%)"
                name="minDownPaymentPct"
                {...percent}
                defaultValue={policy?.min_down_payment_pct ?? 20}
                hint="Sobre el total del plan en cuotas."
              />
              <MoneyField
                label="Cuota mínima ($)"
                name="minInstallmentAmount"
                required
                defaultValue={centsToPesosInput(policy?.min_installment_amount_cents ?? 2000000)}
              />
              <TextField
                label="Días máximos hasta la primera cuota"
                name="maxFirstDueDays"
                type="number"
                min={1}
                max={90}
                required
                defaultValue={policy?.max_first_due_days ?? 15}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quitas</CardTitle>
              <CardDescription>Porcentaje máximo que el agente puede descontar.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="Intereses en pago único (%)"
                name="singlePaymentInterestWaiverPct"
                {...percent}
                defaultValue={policy?.single_payment_interest_waiver_pct ?? 100}
              />
              <TextField
                label="Intereses en cuotas (%)"
                name="maxInterestWaiverPct"
                {...percent}
                defaultValue={policy?.max_interest_waiver_pct ?? 50}
              />
              <TextField
                label="Capital (%)"
                name="maxPrincipalDiscountPct"
                {...percent}
                defaultValue={policy?.max_principal_discount_pct ?? 0}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ofertas y derivación</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Vigencia de cada oferta (horas)"
                name="offerValidityHours"
                type="number"
                min={1}
                max={720}
                required
                defaultValue={policy?.offer_validity_hours ?? 72}
              />
              <MoneyField
                label="Derivar a una persona desde ($)"
                name="escalateAboveAmount"
                defaultValue={centsToPesosInput(policy?.escalate_above_amount_cents)}
                hint="Deudas mayores a este monto requieren intervención humana. Vacío: sin umbral."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tono de la conversación</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Field label="Tono" htmlFor="tone">
                <NativeSelect id="tone" name="tone" defaultValue={policy?.tone ?? "empatico_formal"}>
                  {Object.entries(toneLabel).map(([value, label]) => (
                    <NativeSelectOption key={value} value={value}>
                      {label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
              <Field
                label="Indicaciones adicionales"
                htmlFor="customInstructions"
                hint="Máximo 500 caracteres. No pueden ampliar los límites de arriba."
              >
                <Textarea
                  id="customInstructions"
                  name="customInstructions"
                  maxLength={500}
                  rows={3}
                  defaultValue={policy?.custom_instructions ?? ""}
                  placeholder="Ej.: recordá que la administración atiende de lunes a viernes de 9 a 17."
                />
              </Field>
            </CardContent>
            <CardFooter className="flex-wrap justify-end gap-3">
              <FormError message={save.error} />
              {saved ? <span className="text-sm text-muted-foreground">Cambios guardados.</span> : null}
              <Button type="submit" disabled={save.pending}>
                {save.pending ? "Guardando…" : "Guardar reglas"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </PageBody>
    </>
  )
}
