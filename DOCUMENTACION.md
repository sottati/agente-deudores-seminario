# Documentación del Proyecto: [Nombre a definir]

> **Producto (placeholder):** Asistente Autónomo de Cobranzas B2B  
> **Materia:** Seminario de Integración Profesional (TIF / SIP)  
> **Fuentes:** propuesta técnica-comercial (`TPO - AI Chatbot`), teoría de Clases 01–06 (UADE - Seminario de Integración Profesional) y presentación académica *La Estrategia del Océano Azul* (W. Chan Kim & Renée Mauborgne, INSEAD).
> **Regla de trabajo:** este documento **no inventa** evidencia. Donde la propuesta no cubre un requisito de la teoría, hay un bloque `TODO`.
> 
> ---
> 
> ### Estado Actual de la Implementación
> * **Estructura base:** Se ha configurado el repositorio bajo un esquema *monorepo* (usando `pnpm`).
> * **Frontend (MVP Mock):** Iniciado en `apps/platform` con React 19, Vite, TanStack Router y shadcn/ui. Incluye identidad visual (logo y tema dark/light).
> * **Inteligencia Artificial:** *Pendiente.* (La capa del agente se alojará en `apps/agent`).
> * **Gestión Documental:** Documentos como el listado de stakeholders, tablero Kanban, encuestas y entrevistas están en fase de desarrollo.

---

## Cómo leer este documento

| Sección | Ancla teórica | Ancla de la propuesta |
| --- | --- | --- |
| 1. Problema | Clase 02 (reglas de redacción; antipatrones) y Clase 03 (sintaxis y características de un buen problema) | Redacción del problema, dolor de morosidad y métodos actuales |
| 2. Segmentación y target | Clase 02 (tipos de segmentación, target market, modelos de mercado) | Secciones 2 y 3 de la propuesta |
| 3. MVP y JTBD | Clase 01 (MVP, paradoja de la maleta, lista negra) y Clase 03 (JTBD) | MVP, scope y dolores operativos |
| 4. Design Thinking | Clase 04 (persona, mapa de empatía, research) y Clase 06 (proceso no lineal, fail cheap) | Psicografía, iteración y fricción de cobranza |
| 5. Scope y arquitectura | — (mapeo técnico de la propuesta) | Scope, monorepo y stack |
| 6. Negocio y pitch | Clase 05 (elevator pitch, método Tony Robbins) | Modelos de facturación y pros/contras |
| 7. Ideación y Roadmaps | Clase 06 (reglas de ideación, priorización, releases sucesivos y roadmap de producto) | Prototipo web evolutivo hacia WhatsApp multi-tenant |
| 8. Océano Azul | Clase 06 y Presentación INSEAD (Kim & Mauborgne: ERIC, lienzo, debates, no clientes, secuencia BOI, ejecución) | Diferenciación frente a agencias de cobro y ERPs contables |

---

## 1. Definición y Justificación del Problema

### 1.1 Hipótesis del problema (sin solución)

Según la Clase 02 y la Clase 03, el problema es el **punto de partida** del proyecto: una **hipótesis** de un suceso actual con **impacto negativo**, escrita en oraciones cortas y objetivas, **sin incluir la solución**, sin frases del tipo “una app / un bot / una plataforma que…”, y sin prejuicios sobre causas o efectos. Esa hipótesis se **ratifica o se refuta** después, con investigación (encuestas, entrevistas, papers).

La propuesta describe un dolor actual en Argentina: la **alta morosidad** en administraciones de consorcios, colegios e instituciones intermedias. Cobrar es **incómodo**, **consume mucho tiempo**, y los métodos tradicionales (mail genérico o llamada) **generan fricción o son ignorados**. No hay capacidad humana para negociar un plan de pagos personalizado con cada deudor. Los mails masivos de intimación tienen **bajísima tasa de respuesta**; las llamadas de cobro generan **desgaste y evasión**. El seguimiento de morosos es **100% manual**, mes a mes.

Eso cumple las reglas de un **buen problema para MVP** (Clase 03):

| Criterio (Clase 03) | Cómo se cumple en esta hipótesis |
| --- | --- |
| **Específico** | No es “la gente pierde tiempo”; es mora + seguimiento manual + canales genéricos en un usuario concreto. |
| **Relevante** | Hay dolor económico (liquidez, recupero dilatado) e interpersonal (desgaste, evasión). |
| **Enfocado** | No es “todos”: apunta a administradores de consorcios e instituciones educativas privadas (ver §2 y §3). |
| **Validable en el corto plazo** | El MVP propuesto permite experimentar si un deudor responde a una negociación parametrizada (ver §3). |

> **TODO:** La propuesta afirma “altas tasas de morosidad” y “bajísima tasa de respuesta”, pero **no cita datos reales** (porcentaje, fuente, paper o entrevista). La Clase 03 exige datos reales *siempre que sea posible*. Completar magnitud con investigación de mercado / user research.

### 1.2 Declaración del problema (sintaxis Clase 03)

Plantilla obligatoria:

```text
[Usuario específico] tiene el problema de [situación concreta] cuando [contexto], lo que genera [impacto negativo].
```

**Declaración (hipótesis de trabajo):**

> Los administradores de consorcios profesionales e independientes (carteras de 5 o más edificios en CABA y GBA) y los tesoreros de colegios privados medianos (más de 300 alumnos) tienen el problema de gestionar deudas vencidas de forma 100% manual y con mensajes genéricos cuando deben contactar uno a uno a cada deudor cada mes, lo que genera baja tasa de respuesta, desgaste en la relación interpersonal, dilatación del recupero y presión sobre la liquidez y la capacidad operativa.

Esta redacción:

- nombra un **usuario específico** (no “el mercado”);
- describe una **situación concreta** (seguimiento manual + canales genéricos);
- sitúa un **contexto** (ciclo mensual de contacto uno a uno);
- cierra con **impacto negativo objetivo** (respuesta, relación, tiempo de recupero, liquidez);
- **no** nombra bot, app, IA ni WhatsApp como “la falta”.

### 1.3 Preguntas guía (Clase 02 / Clase 03)

| Pregunta | Respuesta con lo que hay hoy | Hueco |
| --- | --- | --- |
| ¿Existe realmente el problema? | Hipótesis de la propuesta: sí, como dolor operativo recurrente. | Falta validación empírica. |
| ¿Cuál es el problema y sus elementos esenciales? | Mora + incapacidad de negociar caso a caso + canales estáticos + carga horaria/emocional. | — |
| ¿A qué población afecta y en qué zona? | Administraciones de consorcios, colegios e instituciones intermedias; foco CABA y GBA. | — |
| ¿Causas y consecuencias actuales? | La propuesta menciona falta de personal/tiempo y métodos genéricos; efectos: baja respuesta, desgaste, dilación, liquidez. | La teoría pide **no asumir causas** en la redacción; el árbol de problemas y los 5 Whys están incompletos. |
| ¿Consecuencias si se resuelve? | Implícitas: más recupero, menos desgaste, más liquidez. | No está cuantificado. |
| ¿Qué magnitud tiene? | Cualitativa (“altas tasas”, “cientos de cobranzas”). | Sin métrica. |

### 1.4 Árbol de problemas y 5 Whys (borrador, no cerrado)

La Clase 02 y la Clase 03 piden modelar **causas (raíces) → problema central (tronco) → efectos (ramas)** y no quedarse en la primera causa aparente (**5 Whys**).

```text
Causas (hipótesis, a validar)
  ├── Volumen de deudores vs. capacidad de atención humana
  ├── Canales de contacto genéricos (mail masivo / llamada)
  └── Seguimiento desorganizado (Excel / sistemas obsoletos + WhatsApp informal)

Problema central
  └── Recupero de deuda vencida lento, costoso en tiempo y desgastante para quien cobra

Efectos
  ├── Baja tasa de respuesta e ignorar intimaciones
  ├── Evasión y fricción interpersonal
  └── Impacto negativo en liquidez y capacidad operativa
```

> **TODO:** Completar un **Árbol de Problemas** cerrado y una cadena de **5 Whys** con evidencia (entrevistas a administradores/tesoreros). No tratar “no hay un bot” como causa raíz: la Clase 03 lo marca como antipatrón (“el problema del usuario NUNCA es ‘no existe una app’”).

### 1.5 Diagnóstico de magnitud (Clase 03) — preliminar

| Variable | Lectura preliminar sobre el usuario primario | Nivel |
| --- | --- | --- |
| Áreas a las que afecta | Operación, caja y vínculo con vecinos/clientes (más de un área). | B |
| Gravedad | Liquidez y capacidad operativa de la entidad. | B–C |
| Tiempo de convivencia | Ciclo mensual, reiterado (más de seis meses como patrón). | C |
| Simultaneidad | Muchos deudores a la vez (“sensación de abrumo”). | C |

Lectura: perfil **mayoría B/C** (problema con potencial de superar la capacidad de afrontamiento). Es un diagnóstico de escritorio, no clínico.

> **TODO:** Rehacer esta matriz con respuestas de user research, no solo con la narrativa de la propuesta.

---

## 2. Segmentación y Mercado Objetivo

### 2.1 Para qué segmentamos (Clase 02)

La Clase 02 define **mercado** como el lugar de intercambio entre oferentes y demandantes, divisible en **segmentos y nichos**. Segmentar es clasificar usuarios por características compartidas para **satisfacer mejor necesidades**, identificar nichos, y **decidir a quién servir y a quién ignorar**.

La misma clase advierte que la **demografía sola no alcanza** (ejemplo Príncipe Carlos vs. Ozzy Osbourne): *las personas se deberían considerar por los problemas y desafíos a los que se enfrentan*. Por eso la propuesta combina las cuatro variables y ancla el target en el **trabajo mensual de cobrar**, no solo en edad/ocupación.

### 2.2 Las cuatro variables (extraídas de la propuesta)

