import { useState, useEffect } from 'react';
import { loadFromStorage, saveToStorage } from './storage';

export type LanguageCode = 'en' | 'hi' | 'te' | 'es';

export interface Translations {
  appName: string;
  tagline: string;
  youAreSafe: string;
  sosActive: string;
  pressAndHold: string;
  sos: string;
  dashboard: string;
  safeRoute: string;
  medicalProfile: string;
  helpers: string;
  emergencyServices: string;
  history: string;
  trustedContacts: string;
  incidents: string;
  settings: string;
  offlineMode: string;
  batteryCritical: string;
  call112: string;
  smsDispatch: string;
  areaSafetyScore: string;
  highRisk: string;
  moderate: string;
  safe: string;
  helperResponded: string;
  endSos: string;
  areYouSafe: string;
  source: string;
  destination: string;
  calculateRoute: string;
  fastestRoute: string;
  saferRoute: string;
  recommended: string;
  pushSent: string;
  
  // Dashboard specific
  hello: string;
  currentZone: string;
  instantHelpBroadcast: string;
  emergencySosTrigger: string;
  sosSubtext: string;
  accidentalPrevention: string;
  aiRiskEngine: string;
  scoreSubtext: string;
  identifiedRiskFactors: string;
  liveIntelligence: string;
  liveIntelligenceSubtext: string;
  exploreSafeRoutes: string;
  selectEmergencyCategory: string;
  confirmToNotify: string;
  broadcastSosNow: string;
  cancelFalseAlarm: string;
  dispatchLocation: string;
  avoidsHazards: string;
  level2Privacy: string;
  verifiedNearby: string;
  safeTiers: string;

  // GPS & Live Tracking
  liveGpsActive: string;
  liveGpsSharingWith: string;
  accuracy: string;
  lastPing: string;
  startSafeWalk: string;
  stopSafeWalk: string;
  navigatingTo: string;
  distanceRemaining: string;
  eta: string;
  step: string;
  nextInstruction: string;
  arrivedSafely: string;
  safeShelterAhead: string;
  cctvMonitoredCorridor: string;
  
  // Emergency Types
  medicalEmergency: string;
  accident: string;
  unsafeSituation: string;
  fire: string;
  floodDisaster: string;
  other: string;
  
  // Medical Profile
  basicEmergencyInfo: string;
  protectedPrivateInfo: string;
  bloodGroup: string;
  allergies: string;
  chronicConditions: string;
  medications: string;
  physicianContact: string;
  insurancePolicy: string;
  clinicalNotes: string;
  saveMedicalConfig: string;
  masterMedicalToggle: string;
  masterMedicalSubtext: string;
  
  // Trusted Contacts
  addContact: string;
  editContact: string;
  saveContact: string;
  updateContact: string;
  cancel: string;
  fullName: string;
  phone: string;
  relationship: string;
  trustedCircle: string;
  trustedCircleSubtext: string;
  notifyOnSos: string;
  receiveLocation: string;
  receiveMedicalSummary: string;
  edit: string;
  delete: string;
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    appName: 'LOCURA 2.0',
    tagline: 'Community Emergency Safety Network',
    youAreSafe: 'YOU ARE SAFE',
    sosActive: 'SOS ACTIVE',
    pressAndHold: 'Press and hold for 2 seconds',
    sos: 'SOS',
    dashboard: 'Dashboard',
    safeRoute: 'Safe Route',
    medicalProfile: 'Medical Profile',
    helpers: 'Verified Helpers',
    emergencyServices: 'Emergency Helplines',
    history: 'SOS History',
    trustedContacts: 'Trusted Contacts',
    incidents: 'Incident Reports',
    settings: 'Settings',
    offlineMode: 'OFFLINE MODE',
    batteryCritical: 'Battery Critical (~5 Min to Shutdown)',
    call112: 'Call 112 / Police',
    smsDispatch: 'Offline SMS Dispatch',
    areaSafetyScore: 'Area Safety Score',
    highRisk: 'HIGH RISK',
    moderate: 'MODERATE',
    safe: 'SAFE',
    helperResponded: 'Verified Helper Responded',
    endSos: 'End / Resolve SOS',
    areYouSafe: 'Are you safe now?',
    source: 'Origin / Current Location',
    destination: 'Destination / Safe Shelter',
    calculateRoute: 'Analyze Safe Routes',
    fastestRoute: 'Fastest Route',
    saferRoute: 'LOCURA Safer Route',
    recommended: 'Recommended',
    pushSent: 'Emergency Push Notification Dispatched',

