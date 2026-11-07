import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import { FormError, MoneyField, TextField } from "@/components/form-field"
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
import { Separator } from "@/components/ui/separator"
import { formValues, useAction } from "@/hooks/use-action"
import { todayIsoDate } from "@/lib/format"
import { createDebt, createDebtor, updateDebtor } from "@/server/debtors"

type DebtorValues = {
  id: string
  full_name: string
  alias: string
  group_label: string | null
  email: string | null
  phone: string | null
  hasVerification: boolean
}

function DebtorFields({ debtor }: { debtor?: DebtorValues }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField
        label="Nombre y apellido"
        name="fullName"
        required
        defaultValue={debtor?.full_name}
      />
      <TextField
        label="Identificador"
        name="alias"
        required
        placeholder="Unidad 4B"
        defaultValue={debtor?.alias}
        hint="Es lo que ve el agente en lugar del nombre."
      />
      <TextField
        label="Edificio / curso"
        name="groupLabel"
        defaultValue={debtor?.group_label ?? ""}
      />
      <TextField
        label="DNI"
        name="dni"
        inputMode="numeric"
        hint={
          debtor?.hasVerification
            ? "Dejalo vacío para mantener la verificación actual."
            : "Solo se guardan los últimos 3 dígitos, hasheados."
        }
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        defaultValue={debtor?.email ?? ""}
      />
      <TextField
        label="Teléfono"
        name="phone"
        type="tel"
        defaultValue={debtor?.phone ?? ""}
      />
    </div>
  )
}

function DebtFields({ required }: { required: boolean }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField
        label="Concepto"
        name="concept"
        required={required}
        placeholder="Expensas ordinarias jul–sep"
        className="sm:col-span-2"
      />
      <MoneyField
        label="Capital adeudado ($)"
        name="principal"
        required={required}
      />
      <MoneyField label="Intereses acumulados ($)" name="interest" />
      <TextField
        label="Vencimiento"
        name="dueDate"
        type="date"
        required={required}
        max={todayIsoDate()}
      />
    </div>
  )
}

export function CreateDebtorDialog({
  trigger,
}: {
  trigger: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const create = useAction(useServerFn(createDebtor))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const { concept, principal, interest, dueDate, ...debtor } = formValues(
      event.currentTarget
    )
    const hasDebt = Boolean(concept || principal || dueDate)
    const result = await create.run({
      data: {
        ...debtor,
        fullName: debtor.fullName,
        alias: debtor.alias,
        debt: hasDebt ? { concept, principal, interest, dueDate } : undefined,
      },
    })
    if (result.ok) {
      setOpen(false)
      await navigate({
        to: "/deudores/$debtorId",
        params: { debtorId: result.data.id },
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Nuevo deudor</DialogTitle>
            <DialogDescription>
              Podés cargar su primera deuda ahora o más tarde desde su ficha.
            </DialogDescription>
          </DialogHeader>
          <DebtorFields />
          <Separator />
          <p className="font-medium">Deuda (opcional)</p>
          <DebtFields required={false} />
          <FormError message={create.error} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={create.pending}>
              {create.pending ? "Guardando…" : "Crear deudor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditDebtorDialog({
  debtor,
  trigger,
}: {
  debtor: DebtorValues
  trigger: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const update = useAction(useServerFn(updateDebtor))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = formValues(event.currentTarget)
    const result = await update.run({
      data: {
        ...values,
        id: debtor.id,
        fullName: values.fullName,
        alias: values.alias,
      },
    })
    if (result.ok) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
        {/* key: remonta el form si cambian los datos guardados (inputs no controlados). */}
        <form
          key={Object.values(debtor).join("|")}
          onSubmit={handleSubmit}
          className="grid gap-4"
        >
          <DialogHeader>
            <DialogTitle>Editar deudor</DialogTitle>
          </DialogHeader>
          <DebtorFields debtor={debtor} />
          <FormError message={update.error} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={update.pending}>
              {update.pending ? "Guardando…" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CreateDebtDialog({
  debtorId,
  trigger,
}: {
  debtorId: string
  trigger: React.ReactElement
}) {
  const [open, setOpen] = useState(false)
  const create = useAction(useServerFn(createDebt))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = formValues(event.currentTarget)
    const result = await create.run({
      data: {
        debtorId,
        concept: values.concept,
        principal: values.principal,
        interest: values.interest,
        dueDate: values.dueDate,
      },
    })
    if (result.ok) setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Agregar deuda</DialogTitle>
          </DialogHeader>
          <DebtFields required />
          <FormError message={create.error} />
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button type="submit" disabled={create.pending}>
              {create.pending ? "Guardando…" : "Agregar deuda"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
