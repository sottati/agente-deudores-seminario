import { createFileRoute } from "@tanstack/react-router"
import { handleDebtorChat } from "@/server/debtor-chat-handler"

export const Route = createFileRoute("/api/n/$token/chat")({
  server: { handlers: { POST: handleDebtorChat } },
})