    hello: 'Hello',
    currentZone: 'Current Zone',
    instantHelpBroadcast: 'Instant Help Broadcast',
    emergencySosTrigger: 'Emergency SOS Trigger',
    sosSubtext: 'Press and hold for 2 seconds to alert trusted contacts and mobilize nearby verified responders.',
    accidentalPrevention: 'Accidental trigger prevention: requires 2-sec hold or confirmation',
    aiRiskEngine: 'AI & Rule-Based Risk Engine',
    scoreSubtext: 'Real-time calculation from incident density, lighting, and hazards',
    identifiedRiskFactors: 'Identified Risk Factors:',
    liveIntelligence: 'Live Area Intelligence & Facilities',
    liveIntelligenceSubtext: 'Showing verified volunteers, reported hazards, police stations, and 24/7 trauma centers',
    exploreSafeRoutes: 'Explore Safe Routes',
    selectEmergencyCategory: 'Select Emergency Category',
    confirmToNotify: 'Confirm to notify contacts & verified community helpers',
    broadcastSosNow: 'BROADCAST SOS NOW',
    cancelFalseAlarm: 'Cancel / False Alarm',
    dispatchLocation: 'Dispatch Location:',
    avoidsHazards: 'Avoids 2 hazard zones',
    level2Privacy: 'Level 2 helper privacy',
    verifiedNearby: 'verified nearby',
    safeTiers: '70–100 Safe • 40–69 Moderate • 0–39 High Risk',

    liveGpsActive: 'LIVE GPS BROADCAST ACTIVE',
    liveGpsSharingWith: 'Continuous streaming to',
    accuracy: 'Accuracy: ±4m (High Precision)',
    lastPing: 'Ping sent 2s ago',
    startSafeWalk: 'Start Live Safe Walk Tracking',
    stopSafeWalk: 'Stop Live Tracking',
    navigatingTo: 'Live Navigation to',
    distanceRemaining: 'Remaining Distance',
    eta: 'Estimated Arrival',
    step: 'Step',
    nextInstruction: 'Next Instruction',
    arrivedSafely: 'You have safely arrived at your destination!',
    safeShelterAhead: 'Well-lit commercial avenue with safe volunteer shelter ahead.',
    cctvMonitoredCorridor: 'CCTV monitored safe corridor. Continuous emergency patrol active.',

    medicalEmergency: 'Medical Emergency',
    accident: 'Accident',
    unsafeSituation: 'Unsafe Situation',
    fire: 'Fire',
    floodDisaster: 'Flood / Disaster',
    other: 'Other Incident',

    basicEmergencyInfo: 'Basic Emergency Information (Level 2 Shared with Helpers)',
    protectedPrivateInfo: 'Private Doctor & Insurance (Level 1 / 3 Protected)',
    bloodGroup: 'Blood Group',
    allergies: 'Critical Allergies',
    chronicConditions: 'Chronic Conditions',
    medications: 'Emergency Medications',
    physicianContact: 'Emergency Physician Contact',
    insurancePolicy: 'Health Insurance Policy',
    clinicalNotes: 'Personal Clinical Notes',
    saveMedicalConfig: 'Save Medical Privacy Configuration',
    masterMedicalToggle: 'Allow basic emergency medical summary to be shared with verified helpers during SOS',
    masterMedicalSubtext: 'If disabled, helpers see: "Medical information unavailable. Contact emergency services."',

