import { SosAlert, EmergencyType } from '../types';
import { authService } from './authService';
import { medicalService } from './medicalService';
import { helperService } from './helperService';
import { INITIAL_TRUSTED_CONTACTS } from '../data/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const ACTIVE_SOS_KEY = 'locura_active_sos';
const SOS_HISTORY_KEY = 'locura_sos_history';
const TRUSTED_CONTACTS_KEY = 'locura_trusted_contacts';

type SosListener = (alert: SosAlert | null) => void;
const listeners: Set<SosListener> = new Set();

class SosService {
  private activeSos: SosAlert | null = null;
  private history: SosAlert[] = [];

  constructor() {
    this.activeSos = loadFromStorage<SosAlert | null>(ACTIVE_SOS_KEY, null);
    this.history = loadFromStorage<SosAlert[]>(SOS_HISTORY_KEY, [
      {
        id: 'sos-hist-01',
        userId: 'user-ananya-01',
        userName: 'Ananya Sharma',
        emergencyType: 'Medical Emergency',
        status: 'RESOLVED',
        createdAt: '2026-08-28T14:20:00Z',
        resolvedAt: '2026-08-28T14:42:00Z',
        location: {
          lat: 17.4156,
          lng: 78.4480,
          address: 'Banjara Hills, Hyderabad'
        },
        trustedContactsNotified: [
          { name: 'Sunita Sharma', phone: '+91 98490 11223', status: 'Delivered' }
        ],
        helpersNotifiedCount: 3,
        acceptedHelpers: [
          {
            helperId: 'helper-ravi-02',
            helperName: 'Ravi Kumar',
            phone: '+91 98480 22334',
            skills: ['First Aid Certified', 'CPR'],
            distanceKm: 0.8,
            acceptedAt: '2026-08-28T14:22:00Z',
            etaMinutes: 4
          }
        ],
        resolutionNotes: 'Assisted with asthma inhaler retrieval from bag. Safe and stable.',
        helperRating: 5,
        helperFeedback: 'Ravi arrived within 5 minutes and calmly provided first aid support.'
      }
    ]);
  }

  public subscribe(listener: SosListener): () => void {
    listeners.add(listener);
    listener(this.activeSos);
    return () => listeners.delete(listener);
  }

  private notify() {
    saveToStorage(ACTIVE_SOS_KEY, this.activeSos);
    saveToStorage(SOS_HISTORY_KEY, this.history);
    listeners.forEach((fn) => fn(this.activeSos));
  }

  public getActiveSos(): SosAlert | null {
    return this.activeSos;
  }

  public getHistory(): SosAlert[] {
    return [...this.history];
  }

  /**
   * TRIGGER SOS
   * Follows strict flow:
   * 1. Capture location
   * 2. Notify trusted contacts
   * 3. Find nearby VERIFIED helpers (Never show unverified strangers)
   * 4. Attach ONLY permitted basic medical summary
   */
  public triggerSos(
    emergencyType: EmergencyType,
    location: { lat: number; lng: number; address: string }
  ): SosAlert {
    const user = authService.getCurrentUser();
    const userName = user ? user.name : 'Solo Traveler';
    const userId = user ? user.id : 'user-anon';

    // 1. Minimum permitted medical summary
    const basicMedicalSummary = medicalService.getEmergencySummaryForHelpers(true);

    // 2. Trusted contacts lookup
    const contacts = loadFromStorage(TRUSTED_CONTACTS_KEY, INITIAL_TRUSTED_CONTACTS);
    const notifiedContacts = contacts
      .filter((c) => c.notifyOnSos)
      .map((c) => ({
        name: c.name,
        phone: c.phone,
        status: 'Delivered' as const
      }));

    // 3. Eligible verified helpers & Auto-Respond First Verified Helper (Ravi Kumar)
    const verifiedHelpers = helperService.getVerifiedHelpers().filter((h) => h.available);
    const respondingHelper = verifiedHelpers[0] || {
      id: 'helper-ravi-02',
      name: 'Ravi Kumar',
      phone: '+91 98480 22334',
      skills: ['First Aid Certified', 'CPR', 'Community Guide'],
      distanceKm: 0.8
    };

    const pushDetails = notifiedContacts.map((c) => ({
      recipient: c.name,
      phone: c.phone,
      message: `🚨 LOCURA ALERT: ${userName} triggered ${emergencyType} at ${location.address}. Live tracking: https://maps.google.com/?q=${location.lat.toFixed(4)},${location.lng.toFixed(4)}`,
      deliveredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const newSos: SosAlert = {
      id: `sos-${Date.now()}`,
      userId,
      userName,
      emergencyType,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      location,
      trustedContactsNotified: notifiedContacts,
      helpersNotifiedCount: Math.max(1, verifiedHelpers.length),
      acceptedHelpers: [
        {
          helperId: respondingHelper.id,
          helperName: respondingHelper.name,
          phone: respondingHelper.phone,
          skills: respondingHelper.skills,
          distanceKm: respondingHelper.distanceKm,
          acceptedAt: new Date().toISOString(),
          etaMinutes: 3
        }
      ],
      basicMedicalSummary,
      pushNotificationsDispatched: true,
      pushNotificationDetails: pushDetails
    };

    this.activeSos = newSos;
    this.notify();
    return newSos;
  }

  /**
   * HELPER ACCEPTS SOS
   */
  public acceptSos(sosId: string, helperId: string): boolean {
    if (!this.activeSos || this.activeSos.id !== sosId) return false;

    const helper = helperService.getHelperById(helperId);
    if (!helper || helper.verificationStatus !== 'Verified') {
      console.warn('Unauthorized or unverified helper attempted to accept SOS');
      return false;
    }

    const alreadyAccepted = this.activeSos.acceptedHelpers.some((h) => h.helperId === helperId);
    if (!alreadyAccepted) {
      this.activeSos.acceptedHelpers.push({
        helperId: helper.id,
        helperName: helper.name,
        phone: helper.phone,
        skills: helper.skills,
        distanceKm: helper.distanceKm,
        acceptedAt: new Date().toISOString(),
        etaMinutes: Math.max(2, Math.round(helper.distanceKm * 4))
      });

      // Trust score reward for verified response
      helperService.modifyTrustScore(helperId, 0.1);
      this.notify();
    }
    return true;
  }

  /**
   * END SOS & AFTER-EMERGENCY COORDINATION
   */
  public endSos(
    sosId: string,
    resolutionNotes?: string,
    helperRating?: number,
    helperFeedback?: string
  ) {
    if (!this.activeSos || this.activeSos.id !== sosId) return;

    this.activeSos.status = 'RESOLVED';
    this.activeSos.resolvedAt = new Date().toISOString();
    this.activeSos.resolutionNotes = resolutionNotes || 'Emergency ended by user.';
    this.activeSos.helperRating = helperRating;
    this.activeSos.helperFeedback = helperFeedback;

    // Apply positive user feedback bonus to accepted helpers
    if (helperRating && helperRating >= 4) {
      this.activeSos.acceptedHelpers.forEach((h) => {
        helperService.modifyTrustScore(h.helperId, 0.1);
      });
    }

    this.history.unshift({ ...this.activeSos });
    this.activeSos = null;
    this.notify();
  }

  public cancelSos(sosId: string) {
    if (!this.activeSos || this.activeSos.id !== sosId) return;
    this.activeSos.status = 'CANCELLED';
    this.activeSos.resolvedAt = new Date().toISOString();
    this.history.unshift({ ...this.activeSos });
    this.activeSos = null;
    this.notify();
  }
}

export const sosService = new SosService();
