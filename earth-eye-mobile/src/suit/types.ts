/**
 * suit/types.ts
 *
 * Device-agnostic interfaces for EarthEye's physical "suit" —
 * wearables, sensors, and tags that extend the Hybrid Field State
 * into the physical world.
 *
 * All interfaces are pure TypeScript. No hardware assumptions.
 * Hooks return mock/offline data until real devices are connected.
 *
 * Architecture for real integration:
 *   - Each device type gets an adapter (BLE, USB-C, Wi-Fi, etc.)
 *   - Adapter writes to a shared store
 *   - Hooks read from the store
 *   - Hybrid engine reads from hooks as additional context
 *
 * Hybrid influence (how each device would shape HybridState):
 *   QuietBand → refines 'noisy'/'calm' field state
 *   SoilBand  → feeds Yard Mode moisture/temperature context
 *   LightBand → refines 'bright'/'still' corridor tone
 *   FieldTags → refine proximity classification (yard/gate/trailhead)
 */

/** Connection status for any suit device */
export type DeviceStatus = 'online' | 'offline' | 'mock' | 'error';

/** Battery level 0.0–1.0, null if unknown */
export type BatteryLevel = number | null;

/** Base reading — all device readings share these fields */
export interface DeviceReadingBase {
  /** Device identifier */
  deviceId: string;
  /** Human-readable device name */
  name: string;
  /** Connection status */
  status: DeviceStatus;
  /** Battery level 0.0–1.0, null if unknown */
  battery: BatteryLevel;
  /** ISO timestamp of last reading, null if never read */
  lastReadingAt: number | null;
}

// ─── QuietBand ────────────────────────────────────────────
// A noise/motion wearable (wrist clip, pocket sensor) that
// extends the phone's sound + motion sensing to body-worn context.

export interface QuietBandReading extends DeviceReadingBase {
  /** Ambient noise level in dB at the wearer's position */
  noiseDb: number | null;
  /** Body motion magnitude (0 = still, >0.15 = active) */
  bodyMotion: number;
  /** Whether the wearer is in a quiet zone (noiseDb < 30) */
  isQuietZone: boolean;
}

// ─── SoilBand ─────────────────────────────────────────────
// A yard soil moisture + temperature sensor for the Bakersfield
// garden. Feeds Yard Mode and future micro-ecosystem modules.

export interface SoilBandReading extends DeviceReadingBase {
  /** Soil moisture 0.0 (bone dry) – 1.0 (saturated) */
  moisture: number | null;
  /** Soil temperature in °C */
  tempC: number | null;
  /** Whether the soil needs watering (moisture < 0.3) */
  needsWater: boolean;
}

// ─── LightBand ────────────────────────────────────────────
// A shade/light corridor sensor that maps light gradients
// across the yard or trail — not just at the phone's position.

export interface LightBandReading extends DeviceReadingBase {
  /** Ambient lux at the sensor position */
  lux: number | null;
  /** Shade index 0.0 (full sun) – 1.0 (deep shade) */
  shadeIndex: number | null;
  /** Whether the sensor is in a stable shade corridor */
  isShadeStable: boolean;
}

// ─── Field Tags ───────────────────────────────────────────
// Tiny Bluetooth markers placed at yard, gate, mailbox, trailhead.
// Refine proximity classification beyond GPS radius.

export type FieldTagRole = 'yard' | 'gate' | 'mailbox' | 'trailhead';

export interface FieldTag {
  /** Tag identifier */
  tagId: string;
  /** Human-readable label */
  label: string;
  /** What this tag marks */
  role: FieldTagRole;
  /** GPS coordinates where the tag is placed */
  lat: number;
  lng: number;
  /** Whether the tag is currently in BLE range */
  inRange: boolean;
  /** Estimated distance in meters (BLE RSSI-based), null if out of range */
  distanceMeters: number | null;
}

// ─── Combined Suit State ──────────────────────────────────

export interface SuitState {
  quietBand: QuietBandReading | null;
  soilBand: SoilBandReading | null;
  lightBand: LightBandReading | null;
  fieldTags: FieldTag[];
  /** How many devices are online (non-offline, non-mock) */
  onlineCount: number;
  /** Total devices configured */
  totalConfigured: number;
  /** Human-readable summary for UI */
  summary: string;
}

// ─── Mock / Offline Defaults ──────────────────────────────
// These are returned until real hardware is connected.
// Status is 'mock' so the UI can clearly distinguish prototype
// data from real readings.

export const MOCK_QUIETBAND: QuietBandReading = {
  deviceId: 'quietband-001',
  name: 'QuietBand',
  status: 'mock',
  battery: null,
  lastReadingAt: null,
  noiseDb: null,
  bodyMotion: 0,
  isQuietZone: false,
};

export const MOCK_SOILBAND: SoilBandReading = {
  deviceId: 'soilband-001',
  name: 'SoilBand',
  status: 'mock',
  battery: null,
  lastReadingAt: null,
  moisture: null,
  tempC: null,
  needsWater: false,
};

export const MOCK_LIGHTBAND: LightBandReading = {
  deviceId: 'lightband-001',
  name: 'LightBand',
  status: 'mock',
  battery: null,
  lastReadingAt: null,
  lux: null,
  shadeIndex: null,
  isShadeStable: false,
};

export const MOCK_FIELD_TAGS: FieldTag[] = [];
