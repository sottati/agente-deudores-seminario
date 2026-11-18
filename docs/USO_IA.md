# Declaración de Uso de Inteligencia Artificial

Este documento explica cómo usó el equipo herramientas de Inteligencia Artificial Generativa a lo largo del TIF, tanto en la parte de negocio como en la de producto. Ninguna parte del trabajo se hizo íntegramente con IA. La usamos para ordenar ideas, poner a prueba hipótesis y llegar a mejores decisiones como equipo. Las decisiones, el trabajo de campo y la responsabilidad sobre los entregables son del equipo.

## 1. Principio de Uso

La IA se usó como un interlocutor crítico, no como autor. Sirvió para:

- Cuestionar nuestras hipótesis antes de darlas por válidas.
- Plantear alternativas que no habíamos considerado, para compararlas.
- Encontrar inconsistencias entre documentos y entre lo que afirmábamos y la evidencia que teníamos.
- Ordenar el razonamiento con los marcos de la materia (Océano Azul, árbol de problemas, curva de valor, matriz ERIC).

## 2. Herramientas Utilizadas

- **Claude (Anthropic):** apoyo para el razonamiento estratégico en la parte de negocio y asistente de código (Claude Code) en el sandbox y los tests (evals) del agente.
- **Google Antigravity (Agent / Gemini):** pair programming y apoyo en la ideación de naming e identidad visual.
- **Cursor:** asistente de código en las secciones de la landing page.
- **Modelos de Generación de Imágenes (DALL-E 3 / Ideogram):** exploración de direcciones visuales para el logo (isotipos y wordmarks).

**IA dentro del producto (no es uso del equipo):** el agente conversacional de pacta.ai usa **GPT-5.6 Luna** a través de Vercel AI SDK y Vercel AI Gateway. El modelo se configura por variable de entorno (decisión D8 de la arquitectura del backend).

## 3. Áreas de Aplicación

- [x] **Definición del problema y segmento:** sirvió para contrastar opciones de segmento. La decisión de acotar el MVP a administraciones de consorcios en CABA la tomó el equipo después de las entrevistas.
- [x] **Análisis de entrevistas:** sirvió para revisar críticamente nuestras conclusiones y no dar por validado lo que tenía poca evidencia. Las entrevistas las diseñamos, hicimos e interpretamos nosotros.
- [x] **Propuesta de valor:** sirvió para ajustarla a lo que encontramos en campo (las quitas las aprueba el Consejo o la Asamblea, no el administrador).
- [x] **Benchmarking y curva de valor:** sirvió para estructurar los factores de comparación y ordenar la búsqueda de información pública. Cada competidor y cada dato de mercado se verificó en su fuente. Los puntajes son estimaciones del equipo, todavía no validadas en campo.
- [x] **Modelo de negocio y cobro:** sirvió para comparar esquemas alternativos y sus riesgos. El esquema final (abono según cantidad de consorcios + 3% sobre lo efectivamente recuperado) lo definió el equipo, con el respaldo de la encuesta.
- [x] **Naming e identidad visual:** se generaron opciones a partir del contexto estratégico que le dimos. El equipo eligió pacta.ai y validó paleta y tipografía.
- [x] **Programación y código:** asistencia en componentes de la landing y la plataforma (React 19, Tailwind CSS, shadcn/ui) y en el sandbox y los tests del agente. Todo el código fue revisado e integrado por el equipo mediante pull requests.
- [x] **Documentación:** ayuda para redactar y unificar criterios entre documentos, sobre contenido y decisiones del equipo.

## 4. Metodología de Uso

Seguimos un ciclo de cuatro pasos:

1. El equipo plantea una idea o hipótesis.
2. La IA la cuestiona o propone alternativas.
3. El equipo la contrasta con evidencia (entrevistas, encuesta, fuentes, clases).
4. El equipo decide.

Si la IA aportaba algo que no podíamos respaldar con evidencia, no se incorporaba o se marcaba como hipótesis.

## 5. Qué No Hizo la IA

- No hizo las entrevistas ni la encuesta, ni habló con clientes.
- No tomó decisiones de producto, de negocio ni de diseño.
- No se usó como fuente de datos: toda cifra se tomó de una fuente verificable.

## 6. Compromiso de Revisión

Todo el contenido (código, texto, diseño) generado con asistencia de Inteligencia Artificial fue revisado, analizado y modificado manualmente por los integrantes del equipo para asegurar su calidad y veracidad. Las decisiones finales de arquitectura, branding y experiencia de usuario fueron tomadas íntegramente por el equipo, quien asume la total responsabilidad técnica y académica sobre los entregables finales.
