declare module 'expo-location' {
  export enum Accuracy {
    Balanced = 3,
    High = 4,
    Lowest = 1,
    Low = 2,
    BestForNavigation = 5,
  }
  export type PermissionStatus = 'granted' | 'denied' | 'undetermined';
  export interface LocationObjectCoords {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  }
  export interface LocationObject {
    coords: LocationObjectCoords;
    timestamp: number;
  }
  export interface LocationOptions {
    accuracy?: Accuracy;
    timeInterval?: number;
    distanceInterval?: number;
  }
  export interface LocationSubscription {
    remove(): void;
  }
  export async function requestForegroundPermissionsAsync(): Promise<{
    status: PermissionStatus;
    expires?: 'never' | number;
    canAskAgain?: boolean;
  }>;
  export async function getCurrentPositionAsync(
    options?: { accuracy?: Accuracy }
  ): Promise<LocationObject>;
  export async function watchPositionAsync(
    options: LocationOptions,
    callback: (location: LocationObject) => void
  ): Promise<LocationSubscription>;
}
