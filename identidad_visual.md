# Identidad Visual y Sistema de Diseño

> Documento de referencia de branding para el proyecto **Asistente Autónomo de Cobranzas B2B**.

![Landing page – modo oscuro](C:/Users/santi/.gemini/antigravity/brain/85bd2881-a200-4a6b-ae5b-e554703c3065/landing_screenshot.png)

---

## 1. Color Primario — Rosa / Magenta

El color principal de la marca es un **rosa intenso con tendencia magenta**. Se utiliza en todos los elementos de acción e identidad: botones principales, isotipo del logo, íconos activos y acentos visuales del dashboard.

| Variante | Hex | Muestra | Descripción |
| :--- | :--- | :--- | :--- |
| **Primario (light mode)** | `#C31952` | <span style="display:inline-block;width:40px;height:20px;background:#C31952;border-radius:4px;border:1px solid #00000020;"></span> | Rosa oscuro vibrante, saturado |
| **Primario (dark mode)** | `#A21245` | <span style="display:inline-block;width:40px;height:20px;background:#A21245;border-radius:4px;border:1px solid #FFFFFF20;"></span> | Rosa profundo (marsala), desaturado |
| **Texto sobre primario** | `#FCF0F4` | <span style="display:inline-block;width:40px;height:20px;background:#FCF0F4;border-radius:4px;border:1px solid #00000015;"></span> | Rosa blanquísimo para contraste |

### ¿Por qué rosa?

| Aspecto | Justificación |
| :--- | :--- |
| **Psicología del color** | El rosa/magenta transmite **empatía, calidez y cercanía**, valores nucleares del producto. A diferencia del rojo puro (agresividad, alerta) o del azul corporativo (frialdad, distancia), este tono envuelve el acto de cobrar en un marco **no confrontativo**, que es exactamente la propuesta de valor del asistente. |
| **Diferenciación en la industria** | Las empresas de cobranza tradicionales, estudios jurídicos y ERPs contables utilizan paletas de azul oscuro, gris y rojo alertante. **Ningún competidor directo usa rosa como color principal**, lo que genera una ruptura visual inmediata y refuerza el posicionamiento de diferenciación estratégica del proyecto. |
| **Modernidad y tech** | En el ecosistema SaaS actual, el rosa/magenta es un indicador de **modernidad y disrupción** (Linear, Figma, Stripe, Arc Browser). Comunica que el producto pertenece a la nueva generación de herramientas digitales, no al software legacy. |
| **Contrapeso emocional** | La cobranza genera incomodidad. El rosa funciona como un **suavizante visual**: reduce la tensión de una interfaz que muestra datos potencialmente estresantes (montos adeudados, conversaciones pendientes, morosidad). |

---

## 2. Paleta de Colores

### 2.1 Modo Oscuro (Dark Mode) — Tema por defecto

El modo oscuro es la experiencia principal de la landing page.

| Rol | Hex | Muestra | Ejemplo de uso |
| :--- | :--- | :--- | :--- |
| **Fondo base** | `#1A1A1A` | <span style="display:inline-block;width:40px;height:20px;background:#1A1A1A;border-radius:4px;border:1px solid #FFFFFF30;"></span> | Fondo general de la página |
| **Fondo elevado** | `#2D2D2D` | <span style="display:inline-block;width:40px;height:20px;background:#2D2D2D;border-radius:4px;border:1px solid #FFFFFF30;"></span> | Cards del dashboard, sidebar, popovers |
| **Superficie sutil** | `#3B3B3B` | <span style="display:inline-block;width:40px;height:20px;background:#3B3B3B;border-radius:4px;border:1px solid #FFFFFF30;"></span> | Badges, áreas secundarias, hover states |
| **Texto principal** | `#FAFAFA` | <span style="display:inline-block;width:40px;height:20px;background:#FAFAFA;border-radius:4px;border:1px solid #00000015;"></span> | Títulos, cuerpo de texto, cifras |
| **Texto secundario** | `#ABABAB` | <span style="display:inline-block;width:40px;height:20px;background:#ABABAB;border-radius:4px;border:1px solid #00000015;"></span> | Subtítulos, labels, placeholders |
| **Bordes** | `#FFFFFF1A` | <span style="display:inline-block;width:40px;height:20px;background:#FFFFFF1A;border-radius:4px;border:1px solid #FFFFFF30;"></span> | Separadores, contornos de cards |
| **Primario** | `#A21245` | <span style="display:inline-block;width:40px;height:20px;background:#A21245;border-radius:4px;border:1px solid #FFFFFF20;"></span> | Botones CTA, íconos activos, acentos |
| **Destructivo** | `#F06050` | <span style="display:inline-block;width:40px;height:20px;background:#F06050;border-radius:4px;border:1px solid #00000015;"></span> | Alertas de error, estados críticos |

