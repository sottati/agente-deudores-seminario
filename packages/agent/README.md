# @agente/agent

Agente conversacional de pacta.ia (system prompt, tools y orquestación con el Vercel AI SDK). Reemplaza a `apps/agent`: es una librería que consume `apps/platform` y que en R2 podrá montarse detrás de un webhook de WhatsApp sin reescribirse.

- **No accede a la base de datos:** recibe el modelo y las funciones de persistencia (`saveOffer`, `escalate`, `logEvent`) por parámetro. Así se testea con `MockLanguageModelV4` (`ai/test`) y sin Supabase.
- **Nunca calcula montos (D7):** todas las cifras salen de `@agente/negotiation-engine` vía tools.
- **Minimización de PII:** `get_debt_summary` devuelve únicamente el `alias` de la unidad y `groupLabel`, nunca DNI ni nombre completo.

Ver [PLAN_BACKEND.md §3](../../docs/PLAN_BACKEND.md).

## API exportada (`src/index.ts`)

- **System prompt y helpers de conversación:**
  - `SYSTEM_PROMPT_VERSION`, `MAX_STEPS_PER_TURN`
  - `buildSystemPrompt(negotiation)` — arma el system prompt versionado respetando el tono (`empathetic`, `neutral`, `firm`), las instrucciones adicionales de la administración y las reglas duras de trato digno, confidencialidad y prohibición de cálculo manual.
  - `buildBotDisclosureMessage(organizationDisplayName)` — mensaje determinístico inicial de aviso de asistente automatizado y privacidad.
  - `isHumanHandoffKeyword(text)` — detector de frases de pedido de atención humana previas al LLM.
  - `normalizeNegotiationMessages(history, lastMessage?)` — normaliza mensajes almacenados en DB (`debtor | agent | admin | system` con `parts`), `UIMessage`, `ModelMessage` o strings a `ModelMessage[]`.
- **Tools (`createNegotiationTools({ negotiation, persistence, now? })`):**
  - `get_debt_summary`: capital, intereses, total, fecha de vencimiento, concepto y alias de la unidad (sin PII).
  - `get_negotiation_options`: límites y todos los planes permitidos por la política (`getNegotiationBounds`).
  - `simulate_plan`: simula un plan con `evaluateRequest`; si cae fuera de política, registra `out_of_policy_request` y devuelve `closestValidOffer`.
  - `propose_offer`: re-evalúa con `evaluateRequest`, persiste la oferta válida con `persistence.saveOffer` y registra `offer_proposed` (nunca persiste una oferta fuera de política).
  - `escalate_to_human`: deriva la conversación a la administración (`persistence.escalate`) y registra `escalated`.
- **Orquestación (`runNegotiationTurn`):**
  - `runNegotiationTurn({ negotiation, lastMessage?, history, model, persistence, now?, maxSteps?, onFinish? })` sobre `streamText` con `stopWhen: [stepCountIs(maxSteps), hasToolCall("escalate_to_human")]`.

## Tests

```bash
pnpm --filter @agente/agent test
```

## Prueba de humo del LLM

1. Copiá `apps/platform/.env.example` a `apps/platform/.env.local` y completá `AI_GATEWAY_API_KEY` y `AI_MODEL`.
2. Desde la raíz del repo:

```bash
pnpm smoke:llm
```

Debe imprimir `ok` y el uso de tokens.
