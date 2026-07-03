import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAmbientLight } from '@/sensors/useAmbientLight';
import { useMotion } from '@/sensors/useMotion';
import { useSound } from '@/sensors/useSound';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <ThemedView style={styles.row} type="backgroundElement">
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="smallBold">{value}</ThemedText>
    </ThemedView>
  );
}

export default function SensorsScreen() {
  const light = useAmbientLight();
  const motion = useMotion();
  const sound = useSound();

  const lite = evaluateLiteMode({
    lux: light.lux,
    motionMagnitude: motion.magnitude,
    soundRelativeDb: sound.relativeDb,
  });

  const yard = evaluateYardMode({
    lux: light.lux,
    motionMagnitude: motion.magnitude,
    soundRelativeDb: sound.relativeDb,
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}>
          <ThemedText type="subtitle" style={styles.heading}>
            Field Sensors
          </ThemedText>

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            AMBIENT LIGHT
          </ThemedText>
          <Row label="Lux" value={light.lux !== null ? `${light.lux.toFixed(1)}` : '—'} />
          <Row label="Band" value={light.band ?? (light.isAvailable ? 'reading…' : 'unavailable on this device')} />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            MOTION
          </ThemedText>
          <Row label="Magnitude" value={motion.magnitude.toFixed(3)} />
          <Row label="Band" value={motion.band} />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            SOUND
          </ThemedText>
          <Row
            label="Relative dB"
            value={sound.relativeDb !== null ? sound.relativeDb.toFixed(0) : sound.permissionDenied ? 'mic permission denied' : '—'}
          />
          <Row label="Band" value={sound.band ?? '—'} />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            LITE MODE
          </ThemedText>
          <Row label="Status" value={lite.summary} />

          <ThemedText type="small" themeColor="textSecondary" style={styles.sectionLabel}>
            YARD MODE
          </ThemedText>
          <Row label="Luminance dampening" value={`${Math.round(yard.luminanceDampening * 100)}%`} />
          <Row label="Sound sensitivity" value={`${Math.round(yard.soundSensitivity * 100)}%`} />
          <Row label="Firework window" value={yard.isFireworkWindow ? 'active' : 'inactive'} />
          <Row label="Status" value={yard.summary} />
        </ScrollView>
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
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  heading: {
    marginBottom: Spacing.three,
  },
  sectionLabel: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 12,
    marginBottom: Spacing.two,
  },
});
