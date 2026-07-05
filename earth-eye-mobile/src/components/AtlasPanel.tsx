/**
 * AtlasPanel.tsx
 *
 * The Field Atlas — the complete cosmology of place.
 * Phases XI-XXI: the full stack from perception to soul.
 *
 * Visual hierarchy (meaning gradient):
 *   ZONE 1 — PERCEPTION (whisper + italic lines)
 *     Season label → Identity reflection → Rhythm → Drift
 *
 *   ZONE 2 — ECOLOGY (sage/blue tints)
 *     Arrival → Habitat
 *
 *   ZONE 3 — MEMORY (amber tints)
 *     Memory line → Mythology
 *
 *   ZONE 4 — ESSENCE (the capstone — brightest, largest)
 *     Soul (17px, 0.90 opacity) → Spirit (15px, violet) → Lore (14px, amber)
 *     → Continuity (13px, slate)
 *
 *   ZONE 5 — CURRENT MOMENT (card + summary + recent log)
 *
 * Typography gradient:
 *   Soul → 16px Georgia italic, rgba(255,255,255,0.92)
 *   Spirit → 15px Georgia italic, rgba(154,122,184,0.82)
 *   Mythology → 14px Georgia italic, rgba(255,255,255,0.78)
 *   Lore → 14px Georgia italic, rgba(196,151,74,0.68)
 *   Continuity → 13px Georgia italic, rgba(154,122,184,0.58)
 *   Memory → 13px Georgia italic, rgba(196,151,74,0.55)
 *   Habitat → 13px Georgia italic, rgba(122,154,184,0.60)
 *   Drift → 13px Georgia italic, rgba(255,255,255,0.48)
 *   Rhythm → 13px Georgia italic, rgba(255,255,255,0.55)
 *   Identity → 15px Georgia italic, rgba(255,255,255,0.82)
 */

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useAtlas } from '@/atlas/useAtlas';
import { useFieldIdentity } from '@/atlas/useFieldIdentity';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useCorridorDrift } from '@/corridor/useCorridorDrift';
import { useSpeciesArrival } from '@/ecosystem/useSpeciesArrival';
import { useHabitatZones } from '@/ecosystem/useHabitatZones';
import { useFieldMemory } from '@/atlas/useFieldMemory';
import { useFieldMythology } from '@/atlas/useFieldMythology';
import { useFieldSoul } from '@/atlas/useFieldSoul';
import { useFieldSpirit } from '@/atlas/useFieldSpirit';
import { useFieldLore } from '@/atlas/useFieldLore';
import { useFieldContinuity } from '@/atlas/useFieldContinuity';
import type { AtlasCardType } from '@/atlas/fieldMoment';

