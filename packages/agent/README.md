# @agente/agent

Agente conversacional de pacta.ia (system prompt, tools y orquestación con el Vercel AI SDK). Reemplaza a `apps/agent`: es una librería que consume `apps/platform` y que en R2 podrá montarse detrás de un webhook de WhatsApp sin reescribirse.

- **No accede a la base de datos:** recibe el modelo y las funciones de persistencia por parámetro. Así se testea con `MockLanguageModel` y sin Supabase.
- **Nunca calcula montos:** todas las cifras salen de `@agente/negotiation-engine` vía tools.

Ver [PLAN_BACKEND.md §3](../../docs/PLAN_BACKEND.md).

## Prueba de humo del LLM

1. Copiá `apps/platform/.env.example` a `apps/platform/.env.local` y completá `AI_GATEWAY_API_KEY` y `AI_MODEL`.
2. Desde la raíz del repo:

```bash
pnpm smoke:llm
```

Debe imprimir `ok` y el uso de tokens.
