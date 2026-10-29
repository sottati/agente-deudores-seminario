// Formato fijo en zona horaria de Argentina para que el render del servidor y
// el del navegador coincidan (evita diferencias de hidratación).
const TIME_ZONE = "America/Argentina/Buenos_Aires"

const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const dateFormat = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeZone: TIME_ZONE,
})

const dateTimeFormat = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
})

const relativeFormat = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" })

export function formatARS(cents: number) {
  return currency.format(cents / 100)
}

/** Centavos → valor para un <input> de pesos ("186400" o "186400.5"). */
export function centsToPesosInput(cents: number | null | undefined) {
  if (cents == null) return ""
  return String(cents / 100)
}

/** Acepta fechas "YYYY-MM-DD" (sin desfase de zona horaria) o timestamps ISO. */
export function formatDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (dateOnly) {
    const [, year, month, day] = dateOnly
    return dateFormat.format(Date.UTC(+year, +month - 1, +day, 12))
  }
  return dateFormat.format(new Date(value))
}

export function formatDateTime(value: string) {
  return dateTimeFormat.format(new Date(value))
}

export function formatRelative(value: string, now = Date.now()) {
  const diffSeconds = Math.round((new Date(value).getTime() - now) / 1000)
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ]
  for (const [unit, seconds] of units) {
    if (Math.abs(diffSeconds) >= seconds) {
      return relativeFormat.format(Math.round(diffSeconds / seconds), unit)
    }
  }
  return "recién"
}

/** Fecha de hoy en Argentina como "YYYY-MM-DD" (para <input type="date">). */
export function todayIsoDate() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(
    new Date()
  )
}