#### ¿Por qué el modo oscuro es el tema por defecto?

| Aspecto | Justificación |
| :--- | :--- |
| **Reducción de fatiga visual** | El público objetivo (administradores, tesoreros) pasa largas horas frente a pantallas gestionando planillas. El fondo oscuro reduce la emisión de luz y el cansancio ocular en sesiones prolongadas. |
| **Jerarquía visual** | Sobre fondo oscuro, las métricas del dashboard (`$8,4M`, `42 acuerdos`, `18 conversaciones`) brillan con mayor contraste, haciendo que los datos de valor sean lo primero que el ojo captura. |
| **Percepción premium** | Las interfaces oscuras generan una sensación de sofisticación y profesionalismo tecnológico. Esto posiciona al producto lejos del aspecto "planilla de Excel" con el que compite en la mente del usuario. |
| **Potencia del rosa** | El primario magenta adquiere **máxima potencia visual** sobre fondos oscuros, haciendo que los botones CTA ("Probar el dashboard", "+ Nueva negociación") sean imposibles de ignorar. |

---

### 2.2 Modo Claro (Light Mode)

El modo claro se activa automáticamente cuando el sistema operativo del usuario tiene configurado el tema claro.

| Rol | Hex | Muestra | Ejemplo de uso |
| :--- | :--- | :--- | :--- |
| **Fondo base** | `#FFFFFF` | <span style="display:inline-block;width:40px;height:20px;background:#FFFFFF;border-radius:4px;border:1px solid #00000015;"></span> | Fondo general |
| **Superficie sutil** | `#F5F5F5` | <span style="display:inline-block;width:40px;height:20px;background:#F5F5F5;border-radius:4px;border:1px solid #00000015;"></span> | Áreas secundarias |
| **Texto principal** | `#1A1A1A` | <span style="display:inline-block;width:40px;height:20px;background:#1A1A1A;border-radius:4px;border:1px solid #FFFFFF30;"></span> | Títulos, cuerpo de texto |
| **Texto secundario** | `#808080` | <span style="display:inline-block;width:40px;height:20px;background:#808080;border-radius:4px;border:1px solid #00000015;"></span> | Subtítulos, labels, placeholders |
| **Bordes** | `#E5E5E5` | <span style="display:inline-block;width:40px;height:20px;background:#E5E5E5;border-radius:4px;border:1px solid #00000015;"></span> | Separadores, contornos |
| **Primario** | `#C31952` | <span style="display:inline-block;width:40px;height:20px;background:#C31952;border-radius:4px;border:1px solid #00000015;"></span> | Botones CTA, íconos activos |
| **Destructivo** | `#DC2626` | <span style="display:inline-block;width:40px;height:20px;background:#DC2626;border-radius:4px;border:1px solid #00000015;"></span> | Alertas de error |

#### ¿Por qué ofrecer también modo claro?

| Aspecto | Justificación |
| :--- | :--- |
| **Accesibilidad** | Algunos usuarios trabajan en ambientes muy iluminados (oficinas con luz natural) donde el modo oscuro puede dificultar la lectura. El modo claro garantiza legibilidad en todas las condiciones. |
| **Impresión y reportes** | Si el usuario necesita capturar pantallas del dashboard para reportar al consorcio o al directorio del colegio, el modo claro genera impresiones más legibles y con menor consumo de tinta. |
| **Respeto a la preferencia del usuario** | Ofrecer ambos modos demuestra que el producto se adapta al usuario y no al revés, lo cual es coherente con la filosofía empática de la marca. |

