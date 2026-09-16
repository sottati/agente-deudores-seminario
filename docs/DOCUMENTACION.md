# Documentación del Proyecto: pacta.ia

> **Producto:** pacta.ia (Asistente Autónomo de Cobranzas B2B)
> **Estado:** Fase de Prototipado (MVP)

---

### Estado Actual de la Implementación
* **Estructura base:** Se ha configurado el repositorio bajo un esquema *monorepo* (usando `pnpm`).
* **Frontend (MVP Mock):** Iniciado en `apps/platform` con React 19, Vite, TanStack Router y shadcn/ui. Incluye identidad visual (logo y tema dark/light).
* **Inteligencia Artificial:** *Pendiente.* (La capa del agente se alojará en `apps/agent`).
* **Gestión Documental:** Documentos como el listado de stakeholders, tablero Kanban, encuestas y entrevistas están en fase de desarrollo.

---

## 1. Definición y Justificación del Problema

### 1.1 Contexto y Diagnóstico
Actualmente existe un dolor operativo significativo en las administraciones de consorcios, colegios e instituciones intermedias debido a la **alta morosidad**. La gestión de cobranzas es un proceso **incómodo** y que **consume mucho tiempo**. 

Los métodos tradicionales (correos electrónicos genéricos o llamadas telefónicas directas) suelen generar **fricción** o son directamente **ignorados** por los deudores. Al no contar con capacidad humana suficiente para negociar planes de pago personalizados caso por caso, las intimaciones masivas presentan una **baja tasa de respuesta** y las llamadas generan desgaste y evasión. Actualmente, el seguimiento de la mora se realiza de forma **100% manual**, ciclo a ciclo.

### 1.2 Declaración del Problema
> Los administradores de consorcios profesionales e independientes (carteras de 5 o más edificios en CABA y GBA) y los tesoreros de colegios privados medianos (más de 300 alumnos) enfrentan la dificultad de gestionar deudas vencidas de forma manual y mediante canales genéricos. Este contacto uno a uno mensual genera una baja tasa de respuesta, desgaste en la relación interpersonal, dilatación en el recupero de la mora, y afecta negativamente la liquidez y la capacidad operativa de las instituciones.

### 1.3 Árbol de Problemas
*   **Causas Principales:**
    *   Volumen de deudores superior a la capacidad de atención humana personalizada.
    *   Uso de canales de contacto estáticos y genéricos (mail masivo o llamadas invasivas).
    *   Seguimiento desorganizado mediante herramientas no especializadas (Excel, sistemas legacy, WhatsApp personal).
*   **Problema Central:** Recupero de deuda vencida lento, costoso a nivel de tiempo y desgastante para quien ejecuta la cobranza.
*   **Efectos:**
    *   Baja tasa de respuesta e ignorancia de intimaciones.
    *   Evasión del deudor y fricción interpersonal en comunidades cerradas (vecinos, familias de alumnos).
    *   Impacto negativo en la liquidez y capacidad operativa de la institución.

---

## 2. Segmentación y Mercado Objetivo

### 2.1 Perfilado del Cliente
El enfoque de segmentación se basa en comprender la problemática real y el estrés operativo de gestionar los cobros.
*   **Geográfica:** Zonas urbanas de alta densidad en Argentina, con foco inicial en CABA y GBA.
*   **Demográfica:** Profesionales de 30–60 años. Ocupación principal: administradores de consorcios matriculados y personal de tesorería/dirección en colegios privados e instituciones intermedias.
*   **Psicográfica:** Profesionales que sufren de **estrés laboral** por la alta carga operativa y la presión del **flujo de caja**. Buscan profesionalizar la gestión manteniendo una **imagen empática** para evitar conflictos directos con vecinos o clientes.
*   **Comportamiento:** Uso intensivo de planillas (Excel) o sistemas contables tradicionales. Dependencia de WhatsApp y teléfono como canales principales de seguimiento, de manera desestructurada.

### 2.2 Mercado Objetivo Primario (Target)
1.  **Administradores de consorcios** que gestionan carteras medias/grandes (5 o más edificios simultáneamente).
2.  **Tesoreros de colegios privados** de tamaño mediano (más de 300 alumnos).

Ambos perfiles absorben personalmente la carga horaria y emocional de contactar deudores de forma manual. El producto se orienta a la entidad como cliente SaaS B2B, no al deudor final.

---

## 3. Enfoque del Producto (MVP) y Casos de Uso

### 3.1 Definición del MVP
El Producto Mínimo Viable (MVP) consiste en un **prototipo web que simula un entorno de mensajería**. Su objetivo es validar la eficacia de una negociación automatizada bajo reglas predefinidas.
*   **Actor Administrador:** Carga una deuda y configura las **reglas de negociación permitidas** (ej. máximo de cuotas, quita de intereses).
*   **Actor Deudor:** Interactúa en lenguaje natural para negociar su deuda.
*   **Sistema:** Procesa las solicitudes del deudor y ofrece un **acuerdo formal** estrictamente dentro de las políticas configuradas por la administración.

