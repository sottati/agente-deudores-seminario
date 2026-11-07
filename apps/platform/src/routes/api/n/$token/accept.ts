import { createFileRoute } from "@tanstack/react-router"
import {
  handleDebtorAcceptGet,
  handleDebtorAcceptPost,
} from "@/server/debtor-accept-handler"

export const Route = createFileRoute("/api/n/$token/accept")({
  server: {
    handlers: {
      GET: handleDebtorAcceptGet,
      POST: handleDebtorAcceptPost,
    },
  },
})
