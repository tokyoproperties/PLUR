/**
 * SeasonalFieldCard.tsx — Mission 17
 *
 * Home screen season intelligence card.
 * Shows: current season · solar window · field window quality · suggestion.
 * Whisper label register, italic serif prose, no directives.
 */
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useSeason } from '@/hooks/useSeason';
import { useSeasonalFieldWindow } from '@/hooks/useSeasonalFieldWindow';

const QUALITY_ACCENT: Record<string, string> = {
  prime:    Accents.sage,
  good:     Accents.sage,
  marginal: '#C4974A',
  avoid:    '#C47A7A',
};

export function SeasonalFieldCard() {
  const { label }   = useSeason();
  const fieldWindow = useSeasonalFieldWindow();
  const accent      = QUALITY_ACCENT[fieldWindow.quality] ?? Accents.sage;

  return (
    <View style={s.card}>
      <ThemedText style={s.whisper}>Field Window</ThemedText>
      <ThemedText style={[s.windowLabel, { color: accent }]}>
        {fieldWindow.label}
      </ThemedText>
      <ThemedText style={s.suggestion}>{fieldWindow.suggestion}</ThemedText>
      <ThemedText style={s.seasonLabel}>{label}</ThemedText>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A17',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    padding: 16,
    gap: 6,
    marginBottom: Spacing.three,
    alignSelf: 'stretch',
  },
  whisper: {
    fontSize: 9, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1.1, color: 'rgba(255,255,255,0.35)', marginBottom: 2,
  },
  windowLabel: {
    fontSize: 14, fontWeight: '600', letterSpacing: 0.2,
  },
  suggestion: {
    fontSize: 14, fontFamily: 'Georgia', fontStyle: 'italic',
    color: 'rgba(255,255,255,0.72)', lineHeight: 22,
  },
  seasonLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.30)',
    marginTop: 4, letterSpacing: 0.3,
  },
});
