# @agente/video

Video de motion graphics de pacta.ai para el pitch deck, hecho con [Remotion](https://www.remotion.dev). Dura 57 s, en 1920×1080 a 30 fps.

Reutiliza la UI de `apps/platform`:

- `src/styles.css` importa los tokens de `apps/platform/src/styles.css` (colores, radios, tema oscuro, Geist).
- El alias `@/` apunta a `apps/platform/src`, así que las escenas usan los mismos `Card`, `Badge`, `Button`, `Input` y `Table` de shadcn.
- Las piezas con estado o timers de la landing (chat, sliders, gráficos de Recharts) están replicadas en `src/ui/product.tsx` y en cada escena, controladas por el frame actual, para que el render sea determinístico.

## Escenas

| #   | Escena                                            | Archivo                       |
| --- | ------------------------------------------------- | ----------------------------- |
| 1   | Logo y bajada                                     | `src/scenes/intro.tsx`        |
| 2   | El problema                                       | `src/scenes/problem.tsx`      |
| 3   | La solución (hero de la landing)                  | `src/scenes/hero.tsx`         |
| 4   | 01 · Reglas del agente y margen del motor         | `src/scenes/rules.tsx`        |
| 5   | 02 · Negociación con el deudor y propuesta formal | `src/scenes/conversation.tsx` |
| 6   | 03 · Acta de acuerdo con cronograma y hash        | `src/scenes/agreement.tsx`    |
| 7   | 04 · Derivación a la administración               | `src/scenes/handoff.tsx`      |
| 8   | Dashboard                                         | `src/scenes/dashboard.tsx`    |
| 9   | Cierre                                            | `src/scenes/outro.tsx`        |

El orden y la duración de cada escena están en `src/PactaPitch.tsx`.

## PactaLaunch (65 s)

Segunda composición, más corta y con otro lenguaje visual: los componentes de la plataforma aparecen sueltos, flotando a distintas profundidades, y el fondo alterna entre oscuro, magenta y claro. En los fondos magenta los acentos de la UI pasan a blanco y negro. Sigue el storyboard v3 plano por plano.

| Escena               | Planos | Qué muestra                                                                    |
| -------------------- | ------ | ------------------------------------------------------------------------------ |
| Logo                 | 1A–1C  | Isotipo que se dibuja, iris a magenta, llegan piezas de la UI                  |
| Reglas del agente    | 2A–2C  | Campos flotantes, cuotas de 3 a 6 con cursor, tono, indicaciones y guardar     |
| La cartera           | 3A–3B  | Filas de deudores en perspectiva que se pliegan en 128 tiles                   |
| Un agente por deudor | 4A–4D  | Despliegue, estados en vivo con reloj split-flap, una conversación, derivación |
| Resultados           | 5A–5B  | Curva de recupero antes/después y KPIs del dashboard (datos ilustrativos)      |
| Cierre               | 6·t–6A | Los tiles vuelven al isotipo y queda el logo                                   |

- `src/launch/kit.tsx`: fondos, `Float` (profundidad, parallax, rack focus), `Panel`, `Camera`, `Cursor`, `Headline`, `TileGrid` y la máquina de estados del ejército (`armyStatus`, determinística).
- `src/launch/shots/*.tsx`: un componente por plano. El orden y la duración están en `src/launch/PactaLaunch.tsx`.

```bash
pnpm video:launch   # genera apps/video/out/pacta-launch.mp4
```

No tiene música todavía.

## Uso

Desde la raíz del repo:

```bash
pnpm video          # Remotion Studio para previsualizar y ajustar
pnpm video:render   # genera apps/video/out/pacta-pitch.mp4
```

Desde `apps/video`, `pnpm still` exporta un póster PNG del dashboard. La primera ejecución descarga Chrome Headless Shell.

Remotion tiene su propia licencia: es gratuita para personas y equipos de hasta 3 personas. Revisá [remotion.dev/license](https://remotion.dev/license) antes de usarlo con fines comerciales.

## PactaSting (36 s)

Launch film en 16:9 y 60 fps, con el lenguaje de un launch video de referencia (todo entra ya en movimiento, desenfoque según la velocidad, cortes secos en el beat) y planos de producto:

| Plano | Qué muestra |
| --- | --- |
| Encabezado | "pacta" y "Agente de cobranzas" suben en la app; el cursor hace clic en el logo |
| Ícono | Isotipo con cuatro cuadrados en órbita; zoom a través del ícono |
| 01 · Reglas | Pantalla "Reglas del agente": cuotas de 3 a 6, quita de intereses, tono, indicaciones y guardar; el margen de negociación se actualiza en vivo |
| Prompt | Barra de menú y caja de vidrio: "Negociá con mis 128 deudores" |
| 02 · Envío | El agente le escribe a toda la cartera: estados que pasan de "Link enviado" a "Acordada" y contadores |
| 03 · Chat | Negociación con Marta (Unidad 4B): verificación con DNI, propuesta formal en 6 pagos, aceptación y acta |
| 04 · Acta | Acta de acuerdo y su envío a la administración |
| Cierre | Tarjetas "Reglas" y "Actas", disco del logo y placa negra con "pacta" y la bajada |

- El guion está en frames de 30 fps (`f = frame / 2`). `beat(j)` y `cut(j)` en `src/sting/PactaSting.tsx` ubican cada corte 2 frames antes de un beat; los planos heredados del sting corto reciben un frame remapeado.
- Música: "Rising Forest" de Diego Nava ([Mixkit](https://mixkit.co/free-stock-music/house/), licencia libre) desde el segundo 43.265, a 124 BPM, con el drop en f96 y la caída de la música justo después de que aterriza la placa final. Los SFX están sintetizados y la mezcla está normalizada a −14 LUFS en `public/audio/pacta-sting.wav`.
- Código en `src/sting/`: `kit.tsx` (tiempo, smear direccional, cámara, marca, cursor, rótulos), `shots-a.tsx` (encabezado, ícono, prompt), `shots-product.tsx` (reglas, envío, chat) y `shots-b.tsx` (acta, tarjetas, logo, placa final).
- Render: `pnpm render:sting` → `out/pacta-sting.mp4`.
