import { IncidentReport } from '../types';
import { INITIAL_INCIDENTS } from '../data/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const INCIDENTS_STORAGE_KEY = 'locura_incidents';
const PENDING_SYNC_KEY = 'locura_pending_incidents_sync';

type IncidentListener = (incidents: IncidentReport[]) => void;
const listeners: Set<IncidentListener> = new Set();

class IncidentService {
  private incidents: IncidentReport[] = [];
  private pendingOfflineReports: Omit<IncidentReport, 'id' | 'timestamp' | 'verified'>[] = [];

  constructor() {
    this.incidents = loadFromStorage<IncidentReport[]>(INCIDENTS_STORAGE_KEY, INITIAL_INCIDENTS);
    this.pendingOfflineReports = loadFromStorage(PENDING_SYNC_KEY, []);

    // Listen to online events to sync pending reports
    window.addEventListener('online', () => {
      this.syncPendingReports();
    });
  }

  public subscribe(listener: IncidentListener): () => void {
    listeners.add(listener);
    listener(this.incidents);
    return () => listeners.delete(listener);
  }

  private notify() {
    saveToStorage(INCIDENTS_STORAGE_KEY, this.incidents);
    listeners.forEach((fn) => fn([...this.incidents]));
  }

  public getAllIncidents(): IncidentReport[] {
    return [...this.incidents];
  }

  public getPendingOfflineCount(): number {
    return this.pendingOfflineReports.length;
  }

  public reportIncident(
    report: Omit<IncidentReport, 'id' | 'timestamp' | 'verified'>
  ): { incident: IncidentReport; queuedOffline: boolean } {
    const isOnline = navigator.onLine;

    if (!isOnline) {
      this.pendingOfflineReports.push(report);
      saveToStorage(PENDING_SYNC_KEY, this.pendingOfflineReports);
    }

    const newIncident: IncidentReport = {
      ...report,
      id: `inc-${Date.now()}`,
      timestamp: new Date().toISOString(),
      verified: false
    };

    this.incidents.unshift(newIncident);
    this.notify();
    return { incident: newIncident, queuedOffline: !isOnline };
  }

  public syncPendingReports() {
    if (this.pendingOfflineReports.length === 0) return;
    console.log(`Syncing ${this.pendingOfflineReports.length} offline incident reports to server...`);
    this.pendingOfflineReports = [];
    saveToStorage(PENDING_SYNC_KEY, []);
  }

  public verifyIncident(id: string, verified: boolean) {
    const item = this.incidents.find((i) => i.id === id);
    if (item) {
      item.verified = verified;
      this.notify();
    }
  }

  public deleteIncident(id: string) {
    this.incidents = this.incidents.filter((i) => i.id !== id);
    this.notify();
  }
}

export const incidentService = new IncidentService();
