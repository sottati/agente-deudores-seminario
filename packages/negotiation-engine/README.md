# @agente/negotiation-engine

Motor de reglas determinístico de pacta.ia. Toda cifra que ve el deudor (cuotas, anticipos, quitas, cronogramas) sale de este paquete, nunca del LLM.

- **Puro:** sin acceso a base de datos, red ni reloj implícito (las fechas se reciben por parámetro).
- **Montos en centavos** (`number` entero), sin flotantes.
- **Cobertura objetivo ≥ 95 %.**

API exportada (ver [PLAN_BACKEND.md §3.1](../../docs/PLAN_BACKEND.md)):

- `getNegotiationBounds(debt, policy)` — rangos y planes válidos por cantidad de cuotas.
- `evaluateRequest(debt, policy, request)` — evalúa un pedido del deudor; nunca lanza y devuelve `closestValidOffer` si está fuera de política.
- `buildSchedule(offer, startDate)` — cronograma cada 30 días con redondeo determinístico en la última cuota.
- `requiresHuman(debt, policy, context)` — reglas de escalado humano (pedido explícito, monto sobre umbral o intentos fuera de política).
- Utilidades: `pesosToCents`, `centsToPesos`, `formatCentsARS`, `applyPctFloor`, `applyPctCeil`, `policyFromSnapshot`.

```bash
pnpm --filter @agente/negotiation-engine test
pnpm --filter @agente/negotiation-engine test:coverage
```
