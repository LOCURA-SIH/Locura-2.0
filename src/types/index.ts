export type UserRole = 'USER' | 'HELPER';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  trustScore?: number;
  badge?: string;
}

export interface MedicalVisibilitySettings {
  allowBasicMedicalSharing: boolean; // Master switch for verified helpers
  shareBloodGroup: boolean;
  shareAllergies: boolean;
  shareConditions: boolean;
  shareEmergencyMeds: boolean;
  doctorContactAccess: 'trusted_only' | 'responder_only' | 'private';
  insuranceAccess: 'trusted_only' | 'responder_only' | 'private';
  medicalNotesAccess: 'trusted_only' | 'responder_only' | 'private';
}

export interface MedicalProfile {
  id: string;
  userId: string;
  bloodGroup: string;
  criticalAllergies: string[];
  criticalConditions: string[];
  emergencyMedications: string[];
  doctorContact: {
    name: string;
    phone: string;
    clinic: string;
  };
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    validTill: string;
  };
  detailedMedicalNotes: string;
  permissions: MedicalVisibilitySettings;
  lastUpdated: string;
}

/**
 * Level 2 - Minimal Emergency Medical Summary for Verified Helpers.
 * Enforces: "Share the minimum medical information necessary to help during an emergency."
 * Never exposes insurance, doctor contact, full meds, full history.
 */
export interface EmergencyMedicalSummary {
  medicalEmergency: boolean;
  bloodGroup?: string;
  criticalAllergies?: string[];
  hasCriticalConditions?: boolean;
  importantMedicationAlert?: boolean;
  notice: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: 'Mother' | 'Father' | 'Sibling' | 'Friend' | 'Partner' | 'Doctor' | 'Other';
  notifyOnSos: boolean;
  receiveLocation: boolean;
  receiveMedicalSummary: boolean;
}

export interface HelperProfile {
  id: string;
  name: string;
  phone: string;
  verificationStatus: 'Pending' | 'Verified' | 'Suspended';
  distanceKm: number;
  skills: string[];
  languages: string[];
  trustScore: number; // 0.0 to 5.0
  responseHistoryCount: number;
  available: boolean;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export type EmergencyType =
  | 'Medical Emergency'
  | 'Accident'
  | 'Unsafe Situation'
  | 'Fire'
  | 'Flood/Disaster'
  | 'Other';

export interface SosAlert {
  id: string;
  userId: string;
  userName: string;
  emergencyType: EmergencyType;
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  createdAt: string;
  resolvedAt?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  trustedContactsNotified: {
    name: string;
    phone: string;
    status: 'Sent' | 'Delivered';
  }[];
  helpersNotifiedCount: number;
  acceptedHelpers: {
    helperId: string;
    helperName: string;
    phone: string;
    skills: string[];
    distanceKm: number;
    acceptedAt: string;
    etaMinutes: number;
  }[];
  basicMedicalSummary?: EmergencyMedicalSummary | null;
  resolutionNotes?: string;
  helperRating?: number;
  helperFeedback?: string;
  pushNotificationsDispatched?: boolean;
  pushNotificationDetails?: {
    recipient: string;
    phone: string;
    message: string;
    deliveredAt: string;
  }[];
}

export type IncidentCategory =
  | 'Accident'
  | 'Flood'
  | 'Fire'
  | 'Unsafe Road'
  | 'Harassment'
  | 'Suspicious Activity'
  | 'Medical Emergency'
  | 'Other Hazard';

export interface IncidentReport {
  id: string;
  type: IncidentCategory;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  photoUrl?: string;
  reportedBy: string;
  reportedByName: string;
  timestamp: string;
  verified: boolean;
}

export interface SafetyScoreData {
  score: number; // 0 - 100
  riskLevel: 'SAFE' | 'MODERATE' | 'HIGH RISK';
  color: string;
  reasons: string[];
  nearbyIncidentsCount: number;
  lightingCondition: string;
  timeContext: string;
  weatherAdvisory?: string;
}

export interface SafeRouteOption {
  id: 'fastest' | 'safer';
  name: string;
  durationMinutes: number;
  distanceKm: number;
  riskLevel: 'HIGH' | 'LOW' | 'MODERATE';
  path: [number, number][];
  incidentZonesAvoided: number;
  recommendation: string;
  isRecommended: boolean;
  lightingQuality: 'Well Lit' | 'Poorly Lit' | 'Normal';
  patrolledArea: boolean;
}

export interface MedicalAccessToken {
  token: string;
  sosId: string;
  userId: string;
  patientName: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  usedBy?: string;
  accessLevel: 'LEVEL_1_TRUSTED' | 'LEVEL_2_HELPER' | 'LEVEL_3_RESPONDER';
  auditLogs: {
    accessedAt: string;
    ipOrDeviceId: string;
    role: string;
  }[];
}

export interface EmergencyServiceContact {
  name: string;
  number: string;
  category: 'National' | 'Police' | 'Medical' | 'Fire' | 'Women' | 'Tourist';
  icon: string;
  description: string;
}
