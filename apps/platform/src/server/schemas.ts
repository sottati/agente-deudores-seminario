import { z } from "zod"

// Schemas de entrada de los server functions. Reciben los valores tal como
// llegan de un <form> (strings) y los normalizan: textos vacíos → null,
// montos en pesos → centavos enteros.

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null))

const requiredText = (max: number, label: string) =>
  z.string().trim().min(1, `${label} es obligatorio`).max(max)

/** "186400", "186400.5" o "186400,50" → 18640050 centavos. */
export const pesosSchema = z
  .string()
  .trim()
  .regex(/^\d{1,12}([.,]\d{1,2})?$/, "Monto inválido")
  .transform((value) => Math.round(Number(value.replace(",", ".")) * 100))

const optionalPesosSchema = z
  .string()
  .trim()
  .optional()
  .transform((value, ctx) => {
    if (!value) return null
    const parsed = pesosSchema.safeParse(value)
    if (!parsed.success) {
      ctx.addIssue({ code: "custom", message: "Monto inválido" })
      return z.NEVER
    }
    return parsed.data
  })

const isoDateSchema = z.iso.date("Fecha inválida")

const dniSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value.replace(/\D/g, "") : null))
  .refine((value) => value === null || /^\d{7,9}$/.test(value), "DNI inválido")

export const debtInputSchema = z.object({
  concept: requiredText(200, "El concepto"),
  principal: pesosSchema,
  interest: optionalPesosSchema.transform((value) => value ?? 0),
  dueDate: isoDateSchema,
})

export const createDebtorSchema = z.object({
  fullName: requiredText(120, "El nombre"),
  alias: requiredText(60, "El identificador"),
  groupLabel: optionalText(120),
  email: z
    .union([z.literal(""), z.email("Email inválido")])
    .optional()
    .transform((value) => (value ? value : null)),
  phone: optionalText(40),
  dni: dniSchema,
  debt: debtInputSchema.optional(),
})

export const updateDebtorSchema = createDebtorSchema
  .omit({ debt: true })
  .extend({ id: z.uuid() })

export const createDebtSchema = debtInputSchema.extend({ debtorId: z.uuid() })

export const updateDebtStatusSchema = z.object({
  id: z.uuid(),
  status: z.enum(["open", "paid", "written_off"]),
})

export const policySchema = z.object({
  maxInstallments: z.coerce.number().int().min(1).max(24),
  minDownPaymentPct: z.coerce.number().int().min(0).max(100),
  minInstallmentAmount: pesosSchema,
  maxInterestWaiverPct: z.coerce.number().int().min(0).max(100),
  singlePaymentInterestWaiverPct: z.coerce.number().int().min(0).max(100),
  maxPrincipalDiscountPct: z.coerce.number().int().min(0).max(100),
  maxFirstDueDays: z.coerce.number().int().min(1).max(90),
  offerValidityHours: z.coerce.number().int().min(1).max(720),
  escalateAboveAmount: optionalPesosSchema,
  tone: z.enum(["empatico_formal", "empatico_cercano", "neutral"]),
  customInstructions: optionalText(500),
})

export const organizationSchema = z.object({
  name: requiredText(120, "El nombre"),
  displayNameForDebtors: requiredText(120, "El nombre visible"),
  kind: z.enum(["consorcio", "colegio"]),
})

export const createNegotiationSchema = z.object({
  debtId: z.uuid(),
  expiresInDays: z.coerce.number().int().min(1).max(30).default(7),
})

export const negotiationIdSchema = z.object({ id: z.uuid() })

export const adminMessageSchema = z.object({
  negotiationId: z.uuid(),
  text: z.string().trim().min(1, "Escribí un mensaje").max(2000),
})

export const installmentPaidSchema = z.object({
  id: z.uuid(),
  paid: z.boolean(),
})

export const signInSchema = z.object({
  email: z.email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
})
