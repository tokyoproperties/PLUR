# EarthEye OC — Personal Photo Archive

141 species photos lived on Base44's media CDN, referenced by the atlas.
On Sep 6 2026 they were downloaded and archived into this repo so the
fieldwork no longer depends on a single external host.

- 115 photos recovered and committed here (public/photos/species/)
- 26 atlas entries pointed at URLs that return 404 — likely placeholder
  URLs from an early seeded batch, never real uploads (see manifest.json)
- manifest.json maps each photo to its species ID, name, and checksum

Because these live in `public/`, GitHub Pages also deploys them — every
photo now exists in three places: Base44 CDN, git history, and the Pages
deployment. That puzzle piece is pinned.
