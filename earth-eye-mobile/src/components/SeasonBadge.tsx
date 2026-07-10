/**
 * SeasonBadge.tsx
 *
 * Compact badge showing which seasons a species is present.
 * Current season is highlighted with the sage accent.
 * Off-season values are whisper-weight.
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Accents } from '@/constants/theme';

const SEASONS = ['spring', 'summer', 'fall', 'winter'] as const;
const SEASON_LABELS: Record<string, string> = {
  spring: 'SPR',
  summer: 'SUM',
  fall:   'FAL',
  winter: 'WIN',
};

function getCurrentSeason(): string {
  const m = new Date().getMonth();
  if (m >= 2 && m <= 4) return 'spring';
  if (m >= 5 && m <= 7) return 'summer';
  if (m >= 8 && m <= 10) return 'fall';
  return 'winter';
}

type Props = {
  seasonPresence?: string[];
  compact?: boolean;
};

export function SeasonBadge({ seasonPresence = [], compact = false }: Props) {
  const current = getCurrentSeason();

  if (seasonPresence.length === 0) return null;

  return (
    <View style={styles.row}>
      {SEASONS.map((s) => {
        const present = seasonPresence.includes(s);
        const isCurrent = s === current;
        if (!present && compact) return null;
        return (
          <View
            key={s}
            style={[
              styles.dot,
              present && styles.dotPresent,
              present && isCurrent && styles.dotCurrent,
            ]}
          >
            {!compact && (
              <ThemedText
                style={[
                  styles.label,
                  present && styles.labelPresent,
                  present && isCurrent && styles.labelCurrent,
                ]}
              >
                {SEASON_LABELS[s]}
              </ThemedText>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  dotPresent: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dotCurrent: {
    backgroundColor: 'rgba(122,184,122,0.18)',
  },
  label: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.25)',
  },
  labelPresent: {
    color: 'rgba(255,255,255,0.50)',
  },
  labelCurrent: {
    color: Accents.sage,
  },
});
