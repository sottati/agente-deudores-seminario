# Registro de Entrevistas - Trabajo de Campo

Este documento contiene el registro de las entrevistas cualitativas realizadas a los stakeholders principales (potenciales clientes y usuarios) para validar las hipótesis del proyecto "pacta.ai".

---

## Entrevista 1: Administración de Consorcios Pequeños/Medianos

**DATOS DEL ENTREVISTADO**

- **Nombre y Apellido:** Claudia Bea
- **Cargo/Rol en la administración:** Administradora de Consorcio
- **Administración / Empresa:** Consorcio San Juan
- **Cantidad de unidades gestionadas:** 36 unidades
- **Fecha de realización:** 15/09/2026

> **Perfil frente al target:** administra 1 consorcio de 36 unidades. Queda fuera del target definido (administraciones con 5 o más edificios), así que sus respuestas se toman como indicio, no como validación.

### PREGUNTAS DE INVESTIGACIÓN

**1. Una vez vencidas las expensas, ¿cuál es el procedimiento habitual que utiliza para contactar y reclamar la deuda a los propietarios o inquilinos morosos?**

> "Se realiza a través de la misma liquidación de expensas."

**2. ¿Qué canales utiliza principalmente (WhatsApp, correo electrónico, llamadas, notas físicas) y en qué orden los aplica?**

> "Se utilizan WhatsApp y correo electrónico."

**3. ¿Utiliza algún software de gestión de consorcios o realiza el seguimiento mediante planillas de cálculo (ej. Excel)?**

> "Se utiliza el software Adminprop para la gestión de consorcios (antes se realizaba en hoja; se destaca que esto ahora ahorra tiempo a la administración)."

**4. Aproximadamente, ¿qué porcentaje de morosidad maneja y cuántas horas semanales le dedica su equipo a insistir con la cobranza?**

> "Se maneja un 11% de morosidad (equivalente a 2 morosos en total: 1 con más de un año de atraso y el otro con 9 meses)."

**5. Cuando un moroso desea regularizar su situación pero no dispone del monto total, ¿qué margen de negociación posee (cuotas, quita de intereses, pagos parciales) y si cuenta con autonomía o requiere previa autorización del Consejo de Propietarios?**

> "Se hacen acuerdos por medio de escribano para cumplir con las cuotas."

**6. Ante la propuesta de un asistente automatizado por WhatsApp que contacte al moroso, responda dudas y proponga planes de pago según sus propias reglas, ¿qué etapa del proceso considera que le ahorraría mayor volumen de trabajo?**

> "Estar en contacto y responder las dudas básicas sobre la situación de los morosos."

**7. ¿Qué temores o riesgos identifica al delegar esta gestión inicial en un asistente automatizado por WhatsApp (ej. tono de la conversación, posibles errores, riesgo de bloqueo de línea)?**

> "No identifico riesgos en sí; las personas, si quieren hacerse las tontas, lo van a hacer independientemente de si las atiende un humano o no."

**8. De los siguientes modelos de comercialización para una plataforma de este tipo, ¿cuál le resultaría más viable para su administración?**
_(Opciones dadas: A. Suscripción fija, B. Comisión por éxito, C. Pago por uso)_

> "Creo que sería una combinación de las dos primeras. La comisión con base fija mensual está buena porque uno sabe cuánto va a pagar al final del mes; pero también me gusta la segunda opción si uno va viendo que recupera el dinero de manera más efectiva, así que bienvenida sea. Creo que sería una combinación de las dos primeras."

**9. Si pudieras pedirle una función "ideal" a un sistema de cobranzas automático para resolver tu mayor problema del mes, ¿cuál sería?**

> "Que cumpla con la conciliación."

---

### Análisis de la Entrevista

