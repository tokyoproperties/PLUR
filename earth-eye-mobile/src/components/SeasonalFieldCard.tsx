/**
 * SeasonalFieldCard.tsx -- Arc 19
 *
 * Home screen season intelligence card.
 * Now surfaces field alignment state in addition to season + field window.
 *
 * Alignment row: whisper label + state badge + directive prose.
 * Constitutional: no directives in heading position -- directive lives
 * in italic serif suggestion register below the window label.
 */
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useSeason } from '@/hooks/useSeason';
import { useSeasonalFieldWindow } from '@/hooks/useSeasonalFieldWindow';
import { useFieldAlignment } from '@/hooks/useFieldAlignment';

const QUALITY_ACCENT: Record<string, string> = {
  prime:    Accents.sage,
  good:     Accents.sage,
  marginal: '#C4974A',
  avoid:    '#C47A7A',
};

const ALIGNMENT_COLOR: Record<string, string> = {
  aligned:    '#7AB87A',
  neutral:    'rgba(255,255,255,0.35)',
  misaligned: '#C47A7A',
};

export function SeasonalFieldCard() {
  const { label }    = useSeason();
  const fieldWindow  = useSeasonalFieldWindow();
  const alignment    = useFieldAlignment();
  const accent       = QUALITY_ACCENT[fieldWindow.quality] ?? Accents.sage;
  const alignColor   = ALIGNMENT_COLOR[alignment.state];

  return (
    <View style={s.card}>
      <ThemedText style={s.whisper}>Field Window</ThemedText>
      <ThemedText style={[s.windowLabel, { color: accent }]}>
        {fieldWindow.label}
      </ThemedText>
      <ThemedText style={s.suggestion}>{fieldWindow.suggestion}</ThemedText>

      {alignment.isCalibrated && (
        <View style={s.alignRow}>
          <View style={[s.alignDot, { backgroundColor: alignColor }]} />
          <ThemedText style={[s.alignLabel, { color: alignColor }]}>
            {alignment.label}
          </ThemedText>
          <ThemedText style={s.alignDirective}>
            {alignment.directive}
          </ThemedText>
        </View>
      )}

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
    width: '100%',
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
  alignRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  alignDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    flexShrink: 0,
  },
  alignLabel: {
    fontSize: 9, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1.1, marginTop: 2, flexShrink: 0,
  },
  alignDirective: {
    fontSize: 12, fontFamily: 'Georgia', fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)', lineHeight: 18, flex: 1,
  },
  seasonLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.30)',
    marginTop: 4, letterSpacing: 0.3,
  },
});
