import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { ButtonLink } from "@/components/button-link"
import { Field, FormError } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { errorMessage, formValues, useAction } from "@/hooks/use-action"
import { formatARS } from "@/lib/format"
import { createNegotiation, listNegotiableDebts } from "@/server/negotiations"

type NegotiableDebt = Awaited<ReturnType<typeof listNegotiableDebts>>[number]

type NewNegotiationDialogProps = {
  trigger: React.ReactElement
  /** Deuda preseleccionada (desde la ficha del deudor). */
  debt?: { id: string; label: string }
}

export function NewNegotiationDialog({
  trigger,
  debt,
}: NewNegotiationDialogProps) {
  const [open, setOpen] = useState(false)
  const [created, setCreated] = useState<{
    negotiationId: string
    link: string
  } | null>(null)

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) setCreated(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        {created ? (
          <CreatedLink {...created} onClose={() => handleOpenChange(false)} />
        ) : (
          <NegotiationForm debt={debt} open={open} onCreated={setCreated} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function NegotiationForm({
  debt,
  open,
  onCreated,
}: {
  debt?: { id: string; label: string }
  open: boolean
  onCreated: (result: { negotiationId: string; link: string }) => void
}) {
  const create = useAction(useServerFn(createNegotiation))
  const listDebts = useServerFn(listNegotiableDebts)
  const [debts, setDebts] = useState<NegotiableDebt[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (debt || !open) return
    listDebts()
      .then(setDebts)
      .catch((error: unknown) => setLoadError(errorMessage(error)))
  }, [debt, open, listDebts])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = formValues(event.currentTarget)
    const result = await create.run({
      data: {
        debtId: values.debtId,
        expiresInDays: Number(values.expiresInDays),
      },
    })
    if (result.ok) {
      onCreated({
        negotiationId: result.data.negotiationId,
        link: `${window.location.origin}/n/${result.data.token}`,
      })
    }
  }

  const noDebts = !debt && debts?.length === 0

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Nueva negociación</DialogTitle>
        <DialogDescription>
          Se genera un link único para que el deudor negocie con el agente. Las
          reglas vigentes quedan fijadas para esta negociación.
        </DialogDescription>
      </DialogHeader>

      {debt ? (
        <>
          <input type="hidden" name="debtId" value={debt.id} />
          <p className="rounded-lg bg-muted/60 px-3 py-2">{debt.label}</p>
        </>
      ) : (
        <Field label="Deuda" htmlFor="debtId">
          <NativeSelect
            id="debtId"
            name="debtId"
            required
            className="w-full"
            disabled={!debts?.length}
          >
            {debts === null ? (
              <NativeSelectOption value="">Cargando deudas…</NativeSelectOption>
            ) : (
              debts.map((item) => (
                <NativeSelectOption key={item.id} value={item.id}>
                  {item.debtors.alias} · {item.concept} ·{" "}
                  {formatARS(item.principal_cents + item.interest_cents)}
                </NativeSelectOption>
              ))
            )}
          </NativeSelect>
        </Field>
      )}

      {noDebts ? (
        <p className="text-muted-foreground">
          No hay deudas impagas sin negociación. Cargá una desde{" "}
          <Link
            to="/deudores"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Deudores
          </Link>
          .
        </p>
      ) : null}

      <Field label="Vigencia del link" htmlFor="expiresInDays">
        <NativeSelect
          id="expiresInDays"
          name="expiresInDays"
          defaultValue="7"
          className="w-full"
        >
          <NativeSelectOption value="3">3 días</NativeSelectOption>
          <NativeSelectOption value="7">7 días</NativeSelectOption>
          <NativeSelectOption value="14">14 días</NativeSelectOption>
          <NativeSelectOption value="30">30 días</NativeSelectOption>
        </NativeSelect>
      </Field>

      <FormError message={loadError ?? create.error} />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancelar
        </DialogClose>
        <Button
          type="submit"
          disabled={create.pending || noDebts || (!debt && !debts)}
        >
          {create.pending ? "Generando…" : "Generar link"}
        </Button>
      </DialogFooter>
    </form>
  )
}

function CreatedLink({
  negotiationId,
  link,
  onClose,
}: {
  negotiationId: string
  link: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(link)
    setCopied(true)
  }

  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Link de negociación generado</DialogTitle>
        <DialogDescription>
          Copialo ahora y envialo al deudor. Por seguridad no se guarda en claro
          y no se vuelve a mostrar.
        </DialogDescription>
      </DialogHeader>
      <div className="flex gap-2">
        <Input
          readOnly
          value={link}
          aria-label="Link de negociación"
          onFocus={(event) => event.currentTarget.select()}
        />
        <Button
          type="button"
          variant="outline"
          onClick={copy}
          aria-label="Copiar link"
        >
          <HugeiconsIcon
            icon={copied ? Tick02Icon : Copy01Icon}
            strokeWidth={2}
          />
        </Button>
      </div>
      <DialogFooter>
        <ButtonLink
          variant="outline"
          onClick={onClose}
          to="/conversaciones/$negotiationId"
          params={{ negotiationId }}
        >
          Ver conversación
        </ButtonLink>
        <Button type="button" onClick={onClose}>
          Listo
        </Button>
      </DialogFooter>
    </div>
  )
}
