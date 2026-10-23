import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type FieldProps = {
  label: string
  htmlFor: string
  hint?: string
  className?: string
  children: React.ReactNode
}

export function Field({ label, htmlFor, hint, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

type TextFieldProps = Omit<React.ComponentProps<typeof Input>, "id"> & {
  label: string
  name: string
  hint?: string
}

export function TextField({ label, name, hint, className, ...props }: TextFieldProps) {
  return (
    <Field label={label} htmlFor={name} hint={hint} className={className}>
      <Input id={name} name={name} {...props} />
    </Field>
  )
}

/** Monto en pesos; el server function lo convierte a centavos. */
export function MoneyField(props: Omit<TextFieldProps, "type" | "inputMode">) {
  return (
    <TextField
      type="text"
      inputMode="decimal"
      pattern="\d{1,12}([.,]\d{1,2})?"
      placeholder="0"
      {...props}
    />
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {message}
    </p>
  )
}
