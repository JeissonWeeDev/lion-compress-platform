//! # `lion-engine-core`
//!
//! A small, dependency-free **reference implementation** of the pure
//! compression helpers used by the web client.
//!
//! The browser application executes the JavaScript/TypeScript version in
//! [`src/lib/compression/engine.ts`](../../../src/lib/compression/engine.ts).
//! This crate exists to:
//!
//! 1. Document the algorithms in a systems language.
//! 2. Provide a second, independently tested implementation for parity checks.
//! 3. Serve as a starting point for a future native/WASM backend.
//!
//! It is **not** part of the Next.js build and is **not** shipped to users.
//!
//! ```
//! use lion_engine_core::{calc_savings, resolve_output_mime, OutputFormat};
//!
//! let spec = resolve_output_mime(OutputFormat::Webp, "image/png");
//! assert_eq!(spec.mime, "image/webp");
//! assert_eq!(calc_savings(1_000, 250), 75.0);
//! ```

#![forbid(unsafe_code)]
#![warn(missing_docs)]

pub mod engine;
pub mod format;
pub mod magic;
pub mod presets;

pub use engine::{
    calc_savings, resolve_output_mime, resolve_png_level, resolve_quality, CompressionMode,
    OutputFormat, OutputSpec,
};
pub use format::format_bytes;
pub use magic::detect_mime;
pub use presets::{image_preset, video_preset, ImagePreset, VideoPreset};
