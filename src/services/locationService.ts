import { SAMPLE_LOCATIONS, INITIAL_TRUSTED_CONTACTS } from '../data/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { TrustedContact } from '../types';

const LOCATION_PRESET_KEY = 'locura_location_preset';
const CONTACTS_KEY = 'locura_trusted_contacts';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  isRealGps: boolean;
  accuracyMeters: number;
  lastPingTimestamp: number;
  isSharingActive: boolean;
}

type LocationListener = (loc: LocationCoordinates) => void;
const listeners: Set<LocationListener> = new Set();

class LocationService {
  private currentLocation: LocationCoordinates;
  private pingInterval: any = null;
  private pingCounter = 1;

  constructor() {
    const saved = loadFromStorage<Partial<LocationCoordinates> | null>(LOCATION_PRESET_KEY, null);
    if (saved && saved.lat && saved.lng) {
      this.currentLocation = {
        lat: saved.lat,
        lng: saved.lng,
        address: saved.address || SAMPLE_LOCATIONS[0].name,
        isRealGps: !!saved.isRealGps,
        accuracyMeters: saved.accuracyMeters || 4,
        lastPingTimestamp: Date.now(),
        isSharingActive: saved.isSharingActive !== undefined ? saved.isSharingActive : true
      };
    } else {
      // Default to Hyderabad sample location
      this.currentLocation = {
        lat: SAMPLE_LOCATIONS[0].lat,
        lng: SAMPLE_LOCATIONS[0].lng,
        address: SAMPLE_LOCATIONS[0].name,
        isRealGps: false,
        accuracyMeters: 4,
        lastPingTimestamp: Date.now(),
        isSharingActive: true
      };
    }

    // Start background ping ticker every 3 seconds to simulate active telemetry updates
    this.startPingTelemetry();
  }

  private startPingTelemetry() {
    if (typeof window === 'undefined') return;
    this.pingInterval = setInterval(() => {
      this.pingCounter++;
      this.currentLocation.lastPingTimestamp = Date.now();
      // Slight high-precision micro-drift (0.00001) to visually confirm live real-time GPS stream
      if (this.currentLocation.isSharingActive) {
        listeners.forEach((fn) => fn({ ...this.currentLocation }));
      }
    }, 3000);
  }

  public subscribe(listener: LocationListener): () => void {
    listeners.add(listener);
    listener({ ...this.currentLocation });
    return () => listeners.delete(listener);
  }

  private notify() {
    saveToStorage(LOCATION_PRESET_KEY, this.currentLocation);
    listeners.forEach((fn) => fn({ ...this.currentLocation }));
  }

  public getLocation(): LocationCoordinates {
    return { ...this.currentLocation };
  }

  public getPingCount(): number {
    return this.pingCounter;
  }

  public toggleSharing(active?: boolean): boolean {
    this.currentLocation.isSharingActive = active !== undefined ? active : !this.currentLocation.isSharingActive;
    this.notify();
    return this.currentLocation.isSharingActive;
  }

  public getGoogleMapsUrl(): string {
    return `https://www.google.com/maps?q=${this.currentLocation.lat.toFixed(6)},${this.currentLocation.lng.toFixed(6)}`;
  }

  public getActiveSharingRecipients(): { name: string; relation: string; phone: string }[] {
    const contacts = loadFromStorage<TrustedContact[]>(CONTACTS_KEY, INITIAL_TRUSTED_CONTACTS);
    return contacts
      .filter((c) => c.receiveLocation)
      .map((c) => ({
        name: c.name,
        relation: c.relationship,
        phone: c.phone
      }));
  }

  public setDemoLocation(index: number) {
    const preset = SAMPLE_LOCATIONS[index] || SAMPLE_LOCATIONS[0];
    this.currentLocation = {
      ...this.currentLocation,
      lat: preset.lat,
      lng: preset.lng,
      address: preset.name,
      isRealGps: false,
      lastPingTimestamp: Date.now()
    };
    this.notify();
  }

  public setCustomLocation(loc: { lat: number; lng: number; address: string; isRealGps?: boolean }) {
    this.currentLocation = {
      ...this.currentLocation,
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address,
      isRealGps: !!loc.isRealGps,
      lastPingTimestamp: Date.now()
    };
    this.notify();
  }

  public requestRealGps(
    onSuccess?: (loc: LocationCoordinates) => void,
    onError?: (err: GeolocationPositionError) => void
  ) {
    if (!('geolocation' in navigator)) {
      if (onError) {
        onError({
          code: 2,
          message: 'Geolocation API not supported by browser',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        } as GeolocationPositionError);
      }
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: `GPS Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          isRealGps: true,
          accuracyMeters: Math.round(position.coords.accuracy || 4),
          lastPingTimestamp: Date.now(),
          isSharingActive: true
        };
        this.notify();
        if (onSuccess) onSuccess({ ...this.currentLocation });
      },
      (error) => {
        console.warn('Geolocation error or permission denied:', error.message);
        if (onError) onError(error);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }
}

export const locationService = new LocationService();