| Tipo (Clase 02) | Pregunta / definición de la clase | Aplicación en la propuesta |
| --- | --- | --- |
| **Geográfica** | Ubicación (país, región, ciudad). | Zonas urbanas de alta densidad en **Argentina**, foco inicial **CABA y GBA**. |
| **Demográfica** | *¿Quién es nuestro cliente?* Edad, sexo, ocupación, etc. | Hombres y mujeres **30–60 años**. Ocupación: administradores de consorcios **matriculados**, dueños/gerentes de pymes de servicios, personal directivo o de **tesorería** en colegios e instituciones privadas. |
| **Psicográfica** | Estilo de vida, personalidad, actitudes, valores. | Alto **estrés laboral** por carga operativa y presión de **flujo de caja**. Buscan **profesionalizar y modernizar** la gestión. Les importa una **imagen empática** y **evitar conflictos** directos con vecinos o clientes. |
| **Comportamiento** | Uso, hábitos. | Uso intensivo de **Excel** o sistemas de gestión **obsoletos**. **WhatsApp y teléfono** como canal principal, **constante pero desorganizado**, para urgencias y reclamos. Seguimiento de morosos **100% manual**. |

Justificación teórica: el corte geográfico acota el mercado inicial; el demográfico identifica *quién* opera la cobranza; el psicográfico y el de comportamiento explican *por qué duele* (estrés, imagen, herramientas rotas) y evitan el error de tratar a “todos los de 30–60” como el mismo cliente.

### 2.3 A quién servimos y a quién no (aún)

**Servimos (propuesta):** quien tiene la **cuenta operativa de cobrar** en consorcios, colegios e instituciones intermedias.

**No es el comprador del SaaS:** el deudor (moroso) es un **actor del flujo**, no el target comercial B2B.

> **TODO:** Explicitar segmentos **fuera de alcance** para el cuatrimestre (por ejemplo: estudios jurídicos de cobro masivo, bancos, utilities, cobranzas B2C de retail). La Clase 02 exige decidir a quién **ignorar**.

### 2.4 Target market primario

La Clase 02: el **target market** es el **consumidor primario**; una vez identificado, se modela el producto hacia sus necesidades.

**Target primario (propuesta):**

1. **Administradores de consorcios profesionales e independientes** que gestionan carteras de **tamaño medio a grande (5 o más edificios simultáneamente)** en **CABA y GBA**.
2. **Tesoreros de colegios privados de tamaño mediano (más de 300 alumnos)**.

Patrón común: hacen el seguimiento **100% manual** y **absorben ellos mismos** la carga horaria y emocional de contactar deudores **uno por uno cada mes**.

Eso cumple “orientado a un usuario concreto, no a todos” (Clase 03).

> **TODO:** Decidir si el **único** comprador del MVP académico es el administrador de consorcios (más fácil de reclutar y de demo) y el tesorero queda como segmento secundario. Hoy la propuesta los pone **al mismo nivel**.

### 2.5 Clasificación del modelo de mercado (Clase 02)

No es **mercado en masa** (necesidades comunes de un público enorme).  
Se parece a **mercado de nicho** (vendedor–comprador B2B, segmento específico) con un matiz de **mercado segmentado**: consorcios y colegios tienen problemas *ligeramente similares* (mora, contacto manual, caja), no *muy distintos* (eso sería diversificado).  
No es **multilateral** en el sentido Uber/Airbnb: el deudor no es un segundo cliente que paga la plataforma.

> **TODO:** Si más adelante se cobra también al deudor o a un estudio de cobranza, reevaluar si el modelo pasa a **multilateral**. Hoy el pagador del SaaS es la administración/institución.

---

## 3. Enfoque MVP y Jobs to be Done (JTBD)

### 3.1 Qué es un MVP aquí (Clase 01)

La Clase 01: el MVP es la versión **más elemental** que reúne **solo** funcionalidades y atributos básicos para salir al mercado, **probar las aguas** y iterar con **feedback real**, sin gastar el cuatrimestre en un producto final complejo.

Ejemplos de la clase: Amazon empezó vendiendo libros; Instagram, fotos con filtros; UberCab, pedir un viaje en una ciudad. Lo que vino después (Prime, Reels, carpooling) **no era el MVP**.

**MVP declarado en la propuesta:** un **prototipo web que simula un chat de WhatsApp**.

| Actor | Qué hace en el MVP |
| --- | --- |
| Administrador | Carga una deuda (ej. `$150.000`) y las **reglas de negociación permitidas**. |
| Usuario (deudor simulado) | Negocia en lenguaje natural (*“No tengo todo el dinero ahora, ¿puedo pagar la mitad la semana que viene?”*). |
| Sistema | Procesa la excusa y ofrece un **acuerdo formal** **solo** con los parámetros preconfigurados. |

Eso es “mínimo” en el sentido de la clase: **una** conversación de negociación bajo políticas, no un ERP de consorcios, no un WhatsApp productivo a escala, no un motor de scoring crediticio.

La Clase 03 refuerza: un MVP **no** busca el producto completo; busca validar si el problema **existe**, si alguien **quiere resolverlo**, y si la solución **tiene sentido**.

### 3.2 Innovación en valor y la paradoja de la maleta (Clase 01)

La **paradoja de la maleta**: la rueda (~3500 a.C.) y la maleta (~600 d.C.) existían por separado; recién en 1970 se **integraron** y se eliminó el esfuerzo de viajar. Eso ilustra la **brecha de innovación** y la **innovación en valor**: el MVP nace de **conectar piezas existentes** para un dolor real, no de inventar tecnología por la tecnología.

En la propuesta, las piezas ya existen de forma desconectada:

| Pieza existente | Cómo aparece hoy (propuesta) | Qué no resuelve sola |
| --- | --- | --- |
| Lista de deudores / monto | Excel o sistema obsoleto | No negocia |
| Canal de mensajería | WhatsApp/teléfono desorganizado | No aplica política de flexibilidad de forma consistente |
| Política de la administración | “Hasta 3 cuotas”, “quitar punitorios si…” (ejemplo de la propuesta) | Queda en la cabeza de quien llama |
| Intimación | Mail masivo estático | Baja respuesta, nula personalización |

La **innovación en valor** del MVP no es “tener un chat”, es **integrar** deuda + reglas de flexibilidad + diálogo, para que el acuerdo quede **dentro de política** y **por escrito** (trazabilidad citada en la propuesta), sin que el administrador viva cada conversación.

Eso es análogo a rueda + maleta: el valor está en la **unión al servicio del trabajo**, no en cada componente.

### 3.3 Lista negra (Clase 01): qué no somos

La Clase 01 **no acepta** (entre otros): sistemas de **reservas**; **ABM** genéricos (incluye *consorcios*); sistemas **para pagar** rentas, **expensas** o **cuotas de colegio**.

| Ítem de la lista negra | Por qué esta propuesta no es ese ítem |
| --- | --- |
| Sistema de reservas | No reserva canchas, turnos ni mesas. El flujo es **negociación de deuda vencida**. |
| ABM / CRUD de consorcios | El corazón del MVP **no** es alta/baja de unidades funcionales ni un padrón. El corazón es **procesar una excusa y cerrar un acuerdo bajo reglas**. El alta de una deuda es insumo, no el producto. |
| “Sistema para pagar expensas / cuotas” | La lista negra apunta a un **pagador de cuotas** (portal de pago / tesorería CRUD). El trabajo que ataca la propuesta es la **negociación personalizada que hoy no escala**, el **desgaste de cobrar** y el **recupero dilatado** — no reemplazar el medio de pago de la expensa al día. |

La justificación hay que poder **defenderla en clase**: el dominio (consorcios, colegios) **linda** con un ítem prohibido. La diferenciación es el **job** (negociar mora con política), no “otro ABM para pagar la cuota”.

> **TODO:** Dejar por escrito, para la defensa, una frase de una línea: *“No construimos un sistema para pagar expensas; construimos la validación de si se puede negociar mora con reglas, sin que el administrador haga la llamada.”* Confirmar con docentes si el recorte de dominio es aceptable.

### 3.4 Job to be Done (Clase 03)

Insight de la clase: el problema **nunca** es “no existe una app”; el problema está en el **proceso**. El administrador no “quiere un bot”; quiere **sacar adelante el recupero sin destruir la relación ni el mes laboral**.

**Situación real (paso 1 JTBD):** cada mes, una cartera de deudores; Excel/WhatsApp; mails que no contestan; llamadas que desgastan; presión de caja; miedo a quedar como “el que hostiga al vecino”.

**Job (paso 2) — plantilla de la clase:** *“Cuando [situación], quiero [motivación], para poder [resultado].”*

> Cuando cierra el mes y hay saldos vencidos en la cartera, quiero negociar un plan de pago **viable y dentro de la política de la administración** con cada deudor **sin** absorber yo la pelea ni las veinte llamadas, para poder **recuperar liquidez** y **seguir siendo profesional y empático** frente a vecinos o familias.

**Descomposición del job (paso 3):**

| Dimensión **funcional** | Dimensión **emocional** | Dimensión **social** |
| --- | --- | --- |
| Registrar deuda y reglas de flexibilidad (cuotas, punitorios, quitas). | Bajar el **estrés** de la carga operativa y de la caja. | No quedar como el vecino/tesorero “que persigue”. |
| Atender muchos casos en paralelo (la propuesta habla de **cientos** sin empleados extra — eso es la visión de producto; el MVP valida **un** diálogo). | Evitar **incomodidad, enojo y desgaste** de cobrar en persona o por teléfono. | Mantener **imagen empática** y gestión **profesional/moderna**. |
| Convertir una excusa en un **acuerdo escrito** trazable. | Reducir la frustración de que el mail masivo **sea ignorado**. | Mostrar responsabilidad ante el consorcio / la institución (flujo de caja a cargo). |

**Impacto en el corte del MVP (Clase 03):**

- *Sin JTBD:* se construye un SaaS enorme (multi-tenant + WhatsApp real + métricas + créditos + hostigamiento legal).
- *Con JTBD:* lo mínimo para **hacer el trabajo** es: deuda + reglas + diálogo + acuerdo dentro de parámetros.

Eso coincide con el prototipo web simulado de la propuesta.

**Señales de validación que la clase pide buscar** (múltiples herramientas desconectadas, confusión, mala carga, estrés): la propuesta ya las narra (Excel + WhatsApp desordenado + llamadas + estrés). Falta oírlas en campo.

> **TODO:** Entrevistar al target y anotar citas textuales del job. Completar **solución actual** del deudor y del administrador (qué hacen hoy, no qué “deberían” hacer).

