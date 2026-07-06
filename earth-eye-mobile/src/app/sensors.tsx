import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { ModeBadge } from '@/components/ModeBadge';
import { Row } from '@/components/Row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Accents, BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useSymbolicMode } from '@/contexts/mode-context';
import { useSensors } from '@/hooks/useSensors';
import { useSensorSummary } from '@/sensors/useSensorSummary';
import { evaluateLiteMode } from '@/modes/lite';
import { evaluateYardMode } from '@/modes/yard';

export default function SensorsScreen() {
  const { light, motion, sound, snapshot } = useSensors();
  const { mode } = useSymbolicMode();
  const summary = useSensorSummary();

  const lite = evaluateLiteMode(snapshot);
  const yard = evaluateYardMode(snapshot);

  const interpretation =
    mode === 'love'
      ? `In LOVE mode, motion sensitivity is reduced and sound/light dampening is widened (${Math.round(yard.luminanceDampening * 100)}% luminance, ${Math.round(yard.soundSensitivity * 100)}% sound).`
      : 'In PLUR mode, sensing stays lightweight — no dampening curves applied, just gross condition checks.';

  // Summary dot color by data quality
  const dotColor =
    summary.dataQuality === 'live'
      ? Accents.sage
      : summary.dataQuality === 'partial'
      ? Accents.amber
      : 'rgba(255,255,255,0.25)';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.four }]}>
          <ThemedView style={styles.header} type="background">
            <ThemedText type="subtitle">Field Sensors</ThemedText>
            <ModeBadge mode={mode} compact pulse={false} />
          </ThemedView>

          {/* Sensor Summary — narrative interpretation */}
          <Card style={styles.summaryCard} pagePadding={Spacing.four}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.summaryLabel}>
              SENSOR SUMMARY{summary.dataQuality === 'partial' ? ' · PARTIAL' : ''}
            </ThemedText>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryDot, { backgroundColor: dotColor }]} />
              <ThemedText style={styles.summaryText}>
                {summary.summary}
              </ThemedText>
            </View>
            <ThemedText style={styles.confidenceLine}>
              {summary.confidence}
              {summary.dataQuality === 'forming' && ' · awaiting sensor data'}
            </ThemedText>
          </Card>

          <ThemedText type="small" themeColor="textSecondary" style={styles.interpretation}>
            {interpretation}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  summaryCard: {
    marginBottom: Spacing.three,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    marginTop: 7,
  },
  summaryText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 24,
  },
  confidenceLine: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.35)',
    marginLeft: 18,
  },
  interpretation: {
    marginBottom: Spacing.three,
    lineHeight: 20,
  },
  sectionLabel: {
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