---

### 2.3 Gradientes del Hero

La sección principal de la landing utiliza un **gradiente animado** (shader gradient) que cambia según el modo:

**Modo Oscuro:**

| Paso | Hex | Muestra | Tono |
| :--- | :--- | :--- | :--- |
| 1 | `#792440` | <span style="display:inline-block;width:40px;height:20px;background:#792440;border-radius:4px;border:1px solid #FFFFFF20;"></span> | Rosa marsala |
| 2 | `#501F38` | <span style="display:inline-block;width:40px;height:20px;background:#501F38;border-radius:4px;border:1px solid #FFFFFF20;"></span> | Vino profundo |
| 3 | `#322523` | <span style="display:inline-block;width:40px;height:20px;background:#322523;border-radius:4px;border:1px solid #FFFFFF20;"></span> | Marrón slate |
| 4 | `#2C2B41` | <span style="display:inline-block;width:40px;height:20px;background:#2C2B41;border-radius:4px;border:1px solid #FFFFFF20;"></span> | Azul grisáceo |

**Modo Claro:**

| Paso | Hex | Muestra | Tono |
| :--- | :--- | :--- | :--- |
| 1 | `#E7B5BF` | <span style="display:inline-block;width:40px;height:20px;background:#E7B5BF;border-radius:4px;border:1px solid #00000015;"></span> | Rosa pastel |
| 2 | `#EDCDDB` | <span style="display:inline-block;width:40px;height:20px;background:#EDCDDB;border-radius:4px;border:1px solid #00000015;"></span> | Rosa pálido |
| 3 | `#F5F5F8` | <span style="display:inline-block;width:40px;height:20px;background:#F5F5F8;border-radius:4px;border:1px solid #00000015;"></span> | Gris lavanda |
| 4 | `#E3E3F2` | <span style="display:inline-block;width:40px;height:20px;background:#E3E3F2;border-radius:4px;border:1px solid #00000015;"></span> | Lavanda suave |

#### Justificación

Los gradientes cumplen una triple función:
1. **Identidad:** Refuerzan el rosa como color de marca sin necesidad de fondos planos que podrían resultar agresivos en pantalla completa.
2. **Inmersión:** El movimiento sutil del shader genera una sensación orgánica y viva que diferencia la landing de las páginas estáticas de la competencia.
3. **Transición narrativa:** El gradiente crea una transición visual natural entre el hero (espacio emocional, el "problema") y el preview del dashboard (espacio racional, la "solución").

---

## 3. Tipografía — Geist Variable

La fuente elegida para todo el producto es **Geist Variable**, la familia tipográfica diseñada por Vercel. Se usa tanto para títulos como para cuerpo de texto.

| Uso | Peso | Tracking | Ejemplo |
| :--- | :--- | :--- | :--- |
| **Título principal (hero)** | Semibold (600) | Compacto (negativo) | "Recuperá deuda sin convertir cada cobro en una pelea." |
| **Nombre de marca** | Semibold (600) | Compacto | "Cobro" |
| **Cuerpo de texto** | Regular (400) | Normal | Párrafos, descripciones, labels |
| **Datos numéricos** | Variable | Normal | "$8,4M", "42", "18" |

### ¿Por qué Geist?

| Aspecto | Justificación |
| :--- | :--- |
| **Neutralidad geométrica** | Geist es una sans-serif geométrica diseñada para interfaces digitales. No tiene la connotación de "marketing ruidoso" de fuentes como Poppins, ni la frialdad clínica de Roboto. Ocupa el punto medio perfecto: **profesional sin ser aburrida, moderna sin ser informal**. |
| **Legibilidad de datos financieros** | El producto muestra cifras monetarias, porcentajes y contadores. Geist tiene proporciones tabulares excelentes que evitan el "salto" visual cuando los números cambian en tiempo real. |
| **Coherencia con el ecosistema** | Geist es la fuente oficial del AI SDK de Vercel que utiliza el proyecto. Compartir familia tipográfica refuerza la percepción de que el producto está construido con tecnología de punta. |
| **Performance** | Al ser una fuente variable, un único archivo cubre todos los pesos (de 100 a 900), reduciendo el tiempo de carga versus cargar múltiples archivos de fuente por separado. |
| **Tracking compacto en el hero** | Las letras del título principal están levemente comprimidas. Esta técnica genera un bloque visual con más peso e impacto, estándar en headlines de productos SaaS premium. Transmite confianza y solidez. |

