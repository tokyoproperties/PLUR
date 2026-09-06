# EarthEye v4.1 — Ergonomics Patch

## What changed (3 files)
- `src/App.jsx` — ScrollToTop component. Every page now opens at the top:
  species/trail details no longer inherit the list's scroll position, and
  browser back lands you at the top of the list instead of the middle.
- `src/pages/SpeciesDetail.jsx` — "Ecological role" now renders in the
  narrative register (Georgia italic), per the locked Design Language
  ("italic serif — arc notes and ecological descriptions"). Section rhythm
  widened 24px -> 28px.
- `src/pages/TrailDetail.jsx` — matching section rhythm (28px).

Build verified locally: compiles clean, ScrollToTop present in the bundle.

## Deploy (from your machine)
1. Close this zip into C:\EarthEye\eartheye-oc-v2-main (repo root — files merge
   over src\App.jsx, src\pages\SpeciesDetail.jsx, src\pages\TrailDetail.jsx).
2. From the repo root:
   git add -A
   git commit -m "Web v4.1: scroll-to-top ergonomics + narrative role section + rhythm"
   git push origin main
3. Actions rebuilds in ~2 min. Hard-refresh the site.
Rollback: git revert HEAD.