- **Canal:** Reclama la deuda por WhatsApp y correo electrónico, además del aviso en la liquidación de expensas. Gestiona el consorcio con un software (Adminprop).
- **Dolor operativo:** Lo que más trabajo le ahorraría es "estar en contacto y responder las dudas básicas" de los morosos. Coincide con la función principal del agente.
- **Formalización de acuerdos:** Los planes de pago se formalizan ante escribano. El acuerdo que registra el agente funcionaría como pre-acuerdo, y la formalización puede requerir un paso adicional.
- **Riesgos percibidos:** No identificó riesgos en delegar el contacto inicial en un asistente.
- **Modelo de negocio:** Prefiere una combinación de abono fijo y comisión por éxito, que coincide con el modelo elegido (Sección 6.1 de la Documentación). Es una sola respuesta, de alguien fuera del target, así que se toma como indicio y se valida con la encuesta.
- **Insights del Roadmap:** La función ideal que pidió es la conciliación, prevista para el **Release 3** (conciliación automática y conexión con software de gestión).

---

## Entrevista 2: Administración de Consorcios Medianos

**DATOS Y VALIDACIÓN DEL ENTREVISTADO**

- **Nombre de la Administración / Institución:** ByG Consorcios
- **Nombre del Entrevistado:** Verónica Gindre
- **Cargo / Rol:** Administradora
- **Fecha de la Entrevista:** 09/10/2026

> **Perfil frente al target:** administra 25 consorcios (unas 1.100 unidades funcionales). Está dentro del target definido.

### Contexto de la Entrevista y del Proyecto

El objetivo principal de este espacio es comprender el funcionamiento real del área administrativa y de gestión de cobranzas frente a la morosidad en consorcios. La propuesta consiste en el desarrollo de un asistente inteligente basado en IA e integrado a WhatsApp, diseñado para automatizar recordatorios de pago y negociaciones preliminares bajo un esquema de "humano en el circuito" (human-in-the-loop). El sistema mantiene la interacción inicial, pero ningún plan de pago, quita de recargos ni acuerdo definitivo se ejecuta de forma autónoma; todo queda sujeto a la revisión, validación y autorización final del personal de administración.

### Desarrollo de la Entrevista

**1. Presentación y Contexto Institucional**

**¿Cuál es tu rol exacto dentro de la institución y hace cuánto tiempo formas parte del equipo?**

> "Soy administradora matriculada y formo parte del equipo desde el inicio de la administración hace 18 años. Represento a cada consorcio y me encargo del control financiero (ingresos/egresos), aspectos legales, cumplimiento normativo y seguimiento del mantenimiento."

**¿Con cuántas unidades funcionales / consorcios trabajan actualmente?**

> "Administramos 25 consorcios que suman aproximadamente 1.100 unidades funcionales."

**¿Cómo es la interacción diaria con propietarios e inquilinos y qué canales utilizan?**

> "Recibimos consultas administrativas a diario (gastos liquidados, pago de expensas, etc.) y, mayoritariamente, reclamos por mantenimiento o filtraciones en departamentos y espacios comunes. Los medios de contacto son teléfono, correo electrónico, la plataforma Consorcio Abierto y WhatsApp, siendo este último el de uso más frecuente."

**2. Operativa y Contexto Diario**

**¿Cómo está conformado actualmente el equipo de trabajo?**

> "El equipo está integrado por 6 personas: 4 abocadas a cobranzas, pago a proveedores, atención al vecino y asuntos legales; y 2 destinadas a tareas de mantenimiento (colaborando todos ante emergencias)."

**¿Cómo describirías el cumplimiento general en el pago de expensas?**

> "El cumplimiento varía según el consorcio y el monto de las expensas. Hay edificios muy puntuales y otros que requieren mayor insistencia y seguimiento. En el último año, la morosidad aumentó, en especial en consorcios donde se realizan obras extraordinarias de alto impacto económico."

**¿Existen épocas del año con mayor retraso en los pagos?**

> "Sí, la morosidad se incrementa principalmente en la época estival (entre diciembre y febrero)."

