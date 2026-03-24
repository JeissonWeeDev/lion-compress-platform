# LionMedia Compress - Proyecto Gemini

## 🦁 Visión General
**LionMedia Compress** es una plataforma SaaS de compresión de medios (imágenes y video) que prioriza la **privacidad absoluta** mediante procesamiento 100% en el lado del cliente (*client-side*). Ningún archivo abandona jamás el navegador del usuario.

## 🛠️ Stack Tecnológico
- **Framework:** Next.js 15.2 (App Router)
- **UI & State:** React 19.2, Zustand 5.0 (Persistence), Framer Motion 12.3
- **Estilos:** Tailwind CSS 4.0 (Custom Tokens), Lucide Icons
- **Motores de Compresión:**
  - **Imágenes:** WebAssembly vía [jSquash](https://github.com/jamsinclair/jSquash) (MozJPEG, Oxipng, libwebp, libavif).
  - **Video:** WebCodecs vía [Mediabunny](https://mediabunny.dev/).
- **Utilidades:** JSZip (batch download), nanoid, clsx, next-themes.

## 📐 Reglas de Diseño B-RIO
1. **No usar All-Caps:** Preferir siempre *Sentence case* en botones y textos largos.
2. **Coherencia de Fuente:** Botones y acciones principales con fuentes legibles de 14-16px.
3. **Minimalismo:** Botones flotantes de baja altura y espaciado generoso (sistema de 4px).
4. **Mobile-First:** Optimización estricta para dispositivos móviles.
5. **Feedback Instantáneo:** Animaciones fluidas ([ease-out] para entradas) y estados de carga (skeletons).

## 📂 Estructura del Proyecto
- `src/app/`: Rutas y Layouts (App Router). `AppShell.tsx` es el núcleo interactivo.
- `src/components/`: Componentes organizados por dominio (`drop-zone`, `file-list`, `settings`, `ui`).
- `src/lib/compression/`: Lógica de los workers y presets de compresión.
- `src/store/`: Estado global con Zustand (`app-store.ts`).
- `workers/`: Web Workers para procesamiento pesado fuera del hilo principal.

## 🚀 Funcionalidades Clave
- **Privacidad:** Validación por *Magic Bytes* (no solo extensión) y procesamiento local.
- **Carga Versátil:** Drag & Drop, selección de carpetas, y pegado directo (Ctrl+V).
- **Presets:** Modos *Lossless*, *Balanced* y *Custom* (control total de calidad).
- **Comparación:** Slider visual antes/después para validar calidad post-compresión.
- **Batch:** Procesamiento concurrente y descarga masiva en ZIP.

## 📝 Notas de Implementación
- **Persistencia:** Solo se guardan los ajustes y preferencias en `localStorage`. Los archivos procesados se pierden al cerrar la pestaña por seguridad.
- **Web Workers:** El procesamiento de imágenes se distribuye según `navigator.hardwareConcurrency`.
- **I18n:** Soporte multilingüe (ES/EN) mediante diccionarios en `src/lib/i18n`.
