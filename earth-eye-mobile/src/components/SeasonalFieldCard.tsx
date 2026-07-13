/**
 * SeasonalFieldCard.tsx -- Arc 22
 *
 * Home screen season intelligence card.
 * Full signal stack (top to bottom, each optional below window):
 *   1. Field Window   -- always shown
 *   2. Branch         -- shown when isSurfaced (confidence >= 0.58, 5+ moments)
 *   3. Initiative     -- shown when isSurfaced (confidence >= 0.55, 3+ moments)
 *   4. Alignment      -- shown when calibrated (3+ moments)
 *   5. Presence       -- shown when calibrated + not absent
 *   6. Season label   -- always shown
 *
 * Branch is the outermost signal -- the "what kind of field" layer.
 * It sits above initiative, which sits above alignment, which sits above presence.
 * Constitutional: whisper labels, italic serif prose, no shouts.
 */
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useSeason } from '@/hooks/useSeason';
import { useSeasonalFieldWindow } from '@/hooks/useSeasonalFieldWindow';
import { useFieldAlignment } from '@/hooks/useFieldAlignment';
import { useFieldPresence } from '@/hooks/useFieldPresence';
import { useFieldInitiative } from '@/hooks/useFieldInitiative';
import { useFieldBranch } from '@/hooks/useFieldBranch';

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

const INITIATIVE_COLOR: Record<string, string> = {
  observe:  '#7A9AB8',
  move:     '#7AB87A',
  rest:     '#9A7AB8',
  explore:  '#C4974A',
  return:   '#C47A7A',
};

const BRANCH_COLOR: Record<string, string> = {
  stillness:   '#9A7AB8',
  movement:    '#7AB87A',
  observation: '#7A9AB8',
  return:      '#C47A7A',
  exploration: '#C4974A',
};

export function SeasonalFieldCard() {
  const { label }    = useSeason();
  const fieldWindow  = useSeasonalFieldWindow();
  const alignment    = useFieldAlignment();
  const presence     = useFieldPresence();
  const initiative   = useFieldInitiative();
  const branch       = useFieldBranch();

  const accent        = QUALITY_ACCENT[fieldWindow.quality] ?? Accents.sage;
  const alignColor    = ALIGNMENT_COLOR[alignment.state];
  const presenceColor = PRESENCE_COLOR[presence.state];
  const initColor     = INITIATIVE_COLOR[initiative.action];
  const branchColor   = BRANCH_COLOR[branch.path];

  const showBranch     = branch.isSurfaced;
  const showInitiative = initiative.isSurfaced;
  const showAlignment  = alignment.isCalibrated;
  const showPresence   = presence.isCalibrated && presence.state !== 'absent';

  return (
    <View style={s.card}>
      <ThemedText style={s.whisper}>Field Window</ThemedText>

      <ThemedText style={[s.windowLabel, { color: accent }]}>
        {fieldWindow.label}
      </ThemedText>
      <ThemedText style={s.suggestion}>{fieldWindow.suggestion}</ThemedText>

      {showBranch && (
        <View style={[s.signalRow, s.branchRow]}>
          <View style={[s.dot, { backgroundColor: branchColor }]} />
          <ThemedText style={[s.signalLabel, { color: branchColor }]}>
            {branch.path.toUpperCase()}
            {branch.variant ? '  ' + branch.variant : ''}
          </ThemedText>
          <ThemedText style={s.signalDirective}>
            {branch.overlay}
          </ThemedText>
        </View>
      )}

      {showInitiative && (
        <View style={s.signalRow}>
          <View style={[s.dot, { backgroundColor: initColor }]} />
          <ThemedText style={[s.signalLabel, { color: initColor }]}>
            {initiative.action.toUpperCase()}
          </ThemedText>
          <ThemedText style={s.signalDirective}>
            {initiative.directive}
          </ThemedText>
        </View>
      )}

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
  branchRow: {
    marginTop: 6,
    marginBottom: 2,
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
