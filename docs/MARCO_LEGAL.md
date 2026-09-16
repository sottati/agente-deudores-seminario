# Marco Legal, Regulatorio y de Cumplimiento Normativo: pacta.ia

> **Producto:** pacta.ia — Asistente Autónomo de Cobranzas B2B  
> **Jurisdicción Principal:** República Argentina (con foco operativo en CABA y Provincia de Buenos Aires)  
> **Ámbito de Aplicación:** Plataforma SaaS B2B, Inteligencia Artificial aplicada a la negociación, gestión de datos personales/crediticios y comunicaciones automatizadas multicanal.

---

## 1. Resumen Ejecutivo y Enfoque de Cumplimiento

pacta.ia opera en la intersección de cuatro dominios altamente regulados:
1. **Tratamiento y privacidad de datos personales y financieros.**
2. **Prácticas de cobranza extrajudicial y defensa del consumidor.**
3. **Gobernanza ética y legal de sistemas de Inteligencia Artificial.**
4. **Validez probatoria de contratos y acuerdos electrónicos.**

El diseño de la arquitectura del sistema, los flujos conversacionales del agente LLM y los términos contractuales del servicio deben regirse bajo el principio de **"Compliance by Design"** (Cumplimiento por Diseño), mitigando riesgos civiles, administrativos y reputacionales tanto para pacta.ia como para sus clientes (administraciones de consorcios y colegios privados).

---

## Glosario de Siglas, Leyes y Términos Regulatorios

Para facilitar la lectura y comprensión técnica-legal del presente documento, se detalla el significado y alcance de las abreviaturas utilizadas:

### Leyes y Códigos Principales
| Sigla / Cita | Nombre Completo y Alcance |
| :--- | :--- |
| **LPDP** | **Ley de Protección de los Datos Personales (Ley Nacional N° 25.326):** Regula el tratamiento lícito de datos en registros, archivos y bases públicas o privadas en Argentina. |
| **LDC** | **Ley de Defensa del Consumidor (Ley Nacional N° 24.240):** Norma de orden público que tutela los derechos de usuarios y consumidores, regulando el trato digno (Art. 8 bis) y prohibiendo prácticas abusivas de cobro. |
| **CCCN** | **Código Civil y Comercial de la Nación:** Cuerpo normativo unificado que rige los contratos civiles y comerciales, la formación del consentimiento electrónico (Arts. 1105-1116) y el régimen de Propiedad Horizontal / Expensas (Arts. 2037-2072). |
| **Ley 6.171 (CABA)** | **Ley de Gestión de Cobro Extrajudicial de Deudas de la Ciudad de Buenos Aires:** Fija pautas estrictas sobre horarios de contacto, prohibición de avisos a terceros y límites de reiteración de mensajes. |
| **Ley 25.506** | **Ley de Firma Digital:** Establece el régimen y validez jurídica del empleo de la firma digital y la firma electrónica en actos y contratos. |
| **Ley 26.061** | **Ley de Protección Integral de los Derechos de las Niñas, Niños y Adolescentes (NNyA):** Prohíbe cualquier menoscabo, exposición pública o discriminación a menores con motivo de deudas de sus progenitores. |
| **Ley 941 (CABA)** | **Ley del Registro Público de Administradores de Consorcios (RPA):** Regula las obligaciones y rendición de cuentas de los administradores inmobiliarios en la Ciudad de Buenos Aires. |
| **Ley 26.951** | **Ley de Creación del Registro Nacional "No Llame":** Protege a los titulares de líneas telefónicas contra el abuso en procedimientos de contacto comercial o publicitario. |

### Organismos y Autoridades de Aplicación
| Sigla | Organismo |
| :--- | :--- |
| **AAIP** | **Agencia de Acceso a la Información Pública:** Órgano autárquico que actúa como Autoridad de Control y Aplicación de la Ley de Protección de Datos Personales N° 25.326 en la República Argentina. |
| **RPA** | **Registro Público de Administradores:** Organismo del Gobierno de la Ciudad de Buenos Aires encargado de matricular, auditar y sancionar a los administradores de consorcios. |

