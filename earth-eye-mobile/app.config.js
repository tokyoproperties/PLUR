/**
 * app.config.js
 * Extends app.json with dynamic, env-sourced values that must never
 * be committed to git. Expo merges app.json as the static base, then
 * applies this function.
 *
 * react-native-maps config plugin: this is what actually wires native
 * autolinking during `expo prebuild` for the Google Maps module on
 * Android. Earlier versions of react-native-maps (<1.27) don't ship
 * this plugin at all — installing the package without it means
 * prebuild "succeeds" but never generates the native module, and
 * MapView ends up undefined at runtime. Fixed by upgrading to 1.27.2
 * (Expo's recommended version) and declaring the plugin below.
 *
 * GOOGLE_MAPS_API_KEY: Maps SDK for Android key. Required for Android
 * map tiles to render at all (iOS uses Apple Maps, no key needed).
 * Set it as an env var / EAS secret before building — see .env.example.
 */

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      },
    ],
  ],
});
