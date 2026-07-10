/**
 * SpeciesHeader.tsx
 *
 * Hero block for the Species Detail screen.
 * Full-width 4:3 image → name → scientific name → season + frequency.
 */

import { StyleSheet, View } from 'react-native';

import { SeasonBadge } from '@/components/SeasonBadge';
import { SpeciesImage } from '@/components/SpeciesImage';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

type Props = {
  name:            string;
  scientificName?: string;
  imageUrl?:       string;
  seasonPresence?: string[];
  frequency?:      string;
  group?:          string;
};

export function SpeciesHeader({
  name, scientificName, imageUrl, seasonPresence, frequency, group,
}: Props) {
  return (
    <View style={styles.container}>
      <SpeciesImage uri={imageUrl} style={styles.hero} priority="high" />
      <View style={styles.meta}>
        {group ? (
          <ThemedText style={styles.group}>{group.toUpperCase()}</ThemedText>
        ) : null}
        <ThemedText style={styles.name}>{name}</ThemedText>
        {scientificName ? (
          <ThemedText style={styles.sci}>{scientificName}</ThemedText>
        ) : null}
        <View style={styles.badges}>
          <SeasonBadge seasonPresence={seasonPresence} />
          {frequency ? (
            <ThemedText style={styles.freq}>{frequency}</ThemedText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.three,
  },
  hero: {
    width: '100%',
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
  meta: {
    paddingHorizontal: 2,
  },
  group: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 6,
  },
  name: {
    fontSize: 26,
    fontFamily: 'Georgia',
    color: 'rgba(255,255,255,0.90)',
    marginBottom: 4,
  },
  sci: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: Spacing.two,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  freq: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: 'rgba(255,255,255,0.35)',
  },
});
