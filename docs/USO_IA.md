# Declaración de Uso de Inteligencia Artificial

Este documento detalla cómo el equipo hizo uso de herramientas de Inteligencia Artificial Generativa durante el desarrollo del proyecto, enfocándose en la actual fase de Prototipado, Identidad Visual y desarrollo de la Landing Page.

## 1. Herramientas Utilizadas
* **Google Antigravity (Agent / Gemini):** Utilizado como agente de Pair Programming y consultor estratégico.
* **Modelos de Generación de Imágenes (DALL-E 3 / Ideogram):** Utilizados para la ideación y renderizado de prototipos de logotipos (Isotipos y Wordmarks).
* **Vercel AI SDK / GPT-5.6 Luna:** (Herramientas core integradas en el producto final para el agente conversacional).

## 2. Áreas de Aplicación

- [x] **Programación y Código:** Asistencia en la creación y estructuración de la Landing Page, implementación de componentes de interfaz (React 19, Tailwind CSS, shadcn/ui) y efectos visuales (`hero-shader-gradient`).
- [x] **Redacción y Documentación:** Reestructuración de la documentación técnica a formato PRD profesional (`DOCUMENTACION.md`) y redacción del manual de identidad visual con justificaciones estratégicas (`identidad_visual.md`).
- [x] **Ideación (Brainstorming):** Generación de propuestas de Naming enfocadas en la estrategia de Océano Azul, resultando en la elección del nombre **pacta.ia**.
- [x] **Diseño:** Análisis de psicología del color (elección de magenta/dark mode), estructuración del sistema de bordes y tipografía (Geist Variable), y generación mediante *prompts* de múltiples direcciones de diseño para el logotipo.
- [ ] **Otro:** _________________

## 3. Metodología de Uso

La Inteligencia Artificial se integró en el flujo de trabajo bajo una metodología de **co-creación y revisión activa (Human-in-the-loop)**:

1. **Diseño y Naming:** Se le proporcionó al agente el contexto estratégico (Océano Azul, mediación vs. cobranza agresiva). A partir de allí, la IA generó opciones de naming y justificó la paleta de colores. El equipo seleccionó "pacta.ia" y validó las reglas tipográficas.
2. **Generación de Logos:** Se utilizaron comandos descriptivos elaborados en conjunto con la IA para explorar direcciones visuales (App Icon, Abstracto, y Tipográfico) mediante generadores de imágenes, iterando sobre conceptos como ambigüedad tipográfica (la letra 'l' vs 'I').
3. **Código de la Landing Page:** La IA asistió en la escritura de los componentes de React (`index.tsx`, `navigation.tsx`), optimizando el uso de Tailwind para el diseño responsivo y la adaptabilidad al *Dark/Light mode*. Todo el código fue inspeccionado e integrado manualmente.
4. **Documentación:** Se delegó la formalización de los textos (pasar de apuntes académicos a documentación B2B formal), manteniendo las ideas originales del equipo humano.

## 4. Compromiso de Revisión
Todo el contenido (código, texto, diseño) generado con asistencia de Inteligencia Artificial fue revisado, analizado y modificado manualmente por los integrantes del equipo para asegurar su calidad y veracidad. Las decisiones finales de arquitectura, branding y experiencia de usuario fueron tomadas íntegramente por el equipo, quien asume la total responsabilidad técnica y académica sobre los entregables finales.
