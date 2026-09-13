import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Navigation,
  HeartPulse,
  Users,
  MapPin,
  Phone,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  Clock,
  Edit3,
  X,
  Save,
  Radio,
  Wifi,
  WifiOff,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { authService } from '../services/authService';
import { sosService } from '../services/sosService';
import { riskService } from '../services/riskService';
import { locationService } from '../services/locationService';
import { helperService } from '../services/helperService';
import { incidentService } from '../services/incidentService';
import { SafetyMap } from '../components/SafetyMap';
import { EmergencyCallModal } from '../components/EmergencyCallModal';
import { SmsFallbackModal } from '../components/SmsFallbackModal';
import { LiveLocationBadge } from '../components/LiveLocationBadge';
import { UserProfile, SosAlert, SafetyScoreData, EmergencyType, TrustedContact } from '../types';
import { useTranslation, translateReason } from '../utils/i18n';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { INITIAL_TRUSTED_CONTACTS, SAMPLE_LOCATIONS } from '../data/mockData';

const CONTACTS_KEY = 'locura_trusted_contacts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation();
  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [activeSos, setActiveSos] = useState<SosAlert | null>(sosService.getActiveSos());
  const [safetyScore, setSafetyScore] = useState<SafetyScoreData>(riskService.calculateAreaSafetyScore());
  const [location, setLocation] = useState(locationService.getLocation());
  const [helpers, setHelpers] = useState(helperService.getVerifiedHelpers());
  const [incidents, setIncidents] = useState(incidentService.getAllIncidents());

  // Trusted Contacts State
  const [contacts, setContacts] = useState<TrustedContact[]>(
    loadFromStorage<TrustedContact[]>(CONTACTS_KEY, INITIAL_TRUSTED_CONTACTS)
  );

  // Edit Contact Modal State
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRelationship, setEditRelationship] = useState<TrustedContact['relationship']>('Mother');
  const [editNotifyOnSos, setEditNotifyOnSos] = useState(true);
  const [editReceiveLocation, setEditReceiveLocation] = useState(true);
  const [editReceiveMedicalSummary, setEditReceiveMedicalSummary] = useState(true);

  // SOS Press & Hold state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 100
  const holdIntervalRef = useRef<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<EmergencyType>('Medical Emergency');

  // Modals
  const [showCallModal, setShowCallModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);

  // Change Location State (Addresses Requirement 4)
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [customAddress, setCustomAddress] = useState('');

  // Online / Offline Dual-Mode State (Addresses Requirement 6)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Direct Helpline Calling Feedback State
  const [directCallNotice, setDirectCallNotice] = useState<string | null>(null);

  const handleDirectCall = (target: string, number: string) => {
    setDirectCallNotice(`✓ Direct call sent directly to ${target} (${number}) • Live GPS coordinates transmitted (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`);
    window.location.href = `tel:${number}`;
    setTimeout(() => setDirectCallNotice(null), 5000);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleToggle = (e: any) => {
      setIsOnline(!e.detail?.isOffline);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('locura-offline-toggle', handleToggle as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('locura-offline-toggle', handleToggle as EventListener);
    };
  }, []);

  const handleSelectPresetLocation = (preset: typeof SAMPLE_LOCATIONS[0]) => {
    locationService.setCustomLocation({
      lat: preset.lat,
      lng: preset.lng,
      address: preset.name,
      isRealGps: false
    });
    setShowLocationModal(false);
    setLocationToast(`Zone changed to: ${preset.name}`);
    setTimeout(() => setLocationToast(null), 3500);
  };

  const handleDetectRealGps = () => {
    setDetectingGps(true);
    locationService.requestRealGps(
      (loc) => {
        setDetectingGps(false);
        setShowLocationModal(false);
        setLocationToast(`Real GPS detected: ${loc.address}`);
        setTimeout(() => setLocationToast(null), 3500);
      },
      (err) => {
        setDetectingGps(false);
        alert(`GPS Detection: ${err.message || 'Permission denied'}`);
      }
    );
  };

  const handleApplyCustomCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || !customAddress.trim()) {
      alert('Please enter valid coordinates and an address name.');
      return;
    }
    locationService.setCustomLocation({
      lat,
      lng,
      address: customAddress.trim(),
      isRealGps: false
    });
    setShowLocationModal(false);
    setLocationToast(`Zone set to: ${customAddress.trim()}`);
    setTimeout(() => setLocationToast(null), 3500);
  };

  const handleToggleOfflineMode = () => {
    const nextOffline = isOnline; // if currently online, toggle to offline
    setIsOnline(!nextOffline);
    window.dispatchEvent(new CustomEvent('locura-offline-toggle', { detail: { isOffline: nextOffline } }));
  };

  useEffect(() => {
    const unsubAuth = authService.subscribe((u) => setUser(u));
    const unsubSos = sosService.subscribe((sos) => setActiveSos(sos));
    const unsubLoc = locationService.subscribe((loc) => {
      setLocation(loc);
      setSafetyScore(riskService.calculateAreaSafetyScore());
    });
    const unsubHelpers = helperService.subscribe((h) => {
      setHelpers(h.filter((item) => item.verificationStatus === 'Verified'));
    });
    const unsubIncidents = incidentService.subscribe((inc) => {
      setIncidents(inc);
      setSafetyScore(riskService.calculateAreaSafetyScore());
    });

    return () => {
      unsubAuth();
      unsubSos();
      unsubLoc();
      unsubHelpers();
      unsubIncidents();
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    };
  }, []);

  // Handle Press & Hold logic (2 seconds requirement)
  const startHold = () => {
    if (activeSos) {
      navigate('/sos');
      return;
    }
    setIsHolding(true);
    setHoldProgress(0);

    const startTime = Date.now();
    const duration = 2000; // 2 seconds

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(progress);

      if (elapsed >= duration) {
        clearInterval(holdIntervalRef.current);
        setIsHolding(false);
        setHoldProgress(0);
        setShowConfirmModal(true);
      }
    }, 40);
  };

  const endHold = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const handleConfirmSos = () => {
    setShowConfirmModal(false);
    sosService.triggerSos(selectedEmergencyType, {
      lat: location.lat,
      lng: location.lng,
      address: location.address
    });
    navigate('/sos');
  };

  const handleOpenEdit = (c: TrustedContact) => {
    setEditingContact(c);
    setEditName(c.name);
    setEditPhone(c.phone);
    setEditRelationship(c.relationship);
    setEditNotifyOnSos(c.notifyOnSos);
    setEditReceiveLocation(c.receiveLocation);
    setEditReceiveMedicalSummary(c.receiveMedicalSummary);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact || !editName || !editPhone) return;

    const updated = contacts.map((c) => {
      if (c.id === editingContact.id) {
        return {
          ...c,
          name: editName,
          phone: editPhone,
          relationship: editRelationship,
          notifyOnSos: editNotifyOnSos,
          receiveLocation: editReceiveLocation,
          receiveMedicalSummary: editReceiveMedicalSummary
        };
      }
      return c;
    });

    setContacts(updated);
    saveToStorage(CONTACTS_KEY, updated);
    setEditingContact(null);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Active SOS Top Alert Banner if Active */}
      {activeSos && (
        <div className="bg-[#C0392B] text-white p-4 rounded-3xl shadow-xl flex items-center justify-between gap-4 animate-sos-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-extrabold text-xl">
              🚨
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                {t.sosActive}
              </h2>
              <p className="text-xs text-rose-100">
                {activeSos.emergencyType} • {activeSos.acceptedHelpers.length} {t.helperResponded}
              </p>
            </div>
          </div>
          <Link
            to="/sos"
            className="px-4 py-2 bg-white text-[#C0392B] text-xs font-bold rounded-xl shadow hover:bg-rose-50 transition-colors uppercase tracking-wider"
          >
            Open Command Center →
          </Link>
        </div>
      )}

      {/* Toast Notification when Location or Setting changes */}
      {locationToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{locationToast}</span>
          </div>
          <button onClick={() => setLocationToast(null)} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Offline Notice Banner (Keeps offline status only on top so user knows when offline) */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2.5 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <WifiOff className="w-4 h-4 flex-shrink-0 animate-pulse text-amber-200" />
            <span className="text-xs font-bold">
              Offline Mode: Internet is disconnected. Core safety features, cached facilities, and direct offline SMS dispatch are active.
            </span>
          </div>
          <button
            onClick={handleToggleOfflineMode}
            className="px-3 py-1 bg-white text-amber-900 text-xs font-extrabold rounded-xl shadow-xs hover:bg-amber-50 transition-colors flex-shrink-0"
          >
            Switch to Online
          </button>
        </div>
      )}

      {/* Hero Welcome & Current Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl shadow-xs border border-slate-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.hello}, {user?.name || 'Traveler'}
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              {user?.badge || 'Solo Traveler'}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-semibold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-[#0B5563]" />
              {t.currentZone}: <strong className="text-[#1F497D]">{location.address}</strong>
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
            </span>
          </div>

          {/* Interactive Change Location Buttons (Addresses Requirement 4) */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setShowLocationModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F497D] hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Change Location / Switch Zone 📍</span>
            </button>
            <button
              onClick={handleDetectRealGps}
              disabled={detectingGps}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
            >
              <Radio className={`w-3.5 h-3.5 text-[#0B5563] ${detectingGps ? 'animate-spin' : ''}`} />
              <span>{detectingGps ? 'Detecting GPS...' : 'Detect Real GPS'}</span>
            </button>
          </div>
        </div>

        {/* Live Safety Badge */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3A7D5C] animate-pulse" />
            <div className="text-left">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Zone Safety Score
              </span>
              <span className="text-xs font-extrabold text-emerald-900">
                🟢 {safetyScore.score}/100 • {safetyScore.riskLevel} Risk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📡 Live GPS Tracking & Sharing Indicator Badge (Addresses User Feedback 1: GPS Live Tracking) */}
      <LiveLocationBadge variant="full" />

      {/* Main Grid: SOS Section & Area Safety Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Big Press-and-Hold SOS Button (Hero Action) */}
        <div className="lg:col-span-6 bg-gradient-to-b from-white to-rose-50/40 p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          
          <div className="mb-4">
            <span className="text-xs font-extrabold tracking-widest text-[#C0392B] uppercase bg-rose-100/80 px-3 py-1 rounded-full">
              {t.instantHelpBroadcast}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              {t.emergencySosTrigger}
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {t.sosSubtext}
            </p>
          </div>

          {/* Direct Call Feedback Banner */}
          {directCallNotice && (
            <div className="w-full mb-3 p-3 bg-emerald-700 text-white rounded-2xl shadow-md text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-left">
                <CheckCircle2 className="w-4 h-4 text-emerald-200 flex-shrink-0" />
                <span>{directCallNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setDirectCallNotice(null)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 🚨 Small Helpline Buttons Directly Above SOS */}
          <div className="w-full flex items-center justify-center gap-2 mb-2 max-w-md">
            <button
              type="button"
              onClick={() => handleDirectCall('Ambulance', '108')}
              className="flex-1 py-2 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
              title="Direct call to Ambulance (108)"
            >
              <span className="text-sm">🚑</span>
              <span>Ambulance 108</span>
            </button>
            <button
              type="button"
              onClick={() => handleDirectCall('Police', '112')}
              className="flex-1 py-2 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
              title="Direct call to Police (112)"
            >
              <span className="text-sm">🚓</span>
              <span>Police 112</span>
            </button>
            <button
              type="button"
              onClick={() => handleDirectCall('Women Helpline', '1091')}
              className="flex-1 py-2 px-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
              title="Direct call to Women Helpline (1091)"
            >
              <span className="text-sm">👩</span>
              <span>Women 1091</span>
            </button>
          </div>

          {/* Radial Press-and-Hold Button */}
          <div className="relative my-6 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-48 h-48 sm:w-56 sm:h-56 transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="text-slate-100"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="text-[#C0392B] transition-all duration-75"
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * holdProgress) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>

            {/* Core Circular Button */}
            <button
              onMouseDown={startHold}
              onMouseUp={endHold}
              onMouseLeave={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              onClick={() => {
                if (!isHolding && holdProgress === 0) {
                  setShowConfirmModal(true);
                }
              }}
              className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all duration-150 select-none cursor-pointer ${
                isHolding
                  ? 'scale-95 bg-rose-800 shadow-rose-900/50'
                  : 'bg-gradient-to-tr from-[#C0392B] via-rose-600 to-[#C0392B] hover:scale-102 hover:shadow-rose-600/40 shadow-rose-600/30'
              }`}
              aria-label="Emergency SOS Button"
            >
              <ShieldAlert className="w-12 h-12 sm:w-16 sm:h-16 mb-1 filter drop-shadow animate-pulse" />
              <span className="text-xl sm:text-2xl font-black tracking-wider">
                {t.sos}
              </span>
              <span className="text-[10px] font-semibold text-rose-100 tracking-wide uppercase mt-0.5">
                {isHolding ? `${Math.round(holdProgress)}%` : t.pressAndHold}
              </span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            {t.accidentalPrevention}
          </div>

          {/* Quick Fallback Triggers */}
          <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-5 border-t border-rose-100">
            <button
              onClick={() => setShowCallModal(true)}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#C0392B]" />
              {t.call112}
            </button>
            <button
              onClick={() => setShowSmsModal(true)}
              className="py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 shadow-2xs"
            >
              <span>💬</span>
              {t.smsDispatch}
            </button>
          </div>

        </div>

        {/* Right Column: Area Safety Score (AI / Rule-Based) & Risk Factors */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Area Safety Score Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#0B5563]" />
                  {t.aiRiskEngine}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  {t.areaSafetyScore}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.scoreSubtext}
                </p>
              </div>

              {/* Score Circular Badge */}
              <div
                className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black text-white shadow-md"
                style={{ backgroundColor: safetyScore.color }}
              >
                <span className="text-2xl leading-none">{safetyScore.score}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">/ 100</span>
              </div>
            </div>

            {/* Risk Level Bar */}
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span style={{ color: safetyScore.color }} className="flex items-center gap-1">
                  ● {safetyScore.riskLevel === 'HIGH RISK' ? t.highRisk : safetyScore.riskLevel === 'MODERATE' ? t.moderate : t.safe}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {safetyScore.timeContext}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full transition-all duration-500 rounded-full"
                  style={{
                    width: `${safetyScore.score}%`,
                    backgroundColor: safetyScore.color
                  }}
                />
              </div>
            </div>

            {/* Reasons / Factors Breakdown (Translated into current language) */}
            <div className="mt-5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                {t.identifiedRiskFactors}
              </span>
              <ul className="space-y-1.5">
                {safetyScore.reasons.map((r, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2 rounded-xl">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{translateReason(r, currentLanguage)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety Tiers Legend */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3A7D5C]" /> 70–100 {t.safe}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#E8743B]" /> 40–69 {t.moderate}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C0392B]" /> 0–39 {t.highRisk}
              </span>
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            {/* Safe Route */}
            <Link
              to="/safe-route"
              className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0B5563] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Navigation className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2.5">
                {t.safeRoute}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t.avoidsHazards}
              </p>
            </Link>

            {/* Medical Profile */}
            <Link
              to="/medical-profile"
              className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#C0392B] flex items-center justify-center group-hover:scale-110 transition-transform">
                <HeartPulse className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2.5">
                {t.medicalProfile}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t.level2Privacy}
              </p>
            </Link>

            {/* Verified Helpers */}
            <Link
              to="/helpers"
              className="p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs transition-all group col-span-2 sm:col-span-1"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#1F497D] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-2.5">
                {t.helpers}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {helpers.length} {t.verifiedNearby}
              </p>
            </Link>

          </div>

        </div>

      </div>

      {/* 👨‍👩‍👧 PARENT & TRUSTED EMERGENCY CONTACTS (Directly Editable on Dashboard - Addresses User Feedback 2) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                {t.trustedCircle} (Live Location Sharing)
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                ● Live Streaming
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Your parents and trusted contacts who automatically receive your live coordinates and SOS alerts
            </p>
          </div>
          <Link
            to="/trusted-contacts"
            className="text-xs font-bold text-[#1F497D] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Manage All Contacts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contacts.slice(0, 2).map((c) => (
            <div
              key={c.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <strong className="text-xs font-bold text-slate-800">{c.name}</strong>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                    {c.relationship}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {c.phone}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live GPS Stream: Active
                </div>
              </div>

              {/* Instant Edit Button */}
              <button
                onClick={() => handleOpenEdit(c)}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1 transition-colors"
                title="Edit Parent / Contact details"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#1F497D]" />
                <span>{t.edit}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Safety Map Preview */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              {t.liveIntelligence}
            </h3>
            <p className="text-xs text-slate-500">
              {t.liveIntelligenceSubtext}
            </p>
          </div>
          <Link
            to="/safe-route"
            className="text-xs font-bold text-[#1F497D] hover:text-[#0B5563] flex items-center gap-1"
          >
            {t.exploreSafeRoutes} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <SafetyMap
          center={[location.lat, location.lng]}
          userAddress={location.address}
          helpers={helpers}
          incidents={incidents}
          className="h-80 w-full rounded-2xl border border-slate-200"
        />
      </div>

      {/* Edit Contact Modal directly accessible from Dashboard */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0B5563] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {t.editContact}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Edit phone number, name, and live GPS sharing permissions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingContact(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full text-xs p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t.relationship}
                </label>
                <select
                  value={editRelationship}
                  onChange={(e: any) => setEditRelationship(e.target.value)}
                  className="w-full text-xs font-bold p-3 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                >
                  {['Mother', 'Father', 'Sibling', 'Friend', 'Partner', 'Doctor', 'Other'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Permissions & Alerts:
                </span>

                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer">
                  <span>Stream Live GPS Tracking Coordinates</span>
                  <input
                    type="checkbox"
                    checked={editReceiveLocation}
                    onChange={(e) => setEditReceiveLocation(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F497D]"
                  />
                </label>

                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer">
                  <span>Notify via Push & SMS on SOS</span>
                  <input
                    type="checkbox"
                    checked={editNotifyOnSos}
                    onChange={(e) => setEditNotifyOnSos(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F497D]"
                  />
                </label>

                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between cursor-pointer">
                  <span>Share Basic Medical Summary</span>
                  <input
                    type="checkbox"
                    checked={editReceiveMedicalSummary}
                    onChange={(e) => setEditReceiveMedicalSummary(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1F497D]"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingContact(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1F497D] hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {t.updateContact}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Confirmation Modal before triggering SOS */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                <ShieldAlert className="w-7 h-7 text-[#C0392B]" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  {t.selectEmergencyCategory}
                </h3>
                <p className="text-xs text-slate-500">
                  {t.confirmToNotify}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {t.selectEmergencyCategory}:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    'Medical Emergency',
                    'Accident',
                    'Unsafe Situation',
                    'Fire',
                    'Flood/Disaster',
                    'Other'
                  ] as EmergencyType[]
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedEmergencyType(type)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      selectedEmergencyType === type
                        ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {type === 'Medical Emergency' && '🩸 '}
                    {type === 'Accident' && '💥 '}
                    {type === 'Unsafe Situation' && '⚠️ '}
                    {type === 'Fire' && '🔥 '}
                    {type === 'Flood/Disaster' && '🌊 '}
                    {type === 'Other' && '🚨 '}
                    {type === 'Medical Emergency' ? t.medicalEmergency :
                     type === 'Accident' ? t.accident :
                     type === 'Unsafe Situation' ? t.unsafeSituation :
                     type === 'Fire' ? t.fire :
                     type === 'Flood/Disaster' ? t.floodDisaster : t.other}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>{t.dispatchLocation}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">{location.address}</p>
            </div>

            {/* Direct Calling Options for Police & Ambulance */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Direct Emergency Call Options:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectCall('Police', '112')}
                  className="p-3 rounded-2xl border-2 border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98"
                >
                  <span className="text-base">🚓</span>
                  <span>Call Police (112)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDirectCall('Ambulance', '108')}
                  className="p-3 rounded-2xl border-2 border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-98"
                >
                  <span className="text-base">🚑</span>
                  <span>Call Ambulance (108)</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleConfirmSos}
                className="w-full py-3.5 bg-[#C0392B] hover:bg-rose-700 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <ShieldAlert className="w-5 h-5" />
                {t.broadcastSosNow}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2.5 text-xs text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
              >
                {t.cancelFalseAlarm}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Phone Call Modal */}
      <EmergencyCallModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
      />

      {/* SMS Fallback Modal */}
      <SmsFallbackModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        locationAddress={location.address}
        lat={location.lat}
        lng={location.lng}
        emergencyType={selectedEmergencyType}
      />

      {/* 📍 Change Location / Switch Zone Modal (Addresses Requirement 4) */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#1F497D]/10 text-[#1F497D] flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Change Location / Select Zone
                  </h3>
                  <p className="text-xs text-slate-500">
                    Switch your active safety zone to test dynamic safety scores, safe routes, and nearby helpers
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Option 1: Real GPS */}
            <div className="p-4 bg-teal-50/60 rounded-2xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Real-Time Geolocation</span>
                <strong className="text-sm text-teal-950">Detect Real Device GPS Location</strong>
                <p className="text-xs text-teal-800/80 mt-0.5">Use your device browser's actual GPS coordinates</p>
              </div>
              <button
                onClick={handleDetectRealGps}
                disabled={detectingGps}
                className="px-4 py-2.5 bg-[#0B5563] hover:bg-teal-800 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Radio className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
                <span>{detectingGps ? 'Detecting...' : 'Detect Real GPS'}</span>
              </button>
            </div>

            {/* Option 2: Preset City Safety Zones */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Popular City Zones & Testing Hubs:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SAMPLE_LOCATIONS.map((preset, idx) => {
                  const isCurrent = location.address === preset.name;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectPresetLocation(preset)}
                      className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between space-y-1.5 ${
                        isCurrent
                          ? 'bg-[#1F497D]/10 border-[#1F497D] ring-2 ring-[#1F497D]/20 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-black text-slate-900">{preset.name}</strong>
                        {isCurrent && <span className="text-[10px] bg-[#1F497D] text-white px-2 py-0.2 rounded-full font-bold">Current</span>}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">{preset.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Coord: {preset.lat.toFixed(4)}, {preset.lng.toFixed(4)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option 3: Custom Coordinates Input */}
            <form onSubmit={handleApplyCustomCoords} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                Or Enter Custom Location / Coordinates:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Zone Name (e.g. Kondapur)"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="sm:col-span-1 text-xs p-2.5 bg-white rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude (e.g. 17.4600)"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  className="text-xs p-2.5 bg-white rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude (e.g. 78.3500)"
                  value={customLng}
                  onChange={(e) => setCustomLng(e.target.value)}
                  className="text-xs p-2.5 bg-white rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1F497D] hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Apply Custom Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
