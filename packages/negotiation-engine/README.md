# @agente/negotiation-engine

Motor de reglas determinístico de pacta.ia. Toda cifra que ve el deudor (cuotas, anticipos, quitas, cronogramas) sale de este paquete, nunca del LLM.

- **Puro:** sin acceso a base de datos, red ni reloj implícito (las fechas se reciben por parámetro).
- **Montos en centavos** (`number` entero), sin flotantes.
- **Cobertura objetivo ≥ 95 %.**

API prevista (ver [PLAN_BACKEND.md §3.1](../../docs/PLAN_BACKEND.md)): `getNegotiationBounds`, `evaluateRequest`, `buildSchedule`, `requiresHuman`.

```bash
pnpm --filter @agente/negotiation-engine test
pnpm --filter @agente/negotiation-engine test:coverage
```
