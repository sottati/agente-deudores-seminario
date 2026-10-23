import { Badge } from "@/components/ui/badge"
import {
  debtStatusMeta,
  negotiationStatusMeta,
  type DebtStatus,
  type NegotiationStatus,
} from "@/lib/labels"

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
