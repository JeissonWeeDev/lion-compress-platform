## Context

`CompressionSettings` already defines `maxWidth` and `maxHeight`, but the UI does
not expose them. Users with advanced workflows need more control than the three
presets provide.

## Use cases

- Marketing teams that need every asset under a maximum width.
- Developers converting a mixed folder to a single output format.
- Users who want to keep metadata on some files and strip it on others.
- Teams that reuse the same custom configuration across sessions.

## Proposed approach

1. **Resize controls**: max width/height, fit/cover/contain, optional "do not
   upscale".
2. **Per-file overrides**: format, quality or resize for individual files.
3. **Metadata**: global default plus per-file and per-format overrides.
4. **Output naming**: template such as `{name}-{width}.{ext}`, with collision
   handling in the ZIP.
5. **Custom presets**: save, rename and delete user presets in `localStorage`.
6. **Video controls**: codec, bitrate mode, container and audio handling.
7. **Validation**: clamp values, explain incompatible combinations in the UI.

## Acceptance criteria

- [ ] New settings persist across reloads and are applied by the workers.
- [ ] Per-file overrides win over global settings and are visible in the card.
- [ ] Invalid combinations are disabled or explained, never silently ignored.
- [ ] ZIP export handles name collisions deterministically.
- [ ] All new strings are translated in every supported locale.
- [ ] Pure logic is unit tested; existing presets keep their behavior.

## Technical notes

- Relevant files: `src/types/compression.ts`,
  `src/store/app-store.ts`, `src/components/settings/SettingsPanel.tsx`,
  `workers/image.worker.ts`, `workers/video.worker.ts`.
- Keep the API boundary in `CompressionSettings` so workers stay decoupled.
