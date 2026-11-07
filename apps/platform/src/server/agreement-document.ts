import { formatARS, formatDate, formatDateTime } from "@/lib/format"
import { installmentsLabel } from "@/lib/labels"
import type {
  PolicySnapshotRow,
  ScheduleItem,
} from "@agente/negotiation-engine"

export const AGREEMENT_TEMPLATE_VERSION = "1.0.0"

export interface AgreementDocumentData {
  organization: {
    name: string
    displayNameForDebtors: string
  }
  debtor: {
    fullName: string
    alias: string
    groupLabel: string | null
  }
  debt: {
    concept: string
    dueDate: string
    principalCents: number
    interestCents: number
  }
  offer: {
    id: string
    installments: number
    downPaymentCents: number
    waivedInterestCents: number
    totalCents: number
    schedule: ScheduleItem[]
    engineVersion: string
  }
  evidence: {
    acceptedAt: string
    acceptanceIp: string | null
    userAgent: string | null
    transcriptSha256: string
    templateVersion?: string
  }
  policySnapshot: PolicySnapshotRow
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function renderAgreementDocumentHtml(
  data: AgreementDocumentData
): string {
  const { organization, debtor, debt, offer, evidence, policySnapshot } = data
  const templateVersion = evidence.templateVersion ?? AGREEMENT_TEMPLATE_VERSION
  const originalCents = debt.principalCents + debt.interestCents

  const scheduleRows = offer.schedule
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(String(item.number))}</td>
          <td>${escapeHtml(formatDate(item.due_date))}</td>
          <td class="num">${escapeHtml(formatARS(item.amount_cents))}</td>
        </tr>`
    )
    .join("")

  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Acta de acuerdo de pago · ${escapeHtml(organization.displayNameForDebtors)}</title>
  <style>
    :root {
      color-scheme: light;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #09090b;
      background-color: #f4f4f5;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 2rem 1rem;
      line-height: 1.5;
    }
    article {
      max-width: 48rem;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 0.75rem;
      padding: 2rem;
    }
    header {
      border-bottom: 1px solid #e4e4e7;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
    }
    .eyebrow {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #71717a;
      margin: 0 0 0.25rem;
    }
    h1 {
      font-size: 1.375rem;
      margin: 0 0 0.25rem;
    }
    h2 {
      font-size: 1rem;
      margin: 0 0 0.5rem;
    }
    .muted {
      color: #71717a;
      font-size: 0.875rem;
      margin: 0;
    }
    section {
      margin-bottom: 1.5rem;
    }
    .parties {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 1rem;
    }
    .amounts {
      max-width: 24rem;
      margin-top: 0.5rem;
    }
    .amount-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.2rem 0;
      font-size: 0.9375rem;
    }
    .amount-row.strong {
      font-weight: 600;
      border-top: 1px solid #e4e4e7;
      margin-top: 0.25rem;
      padding-top: 0.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9375rem;
      margin-top: 0.5rem;
    }
    th, td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid #e4e4e7;
      text-align: left;
    }
    th {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #71717a;
    }
    .num {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .evidence {
      border-top: 1px solid #e4e4e7;
      padding-top: 1rem;
      font-size: 0.8125rem;
      color: #52525b;
    }
    .evidence dl {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.35rem 1rem;
      margin: 0.75rem 0 0;
      word-break: break-all;
    }
    .evidence dt {
      color: #71717a;
      font-weight: 500;
    }
    .evidence dd {
      margin: 0;
    }
    .mono {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .print-btn {
      appearance: none;
      border: 1px solid #18181b;
      background: #18181b;
      color: #fafafa;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      cursor: pointer;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      article { border: 0; padding: 0; max-width: none; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <article>
    <div class="actions no-print">
      <button type="button" class="print-btn" onclick="window.print()">Imprimir / Guardar como PDF</button>
    </div>
    <header>
      <p class="eyebrow">Acta de acuerdo de pago · ${escapeHtml(organization.displayNameForDebtors)}</p>
      <h1>${escapeHtml(installmentsLabel(offer.installments))} por ${escapeHtml(formatARS(offer.totalCents))}</h1>
      <p class="muted">Aceptado el ${escapeHtml(formatDateTime(evidence.acceptedAt))}</p>
    </header>

    <section class="parties">
      <div>
        <h2>Acreedor</h2>
        <p style="margin:0">${escapeHtml(organization.name)}</p>
        <p class="muted">${escapeHtml(organization.displayNameForDebtors)}</p>
      </div>
      <div>
        <h2>Deudor</h2>
        <p style="margin:0">${escapeHtml(debtor.fullName)}</p>
        <p class="muted">${escapeHtml(debtor.alias)}${debtor.groupLabel ? ` · ${escapeHtml(debtor.groupLabel)}` : ""}</p>
      </div>
    </section>

    <section>
      <h2>Deuda regularizada</h2>
      <p style="margin:0 0 0.5rem">${escapeHtml(debt.concept)} (vencida el ${escapeHtml(formatDate(debt.dueDate))})</p>
      <div class="amounts">
        <div class="amount-row">
          <span class="muted">Capital</span>
          <span class="num">${escapeHtml(formatARS(debt.principalCents))}</span>
        </div>
        <div class="amount-row">
          <span class="muted">Intereses</span>
          <span class="num">${escapeHtml(formatARS(debt.interestCents))}</span>
        </div>
        <div class="amount-row">
          <span class="muted">Deuda original</span>
          <span class="num">${escapeHtml(formatARS(originalCents))}</span>
        </div>
        <div class="amount-row">
          <span class="muted">Quita de intereses</span>
          <span class="num">${escapeHtml(formatARS(-offer.waivedInterestCents))}</span>
        </div>
        <div class="amount-row strong">
          <span>Total acordado</span>
          <span class="num">${escapeHtml(formatARS(offer.totalCents))}</span>
        </div>
      </div>
    </section>

    <section>
      <h2>Cronograma de pagos</h2>
      <table>
        <thead>
          <tr>
            <th>Cuota</th>
            <th>Vencimiento</th>
            <th class="num">Importe</th>
          </tr>
        </thead>
        <tbody>
          ${scheduleRows}
        </tbody>
      </table>
    </section>

    <section class="evidence">
      <h2 style="color:#09090b;font-size:0.875rem">Evidencia de aceptación y parámetros de política</h2>
      <p style="margin:0">
        El deudor aceptó expresamente los términos mediante el botón "Acepto los términos del plan de pago" en el canal de negociación automatizada de pacta.ia.
      </p>
      <dl>
        <dt>Fecha y hora</dt>
        <dd>${escapeHtml(formatDateTime(evidence.acceptedAt))}</dd>
        <dt>Dirección IP</dt>
        <dd>${escapeHtml(evidence.acceptanceIp ?? "—")}</dd>
        <dt>Navegador (User-Agent)</dt>
        <dd>${escapeHtml(evidence.userAgent ?? "—")}</dd>
        <dt>Hash SHA-256 de la conversación</dt>
        <dd class="mono">${escapeHtml(evidence.transcriptSha256)}</dd>
        <dt>Versión de plantilla / motor</dt>
        <dd>${escapeHtml(templateVersion)} / ${escapeHtml(offer.engineVersion)}</dd>
        <dt>Política aplicada (snapshot)</dt>
        <dd class="mono">hasta ${escapeHtml(String(policySnapshot.max_installments))} cuotas · anticipo mín. ${escapeHtml(String(policySnapshot.min_down_payment_pct))}% · quita pago único ${escapeHtml(String(policySnapshot.single_payment_interest_waiver_pct))}% · quita en cuotas ${escapeHtml(String(policySnapshot.max_interest_waiver_pct))}%</dd>
      </dl>
    </section>
  </article>
</body>
</html>`
}
