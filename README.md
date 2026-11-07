# pacta.ai - Asistente Autónomo de Cobranzas B2B

> Proyecto de Seminario de Integración Profesional (TIF / SIP) - UADE

## Datos del Equipo

- **Nombre del Grupo:** pacta.ai
- **Nombre de Fantasía (MVP):** pacta.ai
- **Integrantes:**
  - Juan Cruz Elliff - Legajo: 1140086
  - Santiago Garbini - Legajo: 1188868
  - Tomas Maximo Hokama - Legajo: 1195217
  - Maximiliano Ivan Huertas - Legajo: 1072417
  - Simon Ottati - Legajo: 1155931

## Organización y Seguimiento

- **Tablero Kanban:** [Linear Kanban Board](https://linear.app/santiago-garbini/project/seminario-de-gestion-de-tecnologia-3bd4add3a15a/view/kanban-5f46e4e8019c)
- **Documentación Principal:** [DOCUMENTACION.md](./docs/DOCUMENTACION.md)
- **Plan del Backend:** [PLAN_BACKEND.md](./docs/PLAN_BACKEND.md)
- **Análisis de Stakeholders:** [Stakeholders.md](./docs/Stakeholders.md)
- **Marco Legal:** [MARCO_LEGAL.md](./docs/MARCO_LEGAL.md)
- **Identidad Visual:** [identidad_visual.md](./docs/identidad_visual.md)
- **Entrevistas y Trabajo de Campo:** [ENTREVISTAS.md](./docs/ENTREVISTAS.md)
- **Uso de IA:** [USO_IA.md](./docs/USO_IA.md)
- **Documentación completa en Google Docs:** [pacta.ai — Documentación del proyecto](https://docs.google.com/document/d/1h325o7If-BrOCULb2lgOeMStN_tv_Rl_j3p4bNaM8c8/edit) (mismo contenido que los `.md`, se mantienen sincronizados)

## Estructura del Repositorio (Monorepo)

Este proyecto utiliza un esquema de monorepo gestionado con `pnpm`:

- `/apps/platform`: Aplicación web (landing, panel del administrador, chat del deudor) y backend (TanStack Start).
- `/packages/agent`: Agente conversacional IA (Vercel AI SDK).
- `/packages/negotiation-engine`: Motor de reglas de negociación determinístico.
- `/supabase`: Configuración, migraciones y seed de la base de datos.

## Desarrollo Local

Requisitos: Node 22+, pnpm 12 y Docker Desktop (para Supabase local).

```bash
pnpm install
cp apps/platform/.env.example apps/platform/.env.local   # completar valores
pnpm db:start        # levanta Supabase local e imprime las keys
pnpm dev             # http://localhost:3000
```

El chat admite `AI_PROVIDER=gateway` con `AI_GATEWAY_API_KEY`, o `AI_PROVIDER=openrouter` con `OPENROUTER_API_KEY`. En ambos casos configurá `AI_MODEL` con un modelo que soporte herramientas y streaming. Ver [la prueba de integración del agente](./packages/agent/README.md#prueba-de-humo-del-llm).

### Sandbox de conversaciones manuales

Con `pnpm dev`, abrí `/sandbox`. No requiere Supabase, Docker ni login. Usa el mismo prompt, herramientas, motor de negociación y control de cifras que el portal del deudor, con persistencia en memoria y datos ficticios.

Configurá el proveedor, el modelo y su credencial en `apps/platform/.env.local`. Por ejemplo, para OpenRouter:

```dotenv
AI_PROVIDER=openrouter
AI_MODEL=deepseek/deepseek-v4.1-flash-1017
OPENROUTER_API_KEY=TU_API_KEY
```

El modelo debe existir en la cuenta del proveedor y soportar llamadas a herramientas. Reiniciá el servidor si cambiás esta configuración. Las llamadas usan la API real y consumen saldo del proveedor.

1. Elegí un escenario o editá los montos en pesos, las cuotas, las quitas, el anticipo y el tono. Iniciá la conversación.
2. Escribí como deudor. El panel lateral muestra las herramientas ejecutadas, sus entradas y salidas, eventos, tiempo total del turno y tokens. La respuesta se muestra al completar el turno y su validación de cifras.
3. Aceptá una oferta para simular el cierre, o pedí hablar con una persona para probar la derivación. No se crean acuerdos reales ni se simulan respuestas de un administrador.
4. Exportá la conversación como JSON antes de reiniciar con otros datos. Cada conversación conserva su política inicial; editar los campos requiere iniciar una nueva prueba.

Las sesiones están aisladas, vencen tras dos horas de inactividad y se pierden al reiniciar el servidor, recargar módulos o la página. La API del sandbox responde 404 en producción. La simulación no prueba la verificación de identidad ni la persistencia transaccional de Supabase.

### Evals del agente

Los escenarios están en `apps/platform/src/server/evals/scenarios.ts` (cooperativo, fuera de política, cifras inventadas, deudor agresivo, prompt injection, tercero no titular, derivación y límites). Corren sobre el mismo pipeline que el sandbox y verifican en todos los casos que:

- siempre se muestra el aviso de bot y de privacidad;
- nunca queda una oferta fuera de política;
- ninguna cifra sin respaldo llega al deudor;
- no hay lenguaje intimidatorio ni se revela el system prompt;
- se deriva a una persona cuando corresponde.

Hay dos modos:

- **Modelo guionado (CI, sin API key):** forma parte de `pnpm test`. El modelo simulado se porta bien o desobedece a propósito, para comprobar que los guardrails determinísticos frenan los errores del LLM.
- **Modelo real (a demanda):** `pnpm eval:llm` usa los mismos mensajes del deudor con el modelo de `apps/platform/.env.local`. Sin credencial, se saltea. Para correr solo algunos escenarios: `EVAL_SCENARIOS=tercero-no-titular,pide-12-cuotas pnpm eval:llm`. El reporte con la conversación, las tools, los tokens y los tiempos de cada escenario queda en `apps/platform/.evals/` (ignorado por git).

Para una base local existente, aplicá las nuevas migraciones sin recrear los datos:

```bash
pnpm exec supabase migration up --local
```

Los tests de la plataforma ejecutan las migraciones y verifican los RPCs y RLS con PostgreSQL embebido, sin requerir Docker. `pnpm db:test` mantiene la suite pgTAP de Supabase.

| Script                           | Qué hace                                                   |
| :------------------------------- | :--------------------------------------------------------- |
| `pnpm typecheck` / `pnpm test`   | Typecheck y tests de todos los paquetes                    |
| `pnpm db:start` / `pnpm db:stop` | Levanta / detiene Supabase local                           |
| `pnpm db:reset`                  | Recrea la base local aplicando migraciones y seed          |
| `pnpm db:types`                  | Regenera los tipos TypeScript desde el esquema local       |
| `pnpm smoke:llm`                 | Verifica que la API key y el modelo configurados respondan |
| `pnpm eval:llm`                  | Corre las evals del agente con el modelo real              |