### Términos Técnicos y Jurídicos Operativos
| Sigla / Término | Definición y Contexto |
| :--- | :--- |
| **ARCO** | **Acceso, Rectificación, Cancelación y Oposición:** Conjunto de derechos fundamentales que la LPDP garantiza al titular del dato para controlar su información personal. |
| **DPA** | **Data Processing Agreement (Acuerdo de Encargo de Tratamiento):** Contrato obligatorio entre el Responsable de los datos (cliente) y el Encargado (pacta.ia) que estipula alcances, límites y medidas de seguridad según el Art. 25 LPDP. |
| **NNyA** | **Niñas, Niños y Adolescentes:** Sujetos de especial protección legal cuya información personal jamás puede ser expuesta en gestiones de cobranza escolar. |
| **EIPD** | **Evaluación de Impacto en la Protección de Datos:** Análisis preventivo de riesgos sobre la privacidad exigido en proyectos que incorporan Inteligencia Artificial. |
| **LLM** | **Large Language Model (Modelo de Lenguaje Extenso):** Tipo de arquitectura de IA (ej. GPT-5.6 Luna) que impulsa el procesamiento de lenguaje natural y la negociación conversacional. |
| **RLS** | **Row Level Security (Seguridad a Nivel de Fila):** Mecanismo de base de datos relacional (PostgreSQL en Supabase) que garantiza que un cliente jamás acceda a los registros o deudas de otro cliente. |
| **SaaS** | **Software as a Service (Software como Servicio):** Modelo de distribución donde el software y los datos se alojan en servidores en la nube y se consumen vía navegador o API. |
| **TLS / AES** | **Protocolos Criptográficos de Seguridad:** TLS (*Transport Layer Security*) protege los datos en tránsito y AES (*Advanced Encryption Standard*) asegura el cifrado en reposo. |

---

## 2. Protección de Datos Personales y Privacidad

### 2.1 Marco Normativo Aplicable
* **Ley N° 25.326 de Protección de los Datos Personales (LPDP)** y su Decreto Reglamentario N° 1558/2001.
* Disposiciones y resoluciones de la **Agencia de Acceso a la Información Pública (AAIP)** (Autoridad de Control en Argentina).

### 2.2 Roles y Responsabilidades en el Tratamiento de Datos
* **El Cliente (Consorcio / Colegio):** Actúa como **Responsable de la Base de Datos** (Data Controller). Es el titular legítimo del vínculo jurídico con el deudor y quien determina la finalidad del tratamiento.
* **pacta.ia (Plataforma):** Actúa formalmente como **Encargado del Tratamiento** (Data Processor) en los términos del Art. 25 de la Ley 25.326. Procesa datos por cuenta y orden del Responsable bajo un contrato de encargo de tratamiento (*Data Processing Agreement - DPA*).

### 2.3 Principios Rectores y Requisitos Operativos
| Principio Legal | Requisito Operativo en pacta.ia |
| :--- | :--- |
| **Licitud y Finalidad (Art. 3 y 4 LPDP)** | Los datos de contacto, unidad funcional/matrícula y saldos adeudados solo pueden utilizarse para la gestión y regularización del crédito específico. Queda estrictamente prohibida la venta, cesión o reutilización de datos para perfilado crediticio comercial ajeno al cliente. |
| **Calidad de los Datos (Art. 4 LPDP)** | pacta.ia debe asegurar mecanismos para que los saldos cargados sean exactos y se actualicen en tiempo real (evitar cobrar deudas ya canceladas). |
| **Seguridad de la Información (Art. 9 LPDP y Res. AAIP 47/2018)** | Cifrado en tránsito (TLS 1.3) y en reposo (AES-256) en bases de datos PostgreSQL (Supabase). Aislamiento estricto de carteras mediante *Row Level Security* (RLS) en entornos multi-tenant. |
| **Confidencialidad y Secreto (Art. 10 LPDP)** | Deber de confidencialidad absoluto aplicable al personal de pacta.ia y reflejado en los acuerdos de servicio con proveedores tecnológicos. |
| **Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)** | La plataforma debe proveer una vía accesible para que el titular de los datos ejerza sus derechos de acceso o rectificación ante el responsable. |