---

## 4. Design Thinking: Exploración del Usuario

### 4.1 Trinidad y trampa del ingeniero (Clase 04)

La Clase 04 ordena tres lentes:

1. **Design Thinking** — explorar el problema; **qué** construir (empatía).  
2. **Lean Startup** — validar si el negocio **tiene sentido** (MVP).  
3. **Agile** — **cómo** construirlo bien (sprints).

Advierte que el **90%** de las startups fallan por construir algo que **nadie necesita**, no por mal código. Un MVP sano equilibra **deseabilidad**, **factibilidad** y **viabilidad**. Este documento cubre deseabilidad (persona/empatía) y factibilidad (stack); la viabilidad está en §6, aún con huecos de pricing.

Las cinco fases del Design Thinking (**Empatizar / Entender → Definir / Enfocar → Idear / Explorar → Prototipar / Construir → Testear / Aprender**) tienen una naturaleza no lineal y recursiva (Clase 06). Los aprendizajes del testeo y prototipado disparan replanteos de la definición y de la empatía. 

La máxima rectora de la Clase 06 es tajante para perfiles técnicos: **“Itera rápido. Falla barato. El código es caro; el diseño es barato.”** Esto justifica metodológicamente por qué el equipo no arranca programando una integración compleja con la API oficial de WhatsApp ni un multi-tenant cerrado, sino un prototipo/sandbox web de simulación: validar las dinámicas de negociación y la aceptación del usuario antes de que el costo de desarrollo se dispare.

Lo que sigue es un **borrador analítico** a partir de la psicografía y los dolores de la propuesta, no un entregable cerrado. La cátedra exige **rigor** en la persona: *no hipotética*.

> **TODO (entregable Clases 04 y 06):** 400 respuestas de encuesta difundida y analizada; entrevistas y observación de campo; Design Thinking de **al menos 3 usuarios** (persona + mapa de empatía + journey AS-IS). Hoy hay **un** borrador y **cero** fieldwork empírico consolidado.

### 4.2 Pregunta “¿Cómo podríamos…?” (Fase Definir)

En lugar de “hacer un bot de WhatsApp”:

> ¿Cómo podríamos ayudar a un administrador de consorcios o tesorero de colegio, bajo presión de caja y con miedo al conflicto, a cerrar acuerdos de pago **dentro de su política** sin que cada mora se convierta en una confrontación manual?

### 4.3 User Persona (borrador)

Representación **ficticia** con datos **tomados de la propuesta** (demografía + escenario + motivaciones). Nombre genérico, sin marca.

| Campo (Clase 04) | Borrador |
| --- | --- |
| **Nombre (placeholder)** | Persona A — “Quien cobra el mes” |
| **Demografía** | 30–60 años; ocupación: administrador/a de consorcios matriculado/a **o** tesorería de colegio privado mediano. |
| **Geografía** | CABA / GBA. |
| **Momento / escenario** | Gestiona **5+ edificios** (o **300+ alumnos**). Cierra el mes con una lista de mora. Trabaja en Excel o en un sistema viejo. El teléfono y WhatsApp están **siempre** abiertos, de forma desorganizada. |
| **Motivaciones / objetivos** | Profesionalizar la gestión; **caja en positivo**; no pelearse con el vecino o con la familia del alumno; no vivir el mes como una ronda de llamadas incómodas. |
| **Comportamiento actual** | Mail masivo de intimación; llamada cuando la mora duele; negociación artesanal si el deudor atiende. |
| **Frustración** | Baja respuesta, evasión, tiempo, desgaste, sensación de no dar abasto. |

> **TODO:** Reemplazar este composite por **3 personas** distintas (p. ej. administrador independiente, tesorero de colegio, dueño de pyme de servicios) **después** de entrevistas. No usar este borrador como si fuera research cerrado.

### 4.4 Mapa de empatía — cuadrantes pedidos (Persona A)

La Clase 04 divide el mapa en **seis** cuadrantes. Aquí se desarrollan los tres que pediste el equipo; los otros tres quedan como TODO.

#### ¿Qué piensa y siente?

- “Si este mes no entra, no cubro expensas/sueldos/proveedores.”  
- “Cobrar es sucio: o parezco blando o parezco hostigador.”  
- Quiere modernizarse, pero no a costa de la **imagen empática**.  
- Preocupación por el **flujo de caja** y por la **carga operativa** que no termina con el horario laboral (WhatsApp “constante”).  
- Aspiración: que el recupero deje de depender de *su* energía emocional.

#### ¿Qué le duele? (esfuerzos / frustraciones)

- Incomodidad de pedir dinero.  
- Mails ignorados y llamadas que generan **evasión**.  
- No hay horas para un plan **personalizado** por deudor.  
- Herramientas manuales y canal desordenado: pierde el hilo de “qué le prometí a quién”.  
- Miedo normativo implícito en los contras de la propuesta: pasarse de frecuencia y ser acusado de **hostigamiento** (eso es riesgo de la *solución* futura; como dolor actual, el equivalente es “si llamo más, empeoro la relación”).

#### ¿Qué le motiva? (resultados)

- Recupero de capital **sin** pelea cara a cara.  
- Acuerdos **claros y documentados**.  
- Sensación de gestión profesional.  
- Tiempo mental liberado para el resto de la administración.  
- Medida de éxito (propuesta, aún no KPI): dinero recuperado y menos desgaste; el modelo de **comisión por éxito** alinea el vendor con esa métrica.

> **TODO:** Completar cuadrantes **¿Qué ve?**, **¿Qué oye?**, **¿Qué dice y hace?** (oferta del mercado, jefes/consorcistas, actitud en público). Completar **Customer Journey Map AS-IS** (doing / thinking / feeling) del ciclo mensual de cobranza y marcar los valles de dolor que el MVP debe atacar.

### 4.5 Deseabilidad, factibilidad, viabilidad (chequeo honesto)

| Pilar | Estado |
| --- | --- |
| Deseabilidad | Narrada con fuerza; **no medida**. |
| Factibilidad | Stack esbozado (SaaS + agente en sandbox). WhatsApp real está **fuera** del MVP simulado. |
| Viabilidad | Tres modelos de cobro; sin números de costo, conversión ni P&L. |

---

## 5. Scope y Arquitectura Tecnológica

### 5.1 Alcance declarado (propuesta)

**Producto comercial (visión):** acceso SaaS: el cliente inicia sesión, carga deudores y el sistema opera la negociación (en la visión, vía WhatsApp corporativo). No instala software ni arma infraestructura.

**MVP académico:** simulación web del chat; sandbox para **entrenar/tunear** el agente y para que usuarios finales **prueben** el comportamiento.

| Ítem de scope | Qué dice la propuesta |
| --- | --- |
| Forma | App web **SaaS multi-tenant** con login para clientes |
| Entidades | Usuarios simulados; **organizaciones** también |
| Agente | Sandbox: el cliente del SaaS lo entrena/ajusta; el usuario final prueba el diálogo |
| Corte de producto | Dos productos: **Agente** y **Plataforma**, separados en concepto y en código para desarrollarlos en paralelo |
| Hosting | Cloudflare (nota de la propuesta: hosting gratuito como opción atractiva) |
| UI | **shadcn** obligatorio para componentes y estilos |
| Rutas | `/` landing; `/app` dashboard; `/app/profile`; `/app/agente` (configuración del agente del cliente) |
| Dashboard | Métricas a extraer de las **conversaciones** (sin lista cerrada) |

**Stack candidato (no cerrado):**

