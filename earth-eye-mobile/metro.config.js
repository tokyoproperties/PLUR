/**
 * metro.config.js
 *
 * Wires the @/* path alias (defined in tsconfig.json) into Metro's
 * module resolver. Without this, every import like:
 *
 *   import { Spacing } from '@/constants/theme';
 *
 * fails with "Unable to resolve module" at bundle time — TypeScript
 * compiles fine (it reads tsconfig paths) but Metro doesn't.
 *
 * This is the standard pattern for Expo SDK 57 with Expo Router.
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Map @/* -> ./src/* for Metro's resolver
config.resolver.alias = {
  '@': path.resolve(projectRoot, 'src'),
  '@/assets': path.resolve(projectRoot, 'assets'),
};

module.exports = config;
