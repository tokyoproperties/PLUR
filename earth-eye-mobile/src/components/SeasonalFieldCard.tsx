/**
 * SeasonalFieldCard.tsx -- Arc 27
 *
 * Three-register color system (unchanged):
 *   Window label   <- constellation archetype tint (weeks)
 *   Suggestion     <- reweight dominant tint (days)
 *   Chapter label  <- drift direction tint (weeks, directional)
 *
 * Arc 27 addition: "Field mood: X" appended to the chapter footer.
 * One word. No new color. No new row. The slow layers now speak
 * with one voice at the bottom of the card.
 *
 * Visibility gate: harmony.isReadable (at least one sibling active).
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
import { useFieldDrift } from '@/hooks/useFieldDrift';
import { useFieldHarmony } from '@/hooks/useFieldHarmony';
import { FieldSummaryStrip } from '@/components/FieldSummaryStrip';
import { useFieldForesight } from '@/hooks/useFieldForesight';

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

const CONSTELLATION_TINT: Record<string, string> = {
  wanderer:  '#7AB87A',
  observer:  '#7A9AB8',
  steady:    'rgba(255,255,255,0.85)',
  returner:  '#9A7AB8',
  seeker:    '#C4974A',
};

const REWEIGHT_TINT: Record<string, string> = {
  alignment:  '#7AB87A',
  presence:   '#9A7AB8',
  initiative: '#C4974A',
  branch:     '#7A9AB8',
  soul:       '#9A7AB8',
  season:     'rgba(255,255,255,0.72)',
};

const DRIFT_TINT: Record<string, string> = {
  settling:    'rgba(255,255,255,0.28)',
  brightening: 'rgba(196,151,74,0.55)',
  wandering:   'rgba(122,154,184,0.55)',
  returning:   'rgba(154,122,184,0.55)',
  seeking:     'rgba(196,151,74,0.65)',
};

export function SeasonalFieldCard() {
  const { label }      = useSeason();
  const fieldWindow    = useSeasonalFieldWindow();
  const alignment      = useFieldAlignment();
  const presence       = useFieldPresence();
  const initiative     = useFieldInitiative();
  const branch         = useFieldBranch();
  const reweight       = useFieldReweight();
  const constellation  = useFieldConstellation();
  const drift          = useFieldDrift();
  const harmony        = useFieldHarmony();
  const foresight      = useFieldForesight();

  const windowColor = constellation.isFormed
    ? CONSTELLATION_TINT[constellation.archetype]
    : (QUALITY_ACCENT[fieldWindow.quality] ?? Accents.sage);

  const suggestionColor = reweight.isMature
    ? REWEIGHT_TINT[reweight.dominant]
    : 'rgba(255,255,255,0.72)';

  const chapterColor = drift.isMeasurable
    ? DRIFT_TINT[drift.direction]
    : 'rgba(255,255,255,0.30)';

  const alignColor    = ALIGNMENT_COLOR[alignment.state];
  const presenceColor = PRESENCE_COLOR[presence.state];
  const initColor     = INITIATIVE_COLOR[initiative.action];
  const branchColor   = BRANCH_COLOR[branch.path];

  const showBranch        = branch.isSurfaced;
  const showInitiative    = initiative.isSurfaced;
  const showAlignment     = alignment.isCalibrated;
  const showPresence      = presence.isCalibrated && presence.state !== 'absent';
  const showReweightShift = reweight.isMature;

  return (
    <View style={s.card}>
      <FieldSummaryStrip />

      <ThemedText style={s.whisper}>Field Window</ThemedText>

      <ThemedText style={[s.windowLabel, { color: windowColor }]}>
        {fieldWindow.label}
      </ThemedText>

      <ThemedText style={[s.suggestion, { color: suggestionColor }]}>
        {fieldWindow.suggestion}
      </ThemedText>

      {showReweightShift && (
        <ThemedText style={[s.toneShift, { color: suggestionColor }]}>
          {reweight.toneShift}
        </ThemedText>
      )}

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

      {/* Chapter footer: drift note + harmony mood */}
      <View style={s.chapterFooter}>
        <ThemedText style={[s.seasonLabel, { color: chapterColor }]}>
          {label}
        </ThemedText>
        {drift.isMeasurable && (
          <ThemedText style={[s.chapterNote, { color: chapterColor }]}>
            {drift.chapterNote}
          </ThemedText>
        )}
        {harmony.isReadable && (
          <ThemedText style={s.harmonyMood}>
            {harmony.moodLabel}
          </ThemedText>
        )}
        {foresight.isActive && (
          <ThemedText style={s.foresightLabel}>
            {foresight.label}
          </ThemedText>
        )}
      </View>
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
  chapterFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  seasonLabel: {
    fontSize: 11, letterSpacing: 0.3,
  },
  chapterNote: {
    fontSize: 10, fontFamily: 'Georgia', fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  harmonyMood: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.22)',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  foresightLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.18)',
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    letterSpacing: 0.25,
  },
});