---

## 4. Logo e Isotipo

### 4.1 Composición

El logo se compone de dos elementos:

```
[ 🏢 ]  Cobro
  ↑         ↑
isotipo   logotipo
```

| Elemento | Descripción |
| :--- | :--- |
| **Isotipo** | Un cuadrado con bordes redondeados en color rosa primario, conteniendo un ícono lineal de edificio en blanco. |
| **Logotipo** | La palabra "Cobro" en Geist Semibold con tracking compacto, posicionada a la derecha del isotipo. |

### 4.2 Comportamiento

| Contexto | Qué se muestra |
| :--- | :--- |
| **Navbar completa** | Isotipo + logotipo (composición horizontal) |
| **Favicon / pestañas del navegador** | Solo isotipo (cuadrado rosa con edificio) |
| **Sidebar del dashboard** | Isotipo + nombre de la organización del cliente |

### ¿Por qué este diseño?

| Aspecto | Justificación |
| :--- | :--- |
| **Ícono de edificio** | Referencia directa al **dominio principal**: administración de consorcios y comunidades. Comunica inmediatamente "gestión institucional" sin necesidad de texto explicativo. |
| **Forma cuadrada redondeada** | Sigue la convención de íconos de app (iOS, Android, macOS). Genera **familiaridad instantánea** y sugiere que el producto puede evolucionar hacia una app nativa o PWA. |
| **Color del isotipo** | El fondo rosa primario garantiza que el logo sea **reconocible instantáneamente** incluso en tamaños mínimos (16px en favicon). La marca se identifica por color antes que por forma. |
| **Simplicidad del ícono** | El edificio está representado con trazos lineales simples, sin detalles finos que se pierdan en tamaños reducidos. Funciona desde un favicon de 16px hasta una diapositiva de presentación. |
| **Nombre "Cobro"** | Es directo, honesto, y brutalmente minimalista. No esconde lo que el producto hace. Sigue la tendencia de nombres de una sola palabra en SaaS (Stripe, Linear, Notion, Figma). |

---

## 5. Adaptabilidad y Responsividad

### 5.1 Tres niveles de adaptación

La interfaz se adapta a tres tamaños de pantalla:

| Nivel | Dispositivo objetivo | Ancho mínimo |
| :--- | :--- | :--- |
| **Mobile** | Smartphones | Cualquier ancho |
| **Tablet** | Tablets, smartphones grandes | 640px |
| **Desktop** | Laptops, monitores | 1024px |

### 5.2 Qué cambia en cada nivel

| Elemento | Mobile | Tablet | Desktop |
| :--- | :--- | :--- | :--- |
| **Título del hero** | Tamaño mediano | Grande | Muy grande |
| **Botones CTA** | Apilados verticalmente | En línea horizontal | En línea horizontal |
| **Navbar** | Más compacta, menos padding | Más alta y espaciada | Igual que tablet |
| **Isotipo del logo** | 28px | 32px | 32px |
| **Márgenes laterales** | Estrechos | Medios | Amplios |

### ¿Por qué estas decisiones de adaptación?

| Decisión | Justificación |
| :--- | :--- |
| **Botones apilados en mobile** | Los dos CTAs ("Probar el dashboard" y "Ver cómo funciona") se apilan verticalmente para dar suficiente área de toque en pantallas pequeñas, cumpliendo las guías de accesibilidad táctil (mínimo 44px de altura). |
| **Escala tipográfica progresiva** | El título crece significativamente entre mobile y desktop. Esto aprovecha el espacio disponible en pantallas grandes para generar impacto visual sin sacrificar legibilidad en dispositivos pequeños. |
| **Navbar flotante centrada** | La barra de navegación tiene un ancho máximo fijo y flota centrada en la parte superior. Esto evita que se pierda en monitores ultra-anchos y mantiene la atención del usuario en el centro de la pantalla. |
| **Solo 3 breakpoints** | La simplicidad de 3 niveles reduce la complejidad de mantenimiento y cubre el 99% de los dispositivos que usará el target (teléfono personal, tablet de oficina, computadora de escritorio). |

