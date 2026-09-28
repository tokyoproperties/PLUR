# EarthEye OC — Base44 Dev Environment

## What this is
A Vite + React single-page app ("EarthEye OC") — a field atlas for Orange County ecology.
A separate Expo mobile app lives in `earth-eye-mobile/` but is not part of the web preview.

## Running the app
```
docker compose -f docker-compose.base44.yml up -d --build
```
The Vite dev server runs on port 3000 with live reload. Source is bind-mounted, so edits appear immediately.

## Key configuration
- **Base path**: The app ships with `base: "/PLUR/"` (for GitHub Pages). The compose sets `VITE_BASE_PATH=/` so the preview serves at root. Both `vite.config.js` and `src/App.jsx` read this env var, falling back to `/PLUR` when unset.
- **Data layer**: `src/api/restClient.js` fetches from a hardcoded public Base44 backend (`special-agent-44-342f8e58.base44.app`). No credentials needed — the endpoint is public.
- **Auth**: `src/lib/AuthContext.jsx` imports `@/api/base44Client` (which does not exist) and `@base44/sdk`, but AuthProvider is NOT used in any active route. This code is dead — do not remove it, but it won't affect the running app.

## Verifying it works
- `docker compose -f docker-compose.base44.yml ps` — web service should be healthy
- `curl -s http://localhost:3000/` — returns the HTML shell
- The Home page loads species/trails from the external Base44 backend; if that backend is down the page shows "Loading the atlas…" indefinitely

## No secrets required
The app boots without any external credentials. The data API is public and auth is not wired in.