    addContact: 'Add Trusted Contact',
    editContact: 'Edit Contact Details',
    saveContact: 'Save Contact',
    updateContact: 'Update Contact Details',
    cancel: 'Cancel',
    fullName: 'Full Name',
    phone: 'Phone Number',
    relationship: 'Relationship',
    trustedCircle: 'Trusted Emergency Circle',
    trustedCircleSubtext: 'Family and friends automatically notified with live coordinates on SOS activation',
    notifyOnSos: 'Notify on SOS',
    receiveLocation: 'Live Location',
    receiveMedicalSummary: 'Medical Summary',
    edit: 'Edit',
    delete: 'Delete'
  },
  hi: {
    appName: 'लोकुरा 2.0',
    tagline: 'सामुदायिक आपातकालीन सुरक्षा नेटवर्क',
    youAreSafe: 'आप सुरक्षित हैं',
    sosActive: 'आपातकालीन अलर्ट सक्रिय',
    pressAndHold: '2 सेकंड तक दबाकर रखें',
    sos: 'एसओएस (SOS)',
    dashboard: 'डैशबोर्ड',
    safeRoute: 'सुरक्षित मार्ग',
    medicalProfile: 'चिकित्सा प्रोफ़ाइल',
    helpers: 'सत्यापित मददगार',
    emergencyServices: 'आपातकालीन हेल्पलाइन',
    history: 'अलर्ट इतिहास',
    trustedContacts: 'विश्वसनीय संपर्क',
    incidents: 'घटना रिपोर्ट',
    settings: 'सेटिंग्स',
    offlineMode: 'ऑफलाइन मोड',
    batteryCritical: 'बैटरी गंभीर (~5 मिनट में शटडाउन)',
    call112: '112 / पुलिस को कॉल करें',
    smsDispatch: 'ऑफलाइन एसएमएस भेजें',
    areaSafetyScore: 'क्षेत्र सुरक्षा स्कोर',
    highRisk: 'उच्च जोखिम',
    moderate: 'मध्यम',
    safe: 'सुरक्षित',
    helperResponded: 'सत्यापित मददगार ने स्वीकार किया',
    endSos: 'अलर्ट समाप्त करें',
    areYouSafe: 'क्या आप अब सुरक्षित हैं?',
    source: 'प्रारंभिक स्थान / वर्तमान स्थान',
    destination: 'गंतव्य / सुरक्षित आश्रय',
    calculateRoute: 'सुरक्षित मार्ग खोजें',
    fastestRoute: 'सबसे तेज़ मार्ग',
    saferRoute: 'लोकुरा सुरक्षित मार्ग',
    recommended: 'अनुशंसित',
    pushSent: 'आपातकालीन पुश सूचना भेजी गई',

    hello: 'नमस्ते',
    currentZone: 'वर्तमान क्षेत्र',
    instantHelpBroadcast: 'तत्काल सहायता प्रसारण',
    emergencySosTrigger: 'आपातकालीन SOS ट्रिगर',
    sosSubtext: 'विश्वसनीय संपर्कों को सतर्क करने और नजदीकी मददगारों को जुटाने के लिए 2 सेकंड दबाकर रखें।',
    accidentalPrevention: 'गलती से ट्रिगर होने से बचाव: 2-सेकंड होल्ड या पुष्टि आवश्यक है',
    aiRiskEngine: 'एआई और नियम-आधारित जोखिम इंजन',
    scoreSubtext: 'घटना घनत्व, प्रकाश व्यवस्था और खतरों से वास्तविक समय की गणना',
    identifiedRiskFactors: 'पहचाने गए जोखिम कारक:',
    liveIntelligence: 'लाइव क्षेत्र सुरक्षा और सुविधाएं',
    liveIntelligenceSubtext: 'सत्यापित स्वयंसेवक, रिपोर्ट किए गए खतरे, पुलिस स्टेशन और 24/7 ट्रॉमा सेंटर प्रदर्शित',
    exploreSafeRoutes: 'सुरक्षित मार्ग देखें',
    selectEmergencyCategory: 'आपातकालीन श्रेणी चुनें',
    confirmToNotify: 'संपर्कों और सत्यापित स्वयंसेवकों को सूचित करने के लिए पुष्टि करें',
    broadcastSosNow: 'अभी SOS प्रसारित करें',
    cancelFalseAlarm: 'रद्द करें / झूठा अलार्म',
    dispatchLocation: 'स्थान भेजें:',
    avoidsHazards: '2 खतरे वाले क्षेत्रों से बचाए',
    level2Privacy: 'लेवल 2 मददगार गोपनीयता',
    verifiedNearby: 'आसपास सत्यापित',
    safeTiers: '70–100 सुरक्षित • 40–69 मध्यम • 0–39 उच्च जोखिम',

    liveGpsActive: 'लाइव जीपीएस प्रसारण सक्रिय',
    liveGpsSharingWith: 'लाइव लोकेशन साझा की जा रही है:',
    accuracy: 'सटीकता: ±4 मीटर (उच्च सटीकता)',
    lastPing: 'अंतिम पिंग 2 सेकंड पहले भेजा गया',
    startSafeWalk: 'लाइव सुरक्षित यात्रा ट्रैकिंग शुरू करें',
    stopSafeWalk: 'ट्रैकिंग रोकें',
    navigatingTo: 'की ओर लाइव नेविगेशन:',
    distanceRemaining: 'शेष दूरी',
    eta: 'अनुमानित समय',
    step: 'चरण',
    nextInstruction: 'अगला निर्देश',
    arrivedSafely: 'आप अपने गंतव्य पर सुरक्षित पहुंच गए हैं!',
    safeShelterAhead: 'आगे सुरक्षित स्वयंसेवक आश्रय के साथ अच्छी रोशनी वाला मुख्य मार्ग।',
    cctvMonitoredCorridor: 'सीसीटीवी निगरानी वाला सुरक्षित गलियारा। निरंतर गश्त सक्रिय।',

    medicalEmergency: 'चिकित्सा आपातकाल',
    accident: 'सड़क दुर्घटना',
    unsafeSituation: 'असुरक्षित परिस्थिति',
    fire: 'आग / अग्निकांड',
    floodDisaster: 'बाढ़ / प्राकृतिक आपदा',
    other: 'अन्य आपातकाल',

    basicEmergencyInfo: 'बुनियादी आपातकालीन चिकित्सा जानकारी (मददगारों के साथ साझा)',
    protectedPrivateInfo: 'निजी डॉक्टर और बीमा जानकारी (पूरी तरह सुरक्षित)',
    bloodGroup: 'रक्त समूह (Blood Group)',
    allergies: 'गंभीर एलर्जी',
    chronicConditions: 'दीर्घकालिक बीमारियाँ',
    medications: 'आपातकालीन दवाएं',
    physicianContact: 'आपातकालीन चिकित्सक संपर्क',
    insurancePolicy: 'स्वास्थ्य बीमा पॉलिसी',
    clinicalNotes: 'निजी चिकित्सा नोट्स',
    saveMedicalConfig: 'चिकित्सा गोपनीयता सेटिंग्स सहेजें',
    masterMedicalToggle: 'SOS के दौरान सत्यापित मददगारों के साथ बुनियादी आपातकालीन चिकित्सा सारांश साझा करें',
    masterMedicalSubtext: 'अक्षम होने पर, मददगार देखेंगे: "चिकित्सा जानकारी अनुपलब्ध। आपातकालीन सेवाओं से संपर्क करें।"',

    addContact: 'नया संपर्क जोड़ें',
    editContact: 'संपर्क विवरण संपादित करें',
    saveContact: 'सहेजें',
    updateContact: 'विवरण अपडेट करें',
    cancel: 'रद्द करें',
    fullName: 'पूरा नाम',
    phone: 'फ़ोन नंबर',
    relationship: 'संबंध',
    trustedCircle: 'विश्वसनीय आपातकालीन दायरा',
    trustedCircleSubtext: 'SOS चालू होते ही परिवार और दोस्तों को लाइव स्थान अपने आप भेजा जाता है',
    notifyOnSos: 'SOS सूचना',
    receiveLocation: 'लाइव लोकेशन',
    receiveMedicalSummary: 'चिकित्सा सारांश',
    edit: 'संपादित करें',
    delete: 'हटाएं'
  },
  te: {
    appName: 'లొకురా 2.0',
    tagline: 'కమ్యూనిటీ అత్యవసర రక్షణ నెట్‌వర్క్',
    youAreSafe: 'మీరు సురక్షితంగా ఉన్నారు',
    sosActive: 'అత్యవసర SOS యాక్టివ్',
    pressAndHold: '2 సెకన్లు నొక్కి పట్టుకోండి',
    sos: 'ఎస్.ఓ.ఎస్ (SOS)',
    dashboard: 'డాష్‌బోర్డ్',
    safeRoute: 'సురక్షిత మార్గం',
    medicalProfile: 'వైద్య ప్రొఫైల్',
    helpers: 'ధృవీకరించబడిన సహాయకులు',
    emergencyServices: 'అత్యవసర హెల్ప్‌లైన్లు',
    history: 'చరిత్ర',
    trustedContacts: 'నమ్మకమైన పరిచయాలు',
    incidents: 'సంఘటనల సమాచారం',
    settings: 'సెట్టింగ్‌లు',
    offlineMode: 'ఆఫ్‌లైన్ మోడ్',
    batteryCritical: 'బ్యాటరీ తక్కువ (~5 నిమిషాల్లో స్విచ్ ఆఫ్)',
    call112: '112 / పోలీసులకు కాల్ చేయండి',
    smsDispatch: 'ఆఫ్‌లైన్ ఎస్ఎంఎస్ పంపండి',
    areaSafetyScore: 'ప్రాంత రక్షణ స్కోరు',
    highRisk: 'అధిక ప్రమాదం',
    moderate: 'మధ్యస్థం',
    safe: 'సురక్షితం',
    helperResponded: 'సహాయకుడు స్పందించారు',
    endSos: 'SOS ముగించండి',
    areYouSafe: 'మీరు ఇప్పుడు సురక్షితంగా ఉన్నారా?',
    source: 'ప్రారంభ స్థానం',
    destination: 'గమ్యస్థానం / సురక్షిత ఆశ్రయం',
    calculateRoute: 'సురక్షిత మార్గాలను విశ్లేషించండి',
    fastestRoute: 'వేగవంతమైన మార్గం',
    saferRoute: 'సురక్షిత మార్గం',
    recommended: 'సిఫార్సు చేయబడింది',
    pushSent: 'పుష్ నోటిఫికేషన్ మరియు లొకేషన్ పంపబడింది',

    hello: 'నమస్కారం',
    currentZone: 'ప్రస్తుత ప్రాంతం',
    instantHelpBroadcast: 'తక్షణ సహాయ ప్రసారం',
    emergencySosTrigger: 'అత్యవసర SOS బటన్',
    sosSubtext: 'కుటుంబ సభ్యులను అప్రమత్తం చేయడానికి 2 సెకన్లు నొక్కి పట్టుకోండి.',
    accidentalPrevention: 'పొరపాటున నొక్కకుండా నివారణ: 2-సెకన్లు లేదా నిర్ధారణ అవసరం',
    aiRiskEngine: 'AI మరియు నిబంధనల ఆధారిత రిస్క్ ఇంజిన్',
    scoreSubtext: 'సంఘటనలు మరియు వెలుతురు ఆధారంగా నిజ సమయ లెక్కింపు',
    identifiedRiskFactors: 'గుర్తించబడిన ప్రమాద కారకాలు:',
    liveIntelligence: 'లైవ్ ప్రాంత సమాచారం మరియు సౌకర్యాలు',
    liveIntelligenceSubtext: 'ధృవీకరించబడిన సహాయకులు, ప్రమాదకర ప్రాంతాలు మరియు ఆసుపత్రులు',
    exploreSafeRoutes: 'సురక్షిత మార్గాలను చూడండి',
    selectEmergencyCategory: 'అత్యవసర వర్గాన్ని ఎంచుకోండి',
    confirmToNotify: 'సహాయకులకు తెలియజేయడానికి నిర్ధారించండి',
    broadcastSosNow: 'ఇప్పుడే SOS ప్రసారం చేయండి',
    cancelFalseAlarm: 'రద్దు చేయండి',
    dispatchLocation: 'పంపే స్థానం:',
    avoidsHazards: '2 ప్రమాద ప్రాంతాలను నివారిస్తుంది',
    level2Privacy: 'లెవల్ 2 వైద్య గోప్యత',
    verifiedNearby: 'సమీపంలో ధృవీకరించబడ్డారు',
    safeTiers: '70–100 సురక్షితం • 40–69 మధ్యస్థం • 0–39 ప్రమాదం',

    liveGpsActive: 'లైవ్ GPS ప్రసారం యాక్టివ్‌గా ఉంది',
    liveGpsSharingWith: 'వీరితో లైవ్ లొకేషన్ పంచుకోబడుతోంది:',
    accuracy: 'ఖచ్చితత్వం: ±4 మీటర్లు',
    lastPing: '2 సెకన్ల క్రితం పింగ్ పంపబడింది',
    startSafeWalk: 'లైవ్ సేఫ్ వాక్ ట్రాకింగ్ ప్రారంభించండి',
    stopSafeWalk: 'ట్రాకింగ్ ఆపండి',
    navigatingTo: 'లైవ్ నావిగేషన్ గమ్యం:',
    distanceRemaining: 'మిగిలిన దూరం',
    eta: 'చేరుకునే సమయం',
    step: 'దశ',
    nextInstruction: 'తదుపరి సూచన',
    arrivedSafely: 'మీరు సురక్షితంగా గమ్యాన్ని చేరుకున్నారు!',
    safeShelterAhead: 'మంచి వెలుతురు మరియు సురక్షిత ఆశ్రయం కలిగిన రహదారి.',
    cctvMonitoredCorridor: 'CCTV నిఘా కలిగిన సురక్షిత మార్గం. పోలీసు గస్తీ ఉంది.',

    medicalEmergency: 'వైద్య అత్యవసరం',
    accident: 'ప్రమాదం',
    unsafeSituation: 'అసురక్షిత పరిస్థితి',
    fire: 'అగ్ని ప్రమాదం',
    floodDisaster: 'వరదలు / విపత్తు',
    other: 'ఇతర సంఘటన',

    basicEmergencyInfo: 'ప్రాథమిక వైద్య సమాచారం (సహాయకులతో మాత్రమే)',
    protectedPrivateInfo: 'వ్యక్తిగత డాక్టర్ మరియు బీమా వివరాలు (పూర్తిగా సురక్షితం)',
    bloodGroup: 'రక్త వర్గం',
    allergies: 'అలెర్జీలు',
    chronicConditions: 'దీర్ఘకాలిక సమస్యలు',
    medications: 'అత్యవసర మందులు',
    physicianContact: 'డాక్టర్ సంప్రదింపు',
    insurancePolicy: 'బీమా వివరాలు',
    clinicalNotes: 'వైద్య గమనికలు',
    saveMedicalConfig: 'గోప్యతా సెట్టింగ్‌లను సేవ్ చేయండి',
    masterMedicalToggle: 'SOS సమయంలో సహాయకులతో ప్రాథమిక వైద్య సమాచారాన్ని పంచుకోవడానికి అనుమతించండి',
    masterMedicalSubtext: 'ఆపివేస్తే: "వైద్య సమాచారం అందుబాటులో లేదు. అధికారులను సంప్రదించండి."',

    addContact: 'పరిచయాన్ని జోడించండి',
    editContact: 'వివరాలను సవరించండి',
    saveContact: 'సేవ్ చేయండి',
    updateContact: 'వివరాలు అప్‌డేట్ చేయండి',
    cancel: 'రద్దు చేయండి',
    fullName: 'పూర్తి పేరు',
    phone: 'ఫోన్ నంబర్',
    relationship: 'సంబంధం',
    trustedCircle: 'నమ్మకమైన అత్యవసర పరిచయాలు',
    trustedCircleSubtext: 'SOS సమయంలో లైవ్ లొకేషన్‌తో తక్షణ నోటిఫికేషన్ వెళుతుంది',
    notifyOnSos: 'SOS నోటిఫికేషన్',
    receiveLocation: 'లైవ్ లొకేషన్',
    receiveMedicalSummary: 'వైద్య సారాంశం',
    edit: 'సవరించు',
    delete: 'తొలగించు'
  },
  es: {
    appName: 'LOCURA 2.0',
    tagline: 'Red Comunitaria de Seguridad y Emergencias',
    youAreSafe: 'ESTÁS A SALVO',
    sosActive: 'SOS ACTIVO',
    pressAndHold: 'Mantén presionado por 2 segundos',
    sos: 'SOS',
    dashboard: 'Panel Principal',
    safeRoute: 'Ruta Segura',
    medicalProfile: 'Perfil Médico',
    helpers: 'Voluntarios Verificados',
    emergencyServices: 'Líneas de Emergencia',
    history: 'Historial SOS',
    trustedContacts: 'Contactos de Confianza',
    incidents: 'Reportes de Incidentes',
    settings: 'Ajustes',
    offlineMode: 'MODO SIN CONEXIÓN',
    batteryCritical: 'Batería Crítica (~5 Min de Apagado)',
    call112: 'Llamar al 112 / Policía',
    smsDispatch: 'Envío de SMS sin Conexión',
    areaSafetyScore: 'Puntuación de Seguridad',
    highRisk: 'ALTO RIESGO',
    moderate: 'MODERADO',
    safe: 'SEGURO',
    helperResponded: 'Voluntario Verificado Respondió',
    endSos: 'Finalizar / Resolver SOS',
    areYouSafe: '¿Estás a salvo ahora?',
    source: 'Origen / Ubicación Actual',
    destination: 'Destino / Refugio Seguro',
    calculateRoute: 'Analizar Rutas Seguras',
    fastestRoute: 'Ruta Más Rápida',
    saferRoute: 'Ruta Segura LOCURA',
    recommended: 'Recomendada',
    pushSent: 'Notificación Push de Emergencia Enviada',

    hello: 'Hola',
    currentZone: 'Zona Actual',
    instantHelpBroadcast: 'Difusión Inmediata de Ayuda',
    emergencySosTrigger: 'Activador de Emergencia SOS',
    sosSubtext: 'Mantén presionado por 2 segundos para alertar a contactos y movilizar voluntarios.',
    accidentalPrevention: 'Prevención de falsas alarmas: requiere 2 segundos de pulsación o confirmación',
    aiRiskEngine: 'Motor de Riesgo Inteligente y Reglas',
    scoreSubtext: 'Cálculo en tiempo real por densidad de incidentes, luz y riesgos',
    identifiedRiskFactors: 'Factores de Riesgo Identificados:',
    liveIntelligence: 'Inteligencia de Zona en Vivo e Instalaciones',
    liveIntelligenceSubtext: 'Muestra voluntarios verificados, riesgos reportados, policía y centros de trauma 24/7',
    exploreSafeRoutes: 'Explorar Rutas Seguras',
    selectEmergencyCategory: 'Selecciona Categoría de Emergencia',
    confirmToNotify: 'Confirma para notificar contactos y voluntarios verificados',
    broadcastSosNow: 'TRANSMITIR SOS AHORA',
    cancelFalseAlarm: 'Cancelar / Falsa Alarma',
    dispatchLocation: 'Ubicación de Despacho:',
    avoidsHazards: 'Evita 2 zonas de peligro',
    level2Privacy: 'Privacidad médica nivel 2',
    verifiedNearby: 'verificados cerca',
    safeTiers: '70–100 Seguro • 40–69 Moderado • 0–39 Alto Riesgo',

    liveGpsActive: 'TRANSMISIÓN GPS EN VIVO ACTIVA',
    liveGpsSharingWith: 'Transmitiendo en tiempo real a',
    accuracy: 'Precisión: ±4m (Alta precisión)',
    lastPing: 'Ping enviado hace 2 segundos',
    startSafeWalk: 'Iniciar Seguimiento de Ruta Segura',
    stopSafeWalk: 'Detener Seguimiento',
    navigatingTo: 'Navegando hacia',
    distanceRemaining: 'Distancia Restante',
    eta: 'Tiempo Estimado',
    step: 'Paso',
    nextInstruction: 'Próxima Instrucción',
    arrivedSafely: '¡Has llegado a salvo a tu destino!',
    safeShelterAhead: 'Avenida comercial bien iluminada con refugio seguro adelante.',
    cctvMonitoredCorridor: 'Corredor seguro con monitoreo CCTV. Patrullaje continuo activo.',

    medicalEmergency: 'Emergencia Médica',
    accident: 'Accidente',
    unsafeSituation: 'Situación Insegura',
    fire: 'Incendio',
    floodDisaster: 'Inundación / Desastre',
    other: 'Otro Incidente',

    basicEmergencyInfo: 'Información Médica Básica (Compartida con Voluntarios)',
    protectedPrivateInfo: 'Médico y Seguro Privados (Protegido)',
    bloodGroup: 'Grupo Sanguíneo',
    allergies: 'Alergias Críticas',
    chronicConditions: 'Condiciones Crónicas',
    medications: 'Medicamentos de Emergencia',
    physicianContact: 'Contacto del Médico',
    insurancePolicy: 'Póliza de Seguro Médico',
    clinicalNotes: 'Notas Clínicas Privadas',
    saveMedicalConfig: 'Guardar Configuración de Privacidad',
    masterMedicalToggle: 'Permitir compartir resumen médico básico con voluntarios durante SOS',
    masterMedicalSubtext: 'Si se desactiva, los voluntarios verán: "Información médica no disponible."',

    addContact: 'Agregar Contacto',
    editContact: 'Editar Contacto',
    saveContact: 'Guardar Contacto',
    updateContact: 'Actualizar Contacto',
    cancel: 'Cancelar',
    fullName: 'Nombre Completo',
    phone: 'Número Telefónico',
    relationship: 'Parentesco / Relación',
    trustedCircle: 'Círculo de Confianza de Emergencia',
    trustedCircleSubtext: 'Familiares y amigos notificados con coordenadas en vivo al activar SOS',
    notifyOnSos: 'Avisar en SOS',
    receiveLocation: 'Ubicación en Vivo',
    receiveMedicalSummary: 'Resumen Médico',
    edit: 'Editar',
    delete: 'Eliminar'
  }
};

