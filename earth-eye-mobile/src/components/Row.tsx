/**
 * Row.tsx
 * Reusable label/value row for sensor readouts and data displays.
 * Extracted from sensors.tsx to reduce duplication.
 */

import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView style={styles.row} type="backgroundElement">
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText type="smallBold" style={styles.value}>{value}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.one,
  },
  // RN's default flexShrink is 0 (unlike web CSS, where it's 1) — without
  // this, a long value string overflows the row instead of wrapping,
  // producing clipped/overlapping text once the row is width-constrained.
  label: {
    flexShrink: 0,
    marginRight: Spacing.two,
  },
  value: {
    flexShrink: 1,
    textAlign: 'right',
  },
});
