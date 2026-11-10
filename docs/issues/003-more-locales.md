## Context

The app currently supports English and Spanish. Locale detection lives in
`src/proxy.ts` (cookie → `Accept-Language` → default) and dictionaries are
lazy-loaded from `src/dictionaries/`.

## Problem

Users in other regions get English even when a good local translation could be
provided. The language switcher only toggles between two locales.

## Proposed approach

1. Add locales based on target audience, e.g. `pt-BR`, `fr`, `de`, `it`, `ja`,
   `zh-CN`. Start with 2–3 to validate the workflow.
2. Extend `Locale`, `SUPPORTED_LOCALES`, and the dictionary loader in
   `src/lib/i18n/dictionaries.ts`.
3. Keep the TypeScript contract: every dictionary must match `en.json` exactly.
4. Improve detection: region-aware matching (`pt-BR` vs `pt-PT`), quality weights
   from `Accept-Language`, and cookie override.
5. Replace the toggle with a language menu that lists native names.
6. Add `hreflang` alternates and localized metadata for SEO.
7. Document a translation workflow (JSON keys, pluralization, missing-key fallback).

## Acceptance criteria

- [ ] Each new locale has full key parity with `en.json` (enforced by `tsc`).
- [ ] Locale persists via the `locale` cookie and survives reloads.
- [ ] Detection respects `Accept-Language` weights and regional variants.
- [ ] Switcher is keyboard accessible and shows native language names.
- [ ] Pages expose correct `lang` and `hreflang` attributes.
- [ ] Tests cover `isValidLocale` and locale detection.

## Technical notes

- Relevant files: `src/lib/i18n/dictionaries.ts`, `src/lib/i18n/get-locale.ts`,
  `src/proxy.ts`, `src/components/common/LanguageToggle.tsx`,
  `src/dictionaries/*.json`.
- Consider `Intl.PluralRules` if count strings are added.