### 3.2 Propuesta de Valor
El valor del sistema no radica únicamente en contar con un chatbot, sino en la integración armónica de la **deuda + las reglas de flexibilidad de la entidad + el diálogo**. Esto garantiza que el acuerdo sea trazable, automatizado y se mantenga dentro de los parámetros de la empresa, aliviando al personal del estrés de la negociación directa.

### 3.3 Alcance Excluido
El producto **no es**:
*   Un sistema de liquidación de expensas o cuotas mensuales regulares.
*   Un portal de pago genérico.
*   El enfoque está exclusivamente en la **negociación de deudas vencidas y la mora**, no en el alta de unidades funcionales ni la facturación recurrente.

### 3.4 Casos de Uso Principales (Jobs to be Done)
*   **Funcional:** Registrar deudas, aplicar reglas de flexibilidad y procesar deudores en paralelo para llegar a acuerdos escritos y trazables.
*   **Emocional:** Disminuir el estrés de la carga operativa y la frustración de gestionar cobros manualmente sin obtener respuesta.
*   **Social:** Preservar la relación interpersonal (evitar el rol del "vecino que persigue") manteniendo una imagen empática y profesional frente a la comunidad.

---

## 4. Investigación de Usuarios

### 4.1 Objetivo
Resolver la siguiente premisa: *¿Cómo podríamos ayudar a un administrador de consorcios o tesorero, bajo presión de caja y con miedo al conflicto, a cerrar acuerdos de pago dentro de su política sin que cada mora se convierta en una confrontación manual?*

### 4.2 Arquetipo de Usuario (Persona)
*   **Perfil:** "El encargado de recuperar el mes".
*   **Escenario:** Cierre de mes con saldos vencidos. Se ve obligado a usar el teléfono y WhatsApp personal para contactar deudores de manera desorganizada.
*   **Motivaciones:** Recuperar la caja en positivo sin desgastar la relación con el deudor.
*   **Frustraciones:** Evasión por parte del deudor, pérdida de tiempo, respuestas nulas a los correos, y el impacto emocional de la cobranza directa.

### 4.3 Mapa de Empatía (Resumen)
*   **Piensa y siente:** Preocupación por cubrir costos fijos (proveedores, sueldos); considera que "cobrar es incómodo"; desea modernizar sus herramientas.
*   **Esfuerzos:** Pierde tiempo en tareas repetitivas; las comunicaciones masivas no son efectivas.
*   **Resultados esperados:** Acuerdos documentados, recupero de capital sin conflicto cara a cara y optimización del tiempo laboral.

---

## 5. Alcance y Arquitectura Tecnológica

### 5.1 Componentes del Sistema
*   **Plataforma (SaaS):** Entorno multi-tenant donde el cliente inicia sesión, gestiona las carteras de deudores, configura el agente y visualiza métricas de recupero.
*   **Agente Conversacional:** Motor de IA (Sandbox en etapa MVP) que gestiona el estado de la conversación y negocia mediante lenguaje natural.

### 5.2 Stack Tecnológico
*   **Frontend / Plataforma:** React 19 + TanStack Router + Vite.
*   **UI Components:** shadcn/ui y Tailwind CSS para el diseño de componentes y estilos estandarizados.
*   **IA y Agente:** Vercel AI SDK implementando **GPT-5.6 Luna**.
*   **Backend / Auth:** Supabase (Auth + Base de datos relacional PostgreSQL).

> **Decisión Técnica - Modelo de IA:** Se seleccionó **GPT-5.6 Luna** como modelo fundacional priorizando su robustez en el cumplimiento estricto de system prompts (guardrails) para evitar "alucinaciones" (como otorgar descuentos no permitidos por la administración), además de contar con excelentes capacidades de *Function Calling* y un balance ideal de costo/velocidad.

### 5.3 Arquitectura de Monorepo
El código se organiza para separar las responsabilidades lógicas entre la interfaz de usuario y el motor de IA, utilizando `pnpm` como gestor de paquetes de monorepo:
```text
├── apps/
│   ├── platform/                 # Dashboard, configuración, landing (React, Vite)
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── agent/                    # Lógica del Agente e IA
│       └── package.json
├── pnpm-workspace.yaml
├── package.json
└── DOCUMENTACION.md
```

---

## 6. Modelo de Negocios

### 6.1 Estructura de Ingresos
Tras analizar distintas alternativas, el equipo se decantó por un **Modelo Mixto (Suscripción Base + Comisión por Éxito)**, dado que es el estándar más sólido para productos B2B de cobranzas y alinea los incentivos del proveedor con los del cliente.

1.  **Suscripción Base Accesible (Ej. $15 USD/mes):**
    *   **Qué cubre:** Mantenimiento de la infraestructura, acceso permanente al dashboard de métricas web, y los costos fijos de la línea de WhatsApp Business.
    *   **Por qué:** Permite cubrir los costos operativos (servidores, tokens básicos del LLM GPT-5.6 Luna) y da previsibilidad financiera básica al proveedor.
