import "@tanstack/react-start/server-only"
import { createHash, randomBytes } from "node:crypto"

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex")
}

// Token del link de negociación: 32 bytes aleatorios. En la base solo se guarda
// su hash; el token en claro se muestra una única vez al crearlo.
export function generateNegotiationToken() {
  const token = randomBytes(32).toString("base64url")
  return { token, tokenHash: sha256Hex(token) }
}

// Se guarda sha256("<debtor_id>:<últimos 3 dígitos del DNI>"); nunca el DNI.
export function debtorVerificationHash(debtorId: string, dni: string) {
  return sha256Hex(`${debtorId}:${dni.slice(-3)}`)
}
