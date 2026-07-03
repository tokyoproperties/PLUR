/**
 * ModePanel.tsx
 * Deeper symbolic content for the Explore tab — the "why" behind
 * PLUR / LOVE, not just the status badge. Lore, not telemetry.
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { MODE_META, type SymbolicMode } from '@/contexts/mode-context';

const SPIRIT_WORDS: Record<SymbolicMode, string[]> = {
  plur: ['Peace', 'Love', 'Unity', 'Respect'],
  // No canon acronym for LOVE yet — these are thematic descriptors,
  // not an official expansion. Flag to Stryder if one exists.
  love: ['Home', 'Family', 'Safety', 'Grounding'],
};

export function ModePanel({ mode }: { mode: SymbolicMode }) {
  const meta = MODE_META[mode];
  const words = SPIRIT_WORDS[mode];

  return (
    <ThemedView style={[styles.panel, { backgroundColor: meta.glowColor }]}>
      <ThemedText type="subtitle" style={{ color: meta.color }}>
        {meta.label}
      </ThemedText>
      <ThemedText type="default" themeColor="textSecondary" style={styles.tagline}>
        {meta.tagline}
      </ThemedText>

      <View style={styles.wordRow}>
        {words.map((word) => (
          <View key={word} style={[styles.wordChip, { borderColor: meta.color }]}>
            <ThemedText type="small" style={{ color: meta.color }}>
              {word}
            </ThemedText>
          </View>
        ))}
      </View>

      <ThemedText type="small" themeColor="textSecondary" style={styles.footnote}>
        {mode === 'plur'
          ? 'PLUR is the lens for general field use — Lite Mode underneath, minimal sensing overhead, tuned to the wider world.'
          : 'LOVE is the lens for home and yard — Yard Mode underneath, continuous luminance and sound dampening for the family, the pets, and the species nearby.'}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 16,
    padding: Spacing.four,
  },
  tagline: {
    marginTop: Spacing.one,
    lineHeight: 22,
  },
  wordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  wordChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  footnote: {
    marginTop: Spacing.three,
    lineHeight: 20,
  },
});