2.  **Comisión por Éxito (Ej. 1.5% - 3%):**
    *   **Qué cubre:** Se cobra un porcentaje *solo* sobre el capital de mora efectivamente recuperado a través de la intervención del agente.
    *   **Por qué:** Elimina la barrera de entrada y el riesgo principal para el cliente ("¿y si pago el software y el bot no cobra nada?"). Alinea el éxito del producto con el éxito financiero de la institución.

### 6.2 Posicionamiento (Elevator Pitch)
> "Actualmente, los administradores de comunidades y colegios sufren un gran desgaste cada cierre de mes al perseguir a los deudores uno por uno, enfrentándose a correos ignorados y llamadas incómodas que tensionan las relaciones y afectan la liquidez. 
> Hemos desarrollado un asistente autónomo de cobranzas B2B. El administrador simplemente carga la deuda y sus límites de negociación, y nuestro agente dialoga con el deudor en lenguaje natural para cerrar un acuerdo por escrito, siempre dentro de las políticas de la institución. El resultado es un mayor recupero de mora, de manera empática, trazable y sin confrontaciones manuales."

---

## 7. Roadmap y Evolución del Producto

### 7.1 Grilla de Priorización

| Prioridad | Esfuerzo | Impacto | Componentes Core |
| :--- | :--- | :--- | :--- |
| **Alta (MVP)** | Bajo/Medio | Alto | Chatbot web simulado, módulo de reglas de negociación, registro de deudas, emisión de acuerdo en texto. |
| **Media (V2)** | Alto | Alto | Integración oficial con WhatsApp Business API, generación de links de pago dinámicos, carga masiva (CSV). |
| **Baja (Futuro)**| Medio | Bajo | Dashboards avanzados predictivos, sincronización bidireccional vía API con sistemas contables ERP de terceros. |
| **Excluido** | Alto | Negativo | Llamadas telefónicas robóticas (hostigamiento), desarrollo de un ERP completo de liquidación de expensas, score crediticio predictivo propio. |

### 7.2 Plan de Lanzamientos (Releases)
1.  **Release 1 (MVP - Sandbox):** Interfaz web simulada. Carga manual de parámetros. Diálogo de negociación asistida y emisión de acta de acuerdo de pago.
2.  **Release 2 (Operación Real):** Integración con WhatsApp Cloud API para interacción real, arquitectura multi-tenant, importación masiva de deudores, y envíos de links de pago transaccionales.
3.  **Release 3 (Ecosistema Integrado):** Omnicanalidad, conexión mediante API a software de gestión de expensas/colegios para conciliación automática de pagos.

---

## 8. Estrategia de Mercado y Posicionamiento

### 8.1 Diagnóstico Competitivo
El mercado tradicional de recuperación de deuda se caracteriza por prácticas invasivas (estudios jurídicos, llamadas reiterativas, intimaciones). Este enfoque intimida al deudor, genera rechazo y daña la reputación de la entidad acreedora. 

### 8.2 Diferenciación (Propuesta Estratégica)
Nuestra solución busca abrir un nuevo segmento de mercado al redefinir la cobranza:
*   **Elimina:** El hostigamiento, las llamadas invasivas y el involucramiento manual del administrador en discusiones.
*   **Reduce:** El costo de gestión operativa y los tiempos de recuperación.
*   **Incrementa:** La empatía, la flexibilidad paramétrica y el cuidado del vínculo institucional-vecinal.
*   **Crea:** Un mediador digital asincrónico que ofrece a los deudores la posibilidad de autogestionar su regularización financiera sin fricción.

### 8.3 Barreras de Entrada
El sistema posee ventajas sostenibles a mediano plazo:
*   **Alineación Tecnológica y Cultural:** El producto combina automatización por IA con un tono conversacional altamente calibrado.
*   **Renovación Constante:** El roadmap incluye automatizaciones más complejas (integración bancaria y contable) que elevarán los costos de cambio para el cliente, asegurando retención a largo plazo.

---

## Backlog del Equipo (Próximos Pasos)

1.  **Validación de Datos:** Relevar métricas del sector inmobiliario/educativo para respaldar la magnitud del problema de la morosidad.
2.  **Investigación de Usuarios:** Difundir y analizar la encuesta cuantitativa para validar perfiles y consolidar los mapas de empatía reales.
3.  **Definiciones de Arquitectura:** Cerrar la selección del router web y la arquitectura exacta de Supabase para el Release 2.
4.  **Guardrails de IA:** Implementar políticas de seguridad y *prompts* restrictivos para garantizar que el modelo no ofrezca descuentos o planes no autorizados.
5.  **Definición Comercial:** Estructurar el modelo financiero de los planes y unidades de créditos (costos de inferencia vs. rentabilidad por comisión).
6.  **Gestión de Claves:** Implementar rotación y administración segura de variables de entorno para las APIs utilizadas en el proyecto.