**3. Gestión Actual de la Morosidad**

**¿Cuál es el procedimiento actual ante la acumulación de deuda en las expensas?**

> "El flujo consta de cuatro etapas:
>
> 1. Envío de recordatorios del estado de cuenta antes del cierre del periodo.
> 2. Llamado telefónico para proponer un plan de pago al acumular 2 periodos impagos.
> 3. Envío de certificado de deuda.
> 4. Envío de carta documento y derivación al área de legales (lo cual genera honorarios y gastos a cargo de la unidad)."

**¿Qué canales de comunicación utilizan para la morosidad y cuáles son los más efectivos?**

> "Utilizamos teléfono, correo electrónico, WhatsApp, Consorcio Abierto y carta documento. La carta documento resulta ser el medio de intimación formal más efectivo."

**¿Cuáles son las mayores dificultades en la gestión de cobro?**

> "Existen casos donde el retraso no responde a una incapacidad económica, sino a desorganización, lo que exige una insistencia y seguimiento continuo sobre las fechas de vencimiento y saldos pendientes."

**4. Criterios de Negociación y Excepciones**

**¿Cómo se abordan los casos donde un vecino manifiesta dificultades económicas?**

> "Se revisa el historial de pagos de la unidad, se escucha la propuesta del propietario y se traslada la situación al Consejo de Administración. Si la unidad es habitada por un inquilino, se notifica al propietario para ofrecerle asumir el pago."

**¿Qué margen de negociación o quita de intereses se puede otorgar?**

> "La Administración no decide de forma autónoma la quita o reducción de intereses por mora; estas excepciones deben ser autorizadas por el Consejo de Administración o mediante votación en Asamblea de copropietarios."

**5. Innovación Tecnológica y Asistencia Inteligente**

**¿Qué opinión te merece la implementación de un asistente por WhatsApp bajo el modelo de control estricto?**

> "Considero que es una herramienta de gran utilidad para brindar atención inicial y realizar el seguimiento continuo de reclamos de los consorcistas."

**¿Qué datos e información consideran indispensables en el panel de control?**

> "El panel debe permitir visualizar: deuda de capital, desglose entre expensas ordinarias y extraordinarias, intereses acumulados, periodos adeudados y si existía un plan de pagos previo."

**¿En qué escenarios el asistente debe detener la interacción y derivar el caso inmediatamente?**

> "Debe detenerse y derivar en casos de urgencia grave (problemas de mantenimiento que pongan en riesgo la seguridad del edificio o la unidad, como fugas de gas o filtraciones severas) y cuando las interacciones ocurran dentro de grupos de WhatsApp institucionales con Consejos de Administración."

**6. Adopción y Cierre**

**¿Qué miedos o reparos institucionales surgen respecto a la implementación de bots o asistentes IA?**

> "Existe desconfianza basada en experiencias previas con chatbots estatales (por ejemplo, del GCBA), caracterizados por demoras en la interpretación, respuestas rígidas o predeterminadas y falta de certeza sobre si el reclamo quedó formalmente registrado. Quedar sin resolver una emergencia de mantenimiento por una falla en la derivación representa un riesgo alto e inaceptable."

**¿Qué sugerencias harían para asegurar que la solución sea práctica y alivie la carga diaria?**

> - Generación de un reporte diario consolidado enviando el resumen de interacciones y reclamos respondidos a la administración.
> - Implementación de una clasificación por nivel de gravedad en los reclamos, activando un sistema de alertas inmediatas al responsable del área ante eventos de alta prioridad.

---

### Análisis de la Entrevista

