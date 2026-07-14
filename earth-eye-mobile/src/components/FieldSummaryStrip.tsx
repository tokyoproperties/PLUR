/**
 * components/FieldSummaryStrip.tsx -- Arc 30 (LANTERN)
 *
 * Three human-facing phrases that compress the slow stack.
 * No engine names exposed. No new state, no new evaluator, no new hook.
 * Reads existing hook outputs only.
 *
 * Three phrases:
 *   Character   constellation + harmony   -> "Restless wanderer."
 *   Behavior    drift direction            -> "Range widening."
 *   Trajectory  foresight state           -> "Likely opening."
 *
 * Visibility: only renders when at least one slow layer is active.
 * Before any slow layer is formed: strip is absent.
 */
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useFieldConstellation } from '@/hooks/useFieldConstellation';
import { useFieldDrift } from '@/hooks/useFieldDrift';
import { useFieldHarmony } from '@/hooks/useFieldHarmony';
import { useFieldForesight } from '@/hooks/useFieldForesight';
import type { ConstellationArchetype } from '@/atlas/fieldConstellation';
import type { HarmonyMood } from '@/atlas/fieldHarmony';
import type { DriftDirection } from '@/atlas/fieldDrift';
import type { ForesightState } from '@/atlas/fieldForesight';

// ---- Character phrases (archetype x harmony mood) ------------------
// Adjective carries harmony. Noun carries archetype.
// 'settled' harmony = the quiet/calm adjective
// 'restless' harmony = the active/restless adjective
// 'turning' harmony = the shifting adjective
// 'brightening' harmony = the bright/open adjective
// 'cooling' harmony = the quiet/withdrawing adjective

const CHARACTER: Record<ConstellationArchetype, Record<HarmonyMood, string>> = {
  wanderer: {
    settled:     'Steady wanderer.',
    restless:    'Restless wanderer.',
    turning:     'Shifting wanderer.',
    brightening: 'Bright wanderer.',
    cooling:     'Quiet wanderer.',
  },
  observer: {
    settled:     'Quiet observer.',
    restless:    'Restless observer.',
    turning:     'Turning observer.',
    brightening: 'Open observer.',
    cooling:     'Still observer.',
  },
  steady: {
    settled:     'Steady field.',
    restless:    'Unsettled field.',
    turning:     'Field in motion.',
    brightening: 'Brightening field.',
    cooling:     'Cooling field.',
  },
  returner: {
    settled:     'Quiet returner.',
    restless:    'Restless returner.',
    turning:     'Returner shifting.',
    brightening: 'Returner opening.',
    cooling:     'Deep returner.',
  },
  seeker: {
    settled:     'Calm seeker.',
    restless:    'Restless seeker.',
    turning:     'Turning seeker.',
    brightening: 'Bright seeker.',
    cooling:     'Cooling seeker.',
  },
};

// ---- Behavior phrases (drift direction) ----------------------------

const BEHAVIOR: Record<DriftDirection, string> = {
  settling:    'Pattern settling.',
  brightening: 'Energy rising.',
  wandering:   'Range widening.',
  returning:   'Familiar ground.',
  seeking:     'Territory expanding.',
};

// ---- Trajectory phrases (foresight state) --------------------------

const TRAJECTORY: Record<ForesightState, string> = {
  opening:     'Likely opening.',
  deepening:   'Likely deepening.',
  turning:     'Likely turning.',
  brightening: 'Likely brightening.',
  cooling:     'Likely cooling.',
};

// ---- Component -------------------------------------------------------

export function FieldSummaryStrip() {
  const constellation = useFieldConstellation();
  const drift         = useFieldDrift();
  const harmony       = useFieldHarmony();
  const foresight     = useFieldForesight();

  // Only render when at least one slow layer has enough signal
  const hasCharacter   = constellation.isFormed;
  const hasBehavior    = drift.isMeasurable;
  const hasTrajectory  = foresight.isActive;
  const anyActive      = hasCharacter || hasBehavior || hasTrajectory;

  if (!anyActive) return null;

  const character  = hasCharacter
    ? CHARACTER[constellation.archetype][harmony.mood]
    : null;

  const behavior   = hasBehavior
    ? BEHAVIOR[drift.direction]
    : null;

  const trajectory = hasTrajectory
    ? TRAJECTORY[foresight.forecast]
    : null;

  return (
    <View style={s.strip}>
      {character && (
        <ThemedText style={s.phrase}>{character}</ThemedText>
      )}
      {behavior && (
        <ThemedText style={s.phrase}>{behavior}</ThemedText>
      )}
      {trajectory && (
        <ThemedText style={[s.phrase, s.trajectoryPhrase]}>{trajectory}</ThemedText>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  strip: {
    flexDirection:   'row',
    flexWrap:        'wrap',
    gap:             10,
    marginBottom:    10,
    paddingBottom:   10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  phrase: {
    fontSize:    13,
    fontFamily:  'Georgia',
    fontStyle:   'italic',
    color:       'rgba(255,255,255,0.60)',
    lineHeight:  18,
  },
  trajectoryPhrase: {
    color: 'rgba(255,255,255,0.35)',
  },
});
