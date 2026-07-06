/**
 * ModeToggle.tsx
 * PLUR <-> LOVE selector. Two explicit tap targets (not a swipeable
 * slider) so mode switching is always a deliberate choice, never an
 * accidental gesture. Reads/writes the shared ModeContext directly.
 */

import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { MODE_META, useSymbolicMode, type SymbolicMode } from '@/contexts/mode-context';

const OPTIONS: SymbolicMode[] = ['plur', 'love'];

export function ModeToggle() {
  const { mode, setMode } = useSymbolicMode();
  // Same fix as ModeBadge: width:'100%' (percentage/stretch) proved
  // unreliable through the Animated.View ancestor chain even after
  // every wrapper got an explicit width. Absolute pixel width removes
  // the dependency on ancestor sizing propagation entirely.
  const { width: windowWidth } = useWindowDimensions();
  const toggleWidth = windowWidth - Spacing.three * 2;

  return (
    <View style={[styles.container, { width: toggleWidth }]}>
      {OPTIONS.map((option) => {
        const meta = MODE_META[option];
        const active = mode === option;
        return (
          <Pressable
            key={option}
            onPress={() => setMode(option)}
            style={[styles.option, active && { backgroundColor: meta.glowColor }]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Switch to ${meta.label} mode`}>
            <ThemedText
              type="smallBold"
              themeColor={active ? undefined : 'textSecondary'}
              style={active ? { color: meta.color } : undefined}>
              {meta.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 999,
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
    borderRadius: 999,
  },
});
