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
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
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
});
