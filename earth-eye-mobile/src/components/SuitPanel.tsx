/**
 * SuitPanel.tsx
 *
 * Shows the status of EarthEye's physical suit — QuietBand, SoilBand,
 * LightBand, and Field Tags. For now, all devices show as 'mock'
 * (prototype), clearly distinguishing placeholder data from real
 * readings.
 *
 * Styled to EarthEye design language:
 * - Card component (#1A1A17 surface)
 * - Whisper label (9px, uppercase, 35% white)
 * - Device status dots in EarthEye accent palette
 * - Muted body text (rgba 0.70)
 * - Georgia italic for summary line
 * - No exclamation marks, no directives
 *
 * When devices come online, the panel naturally shifts from
 * "Awaiting devices" to real readings without UI changes.
 */

import { StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Accents, Spacing } from '@/constants/theme';
import { useSuitDevices } from '@/suit/useSuitDevices';
import type { DeviceStatus } from '@/suit/types';

const STATUS_COLORS: Record<DeviceStatus, string> = {
  online:  Accents.sage,     // green = connected
  mock:    'rgba(255,255,255,0.20)', // gray = placeholder
  offline: 'rgba(255,255,255,0.15)', // dimmer gray = not found
  error:   Accents.rose,     // rose = problem
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

  return (
    <Card>
      <ThemedText type="small" themeColor="textSecondary" style={styles.label}>
        SUIT INTEGRATION
      </ThemedText>

      <ThemedText style={styles.summary}>
        {suit.summary}
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
  summary: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 1.6,
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
});
