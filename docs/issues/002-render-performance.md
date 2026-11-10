## Context

The UI should stay responsive with large batches. Today `FileList` subscribes to
the entire `files` array and derives four filtered lists on every render. Every
progress message from a worker updates that array, which re-renders every
`FileCard` and re-runs Framer Motion layout animations.

## Current behavior

- Adding 100+ files causes visible input lag.
- Each `progress` message triggers a full list re-render.
- Thumbnails are generated for every card, even off-screen ones.
- `layout` animations on many cards compete with compression work.

## Expected behavior

- Adding, removing and compressing 100+ files stays smooth (target ≥ 50 fps on a
  mid-range laptop).
- A progress update re-renders only the affected file card.
- Off-screen thumbnails are generated lazily.

## Proposed approach

1. Normalize the store: `filesById: Record<string, FileItem>` + `fileIds: string[]`.
2. Select per-card state with a selector (`useAppStore((s) => s.filesById[id])`).
3. Batch/throttle worker progress updates (rAF or ~100 ms) before writing to the store.
4. Memoize `FileCard` and its derived values (`React.memo`, stable callbacks).
5. Virtualize the list above a threshold (e.g. `@tanstack/react-virtual`).
6. Generate thumbnails only when the card enters the viewport
   (`IntersectionObserver`), and skip them above a configurable file count.
7. Disable layout animations for large lists (`prefers-reduced-motion` + count).

## Acceptance criteria

- [ ] React Profiler shows unrelated cards do not re-render on progress.
- [ ] 100-file batch remains interactive; no long tasks above 50 ms during scroll.
- [ ] Thumbnails are generated lazily and freed on unmount.
- [ ] Before/after measurements are documented in the PR.
- [ ] Lint, typecheck, tests and build pass.

## Technical notes

- Relevant files: `src/store/app-store.ts`, `src/hooks/useCompression.ts`,
  `src/components/file-list/FileList.tsx`, `FileCard.tsx`.
- Add a small benchmark or a manual profiling checklist to the PR.
