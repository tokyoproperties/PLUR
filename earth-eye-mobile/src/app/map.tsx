import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ModeBadge } from '@/components/ModeBadge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSymbolicMode } from '@/contexts/mode-context';

/**
 * Map screen — placeholder.
 * Real trail/corridor/species-hotspot map rendering (the web app's
 * watershed → corridors → trails → species hierarchy) has not been
 * ported to mobile yet. This is an honest placeholder, not a stub
 * pretending to be finished. Firework-window geofencing and
 * corridor-shading overlays are future work, once real map data lands.
 */
export default function MapScreen() {
  const { mode } = useSymbolicMode();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.badgeCorner} type="background">
          <ModeBadge mode={mode} compact pulse={false} />
        </ThemedView>
        <ThemedView style={styles.content} type="background">
          <ThemedText type="subtitle" style={styles.heading}>
            Map
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.body}>
            Trail, corridor, and species-hotspot data has not yet been ported from the
            web atlas. This tab is reserved for that work.
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCorner: {
    position: 'absolute',
    top: Spacing.four,
    right: Spacing.four,
    zIndex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    alignItems: 'flex-start',
  },
  heading: {
    marginBottom: Spacing.three,
  },
  body: {
    lineHeight: 24,
  },
});
