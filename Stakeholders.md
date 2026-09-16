## **Stakeholders seleccionados**

Para validar el MVP del **Asistente Autónomo de Negociación y Cobranzas**, identificamos distintos grupos de stakeholders según su relación con el problema, su participación en el proceso de cobranza y su capacidad para aportar conocimiento relevante al desarrollo de la solución.

### **1\. Administradores de consorcios**

**Rol:** cliente potencial, usuario directo y decisor de compra.

Es uno de los principales stakeholders del proyecto. Actualmente realiza o supervisa el seguimiento de expensas impagas y debe contactar a los propietarios o inquilinos morosos, muchas veces utilizando WhatsApp, teléfono, correo electrónico y planillas de cálculo.

**Qué necesitamos validar con ellos:**

* Cómo gestionan actualmente la morosidad.  
* Cuánto tiempo destinan al seguimiento de deudores.  
* Qué problemas encuentran al negociar planes de pago.  
* Qué condiciones están dispuestos a delegar a un agente de IA.  
* Qué descuentos, cuotas, intereses o excepciones suelen autorizar.  
* Qué información necesitan visualizar en un dashboard.  
* Qué situaciones consideran que necesariamente deben escalarse a una persona.  
* Si estarían dispuestos a pagar por una herramienta de este tipo y bajo qué modelo.

**Prioridad:** Muy alta.

---

### **2\. Tesoreros o personal administrativo de colegios privados**

**Rol:** cliente potencial y usuario directo.

Constituyen el segundo segmento definido para el MVP. Su problemática es similar a la de los administradores de consorcios, aunque el contexto de cobranza es diferente, porque existe una relación continua entre la institución educativa y las familias.

**Qué necesitamos validar con ellos:**

* Cómo realizan actualmente el seguimiento de cuotas vencidas.  
* Qué nivel de personalización utilizan al contactar a cada familia.  
* Qué alternativas de financiación o regularización ofrecen.  
* Qué grado de autonomía podría tener un agente de IA.  
* Qué tono debería utilizar el sistema.  
* Qué información debería conocer la IA antes de comenzar una negociación.  
* Cuándo una conversación debería pasar a intervención humana.  
* Qué riesgos observan en automatizar este proceso.

**Prioridad:** Muy alta.

---

### **3\. Personas con deudas o pagos atrasados**

**Rol:** usuario del agente y stakeholder directamente afectado.

Aunque no contratan la plataforma, son quienes interactúan con el asistente de negociación. La efectividad del producto depende de que perciban la conversación como clara, respetuosa y útil, y no como una forma de presión o hostigamiento.

**Qué necesitamos validar con ellos:**

* Qué canales prefieren para recibir una comunicación relacionada con una deuda.  
* Cómo reaccionan ante mensajes automáticos.  
* Qué elementos generan confianza o rechazo.  
* Si estarían dispuestos a negociar un plan de pago mediante un chatbot.  
* Qué información necesitan para confiar en que el acuerdo es válido.  
* En qué situaciones preferirían hablar con una persona.  
* Qué tono consideran adecuado para una conversación de este tipo.

**Prioridad:** Alta.

---

### **4\. Profesional con experiencia en cobranzas o gestión de morosidad**

**Rol:** experto de dominio.

Puede ser un responsable de cobranzas, administrador con experiencia, contador u otro profesional que gestione regularmente cuentas vencidas.

Su aporte permite comprender las reglas reales utilizadas durante una negociación: vencimientos, intereses, planes de pago, descuentos, promesas de pago, incumplimientos y criterios de escalamiento.

**Qué necesitamos validar con este perfil:**

* Cómo se estructura una negociación real.  
* Qué variables se consideran antes de ofrecer un acuerdo.  
* Qué decisiones pueden automatizarse.  
* Qué decisiones requieren autorización.  
* Qué excepciones aparecen habitualmente.  
* Cómo debería registrarse un acuerdo.  
* Qué indicadores permiten evaluar si una estrategia de cobranza funciona.

