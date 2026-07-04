/**
 * babel.config.js
 *
 * Standard Expo babel preset. Required for JSX/TSX transformation.
 * Expo SDK 57 auto-includes this preset when no babel config exists,
 * but having it explicit avoids edge cases where Metro falls back to
 * a bare React Native transformer that doesn't understand Expo Router
 * or React Compiler directives.
 */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