### 2.4 Tratamiento de Datos Crediticios y Morosidad (Art. 26 LPDP)
* El Art. 26 regula los servicios de información crediticia. pacta.ia **no es una central de riesgo crediticio** (como Veraz o Nosis), sino un gestor de cobranzas privado.
* **Prohibición de exposición indebida:** No se pueden divulgar datos de morosidad a terceros no legitimados. El agente conversacional jamás debe revelar montos o estatus de deuda en mensajes abiertos o a personas distintas al titular validado.

### 2.5 Transferencia Internacional de Datos
* Dado que los modelos fundacionales de lenguaje (LLM APIs como OpenAI/Vercel AI SDK) y servicios en la nube (Supabase/AWS) operan servidores en el exterior (ej. EE. UU.), resulta aplicable el **Art. 12 de la Ley 25.326** y la **Resolución AAIP N° 60/2016** (países con legislación adecuada o Cláusulas Contractuales Tipo).
* **Medida de mitigación:** Minimización y anonimización de *prompts*. Se debe evitar enviar nombres completos o DNIs directos en el *system prompt* del LLM si puede reemplazarse por identificadores internos ofuscados (tokens/IDs anónimos).

---

## 3. Defensa del Consumidor y Prácticas de Cobranza

La gestión de mora extrajudicial está sujeta a estrictos controles contra el hostigamiento, la intimidación y la exposición pública de los deudores.

### 3.1 Marco Normativo Aplicable
* **Ley N° 24.240 de Defensa del Consumidor** (Arts. 8 bis, 40 y concordantes).
* **Código Civil y Comercial de la Nación (CCCN)** (Arts. 1096 a 1099 — Prácticas abusivas y trato digno).
* **Ley N° 6.171 de la Ciudad Autónoma de Buenos Aires (CABA):** Regula las prácticas de gestión de cobro extrajudicial de deudas.
* **Ley N° 26.951 (Registro Nacional "No Llame"):** Aunque existen excepciones para relaciones contractuales vigentes, fija pautas de razonabilidad en las comunicaciones.

### 3.2 Prohibiciones Críticas que Limitan al Agente de IA (Guardrails Legales)

| Práctica Prohibida por Ley | Guardrail Implementado en pacta.ia |
| :--- | :--- |
| **Trato Indigno y Acoso (Art. 8 bis Ley 24.240)** | El modelo tiene prohibido usar lenguaje intimidatorio, hostil o sarcástico. Su tono debe ser invariablemente empático, neutral y propositivo. |
| **Simulación de Acciones Judiciales Falsas** | La IA no debe simular ser un juzgado, estudio jurídico externo o emitir amenazas de embargo inminente si no existe mandato formal. Todo mensaje debe identificarse claramente como mediación extrajudicial amistosa. |
| **Exposición y Afectación del Honor (Ley 6.171 CABA)** | Prohibición absoluta de notificar la deuda a terceros (empleadores, familiares, vecinos de consorcio o compañeros de colegio). La interacción inicia siempre requiriendo verificación de identidad previa. |
| **Hostigamiento y Frecuencia de Contacto** | Límites operativos de cadencia: máximo de 1 a 2 mensajes semanales por canal. Prohibición de contactar en horarios inhábiles (restringido a días hábiles de 9:00 a 19:00 hs, según estándares de CABA). |

---

## 4. Regulación y Ética de la Inteligencia Artificial

### 4.1 Marco Normativo y Directrices Oficiales
* **Resolución AAIP N° 2/2024 ("Directrices sobre Tratamiento de Datos Personales en Sistemas de Inteligencia Artificial"):** Instrumento oficial del Estado Argentino que establece requisitos para el ciclo de vida de los sistemas de IA.
* **Recomendación sobre la Ética de la IA (UNESCO 2021)**, adoptada como guía de política pública nacional.

### 4.2 Requisitos de Cumplimiento para el Agente Autónomo

