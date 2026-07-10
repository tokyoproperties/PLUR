/**
 * TrailMarkerLayer.tsx — Mission 16
 *
 * Upgrade from CorridorLayer: tapping a marker navigates to /trails/[id].
 * Uses Marker + Callout (react-native-maps) with a "View trail →" label.
 *
 * Difficulty color coding:
 *   easy      → sage   #7AB87A
 *   moderate  → amber  #C4974A
 *   hard      → rose   #C47A7A
 *   strenuous → lavender #9A7AB8
 */
import { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Callout, Marker } from 'react-native-maps';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Accents } from '@/constants/theme';
import { normDifficulty } from '@/hooks/useTrailList';
import type { AtlasTrail } from '@/atlas/atlasApi';

const DIFF_COLOR: Record<string, string> = {
  easy:      Accents.sage,
  moderate:  '#C4974A',
  hard:      '#C47A7A',
  strenuous: '#9A7AB8',
};

type Props = {
  trails:  AtlasTrail[];
  visible: boolean;
};

export function TrailMarkerLayer({ trails, visible }: Props) {
  const router = useRouter();

  const handleCalloutPress = useCallback((id: string) => {
    router.push(`/trails/${id}`);
  }, [router]);

  if (!visible) return null;

  return (
    <>
      {trails.map((trail) => {
        if (!trail.lat || !trail.lng) return null;
        const diff  = normDifficulty(trail.difficulty);
        const color = DIFF_COLOR[diff] ?? Accents.sage;

        return (
          <Marker
            key={trail.id}
            coordinate={{ latitude: trail.lat, longitude: trail.lng }}
            pinColor={color}
          >
            <Callout onPress={() => handleCalloutPress(trail.id)} tooltip={false}>
              <Pressable style={cs.callout} onPress={() => handleCalloutPress(trail.id)}>
                <ThemedText style={cs.calloutName} numberOfLines={2}>{trail.name}</ThemedText>
                {trail.distanceMiles != null && (
                  <ThemedText style={cs.calloutStat}>
                    {trail.distanceMiles}mi · {diff}
                  </ThemedText>
                )}
                <ThemedText style={[cs.calloutAction, { color }]}>View trail →</ThemedText>
              </Pressable>
            </Callout>
          </Marker>
        );
      })}
    </>
  );
}

const cs = StyleSheet.create({
  callout: {
    width: 200,
    padding: 10,
    backgroundColor: '#1A1A17',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  calloutName: {
    fontSize: 13,
    fontFamily: 'Georgia',
    color: 'rgba(255,255,255,0.90)',
    marginBottom: 3,
  },
  calloutStat: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'capitalize',
    marginBottom: 6,
  },
  calloutAction: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
