import {
  MedicalProfile,
  EmergencyMedicalSummary,
  MedicalAccessToken
} from '../types';
import { INITIAL_MEDICAL_PROFILE } from '../data/mockData';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const MEDICAL_STORAGE_KEY = 'locura_medical_profile';
const TOKENS_STORAGE_KEY = 'locura_medical_tokens';

class MedicalService {
  private profile: MedicalProfile;
  private tokens: MedicalAccessToken[] = [];

  constructor() {
    this.profile = loadFromStorage<MedicalProfile>(MEDICAL_STORAGE_KEY, INITIAL_MEDICAL_PROFILE);
    this.tokens = loadFromStorage<MedicalAccessToken[]>(TOKENS_STORAGE_KEY, []);
  }

  public getProfile(): MedicalProfile {
    return this.profile;
  }

  public updateProfile(updated: Partial<MedicalProfile>): MedicalProfile {
    this.profile = {
      ...this.profile,
      ...updated,
      lastUpdated: new Date().toISOString()
    };
    saveToStorage(MEDICAL_STORAGE_KEY, this.profile);
    return this.profile;
  }

  /**
   * LEVEL 2 - PROJECTION FOR NEARBY VERIFIED HELPERS
   * STRICT PRIVACY FILTER:
   * Only returns the basic emergency medical summary if the user explicitly enabled it.
   * NEVER returns doctor contact, insurance, full med list, or detailed history.
   */
  public getEmergencySummaryForHelpers(isEmergency = true): EmergencyMedicalSummary {
    const { permissions } = this.profile;

    // If user disabled sharing basic medical info with helpers:
    if (!permissions.allowBasicMedicalSharing) {
      return {
        medicalEmergency: isEmergency,
        notice: 'Medical information unavailable. Contact emergency services.'
      };
    }

    const summary: EmergencyMedicalSummary = {
      medicalEmergency: isEmergency,
      notice: 'Only minimum emergency medical information necessary for rescue is shown. Full records are encrypted and protected.'
    };

    if (permissions.shareBloodGroup && this.profile.bloodGroup) {
      summary.bloodGroup = this.profile.bloodGroup;
    }

    if (permissions.shareAllergies && this.profile.criticalAllergies.length > 0) {
      summary.criticalAllergies = this.profile.criticalAllergies;
    }

    if (permissions.shareConditions && this.profile.criticalConditions.length > 0) {
      summary.hasCriticalConditions = true;
    }

    if (permissions.shareEmergencyMeds && this.profile.emergencyMedications.length > 0) {
      summary.importantMedicationAlert = true;
    }

    return summary;
  }

  /**
   * LEVEL 1 - PROJECTION FOR TRUSTED CONTACTS
   * Trusted contacts can receive basic summary if permitted, but still never insurance unless authorized.
   */
  public getEmergencySummaryForTrustedContacts(): {
    bloodGroup?: string;
    criticalAllergies?: string[];
    doctorContact?: { name: string; phone: string; clinic: string };
  } {
    const { permissions } = this.profile;
    const info: {
      bloodGroup?: string;
      criticalAllergies?: string[];
      doctorContact?: { name: string; phone: string; clinic: string };
    } = {};

    if (permissions.shareBloodGroup) {
      info.bloodGroup = this.profile.bloodGroup;
    }
    if (permissions.shareAllergies) {
      info.criticalAllergies = this.profile.criticalAllergies;
    }
    if (permissions.doctorContactAccess === 'trusted_only') {
      info.doctorContact = this.profile.doctorContact;
    }

    return info;
  }

  /**
   * LEVEL 3 - AUTHORIZED EMERGENCY RESPONDER TOKEN GENERATION
   * Generates a temporary, random, time-limited emergency access token.
   */
  public generateAccessToken(sosId: string, patientName: string): MedicalAccessToken {
    const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase() +
      Math.random().toString(36).substring(2, 6).toUpperCase();
    const tokenStr = `LOCURA-MED-${randomHex}`;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours validity

    const tokenObj: MedicalAccessToken = {
      token: tokenStr,
      sosId,
      userId: this.profile.userId,
      patientName,
      createdAt: now.toISOString(),
      expiresAt,
      used: false,
      accessLevel: 'LEVEL_3_RESPONDER',
      auditLogs: []
    };

    this.tokens.push(tokenObj);
    saveToStorage(TOKENS_STORAGE_KEY, this.tokens);
    return tokenObj;
  }

  /**
   * LEVEL 3 - VERIFY TOKEN & RECORD AUDIT LOG
   */
  public verifyAndAccessMedicalRecord(token: string, accessorRole: string): {
    valid: boolean;
    reason?: string;
    tokenData?: MedicalAccessToken;
    fullMedicalRecord?: Partial<MedicalProfile>;
  } {
    const found = this.tokens.find((t) => t.token.trim().toUpperCase() === token.trim().toUpperCase());

    if (!found) {
      return { valid: false, reason: 'Invalid emergency token. Please check and try again.' };
    }

    const now = new Date().getTime();
    const expires = new Date(found.expiresAt).getTime();

    if (now > expires) {
      return { valid: false, reason: 'Emergency access token has expired (2-hour window elapsed).' };
    }

    // Record audit log
    found.used = true;
    found.usedBy = accessorRole;
    found.auditLogs.push({
      accessedAt: new Date().toISOString(),
      ipOrDeviceId: `CLIENT-${Math.floor(1000 + Math.random() * 9000)}`,
      role: accessorRole
    });
    saveToStorage(TOKENS_STORAGE_KEY, this.tokens);

    return {
      valid: true,
      tokenData: found,
      fullMedicalRecord: {
        bloodGroup: this.profile.bloodGroup,
        criticalAllergies: this.profile.criticalAllergies,
        criticalConditions: this.profile.criticalConditions,
        emergencyMedications: this.profile.emergencyMedications,
        doctorContact: this.profile.doctorContact,
        detailedMedicalNotes: this.profile.detailedMedicalNotes
      }
    };
  }

  public getTokens(): MedicalAccessToken[] {
    return this.tokens;
  }
}

export const medicalService = new MedicalService();
