/**
 * Card.tsx
 * Reusable card component — EarthEye design language.
 * Dark surface (#1A1A17), hairline border, 12px radius.
 * Used across Home, Sensors, Explore, and future screens.
 */

import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function Card({ children, style }: { children: ReactNode; style?: any }) {
  return (
    <ThemedView style={[styles.card, style]} type="backgroundElement">
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: Spacing.three,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.two,
  },
});
