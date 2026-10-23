import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

import { Field, FormError, TextField } from "@/components/form-field"
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
import { formValues, useAction } from "@/hooks/use-action"
import { organizationKindLabel, type OrganizationKind } from "@/lib/labels"
import { getOrganization, updateOrganization } from "@/server/settings"

export const Route = createFileRoute("/_authed/configuracion")({
  loader: () => getOrganization(),
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Configuración | pacta.ia" }] }),
})

function SettingsPage() {
  const organization = Route.useLoaderData()
  const save = useAction(useServerFn(updateOrganization))
  const [saved, setSaved] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)
    const values = formValues(event.currentTarget)
    const result = await save.run({
      data: {
        name: values.name,
        displayNameForDebtors: values.displayNameForDebtors,
        kind: values.kind as OrganizationKind,
      },
    })
    if (result.ok) setSaved(true)
  }

  return (
    <>
      <PageHeader title="Configuración" />
      <PageBody>
        {/* key: remonta el form con los valores guardados (inputs no controlados). */}
        <form
          key={organization.updated_at}
          method="post"
          onSubmit={handleSubmit}
          onChange={() => setSaved(false)}
          className="max-w-2xl"
        >
          <Card>
            <CardHeader>
              <CardTitle>Organización</CardTitle>
              <CardDescription>
                El nombre visible es el que usa el agente al presentarse ante el deudor.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <TextField label="Nombre" name="name" required defaultValue={organization.name} />
              <TextField
                label="Nombre visible para los deudores"
                name="displayNameForDebtors"
                required
                defaultValue={organization.display_name_for_debtors}
                hint={`"Hola, soy el asistente virtual de pacta.ia en representación de …"`}
              />
              <Field label="Tipo de organización" htmlFor="kind">
                <NativeSelect id="kind" name="kind" defaultValue={organization.kind}>
                  {Object.entries(organizationKindLabel).map(([value, label]) => (
                    <NativeSelectOption key={value} value={value}>
                      {label}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </Field>
            </CardContent>
            <CardFooter className="flex-wrap justify-end gap-3">
              <FormError message={save.error} />
              {saved ? <span className="text-sm text-muted-foreground">Cambios guardados.</span> : null}
              <Button type="submit" disabled={save.pending}>
                {save.pending ? "Guardando…" : "Guardar"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </PageBody>
    </>
  )
}