| Capa | Opciones en la propuesta |
| --- | --- |
| Plataforma (front / routing) | React Router **/** Next.js **/** TanStack Router |
| Agente (IA y estado) | AI SDK / Mastra / Pi / Cloudflare Agents |
| Backend de plataforma | *“Algo para el backend”* — no elegido |
| UI | shadcn ([documentación de create](https://ui.shadcn.com/create)) |

> **TODO:** La consigna interna del equipo mencionaba **Supabase**. **No figura** en `TPO - AI Chatbot`. Decidir si Supabase es auth + Postgres + storage del multi-tenant, u otra pieza, y documentarlo.  
> **TODO:** Elegir **una** opción de router (React Router vs Next.js vs TanStack Router) y **una** de runtime de agente.  
> **TODO:** Definir el set de **métricas** del dashboard (la propuesta lo deja explícitamente pendiente).  
> **TODO:** Política anti-alucinación (la propuesta admite el riesgo de ofrecer un descuento inexistente): el MVP ya dice “exclusivamente parámetros preconfigurados”; falta el mecanismo (guardrails, tool calling, rechazo).  
> **TODO:** Riesgo WhatsApp (baneo, hostigamiento) queda **fuera del MVP simulado**, pero debe entrar en el backlog de cumplimiento si se sale del sandbox.

**Seguridad:** en el archivo fuente de la propuesta aparece una **clave de API en texto plano**. No se reproduce aquí. Hay que **rotarla**, sacarla del documento compartido y usar secretos de entorno.

### 5.2 Monorepo propuesto

La arquitectura está estructurada como un monorepo gestionado por `pnpm`. Se dividió en dos aplicaciones bajo `apps/`:

```text
.
├── apps/
│   ├── platform/                 # SaaS (React, Vite, TanStack Router, shadcn)
│   │   ├── src/
│   │   ├── public/
│   │   ├── components.json
│   │   └── package.json
│   └── agent/                    # IA, estado de conversación, sandbox (A definir)
│       └── README.md
├── pnpm-workspace.yaml
├── package.json
└── DOCUMENTACION.md
```

Separar **plataforma** y **agente** es el mecanismo para que dos frentes del equipo avancen sin acoplar el dashboard al runtime de IA.

### 5.3 Relación arquitectura ↔ JTBD

| Job (mínimo) | Dónde vive |
| --- | --- |
| Cargar deuda y reglas | `apps/platform` (`/app`, `/app/agente`) |
| Dialogar y proponer acuerdo dentro de política | `apps/agent` (sandbox) |
| Ver si “sirvió” | `/app` — métricas de conversación (a definir) |

---

## 6. Modelo de Negocios y Comunicación (Pitch)

### 6.1 Cómo se vende el acceso

La propuesta no vende instalación on-prem: vende **cuenta** en la plataforma web. El cliente carga deudores; el sistema opera el resto (visión). Eso es coherente con SaaS B2B de nicho (Clase 02).

### 6.2 Tres modelos de facturación (propuesta)

La propuesta **plantea** tres modelos. No elige uno solo ni publica una lista de precios.

#### A. Suscripción base

- Abono **mensual fijo y accesible**.  
- Cubre: uso de la plataforma, **panel de métricas**, mantenimiento del **número de WhatsApp corporativo**.

| Pros (derivados de lo escrito) | Contras (huecos / tensiones) |
| --- | --- |
| Ingreso predecible para el vendor. | Si el bot “no recupera”, el cliente paga igual → más fricción de venta que la comisión. |
| Encaja con un dashboard permanente. | El WhatsApp corporativo **no está** en el MVP simulado: la suscripción “completa” es visión, no el prototipo. |
| “Accesible” baja la barrera. | No hay monto. |

#### B. Comisión por éxito

- **3% o 5%** (ejemplo de la propuesta) **solo** sobre el dinero que la IA **recupera**.  
- La propuesta lo llama **verdadera ventaja competitiva**: el cliente asume **riesgo bajísimo** porque paga si hay capital recuperado.

| Pros | Contras |
| --- | --- |
| Alineado al job (caja recuperada). | Ingreso variable; depende de mora, mix de deudores y calidad del agente. |
| Facilita el pitch comercial. | Hay que definir qué cuenta como “recuperado” (promesa vs. pago efectivo). |
| | Riesgo de disputa si el acuerdo se cierra y el dinero no entra. |

#### C. Pago por uso mediante créditos

- Solo el título está en la propuesta.

> **TODO:** Especificar unidad de crédito (mensaje, conversación, deudor contactado, token de modelo), pack, vencimiento y si convive con A+B o es alternativa.

#### Lectura de producto (pros/contras **del sistema**, no del pricing)

La propuesta lista ventajas y riesgos del **servicio**, útiles para el slide de negocio y para no vender magia:

**Pros:** escalabilidad (muchas cobranzas sin headcount extra); menos fricción humana al cobrar; acuerdos **trazables por escrito**.  
**Contras:** riesgo normativo (horarios/frecuencia → hostigamiento); **alucinaciones** (descuento que no existe); dependencia de **WhatsApp** (reportes → baneo).

> **TODO (Plan de negocio Clase 01 / roadmap):** Business Model Canvas, costos (P&L) y decisión de **mix** (¿A+B, A+C?). Sin eso, “viabilidad” de la Clase 04 queda incompleta.

### 6.3 Elevator pitch (Clase 05)

La Clase 05: si te cruzás a un inversor en un ascensor, tenés **~20 segundos**. Un pitch no empieza con “hemos construido…”, sino con el **dolor**. El **Método Tony Robbins** (clave 2 y 5) pide: **dolor → empatía → solución como alivio → impacto real + pedido concreto**. No abrir con el stack.

**Borrador (~20 s, sin marca):**

> ¿Te tocó cerrar el mes persiguiendo uno por uno a quien no pagó, con mails que nadie contesta y llamadas que tensan al vecino o a la familia del colegio? Ese desgaste no es un detalle: se come el tiempo, la relación y la caja. Nosotros estamos construyendo un asistente autónomo de cobranzas B2B: el administrador carga la deuda y las reglas que sí puede ofrecer; el diálogo propone un acuerdo **dentro de esa política**, por escrito. El MVP valida esa negociación en un chat simulado, antes de WhatsApp real. El impacto que buscamos es más recupero con menos pelea. El pedido: **quince minutos** con un administrador de 5+ edificios para probar una mora de prueba.

**Mapeo al método:**

| Paso | En el texto |
| --- | --- |
| Dolor | Perseguir uno a uno; mails ignorados; llamadas que tensan. |
| Empatía | “Se come el tiempo, la relación y la caja.” |
| Solución | Deuda + reglas + acuerdo dentro de política (asistente autónomo de cobranzas B2B). |
| Impacto real | Más recupero, menos pelea; validación en sandbox. |
| Petición concreta | Reunión de 15 minutos / prueba con una mora. |

Apoyos de oratoria (Clase 05), para cuando se *diga* este texto: visualizar el cierre antes de subir; cuerpo abierto; una idea por frase; cero jerga (`multi-tenant`, `LLM`) en el ascensor; el **conflicto** del storytelling es el administrador entre la caja y el vínculo humano.

> **TODO:** Ensayar en voz alta y recortar a 20 segundos reales. Completar slide 1 del Pitch Deck (Clase 05) con este texto; el deck de 10 slides (problema, solución, mercado, competencia, marketing, negocio, roadmap, equipo, inversión) **no está** en la propuesta.

---

## 7. Proceso de Ideación, Releases y Roadmap del Producto

### 7.1 Reglas de ideación y pensamiento divergente (Clase 06)

La Clase 06 profundiza la fase de **Idear (Explorar)** del Design Thinking bajo una consigna metafórica: **“¿Osos, helicópteros y miel?”**. Esta dinámica sintetiza el principio de **pensamiento lateral y recombinación**: las soluciones innovadoras rara vez surgen de la nada absoluta; suelen provenir de combinar elementos preexistentes de dominios dispares (anclaje directo con la *Paradoja de la Maleta* vista en §3.2).

La cátedra fija reglas explícitas para gobernar las sesiones de ideación del equipo de ingeniería:

1. **No juzgar cantidad sobre calidad:** Maximizar el volumen inicial de propuestas sin censura previa.
2. **Fomentar ideas locas / extremas:** Romper el marco convencional de la cobranza punitiva tradicional (por ejemplo: negociación con personalidades empáticas variables, subastas inversas de plazos de pago, acuerdos dinámicos gamificados).
3. **Construir sobre las ideas de otros:** Recombinación colaborativa en lugar de competencia de autoría.
4. **Permanecer enfocado en el problema:** No extraviar el objetivo nuclear definido en §1.2 (el dolor del administrador ante el recupero de mora y la fricción vincular).
5. **Una conversación a la vez:** Disciplina de debate grupal sin solapamientos.
6. **Dibujar también es una opción:** Storyboards y diagramas visuales de flujo de usuario antes de tocar código.
7. **No hablar de componentes y funcionalidades de forma prematura:** Evitar el vicio ingenieril de discutir bases de datos, endpoints o bibliotecas en pleno proceso creativo.
8. **No necesitamos detalle minucioso al inicio:** Privilegiar la conceptualización amplia y la interacción global.
9. **Uso sistemático de analogías:** Concebir al asistente como un *“mediador conciliador extrajudicial de faltas vecinales disponible las 24 horas”*.

> **Premisa rectora de la clase:** *“No hay ideas que estén bien o mal, solo hay ideas. Se pueden encontrar soluciones a partir de cosas que ya existen y que no son nuevas.”*

### 7.2 Grilla de priorización y narrativa de la solución (Entregable Clase 06)

Para convertir la divergencia creativa en un plan factible de ejecución, la Clase 06 exige dos herramientas: la **Grilla de Priorización** y la **Narrativa de la Propuesta de Solución**.

#### Grilla de Priorización (Impacto vs. Esfuerzo)

| Nivel de Esfuerzo | Alto Impacto | Bajo Impacto |
| --- | --- | --- |
| **Bajo Esfuerzo** | **CUADRANTE I: Quick Wins (Corazón del MVP)**<br>• Chatbot web simulado en lenguaje natural.<br>• Módulo de reglas básicas fijas (tope de cuotas y quita condicional de punitorios).<br>• Carga unificada de deudor y monto adeudado.<br>• Resumen formal y acta de acuerdo trazable por escrito. | **CUADRANTE III: Rellenos / Tareas Menores**<br>• Configuración de tema visual (modo oscuro/claro).<br>• Descarga de acuerdos en PDF decorado.<br>• Mensaje predefinido de bienvenida configurable. |
| **Alto Esfuerzo** | **CUADRANTE II: Proyectos Estratégicos (Roadmap Releases 2 y 3)**<br>• Conexión oficial a Meta Cloud API (WhatsApp Business multi-tenant).<br>• Generación dinámica de links de pago bancarios / fintech (Mercado Pago, MODO).<br>• Sincronización bidireccional vía API con ERPs de consorcios y colegios.<br>• Motor predictivo de propensión al pago y guardrails anti-alucinación robustos. | **CUADRANTE IV: Tareas a Descartar (Trampas)**<br>• Bot de llamadas telefónicas automáticas por voz sintetizada (genera rechazo psicológico severo y hostigamiento).<br>• Desarrollo de un sistema de facturación o ERP propio de expensas (cae en la lista negra de la cátedra).<br>• Motor de scoring crediticio complejo con machine learning propietario. |

#### Narrativa de la Propuesta de Solución

> El administrador de consorcios y el directivo de colegio conviven mensualmente con una tarea ingrata: llamar o enviar cartas a vecinos y familias que atraviesan dificultades económicas para reclamar el pago de expensas o cuotas vencidas. Esta interacción desgasta el vínculo comunitario, insume decenas de horas de discusiones infructuosas y paraliza el flujo de caja operativo.  
>  
> Nuestra propuesta de solución introduce un **asistente autónomo de cobranzas B2B**: un intermediario digital neutral que se contacta con el deudor a través de mensajería instantánea en un entorno privado, empático y respetuoso. El acreedor define previamente las políticas de flexibilidad aceptables (porcentaje máximo de quita de punitorios, cantidad admisible de cuotas y plazos de compromiso). El asistente dialoga en lenguaje natural, escucha la justificación o excusa del deudor y formula contrapropuestas estructuradas exclusivamente dentro de los parámetros autorizados. Una vez alcanzado el acuerdo, emite un compromiso documentado con enlace de pago. El administrador recupera liquidez y trazabilidad sin exponerse a la confrontación interpersonal, transformando un conflicto mensual en un proceso de concertación predecible y automatizado.

### 7.3 Evolución por Releases: Del MVP al producto integral (Clase 06)

La Clase 06 conceptualiza el ciclo de vida del producto más allá del entregable inicial:
- **Release 1 (MVP):** La versión más elemental posible para validar si el deudor está dispuesto a negociar con un asistente y si los acuerdos se mantienen dentro de la política sin alucinaciones.
- **Release $N$:** Versiones incrementales que incorporan capas de automatización, canales reales y reportería estratégica, articuladas en un **Product Roadmap**.

```text
┌────────────────────────────────┐       ┌────────────────────────────────┐       ┌────────────────────────────────┐
│      RELEASE 1 (MVP)           │  ──>  │      RELEASE 2                 │  ──>  │      RELEASE 3                 │
│      Validación en Sandbox     │       │      Operación Real            │       │      Escala & Ecosistema       │
├────────────────────────────────┤       ├────────────────────────────────┤       ├────────────────────────────────┤
│ • Interfaz web simulada.       │       │ • WhatsApp Business API real.  │       │ • Integración con ERPs.        │
│ • Carga manual de parámetros.  │       │ • Importación Excel/CSV.       │       │ • Conciliación bancaria auto.  │
│ • Diálogo de negociación IA.   │       │ • Multi-tenancy por cliente.   │       │ • Dashboard predictivo mora.   │
│ • Acta de acuerdo en texto.    │       │ • Botón/Link de pago integrado.│       │ • Re-negociación ante mora N2. │
└────────────────────────────────┘       └────────────────────────────────┘       └────────────────────────────────┘
```

| Dimensión de producto | Release 1 (MVP Cuatrimestral) | Release 2 (Producto Comercial Inicial) | Release 3 (Ecosistema Integrado) |
| --- | --- | --- | --- |
| **Canal de interacción** | Prototipo web interactivo que simula chat de WhatsApp. | WhatsApp Cloud API oficial con número corporativo verificado. | Canales omnicanal unificados (WhatsApp, Webchat institucional, SMS fallback). |
| **Gestión de datos** | Carga manual en formulario de una deuda y sus políticas. | Carga masiva por archivo Excel/CSV y asignación por carteras. | Sincronización automática bidireccional vía webhooks/API con el sistema contable. |
| **Negociación** | Reglas rígidas de cuotas y quitas fijadas en el prompt/política. | Matriz condicional según antigüedad de mora y comportamiento histórico. | Ajuste dinámico de ofertas según perfil de pago y scoring de cobranza. |
| **Cierre y cobro** | Emisión de resumen de acuerdo textual con fecha de compromiso. | Generación dinámica de link de pago (Mercado Pago / pasarela fintech). | Conciliación automática de acreditación bancaria y libramiento de libre deuda. |
| **Arquitectura** | Frontend web + sandbox de IA desacoplado. | SaaS multi-inquilino (Supabase auth + DB Postgres) y colas de mensajes. | Infraestructura distribuida de alta disponibilidad con analítica de datos agregada. |

### 7.4 Product Roadmap visual y puntos estratégicos (Caso Uber, Clase 06)

La Clase 06 ilustra cómo productos líderes mundiales nacieron de un MVP hiper-enfocado y estructuraron su crecimiento mediante un **Timeline Roadmap**:
- *Caso Uber (Clase 06):* Inició en San Francisco en 2010 como **UberCab** (MVP: una app para pedir un auto negro privado mediante un botón), continuó en 2012 con **UberX** (baja de costos y masificación), siguió con **UberPool** (carpooling para capturar usuarios sensibles al precio), y evolucionó hacia pruebas de vehículos autónomos, **UberMoto**, **Uber Freight** y **Uber Auto**. Ninguna de esas variantes existía en el Release 1.

Siguiendo esta metodología, el Roadmap visual del proyecto se estructura en hitos estratégicos temporales:

```text
HITO 1 (Meses 1-2)          HITO 2 (Meses 3-4)          HITO 3 (Meses 5-7)          HITO 4 (Meses 8-10)         HITO 5 (Meses 11-12)
      ●───────────────────────────●───────────────────────────●───────────────────────────●───────────────────────────●
   RESEARCH &                 PILOTO DE                   RELEASE 2                   COBRO &                     INTEGRACIÓN
   MVP SANDBOX                VALIDACIÓN                  WHATSAPP B2B                CONCILIACIÓN                CON ERPs
• Encuesta 400 casos.      • Pruebas con 5             • Conexión Meta Cloud API.  • Integración pasarelas.    • Conexión APIs a
• Entrevistas a target.      administradores reales.   • Onboarding multi-tenant.  • Comisión por éxito        sistemas de expensas
• Prototipo web de         • Evaluación de desvíos     • Carga masiva de mora        operativa (3%-5%).          (ConsorcioAbierto, etc.).
  negociación IA.            y alucinaciones.            desde planillas.          • Conciliación bancaria.    • Reportería macro.
```

> **TODO (Entregable Clase 06):** Formalizar con el equipo la versión final de la Grilla de Priorización y el Timeline Roadmap gráfico para el pitch y la entrega de hitos del proyecto.

---

## 8. Estrategia del Océano Azul (Kim & Mauborgne / INSEAD)

### 8.1 Diagnóstico de Océano Rojo en Cobranzas y el Salto al Océano Azul

El mercado actual de cobranzas y gestión de mora se comporta como un **Océano Rojo arquetípico** (Clase 06 y Cap. 1 INSEAD):
- **Espacio saturado y sangriento:** Empresas de cobranza extrajudicial y estudios jurídicos compiten encarnizadamente mediante llamadas reiterativas, intimidación y cartas documento.
- **Rivalidad destructiva:** La competencia se basa en “pisar cabezas” y cobrar comisiones leoninas (20% al 35% del recupero) que terminan perjudicando tanto al deudor como a la institución acreedora.
- **Oferta commoditizada y pasiva:** Los sistemas de software administrativo de consorcios y colegios se limitan a emitir una liquidación mensual con el saldo adeudado, sin ofrecer ninguna capacidad activa de negociación.
- **Resultado en el mercado:** Deudores que bloquean llamadas de números desconocidos, administradores agotados psicológicamente y carteras de mora que se vuelven incobrables por falta de un canal civilizado de acuerdo.

El presente proyecto ejecuta el **salto hacia un Océano Azul**:
- **Creación de un espacio de mercado incontestado:** No se disputa el territorio de los juicios ejecutivos ni el de los call-centers coercitivos. Se crea una categoría inédita: **la concertación autónoma y asistida de compromisos de pago en lenguaje natural**.
- **Hacer irrelevante a la competencia:** Al ofrecer una vía empática, discreta y disponible las 24 horas, el deudor elige resolver su deuda voluntariamente antes de que el conflicto escale a instancias legales.
- **Fundamento estadístico del valor (Kim & Mauborgne):** El estudio de 108 lanzamientos empresariales a lo largo de 100 años demuestra que los océanos azules representan solo el **14% de las iniciativas**, pero generan el **38% de los ingresos** y el **61% de los beneficios netos**.

> **Principio de partida (INSEAD):** *“La única forma de vencer a la competencia es dejar de intentar vencer a la competencia.”*

```text
       OCÉANO ROJO (Cobranza Tradicional)                     OCÉANO AZUL (Asistente Autónomo B2B)
┌───────────────────────────────────────────────────┐       ┌───────────────────────────────────────────────────┐
│ • Competir en el mercado saturado de call centers.│  ==>  │ • Crear un espacio nuevo de mediación por chat.   │
│ • Batir a rivales bajando comisiones o gritando.  │       │ • Hacer irrelevante la cobranza hostil.           │
│ • Explotar la demanda existente (mora judicial).  │       │ • Generar demanda nueva en mora temprana y media. │
│ • Elegir entre alto costo humano o nula atención. │       │ • Romper el trade-off: Diferenciación + Bajo Costo│
└───────────────────────────────────────────────────┘       └───────────────────────────────────────────────────┘
```

### 8.2 Unidad de análisis y los Cuatro Grandes Debates académicos aplicados

La obra de Kim y Mauborgne (INSEAD) establece que la unidad adecuada de análisis estratégico no es la empresa ni la industria, sino el **Movimiento Estratégico (Strategic Move)**: el conjunto de decisiones operativas y de producto que transforman la propuesta de valor y abren un mercado.

Este marco teórico plantea cuatro debates académicos fundamentales, que se resuelven concretamente en nuestro proyecto:

```text
┌─────────────────────────┬───────────────────────────────┬──────────────────────────────────────────┐
│ Debate Académico        │ Posición Tradicional / Rival  │ Resolución en Nuestro Asistente B2B      │
├─────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 1. ¿Competir mejor o    │ Porter: Buscar posicionamiento│ No intentamos hacer llamadas de cobranza │
│    crear mercados?      │ defensivo dentro de la        │ más baratas; creamos un canal            │
│                         │ industria existente.          │ conversacional que antes no existía.     │
├─────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 2. ¿Tecnología pura o   │ Foco en modelos técnicos      │ El LLM o agente de IA es solo el medio.  │
│    innovación de valor? │ complejos sin adopción masiva.│ La innovación radica en que el usuario   │
│                         │                               │ percibe alivio y un acuerdo viable.      │
├─────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 3. ¿Ser el primero o    │ Obsesión por ser First Mover  │ Reinvención centrada en el usuario:      │
│    hacerlo mejor?       │ a cualquier costo.            │ dominar la trazabilidad y la política de │
│                         │                               │ cobro supera a la velocidad ciega.       │
├─────────────────────────┼───────────────────────────────┼──────────────────────────────────────────┤
│ 4. ¿Destrucción o       │ Schumpeter: Destrucción       │ Creación No Destructiva: se acopla a las │
│    creación no          │ creativa (reemplazar industrias│ administraciones y colegios sin destruir │
│    destructiva?         │ completas).                   │ su estructura contable existente.        │
└─────────────────────────┴───────────────────────────────┴──────────────────────────────────────────┘
```

1. **Debate 1: ¿Competir mejor o crear mercados? (Porter vs. Kim & Mauborgne):** Michael Porter plantea que la ventaja nace de posicionarse dentro de una industria dada. En cobranzas, eso significaría poner un call center más eficiente. La propuesta del Océano Azul postula crear un espacio donde la competencia no existe: la autogestión de acuerdos mediante IA.
2. **Debate 2: ¿Innovación tecnológica o innovación de valor?:** Como señalan los casos *NetJets* (fraccionamiento de jets) y *Curves* (fitness femenino simplificado), los océanos azules pueden construirse sin tecnología disruptiva. En nuestro proyecto, el valor no radica en "usar un modelo de 70B parámetros", sino en la **Innovación de Valor**: Diferenciación (diálogo empático, 24/7, sin fricción vecinal) + Bajo Costo (costo marginal de inferencia casi nulo por deudor), aplicando una estrategia de "y-y" que rompe el dilema clásico.
3. **Debate 3: ¿Ser el primero o hacerlo bien?:** Caso *Apple* (no inventó el MP3 ni el smartphone, los perfeccionó alrededor de la usabilidad). El proyecto no pretende inventar el concepto de chatbot, sino estructurar un entorno cerrado y seguro donde una negociación de deuda no alucine y produzca un acuerdo vinculante.
4. **Debate 4: ¿Destrucción creativa o creación no destructiva?:** El caso del *Cirque du Soleil* demostró que se puede generar un océano multimillonario sin destruir el circo tradicional ni el teatro. Nuestro producto no pretende aniquilar a las administraciones de consorcios ni a sus sistemas ERP; al contrario, complementa su operatoria absorbiendo el segmento más ingrato del trabajo.

### 8.3 Los Seis Caminos para Reconstruir Fronteras de Mercado (Cap. 3 INSEAD)

La formulación sistemática del Océano Azul no es fruto de la inspiración fortuita, sino de la exploración metódica de seis trayectorias:

1. **Camino 1: Explorar industrias alternativas:**  
   *Pregunta:* ¿A qué recurren hoy los administradores si no cobran? O recurren a abogados (onerosos, lentos, hostiles) o abandonan la deuda considerándola incobrable. Nuestro producto ofrece una alternativa intermedia: negociación asistida con costo de software B2B.
2. **Camino 2: Explorar grupos estratégicos dentro del sector:**  
   *Pregunta:* ¿Qué extremos conviven en el mercado? Por un lado, sistemas ERP administrativos de costo medio pero totalmente pasivos; por el otro, estudios de cobranza de alto costo y altísima agresividad. El proyecto se ubica en el centro desatendido: automatización activa sin agresividad.
3. **Camino 3: Reexplorar la cadena de compradores:**  
   *Pregunta:* ¿Quién decide, quién paga y quién usa? En consorcios, el administrador decide la contratación, el consorcio paga la plataforma/comisión, pero el usuario que interactúa es el deudor moroso. La cobranza tradicional trata al deudor como un enemigo; nuestra solución lo trata como un usuario con una necesidad de refinanciación digna y confidencial.
4. **Camino 4: Analizar ofertas de productos y servicios complementarios:**  
   *Pregunta:* ¿Qué ocurre antes, durante y después del cobro? La mora involucra reclamo, discusión sobre punitorios, acuerdo y posterior acreditación bancaria. El asistente integra la condonación parametrizada de intereses y la emisión de enlaces de pago en el mismo hilo conversacional.
5. **Camino 5: Invertir la orientación funcional / emocional:**  
   *Pregunta:* ¿Cómo transformar la carga emocional de la industria? La cobranza ha sido históricamente una experiencia traumática y emocionalmente cargada (vergüenza, enojo, tensión entre vecinos). El asistente despersonaliza el reclamo, convirtiéndolo en un trámite funcional, discreto, objetivo y libre de juicios de valor.
6. **Camino 6: Explorar la dimensión temporal (tendencias irreversibles):**  
   *Pregunta:* ¿Qué macrotendencias redefinen la interacción? La preferencia unánime de los usuarios por la mensajería asincrónica (WhatsApp) sobre las llamadas telefónicas de voz, y la masificación de los pagos inmediatos digitales.

### 8.4 Benchmarking Competitivo y Curva de Valor (Lienzo Estratégico)

El **Lienzo Estratégico (Strategy Canvas)** es la herramienta de diagnóstico visual que permite graficar la curva de valor del producto contra las alternativas existentes del mercado, identificando las convergencias del océano rojo y proyectando la divergencia hacia el "espacio blanco" (Clase 06 y Cap. 2 INSEAD).

#### Factores de Competencia de la Industria (Eje X)

1. **Costo fijo de contratación y mantenimiento:** Inversión mensual o setup requerido.
2. **Fricción interpersonal y hostigamiento:** Nivel de conflicto, incomodidad social o agresividad.
3. **Personalización y flexibilidad del acuerdo:** Capacidad de adaptarse a la situación económica de cada deudor.
4. **Disponibilidad y cobertura 24/7:** Horarios y canales de atención accesibles.
5. **Trazabilidad y formalización del acuerdo:** Generación de constancias y registros auditables por escrito.
6. **Dedicación operativa humana:** Carga de trabajo y tiempo requerido por el personal de la institución.
7. **Tasa de respuesta efectiva del moroso:** Disposición del deudor a atender y dialogar.

#### Matriz de Evaluación del Lienzo Estratégico

| Factor Competitivo (Eje X) | 1. Gestión Manual (Teléfono/WhatsApp propio) | 2. Agencias de Cobranza Tradicionales | 3. ERPs y Software de Consorcios/Colegios | 4. NUESTRA SOLUCIÓN (Asistente Autónomo B2B) |
| --- | :---: | :---: | :---: | :---: |
| **Costo fijo de adopción** | Bajo (tiempo propio) | Alto (abono o comisiones 25-35%) | Medio (abono mensual por unidad) | **Bajo (SaaS accesible / freemium MVP)** |
| **Fricción interpersonal** | **Muy Alto (5/5)** | **Muy Alto (5/5)** | Nulo (1/5) (pasivo) | **Bajo (1/5) (mediación neutral)** |
| **Flexibilidad de negociación** | Alta (artesanal) | Baja (2/5) (planes rígidos de agencia) | Nula (1/5) (no negocia) | **Muy Alta (5/5) (reglas dinámicas)** |
| **Disponibilidad 24/7** | Baja (1/5) (horario de oficina) | Media (2/5) (horario de call center) | Alta (4/5) (portal estático) | **Máxima (5/5) (inmediata en WhatsApp)** |
| **Trazabilidad documental** | Pobre (1/5) (acuerdos de palabra) | Media (3/5) (reportes mensuales) | Nula (1/5) | **Máxima (5/5) (acta digital auditable)** |
| **Carga operativa humana** | **Crítica (5/5)** | Baja (2/5) (se delega) | Baja (2/5) | **Mínima (1/5) (solo parametriza)** |
| **Tasa de respuesta del deudor**| Pobre (2/5) (evasión vecinal) | Pésima (1/5) (bloqueo por spam) | Casi nula (1/5) (mail masivo ignorado)| **Muy Alta (4.5/5) (diálogo sin presión)** |

#### Lectura del Espacio Blanco

Las soluciones existentes presentan curvas convergentes y contradictorias: o bien exigen una carga humana extenuante con alta fricción social (Gestión Manual), o tercerizan a costa de comisiones usureras y hostigamiento destructivo (Agencias), o carecen por completo de capacidad negociadora (ERPs).  
El **espacio blanco** que conquista nuestro Asistente B2B se localiza en el cuadrante superior derecho: **negociación hiper-personalizada y disponible las 24 horas con mínima dedicación operativa humana y cero fricción social**.

```text
Nivel de Oferta
  Alto ^                                        ● Asistente B2B
       │                                     ●
       │                       ▲ Agencias ●
  Medio│      ■ ERPs        ▲            
       │   ◆ Manual      ■
       │◆             ▲
  Bajo └───┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────>
        Costo Fijo    Fricción      Flexibilidad  Disponibilidad Trazabilidad  Carga Humana   Factores
```

### 8.5 Esquema de las Cuatro Acciones: Matriz ERIC para el Proyecto

La **Matriz ERIC (Eliminar, Reducir, Incrementar y Crear)** traduce el lienzo estratégico en acciones operativas concretas (Clase 06 y Cap. 2 INSEAD):

```text
┌───────────────────────────────────────────────┬───────────────────────────────────────────────┐
│                   ELIMINAR                    │                  INCREMENTAR                  │
│   ¿Qué variables la industria da por          │   ¿Qué variables deben elevarse muy por       │
│   sentadas pero destruyen valor?              │   encima del estándar de la industria?        │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ • Llamadas telefónicas incómodas de cobranza. │ • Tasa de respuesta e interacción del deudor. │
│ • Confrontación vecinal directa cara a cara.  │ • Flexibilidad y personalización de planes de │
│ • Cartas documento e intimaciones genéricas.  │   pago según parámetros de la institución.    │
│ • Intervención humana manual en mora temprana.│ • Trazabilidad y formalización de acuerdos.   │
│ • Amenazas y tácticas coercitivas agresivas.  │ • Velocidad y certidumbre del flujo de caja.  │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│                   REDUCIR                     │                    CREAR                      │
│   ¿Qué variables deben reducirse muy por      │   ¿Qué factores nunca se han ofrecido y       │
│   debajo del estándar de la industria?        │   generan un nuevo espacio de mercado?        │
├───────────────────────────────────────────────┼───────────────────────────────────────────────┤
│ • Tiempo de ciclo de recupero de la deuda.    │ • Negociación asistida 24/7 en lenguaje       │
│ • Horas-hombre consumidas por mes en cobro.   │   natural mediante IA conversacional.         │
│ • Fricción y deterioro vincular comunitario.  │ • Sandbox interactivo para parametrizar y     │
│ • Costo fijo de comisiones e intermediarios.  │   testear reglas antes de salir a producción. │
│ • Desgaste emocional y estrés del acreedor.   │ • Mediación imparcial que protege la imagen   │
│                                               │   y reputación del colegio o consorcio.       │
│                                               │ • Tablero de causas reales de mora ciudadana. │
└───────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

- **Impacto estructural en costos y valor:**
  - **Eliminar y Reducir** derrumban el costo operativo, suprimen la necesidad de call-centers y terminan con el costo reputacional del conflicto.
  - **Incrementar y Crear** disparan el valor percibido por el administrador (recupero pacífico) y por el moroso (salida digna de la deuda).

### 8.6 Criterios de Calidad de una Estrategia Eficaz

Kim y Mauborgne definen tres pruebas de fuego para convalidar que una curva de valor realmente pertenece a un Océano Azul (Cap. 2 INSEAD):

1. **Enfoque (Focus):** La propuesta no intenta ser un ERP administrativo, ni un sistema de reservas, ni una red social vecinal. Concentra todos sus recursos en un único punto neurálgico: **la mediación y concertación de compromisos de deuda bajo reglas**.
2. **Divergencia (Divergence):** Su curva gráfica no corre paralela a la de los estudios jurídicos ni a la de los softwares contables; traza un perfil único que despega en personalización, inmediatez y cuidado de la reputación.
3. **Lema contundente (Compelling Tagline):** Una consigna clara, memorable y fiel a la propuesta:
   > *“Cobranzas sin fricción: recuperá tu capital por WhatsApp, cuidando la relación y sin hacer una sola llamada.”*

### 8.7 Cartera del Futuro: Matriz Pioneros, Migradores y Colonos (PMC)

La herramienta de cartera de Kim y Mauborgne (Cap. 4 INSEAD) permite auditar la salud estratégica del catálogo tecnológico de una organización:
- **Colonos (Settlers):** Productos convencionales en océanos rojos, con márgenes en declive y nula innovación (por ejemplo: los módulos tradicionales de emisión de boletas de expensas o cuotas escolares).
- **Migradores (Migrators):** Mejoras incrementales que compiten por calidad o costo pero dentro de las mismas reglas (por ejemplo: enviar el PDF de la expensa por mail con un botón genérico de pago).
- **Pioneros (Pioneers):** Ofertas de innovación de valor con curvas divergentes que representan las fuentes de crecimiento futuro masivo.

En la propuesta de valor del equipo, el **Asistente Autónomo de Cobranzas** se ubica nítidamente en la categoría de **Pionero**, aportando una solución rupturista que convierte una actividad improductiva y costosa en una ventaja competitiva automatizada.

### 8.8 Exploración de la Demanda: Los Tres Niveles de No Clientes (Cap. 5 INSEAD)

Para evitar la trampa de competir por los clientes habituales de las agencias de cobro, la estrategia del Océano Azul examina los **tres círculos concéntricos de no clientes**:

```text
                      ┌───────────────────────────────────────────────┐
                      │ NIVEL 3: NO CLIENTES INEXPLORADOS             │
                      │ Pequeños consorcios autogestionados y clubes  │
                      │ barriales que nunca consideraron cobrar mora. │
                      │  ┌─────────────────────────────────────────┐  │
                      │  │ NIVEL 2: NO CLIENTES RECHAZADORES       │  │
                      │  │ Colegios e instituciones que rehúsan    │  │
                      │  │ agencias por miedo al daño vincular.    │  │
                      │  │  ┌───────────────────────────────────┐  │  │
                      │  │  │ NIVEL 1: NO CLIENTES PRÓXIMOS     │  │  │
                      │  │  │ Administradores al borde del      │  │  │
                      │  │  │ colapso por cobro manual en chat. │  │  │
                      │  │  └───────────────────────────────────┘  │  │
                      │  └─────────────────────────────────────────┘  │
                      └───────────────────────────────────────────────┘
```

1. **Nivel 1: "A punto de ser" (Soon-to-be):**  
   Administradores de 5 a 10 edificios que hoy gestionan el cobro con su propio teléfono móvil y planillas Excel. Están saturados por el crecimiento de la mora y evalúan abandonar el reclamo personal, pero no tienen presupuesto para contratar personal administrativo extra. Están listos para adoptar una solución digital en cuanto se les demuestre simplicidad.
2. **Nivel 2: "Rechazadores conscientes" (Refusing):**  
   Directivos de colegios privados y administraciones de consorcios de alto perfil que conocen la existencia de empresas de cobranza externa pero **se niegan explícitamente a contratarlas** porque temen que las amenazas o los llamados agresivos destruyan la convivencia comunitaria, provoquen desmatriculaciones o generen juicios por hostigamiento. El asistente autónomo captura a este segmento masivo ofreciéndoles un canal neutral y controlado.
3. **Nivel 3: "Inexplorados" (Unexplored):**  
   Consorcios chicos autogestionados por vecinos, cooperativas de vivienda, asociaciones profesionales y clubes de barrio. Históricamente fueron marginados por el mercado de recupero crediticio por considerarlos cuentas "no rentables". La arquitectura de software B2B multi-inquilino de costo marginal cero permite atender este mercado virgen de forma altamente lucrativa.

### 8.9 Secuencia Estratégica Correcta e Índice de Viabilidad (BOI)

Kim y Mauborgne determinan que una idea de Océano Azul debe superar cuatro filtros secuenciales antes de pasar a la ejecución (Cap. 6 INSEAD):

```text
[ 1. Utilidad Excepcional ] ──> [ 2. Precio Estratégico ] ──> [ 3. Costo Objetivo ] ──> [ 4. Neutralizar Adopción ]
        ¿Por qué lo                   ¿Es accesible                 ¿Es rentable el              ¿Qué resistencias
       adoptarían?                     a la masa?                   modelo de costo?             internas frenan?
```

1. **Utilidad excepcional para el comprador:**  
   Elimina los mayores bloqueos de conveniencia y tranquilidad: el administrador se desliga de la discusión desagradable de dinero; el deudor experimenta una conversación confidencial sin ser juzgado moralmente.
2. **Precio estratégico accesible:**  
   Estructurado a través de una comisión por éxito (3% a 5% del recupero) o abono base mínimo mensual. Al cobrar sobre resultado positivo, se reduce la barrera de entrada a cero.
3. **Costo objetivo (Target Costing):**  
   El costo de operación está apalancado en infraestructura serverless (Cloudflare Workers / páginas estáticas) y llamadas optimizadas a APIs de LLM con prompts compactos y guardrails específicos. El costo por diálogo es de centavos de dólar frente a recuperos de decenas o cientos de miles de pesos.
4. **Neutralización de barreras de adopción:**  
   - *Temor del acreedor a errores de la IA:* Se neutraliza mediante el sandbox donde el administrador valida el comportamiento y define límites infranqueables de cuotas y quitas.
   - *Desconfianza del deudor:* Se mitiga mediante links de pago oficiales y trazabilidad documental de libre deuda.

### 8.10 De la Formulación a la Ejecución: Liderazgo en el Punto de Inflexión (Cap. 7 INSEAD)

Las mejores estrategias fracasan si chocan contra obstáculos organizacionales en la ejecución. La cátedra rescata la doctrina del **Liderazgo en el Punto de Inflexión (Tipping Point Leadership)** aplicada por Bill Bratton en el NYPD: en lugar de dispersar esfuerzos, concentrar recursos en los puntos de inflexión crítica.

```text
┌──────────────────────────┬───────────────────────────────────────────┬──────────────────────────────────────────┐
│ Obstáculo Organizacional │ Diagnóstico en el Proyecto de Cobranzas   │ Palanca de Inflexión Estratégica         │
├──────────────────────────┼───────────────────────────────────────────┼──────────────────────────────────────────┤
│ 1. Cognitivo             │ Administradores aferrados al statu quo:   │ Ponerlos cara a cara con la experiencia: │
│    (Negación del cambio) │ “La gente solo paga si le grito por tel”. │ Que usen el sandbox web y vean negociar  │
│                          │                                           │ al asistente con objeciones reales.      │
├──────────────────────────┼───────────────────────────────────────────┼──────────────────────────────────────────┤
│ 2. De Recursos           │ Equipos con tiempo y presupuesto acotados │ Concentración en "Puntos Calientes":     │
│    (Falta de capacidad)  │ para implementar software nuevo.          │ Enfocar el bot en los 7 días posteriores │
│                          │                                           │ al 2do vencimiento de la expensa/cuota.  │
├──────────────────────────┼───────────────────────────────────────────┼──────────────────────────────────────────┤
│ 3. Motivacional          │ Personal administrativo desmotivado ante  │ Movilizar a los "Peces Gordos":          │
│    (Falta de compromiso) │ el cobro manual que boicotea sistemas.    │ Demostrar que el asistente les quita la  │
│                          │                                           │ tarea más odiada del mes laboral.        │
├──────────────────────────┼───────────────────────────────────────────┼──────────────────────────────────────────┤
│ 4. Político              │ Fricción de abogados o gestores que temen │ Aislar a los detractores y sumar         │
│    (Intereses internos)  │ perder honorarios por acuerdos tempranos. │ "Ángeles": Demostrar que el bot filtra   │
│                          │                                           │ mora blanda y les deja la mora judicial. │
└──────────────────────────┴───────────────────────────────────────────┴──────────────────────────────────────────┘
```

### 8.11 Cultura y Proceso Justo (Procedural Justice, Cap. 8 INSEAD)

La implementación exitosa del sistema exige construir confianza mediante el **Proceso Justo** en sus tres pilares (caso Elco):
1. **Participación:** Involucrar a los administradores en el diseño de los parámetros de negociación (permitirles decidir topes de cuotas, plazos de gracia y porcentaje de condonación de intereses).
2. **Explicación:** Comunicar con total claridad al usuario administrador por qué el modelo propuso determinado plan de pago y cómo se interpretaron las respuestas del deudor.
3. **Claridad de expectativas:** Fijar reglas inequívocas: el deudor sabe exactamente qué sucederá si cumple las cuotas pactadas (emisión de libre deuda) y qué ocurrirá si incumple (derivación a instancia formal).

### 8.12 Coherencia Sistémica y Barreras a la Imitación (Caps. 9 y 10 INSEAD)

#### Alineación de las Tres Proposiciones (Cap. 9)

Una estrategia de Océano Azul es sostenible únicamente si alinea en un sistema armónico tres proposiciones de negocio (caso Comic Relief):
- **Propuesta de Valor:** Una experiencia de pago respetuosa, rápida y flexible para el deudor, que alivia al acreedor de la gestión manual.
- **Propuesta de Ganancias:** Estructura de costos hiper-liviana que permite cobrar tarifas accesibles y comisiones por éxito altamente rentables.
- **Propuesta de Personas:** Clima laboral desahogado para el personal de administración y tranquilidad psicológica para el deudor que regulariza su situación.

#### Sostenibilidad y Barreras a la Imitación (Cap. 10)

¿Por qué este modelo no es fácilmente replicable por los rivales tradicionales del océano rojo?
1. **Barreras de Alineación Sistémica:** Copiar el software es sencillo; replicar la integración entre políticas parametrizadas, tono empático calibrado y acuerdos vinculantes requiere transformar la cultura de cobranza.
2. **Barreras Cognitivas de los Rivales:** Las agencias de cobranza tradicionales desconfían del modelo porque consideran que "sin intimidación nadie paga"; tardarán años en cambiar su mentalidad comercial.
3. **Barrera de Marca y Reputación:** Posicionarse como el canal de mediación confiable genera fidelidad en administraciones que cuidan su vínculo vecinal e institucional.
4. **Renovación Continua:** La estrategia no es estática (Cap. 10). Cuando las curvas de valor de la competencia comiencen a converger hacia nuestro espacio, el roadmap proyecta saltos hacia la automatización bancaria y la integración profunda en ERPs (§7.3).

### 8.13 Prevención de las Diez Trampas del Océano Rojo (Cap. 11 INSEAD)

La cátedra y la obra de Kim & Mauborgne identifican **diez trampas mentales** comunes que arrastran a los innovadores de regreso al océano rojo. El proyecto establece defensas explícitas contra cada una:

```text
┌─────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┐
│ Trampa del Océano Rojo                                  │ Cómo la Evita el Proyecto                               │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 1. Creer que el cliente actual lo explica todo.         │ Mirar a los no clientes: directivos que hoy rehúsan     │
│                                                         │ agencias tradicionales por cuidar la relación.          │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 2. Pensar que hay que abandonar la industria propia.    │ No nos convertimos en una fintech financiera; creamos   │
│                                                         │ el océano azul dentro de la administración de mora.     │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 3. Confundir innovación de valor con tecnología pura.   │ El LLM no es la estrella: lo que importa es el acuerdo  │
│                                                         │ alcanzado sin desgaste humano.                          │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 4. Obsesionarse con ser el primero en el mercado.       │ Priorizar la solidez del flujo, la robustez de políticas│
│                                                         │ y la ausencia de alucinaciones sobre la velocidad ciega.│
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 5. Reducir la estrategia a pura diferenciación.         │ No es solo "cobrar con IA"; es cobrar con costo de      │
│                                                         │ gestión prácticamente nulo (Diferenciación + Low Cost). │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 6. Asociar el océano azul exclusivamente a bajo costo.  │ Ofrece un servicio de alta personalización y trato      │
│                                                         │ cuidado, cobrando comisión por éxito justificada.       │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 7. Creer que toda innovación genera mercado nuevo.      │ Validar experimentalmente en el sandbox si el deudor    │
│                                                         │ realmente responde y pacta planes viables.              │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 8. Tratar la estrategia como marketing de nicho.        │ Apuntar a la masa crítica de deudores de mora temprana  │
│                                                         │ y media en consorcios y colegios de todo el país.       │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 9. Pensar que la competencia desaparecerá para siempre. │ Monitorear el lienzo estratégico y preparar los         │
│                                                         │ Releases 2 y 3 antes de que las curvas converjan.       │
├─────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────┤
│ 10. Esperar que la disrupción destruya lo existente.    │ Fomentar Creación No Destructiva: complementar el ERP   │
│                                                         │ contable existente sin exigir su reemplazo.             │
└─────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────┘
```

---

## Anexo A — Trazabilidad teoría ↔ decisión

| Decisión del Proyecto | Clase / Marco Teórico | Fundamentación en la Documentación |
| --- | --- | --- |
| Redactar el problema como impacto negativo objetivo (mora, liquidez, desgaste), sin nombrar la solución | Clases 02 y 03 | Cumplimiento estricto de sintaxis de problema y eliminación de antipatrones en §1.2 |
| Segmentación en cuatro variables y target market primario estrecho (administradores 5+ consorcios / colegios) | Clase 02 | Superación del sesgo demográfico puro; priorización psicográfica en §2.2 y §2.4 |
| Prototipo web interactivo mínimo (sandbox de negociación bajo políticas preconfiguradas) | Clases 01 y 03 | Aplicación de la Paradoja de la Maleta (integrar piezas existentes) y JTBD en §3.1–3.4 |
| Justificación explícita de frontera con la lista negra de la cátedra (no es ABM de expensas ni reserva) | Clase 01 | Defensa del producto frente a los ítems prohibidos por la cátedra en §3.3 |
| Construcción de User Persona y Mapa de Empatía desde el estrés operativo y el miedo al conflicto | Clase 04 | Mapeo de frustraciones y motivaciones del usuario que cobra en §4.3 y §4.4 |
| Adopción de proceso iterativo no lineal ("Falla barato; el código es caro, el diseño es barato") | Clase 06 | Priorización del prototipo/sandbox web antes de incurrir en desarrollo complejo en §4.1 |
| Pitch de 20 segundos enfocado en dolor, empatía y alivio (Método Tony Robbins) | Clase 05 | Estructuración del elevator pitch en §6.3 sin tecnicismos de infraestructura |
| Dinámica de pensamiento divergente ("Osos, helicópteros y miel") y priorización impacto/esfuerzo | Clase 06 | Reglas de ideación y selección de quick wins frente a proyectos complejos en §7.1 y §7.2 |
| Planificación evolutiva en Releases sucesivos y Timeline Roadmap de producto | Clase 06 | Desglose de Releases 1, 2 y 3 y contraste con el caso histórico de Uber en §7.3 y §7.4 |
| Salto de Océano Rojo a Océano Azul en cobranzas mediante Innovación de Valor (Diferenciación + Bajo Costo) | Clase 06 y Cap. 1 INSEAD | Diagnóstico de saturación y superación del trade-off convencional en §8.1 y §8.2 |
| Aplicación del esquema de las Cuatro Acciones (Matriz ERIC) | Clase 06 y Cap. 2 INSEAD | Eliminación de llamadas y hostigamiento; creación de negociación asistida en §8.5 |
| Lienzo Estratégico y detección del "Espacio Blanco" frente a 3 competidores | Clase 06 y Cap. 2 INSEAD | Curva de valor comparada frente a Gestión Manual, Agencias y ERPs en §8.4 |
| Superación de los 3 criterios de calidad (Enfoque, Divergencia, Lema contundente) | Cap. 2 INSEAD | Validación del tagline y el foco de producto en §8.6 |
| Exploración de los Tres Niveles de No Clientes (Soon-to-be, Refusing, Unexplored) | Cap. 5 INSEAD | Captura de colegios y consorcios reacios a las agencias tradicionales en §8.8 |
| Secuencia Estratégica Correcta e Índice BOI (Utilidad, Precio, Costo, Adopción) | Cap. 6 INSEAD | Chequeo metódico de viabilidad técnica, comercial y organizativa en §8.9 |
| Superación de los 4 obstáculos organizacionales y Liderazgo en el Punto de Inflexión | Cap. 7 INSEAD | Aplicación de puntos calientes y gestión de detractores en §8.10 |
| Adopción basada en Proceso Justo (Participación, Explicación, Expectativas claras) | Cap. 8 INSEAD | Cultura de transparencia y calibración de reglas en §8.11 |
| Blindaje estratégico y prevención de las Diez Trampas del Océano Rojo | Caps. 10 y 11 INSEAD | Análisis de barreras a la imitación y mitigación de trampas en §8.12 y §8.13 |

---

## Anexo B — Backlog de TODOs (para el equipo)

1. **Datos reales de morosidad y tasa de respuesta:** Relevar papers del sector inmobiliario/educativo y estadísticas de cámaras de administradores de consorcios para respaldar la magnitud del problema.
2. **Árbol de Problemas y 5 Whys:** Cerrar el árbol causal con citas textuales obtenidas de entrevistas de campo.
3. **Segmentos explícitamente fuera de alcance:** Delimitar formalmente la exclusión de banca corporativa, utilities masivas y cobranzas retail para el alcance del cuatrimestre.
4. **Target primario del cuatrimestre:** Decidir si el MVP se valida exclusivamente con administradores de consorcios (mayor facilidad de testeo local) dejando a los colegios privados para el Release 2.
5. **Fieldwork de Design Thinking (Entregable Clases 04 y 06):**
   - Difundir y analizar la **encuesta cuantitativa con meta de 400 respuestas**.
   - Consolidar **3 User Personas reales** (no hipotéticas), 3 Mapas de Empatía completos (incorporando cuadrantes *ve*, *oye*, *dice y hace*) y el Customer Journey Map AS-IS.
6. **Confirmación con docentes sobre frontera de lista negra:** Presentar y convalidar la defensa de no pertenencia a sistemas de reservas ni plataformas genéricas de pago de expensas.
7. **Definición de stack técnico:** Elegir router web definitivo (React Router vs Next.js vs TanStack Router) y confirmar si Supabase proveerá auth y base de datos para la plataforma.
8. **Políticas y Guardrails anti-alucinación:** Implementar validadores a nivel prompt y runtime para asegurar que el agente no prometa quitas ni cuotas fuera de los rangos autorizados.
9. **Definición de unidad de créditos y modelo de costos:** Detallar la métrica de cobro por uso y proyectar la estructura P&L (costos de inferencia vs. ingresos por comisión de éxito).
10. **Seguridad:** Rotar y suprimir la API key en texto plano que figuraba en la propuesta original, asegurando variables de entorno seguras.
11. **Oratoria y Elevator Pitch:** Ensayar el pitch de 20 segundos cronometrados y completar la estructura del Pitch Deck de 10 diapositivas según Clase 05.
12. **Grilla de Priorización formalizada (Entregable Clase 06):** Validar con todo el equipo de desarrollo las ponderaciones de esfuerzo e impacto de cada funcionalidad.
13. **Curva de Valor empírica (Entregable Clase 06):** Contrastar las calificaciones de los factores del lienzo estratégico con administradores reales para validar el distanciamiento de la curva.
14. **Narrativa de Solución pulida:** Ajustar el texto descriptivo de la propuesta de solución para su incorporación formal en presentaciones y memorias técnicas.

---

*Documento de trabajo para Seminario de Integración Profesional (TIF / SIP - UADE). Sin nombre comercial definitivo. Placeholder de producto: Asistente Autónomo de Cobranzas B2B / [Nombre a definir].*