```
               CICLO DE GOBERNANZA DE IA EN pacta.ia
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. Transparencia Algorítmica (Bot Disclosure obligatorio)   │
  ├─────────────────────────────────────────────────────────────┤
  │ 2. Prevención de Alucinaciones (Guardrails paramétricos)    │
  ├─────────────────────────────────────────────────────────────┤
  │ 3. Principio Human-in-the-Loop (Revisión y escalado humano) │
  ├─────────────────────────────────────────────────────────────┤
  │ 4. Trazabilidad y Explicabilidad (Audit logs de auditoría)   │
  └─────────────────────────────────────────────────────────────┘
```

#### 1. Bot Disclosure (Identificación Obligatoria)
* El usuario tiene derecho a saber que está interactuando con un sistema automatizado.
* **Regla de producto:** El mensaje inicial de bienvenida debe declarar explícitamente:  
  *"Hola, soy el asistente virtual automatizado de pacta.ia en representación de [Nombre de la Administración]..."*. Está prohibido engañar al usuario haciéndose pasar por un empleado humano.

#### 2. Responsabilidad por "Alucinaciones" y Ofertas Vinculantes
* Según el CCCN (Art. 972), la oferta dirigida a persona determinada es vinculante para quien la emite una vez aceptada. Si el LLM "alucina" y concede un descuento del 90% no autorizado por la política, el consorcio o colegio podría verse comprometido legalmente frente a un deudor de buena fe.
* **Medida de mitigación:**
  * Uso de *Function Calling* estricto y validación por backend determinístico: el LLM **no calcula números ni decide descuentos de forma libre**, sino que consulta una función que valida los topes máximos autorizados por la administración.
  * Cláusula en el acuerdo preliminar indicando que el plan queda supeditado a la homologación administrativa si excede los parámetros estándar.

#### 3. Human-in-the-loop (Intervención Humana)
* El deudor debe contar en todo momento con la opción de solicitar la intervención de un gestor humano (vía botón o comando de texto "Hablar con una persona"). Al activarse, la IA cede el control y deriva la conversación al panel del administrador.

---

## 5. Validez Jurídica de los Acuerdos Electrónicos

### 5.1 Marco Normativo Aplicable
* **Código Civil y Comercial de la Nación (CCCN):**
  * Arts. 286 a 288 (Forma y prueba del acto jurídico; firma digital).
  * Arts. 1105 a 1116 (Contratos celebrados por medios electrónicos).
* **Ley N° 25.506 de Firma Digital** (y modificaciones de la Ley 27.446).

### 5.2 Firma Electrónica vs. Firma Digital
* El acta de acuerdo de pago emitida por el bot constituye un **Contrato Electrónico bajo Firma Electrónica** (Art. 5 Ley 25.506).
* A diferencia de la firma digital (con certificado licenciado), la firma electrónica invierte la carga probatoria en caso de desconocimiento, por lo que **el sistema debe garantizar un estándar probatorio robusto**:
  * Registro de fecha y hora exacta (*timestamping*).
  * Dirección IP y número de teléfono/correo verificado del deudor.
  * Aceptación explícita mediante acción afirmativa inequívoca (botón *"Acepto los términos del plan de pago"* o respuesta contextual afirmativa registrada en el log).
  * Resumen del acuerdo enviado por correo/PDF descargable con hash inmutable de la conversación.

---

## 6. Regulaciones Sectoriales Específicas

### 6.1 Administraciones de Consorcios (Propiedad Horizontal)
* **Código Civil y Comercial de la Nación (Arts. 2037 a 2072):**
  * La expensa común posee fuerza ejecutiva (Art. 2048 CCCN). La gestión extrajudicial mediada por pacta.ia no interrumpe los plazos de prescripción ni obstaculiza la emisión del certificado de deuda por expensas en caso de fracaso de la negociación.
* **Ley N° 941 de la Ciudad Autónoma de Buenos Aires (Registro Público de Administradores - RPA):**
  * Exige al administrador rendir cuentas claras y gestionar fondos exclusivamente en la cuenta bancaria oficial del consorcio.
  * **Regla para pacta.ia:** Los links de pago o transferencias gestionadas por la plataforma deben acreditar fondos **directamente en la cuenta bancaria del consorcio acreedor**, jamás en cuentas intermediarias de pacta.ia que puedan interpretarse como retención o desvío de fondos.

