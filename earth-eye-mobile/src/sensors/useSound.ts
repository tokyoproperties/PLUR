/**
 * useSound.ts
 * Ambient audio level watcher for noise-pollution filtering.
 *
 * Wraps expo-audio's recorder metering. Expo reports metering in dBFS
 * (roughly -160 silence to 0 clipping), which we remap to a friendlier
 * 0–100 "relative dB" scale so it lines up with SOUND_THRESHOLDS in
 * thresholds.ts. This is a relative loudness indicator for on-device
 * comparison, not a calibrated SPL meter.
 *
 * Requires: expo-audio (added to package.json dependencies) + microphone
 * permission (expo-audio's requestRecordingPermissionsAsync, or the
 * RECORD_AUDIO / NSMicrophoneUsageDescription entries in app.json).
 */

import {
  AudioModule,
  RecordingPresets,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { classifySound, type SoundBand } from '@/utils/thresholds';

export interface SoundReading {
  /** Remapped 0–100 relative dB level. Null until permission + first sample. */
  relativeDb: number | null;
  /** Raw dBFS metering value straight from the recorder, typically -160..0. */
  rawMetering: number | null;
  /** Classified band derived from SOUND_THRESHOLDS. */
  band: SoundBand | null;
  /** True once microphone permission has been granted and recording started. */
  isActive: boolean;
  /** True if microphone permission was denied. */
  permissionDenied: boolean;
  /** Timestamp (ms) of the most recent reading. */
  lastUpdated: number | null;
}

export interface UseSoundOptions {
  /** If false, no microphone permission is requested and no metering runs. Defaults to true. */
  enabled?: boolean;
}

const DEFAULT_OPTIONS: Required<UseSoundOptions> = {
  enabled: true,
};

/** Remaps dBFS (~-160 silence .. 0 clip) to a 0–100 relative scale. */
function remapDbfsToRelative(dbfs: number): number {
  const MIN_DBFS = -60; // treat quieter than this as effectively silent
  const MAX_DBFS = 0;
  const clamped = Math.max(MIN_DBFS, Math.min(MAX_DBFS, dbfs));
  return ((clamped - MIN_DBFS) / (MAX_DBFS - MIN_DBFS)) * 100;
}

export function useSound(options: UseSoundOptions = {}): SoundReading {
  const { enabled } = { ...DEFAULT_OPTIONS, ...options };

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const recorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(recorder, 200);

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
