/**
 * withGoogleMapsApiKey.js
 *
 * Custom Expo config plugin — injects Google Maps API key directly
 * into AndroidManifest.xml during every prebuild (local + EAS cloud).
 *
 * Bypasses the known SDK 57 issue where app.config.js googleMaps.apiKey
 * is silently skipped by the react-native-maps autolinking plugin.
 */

const { withAndroidManifest } = require('@expo/config-plugins');

const MAPS_META_NAME = 'com.google.android.geo.API_KEY';
const API_KEY = 'AIzaSyCombWGLM-pMIFUbAV-is3bknfuJs8VA38';

function withGoogleMapsApiKey(config) {
  return withAndroidManifest(config, async (mod) => {
    const androidManifest = mod.modResults;
    const application = androidManifest.manifest.application?.[0];

    if (!application) {
      throw new Error('[withGoogleMapsApiKey] <application> element not found in AndroidManifest.xml');
    }

    if (!application['meta-data']) {
      application['meta-data'] = [];
    }

    // Remove any existing entry (prevent duplicates on re-prebuild)
    application['meta-data'] = application['meta-data'].filter(
      (item) => item.$?.['android:name'] !== MAPS_META_NAME
    );

    // Inject
    application['meta-data'].push({
      $: {
        'android:name': MAPS_META_NAME,
        'android:value': API_KEY,
      },
    });

    console.log('[withGoogleMapsApiKey] Injected ' + MAPS_META_NAME + ' into AndroidManifest.xml');
    return mod;
  });
}

module.exports = withGoogleMapsApiKey;
