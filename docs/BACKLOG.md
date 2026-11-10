# Backlog

Planned work for LionMedia Compress. Each item below has a ready-to-file issue
draft under [`docs/issues/`](./issues/). The goal is a consistent workflow:
**issue → branch → pull request → checks → merge**.

## How to create the issues

### Option A — automated (recommended)

Requires the [GitHub CLI](https://cli.github.com/) authenticated with the
`repo` scope:

```bash
gh auth login
./scripts/create-backlog.sh
```

The script creates the custom labels, the milestones, and the six issues. It is
safe to re-run: existing items are skipped.

### Option B — manual

Open **Issues → New issue** and copy the relevant file from `docs/issues/`.
Use the title, labels and milestone from the table below.

## Labels

| Label              | Meaning                                    |
| ------------------ | ------------------------------------------ |
| `bug`              | Incorrect behavior or regression           |
| `enhancement`      | New capability or improvement              |
| `area:compression` | Encoder/decoder, workers, file handling    |
| `area:performance` | Rendering, memory, long tasks              |
| `area:i18n`        | Locales, dictionaries, detection           |
| `area:seo`         | Metadata, structured data, discoverability |
| `area:ux`          | Flows, controls, downloads                 |
| `priority:high`    | Blocks the next milestone                  |
| `priority:medium`  | Important, not urgent                      |
| `priority:low`     | Nice to have                               |

## Milestones

| Milestone                        | Theme                                                           | Issues     |
| -------------------------------- | --------------------------------------------------------------- | ---------- |
| **v0.2.0 — Correctness & speed** | Fix compression edge cases, keep the UI fast, improve downloads | #1, #2, #6 |
| **v0.3.0 — Reach & control**     | More locales and advanced compression options                   | #3, #5     |
| **v0.4.0 — Discoverability**     | SEO for humans and AI answer engines                            | #4         |

## Issues

| #   | Title                                                        | Type                          | Priority          | Milestone | Draft                                               |
| --- | ------------------------------------------------------------ | ----------------------------- | ----------------- | --------- | --------------------------------------------------- |
| 1   | Guarantee PNG-to-PNG output is never larger and always valid | `bug`                         | `priority:high`   | v0.2.0    | [001](./issues/001-png-png-size-regression.md)      |
| 2   | Keep the file list responsive with 100+ items                | `enhancement` / `performance` | `priority:high`   | v0.2.0    | [002](./issues/002-render-performance.md)           |
| 3   | Add regional locales and improve language detection          | `enhancement`                 | `priority:medium` | v0.3.0    | [003](./issues/003-more-locales.md)                 |
| 4   | Optimize for AI search and answer engines (GEO/AEO)          | `enhancement`                 | `priority:medium` | v0.4.0    | [004](./issues/004-ai-seo.md)                       |
| 5   | Expand compression controls for advanced workflows           | `enhancement`                 | `priority:medium` | v0.3.0    | [005](./issues/005-advanced-compression-options.md) |
| 6   | Download only the selected compressed files                  | `enhancement`                 | `priority:high`   | v0.2.0    | [006](./issues/006-selective-download.md)           |

## Definition of done

- [ ] Acceptance criteria in the issue are met.
- [ ] `npm run lint`, `npm run typecheck`, `npm test` and `npm run build` pass.
- [ ] New pure logic has unit tests; bug fixes include a regression test.
- [ ] User-facing strings are added to every supported locale.
- [ ] README or docs updated when behavior or configuration changes.
- [ ] PR references the issue (`Closes #N`).
