# pacta.ia - Asistente Autónomo de Cobranzas B2B

> Proyecto de Seminario de Integración Profesional (TIF / SIP) - UADE

## Datos del Equipo
* **Nombre del Grupo:** pacta.ia
* **Nombre de Fantasía (MVP):** pacta.ia
* **Integrantes:**
  * Juan Cruz Elliff - Legajo: 1140086
  * Santiago Garbini - Legajo: 1188868
  * Tomas Maximo Hokama - Legajo: 1195217
  * Maximiliano Ivan Huertas - Legajo: 1072417
  * Simon Ottati - Legajo: 1155931

## Organización y Seguimiento
* **Tablero Kanban:** [Linear Kanban Board](https://linear.app/santiago-garbini/project/seminario-de-gestion-de-tecnologia-3bd4add3a15a/view/kanban-5f46e4e8019c)
* **Documentación Principal:** [DOCUMENTACION.md](./docs/DOCUMENTACION.md)
* **Plan del Backend:** [PLAN_BACKEND.md](./docs/PLAN_BACKEND.md)
* **Análisis de Stakeholders:** [Stakeholders.md](./docs/Stakeholders.md)
* **Marco Legal:** [MARCO_LEGAL.md](./docs/MARCO_LEGAL.md)
* **Identidad Visual:** [identidad_visual.md](./docs/identidad_visual.md)
* **Entrevistas y Trabajo de Campo:** [ENTREVISTAS.md](./docs/ENTREVISTAS.md)
* **Uso de IA:** [USO_IA.md](./docs/USO_IA.md)

## Estructura del Repositorio (Monorepo)
Este proyecto utiliza un esquema de monorepo gestionado con `pnpm`:
* `/apps/platform`: Aplicación web (landing, panel del administrador, chat del deudor) y backend (TanStack Start).
* `/packages/agent`: Agente conversacional IA (Vercel AI SDK).
* `/packages/negotiation-engine`: Motor de reglas de negociación determinístico.
* `/supabase`: Configuración, migraciones y seed de la base de datos.

## Desarrollo Local

Requisitos: Node 22+, pnpm 12 y Docker Desktop (para Supabase local).

```bash
pnpm install
cp apps/platform/.env.example apps/platform/.env.local   # completar valores
pnpm db:start        # levanta Supabase local e imprime las keys
pnpm dev             # http://localhost:3000
```

| Script | Qué hace |
| :--- | :--- |
| `pnpm typecheck` / `pnpm test` | Typecheck y tests de todos los paquetes |
| `pnpm db:start` / `pnpm db:stop` | Levanta / detiene Supabase local |
| `pnpm db:reset` | Recrea la base local aplicando migraciones y seed |
| `pnpm db:types` | Regenera los tipos TypeScript desde el esquema local |
| `pnpm smoke:llm` | Verifica que la API key y el modelo configurados respondan |