### 6.2 Colegios Privados e Instituciones Educativas
* **Protección de Menores de Edad (Ley N° 26.061 de Protección Integral de los Derechos de Niñas, Niños y Adolescentes):**
  * Está **terminantemente prohibido** involucrar a los alumnos en el reclamo de deudas, retener boletines o certificados escolares, o exhibir listas públicas de morosidad escolar (violación directa del derecho a la educación e intimidad).
  * El único sujeto pasivo de la cobranza es el padre, madre o tutor firmante del contrato de matrícula.
* **Decreto Nacional N° 2417/93 (Aranceles de la Enseñanza Privada):**
  * Regula la mora y los intereses admisibles en colegios de enseñanza pública de gestión privada. Las tasas de interés y cuotas negociadas por pacta.ia deben ajustarse a los topes fijados por la autoridad ministerial competente.

---

## 7. Políticas de Plataforma y Mensajería (WhatsApp / Meta)

Al operar a través de la API oficial de WhatsApp Business (Meta Cloud API), pacta.ia debe cumplir de manera ineludible con los términos contractuales del canal:

1. **Meta WhatsApp Business Messaging Policy:**
   * **Opt-in previo:** El cliente (consorcio/colegio) debe contar con el consentimiento del usuario para ser contactado por WhatsApp en virtud de la relación contractual preexistente.
   * **Templates aprobados:** Las notificaciones salientes de mora deben usar plantillas preaprobadas por Meta bajo la categoría *Utility* (Servicio) o *Marketing*, evitando términos catalogados como spam o cobranza coercitiva.
2. **Prevención de Bloqueo de Número:** Mensajería intrusiva provocará reportes de usuarios por "Spam" o "Acoso", lo que causaría la suspensión de la cuenta oficial de WhatsApp. La empatía del mensaje y la baja frecuencia son requisitos tanto legales como técnicos de supervivencia del canal.

---

## 8. Matriz de Riesgos y Controles de Mitigación

| Riesgo Legal | Probabilidad | Impacto | Control / Mitigación Técnica en pacta.ia |
| :--- | :---: | :---: | :--- |
| **Denuncia por Trato Indigno (Art. 8 bis LDC)** | Media | Alto | *Tone Guardrails* estrictos en el prompt; monitoreo de sentimiento; prohibición de términos legales amenazantes. |
| **Alucinación de acuerdos no autorizados** | Media | Crítico | Backend determinístico con validación de reglas de negocio (*Function Calling* con rangos rígidos). |
| **Fuga de datos personales / Acceso indebido** | Baja | Crítico | *Row Level Security* (RLS) en Supabase; separación multi-tenant; cifrado en reposo y en tránsito. |
| **Sanción de la AAIP por falta de DPA** | Media | Medio | Suscripción obligatoria de contratos de encargo de tratamiento con cada cliente administrador. |
| **Desconocimiento del acuerdo por el deudor** | Media | Medio | Registro inmutable de logs, sellado de tiempo (timestamp), envío de constancia en PDF al correo del deudor. |
| **Bloqueo de cuenta en WhatsApp Business** | Media | Alto | Rate limiting; frecuencia máxima de 2 toques por semana; opt-out explícito ("Responder 'BAJA' para no recibir mensajes"). |

---

## 9. Cláusulas Contractuales Necesarias (Términos de Servicio y DPA)

Para el lanzamiento formal de la plataforma, se deberán redactar los siguientes instrumentos legales vinculantes:

1. **Términos y Condiciones de Uso (SaaS B2B):** Delimitación de responsabilidad de pacta.ia como proveedor de software de mediación, estableciendo que la legitimidad del crédito y los datos cargados son responsabilidad exclusiva del cliente.
2. **Acuerdo de Procesamiento de Datos (DPA):** Cláusula que formaliza a pacta.ia como encargado del tratamiento bajo la Ley 25.326, detallando medidas de seguridad y obligaciones de notificación de incidentes en 72 horas.
3. **Aviso de Privacidad al Deudor:** Texto accesible mediante link en la primera interacción conversacional, explicando quién es el responsable de sus datos, para qué se usan y cómo ejercer derechos ARCO.
