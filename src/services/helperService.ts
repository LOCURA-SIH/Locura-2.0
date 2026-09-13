import { HelperProfile } from '../types';
import { INITIAL_HELPERS } from '../data/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const HELPERS_STORAGE_KEY = 'locura_helpers';

type HelperChangeListener = (helpers: HelperProfile[]) => void;
const listeners: Set<HelperChangeListener> = new Set();

class HelperService {
  private helpers: HelperProfile[] = [];

  constructor() {
    this.helpers = loadFromStorage<HelperProfile[]>(HELPERS_STORAGE_KEY, INITIAL_HELPERS);
  }

  public subscribe(listener: HelperChangeListener): () => void {
    listeners.add(listener);
    listener(this.helpers);
    return () => listeners.delete(listener);
  }

  private notify() {
    saveToStorage(HELPERS_STORAGE_KEY, this.helpers);
    listeners.forEach((fn) => fn([...this.helpers]));
  }

  public getAllHelpers(): HelperProfile[] {
    return [...this.helpers];
  }

  public getVerifiedHelpers(): HelperProfile[] {
    return this.helpers.filter((h) => h.verificationStatus === 'Verified');
  }

  public getHelperById(id: string): HelperProfile | undefined {
    return this.helpers.find((h) => h.id === id);
  }

  public updateVerificationStatus(helperId: string, status: 'Verified' | 'Pending' | 'Suspended') {
    const helper = this.helpers.find((h) => h.id === helperId);
    if (helper) {
      helper.verificationStatus = status;
      this.notify();
    }
  }

  public toggleAvailability(helperId: string): boolean {
    const helper = this.helpers.find((h) => h.id === helperId);
    if (helper) {
      helper.available = !helper.available;
      this.notify();
      return helper.available;
    }
    return false;
  }

  /**
   * Trust Score Modification
   * Range 0.0 - 5.0
   * +0.1 successful assistance
   * +0.1 verified response
   * +0.1 positive user feedback
   * -0.2 false response
   * -0.3 reported misconduct
   */
  public modifyTrustScore(helperId: string, delta: number) {
    const helper = this.helpers.find((h) => h.id === helperId);
    if (helper) {
      const updated = Math.min(5.0, Math.max(0.0, helper.trustScore + delta));
      helper.trustScore = Math.round(updated * 10) / 10;
      if (delta > 0) {
        helper.responseHistoryCount += 1;
      }
      this.notify();
    }
  }

  public addHelper(newHelper: Omit<HelperProfile, 'id'>): HelperProfile {
    const helper: HelperProfile = {
      ...newHelper,
      id: `helper-${Date.now()}`
    };
    this.helpers.push(helper);
    this.notify();
    return helper;
  }
}

export const helperService = new HelperService();