- **Canal y alcance operativo:** WhatsApp es el canal de uso más frecuente con los consorcistas, y la carta documento es el medio de intimación formal más efectivo. Valora el asistente para la atención inicial y el seguimiento continuo, antes de llegar a la carta documento. En el MVP el agente funciona en un chat web; WhatsApp queda para el Release 2.
- **Dolor Operativo y Gestión de Morosidad:** La morosidad no siempre responde a falta de solvencia, sino a desorganización de los vecinos, lo que demanda un esfuerzo continuo y desgastante de seguimiento repetitivo. Asimismo, la mora aumenta sustancialmente ante obras extraordinarias o en la época estival (diciembre a febrero).
- **Quién decide las reglas ("Human-in-the-Loop"):** La administración no tiene autonomía para condonar intereses ni hacer quitas: esas excepciones las aprueba el Consejo de Administración o la Asamblea. Esto respalda el diseño del sistema (el agente propone dentro de reglas fijadas y la aprobación queda en manos humanas) y agrega un requisito: las reglas que usa el agente deben reflejar lo que aprobó el Consejo o la Asamblea, no solo el criterio del administrador.
- **Alertas de emergencia:** Ante problemas graves de mantenimiento (fugas de gas, filtraciones severas) o consultas dentro de grupos de WhatsApp institucionales, el asistente debe detener la interacción y derivar de inmediato. Aunque el mantenimiento está fuera del alcance de la cobranza, el agente tiene que reconocer esos casos y derivarlos.
- **Insights para el Product Roadmap y Dashboard:**
  - **Clasificación por Gravedad y Alertas Tempranas:** Requerimiento clave para priorizar derivaciones urgentes al personal humano.
  - **Reporte Diario Consolidado:** Necesidad de un resumen diario automático con el historial de interacciones y reclamos atendidos.
  - **Métrica Detallada de Deuda:** El panel de control debe discriminar estrictamente entre capital, intereses, expensas ordinarias y extraordinarias, e indicar si la unidad tiene un plan de pagos activo previamente.

---

## Entrevista 3: Institución Educativa (cuotas escolares)

**DATOS Y VALIDACIÓN DEL ENTREVISTADO**

- **Institución:** Instituto Rosa Anchorena de Ibáñez (A-133)
- **Contacto:** María Florencia Darosniski — Directora
- **Fecha del contacto:** 13/10/2026
- **Modalidad:** Consulta cualitativa por correo electrónico.

> **Perfil frente al segmento:** institución educativa. Después de las entrevistas, el equipo acotó el MVP a administraciones de consorcios, así que esta entrevista queda fuera del segmento del MVP. Se mantiene como registro del análisis realizado.

### Contexto de la Entrevista y del Proyecto

Al momento de esta entrevista, el proyecto pacta.ai contemplaba gestionar la morosidad en dos ámbitos: la
cobranza de expensas en consorcios y la cobranza de cuotas en instituciones
educativas. Ambos comparten el mismo problema de fondo (seguimiento de deudores,
negociación de planes de pago y registro formal de acuerdos) y la misma propuesta de
un asistente de IA integrado a WhatsApp bajo un esquema "humano en el circuito".

Esta entrevista corresponde al ámbito educativo y aporta la visión de una
institución escolar sobre la comunicación con las familias, los criterios de
negociación y la percepción de la asistencia con IA.

En un primer contacto, la institución declinó participar por tratarse de
información sensible y confidencial:

> "Estimado, los datos solicitados son información sensible y confidencial de
> nuestro ámbito privado con lo cual no podremos dar respuesta a sus preguntas.
> Atte. Equipo de conducción — Instituto Rosa Anchorena de Ibáñez A-133"

Respetando esa decisión, se **reformuló la consulta** para no solicitar ningún dato
ni cifra interna, pidiendo únicamente una opinión general del sector sobre tres
puntos clave. Ante este nuevo enfoque, la institución accedió a responder.

### Desarrollo de la Entrevista

**1. Atención a las familias: ¿los padres prefieren resolver cuestiones administrativas por WhatsApp antes que por mail o de forma presencial?**

> "Sí, la preferencia por WhatsApp es total. Los padres buscan inmediatez y casi no
> usan el mail. Para nosotros el desafío es que el chat suele restar formalidad, por
> lo que cuesta dejar asentados los compromisos de pago de manera clara."

