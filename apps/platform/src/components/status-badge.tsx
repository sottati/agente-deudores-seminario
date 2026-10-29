import { Badge } from "@/components/ui/badge"
import { debtStatusMeta, negotiationStatusMeta } from "@/lib/labels"
import type { DebtStatus, NegotiationStatus } from "@/lib/labels"

export function NegotiationStatusBadge({
  status,
}: {
  status: NegotiationStatus
}) {
  const meta = negotiationStatusMeta[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

export function DebtStatusBadge({ status }: { status: DebtStatus }) {
  const meta = debtStatusMeta[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}
