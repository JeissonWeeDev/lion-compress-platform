## Context

`FileList.handleDownloadAll()` currently zips **every** completed file. In real
batches, users often want to keep only a subset (e.g. 12 of 40 images) and
discard the rest.

## Proposed approach

1. Add a checkbox to each completed `FileCard`.
2. Track selection in the store:
   - `selectedIds: Set<string>` or `Record<string, boolean>`.
   - Actions: `toggleSelected`, `selectAll`, `clearSelection`.
3. Show a sticky action bar with:
   - `Download selected (N)` — enabled only when `N > 0`.
   - `Select all` / `Clear`.
4. Update `handleDownloadAll` to zip only selected files; keep "Download all"
   available as a separate action.
5. Preserve the original naming convention and resolve duplicate names in the ZIP.
6. Keep selection stable when progress updates or files are removed.

## Acceptance criteria

- [ ] Users can select/deselect individual completed files.
- [ ] "Download selected" zips exactly the selected subset.
- [ ] Selection survives re-renders and compression progress updates.
- [ ] Removing a file removes it from the selection.
- [ ] Controls are keyboard accessible and work on mobile.
- [ ] New strings are translated (ES/EN and future locales).
- [ ] Tests cover selection helpers and ZIP contents.

## Technical notes

- Relevant files: `src/store/app-store.ts`,
  `src/components/file-list/FileList.tsx`, `FileCard.tsx`.
- Prefer a pure helper `buildZipEntries(files, selectedIds)` for testability.
- Consider showing total selected size before download.
