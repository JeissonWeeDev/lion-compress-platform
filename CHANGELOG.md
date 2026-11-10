# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-11-09

### Added

- Client-side image compression for JPEG, PNG, WebP, and AVIF.
- Lossless PNG optimization via `@jsquash/oxipng` (WebAssembly).
- Client-side video compression for MP4, WebM, and MOV via `mediabunny` and WebCodecs.
- Compression modes: `lossless`, `balanced`, and `custom`.
- Drag & drop, file picker, and clipboard paste intake.
- Magic-byte validation for incoming files.
- Batch queue with bounded concurrency (2 images, 1 video).
- Individual downloads and ZIP export.
- ES/EN localization with automatic locale detection.
- Light/dark theme with system preference support.
- Rust reference module (`native/engine-core`) with parity tests.
- GitHub Actions workflow for the Rust module.
- Technical README with architecture, setup, and engineering decisions.

### Changed

- Consolidated UI primitives under `src/components/ui` and `src/components/layout`.

### Fixed

- Hydration mismatch in the theme toggle.
- Internal navigation now uses `next/link`.
- Removed unused scaffold components and utilities.

[Unreleased]: https://github.com/JeissonWeeDev/lion-compress-platform/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/JeissonWeeDev/lion-compress-platform/releases/tag/v0.1.0