### 5.3 Detección Automática de Tema (Dark / Light)

El producto **no obliga al usuario a elegir un tema**. Detecta automáticamente la preferencia del sistema operativo y se adapta:

```
Preferencia del Sistema Operativo
            ↓
    ┌───────┴───────┐
    ▼               ▼
 Modo Oscuro    Modo Claro
    │               │
    ├─ Gradientes profundos   ├─ Gradientes pastel
    ├─ Texto blanco           ├─ Texto negro
    ├─ Navbar translúcida     ├─ Navbar clara
    └─ Rosa más profundo      └─ Rosa más vibrante
```

| Aspecto | Justificación |
| :--- | :--- |
| **Respeto a la preferencia del usuario** | No forzar un tema demuestra que el producto se adapta al contexto del usuario, no al revés. Si el administrador trabaja de noche con modo oscuro, la app no lo deslumbra. Si trabaja de día con modo claro, la app se integra. |
| **Coherencia con la filosofía del producto** | Un asistente que se adapta al deudor para negociar con empatía también debería adaptarse al administrador en su experiencia visual. La adaptabilidad es un valor transversal de la marca. |

---

## 6. Sistema de Bordes Redondeados

Todos los elementos de la interfaz usan esquinas redondeadas con una escala progresiva:

| Tamaño | Uso |
| :--- | :--- |
| **Pequeño** (~6px) | Badges, etiquetas, elementos inline |
| **Medio** (~8px) | Inputs, botones secundarios |
| **Base** (~10px) | Cards, botones primarios, navbar |
| **Grande** (~14px) | Cards destacadas, modales |
| **Extra grande** (~18-22px) | Contenedores hero, elementos decorativos |

### ¿Por qué bordes redondeados?

| Aspecto | Justificación |
| :--- | :--- |
| **Percepción de amabilidad** | Las esquinas suaves están psicológicamente asociadas con la accesibilidad y la calidez. Las esquinas rectas transmiten rigidez y formalidad. Para un producto que busca humanizar la cobranza, los bordes redondeados son una extensión visual de esa intención. |
| **Consistencia con el isotipo** | El logo (cuadrado redondeado) establece la "firma" visual de bordes suaves. Todos los elementos de la interfaz deben hablar el mismo lenguaje formal para que la marca sea coherente. |
| **Tendencia de diseño actual** | Los productos SaaS de referencia (shadcn/ui, Vercel, Linear) utilizan bordes redondeados como estándar. Adoptar esta convención posiciona al producto dentro del ecosistema visual que su target técnico reconoce como "moderno". |

---

## 7. Resumen de Identidad Visual

| Pilar | Decisión | Intención |
| :--- | :--- | :--- |
| **Color primario** | Rosa / Magenta (`#C31952` / `#A21245`) | Empatía, modernidad, diferenciación vs. competidores |
| **Colores neutros** | Escala de grises sin saturación | Legibilidad, jerarquía, protagonismo de los datos |
| **Tema por defecto** | Oscuro (con light automático) | Premium, anti-fatiga, contraste del rosa |
| **Gradientes** | Shader animado rosa-slate / rosa-lavanda | Inmersión, identidad, transición narrativa |
| **Tipografía** | Geist Variable (Vercel) | Claridad técnica, datos financieros, coherencia tech |
| **Logo** | Edificio rosa + "Cobro" | Dominio inmobiliario/institucional + nombre directo |
| **Bordes** | Redondeados progresivos (6-22px) | Suavidad, accesibilidad, coherencia con el isotipo |
| **Responsividad** | 3 breakpoints (mobile, tablet, desktop) | Cobertura total de dispositivos del target |
| **Tema adaptativo** | Detección automática del SO | Respeto al usuario, coherencia con la filosofía empática |
