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
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

/**
 * pagePadding: the horizontal page padding of whatever screen this
 * Card lives on (defaults to Spacing.three=16, used by Home/Atlas/
 * Ecosystem/Suit — pass Spacing.four=24 on Sensors/Explore for exact
 * fit there too). Percentage/stretch-based width proved unreliable
 * through the Animated.View entrance-animation ancestor chain even
 * after every wrapper was given an explicit width — an absolute
 * pixel width computed directly from the real window size removes
 * the dependency on that chain entirely. Confirmed necessary: this
 * is what was still truncating Field State's Mode row value even
 * after width:'100%' was applied at every level.
 */
export function Card({
  children,
  style,
  pagePadding = Spacing.three,
}: {
  children: ReactNode;
  style?: any;
  pagePadding?: number;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const cardWidth = windowWidth - pagePadding * 2;

  return (
    <ThemedView style={[styles.card, { width: cardWidth }, style]} type="backgroundElement">
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
  // NOTE (July 6 2026): no marginHorizontal here — every screen that
  // renders a Card already wraps its content in its own page-level
  // paddingHorizontal (Spacing.three or Spacing.four). Adding a second
  // horizontal inset here made every card narrower than the page's
  // own title/labels/tiles, which only became visible once the
  // hairline border was added — it read as the card being
  // "off-center" relative to everything around it.
  card: {
    borderRadius: 12,
    padding: Spacing.three,
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
