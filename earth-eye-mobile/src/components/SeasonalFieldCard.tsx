/**
 * SeasonalFieldCard.tsx -- Arc 24
 *
 * Full signal stack:
 *   Window label color   <- constellation archetype tint (slowest layer)
 *   Suggestion color     <- reweight dominant tint
 *   toneShift line       <- reweight phrase (when mature)
 *   Branch row           <- isSurfaced
 *   Initiative row       <- isSurfaced
 *   Alignment row        <- isCalibrated
 *   Presence row         <- calibrated + not absent
 *   Season label         <- always
 *
 * Constellation does NOT add a row. It tints the window label --
 * the outermost, slowest signal shows in the most prominent register.
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
import { useFieldReweight } from '@/hooks/useFieldReweight';
import { useFieldConstellation } from '@/hooks/useFieldConstellation';

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

// Reweight: suggestion line tint
const REWEIGHT_TINT: Record<string, string> = {
  alignment:  '#7AB87A',
  presence:   '#9A7AB8',
  initiative: '#C4974A',
  branch:     '#7A9AB8',
  soul:       '#9A7AB8',
  season:     'rgba(255,255,255,0.72)',
};

// Constellation: window label tint (very subtle -- blended toward base)
// Constellation is slow and stable; its color shifts gradually over weeks.
// We blend toward the base quality accent so danger overrides cleanly.
const CONSTELLATION_TINT: Record<string, string> = {
  wanderer:  '#7AB87A',   // sage -- outward, ranging
  observer:  '#7A9AB8',   // blue -- still, attentive
  steady:    'rgba(255,255,255,0.85)',  // near-white -- neutral, grounded
  returner:  '#9A7AB8',   // lavender -- cyclical, returning
  seeker:    '#C4974A',   // amber -- expansive, searching
};

export function SeasonalFieldCard() {
  const { label }        = useSeason();
  const fieldWindow      = useSeasonalFieldWindow();
  const alignment        = useFieldAlignment();
  const presence         = useFieldPresence();
  const initiative       = useFieldInitiative();
  const branch           = useFieldBranch();
  const reweight         = useFieldReweight();
  const constellation    = useFieldConstellation();

  // Window label: constellation tint when formed, quality accent as fallback
  const windowColor = constellation.isFormed
    ? CONSTELLATION_TINT[constellation.archetype]
    : (QUALITY_ACCENT[fieldWindow.quality] ?? Accents.sage);

  const alignColor    = ALIGNMENT_COLOR[alignment.state];
  const presenceColor = PRESENCE_COLOR[presence.state];
  const initColor     = INITIATIVE_COLOR[initiative.action];
  const branchColor   = BRANCH_COLOR[branch.path];
  const suggestionColor = reweight.isMature
    ? REWEIGHT_TINT[reweight.dominant]
    : 'rgba(255,255,255,0.72)';

  const showBranch        = branch.isSurfaced;
  const showInitiative    = initiative.isSurfaced;
  const showAlignment     = alignment.isCalibrated;
  const showPresence      = presence.isCalibrated && presence.state !== 'absent';
  const showReweightShift = reweight.isMature;

  return (
    <View style={s.card}>
      <ThemedText style={s.whisper}>Field Window</ThemedText>

      {/* Window label: constellation-tinted */}
      <ThemedText style={[s.windowLabel, { color: windowColor }]}>
        {fieldWindow.label}
      </ThemedText>

      {/* Suggestion: reweight-tinted */}
      <ThemedText style={[s.suggestion, { color: suggestionColor }]}>
        {fieldWindow.suggestion}
      </ThemedText>

      {/* Reweight tone shift */}
      {showReweightShift && (
        <ThemedText style={[s.toneShift, { color: suggestionColor }]}>
          {reweight.toneShift}
        </ThemedText>
      )}

      {/* Branch */}
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

      {/* Initiative */}
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

      {/* Alignment */}
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

      {/* Presence */}
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
    lineHeight: 22,
  },
  toneShift: {
    fontSize: 11, fontFamily: 'Georgia', fontStyle: 'italic',
    lineHeight: 18, opacity: 0.6, marginTop: -2,
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
