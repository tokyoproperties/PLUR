/**
 * TrailStatsBlock.tsx — Mission 15
 * Compact stats row: distance · elevation · difficulty · heat risk.
 */
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Accents } from '@/constants/theme';
import { normDifficulty, normHeatRisk } from '@/hooks/useTrailList';

const DIFF_COLOR: Record<string, string> = {
  easy:      Accents.sage,
  moderate:  '#C4974A',
  hard:      '#C47A7A',
  strenuous: '#9A7AB8',
};
const HEAT_COLOR: Record<string, string> = {
  low:      Accents.sage,
  moderate: '#C4974A',
  medium:   '#C4974A',
  high:     '#C47A7A',
};

type Props = {
  distanceMiles?: number;
  elevationGain?: number;
  difficulty?:    string;
  heatRisk?:      string;
  compact?:       boolean;
};

export function TrailStatsBlock({ distanceMiles, elevationGain, difficulty, heatRisk, compact }: Props) {
  const diff     = normDifficulty(difficulty);
  const heat     = normHeatRisk(heatRisk);
  const diffColor = DIFF_COLOR[diff] ?? 'rgba(255,255,255,0.40)';
  const heatColor = HEAT_COLOR[heat] ?? 'rgba(255,255,255,0.40)';

  return (
    <View style={styles.row}>
      {distanceMiles != null && (
        <Stat label={compact ? undefined : 'DIST'} value={`${distanceMiles}mi`} />
      )}
      {elevationGain != null && (
        <Stat label={compact ? undefined : 'GAIN'} value={`${Math.round(elevationGain)}ft`} />
      )}
      {difficulty && (
        <Stat label={compact ? undefined : 'DIFF'} value={diff} color={diffColor} />
      )}
      {heatRisk && !compact && (
        <Stat label="HEAT" value={heat} color={heatColor} />
      )}
    </View>
  );
}

function Stat({ label, value, color }: { label?: string; value: string; color?: string }) {
  return (
    <View style={styles.stat}>
      {label && <ThemedText style={styles.statLabel}>{label}</ThemedText>}
      <ThemedText style={[styles.statValue, color ? { color } : null]}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
  },
  stat: {
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.25)',
    marginBottom: 1,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.70)',
    textTransform: 'capitalize',
  },
});
