#!/usr/bin/env bash
#
# Create the LionMedia Compress backlog on GitHub.
# Requires the GitHub CLI authenticated with the `repo` scope:
#
#   gh auth login
#   ./scripts/create-backlog.sh
#
# Safe to re-run: existing labels, milestones and issues are skipped.

set -euo pipefail

REPO="${REPO:-JeissonWeeDev/lion-compress-platform}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ISSUES_DIR="$ROOT/docs/issues"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: GitHub CLI (gh) is required — https://cli.github.com/" >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "error: run 'gh auth login' first" >&2
  exit 1
fi

create_label() {
  local name="$1" color="$2" description="$3"
  gh label create "$name" --repo "$REPO" --color "$color" --description "$description" \
    >/dev/null 2>&1 || true
}

echo "==> Creating labels"
create_label "area:compression" "1D76DB" "Encoder/decoder, workers and file handling"
create_label "area:performance" "0E8A16" "Rendering, memory and long tasks"
create_label "area:i18n"        "5319E7" "Locales, dictionaries and detection"
create_label "area:seo"         "FBCA04" "Metadata, structured data and discoverability"
create_label "area:ux"          "C2E0C6" "Flows, controls and downloads"
create_label "priority:high"    "B60205" "Blocks the next milestone"
create_label "priority:medium"  "D93F0B" "Important, not urgent"
create_label "priority:low"     "FEF2C0" "Nice to have"

create_milestone() {
  local title="$1"
  if gh api "repos/$REPO/milestones?state=all&per_page=100" \
      --jq ".[].title" 2>/dev/null | grep -Fxq "$title"; then
    return 0
  fi
  gh api "repos/$REPO/milestones" -f title="$title" -f state="open" >/dev/null 2>&1 || true
}

echo "==> Creating milestones"
create_milestone "v0.2.0 - Correctness & speed"
create_milestone "v0.3.0 - Reach & control"
create_milestone "v0.4.0 - Discoverability"

EXISTING_TITLES="$(gh issue list --repo "$REPO" --state all --limit 500 --json title --jq '.[].title')"

create_issue() {
  local title="$1" labels="$2" milestone="$3" file="$4"

  if grep -Fxq "$title" <<<"$EXISTING_TITLES"; then
    echo "    skip: $title"
    return 0
  fi

  echo "    create: $title"
  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body-file "$ISSUES_DIR/$file" \
    --label "$labels" \
    --milestone "$milestone" \
    >/dev/null
}

echo "==> Creating issues"
create_issue \
  "fix(compression): guarantee PNG-to-PNG output is never larger and always valid" \
  "bug,area:compression,priority:high" \
  "v0.2.0 - Correctness & speed" \
  "001-png-png-size-regression.md"

create_issue \
  "perf(ui): keep the file list responsive with 100+ items" \
  "enhancement,area:performance,priority:high" \
  "v0.2.0 - Correctness & speed" \
  "002-render-performance.md"

create_issue \
  "feat(i18n): add regional locales and improve language detection" \
  "enhancement,area:i18n,priority:medium" \
  "v0.3.0 - Reach & control" \
  "003-more-locales.md"

create_issue \
  "feat(seo): optimize for AI search and answer engines (GEO/AEO)" \
  "enhancement,area:seo,priority:medium" \
  "v0.4.0 - Discoverability" \
  "004-ai-seo.md"

create_issue \
  "feat(settings): expand compression controls for advanced workflows" \
  "enhancement,area:ux,area:compression,priority:medium" \
  "v0.3.0 - Reach & control" \
  "005-advanced-compression-options.md"

create_issue \
  "feat(ux): download only the selected compressed files" \
  "enhancement,area:ux,priority:high" \
  "v0.2.0 - Correctness & speed" \
  "006-selective-download.md"

echo "==> Done. Backlog: https://github.com/$REPO/issues"
