import {
  UserProfile,
  MedicalProfile,
  TrustedContact,
  HelperProfile,
  IncidentReport,
  EmergencyServiceContact
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-ananya-01',
    name: 'Ananya Sharma',
    email: 'ananya.traveler@example.com',
    phone: '+91 98765 43210',
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: 'Solo Explorer'
  },
  {
    id: 'helper-ravi-02',
    name: 'Ravi Kumar',
    email: 'ravi.helper@example.com',
    phone: '+91 98480 22334',
    role: 'HELPER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    trustScore: 4.8,
    badge: 'Verified First Responder'
  },
  {
    id: 'helper-priya-03',
    name: 'Priya Patel',
    email: 'priya.relief@example.com',
    phone: '+91 94401 55667',
    role: 'HELPER',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    trustScore: 4.9,
    badge: 'Disaster Volunteer'
  }
];

export const INITIAL_MEDICAL_PROFILE: MedicalProfile = {
  id: 'med-ananya-01',
  userId: 'user-ananya-01',
  bloodGroup: 'O+',
  criticalAllergies: ['Penicillin', 'Peanuts'],
  criticalConditions: ['Mild Asthma'],
  emergencyMedications: ['Salbutamol Inhaler'],
  doctorContact: {
    name: 'Dr. Arvind Mehta',
    phone: '+91 98450 12345',
    clinic: 'Care Hospital Emergency Wing'
  },
  insuranceInfo: {
    provider: 'Star Health Premier Gold',
    policyNumber: 'SH-POL-2026-98124',
    validTill: '2027-12-31'
  },
  detailedMedicalNotes: 'Mild asthma triggers during sudden cold weather or heavy dust. Inhaler kept in front backpack pocket. History of mild penicillin reaction in 2021.',
  permissions: {
    allowBasicMedicalSharing: true, // Master setting
    shareBloodGroup: true,
    shareAllergies: true,
    shareConditions: false,
    shareEmergencyMeds: true,
    doctorContactAccess: 'trusted_only',
    insuranceAccess: 'private',
    medicalNotesAccess: 'private'
  },
  lastUpdated: '2026-09-08T18:30:00Z'
};

export const INITIAL_TRUSTED_CONTACTS: TrustedContact[] = [
  {
    id: 'tc-01',
    name: 'Sunita Sharma (Mother)',
    phone: '+91 98490 11223',
    relationship: 'Mother',
    notifyOnSos: true,
    receiveLocation: true,
    receiveMedicalSummary: true
  },
  {
    id: 'tc-02',
    name: 'Rohan Sharma (Brother)',
    phone: '+91 97001 44556',
    relationship: 'Sibling',
    notifyOnSos: true,
    receiveLocation: true,
    receiveMedicalSummary: false
  },
  {
    id: 'tc-03',
    name: 'Dr. Arvind Mehta (Physician)',
    phone: '+91 98450 12345',
    relationship: 'Doctor',
    notifyOnSos: false,
    receiveLocation: false,
    receiveMedicalSummary: true
  }
];

export const INITIAL_HELPERS: HelperProfile[] = [
  {
    id: 'helper-ravi-02',
    name: 'Ravi Kumar',
    phone: '+91 98480 22334',
    verificationStatus: 'Verified',
    distanceKm: 0.8,
    skills: ['First Aid Certified', 'CPR', 'Community Guide'],
    languages: ['Telugu', 'Hindi', 'English'],
    trustScore: 4.8,
    responseHistoryCount: 19,
    available: true,
    location: {
      lat: 17.4180,
      lng: 78.4485,
      address: 'Road No. 12, Banjara Hills (Near Post Office)'
    }
  },
  {
    id: 'helper-priya-03',
    name: 'Priya Patel',
    phone: '+91 94401 55667',
    verificationStatus: 'Verified',
    distanceKm: 1.2,
    skills: ['Disaster Relief', 'Trauma First Aid', 'Search & Rescue'],
    languages: ['Hindi', 'English', 'Gujarati'],
    trustScore: 4.9,
    responseHistoryCount: 34,
    available: true,
    location: {
      lat: 17.4245,
      lng: 78.4550,
      address: 'Near City Center Mall, Banjara Hills'
    }
  },
  {
    id: 'helper-kiran-04',
    name: 'Kiran Reddy',
    phone: '+91 99081 77889',
    verificationStatus: 'Verified',
    distanceKm: 1.9,
    skills: ['Paramedic Student', 'Emergency Transport'],
    languages: ['Telugu', 'English'],
    trustScore: 4.6,
    responseHistoryCount: 11,
    available: false,
    location: {
      lat: 17.4105,
      lng: 78.4390,
      address: 'Road No. 1, Banjara Hills'
    }
  },
  {
    id: 'helper-arjun-05',
    name: 'Arjun Rao',
    phone: '+91 91234 00987',
    verificationStatus: 'Pending',
    distanceKm: 2.3,
    skills: ['Campus Security Guard', 'First Aid'],
    languages: ['Telugu', 'Hindi'],
    trustScore: 3.0,
    responseHistoryCount: 0,
    available: true,
    location: {
      lat: 17.4300,
      lng: 78.4600,
      address: 'Panjagutta Junction'
    }
  }
];

