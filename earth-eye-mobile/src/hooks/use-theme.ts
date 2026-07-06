/**
 * EarthEye Mobile is dark-only by design (locked May 3 2026 — see
 * constants/theme.ts). Field use at dawn/dusk/night is the primary
 * context; the OC constitution explicitly rejects a light surface.
 *
 * Previously this read the device's OS color scheme via useColorScheme()
 * and fell back to 'light' whenever the scheme wasn't explicitly 'dark'.
 * On any device set to light mode, that silently flipped the whole app
 * to Colors.light (white bg, black text) while other components still
 * hardcoded light-on-dark assumptions — producing unreadable light
 * text on a light background.
 *
 * Fix: always return the dark theme. No OS dependency, no drift.
 */

import { Colors } from '@/constants/theme';

export function useTheme() {
  return Colors.dark;
}
