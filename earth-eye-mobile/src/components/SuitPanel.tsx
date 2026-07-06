/**
 * SuitPanel.tsx
 *
 * Shows the status of EarthEye's physical suit — QuietBand, SoilBand,
 * LightBand, and Field Tags. All devices show as 'mock' (prototype)
 * until real hardware is connected.
 *
 * Structure:
 *   1. Suit State badge — forming/partial/live (honest data quality)
 *   2. Season + Mode context — operational interpretive lens
 *   3. Instrument identity line — Georgia italic, quiet
 *   4. Device rows — one per connected device
 *
 * Styled to EarthEye design language:
 * - Card component (#1A1A17 surface)
 * - Whisper label (9px, uppercase, 35% white)
 * - Device status dots in EarthEye accent palette
 * - Muted body text (rgba 0.70)
 * - Georgia italic for summary and identity lines
 * - No exclamation marks, no directives
 */

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useSeasonalProfile } from '@/atlas/useSeasonalProfile';
import { useSymbolicMode } from '@/contexts/mode-context';
import { useSuitDevices } from '@/suit/useSuitDevices';
import type { DeviceStatus } from '@/suit/types';

const STATUS_COLORS: Record<DeviceStatus, string> = {
  online:  Accents.sage,
  mock:    'rgba(255,255,255,0.20)',
  offline: 'rgba(255,255,255,0.15)',
  error:   Accents.rose,
};

const STATUS_LABELS: Record<DeviceStatus, string> = {
  online: 'online',
  mock: 'prototype',
  offline: 'offline',
  error: 'error',
};

function DeviceRow({
  name,
  status,
  reading,
}: {
  name: string;
  status: DeviceStatus;
  reading: string;
}) {
  const color = STATUS_COLORS[status] ?? 'rgba(255,255,255,0.20)';

  return (
    <View style={styles.deviceRow}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <ThemedText type="small" style={styles.deviceName}>
        {name}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.deviceReading}>
        {reading}
      </ThemedText>
    </View>
  );
}

export function SuitPanel() {
  const suit = useSuitDevices();
  const seasonal = useSeasonalProfile();
  const { mode } = useSymbolicMode();

  // --- Suit state assessment ---
  const onlineCount = suit.onlineCount;
  const totalDevices = 3 + suit.fieldTags.length; // 3 bands + tags
  const mockCount = [suit.quietBand, suit.soilBand, suit.lightBand]
    .filter((d) => d?.status === 'mock').length;

  let suitState: 'forming' | 'partial' | 'live';
  let suitStateLabel: string;
  let suitStateHint: string;

  if (onlineCount === 0) {
    if (mockCount > 0) {
      suitState = 'forming';
      suitStateLabel = 'Forming';
      suitStateHint = 'All devices in prototype mode — suit identity emerges as hardware comes online.';
    } else {
      suitState = 'forming';
      suitStateLabel = 'Forming';
      suitStateHint = 'No devices configured — the suit is an empty instrument.';
    }
  } else if (onlineCount < totalDevices) {
    suitState = 'partial';
    suitStateLabel = 'Partial';
    suitStateHint = `${onlineCount} of ${totalDevices} devices active — some bands are still offline.`;
  } else {
    suitState = 'live';
    suitStateLabel = 'Live';
    suitStateHint = 'All devices active — full instrumentation online.';
  }

  const quietBandReading = suit.quietBand
    ? suit.quietBand.status === 'online' && suit.quietBand.noiseDb !== null
      ? `${suit.quietBand.noiseDb.toFixed(0)} dB${suit.quietBand.isQuietZone ? ' · quiet zone' : ''}`
      : STATUS_LABELS[suit.quietBand.status]
    : 'not configured';

  const soilBandReading = suit.soilBand
    ? suit.soilBand.status === 'online' && suit.soilBand.moisture !== null
      ? `moisture ${Math.round(suit.soilBand.moisture * 100)}%${suit.soilBand.needsWater ? ' · water suggested' : ''}`
      : STATUS_LABELS[suit.soilBand.status]
    : 'not configured';

  const lightBandReading = suit.lightBand
    ? suit.lightBand.status === 'online' && suit.lightBand.lux !== null
      ? `${suit.lightBand.lux.toFixed(0)} lux${suit.lightBand.isShadeStable ? ' · shade stable' : ''}`
      : STATUS_LABELS[suit.lightBand.status]
    : 'not configured';

  const fieldTagsReading = suit.fieldTags.length > 0
    ? `${suit.fieldTags.filter(t => t.inRange).length}/${suit.fieldTags.length} in range`
    : 'none placed';

  const stateColor = suitState === 'live'
    ? Accents.sage
    : suitState === 'partial'
    ? Accents.amber
    : 'rgba(255,255,255,0.25)';

  return (
    <Card>
      {/* Suit State badge */}
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        SUIT STATE
      </ThemedText>

      <View style={styles.stateRow}>
        <View style={[styles.stateDot, { backgroundColor: stateColor }]} />
        <ThemedText style={styles.stateValue}>
          {suitStateLabel}
        </ThemedText>
      </View>

      <ThemedText style={styles.stateHint}>
        {suitStateHint}
      </ThemedText>

      {/* Season + Mode context */}
      <View style={styles.contextSection}>
        <View style={styles.contextRow}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.contextLabel}>
            Season
          </ThemedText>
          <ThemedText type="small" style={styles.contextValue}>
            {seasonal.phaseLabel}
          </ThemedText>
        </View>
        <View style={styles.contextRow}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.contextLabel}>
            Mode
          </ThemedText>
          <ThemedText type="small" style={styles.contextValue}>
            {mode === 'plur' ? 'PLUR' : 'LOVE'}
          </ThemedText>
        </View>
      </View>

      {/* Device rows */}
      <ThemedText type="small" themeColor="textSecondary" style={styles.devicesLabel}>
        DEVICES
      </ThemedText>
      <View style={styles.devicesSection}>
        <DeviceRow
          name="QuietBand"
          status={suit.quietBand?.status ?? 'offline'}
          reading={quietBandReading}
        />
        <DeviceRow
          name="SoilBand"
          status={suit.soilBand?.status ?? 'offline'}
          reading={soilBandReading}
        />
        <DeviceRow
          name="LightBand"
          status={suit.lightBand?.status ?? 'offline'}
          reading={lightBandReading}
        />
        <DeviceRow
          name="Field Tags"
          status={suit.fieldTags.length > 0 ? 'online' : 'mock'}
          reading={fieldTagsReading}
        />
      </View>

      {/* Instrument identity line */}
      <View style={styles.identitySection}>
        <ThemedText style={styles.identityLine}>
          {suitState === 'live'
            ? 'The suit feels the field — every reading is a conversation between instrument and land.'
            : suitState === 'partial'
            ? 'The suit is half-awake — some bands are listening, others are still silent.'
            : 'Instrumentation forms as devices come online — the suit is an empty instrument, waiting for hands.'}
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.two,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  stateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  stateValue: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.85)',
  },
  stateHint: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 21,
    marginBottom: Spacing.three,
  },
  contextSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    marginBottom: Spacing.three,
  },
  contextRow: {
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  contextLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  contextValue: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.70)',
    flexShrink: 1,
    textAlign: 'center',
  },
  devicesLabel: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.two,
  },
  devicesSection: {
    gap: Spacing.one,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.two,
  },
  deviceName: {
    flex: 1,
    lineHeight: 20,
  },
  deviceReading: {
    lineHeight: 20,
    textAlign: 'right',
  },
  identitySection: {
    marginTop: Spacing.three,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  identityLine: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 21,
  },
});
