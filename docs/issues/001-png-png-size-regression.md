## Context

The PNG → PNG path in `workers/image.worker.ts` uses `@jsquash/oxipng`
(WebAssembly) and then falls back to the original file when the output is not
smaller. In practice, some PNG inputs still fail or produce surprising results.

## Current behavior

- `oxipng` can throw on certain inputs (interlaced, 16-bit, APNG, corrupt chunks).
  The worker currently surfaces a generic `Compression failed` error.
- If WASM fails to load (CSP, offline, blocked asset), the whole file errors
  instead of falling back to the canvas path.
- When the original file is kept, the UI does not explain that the PNG was
  already optimal; it looks like compression did nothing.
- `outputFormat` / extension can be inconsistent when the original is kept.

## Expected behavior

- PNG → PNG output is **never larger than the input**, or the original is kept
  with an explicit "already optimized" state.
- Any `oxipng` failure falls back gracefully (canvas encode or original file)
  instead of failing the batch item.
- Progress and errors are observable and actionable.

## Proposed approach

1. Wrap the `oxipng` call in `try/catch`; on failure, fall back to the canvas
   path or return the original with `skipped: true`.
2. Add an explicit result flag (e.g. `keptOriginal`) and surface it in the UI.
3. Validate the output MIME and extension before posting `done`.
4. Add a corpus of small PNG fixtures (RGB, RGBA, interlaced, 16-bit, APNG) and
   assert `output.size <= input.size` or `keptOriginal === true`.
5. Cap the optimization level for very large images to avoid memory spikes.

## Acceptance criteria

- [ ] All PNG fixtures either shrink or report `keptOriginal`.
- [ ] No unhandled worker crash; status always settles as `completed` or `error`.
- [ ] UI distinguishes "compressed" vs "already optimal" vs "error".
- [ ] Unit tests cover level mapping edges; integration tests cover the fallback.
- [ ] Works with CSP enabled and when the WASM asset is unavailable.

## Technical notes

- Relevant files: `workers/image.worker.ts`, `src/lib/compression/engine.ts`,
  `src/lib/compression/__tests__/engine.test.ts`.
- Keep the pure decision logic in `engine.ts` so it stays testable in Vitest.
