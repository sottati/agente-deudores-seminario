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

const shortMonthFormat = new Intl.DateTimeFormat("es-AR", {
  month: "short",
  timeZone: "UTC",
})

const relativeFormat = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" })

export function formatARS(cents: number) {
  return currency.format(cents / 100)
}

/** Formato compacto para tarjetas y ejes ("$ 8,4 M", "$ 186.400"). */
export function formatCompactARS(cents: number) {
  const pesos = cents / 100
  if (Math.abs(pesos) >= 1_000_000) {
    const millions = pesos / 1_000_000
    return `$ ${millions.toLocaleString("es-AR", { maximumFractionDigits: 1 })} M`
  }
  return formatARS(cents)
}

/** "2026-09-01" o "2026-09" → "Sep". */
export function formatShortMonth(value: string) {
  const match = /^(\d{4})-(\d{2})/.exec(value)
  if (!match) return value
  const [, year, month] = match
  const raw = shortMonthFormat
    .format(Date.UTC(+year, +month - 1, 15))
    .replace(/\.$/, "")
  return raw.charAt(0).toUpperCase() + raw.slice(1)
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
