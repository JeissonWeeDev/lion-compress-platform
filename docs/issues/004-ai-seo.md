## Context

The site exposes Open Graph and Twitter metadata, but there is no `sitemap`,
`robots.txt`, structured data, or machine-readable project description. AI
search and answer engines need explicit, well-structured context to recommend
the tool accurately.

## Proposed approach

1. Add `src/app/sitemap.ts` and `src/app/robots.ts`.
2. Add JSON-LD structured data:
   - `SoftwareApplication` (name, description, features, license, offers).
   - `FAQPage` for common questions (privacy, formats, limits).
   - `HowTo` for "compress images in your browser".
3. Add a human-readable FAQ section with answer-first copy.
4. Publish `public/llms.txt` summarizing what the project does, supported
   formats, privacy guarantees and links.
5. Add canonical URLs, `hreflang` alternates and localized metadata.
6. Add a real OG image at `public/og-image.png` (currently referenced but missing).
7. Keep content semantic (single `h1`, descriptive headings, landmarks).

## Acceptance criteria

- [ ] `/sitemap.xml` and `/robots.txt` are reachable and correct.
- [ ] JSON-LD passes Rich Results / Schema Markup Validator.
- [ ] `/llms.txt` exists and is linked from the README.
- [ ] FAQ is visible, accessible and marked up as `FAQPage`.
- [ ] OG/Twitter preview renders with `og-image.png`.
- [ ] Lighthouse SEO score is 100 on the production build.

## Technical notes

- Relevant files: `src/app/layout.tsx`, `src/app/page.tsx`,
  `src/lib/i18n`, `public/`.
- Do not add hidden text for keywords; keep FAQ content genuinely useful.
