/**
 * ModeBadge.tsx
 * Reusable pill showing the current symbolic mode (PLUR / LOVE).
 * Presentation-only — reads mode + color/tagline from props, does not
 * touch the ModeContext itself, so it can show either the live current
 * mode or (rarely) an explicit override.
 */

import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { MODE_META, type SymbolicMode } from '@/contexts/mode-context';

export interface ModeBadgeProps {
  mode: SymbolicMode;
  /** Optional interpretive line (e.g. "Motion sensitivity reduced"). Hidden when compact. */
  statusText?: string;
  /** Small pill for corner/header placement (Sensors, Map). Defaults to false. */
  compact?: boolean;
  /** Soft pulse glow on the indicator dot. Defaults to true. */
  pulse?: boolean;
}

export function ModeBadge({ mode, statusText, compact = false, pulse = true }: ModeBadgeProps) {
  const meta = MODE_META[mode];
  const pulseAnim = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    if (!pulse) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.55, duration: 1400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, pulseAnim]);

  return (
    <View
      style={[
        styles.container,
        compact && styles.compactContainer,
        { backgroundColor: meta.glowColor },
      ]}>
      <Animated.View
        style={[styles.dot, { backgroundColor: meta.color, opacity: pulse ? pulseAnim : 1 }]}
      />
      <View style={styles.textBlock}>
        <ThemedText type={compact ? 'small' : 'smallBold'} style={{ color: meta.color }}>
          {meta.label}
        </ThemedText>
        {!compact && statusText ? (
          <ThemedText type="small" themeColor="textSecondary">
            {statusText}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
  },
  compactContainer: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.two,
  },
  textBlock: {
    flexShrink: 1,
  },
});
