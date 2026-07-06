/**
 * useSound.ts
 * Ambient audio level watcher for noise-pollution filtering.
 *
 * Wraps expo-audio's recorder metering. Uses a MINIMAL preset
 * (mono, 8kHz, low bitrate) since we only need loudness metering,
 * not audio capture. HIGH_QUALITY was causing severe performance
 * issues — continuous CD-quality audio encoding from the root
 * provider was blocking the JS thread.
 *
 * PERFORMANCE CHANGES:
 * - Custom minimal preset: mono, 8000Hz, 16kbps (was: stereo, 44100Hz, 128kbps)
 * - Polling interval: 2000ms (was: 200ms)
 * - Estimated CPU reduction: ~95%
 */

import {
  AudioModule,
  useAudioRecorder,
  useAudioRecorderState,
  type RecordingOptions,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { classifySound, type SoundBand } from '@/utils/thresholds';

export interface SoundReading {
  relativeDb: number | null;
  rawMetering: number | null;
  band: SoundBand | null;
  isActive: boolean;
  permissionDenied: boolean;
  lastUpdated: number | null;
}

export interface UseSoundOptions {
  enabled?: boolean;
}

const DEFAULT_OPTIONS: Required<UseSoundOptions> = {
  enabled: true,
};

// Minimal preset — metering only, not audio capture
// Mono, 8kHz, lowest bitrate. ~20x lighter than HIGH_QUALITY.
const METERING_ONLY_PRESET: RecordingOptions = {
  extension: '.m4a',
  sampleRate: 8000,
  numberOfChannels: 1,
  bitRate: 16000,
  android: {
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  ios: {
    outputFormat: 'aac ',
    audioQuality: 0, // MIN
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 16000,
  },
};

// Poll every 2 seconds — ecological awareness doesn't need 5Hz
const METERING_POLL_MS = 2000;

function remapDbfsToRelative(dbfs: number): number {
  const MIN_DBFS = -60;
  const MAX_DBFS = 0;
  const clamped = Math.max(MIN_DBFS, Math.min(MAX_DBFS, dbfs));
  return ((clamped - MIN_DBFS) / (MAX_DBFS - MIN_DBFS)) * 100;
}

export function useSound(options: UseSoundOptions = {}): SoundReading {
  const { enabled } = { ...DEFAULT_OPTIONS, ...options };

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const recorder = useAudioRecorder({
    ...METERING_ONLY_PRESET,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(recorder, METERING_POLL_MS);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    (async () => {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!mounted) return;

      if (!permission.granted) {
        setPermissionDenied(true);
        return;
      }

      await recorder.prepareToRecordAsync();
      recorder.record();
      if (mounted) setIsActive(true);
    })();

    return () => {
      mounted = false;
      if (recorder.isRecording) {
        recorder.stop();
      }
      setIsActive(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const rawMetering = recorderState.metering ?? null;
  const relativeDb = rawMetering !== null ? remapDbfsToRelative(rawMetering) : null;

  return {
    relativeDb,
    rawMetering,
    band: relativeDb !== null ? classifySound(relativeDb) : null,
    isActive,
    permissionDenied,
    lastUpdated: isActive ? Date.now() : null,
  };
}