**2. Criterios de negociación: frente a situaciones económicas difíciles de las familias, ¿la evaluación personalizada es indispensable frente a pautas rígidas?**

> "La evaluación personalizada es clave. Tratándose de la educación de los chicos, no
> podemos como institución aplicar un criterio rígido. Atrás de una mora suele haber
> un problema familiar o económico puntual, y la idea es siempre buscar una
> alternativa viable para ambas partes sin perder a la familia."

**3. Asistencia con IA: ante un sistema que conversa por WhatsApp pero donde la administración aprueba cada acuerdo final, ¿cuál es el mayor reparo o temor que puede surgir?**

> "El principal recaudo es el tono. Nos da temor que el trato resulte frío, robótico o
> impersonal, porque es un tema sensible. Por más que la administración apruebe el
> acuerdo final, nos preocupa cómo se gestiona la conversación previa para que el
> tutor no se sienta agredido o mal atendido."

---

### Análisis de la Entrevista

- **Ámbito educativo:** La institución describe el mismo tipo de problema (morosidad y negociación de planes de pago), pero con un contexto distinto: la relación con las familias y la necesidad de evaluar cada caso. El equipo decidió no incluir este segmento en el MVP.
- **Canal:** WhatsApp es el canal dominante con las familias ("la preferencia es total") y el mail casi no se usa. Coincide con lo que dicen las dos administradoras de consorcios.
- **Dolor Operativo — Formalidad del registro:** Se menciona un problema concreto: el chat resta formalidad y dificulta dejar asentados los compromisos de pago. Esto respalda una función central de pacta.ai: registrar cada pre-acuerdo con trazabilidad (código de referencia, fecha, responsable), convirtiendo una conversación informal en un acuerdo documentado.
- **Enfoque "Human-in-the-Loop":** Se reafirma la necesidad de evaluación personalizada y de que un humano apruebe cada acuerdo. El criterio rígido no es viable en contextos sensibles; el sistema debe proponer dentro de reglas, pero habilitar la revisión humana.
- **Insight para el producto — El TONO del agente:** El mayor temor no es la automatización en sí, sino que el trato resulte frío o impersonal en un tema sensible. Aplica también a consorcios (la Entrevista 2 menciona la desconfianza por respuestas rígidas de otros chatbots): el agente debe ser empático y cuidado en su redacción, sobre todo antes de que intervenga una persona.

---

## Síntesis de las Entrevistas

- **Alcance de la evidencia:** Se hicieron 3 entrevistas. Solo la Entrevista 2 corresponde al target del MVP (administraciones con 5 o más edificios); la 1 es un consorcio chico y la 3 es de un segmento descartado. La muestra es chica: los hallazgos se toman como indicios y se complementan con la encuesta y la entrevista con el experto.
- **Canal:** Las 3 entrevistas coinciden en que WhatsApp es el canal más usado. En el MVP se usa un chat web; WhatsApp queda para el Release 2.
- **Aprobación humana de los acuerdos:** En la Entrevista 2 las quitas las aprueba el Consejo o la Asamblea; en la 1 los acuerdos se formalizan ante escribano; en la 3 cada caso se evalúa en forma personalizada. El agente propone dentro de reglas y la decisión final queda en manos humanas.
- **Temores:** Que el trato sea rígido o frío (Entrevistas 2 y 3) y que una emergencia quede sin derivar (Entrevista 2).
- **Implicancias para el producto:** Reglas de negociación que reflejen lo aprobado por el Consejo o la Asamblea; derivación inmediata a una persona ante casos sensibles; tono empático; registro formal de cada pre-acuerdo.
- **Pendiente:** Entrevista con el experto en cobranzas (SEM-8). Los resultados de la encuesta están en [ENCUESTA.md](./ENCUESTA.md).
