/**
 * SeasonalFieldCard.tsx -- Arc 20
 *
 * Home screen season intelligence card.
 * Now surfaces: field window + alignment + presence.
 *
 * Presence row appears when isCalibrated (3+ moments) AND state
 * is not 'absent' -- absent is silence, not noise.
 * Constitutional: whisper label for state, italic serif for line.
 */
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useSeason } from '@/hooks/useSeason';
import { useSeasonalFieldWindow } from '@/hooks/useSeasonalFieldWindow';
import { useFieldAlignment } from '@/hooks/useFieldAlignment';
import { useFieldPresence } from '@/hooks/useFieldPresence';

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

const PRESENCE_COLOR: Record<string, string> = {
  present:  '#7AB87A',
  drifting: '#C4974A',
  absent:   'rgba(255,255,255,0.25)',
};

export function SeasonalFieldCard() {
  const { label }   = useSeason();
  const fieldWindow = useSeasonalFieldWindow();
  const alignment   = useFieldAlignment();
  const presence    = useFieldPresence();

  const accent       = QUALITY_ACCENT[fieldWindow.quality] ?? Accents.sage;
  const alignColor   = ALIGNMENT_COLOR[alignment.state];
  const presenceColor = PRESENCE_COLOR[presence.state];

  const showAlignment = alignment.isCalibrated;
  const showPresence  = presence.isCalibrated && presence.state !== 'absent';

  return (
    <View style={s.card}>
      <ThemedText style={s.whisper}>Field Window</ThemedText>

      <ThemedText style={[s.windowLabel, { color: accent }]}>
        {fieldWindow.label}
      </ThemedText>
      <ThemedText style={s.suggestion}>{fieldWindow.suggestion}</ThemedText>

      {showAlignment && (
        <View style={s.signalRow}>
          <View style={[s.dot, { backgroundColor: alignColor }]} />
          <ThemedText style={[s.signalLabel, { color: alignColor }]}>
            {alignment.label}
          </ThemedText>
          <ThemedText style={s.signalDirective}>
            {alignment.directive}
          </ThemedText>
        </View>
      )}

      {showPresence && (
        <View style={s.signalRow}>
          <View style={[s.dot, { backgroundColor: presenceColor }]} />
          <ThemedText style={[s.signalLabel, { color: presenceColor }]}>
            {presence.label}
          </ThemedText>
          <ThemedText style={s.signalDirective}>
            {presence.line}
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
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 5,
    flexShrink: 0,
  },
  signalLabel: {
    fontSize: 9, fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: 1.1, marginTop: 2, flexShrink: 0,
  },
  signalDirective: {
    fontSize: 12, fontFamily: 'Georgia', fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)', lineHeight: 18, flex: 1,
  },
  seasonLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.30)',
    marginTop: 4, letterSpacing: 0.3,
  },
});