export const INITIAL_INCIDENTS: IncidentReport[] = [
  {
    id: 'inc-01',
    type: 'Accident',
    title: 'Two-wheeler Collision on Underpass',
    description: 'Minor collision causing severe traffic bottleneck. Emergency ambulance requested.',
    severity: 'MEDIUM',
    location: {
      lat: 17.4215,
      lng: 78.4510,
      address: 'Banjara Hills Main Road, Flyover exit'
    },
    reportedBy: 'user-09',
    reportedByName: 'Sanjay M.',
    timestamp: '2026-09-10T09:45:00Z',
    verified: true
  },
  {
    id: 'inc-02',
    type: 'Flood',
    title: 'Waterlogging & Deep Potholes',
    description: 'Storm drain overflow after heavy morning rainfall. Low clearance vehicles stranded.',
    severity: 'HIGH',
    location: {
      lat: 17.4160,
      lng: 78.4440,
      address: 'Road No. 10 Valley Road'
    },
    reportedBy: 'user-14',
    reportedByName: 'Divya K.',
    timestamp: '2026-09-10T10:15:00Z',
    verified: true
  },
  {
    id: 'inc-03',
    type: 'Unsafe Road',
    title: 'Streetlight Failure along 400m Stretch',
    description: 'Completely unlit side road with isolated pedestrian footpaths. Avoid walking alone after sunset.',
    severity: 'MEDIUM',
    location: {
      lat: 17.4190,
      lng: 78.4420,
      address: 'Hill View Ridge Lane'
    },
    reportedBy: 'user-ananya-01',
    reportedByName: 'Ananya Sharma',
    timestamp: '2026-09-09T21:30:00Z',
    verified: true
  }
];

export const EMERGENCY_SERVICES: EmergencyServiceContact[] = [
  {
    name: 'National Emergency Number',
    number: '112',
    category: 'National',
    icon: 'ShieldAlert',
    description: 'Single unified emergency helpline across all states for police, medical, and fire.'
  },
  {
    name: 'Police Emergency',
    number: '100',
    category: 'Police',
    icon: 'Shield',
    description: 'Direct dispatch to nearest police patrol unit.'
  },
  {
    name: 'Ambulance & Emergency Medical',
    number: '108',
    category: 'Medical',
    icon: 'HeartPulse',
    description: 'State emergency medical response and trauma ambulance dispatch.'
  },
  {
    name: 'Fire Department & Rescue',
    number: '101',
    category: 'Fire',
    icon: 'Flame',
    description: 'Fire service, structural collapse, and hazardous leak rescue.'
  },
  {
    name: "Women's Safety Helpline",
    number: '1091',
    category: 'Women',
    icon: 'Users',
    description: '24x7 dedicated emergency helpline for women in distress or unsafe situations.'
  },
  {
    name: 'National Tourist Helpline',
    number: '1363',
    category: 'Tourist',
    icon: 'MapPin',
    description: 'Multi-lingual tourist support, safety guidance, and incident escalation.'
  }
];

export const SAMPLE_LOCATIONS = [
  { name: 'Hyderabad - Banjara Hills (Safe Core)', lat: 17.4156, lng: 78.4480, label: 'Urban Safe Hub • Score 88' },
  { name: 'Hyderabad - Jubilee Hills (Rd 36)', lat: 17.4325, lng: 78.4071, label: 'Residential Corridor • Score 84' },
  { name: 'Hyderabad - Gachibowli Tech Park', lat: 17.4401, lng: 78.3489, label: 'IT Corridor & Hub • Score 91' },
  { name: 'Hyderabad - Hitec City (Cyber Towers)', lat: 17.4504, lng: 78.3808, label: 'Dense Metro Corridor • Score 86' },
  { name: 'Hyderabad - Begumpet (Airport Road)', lat: 17.4447, lng: 78.4664, label: 'Transit & Police Desk • Score 82' },
  { name: 'Hyderabad - Charminar (Old City)', lat: 17.3616, lng: 78.4747, label: 'Heritage & Night Bazaar • Score 76' },
  { name: 'Hyderabad - Secunderabad Junction', lat: 17.4344, lng: 78.5013, label: 'Central Railway Terminal • Score 79' },
  { name: 'New Delhi - Connaught Place', lat: 28.6315, lng: 77.2167, label: 'Central Capital Circle • Score 85' },
  { name: 'Bengaluru - Koramangala Hub', lat: 12.9352, lng: 77.6245, label: 'Smart Tech Zone • Score 89' }
];
