import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { getNegotiationBounds } from "@agente/negotiation-engine"
import { PlayIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Field, FormError } from "@/components/form-field"
import { PageBody, PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { formatARS } from "@/lib/format"
import { installmentsLabel, toneLabel } from "@/lib/labels"
import {
  sandboxConfigSchema,
  sandboxDebtInput,
  sandboxDebtPresets,
  sandboxPolicy,
  strictSandboxAgent,
} from "@/lib/sandbox"
import type {
  SandboxAgentConfig,
  SandboxConfig,
  SandboxDebtConfig,
  SandboxInfo,
} from "@/lib/sandbox"
import {
  clearSandboxDraft,
  fetchSandboxInfo,
  loadSandboxDraft,
  postSandbox,
  saveSandboxDraft,
} from "@/lib/sandbox-client"

type InputProps = Omit<
  React.ComponentProps<typeof Input>,
  "id" | "value" | "onChange"
> & { hint?: string }

type NumberKey<T> = {
  [K in keyof T]-?: T[K] extends number ? K : never
}[keyof T]

export function SandboxConfigForm({
  organizationName,
  savedAgent,
}: {
  organizationName: string
  /** Reglas guardadas de la organización, o las de ejemplo si no hay. */
  savedAgent: SandboxAgentConfig
}) {
  const navigate = useNavigate()
  const presets = useMemo(
    () => sandboxDebtPresets(organizationName),
    [organizationName]
  )
  const initial = useMemo<SandboxConfig>(
    () => ({ debt: presets[0].debt, agent: savedAgent }),
    [presets, savedAgent]
  )
  const [config, setConfig] = useState<SandboxConfig>(initial)
  const [info, setInfo] = useState<SandboxInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  // El borrador vive en sessionStorage: se lee después de hidratar.
  useEffect(() => {
    const draft = loadSandboxDraft()
    if (draft) setConfig(draft)
    fetchSandboxInfo()
      .then(setInfo)
      .catch((e: Error) => setError(e.message))
  }, [])

  function update(next: SandboxConfig) {
    setConfig(next)
    saveSandboxDraft(next)
  }
  const setDebt = (patch: Partial<SandboxDebtConfig>) =>
    update({ ...config, debt: { ...config.debt, ...patch } })
  const setAgent = (patch: Partial<SandboxAgentConfig>) =>
    update({ ...config, agent: { ...config.agent, ...patch } })

  const parsed = sandboxConfigSchema.safeParse(config)
  // Se destaca el juego de reglas que coincide con el actual; si se editó a
  // mano, ninguno. Si las reglas guardadas son iguales a la política estricta,
  // se destaca solo "Mis reglas".
  const usingSavedAgent = sameAgentRules(config.agent, savedAgent)
  const usingStrictAgent =
    !usingSavedAgent && sameAgentRules(config.agent, strictSandboxAgent)
  // El caso de prueba que coincide con la deuda actual; -1 si se editó a mano.
  const selectedPreset = presets.findIndex((preset) =>
    (Object.keys(preset.debt) as Array<keyof SandboxDebtConfig>).every(
      (key) => preset.debt[key] === config.debt[key]
    )
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success) {
      setError("Revisá los campos marcados: hay valores fuera de rango.")
      return
    }
    setStarting(true)
    setError(null)
    try {
      const session = await postSandbox({
        action: "start",
        config: parsed.data,
      })
      await navigate({
        to: "/sandbox/$sessionId",
        params: { sessionId: session.id },
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar.")
      setStarting(false)
    }
  }

  const debtNumber = (
    key: NumberKey<SandboxDebtConfig>,
    label: string,
    props: InputProps = {}
  ) => (
    <NumberField
      {...props}
      id={`debt-${key}`}
      label={label}
      value={config.debt[key]}
      onChange={(value) => setDebt({ [key]: value })}
    />
  )
  const agentNumber = (
    key: Exclude<NumberKey<SandboxAgentConfig>, "escalateAbove">,
    label: string,
    props: InputProps = {}
  ) => (
    <NumberField
      {...props}
      id={`agent-${key}`}
      label={label}
      value={config.agent[key]}
      onChange={(value) => setAgent({ [key]: value })}
    />
  )
  const percent = { min: 0, max: 100, step: 1 }
  const money = { min: 0, max: 100_000_000, step: "0.01" }

  return (
    <>
      <PageHeader title="Simulador del agente">
        <Badge variant="secondary" className="hidden sm:inline-flex">
          Desarrollo
        </Badge>
        <Button
          type="submit"
          form="sandbox-config"
          disabled={starting || !info?.enabled}
        >
          <HugeiconsIcon icon={PlayIcon} data-icon="inline-start" />
          {starting ? "Iniciando…" : "Iniciar simulación"}
        </Button>
      </PageHeader>
      <PageBody>
        <p className="max-w-3xl text-muted-foreground">
          Configurá una deuda ficticia y las reglas que va a respetar el agente.
          Después negociás vos como deudor. Usa el mismo prompt, herramientas y
          motor de reglas que el portal real, pero no guarda nada en tu cartera.
        </p>

        <form
          id="sandbox-config"
          onSubmit={handleSubmit}
          className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]"
        >
          <fieldset
            className="grid min-w-0 gap-4"
            disabled={starting}
            aria-label="Configuración de la simulación"
          >
            <Card>
              <CardHeader>
                <CardTitle>Deuda simulada</CardTitle>
                <CardDescription>
                  Quién debe, cuánto y por qué. El agente solo conoce estos
                  datos.
                </CardDescription>
                <CardAction>
                  <NativeSelect
                    aria-label="Cargar un caso de prueba"
                    value={selectedPreset === -1 ? "" : selectedPreset}
                    onChange={(e) => {
                      const preset = presets.at(Number(e.target.value))
                      if (preset) setDebt(preset.debt)
                    }}
                  >
                    <NativeSelectOption value="" disabled>
                      Personalizado
                    </NativeSelectOption>
                    {presets.map((preset, i) => (
                      <NativeSelectOption key={preset.name} value={i}>
                        {preset.name}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <TextInput
                  id="debt-organizationName"
                  label="Administración"
                  value={config.debt.organizationName}
                  maxLength={120}
                  onChange={(value) => setDebt({ organizationName: value })}
                />
                <TextInput
                  id="debt-debtorAlias"
                  label="Deudor (unidad o alias)"
                  value={config.debt.debtorAlias}
                  maxLength={80}
                  onChange={(debtorAlias) => setDebt({ debtorAlias })}
                />
                <TextInput
                  id="debt-groupLabel"
                  label="Consorcio o edificio"
                  value={config.debt.groupLabel}
                  maxLength={120}
                  required={false}
                  onChange={(groupLabel) => setDebt({ groupLabel })}
                />
                <TextInput
                  id="debt-concept"
                  label="Concepto"
                  value={config.debt.concept}
                  maxLength={200}
                  onChange={(concept) => setDebt({ concept })}
                />
                {debtNumber("principal", "Capital ($)", {
                  ...money,
                  min: 1,
                })}
                {debtNumber("interest", "Intereses ($)", money)}
                <Field label="Vencimiento original" htmlFor="debt-dueDate">
                  <Input
                    id="debt-dueDate"
                    type="date"
                    required
                    value={config.debt.dueDate}
                    onChange={(e) => setDebt({ dueDate: e.target.value })}
                  />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reglas del agente</CardTitle>
                <CardDescription>
                  Arrancan con las reglas guardadas de tu organización. Los
                  cambios de acá solo aplican a la simulación.
                </CardDescription>
                <CardAction className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={usingSavedAgent ? "default" : "outline"}
                    aria-pressed={usingSavedAgent}
                    onClick={() => setAgent(savedAgent)}
                  >
                    Mis reglas
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={usingStrictAgent ? "default" : "outline"}
                    aria-pressed={usingStrictAgent}
                    onClick={() => setAgent(strictSandboxAgent)}
                  >
                    Política estricta
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="grid gap-6">
                <section className="grid gap-4 sm:grid-cols-2">
                  <h3 className="text-sm font-medium sm:col-span-2">
                    Planes de pago
                  </h3>
                  {agentNumber("maxInstallments", "Máximo de cuotas", {
                    min: 1,
                    max: 24,
                    step: 1,
                  })}
                  {agentNumber("minDownPaymentPct", "Anticipo mínimo (%)", {
                    ...percent,
                    hint: "Sobre el total del plan en cuotas.",
                  })}
                  {agentNumber("minInstallment", "Cuota mínima ($)", money)}
                  {agentNumber(
                    "maxFirstDueDays",
                    "Días máximos hasta la primera cuota",
                    { min: 1, max: 90, step: 1 }
                  )}
                </section>
                <section className="grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-3">
                    <h3 className="text-sm font-medium">Quitas máximas</h3>
                    <p className="text-xs text-muted-foreground">
                      Lo máximo que el agente puede descontar. Definen el piso
                      de la negociación.
                    </p>
                  </div>
                  {agentNumber(
                    "singlePaymentWaiverPct",
                    "Intereses, pago único (%)",
                    percent
                  )}
                  {agentNumber(
                    "maxInterestWaiverPct",
                    "Intereses, en cuotas (%)",
                    percent
                  )}
                  {agentNumber(
                    "maxPrincipalDiscountPct",
                    "Capital (%)",
                    percent
                  )}
                </section>
                <section className="grid gap-4 sm:grid-cols-2">
                  <h3 className="text-sm font-medium sm:col-span-2">
                    Ofertas y derivación
                  </h3>
                  {agentNumber(
                    "offerValidityHours",
                    "Vigencia de cada oferta (horas)",
                    { min: 1, max: 720, step: 1 }
                  )}
                  <NumberField
                    id="agent-escalateAbove"
                    label="Derivar a una persona desde ($)"
                    hint="Vacío o 0: sin umbral por monto."
                    required={false}
                    {...money}
                    value={config.agent.escalateAbove}
                    onChange={(value) =>
                      setAgent({
                        escalateAbove: Number.isNaN(value) ? null : value,
                      })
                    }
                  />
                </section>
                <section className="grid gap-4">
                  <h3 className="text-sm font-medium">Tono</h3>
                  <Field label="Tono de la conversación" htmlFor="agent-tone">
                    <NativeSelect
                      id="agent-tone"
                      value={config.agent.tone}
                      onChange={(e) =>
                        setAgent({
                          tone: e.target.value as SandboxAgentConfig["tone"],
                        })
                      }
                    >
                      {Object.entries(toneLabel).map(([value, label]) => (
                        <NativeSelectOption key={value} value={value}>
                          {label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                  <Field
                    label="Indicaciones adicionales"
                    htmlFor="agent-instructions"
                    hint="Máximo 500 caracteres. No pueden ampliar los límites de arriba."
                  >
                    <Textarea
                      id="agent-instructions"
                      maxLength={500}
                      rows={3}
                      value={config.agent.instructions}
                      onChange={(e) =>
                        setAgent({ instructions: e.target.value })
                      }
                      placeholder="Ej.: recordá que la administración atiende de lunes a viernes de 9 a 17."
                    />
                  </Field>
                </section>
              </CardContent>
            </Card>
          </fieldset>

          <aside className="grid gap-4 xl:sticky xl:top-18">
            <BoundsPreview config={parsed.success ? parsed.data : null} />
            <Card size="sm">
              <CardHeader>
                <CardTitle>Modelo</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <p className="break-all">
                  <span className="font-medium">
                    {info?.model ?? "Consultando…"}
                  </span>
                  {info ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {info.provider}
                    </span>
                  ) : null}
                </p>
                {info && !info.configured ? (
                  <p
                    role="status"
                    className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200"
                  >
                    Falta configurar AI_PROVIDER, AI_MODEL y la API key en
                    apps/platform/.env.local. Sin eso el agente no responde.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Cada turno llama a la API real y consume saldo del
                    proveedor.
                  </p>
                )}
                <FormError message={error} />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearSandboxDraft()
                    setConfig(initial)
                  }}
                >
                  Restablecer formulario
                </Button>
              </CardContent>
            </Card>
          </aside>
        </form>
      </PageBody>
    </>
  )
}

// Vista previa de lo que el motor de reglas le va a permitir ofrecer al agente.
function sameAgentRules(a: SandboxAgentConfig, b: SandboxAgentConfig) {
  return (Object.keys(b) as Array<keyof SandboxAgentConfig>).every(
    (key) => a[key] === b[key]
  )
}

function BoundsPreview({ config }: { config: SandboxConfig | null }) {
  if (!config)
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>Margen de negociación</CardTitle>
          <CardDescription>
            Completá los campos con valores válidos para ver el margen.
          </CardDescription>
        </CardHeader>
      </Card>
    )

  const bounds = getNegotiationBounds(
    sandboxDebtInput(config.debt),
    sandboxPolicy(config.agent)
  )
  const floor = bounds.plans.reduce<number | null>(
    (min, plan) =>
      min === null ? plan.totalCents : Math.min(min, plan.totalCents),
    null
  )

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Margen de negociación</CardTitle>
        <CardDescription>
          Calculado por el motor de reglas. El agente no puede salirse de acá.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <dl className="grid gap-1.5">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Deuda original</dt>
            <dd className="font-medium tabular-nums">
              {formatARS(bounds.originalTotalCents)}
            </dd>
          </div>
          {floor !== null && (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Mínimo que puede cobrar</dt>
              <dd className="font-medium tabular-nums">{formatARS(floor)}</dd>
            </div>
          )}
        </dl>
        {bounds.requiresHumanEscalation ? (
          <p
            role="status"
            className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive"
          >
            La deuda supera el umbral de derivación: el agente no va a ofrecer
            planes y va a derivar la conversación a una persona.
          </p>
        ) : bounds.plans.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Con estas reglas no hay planes posibles. Bajá la cuota mínima o el
            anticipo.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border text-xs">
            {bounds.plans.map((plan) => (
              <li key={plan.installments} className="grid gap-0.5 px-3 py-2">
                <div className="flex justify-between gap-3 font-medium">
                  <span>{installmentsLabel(plan.installments)}</span>
                  <span className="tabular-nums">
                    {formatARS(plan.totalCents)}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {plan.installments === 1
                    ? plan.waivedInterestCents > 0
                      ? `Quita de ${formatARS(plan.waivedInterestCents)}`
                      : "Sin quita"
                    : `Anticipo desde ${formatARS(plan.minDownPaymentCents)} · cuotas de ${formatARS(plan.regularInstallmentCents)}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function TextInput({
  id,
  label,
  value,
  onChange,
  required = true,
  maxLength,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  maxLength?: number
}) {
  return (
    <Field label={label} htmlFor={id}>
      <Input
        id={id}
        required={required}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  required = true,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  id: string
  label: string
  hint?: string
  value: number | null
  onChange: (value: number) => void
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        required={required}
        value={value == null || Number.isNaN(value) ? "" : value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        {...props}
      />
    </Field>
  )
}
