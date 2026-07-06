/**
 * useSound.ts
 * Ambient audio level watcher for noise-pollution filtering.
 *
 * DISABLED July 5 2026: expo-audio's useAudioRecorder creates a native
 * AudioRecorder shared object that fires RECORDING_STATUS_UPDATE events
 * at high frequency (potentially 60+ Hz). Even with a no-op listener,
 * the bridge traffic from these events starves the JS thread, causing
 * JS fps = 0 and completely freezing button responsiveness.
 *
 * The minimal preset (8kHz mono 16kbps) reduced CPU load from encoding
 * but did NOT reduce the event frequency — the native recorder still
 * sends status updates at its internal rate regardless of quality settings.
 *
 * This hook now returns a neutral state. All consumers already handle
 * null soundRelativeDb gracefully. Sound metering can be re-enabled
 * with a different approach (e.g., manual native module with controlled
 * polling, or expo-av's Audio.API which has updateInterval control).
 */

import { useState } from 'react';
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

export function useSound(_options: UseSoundOptions = {}): SoundReading {
  // Return neutral state — no audio recorder created
  return {
    relativeDb: null,
    rawMetering: null,
    band: null,
    isActive: false,
    permissionDenied: false,
    lastUpdated: null,
  };
}