const LANG_KEY = 'locura_language';

type LangListener = (lang: LanguageCode) => void;
const listeners: Set<LangListener> = new Set();
let currentLang: LanguageCode = loadFromStorage<LanguageCode>(LANG_KEY, 'en');

export const setAppLanguage = (lang: LanguageCode) => {
  currentLang = lang;
  saveToStorage(LANG_KEY, lang);
  listeners.forEach((fn) => fn(lang));
};

export const getAppLanguage = (): LanguageCode => currentLang;

export const useTranslation = () => {
  const [lang, setLang] = useState<LanguageCode>(currentLang);

  useEffect(() => {
    const handler = (newLang: LanguageCode) => setLang(newLang);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    t: TRANSLATIONS[lang],
    currentLanguage: lang,
    setLanguage: setAppLanguage
  };
};

export const translateReason = (text: string, lang: LanguageCode): string => {
  if (lang === 'en') return text;

  if (lang === 'hi') {
    if (text.includes('Critical incident:')) return text.replace('Critical incident:', 'गंभीर आपातकाल:');
    if (text.includes('High severity:')) return text.replace('High severity:', 'उच्च जोखिम:');
    if (text.includes('active incident reports in this sector')) return `${text.split(' ')[0]} सक्रिय घटनाएं इस क्षेत्र में रिपोर्ट की गई हैं`;
    if (text.includes('Low ambient lighting & isolated pedestrian walkways after 9 PM')) return 'रात 9 बजे के बाद कम रोशनी और सुनसान रास्ते';
    if (text.includes('Active weather waterlogging / flash-flood warning')) return 'निचले इलाकों में जलभराव और अचानक बाढ़ की चेतावनी';
    if (text.includes('Monsoon Flash Flood')) return 'मेट्रो के पास मानसून बाढ़ की चेतावनी';
    if (text.includes('Low Street Lighting')) return 'सड़क पर कम रोशनी की समस्या दर्ज';
    return text;
  }

  if (lang === 'te') {
    if (text.includes('Critical incident:')) return text.replace('Critical incident:', 'తీవ్ర అత్యవసరం:');
    if (text.includes('High severity:')) return text.replace('High severity:', 'అధిక తీవ్రత:');
    if (text.includes('active incident reports in this sector')) return `${text.split(' ')[0]} సంఘటనలు ఈ ప్రాంతంలో నమోదయ్యాయి`;
    if (text.includes('Low ambient lighting & isolated pedestrian walkways after 9 PM')) return 'రాత్రి 9 గంటల తర్వాత తక్కువ వెలుతురు మరియు ఏకాంత మార్గాలు';
    if (text.includes('Active weather waterlogging / flash-flood warning')) return 'వరద నీరు నిలిచే ప్రమాదం మరియు వాతావరణ హెచ్చరిక';
    if (text.includes('Monsoon Flash Flood')) return 'మెట్రో సమీపంలో ఆకస్మిక వరద హెచ్చరిక';
    if (text.includes('Low Street Lighting')) return 'రహదారిపై తక్కువ వెలుతురు సమస్య ఉంది';
    return text;
  }

  if (lang === 'es') {
    if (text.includes('Critical incident:')) return text.replace('Critical incident:', 'Incidente crítico:');
    if (text.includes('High severity:')) return text.replace('High severity:', 'Alta gravedad:');
    if (text.includes('active incident reports in this sector')) return `${text.split(' ')[0]} reportes de incidentes activos en este sector`;
    if (text.includes('Low ambient lighting & isolated pedestrian walkways after 9 PM')) return 'Poca iluminación y pasajes peatonales aislados después de las 9 PM';
    if (text.includes('Active weather waterlogging / flash-flood warning')) return 'Aviso de inundación repentina o acumulación de agua';
    if (text.includes('Monsoon Flash Flood')) return 'Aviso de inundación monzónica';
    if (text.includes('Low Street Lighting')) return 'Poca iluminación pública reportada';
    return text;
  }

  return text;
};