const CARD_TYPE_COLORS: Partial<Record<AtlasCardType, string>> = {
  yard: Accents.sage, trail: Accents.sage, coastal: Accents.blue,
  night: Accents.lavender, fallback: Accents.amber, field: 'rgba(255,255,255,0.45)',
};
const CARD_TYPE_LABELS: Partial<Record<AtlasCardType, string>> = {
  yard: 'Yard', trail: 'Trail', coastal: 'Coastal',
  night: 'Night', fallback: 'Fallback', field: 'Field',
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h % 12 || 12}:${m} ${h >= 12 ? 'pm' : 'am'}`;
}

/**
 * SectionDivider — hairline between zones.
 */
function SectionDivider() {
  return <View style={styles.divider} />;
}

export function AtlasPanel() {
  const atlas = useAtlas();
  const identity = useFieldIdentity();
  const seasonal = useSeasonalProfile();
  const drift = useCorridorDrift();
  const arrivals = useSpeciesArrival();
  const habitats = useHabitatZones();
  const memory = useFieldMemory();
  const mythology = useFieldMythology();
  const soul = useFieldSoul();
  const spirit = useFieldSpirit();
  const lore = useFieldLore();
  const continuity = useFieldContinuity();

  if (atlas.totalMoments === 0 || !atlas.latest) {
    return (
      <Card>
        <ThemedText type="small" themeColor="textSecondary" style={styles.whisper}>FIELD ATLAS</ThemedText>
        <ThemedText style={styles.emptyText}>No field moments recorded yet. The atlas will grow as the environment changes.</ThemedText>
      </Card>
    );
  }

  const latest = atlas.latest;
  const cardColor = CARD_TYPE_COLORS[latest.cardType] ?? 'rgba(255,255,255,0.45)';
  const cardLabel = CARD_TYPE_LABELS[latest.cardType] ?? 'Field';
  const recentMoments = atlas.moments.slice(-4, -1).reverse();

  // Check which zones have content
  const hasPerception = identity.isEstablished || drift.isAssessed;
  const hasEcology = arrivals.imminent.length > 0 || (habitats.isAssessed && habitats.primary);
  const hasMemory = memory.isEstablished || mythology.isEstablished;
  const hasEssence = soul.isEstablished || spirit.isEstablished || lore.isEstablished || continuity.isEstablished;

  return (
    <Card style={styles.atlasCard}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.whisper}>FIELD ATLAS</ThemedText>

      {/* Season badge */}
      <View style={styles.seasonalRow}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.seasonalLabel}>
          {seasonal.phaseLabel.toUpperCase()}
        </ThemedText>
        {seasonal.patternConfirmed && (
          <ThemedText style={styles.confirmedText}>pattern confirmed</ThemedText>
        )}
      </View>

      {/* ZONE 1 — PERCEPTION */}
      {hasPerception && (
        <View style={styles.zone}>
          {identity.isEstablished && (
            <ThemedText style={styles.identityLine}>{identity.reflection}</ThemedText>
          )}
          <ThemedText style={styles.rhythmLine}>{seasonal.fieldRhythm}</ThemedText>
          {drift.isAssessed && <ThemedText style={styles.driftLine}>{drift.description}</ThemedText>}
        </View>
      )}

      {/* ZONE 2 — ECOLOGY */}
      {hasEcology && (
        <View style={styles.zone}>
          {hasPerception && <SectionDivider />}
          <ThemedText style={styles.zoneLabel}>ECOLOGY</ThemedText>
          {arrivals.imminent.length > 0 && (
            <ThemedText style={styles.arrivalLine}>{arrivals.atlasLine}</ThemedText>
          )}
          {habitats.isAssessed && habitats.primary && (
            <ThemedText style={styles.habitatLine}>{habitats.atlasLine}</ThemedText>
          )}
        </View>
      )}

      {/* ZONE 3 — MEMORY */}
      {hasMemory && (
        <View style={styles.zone}>
          {(hasPerception || hasEcology) && <SectionDivider />}
          <ThemedText style={styles.zoneLabel}>MEMORY</ThemedText>
          {memory.isEstablished && (
            <ThemedText style={styles.memoryLine}>{memory.memoryLine}</ThemedText>
          )}
          {mythology.isEstablished && (
            <ThemedText style={styles.mythologyLine}>{mythology.mythologyLine}</ThemedText>
          )}
        </View>
      )}

      {/* ZONE 4 — ESSENCE (the capstone) */}
      {hasEssence && (
        <View style={styles.essenceZone}>
          {(hasPerception || hasEcology || hasMemory) && <SectionDivider />}
          <ThemedText style={styles.zoneLabel}>ESSENCE</ThemedText>

          {/* Soul — the brightest, largest text in the panel */}
          {soul.isEstablished && (
            <View style={styles.soulBlock}>
              <ThemedText style={styles.soulName}>{soul.name}</ThemedText>
              <ThemedText style={styles.soulLine}>{soul.soulLine}</ThemedText>
            </View>
          )}

          {/* Spirit — violet, slightly smaller */}
          {spirit.isEstablished && (
            <View style={styles.spiritBlock}>
              <ThemedText style={styles.spiritName}>{spirit.name}</ThemedText>
              <ThemedText style={styles.spiritLine}>{spirit.spiritLine}</ThemedText>
              {spirit.speciesAnchors.length > 0 && (
                <View style={styles.anchorRow}>
                  {spirit.speciesAnchors.slice(0, 4).map((a, i) => (
                    <ThemedText key={i} style={styles.anchorChip}>{a}</ThemedText>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Lore — amber, warm */}
          {lore.isEstablished && (
            <ThemedText style={styles.loreLine}>{lore.loreLine}</ThemedText>
          )}

          {/* Continuity — slate, quiet */}
          {continuity.isEstablished && (
            <View style={styles.continuityBlock}>
              <ThemedText style={styles.continuityArc}>{continuity.arcLabel}</ThemedText>
              <ThemedText style={styles.continuityLine}>{continuity.continuityLine}</ThemedText>
            </View>
          )}
        </View>
      )}

      {/* ZONE 5 — CURRENT MOMENT */}
      <View style={styles.momentZone}>
        {(hasPerception || hasEcology || hasMemory || hasEssence) && <SectionDivider />}
        <ThemedText style={styles.zoneLabel}>NOW</ThemedText>

        <View style={styles.cardTypeRow}>
          <View style={[styles.cardTypeDot, { backgroundColor: cardColor }]} />
          <ThemedText style={styles.cardTypeLabel}>{cardLabel}</ThemedText>
          <ThemedText style={styles.timestamp}>{formatTime(latest.timestamp)}</ThemedText>
        </View>
        <ThemedText style={styles.cardText}>{latest.cardText}</ThemedText>

        <ThemedText style={styles.summaryLine}>{atlas.summary.summary}</ThemedText>

        {recentMoments.length > 0 && (
          <View style={styles.recentSection}>
            {recentMoments.map((m) => (
              <View key={m.id} style={styles.recentRow}>
                <ThemedText style={styles.recentTime}>{formatTime(m.timestamp)}</ThemedText>
                <ThemedText style={styles.recentText}>
                  {m.fieldState} · {m.cardType}{m.invitedCount > 0 && ` · ${m.invitedCount} invited`}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  atlasCard: {
    paddingVertical: Spacing.four,
  },
  whisper: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: Spacing.two,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.6,
  },
  seasonalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  seasonalLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.35)',
  },
  confirmedText: {
    fontSize: 9,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.25)',
  },

  // Zone structure
  zone: {
    marginBottom: Spacing.two,
  },
  essenceZone: {
    marginBottom: Spacing.two,
  },
  momentZone: {
    marginTop: Spacing.one,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: Spacing.three,
  },
  zoneLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.28)',
    marginBottom: Spacing.two,
  },

  // Perception lines
  identityLine: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 1.7,
    marginBottom: Spacing.two,
  },
  rhythmLine: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  driftLine: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.48)',
    lineHeight: 1.6,
  },

  // Ecology lines
  arrivalLine: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(122,184,122,0.60)',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  habitatLine: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(122,154,184,0.60)',
    lineHeight: 1.6,
  },

  // Memory lines
  memoryLine: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(196,151,74,0.55)',
    lineHeight: 1.6,
    marginBottom: 6,
  },
  mythologyLine: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 1.7,
  },

  // Essence — the capstone (meaning gradient: brightest = deepest)
  soulBlock: {
    marginBottom: Spacing.three,
  },
  soulName: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 1.6,
    marginBottom: 4,
  },
  soulLine: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.88)',
    lineHeight: 1.7,
  },

  spiritBlock: {
    marginBottom: Spacing.three,
  },
  spiritName: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.85)',
    lineHeight: 1.6,
    marginBottom: 4,
  },
  spiritLine: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.72)',
    lineHeight: 1.7,
  },
  anchorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  anchorChip: {
    fontSize: 10,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.40)',
    marginRight: 8,
    marginTop: 2,
  },

  loreLine: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(196,151,74,0.68)',
    lineHeight: 1.7,
    marginBottom: Spacing.two,
  },

  continuityBlock: {
    marginTop: Spacing.one,
  },
  continuityArc: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.60)',
    lineHeight: 1.6,
    marginBottom: 4,
  },
  continuityLine: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(154,122,184,0.50)',
    lineHeight: 1.6,
  },

  // Current moment
  cardTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.two,
  },
  cardTypeLabel: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.50)',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  cardText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 1.7,
    marginBottom: Spacing.two,
  },
  summaryLine: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.50)',
    lineHeight: 1.6,
  },
  recentSection: {
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  recentRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  recentTime: {
    width: 70,
    fontSize: 11,
    color: 'rgba(255,255,255,0.30)',
  },
  recentText: {
    flex: 1,
    fontSize: 11,
    color: 'rgba(255,255,255,0.30)',
  },
});