**Prioridad:** Alta.

---

### **5\. Profesional legal o especialista en cumplimiento normativo**

**Rol:** experto de dominio y stakeholder de control.

La solución automatiza comunicaciones relacionadas con deudas y por lo tanto necesita contemplar límites sobre frecuencia de contacto, tratamiento de información personal, contenido de los mensajes y condiciones de los acuerdos generados.

**Qué necesitamos validar con este perfil:**

* Qué límites deben respetarse al contactar a un deudor.  
* Qué información puede utilizar el agente.  
* Qué información debería quedar registrada.  
* Qué consentimiento o información previa podría ser necesaria.  
* Qué prácticas podrían interpretarse como hostigamiento.  
* Qué condiciones debería cumplir un acuerdo realizado mediante el sistema.  
* Qué acciones deberían estar expresamente prohibidas al agente.

**Prioridad:** Alta, especialmente antes de llevar el MVP a un entorno real.

---

### **6\. Especialista en IA conversacional / desarrollo de agentes**

**Rol:** experto técnico.

Su función no es validar el problema comercial sino analizar la viabilidad y los riesgos técnicos del agente de negociación.

**Qué necesitamos validar con este perfil:**

* Cómo limitar al modelo a las reglas configuradas por cada cliente.  
* Cómo evitar que ofrezca descuentos o condiciones inexistentes.  
* Cómo mantener trazabilidad sobre las decisiones tomadas.  
* Cómo detectar conversaciones que requieren intervención humana.  
* Cómo evaluar la calidad de una negociación.  
* Qué mecanismos de seguridad son necesarios para impedir acciones fuera de los parámetros autorizados.

**Prioridad:** Media/Alta.

---

### **7\. WhatsApp / plataforma de mensajería**

**Rol:** stakeholder externo y dependencia tecnológica./ Actor secundario

En una versión futura del producto, WhatsApp sería uno de los principales canales de contacto con los usuarios. Por lo tanto, sus políticas y restricciones condicionan técnicamente al sistema.

Para el MVP actual no necesitamos integrar necesariamente WhatsApp, ya que el objetivo es simular la conversación mediante una aplicación web. Sin embargo, debe contemplarse como una dependencia relevante para una implementación real.

**Prioridad para el MVP:** Media.

## **Clasificación**

| Stakeholder | Tipo | Interés | Influencia | Prioridad de validación |
| ----- | ----- | ----- | ----- | ----- |
| Administrador de consorcio | Cliente / usuario | Muy alto | Muy alta | Muy alta |
| Tesorero de colegio privado | Cliente / usuario | Muy alto | Muy alta | Muy alta |
| Persona morosa | Usuario del agente | Muy alto | Media | Alta |
| Profesional de cobranzas | Experto de dominio | Alto | Alta | Alta |
| Profesional legal/compliance | Experto de dominio | Medio/alto | Alta | Alta |
| Especialista en IA | Experto técnico | Alto | Media/alta | Media/alta |
| Plataforma de mensajería | Actor externo | Medio | Alta | Media |

## **Stakeholders prioritarios para esta primera etapa**

Para la validación inicial del MVP proponemos concentrarnos principalmente en cuatro perspectivas:

1. **Cliente:** administrador de consorcios y/o tesorero de colegio privado.  
2. **Usuario final:** persona que haya atravesado una situación de deuda o atraso de pagos.  
3. **Experto de dominio:** profesional con experiencia en cobranzas o administración financiera.  
4. **Experto de control:** profesional legal o de cumplimiento que pueda analizar los límites de una cobranza automatizada.

La combinación de estos perfiles permite validar no solamente si el sistema puede construirse, sino principalmente si resuelve un problema real, si las reglas de negociación representan situaciones reales y si la interacción propuesta resulta aceptable para las personas involucradas.