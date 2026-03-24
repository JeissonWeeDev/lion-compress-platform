# Plan de Requisitos Expandido: LionMedia Compress

## Documento de Especificacion Arquitectonica y Funcional Completa

**Organizacion:** Lion Labs (GitLab)
**Nombre del Proyecto:** LionMedia Compress
**Version del documento:** 2.0
**Fecha:** 23 de marzo de 2026

---

## Tabla de Contenidos

1. [Vision General Expandida](#1-vision-general-expandida)
2. [Identidad de Marca y Sistema de Diseno](#2-identidad-de-marca-y-sistema-de-diseno)
3. [Filosofia UX/UI - Analisis Profundo](#3-filosofia-uxui---analisis-profundo)
4. [Arquitectura Tecnica Detallada](#4-arquitectura-tecnica-detallada)
5. [Infraestructura y DevOps](#5-infraestructura-y-devops)
6. [Especificaciones Funcionales Expandidas](#6-especificaciones-funcionales-expandidas)
7. [Motor de Procesamiento](#7-motor-de-procesamiento)
8. [Rendimiento y Presupuestos Tecnicos](#8-rendimiento-y-presupuestos-tecnicos)
9. [Accesibilidad (WCAG 2.1 AA)](#9-accesibilidad-wcag-21-aa)
10. [Seguridad](#10-seguridad)
11. [SEO y Marketing](#11-seo-y-marketing)
12. [Sistema de Anuncios (Pluggable)](#12-sistema-de-anuncios-pluggable)
13. [Analiticas](#13-analiticas)
14. [Estrategia de Testing](#14-estrategia-de-testing)
15. [Internacionalizacion](#15-internacionalizacion)
16. [PWA y Offline](#16-pwa-y-offline)
17. [Manejo de Errores Expandido](#17-manejo-de-errores-expandido)
18. [Plan de Desarrollo por Fases (Expandido)](#18-plan-de-desarrollo-por-fases-expandido)
19. [Stack Tecnologico Final](#19-stack-tecnologico-final)

---

## 1. Vision General Expandida

### 1.1 Declaracion de Mision

LionMedia Compress es una plataforma SaaS de compresion de imagenes y video que prioriza la privacidad absoluta del usuario mediante procesamiento 100% client-side. El sistema utiliza WebAssembly (via jSquash) para imagenes y WebCodecs (via Mediabunny) para video, garantizando que ningun archivo abandone jamas el navegador del usuario.

### 1.2 Propuesta de Valor Unica

| Aspecto | LionMedia Compress | Competidores tipicos (TinyPNG, CloudConvert) |
|---|---|---|
| **Privacidad** | 100% client-side, cero subidas al servidor | Los archivos se suben y procesan en servidores remotos |
| **Velocidad** | Aceleracion por hardware (WebCodecs/GPU) | Limitado por velocidad de subida/descarga |
| **Costo operativo** | Practicamente nulo (Vercel free/hobby tier) | Servidores de procesamiento costosos |
| **Limites de archivo** | Solo limitado por la RAM del dispositivo | Limites artificiales por plan de pago |
| **UX** | Premium, inspirada en Apple/Vercel | Funcional pero generica |

### 1.3 Publico Objetivo

- **Primario:** Desarrolladores web y disenadores que necesitan optimizar assets para produccion.
- **Secundario:** Creadores de contenido, community managers, bloggers que manejan grandes volumenes de imagenes.
- **Terciario:** Usuarios conscientes de la privacidad que no desean subir archivos sensibles a servicios en la nube.

### 1.4 Criterios de Exito del Proyecto

| Metrica | Objetivo MVP | Objetivo 6 meses |
|---|---|---|
| Lighthouse Performance | >= 95 | >= 98 |
| LCP (Largest Contentful Paint) | < 1.5s | < 1.0s |
| Tiempo de compresion (imagen 5MB JPG) | < 3s | < 2s |
| Usuarios activos mensuales | 500 | 10,000 |
| Tasa de rebote | < 40% | < 30% |
| Bundle size (initial JS) | < 150KB gzipped | < 120KB gzipped |

---

## 2. Identidad de Marca y Sistema de Diseno

### 2.1 Nombre y Branding

- **Nombre definitivo:** LionMedia Compress (abreviado: LionCompress en URLs y dominios)
- **Organizacion GitLab:** Lion Labs (`gitlab.com/lion-labs`)
- **Repositorio:** `gitlab.com/lion-labs/lionmedia-compress`
- **Dominio sugerido:** `lioncompress.dev` o `lionmedia.app`

### 2.2 Logo

- Concepto: Letra "L" geometrica minimalista con un sutil gradiente azul-purpura.
- Variantes requeridas: Logo completo (icono + texto), icono solo (favicon/PWA), monocromo (para fondos oscuros/claros), version animada (Lottie) para splash screen.

### 2.3 Sistema de Color con Tokens Semanticos

En lugar de usar valores hex directamente en el codigo, se define un sistema de tokens que permite theming y dark mode:

```
/* ===== Tokens Primitivos (Escala base) ===== */
--color-gray-50:  #FAFAFA;
--color-gray-100: #F5F5F7;
--color-gray-200: #E5E5EA;
--color-gray-300: #D1D1D6;
--color-gray-400: #AEAEB2;
--color-gray-500: #8E8E93;
--color-gray-600: #636366;
--color-gray-700: #48484A;
--color-gray-800: #2C2C2E;
--color-gray-900: #1C1C1E;
--color-gray-950: #111111;

--color-blue-500:  #3B82F6;
--color-blue-600:  #2563EB;
--color-purple-500: #8B5CF6;
--color-purple-600: #7C3AED;

--color-green-500: #22C55E;
--color-red-500:   #EF4444;
--color-amber-500: #F59E0B;

/* ===== Tokens Semanticos (Light Mode) ===== */
--color-bg-primary:     var(--color-gray-50);
--color-bg-secondary:   #FFFFFF;
--color-bg-tertiary:    var(--color-gray-100);
--color-bg-elevated:    #FFFFFF;

--color-text-primary:   var(--color-gray-950);
--color-text-secondary: var(--color-gray-600);
--color-text-tertiary:  var(--color-gray-400);
--color-text-inverse:   #FFFFFF;

--color-accent-primary:   var(--color-blue-600);
--color-accent-gradient:  linear-gradient(135deg, var(--color-blue-500), var(--color-purple-500));

--color-border-default:  var(--color-gray-200);
--color-border-hover:    var(--color-gray-300);
--color-border-focus:    var(--color-blue-500);

--color-status-success:  var(--color-green-500);
--color-status-error:    var(--color-red-500);
--color-status-warning:  var(--color-amber-500);
--color-status-info:     var(--color-blue-500);

/* ===== Tokens Semanticos (Dark Mode) ===== */
/* Se invierte la escala de grises y se ajustan acentos */
--color-bg-primary:     var(--color-gray-950);
--color-bg-secondary:   var(--color-gray-900);
--color-bg-tertiary:    var(--color-gray-800);
--color-bg-elevated:    var(--color-gray-800);

--color-text-primary:   var(--color-gray-50);
--color-text-secondary: var(--color-gray-400);
--color-text-tertiary:  var(--color-gray-600);
```

Estos tokens se implementan como variables CSS en `:root` y `[data-theme="dark"]`, y se exponen en `tailwind.config.ts` como colores personalizados.

### 2.4 Escala Tipografica

**Fuente principal:** Inter (Google Fonts, variable font)
**Fuente monoespaciada:** JetBrains Mono (para datos tecnicos como tamanos de archivo)

| Token | Tamano | Peso | Line Height | Uso |
|---|---|---|---|---|
| `text-display` | 48px / 3rem | 700 | 1.1 | Hero landing |
| `text-h1` | 36px / 2.25rem | 700 | 1.2 | Titulos de seccion |
| `text-h2` | 28px / 1.75rem | 600 | 1.3 | Subtitulos |
| `text-h3` | 22px / 1.375rem | 600 | 1.4 | Encabezados de tarjeta |
| `text-body-lg` | 18px / 1.125rem | 400 | 1.6 | Texto destacado |
| `text-body` | 16px / 1rem | 400 | 1.6 | Texto principal |
| `text-body-sm` | 14px / 0.875rem | 400 | 1.5 | Texto secundario, etiquetas |
| `text-caption` | 12px / 0.75rem | 500 | 1.4 | Metadatos, badges |
| `text-mono` | 14px / 0.875rem | 400 (JetBrains Mono) | 1.5 | Datos de archivo, estadisticas |

### 2.5 Espaciado y Grid

- **Sistema de 4px:** Todo el espaciado es multiplo de 4px (4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128).
- **Contenedor maximo:** 1280px con padding lateral de 24px (mobile) / 48px (desktop).
- **Radio de borde:** `sm: 6px`, `md: 10px`, `lg: 16px`, `xl: 24px`, `full: 9999px`.
- **Sombras (elevation system):**
  - `shadow-sm`: `0 1px 2px rgba(0,0,0,0.04)` -- tarjetas sutiles
  - `shadow-md`: `0 4px 12px rgba(0,0,0,0.08)` -- tarjetas elevadas
  - `shadow-lg`: `0 8px 24px rgba(0,0,0,0.12)` -- modales, dropdowns
  - `shadow-xl`: `0 16px 48px rgba(0,0,0,0.16)` -- elementos flotantes

---

## 3. Filosofia UX/UI - Analisis Profundo

### 3.1 Que Hace Premium a Apple, Vercel y Supabase

El analisis se centra en los patrones que estas marcas comparten y que debemos replicar:

#### 3.1.1 Principio de Reduccion (Apple)
- **Menos es mas:** Cada pixel en pantalla debe justificar su existencia. Si un elemento no aporta informacion o accion, se elimina.
- **Espacio negativo generoso:** Apple utiliza enormes margenes y padding para dar "aire" al contenido. Esto transmite confianza y calidad.
- **Aplicacion en LionMedia:** La zona de drop debe ser el protagonista absoluto. No hay sidebar, no hay menus complejos. Solo la accion principal.

#### 3.1.2 Principio de Respuesta Inmediata (Vercel)
- **Feedback instantaneo:** Cada clic produce una respuesta visual en menos de 100ms. Nunca hay un "momento muerto" donde el usuario no sabe si su accion se registro.
- **Estados de carga inteligentes:** Vercel usa skeletons y transiciones suaves en lugar de spinners. El contenido "aparece" de forma progresiva.
- **Aplicacion en LionMedia:** Al soltar un archivo, la tarjeta del archivo aparece inmediatamente con un skeleton del preview. La compresion comienza automaticamente y la barra de progreso se anima de forma fluida.

#### 3.1.3 Principio de Claridad de Datos (Supabase)
- **Dashboard informativo:** Supabase presenta informacion tecnica de forma visualmente atractiva, con tipografia monoespaciada para datos y colores semanticos claros.
- **Aplicacion en LionMedia:** Los resultados de compresion se presentan como tarjetas con datos claros: tamano original, tamano comprimido, porcentaje de ahorro, formato de salida. Todo con tipografia mono para numeros.

### 3.2 Sistema de Motion Design

#### 3.2.1 Principios de Animacion

1. **Proposito:** Toda animacion debe comunicar algo (estado, jerarquia, relacion espacial). Nunca es decorativa.
2. **Naturalidad:** Movimientos que imitan fisica real. Deceleration al final (ease-out), aceleracion al inicio (ease-in).
3. **Velocidad:** Rapido para micro-interacciones (150-200ms), medio para transiciones de layout (300-400ms), lento solo para entradas de pagina (500-700ms).

#### 3.2.2 Curvas de Easing

```
--ease-out:        cubic-bezier(0.16, 1, 0.3, 1);     /* Para entradas */
--ease-in:         cubic-bezier(0.55, 0.055, 0.675, 0.19); /* Para salidas */
--ease-in-out:     cubic-bezier(0.87, 0, 0.13, 1);    /* Para transiciones */
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);  /* Para acciones de exito */
--ease-bounce:     cubic-bezier(0.68, -0.55, 0.265, 1.55); /* Para feedback de error */
```

#### 3.2.3 Duraciones

| Contexto | Duracion | Ejemplo |
|---|---|---|
| Hover/Focus | 150ms | Cambio de color de boton |
| Micro-interaccion | 200ms | Toggle switch, checkbox |
| Expansion/colapso | 300ms | Acordeon, drawer |
| Transicion de pagina | 400ms | Navegacion entre vistas |
| Entrada inicial | 600ms | Primera carga de la app |
| Progreso | 100ms (update interval) | Barra de compresion |

#### 3.2.4 Micro-interacciones Especificas

**Zona de Drop:**
- Estado idle: Borde dashed gris con icono de subida centrado, pulso sutil cada 3 segundos.
- Estado hover (archivo sobre la zona): Borde se vuelve solido con color accent, fondo con tint de color accent al 5%, escala 1.01 con spring easing. Icono se transforma en flecha hacia abajo.
- Estado drop (archivo soltado): Flash de color accent al 10%, ripple effect desde punto de drop, transicion rapida a estado de procesamiento.

**Tarjetas de Archivo:**
- Entrada: Slide-up + fade-in, staggered a 50ms entre tarjetas.
- Progreso: Barra de progreso con gradiente animado (shimmer effect).
- Completado: Checkmark animado (stroke animation), counter de ahorro que cuenta de 0% al porcentaje final.
- Error: Shake horizontal sutil (3 ciclos, 4px), icono de alerta con bounce-in.

**Boton de Descarga:**
- Hover: Elevacion sube (shadow-md a shadow-lg), scale(1.02).
- Active: scale(0.98), sombra se reduce.
- Descargando: Icono de download se transforma en spinner, luego en checkmark.

### 3.3 Estados Vacios y de Carga

#### 3.3.1 Estado Vacio (Sin Archivos)
- Ilustracion minimalista (lineas geometricas, no cartoon).
- Texto principal: "Arrastra tus archivos aqui"
- Texto secundario: "o haz clic para seleccionar. Soportamos JPG, PNG, WebP, AVIF, MP4, WebM."
- Atajos de teclado visibles: "Ctrl+V para pegar desde portapapeles"
- Sin estado de "primera visita" invasivo. Tooltip ligero en primera visita que desaparece solo.

#### 3.3.2 Skeletons
- Se usan skeletons (rectangulos animados con shimmer) en lugar de spinners para:
  - Preview de imagenes mientras se genera el thumbnail.
  - Datos de compresion mientras se procesa.
  - Lista de archivos mientras se analizan los metadatos.

### 3.4 Responsive Breakpoints

| Breakpoint | Nombre | Dispositivo | Layout |
|---|---|---|---|
| 0-639px | `sm` (mobile) | Telefono | Stack vertical, drop zone full width, resultados en lista |
| 640-767px | `md` (tablet-sm) | Tablet portrait | Similar a mobile con mas padding |
| 768-1023px | `lg` (tablet) | Tablet landscape | Grid 2 columnas para resultados |
| 1024-1279px | `xl` (desktop) | Laptop | Grid 3 columnas, sidebar para config |
| 1280px+ | `2xl` (wide) | Monitor | Contenido centrado con max-width, grid 4 columnas |

### 3.5 Dark Mode

- **Implementacion:** Deteccion automatica via `prefers-color-scheme` + toggle manual persistido en `localStorage`.
- **Transicion:** 200ms en `background-color` y `color` para evitar flash al cambiar.
- **No es simplemente invertir colores:** Las sombras se reemplazan por bordes sutiles en dark mode. Los colores de acento se ajustan para mantener contraste WCAG AA (4.5:1 para texto, 3:1 para elementos UI grandes).

### 3.6 Estructura de la Landing Page

```
[Header]
  Logo | Nav (Caracteristicas, Formatos, Open Source?) | Theme Toggle

[Hero Section]
  Titulo: "Comprime imagenes y video. En tu navegador. Gratis."
  Subtitulo: "Procesamiento 100% local. Tus archivos nunca salen de tu dispositivo."
  
  [=== ZONA DE DROP (Protagonista) ===]
  |                                    |
  |    Icono de subida animado         |
  |    "Arrastra archivos aqui"        |
  |    [Seleccionar archivos]          |
  |    JPG PNG WebP AVIF MP4 WebM      |
  |____________________________________|

[Trust Indicators] (debajo del hero)
  Icono candado: "100% Privado"
  Icono rayo: "Acelerado por hardware"
  Icono codigo: "Open Source" (si aplica)

[Como Funciona] (3 pasos ilustrados)
  1. Sube -> 2. Configura -> 3. Descarga

[Formatos Soportados] (tabla visual con logos de formatos)

[Footer]
  Links | GitLab | Privacidad | Contacto
  [Slot de Anuncio - EthicalAds/Carbon]
```

### 3.7 Onboarding para Usuarios Nuevos

- **No hay onboarding obligatorio.** La interfaz debe ser tan intuitiva que no se necesite.
- **Primer uso:** Un tooltip sutil (no modal) aparece junto a la zona de drop: "Tambien puedes pegar imagenes con Ctrl+V". Se marca como visto en localStorage y no vuelve a aparecer.
- **Feature discovery progresivo:** Las opciones avanzadas (modo Custom, conversion de formato) se revelan solo cuando el usuario interactua con la configuracion basica.

---

## 4. Arquitectura Tecnica Detallada

### 4.1 Stack Frontend

| Tecnologia | Version | Proposito |
|---|---|---|
| Next.js | 15.x (App Router) | Framework, SSG para landing, client components para app |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Zustand | 5.x | State management (ligero, sin boilerplate) |
| Framer Motion | 12.x | Animaciones declarativas |
| clsx | 2.x | Composicion condicional de clases |
| lucide-react | latest | Iconos SVG consistentes |
| jszip | 3.x | Generacion de ZIP client-side |

### 4.2 Motor de Procesamiento

| Tecnologia | Proposito |
|---|---|
| `@jsquash/jpeg` | Codificacion/decodificacion JPEG (MozJPEG) |
| `@jsquash/png` | Decodificacion PNG |
| `@jsquash/oxipng` | Optimizacion PNG (Oxipng) |
| `@jsquash/webp` | Codificacion/decodificacion WebP (libwebp) |
| `@jsquash/avif` | Codificacion/decodificacion AVIF (libavif) |
| `@jsquash/resize` | Redimensionamiento de imagenes |
| `mediabunny` | Lectura/escritura de contenedores multimedia, puente a WebCodecs |

### 4.3 Diagrama de Arquitectura de Web Workers

```
Main Thread (UI)                    Worker Pool
=================                   ========================
                                    
[React App]                         [Image Worker 1]
  |                                   - jSquash codecs (WASM)
  |-- postMessage(file) ---------->   - Encode/Decode
  |<-- postMessage(result) --------   - Resize
  |                                 
  |                                 [Image Worker 2]
  |-- postMessage(file) ---------->   - (misma logica, concurrencia)
  |<-- postMessage(result) --------
  |                                 
  |                                 [Video Worker]
  |-- postMessage(videoFile) ----->   - Mediabunny demux
  |<-- postMessage(progress) ------   - WebCodecs decode/encode
  |<-- postMessage(result) --------   - Mediabunny mux
  |
  |                                 [ZIP Worker]
  |-- postMessage(files[]) ------->   - JSZip generation
  |<-- postMessage(blob) ----------
  
[Zustand Store]
  - files: FileItem[]
  - compressionSettings: Settings
  - processingQueue: Queue
  - results: Result[]
```

**Estrategia de concurrencia:**
- `navigator.hardwareConcurrency` determina el numero de workers de imagen (maximo 4, minimo 1).
- Un solo worker dedicado para video (procesamiento secuencial por naturaleza del stream).
- Un worker dedicado para generacion de ZIP (evita bloquear UI con archivos grandes).

### 4.4 Modelo de Datos (Zustand Store)

```typescript
interface FileItem {
  id: string;                    // nanoid
  file: File;                    // Referencia al File original
  name: string;
  size: number;                  // bytes originales
  type: 'image' | 'video';
  mimeType: string;
  thumbnail?: string;            // Object URL del preview
  status: 'queued' | 'processing' | 'completed' | 'error';
  progress: number;              // 0-100
  error?: string;
  result?: CompressionResult;
}

interface CompressionResult {
  blob: Blob;                    // Archivo comprimido
  size: number;                  // bytes resultantes
  savings: number;               // porcentaje de ahorro
  outputFormat: string;          // formato de salida
  duration: number;              // ms que tardo la compresion
  metadata?: MediaMetadata;      // info adicional (dimensiones, codec, etc.)
}

interface CompressionSettings {
  mode: 'lossless' | 'balanced' | 'custom';
  quality: number;               // 0-100 (solo modo custom)
  maxWidth?: number;             // redimensionar si excede
  maxHeight?: number;
  outputFormat: 'same' | 'webp' | 'avif' | 'jpeg' | 'png';
  stripMetadata: boolean;        // remover EXIF, etc.
}

interface AppStore {
  files: FileItem[];
  settings: CompressionSettings;
  theme: 'light' | 'dark' | 'system';
  isFirstVisit: boolean;
  
  // Actions
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  clearAll: () => void;
  updateFileStatus: (id: string, updates: Partial<FileItem>) => void;
  updateSettings: (settings: Partial<CompressionSettings>) => void;
  startCompression: () => void;
  downloadFile: (id: string) => void;
  downloadAll: () => void;
}
```

### 4.5 Estructura de Directorios del Proyecto

```
lionmedia-compress/
├── .gitlab-ci.yml
├── .env.example
├── .env.local                    # (en .gitignore)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── public/
│   ├── favicon.ico
│   ├── manifest.json             # PWA manifest
│   ├── icons/                    # PWA icons (192, 512)
│   ├── og-image.png              # Open Graph
│   └── robots.txt
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (fonts, metadata, theme)
│   │   ├── page.tsx              # Landing/App page
│   │   ├── globals.css           # CSS variables, tokens
│   │   ├── not-found.tsx
│   │   └── manifest.ts           # Dynamic PWA manifest
│   ├── components/
│   │   ├── ui/                   # Primitivos reutilizables
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Slider.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Select.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Container.tsx
│   │   ├── drop-zone/
│   │   │   ├── DropZone.tsx
│   │   │   ├── DropZoneOverlay.tsx
│   │   │   └── PasteHandler.tsx
│   │   ├── file-list/
│   │   │   ├── FileList.tsx
│   │   │   ├── FileCard.tsx
│   │   │   ├── FilePreview.tsx
│   │   │   └── FileProgress.tsx
│   │   ├── settings/
│   │   │   ├── SettingsPanel.tsx
│   │   │   ├── ModeSelector.tsx
│   │   │   ├── QualitySlider.tsx
│   │   │   ├── FormatSelector.tsx
│   │   │   └── ResizeOptions.tsx
│   │   ├── results/
│   │   │   ├── ResultsView.tsx
│   │   │   ├── ComparisonSlider.tsx
│   │   │   ├── SavingsDisplay.tsx
│   │   │   └── DownloadActions.tsx
│   │   ├── ads/                  # Sistema pluggable de anuncios
│   │   │   ├── AdSlot.tsx
│   │   │   ├── AdProvider.tsx
│   │   │   ├── AdFallback.tsx
│   │   │   └── adapters/
│   │   │       ├── EthicalAdsAdapter.tsx
│   │   │       └── CarbonAdsAdapter.tsx
│   │   └── common/
│   │       ├── ThemeToggle.tsx
│   │       ├── KeyboardShortcuts.tsx
│   │       └── BrowserWarning.tsx
│   ├── hooks/
│   │   ├── useCompression.ts
│   │   ├── useDropZone.ts
│   │   ├── usePaste.ts
│   │   ├── useWorkerPool.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useTheme.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useLocalStorage.ts
│   ├── lib/
│   │   ├── compression/
│   │   │   ├── image-worker.ts   # Worker para imagenes
│   │   │   ├── video-worker.ts   # Worker para video
│   │   │   ├── zip-worker.ts     # Worker para ZIP
│   │   │   ├── queue.ts          # Cola de procesamiento
│   │   │   ├── presets.ts        # Configuraciones predefinidas
│   │   │   └── formats.ts        # Deteccion y mapeo de formatos
│   │   ├── utils/
│   │   │   ├── file-utils.ts     # Helpers para archivos
│   │   │   ├── format-bytes.ts   # Formateo de tamanos
│   │   │   ├── browser-support.ts # Feature detection
│   │   │   └── analytics.ts      # Wrapper de analiticas
│   │   └── constants.ts          # Constantes globales
│   ├── store/
│   │   ├── app-store.ts          # Zustand store principal
│   │   └── middleware.ts         # Persist middleware
│   └── types/
│       ├── compression.ts
│       ├── files.ts
│       └── ads.ts
├── workers/                      # Web Workers (separados para bundling)
│   ├── image.worker.ts
│   ├── video.worker.ts
│   └── zip.worker.ts
└── tests/
    ├── unit/
    ├── integration/
    ├── e2e/
    └── fixtures/                 # Archivos de prueba (imagenes/videos)
```

---

## 5. Infraestructura y DevOps

### 5.1 Repositorio GitLab

- **Organizacion:** Lion Labs (`gitlab.com/lion-labs`)
- **Repositorio principal:** `lion-labs/lionmedia-compress`
- **Estrategia de branching:** GitLab Flow
  - `main` -- Produccion (protegido, solo merge via MR)
  - `staging` -- Pre-produccion, deploys automaticos a preview
  - `feature/*` -- Ramas de desarrollo
  - `fix/*` -- Correcciones
  - `release/v*` -- Ramas de release (si se necesitan)

### 5.2 Pipeline CI/CD (`.gitlab-ci.yml`)

```yaml
# Estructura conceptual del pipeline:

stages:
  - validate        # Lint, type-check, format check
  - test            # Unit tests, integration tests
  - build           # Build Next.js
  - deploy-preview  # Deploy a Vercel preview (MRs)
  - deploy-staging  # Deploy a staging (merge a staging)
  - deploy-prod     # Deploy a produccion (merge a main)
  - post-deploy     # Lighthouse CI, smoke tests

# Variables requeridas en GitLab CI/CD Settings:
# - VERCEL_TOKEN
# - VERCEL_ORG_ID
# - VERCEL_PROJECT_ID
# - SENTRY_AUTH_TOKEN (si se usa Sentry)
```

**Jobs detallados:**

| Stage | Job | Trigger | Accion |
|---|---|---|---|
| validate | `lint` | Todos los pushes | ESLint + Prettier check |
| validate | `typecheck` | Todos los pushes | `tsc --noEmit` |
| test | `unit-tests` | Todos los pushes | Vitest con coverage |
| test | `e2e-tests` | Solo MRs hacia main/staging | Playwright |
| build | `build-next` | MRs y main/staging | `vercel build` |
| deploy-preview | `deploy-preview` | MRs abiertas | `vercel deploy` (URL preview) |
| deploy-staging | `deploy-staging` | Merge a staging | `vercel deploy` (staging alias) |
| deploy-prod | `deploy-prod` | Merge a main | `vercel deploy --prod` |
| post-deploy | `lighthouse` | Despues de deploy-prod | Lighthouse CI con thresholds |
| post-deploy | `smoke-test` | Despues de deploy-prod | Verificacion basica de funcionalidad |

### 5.3 Gestion de Entornos

| Entorno | URL | Trigger de Deploy | Proposito |
|---|---|---|---|
| **Development** | `localhost:3000` | Manual | Desarrollo local |
| **Preview** | `lionmedia-compress-<hash>.vercel.app` | Cada MR en GitLab | Review de features |
| **Staging** | `staging.lioncompress.dev` | Merge a `staging` | QA pre-produccion |
| **Produccion** | `lioncompress.dev` | Merge a `main` | Usuarios finales |

### 5.4 Variables de Entorno

```
# .env.example
NEXT_PUBLIC_SITE_URL=https://lioncompress.dev
NEXT_PUBLIC_ANALYTICS_ID=           # ID de Umami/Plausible
NEXT_PUBLIC_SENTRY_DSN=             # DSN de Sentry (solo errores client-side)
NEXT_PUBLIC_AD_PROVIDER=ethicalads  # ethicalads | carbonads | none
NEXT_PUBLIC_AD_CLIENT_ID=           # ID del publisher
```

Nota: dado que el procesamiento es 100% client-side, las variables de entorno sensibles del servidor son minimas. Las unicas variables `NEXT_PUBLIC_*` son IDs publicos de servicios de terceros.

### 5.5 Monitoreo y Error Tracking

**Sentry (Client-Side):**
- Integrado via `@sentry/nextjs`.
- Captura errores no controlados en el main thread y en web workers.
- Source maps subidos durante el build de CI para stack traces legibles.
- Performance monitoring para medir tiempos reales de compresion.
- Session replay (opcional, desactivado por defecto para respetar privacidad, activable para debugging).

**Alertas:**
- Error rate > 1% en ultima hora: Notificacion a canal de GitLab/Discord.
- Tiempo de compresion promedio sube > 50%: Alerta de regresion de performance.

---

## 6. Especificaciones Funcionales Expandidas

### 6.1 Metodos de Carga de Archivos

| Metodo | Descripcion | Criterios de Aceptacion |
|---|---|---|
| **Drag & Drop** | Arrastrar archivos/carpetas a la zona de drop | Soporte para multiples archivos simultaneos. Soporte para carpetas (via `webkitGetAsEntry`). Feedback visual inmediato al entrar/salir de la zona. |
| **File Picker** | Boton "Seleccionar archivos" | Filtro de tipos aceptados en el dialogo del SO. Multi-seleccion habilitada. |
| **Paste (Ctrl+V)** | Pegar imagen del portapapeles | Funciona con screenshots, copias de imagen del navegador. Detecta si el paste contiene archivos o imagen bitmap. |
| **Carpeta completa** | Drag de carpeta o seleccion via file picker | Recursion en subcarpetas. Solo se extraen archivos de formatos soportados. Se muestra estructura plana (sin jerarquia). |

**Edge cases de carga:**
- Archivo duplicado (mismo nombre y tamano): Mostrar alerta "Este archivo ya fue agregado" y no duplicar.
- Formato no soportado: Rechazo con mensaje "Formato no soportado: .gif. Prueba con JPG, PNG, WebP, AVIF, MP4 o WebM."
- Archivo de 0 bytes: Rechazo con mensaje "Este archivo esta vacio."
- Archivo corrupto (no se puede decodificar): Se detecta en etapa de analisis, se marca como error.

### 6.2 Matriz de Formatos Soportados

#### Imagenes

| Formato Entrada | Formato Salida | Notas |
|---|---|---|
| JPEG (.jpg, .jpeg) | JPEG, WebP, AVIF | MozJPEG para salida JPEG |
| PNG (.png) | PNG, WebP, AVIF | Oxipng para salida PNG |
| WebP (.webp) | WebP, JPEG, PNG, AVIF | Conversion bidireccional |
| AVIF (.avif) | AVIF, JPEG, PNG, WebP | Requiere navegador compatible para preview |

#### Video

| Formato Entrada (Contenedor) | Codecs Soportados | Formato Salida | Notas |
|---|---|---|---|
| MP4 (.mp4) | H.264 (AVC), H.265 (HEVC), AV1 | MP4, WebM | Depende de WebCodecs del navegador |
| WebM (.webm) | VP8, VP9, AV1 | WebM, MP4 | Conversion entre contenedores |
| MOV (.mov) | H.264, HEVC | MP4, WebM | Mediabunny soporta lectura MOV |

**Nota critica:** La disponibilidad de codecs WebCodecs depende del navegador. Se debe hacer `VideoEncoder.isConfigSupported()` y `VideoDecoder.isConfigSupported()` antes de ofrecer opciones.

### 6.3 Presets de Compresion con Parametros Tecnicos

#### Imagenes

| Preset | Calidad JPEG | Calidad WebP | Calidad AVIF | Oxipng Level | Strip Metadata | Descripcion |
|---|---|---|---|---|---|---|
| **Lossless** | 100 (optimize only) | 100 | 100 | 4 | No | Reduccion de tamano sin perdida visual. Reorganiza datos internos. |
| **Balanced** | 82 | 80 | 65 | 2 | Si (EXIF) | Imperceptible a ojo humano. Mejor relacion calidad/tamano. |
| **Custom** | 0-100 (slider) | 0-100 | 0-100 | 0-6 | Configurable | Control total. Preview en tiempo real. |

#### Video

| Preset | Bitrate (relativo al original) | Codec de salida | Descripcion |
|---|---|---|---|
| **Lossless** | 100% | Mismo codec | Solo re-mux, strip metadata |
| **Balanced** | 50-60% | H.264 o AV1 (si soportado) | Reduccion notable de tamano, calidad visual aceptable |
| **Custom** | Configurable | Seleccionable | Bitrate, resolucion, codec personalizables |

### 6.4 Procesamiento por Lotes (Batch)

**Gestion de Cola:**
- Los archivos se agregan a una cola FIFO al ser soltados.
- La compresion comienza automaticamente al agregar archivos (configurable: auto vs manual).
- Concurrencia de workers de imagen: `Math.min(navigator.hardwareConcurrency - 1, 4)`, minimo 1.
- Video siempre secuencial (un video a la vez).
- La cola es pausable y reanudable.

**Gestion de Memoria:**
- Antes de procesar un archivo, se verifica `performance.memory.usedJSHeapSize` (si disponible, Chrome only) para estimar memoria disponible.
- Para archivos > 50MB (imagenes) o > 500MB (video), se muestra advertencia: "Este archivo es grande. La compresion puede ser lenta y consumir mucha memoria."
- Para video, Mediabunny usa streams (no carga todo el archivo en memoria), lo cual reduce significativamente el uso de RAM.
- Los Object URLs de previews se revocan (`URL.revokeObjectURL`) cuando se eliminan archivos de la lista.
- Los blobs de resultados se mantienen solo hasta que el usuario descarga o limpia.

**Limites de archivos:**

| Tipo | Limite suave (advertencia) | Limite duro (rechazo) | Justificacion |
|---|---|---|---|
| Imagen individual | 50 MB | 200 MB | Imagenes de mas de 200MB son anomalas |
| Video individual | 500 MB | 2 GB | Restriccion practica de memoria del navegador |
| Archivos totales en sesion | 100 archivos | 500 archivos | Rendimiento de la UI |
| Tamano total en sesion | 1 GB | 4 GB | Restriccion practica de memoria |

### 6.5 Reporte de Progreso

**Por archivo:**
- Porcentaje numerico (0-100%)
- Barra de progreso visual con gradiente animado
- Etapa actual: "Analizando..." / "Comprimiendo..." / "Finalizando..."
- Tiempo estimado restante (para archivos grandes)

**General (batch):**
- "3 de 15 archivos completados"
- Barra de progreso general
- Tamano total ahorrado hasta el momento
- Boton de pausa/cancelar para toda la cola

### 6.6 Vista de Resultados

**Tarjeta de resultado por archivo:**
- Thumbnail del resultado (cargado como Object URL)
- Nombre del archivo
- Tamano original y tamano comprimido (en texto monoespaciado)
- Porcentaje de ahorro con color semantico (verde si > 30%, amarillo si 10-30%, gris si < 10%)
- Formato de salida (badge)
- Boton de descarga individual
- Boton de "Ver comparacion" que abre el slider before/after

**Slider de Comparacion (Before/After):**
- Componente de slider horizontal que muestra original a la izquierda y comprimido a la derecha.
- Draggable con handle visible.
- Accesible por teclado (flechas izquierda/derecha).
- Zoom in/out con scroll o pinch (mobile).
- Metadatos mostrados debajo: dimensiones, tamano, formato.

**Resumen de sesion:**
- Total de archivos procesados
- Tamano total original vs comprimido
- Porcentaje de ahorro total
- Tiempo total de procesamiento

### 6.7 Descarga

| Accion | Comportamiento |
|---|---|
| **Descarga individual** | Descarga directa via `URL.createObjectURL` + `<a download>` |
| **Descarga selectiva** | Checkboxes en tarjetas + boton "Descargar seleccionados" |
| **Descargar todo (ZIP)** | Generacion de ZIP via jszip en web worker. Nombre: `lioncompress-[fecha].zip` |
| **Convencion de nombres** | `[nombre-original]-compressed.[ext]` (configurable en settings) |

### 6.8 Persistencia de Configuracion

- Las preferencias del usuario se guardan en `localStorage`:
  - Tema (light/dark/system)
  - Modo de compresion preferido
  - Formato de salida preferido
  - Configuracion custom (quality, etc.)
  - Convencion de nombres de archivo
  - Flag de primera visita
- No se persiste la lista de archivos ni resultados (por privacidad, todo se pierde al cerrar pestana).

### 6.9 Atajos de Teclado

| Atajo | Accion |
|---|---|
| `Ctrl/Cmd + V` | Pegar imagen del portapapeles |
| `Ctrl/Cmd + O` | Abrir file picker |
| `Ctrl/Cmd + Enter` | Iniciar compresion (si modo manual) |
| `Ctrl/Cmd + Shift + D` | Descargar todo |
| `Ctrl/Cmd + Shift + Backspace` | Limpiar todos los archivos |
| `Escape` | Cerrar modal/panel abierto |
| `Tab` / `Shift+Tab` | Navegacion entre elementos interactivos |
| `1`, `2`, `3` | Seleccionar preset Lossless/Balanced/Custom (cuando settings visibles) |

---

## 7. Motor de Procesamiento

### 7.1 Pipeline de Compresion de Imagenes

```
Archivo File
  |
  v
[1. Validacion]
  - Verificar MIME type real (magic bytes, no extension)
  - Verificar que no exceda limite de tamano
  - Verificar que el formato sea soportado
  |
  v
[2. Decodificacion] (en Web Worker)
  - jSquash decode: File -> ImageData (RGBA bitmap)
  - Genera thumbnail para preview (resize a max 300px)
  - Extrae metadatos (dimensiones, color profile)
  |
  v
[3. Transformacion] (opcional)
  - Resize si se configuro maxWidth/maxHeight
  - Strip metadata si se configuro
  |
  v
[4. Codificacion] (en Web Worker)
  - Segun formato de salida y preset:
    - JPEG: MozJPEG via @jsquash/jpeg encode({quality})
    - PNG: Oxipng via @jsquash/oxipng optimize({level})
    - WebP: libwebp via @jsquash/webp encode({quality})
    - AVIF: libavif via @jsquash/avif encode({quality, speed})
  |
  v
[5. Resultado]
  - Blob del archivo comprimido
  - Calcular savings: (original - comprimido) / original * 100
  - Generar Object URL para descarga
  - Reportar resultado al main thread
```

### 7.2 Pipeline de Compresion de Video

```
Archivo File
  |
  v
[1. Validacion]
  - Verificar formato de contenedor soportado
  - Verificar soporte de WebCodecs en el navegador
  |
  v
[2. Demux] (Mediabunny)
  - Separar video track, audio track(s), subtitle track(s)
  - Extraer metadatos: duracion, FPS, resolucion, codec actual, bitrate
  |
  v
[3. Decode] (WebCodecs VideoDecoder)
  - Decodificar frames de video uno a uno (streaming)
  - Para preview: decodificar solo primer frame
  |
  v
[4. Encode] (WebCodecs VideoEncoder)
  - Re-codificar cada frame con nuevo bitrate/codec
  - Configuracion basada en preset seleccionado
  - Progreso reportado por frame: (frame_actual / total_frames) * 100
  |
  v
[5. Audio] (Passthrough o re-encode)
  - Por defecto: audio passthrough (sin re-codificar)
  - Opcion futura: re-codificar audio (Opus, AAC)
  |
  v
[6. Mux] (Mediabunny)
  - Recombinar video + audio en nuevo contenedor
  - Escribir archivo final
  |
  v
[7. Resultado]
  - Blob del video comprimido
  - Calcular savings
  - Object URL para descarga
```

### 7.3 Fallback para Navegadores sin WebCodecs

- Si `window.VideoEncoder === undefined`:
  - **Para video:** Mostrar mensaje claro: "Tu navegador no soporta compresion de video acelerada por hardware. Recomendamos Chrome 94+ o Edge 94+."
  - **No se usa FFmpeg.wasm como fallback automatico** (seria demasiado lento y pesado para la experiencia prometida). En su lugar, se ofrece un link a descargar un navegador compatible.
  - **Para imagenes:** jSquash (WASM) funciona en todos los navegadores modernos. No se necesita fallback.

---

## 8. Rendimiento y Presupuestos Tecnicos

### 8.1 Core Web Vitals Targets

| Metrica | Target | Como se mide |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 1.5s | Lighthouse CI en pipeline |
| **FID** (First Input Delay) / **INP** (Interaction to Next Paint) | < 100ms | Web Vitals library en produccion |
| **CLS** (Cumulative Layout Shift) | < 0.05 | Lighthouse CI |
| **TTFB** (Time to First Byte) | < 200ms | Vercel Edge Network garantiza esto |
| **FCP** (First Contentful Paint) | < 1.0s | Lighthouse CI |

### 8.2 Budget de Bundle Size

| Recurso | Limite | Justificacion |
|---|---|---|
| HTML inicial | < 15 KB (gzipped) | SSG de Next.js, minimo |
| CSS (Tailwind purgado) | < 20 KB (gzipped) | Tailwind JIT solo incluye lo usado |
| JS inicial (framework + app shell) | < 100 KB (gzipped) | React + Next.js runtime + UI basica |
| JS lazy (workers + WASM) | Sin limite estricto | Se carga on-demand cuando usuario sube archivos |
| Fuentes (Inter variable) | < 100 KB | Variable font, subset latin |
| Imagenes de la UI | < 50 KB total | Preferir SVG e iconos |

**Estrategia de code splitting:**
- La pagina landing se sirve como SSG (HTML estatico).
- Los componentes de compresion (DropZone, FileList, Results) se cargan con `next/dynamic` y `{ ssr: false }` porque dependen de APIs del navegador.
- Los web workers y modulos WASM de jSquash se cargan lazy via `import()` solo cuando el usuario sube el primer archivo.
- Mediabunny se carga lazy solo cuando se detecta un archivo de video.

### 8.3 Optimizacion de WASM

- Los binarios WASM de jSquash se sirven desde el mismo dominio (no CDN externo) para evitar CORS y aprovechar cache de Vercel Edge.
- Se usa `Cache-Control: public, max-age=31536000, immutable` para los archivos `.wasm` (versionados por hash).
- Se habilita WASM streaming compilation donde el navegador lo soporte.

---

## 9. Accesibilidad (WCAG 2.1 AA)

### 9.1 Requisitos Minimos

| Criterio WCAG | Aplicacion en LionMedia |
|---|---|
| **1.1.1** Non-text Content | Todas las imagenes de UI tienen alt text. Iconos decorativos usan `aria-hidden`. |
| **1.3.1** Info and Relationships | Estructura semantica correcta (headings jerarquicos, landmarks, listas). |
| **1.4.3** Contrast (Minimum) | Ratio de contraste >= 4.5:1 para texto normal, >= 3:1 para texto grande. Verificado en light y dark mode. |
| **1.4.11** Non-text Contrast | Bordes, iconos y controles graficos >= 3:1 contra fondo adyacente. |
| **2.1.1** Keyboard | Toda la funcionalidad accesible via teclado. Drop zone tiene alternativa de file picker. |
| **2.4.3** Focus Order | Orden de tabulacion logico: Header -> Drop Zone -> Settings -> File List -> Results -> Footer. |
| **2.4.7** Focus Visible | Outline visible de 2px con color accent en todos los elementos enfocables. No se usa `outline: none` sin reemplazo. |
| **3.2.1** On Focus | Ningun cambio de contexto al enfocar un elemento. |
| **3.3.1** Error Identification | Los errores de archivo se identifican con texto, color e icono. No solo color. |
| **4.1.2** Name, Role, Value | Componentes personalizados (slider, toggle) usan ARIA roles apropiados. |

### 9.2 Zona de Drop Accesible

```
- Role: region con aria-label="Zona de carga de archivos"
- Contiene un <input type="file"> visible y enfocable como alternativa al drag&drop
- Al arrastrar archivos, se anuncia via aria-live="polite": "Archivos detectados. Suelta para cargar."
- Al completar carga, se anuncia: "3 archivos cargados exitosamente."
- Errores de archivo se anuncian: "archivo.gif rechazado: formato no soportado."
```

### 9.3 Screen Reader Announcements

Se usa un componente `<VisuallyHidden>` con `aria-live="polite"` para anunciar:
- Inicio de compresion: "Comprimiendo 5 archivos..."
- Progreso: "Archivo 3 de 5 completado. 60% del lote."
- Finalizacion: "Compresion completada. Ahorro total: 65%."
- Errores: "Error al comprimir foto.jpg: archivo corrupto."

### 9.4 Reduccion de Movimiento

- Se respeta `prefers-reduced-motion: reduce`.
- Cuando activo: todas las animaciones se reducen a `duration: 0ms` o se reemplazan por transiciones de opacidad simples.
- El shimmer de las barras de progreso se reemplaza por un color solido estatico.

---

## 10. Seguridad

### 10.1 Content Security Policy (CSP)

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' https://*.ethicalads.io https://*.sentry.io;
  worker-src 'self' blob:;
  media-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'none';
```

**Notas:**
- `wasm-unsafe-eval` es necesario para ejecutar modulos WASM (jSquash).
- `blob:` es necesario para Object URLs de previews y descargas.
- `worker-src 'self' blob:` permite crear web workers desde blobs (patron comun con bundlers).
- `unsafe-inline` en styles es necesario para Tailwind/styled components en linea. Se puede reemplazar por nonces si se requiere mayor seguridad.

### 10.2 Headers de Seguridad Adicionales

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp  # Necesario para SharedArrayBuffer (WASM threading)
```

**Nota importante:** `Cross-Origin-Embedder-Policy: require-corp` es necesario si se desea habilitar `SharedArrayBuffer` para WASM multithreading. Esto tiene implicaciones: todos los recursos cross-origin deben tener `Cross-Origin-Resource-Policy: cross-origin` o ser cargados con `crossorigin` attribute. Los scripts de ads (EthicalAds, Carbon) deben ser compatibles con COEP, o se carga en un iframe separado.

### 10.3 Subresource Integrity (SRI)

- Todas las dependencias cargadas desde CDN externo (si las hay) deben incluir atributo `integrity` con hash SHA-384.
- En la practica, como usamos bundling con Next.js, todo se sirve desde el mismo dominio y SRI no es estrictamente necesario, pero se mantiene para scripts de ads cargados externamente.

### 10.4 Validacion de Archivos de Entrada

- **No confiar en la extension del archivo.** Verificar magic bytes para determinar formato real.
- **Magic bytes soportados:**

| Formato | Magic Bytes (hex) |
|---|---|
| JPEG | `FF D8 FF` |
| PNG | `89 50 4E 47 0D 0A 1A 0A` |
| WebP | `52 49 46 46 ... 57 45 42 50` |
| AVIF | `... 66 74 79 70 61 76 69 66` (ftyp avif) |
| MP4 | `... 66 74 79 70` (ftyp box) |
| WebM | `1A 45 DF A3` (EBML header) |

- **Limitar tamano de archivo** segun tabla de la seccion 6.4.
- **No ejecutar ningun codigo embebido** en archivos (no hay riesgo real ya que solo se decodifican pixels/frames, pero los codecs WASM estan sandboxed por diseno).

### 10.5 Garantia de Privacidad

- Se debe incluir una seccion visible en la landing y en el footer: "Tus archivos nunca salen de tu navegador. Todo el procesamiento ocurre localmente en tu dispositivo."
- Para reforzar la confianza: se puede incluir un monitor de red visible (opcional, estilo developer tool) que muestre que no se hacen requests durante la compresion.
- El Network tab del navegador lo puede verificar cualquier usuario tecnico.

### 10.6 Prevencion de Abuso

Dado que el procesamiento es 100% client-side, no hay un vector de abuso tipico contra el servidor. Sin embargo:
- **Rate limiting en API de analiticas:** Si se implementa un endpoint propio para analytics, limitar a 100 requests/minuto por IP.
- **Rate limiting en assets estaticos:** Vercel maneja esto automaticamente.
- **No hay necesidad de CAPTCHA ni auth** ya que no hay recursos del servidor que proteger.

---

## 11. SEO y Marketing

### 11.1 Meta Tags y Open Graph

```html
<head>
  <title>LionMedia Compress - Compresion de imagenes y video en tu navegador</title>
  <meta name="description" content="Comprime imagenes (JPG, PNG, WebP, AVIF) y video (MP4, WebM) directamente en tu navegador. 100% privado, gratuito, sin limites. Acelerado por WebAssembly y WebCodecs." />
  
  <!-- Open Graph -->
  <meta property="og:title" content="LionMedia Compress" />
  <meta property="og:description" content="Compresion de imagenes y video. En tu navegador. Gratis." />
  <meta property="og:image" content="https://lioncompress.dev/og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://lioncompress.dev" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="LionMedia Compress" />
  <meta name="twitter:description" content="Compresion de imagenes y video. En tu navegador. Gratis." />
  <meta name="twitter:image" content="https://lioncompress.dev/og-image.png" />
  
  <!-- Datos Estructurados (Schema.org) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "LionMedia Compress",
    "description": "Compresion de imagenes y video client-side",
    "url": "https://lioncompress.dev",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>
</head>
```

### 11.2 Estrategia SEO

- **Landing como SSG:** La pagina principal se genera estaticamente en build time. Todo el contenido SEO-relevante (textos, estructura) esta en el HTML inicial.
- **Performance como factor SEO:** Con LCP < 1.5s y CLS < 0.05, la pagina obtendra buenas puntuaciones en Core Web Vitals de Google.
- **Contenido estatico para indexacion:** Secciones "Como funciona", "Formatos soportados", "Privacidad" proporcionan contenido textual indexable.
- **Sitemap.xml y robots.txt** generados automaticamente por Next.js.
- **Canonical URL** en todas las paginas.

### 11.3 Estrategia de Marketing Inicial

- Publicar en Product Hunt, Hacker News, Reddit (r/webdev, r/frontend).
- Crear post de blog tecnico: "Como construimos un compresor de video client-side con WebCodecs y Mediabunny".
- Open source (si se decide): visibilidad en GitLab y posible mirror en GitHub para alcance.

---

## 12. Sistema de Anuncios (Pluggable) - Ultima Prioridad

### 12.1 Arquitectura del Sistema de Ads

El sistema de anuncios se disena como un modulo completamente desacoplado del core de la aplicacion, siguiendo un patron de provider/adapter:

```typescript
// types/ads.ts
interface AdConfig {
  provider: 'ethicalads' | 'carbonads' | 'none';
  clientId: string;
  placements: AdPlacement[];
}

interface AdPlacement {
  id: string;          // 'sidebar' | 'footer' | 'results-bottom'
  size: 'small' | 'medium' | 'large';
  fallback: 'hidden' | 'branding' | 'custom';
}

interface AdAdapter {
  init(clientId: string): Promise<void>;
  render(containerId: string, placement: AdPlacement): Promise<void>;
  destroy(containerId: string): void;
  isLoaded(): boolean;
}
```

### 12.2 Componentes

**`<AdProvider>`:** Wrapper en el root que inicializa el adapter seleccionado. Lee la config de variables de entorno. Si `provider === 'none'`, no carga ningun script externo.

**`<AdSlot>`:** Componente que se coloca en los layouts donde se desea un anuncio. Props: `placement`, `fallback`. Si el ad no carga (bloqueador, error de red), muestra el fallback.

**`<AdFallback>`:** Contenido alternativo cuando no hay anuncio. Opciones:
- `hidden`: No muestra nada, el espacio se colapsa.
- `branding`: Muestra un banner sutil de LionMedia (auto-promocion, link a repo, etc.).
- `custom`: Componente React personalizado.

### 12.3 Ubicaciones de Anuncios

| Ubicacion | Visibilidad | Formato | Notas |
|---|---|---|---|
| Footer de la landing | Siempre visible | Banner horizontal, native style | Sutil, integrado con el diseno del footer |
| Sidebar de resultados (desktop) | Solo cuando hay resultados | Banner vertical 160x600 o native | Solo en desktop >= 1024px |
| Debajo de la lista de resultados | Cuando hay > 3 resultados | Banner horizontal, native style | Entre los resultados y el boton de "Descargar todo" |

**Reglas de ubicacion:**
- Nunca dentro de modales o overlays.
- Nunca sobre la zona de drop.
- Nunca durante el procesamiento activo.
- Nunca en la primera vista (antes de que el usuario interactue).
- Maximos 2 ads visibles simultaneamente.

### 12.4 Deteccion de Ad Blocker

- **No agresiva.** No se muestra modal, no se bloquea funcionalidad.
- **Deteccion:** Se intenta cargar el script de ads. Si falla, se asume ad blocker.
- **Reaccion:** Se muestra el fallback content configurado. Opcionalmente, un mensaje sutil (una sola vez por sesion): "LionMedia es gratuito y se financia con anuncios no intrusivos. Considera desactivar tu bloqueador."
- **Nunca se bloquea la funcionalidad** de compresion por tener ad blocker.

### 12.5 Tracking de Revenue

- Las redes de ads (EthicalAds, Carbon) proveen sus propios dashboards de revenue.
- En analiticas internas, se trackea: `ad_impression` (un ad se muestra), `ad_visible` (ad fue visible en viewport por > 1s).
- No se trackea clicks en ads (eso lo maneja la red).

---

## 13. Analiticas

### 13.1 Herramienta Seleccionada

**Umami** (self-hosted o cloud) por las siguientes razones:
- Escrito en Next.js, afinidad tecnologica con el proyecto.
- Script de tracking de ~2KB, no impacta rendimiento.
- Sin cookies, cumple GDPR/ePrivacy sin banner de consentimiento.
- Datos propios, no se comparten con terceros.
- Dashboard simple y claro.

**Alternativa:** Plausible (SaaS) si no se desea self-hostear.

### 13.2 Eventos a Trackear

| Evento | Propiedades | Proposito |
|---|---|---|
| `page_view` | url, referrer | Trafico basico |
| `files_added` | count, total_size, types[] | Entender volumenes de uso |
| `compression_started` | mode, format, file_count | Preferencias de usuarios |
| `compression_completed` | savings_percent, duration_ms, file_count | Rendimiento real |
| `compression_error` | error_type, browser | Detectar problemas |
| `download_single` | format, size | Patron de descarga |
| `download_zip` | file_count, total_size | Uso de batch |
| `settings_changed` | setting_name, new_value | Preferencias de configuracion |
| `theme_changed` | theme | Preferencia dark/light |
| `browser_unsupported` | browser, missing_feature | Alcance de compatibilidad |

### 13.3 Funnel de Conversion

```
1. Visita a la landing (page_view)
   |
   v
2. Carga primer archivo (files_added) -- Conversion 1: "Engagement"
   |
   v
3. Compresion completada (compression_completed) -- Conversion 2: "Valor entregado"
   |
   v
4. Descarga de resultado (download_single | download_zip) -- Conversion 3: "Valor capturado"
   |
   v
5. Segunda sesion (returning visitor) -- Conversion 4: "Retencion"
```

---

## 14. Estrategia de Testing

### 14.1 Piramide de Tests

| Nivel | Herramienta | Cobertura Objetivo | Que se testea |
|---|---|---|---|
| **Unit** | Vitest | > 80% de lib/ y hooks/ | Funciones puras, utilidades, logica de store, formato de bytes, deteccion de formatos |
| **Integration** | Vitest + Testing Library | > 60% de components/ | Componentes con interacciones, flujos de UI (drag -> process -> result) |
| **E2E** | Playwright | Flujos criticos (5-10 tests) | Flujo completo: cargar imagen -> comprimir -> descargar. Flujo de video. Flujo batch + ZIP. |
| **Visual Regression** | Playwright screenshots | Componentes criticos de UI | DropZone, FileCard, ResultsView, ComparisonSlider en light/dark mode |
| **Performance** | Lighthouse CI | Cada deploy a staging/prod | Core Web Vitals dentro de budget |

### 14.2 Tests Unitarios Clave

- `format-bytes.ts`: Conversion correcta de bytes a KB/MB/GB con decimales.
- `browser-support.ts`: Deteccion correcta de WebCodecs, WASM, SharedArrayBuffer.
- `formats.ts`: Identificacion de formato por magic bytes.
- `queue.ts`: Cola de procesamiento respeta concurrencia, pausa, cancelacion.
- `presets.ts`: Parametros correctos para cada preset y formato.
- Store de Zustand: addFiles, removeFile, updateFileStatus, clearAll.

### 14.3 Tests E2E Criticos

1. **Flujo basico de imagen:** Cargar JPG via file picker -> Verificar que aparece en lista -> Verificar que se comprime -> Verificar que se puede descargar.
2. **Drag & drop:** Simular drag de archivo a drop zone -> Verificar que se carga.
3. **Batch + ZIP:** Cargar 5 imagenes -> Verificar todas comprimidas -> Descargar ZIP -> Verificar nombre de archivo.
4. **Cambio de preset:** Cargar imagen -> Cambiar a modo Custom -> Ajustar quality -> Verificar que resultado cambia.
5. **Error handling:** Cargar archivo no soportado -> Verificar mensaje de error apropiado.
6. **Video (si WebCodecs disponible):** Cargar MP4 -> Verificar que se comprime -> Descargar.

### 14.4 Cross-Browser Testing

**Matriz de compatibilidad:**

| Navegador | Version Minima | Imagenes | Video (WebCodecs) | Notas |
|---|---|---|---|---|
| Chrome | 94+ | Completo | Completo | Referencia principal |
| Edge | 94+ | Completo | Completo | Basado en Chromium |
| Firefox | 100+ | Completo | Sin soporte WebCodecs | Solo imagenes, mensaje para video |
| Safari | 16.4+ | Completo | Parcial (WebCodecs experimental) | Verificar WASM SIMD |
| Chrome Android | 94+ | Completo | Completo | Memoria limitada |
| Safari iOS | 16.4+ | Completo | Parcial | Memoria muy limitada |

**Estrategia de feature detection:**

```typescript
// lib/utils/browser-support.ts
export const browserSupport = {
  wasm: typeof WebAssembly !== 'undefined',
  wasmSimd: /* se detecta intentando compilar un modulo SIMD */,
  webCodecs: typeof VideoEncoder !== 'undefined',
  sharedArrayBuffer: typeof SharedArrayBuffer !== 'undefined',
  offscreenCanvas: typeof OffscreenCanvas !== 'undefined',
  fileSystemAccess: 'showOpenFilePicker' in window,
  webGpu: 'gpu' in navigator,
};
```

---

## 15. Internacionalizacion (i18n)

### 15.1 Estrategia

- **MVP:** Solo espanol e ingles.
- **Implementacion:** `next-intl` o `next-i18next` con App Router.
- **Deteccion de idioma:** `Accept-Language` header + preferencia guardada en localStorage.
- **Archivos de traduccion:** JSON en `src/messages/es.json`, `src/messages/en.json`.
- **Textos dinamicos:** Los mensajes de error, estados de progreso y resultados son traducibles.
- **No se traducen:** Nombres de formatos de archivo (JPEG, PNG, etc.), terminos tecnicos universales.

### 15.2 URL Strategy

- `lioncompress.dev` -- idioma detectado automaticamente
- `lioncompress.dev/es` -- espanol forzado
- `lioncompress.dev/en` -- ingles forzado
- Ambas versiones con `hreflang` tags para SEO.

---

## 16. PWA y Offline

### 16.1 Manifest

```json
{
  "name": "LionMedia Compress",
  "short_name": "LionCompress",
  "description": "Compresion de imagenes y video en tu navegador",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111111",
  "theme_color": "#2563EB",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

### 16.2 Service Worker

- **Estrategia:** Cache-first para assets estaticos (JS, CSS, WASM, fonts, iconos).
- **App shell:** Se cachea el HTML de la landing y los chunks de JS criticos para que la app funcione offline despues de la primera visita.
- **WASM binaries:** Se cachean agresivamente (son los archivos mas grandes pero no cambian frecuentemente).
- **Resultado:** Despues de la primera visita, la app completa funciona sin conexion a internet. El unico requisito es tener archivos locales para comprimir.

### 16.3 Instalabilidad

- Criterios PWA cumplidos: manifest valido, service worker, HTTPS, iconos.
- El navegador mostrara automaticamente el prompt de instalacion.
- No se fuerza la instalacion con banners propios (anti-pattern UX).

---

## 17. Manejo de Errores Expandido

### 17.1 Taxonomia de Errores

| Categoria | Ejemplo | Severidad | Accion UI | Accion Tecnica |
|---|---|---|---|---|
| **Formato no soportado** | Usuario sube .gif, .bmp, .tiff | Baja | Toast de rechazo con formatos validos | Log a analytics |
| **Archivo corrupto** | Imagen con bytes danados | Media | Tarjeta con estado error, boton "Reintentar" | Log a Sentry con tipo de error |
| **Archivo demasiado grande** | Video de 3GB | Media | Modal de advertencia con limite | Log a analytics |
| **Sin soporte WebCodecs** | Firefox + archivo de video | Media | Banner persistente "Navegador no compatible para video" | Feature detection al cargar |
| **Memoria insuficiente** | Batch de 200 imagenes 4K | Alta | Modal: "Demasiados archivos. Reduce el lote." | Intentar liberar memoria, reducir concurrencia |
| **Error de WASM** | Codec falla internamente | Alta | Tarjeta con error generico + opcion de reportar | Log detallado a Sentry con stack trace |
| **Error inesperado** | Bug en la aplicacion | Critica | Error boundary con mensaje amigable | Full error report a Sentry |

### 17.2 Error Boundaries

- React Error Boundary global que captura crashes no controlados.
- Error Boundary especifico alrededor de la zona de compresion.
- Fallback UI: "Algo salio mal. [Recargar pagina]" con opcion de "Reportar error" que envia datos a Sentry.

### 17.3 Mensajes de Error UX

**Principio:** Los mensajes de error deben ser humanos, no tecnicos. Deben decir que paso, por que, y que puede hacer el usuario.

Ejemplos:
- MAL: "Error: ENOMEM in wasm heap allocation"
- BIEN: "No pudimos comprimir este archivo porque es demasiado grande para la memoria de tu navegador. Intenta con un archivo mas pequeno o cierra otras pestanas."

- MAL: "Unsupported codec: vp8"
- BIEN: "Tu navegador no soporta este formato de video. Prueba con Chrome o Edge para la mejor compatibilidad."

---

## 18. Plan de Desarrollo por Fases (Expandido)

### Fase 0: Setup e Infraestructura (3-4 dias)

| # | Tarea | Prioridad | Estimacion |
|---|---|---|---|
| 0.1 | Crear organizacion Lion Labs en GitLab y repositorio `lionmedia-compress` | P0 | 1h |
| 0.2 | Setup Next.js 15 con App Router, TypeScript, Tailwind 4, ESLint, Prettier | P0 | 2h |
| 0.3 | Configurar estructura de directorios segun seccion 4.5 | P0 | 1h |
| 0.4 | Configurar Tailwind con sistema de tokens de color (seccion 2.3) | P0 | 3h |
| 0.5 | Setup tipografia (Inter variable font, escala tipografica) | P0 | 1h |
| 0.6 | Configurar `.gitlab-ci.yml` basico (lint + typecheck + build) | P0 | 3h |
| 0.7 | Conectar repositorio GitLab con Vercel para deploys automaticos | P0 | 2h |
| 0.8 | Setup Vitest + Testing Library + configuracion basica | P1 | 2h |
| 0.9 | Setup Sentry para error tracking | P1 | 2h |
| 0.10 | Implementar dark mode (toggle + persistencia + tokens) | P1 | 3h |

**Entregable:** Repositorio configurado, CI/CD funcionando, primer deploy a Vercel con pagina placeholder. Dark mode funcional.

**Criterios de aceptacion:**
- `pnpm lint` pasa sin errores
- `pnpm typecheck` pasa sin errores
- `pnpm build` genera build exitoso
- Pipeline de GitLab CI ejecuta lint, typecheck, build y despliega a Vercel preview
- La pagina se carga en menos de 2 segundos en Vercel

---

### Fase 1: MVP Imagenes (Semanas 1-2)

#### Sprint 1.1: UI Core y Drop Zone (4-5 dias)

| # | Tarea | Prioridad | Estimacion |
|---|---|---|---|
| 1.1.1 | Implementar componentes UI primitivos: Button, Card, Badge, Tooltip, Progress, Skeleton | P0 | 6h |
| 1.1.2 | Implementar Header y Footer con slots de navegacion | P0 | 2h |
| 1.1.3 | Construir landing page hero con copy y estructura (seccion 3.6) | P0 | 4h |
| 1.1.4 | Implementar DropZone con drag&drop (estados: idle, hover, drop) | P0 | 6h |
| 1.1.5 | Implementar file picker (boton + input hidden) | P0 | 1h |
| 1.1.6 | Implementar paste handler (Ctrl+V) | P1 | 2h |
| 1.1.7 | Validacion de archivos: formato, tamano, duplicados (magic bytes) | P0 | 4h |
| 1.1.8 | Implementar Zustand store (acciones basicas: addFiles, removeFile, clearAll) | P0 | 3h |
| 1.1.9 | Implementar FileList con FileCard (thumbnail, nombre, tamano, estado) | P0 | 4h |
| 1.1.10 | Tests unitarios para validacion de archivos y store | P1 | 3h |

#### Sprint 1.2: Motor de Compresion de Imagenes (4-5 dias)

| # | Tarea | Prioridad | Estimacion |
|---|---|---|---|
| 1.2.1 | Setup Web Worker para imagenes con jSquash codecs | P0 | 4h |
| 1.2.2 | Implementar pipeline: decode -> transform -> encode (seccion 7.1) | P0 | 6h |
| 1.2.3 | Implementar cola de procesamiento con concurrencia configurable | P0 | 4h |
| 1.2.4 | Implementar presets de compresion (Lossless, Balanced, Custom) | P0 | 3h |
| 1.2.5 | Implementar SettingsPanel con ModeSelector y QualitySlider | P0 | 4h |
| 1.2.6 | Integrar progreso de compresion (por archivo y general) | P0 | 3h |
| 1.2.7 | Implementar conversion de formato (JPG->WebP, PNG->AVIF, etc.) | P1 | 3h |
| 1.2.8 | Implementar resize opcional | P1 | 2h |
| 1.2.9 | Tests unitarios para pipeline de compresion | P1 | 3h |
| 1.2.10 | Tests unitarios para cola de procesamiento | P1 | 2h |

#### Sprint 1.3: Resultados y Descarga (3-4 dias)

| # | Tarea | Prioridad | Estimacion |
|---|---|---|---|
| 1.3.1 | Implementar ResultsView con tarjetas de resultado (savings, formato, tamano) | P0 | 4h |
| 1.3.2 | Implementar ComparisonSlider (before/after con drag handle) | P0 | 6h |
| 1.3.3 | Implementar descarga individual (createObjectURL + anchor download) | P0 | 1h |
| 1.3.4 | Implementar descarga ZIP (jszip en web worker) | P1 | 4h |
| 1.3.5 | Implementar descarga selectiva (checkboxes + download selected) | P2 | 2h |
| 1.3.6 | Convencion de nombres configurable | P2 | 1h |
| 1.3.7 | Animaciones con Framer Motion (entrada de tarjetas, progreso, checkmark) | P1 | 4h |
| 1.3.8 | Test E2E: flujo completo imagen JPG carga -> comprime -> descarga | P0 | 3h |
| 1.3.9 | Test E2E: batch de imagenes + descarga ZIP | P1 | 2h |

**Entregable Fase 1:** MVP funcional de compresion de imagenes. El usuario puede cargar imagenes (drag, click, paste), seleccionar preset, comprimir, ver comparacion, y descargar resultados individualmente o como ZIP.

**Criterios de aceptacion:**
- Soporta JPG, PNG, WebP, AVIF de entrada y salida
- Compresion de imagen JPG 5MB en modo Balanced produce >= 40% de ahorro en < 3 segundos
- Funciona en Chrome 94+, Edge 94+, Firefox 100+, Safari 16.4+
- Lighthouse Performance >= 90
- Zero requests de archivos de usuario al servidor (verificable via Network tab)

---

### Fase 2: Video Core (Semanas 3-4)

#### Sprint 2.1: Motor de Video (5-6 dias)

| # | Tarea | Prioridad | Estimacion |
|---|---|---|---|
| 2.1.1 | Integrar Mediabunny para demux/mux de contenedores MP4 y WebM | P0 | 6h |
| 2.1.2 | Implementar Web Worker de video con pipeline decode->encode via WebCodecs | P0 | 8h |
| 2.1.3 | Feature detection de WebCodecs con UI de fallback para navegadores no soportados | P0 | 3h |
| 2.1.4 | Implementar presets de compresion de video (Balanced, Custom) | P0 | 4h |
| 2.1.5 | Progreso de compresion de video (por frame) | P0 | 3h |
| 2.1.6 | Audio passthrough (no re-codificar audio) | P0 | 2h |
| 2.1.7 | UI especifica para video: mostrar duracion, resolucion, FPS, codec | P0 | 3h |
| 2.1.8 | Manejar archivos de video grandes con streams (no cargar todo en memoria) | P0 | 4h |
| 2.1.9 | Tests de compresion de video con archivos de prueba | P1 | 4h |

#### Sprint 2.2: Refinamiento de UX para Video (3-4 dias)

| # | Tarea | Prioridad | Estimacion |
|---|---|---|---|
| 2.2.1 | Preview de video (primer frame como thumbnail) | P0 | 3h |
| 2.2.2 | Settings de video: selector de codec de salida, bitrate, resolucion | P1 | 4h |
| 2.2.3 | Conversion entre contenedores (MP4->WebM, WebM->MP4) | P1 | 3h |
| 2.2.4 | Manejo unificado de cola: imagenes y video en la misma sesion | P0 | 3h |
| 2.2.5 | Test E2E: flujo completo video MP4 carga -> comprime -> descarga | P0 | 3h |
| 2.2.6 | Test E2E: mixed batch (imagenes + video) | P1 | 2h |

**Entregable Fase 2:** Soporte de compresion de video funcional. El usuario puede cargar videos MP4/WebM, seleccionar configuracion, comprimir con WebCodecs, y descargar el resultado.

**Criterios de aceptacion:**
- Soporta MP4 (H.264, AV1) y WebM (VP9, AV1) de entrada
- Video de 100MB MP4 H.264 se comprime en modo Balanced en < 30 segundos (hardware dependent)
- Progreso de compresion muestra porcentaje real por frame
- El audio se preserva sin re-codificacion
- Funciona en Chrome 94+ y Edge 94+
- Firefox y Safari muestran mensaje de navegador no compatible para video

---

### Fase 3: Pulido, Accesibilidad y Performance (Semana 5)

| # | Tarea | Prioridad | Estimacion |
|---|---|---|---|
| 3.1 | Audit de accesibilidad WCAG 2.1 AA (seccion 9) | P0 | 6h |
| 3.2 | Implementar aria-live announcements para screen readers | P0 | 3h |
| 3.3 | Implementar atajos de teclado (seccion 6.9) con componente KeyboardShortcuts | P1 | 3h |
| 3.4 | Implementar prefers-reduced-motion | P1 | 2h |
| 3.5 | Responsive testing y ajustes para todos los breakpoints | P0 | 4h |
| 3.6 | Optimizar bundle: code splitting, lazy loading de WASM y workers | P0 | 4h |
| 3.7 | Configurar CSP headers y headers de seguridad (seccion 10) | P0 | 3h |
| 3.8 | Implementar PWA manifest y service worker basico | P1 | 4h |
| 3.9 | Configurar Lighthouse CI en pipeline con thresholds | P0 | 2h |
| 3.10 | Fix de bugs encontrados en testing | P0 | 8h (buffer) |
| 3.11 | Visual regression tests con Playwright screenshots | P2 | 3h |

**Entregable Fase 3:** Aplicacion pulida, accesible, performante y segura. Lista para lanzamiento beta.

---

### Fase 4: Analiticas, Ads e i18n (Semana 6)

| # | Tarea | Prioridad | Estimacion |
|---|---|---|---|
| 4.1 | Integrar Umami para analiticas (seccion 13) | P1 | 3h |
| 4.2 | Implementar evento tracking para el funnel de conversion | P1 | 3h |
| 4.3 | Implementar sistema pluggable de ads (seccion 12) | P2 | 6h |
| 4.4 | Integrar EthicalAds adapter | P2 | 3h |
| 4.5 | Implementar fallback content y deteccion suave de ad blocker | P2 | 2h |
| 4.6 | Implementar i18n basico: espanol + ingles (seccion 15) | P2 | 6h |
| 4.7 | Extraer todos los strings hardcodeados a archivos de traduccion | P2 | 4h |
| 4.8 | SEO: meta tags, Open Graph, datos estructurados, sitemap (seccion 11) | P1 | 3h |

**Entregable Fase 4:** Analiticas funcionando, sistema de ads integrado (sin activar necesariamente), soporte bilingue ES/EN.

---

### Fase 5: Lanzamiento y Post-Launch (Semana 7+)

| # | Tarea | Prioridad | Estimacion |
|---|---|---|---|
| 5.1 | Smoke tests finales en produccion | P0 | 2h |
| 5.2 | Crear OG image profesional para compartir en redes | P1 | 2h |
| 5.3 | Escribir README.md completo para el repositorio | P1 | 2h |
| 5.4 | Preparar post para Product Hunt | P1 | 3h |
| 5.5 | Preparar post tecnico para blog/dev.to | P2 | 4h |
| 5.6 | Publicar y monitorear metricas en las primeras 48 horas | P0 | -- |
| 5.7 | Responder a feedback inicial y hacer hotfixes si es necesario | P0 | -- |

**Entregable Fase 5:** Producto lanzado publicamente con material de marketing.

---

### Resumen de Timeline

| Fase | Semana(s) | Duracion | Hito |
|---|---|---|---|
| Fase 0: Setup | Pre-semana 1 | 3-4 dias | Repo + CI/CD + Deploy base |
| Fase 1: MVP Imagenes | Semanas 1-2 | 10 dias | Compresion de imagenes funcional |
| Fase 2: Video Core | Semanas 3-4 | 10 dias | Compresion de video funcional |
| Fase 3: Pulido | Semana 5 | 5 dias | Accesibilidad + performance + seguridad |
| Fase 4: Extras | Semana 6 | 5 dias | Analytics + ads + i18n |
| Fase 5: Launch | Semana 7 | 2-3 dias | Lanzamiento publico |

**Total estimado: 7 semanas** (1 desarrollador full-time) o **4 semanas** (2 desarrolladores).

---

## 19. Stack Tecnologico Final (Resumen)

| Categoria | Tecnologia | Version | Licencia |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 15.x | MIT |
| **UI Library** | React | 19.x | MIT |
| **Lenguaje** | TypeScript | 5.x | Apache-2.0 |
| **Estilos** | Tailwind CSS | 4.x | MIT |
| **State** | Zustand | 5.x | MIT |
| **Animaciones** | Framer Motion | 12.x | MIT |
| **Iconos** | Lucide React | latest | ISC |
| **Clases** | clsx | 2.x | MIT |
| **Imagenes (WASM)** | jSquash (@jsquash/*) | latest | Apache-2.0 |
| **Video** | Mediabunny | latest | MPL-2.0 |
| **ZIP** | JSZip | 3.x | MIT/GPLv3 |
| **i18n** | next-intl | latest | MIT |
| **Analytics** | Umami | latest | MIT |
| **Error Tracking** | Sentry (@sentry/nextjs) | latest | MIT |
| **Testing** | Vitest + Testing Library + Playwright | latest | MIT |
| **Hosting** | Vercel | -- | SaaS |
| **CI/CD** | GitLab CI | -- | SaaS |
| **Ads** | EthicalAds / Carbon Ads | -- | SaaS |

---

Sources:
- [jSquash - GitHub](https://github.com/jamsinclair/jSquash)
- [WebCodecs API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API)
- [WebCodecs Browser Support - Can I Use](https://caniuse.com/webcodecs)
- [Mediabunny - Official Site](https://mediabunny.dev/)
- [Mediabunny - GitHub](https://github.com/Vanilagy/mediabunny)
- [Mediabunny Supported Formats](https://mediabunny.dev/guide/supported-formats-and-codecs)
- [EthicalAds](https://www.ethicalads.io/)
- [Carbon Ads](https://www.carbonads.net/)
- [GitLab CI/CD with Vercel - Next.js Guide](https://potapov.me/en/make/nextjs-gitlab-cicd-deploy)
- [Umami vs Plausible - Self-Hosted Analytics 2026](https://selfhostwise.com/posts/self-hosted-website-analytics-in-2026-umami-vs-plausible-complete-guide/)
- [WCAG 2.1 AA Compliance Checklist](https://www.webability.io/blog/wcag-2-1-aa-the-standard-for-accessible-web-design)
- [Remotion WebCodecs](https://www.remotion.dev/docs/webcodecs/)
- [Video Processing with WebCodecs - Chrome Developers](https://developer.chrome.com/docs/web-platform/best-practices/webcodecs)

---
