/**
 * app.config.js
 * Extends app.json with dynamic, env-sourced values that must never
 * be committed to git. Expo merges app.json as the static base, then
 * applies this function.
 *
 * GOOGLE_MAPS_API_KEY: Maps SDK for Android key. Required for Android
 * map tiles to render at all (iOS uses Apple Maps, no key needed).
 * Set it as an env var / EAS secret before building — see .env.example.
 */

module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...(config.android?.config ?? {}),
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
    },
  },
});
