/**
 * EarthEye Mobile — Theme Constants
 *
 * Aligned to the EarthEye OC design language (locked May 3 2026):
 *   Page bg:     #0F0F0D (near-black, organic)
 *   Card bg:     #1A1A17 (barely lighter than page)
 *   Border:      rgba(255,255,255,0.07) — barely visible hairlines
 *   Accent:      #7AB87A (sage — content only, never chrome)
 *   Alt accents: dusty rose, amber, muted blue, lavender
 *
 * The mobile app is dark-only for now (field use at dawn/dusk/night
 * is the primary context). Light mode tokens are kept for framework
 * compatibility but are not the design target.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    // EarthEye design language — dark is the canonical surface
    text: 'rgba(255,255,255,0.90)',
    background: '#0F0F0D',
    backgroundElement: '#1A1A17',
    backgroundSelected: 'rgba(255,255,255,0.06)',
    textSecondary: 'rgba(255,255,255,0.55)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// EarthEye accent palette — content surfaces only, never chrome
export const Accents = {
  sage:     '#7AB87A',
  rose:     '#C47A7A',
  amber:    '#C4974A',
  blue:     '#7A9AB8',
  lavender: '#9A7AB8',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

// Card physiology (from Developer Edition constitution)
export const CardStyle = {
  bg: '#1A1A17',
  border: '1px solid rgba(255,255,255,0.07)',
  radius: 12,
  radiusSm: 8,
  px: 20,
  py: 16,
} as const;
