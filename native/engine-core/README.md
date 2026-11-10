# `lion-engine-core` (Rust reference module)

A dependency-free Rust crate that mirrors the **pure** compression helpers used
by the web client in [`src/lib/compression/engine.ts`](../../src/lib/compression/engine.ts)
and [`src/lib/utils/browser-support.ts`](../../src/lib/utils/browser-support.ts).

This crate is a **reference implementation and parity harness**. It is **not**
imported by the Next.js build and is **not** shipped to users, so it cannot
affect production behavior.

## Why it exists

- Systems-level documentation of the compression math in a memory-safe language.
- A second, independently tested implementation to catch drift between the
  TypeScript engine and its specification.
- A clean starting point if the project ever adds a native or WASM backend.

## What it implements

| Function | Mirrors |
| --- | --- |
| `resolve_output_mime` | `resolveOutputMime` |
| `resolve_quality` | `resolveQuality` |
| `resolve_png_level` | `resolvePngLevel` |
| `calc_savings` | `calcSavings` |
| `format_bytes` | `formatBytes` |
| `detect_mime` | `getFileMimeFromMagicBytes` |
| `image_preset` / `video_preset` | `IMAGE_PRESETS` / `VIDEO_PRESETS` |

The crate forbids `unsafe` code and has no third-party dependencies.

## Usage

```bash
cd native/engine-core
cargo test        # run the unit + integration suite
cargo fmt --check # verify formatting
cargo clippy --all-targets -- -D warnings
```

## Example

```rust
use lion_engine_core::{calc_savings, resolve_output_mime, OutputFormat};

let spec = resolve_output_mime(OutputFormat::Webp, "image/png");
assert_eq!(spec.ext, "webp");
assert_eq!(calc_savings(1_000, 250), 75.0);
```
