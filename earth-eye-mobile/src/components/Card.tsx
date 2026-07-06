/**
 * Card.tsx
 * Reusable card component — EarthEye design language.
 * Dark surface (#1A1A17), hairline border, 12px radius.
 * Used across Home, Sensors, Explore, and future screens.
 *
 * Depth pass (July 6 2026): the constitution bans shadows/glow for
 * elevation, but its own tokens define a two-tier surface system —
 * bg-card (#1A1A17) for the card itself, and bg-card-inset
 * (rgba(255,255,255,0.04)) for nested sub-panels inside it. Cards
 * were missing their border entirely, and nothing used the inset
 * tier — every row inside a card sat at the exact same flat tone.
 *
 * `CardRow` gives stat rows / key-value pairs a subtly raised inset
 * surface and a hairline top divider, so multi-row cards (Hybrid
 * Field State, Suit, Ecosystem, Corridor) read as layered content
 * instead of one undifferentiated block. No shadow, no glow — just
 * background contrast, exactly per the sealed tokens.
 */

import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function Card({ children, style }: { children: ReactNode; style?: any }) {
  return (
    <ThemedView style={[styles.card, style]} type="backgroundElement">
      {children}
    </ThemedView>
  );
}

/**
 * A nested sub-panel inside a Card — the bg-card-inset tier.
 * Use for stat tiles, grouped key-value rows, or any content that
 * should read as "inside" the card rather than flush with it.
 */
export function CardInset({ children, style }: { children: ReactNode; style?: any }) {
  return <View style={[styles.inset, style]}>{children}</View>;
}

/**
 * A single row inside a card with a hairline top divider — for
 * stacked key-value rows (Proximity, Mode, Suggestion, etc.) so
 * they read as distinct lines rather than one flat paragraph.
 * First row in a stack should pass noDivider to avoid a leading line.
 */
export function CardRow({
  children,
  style,
  noDivider,
}: {
  children: ReactNode;
  style?: any;
  noDivider?: boolean;
}) {
  return <View style={[styles.row, !noDivider && styles.rowDivider, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: Spacing.three,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  inset: {
    borderRadius: 8,
    padding: Spacing.two,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  row: {
    paddingVertical: Spacing.two,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
});
