import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Users,
  Phone,
  HeartPulse,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Navigation,
  Star,
  FileText,
  Upload,
  ArrowRight,
  Radio,
  Share2,
  Copy,
  ExternalLink,
  Check
} from 'lucide-react';
import { sosService } from '../services/sosService';
import { locationService } from '../services/locationService';
import { helperService } from '../services/helperService';
import { SafetyMap } from '../components/SafetyMap';
import { SosNavigationMap } from '../components/SosNavigationMap';
import { EmergencyCallModal } from '../components/EmergencyCallModal';
import { SmsFallbackModal } from '../components/SmsFallbackModal';
import { LiveLocationBadge } from '../components/LiveLocationBadge';
import { SosAlert, EmergencyType, HelperProfile } from '../types';
import { formatTimestamp } from '../utils/geo';
import { useTranslation } from '../utils/i18n';

export const SosPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeSos, setActiveSos] = useState<SosAlert | null>(sosService.getActiveSos());
  const [location, setLocation] = useState(locationService.getLocation());
  const [helpers, setHelpers] = useState<HelperProfile[]>(helperService.getVerifiedHelpers());

  // Post-emergency resolution modal
  const [showEndModal, setShowEndModal] = useState(false);
  const [resolutionStep, setResolutionStep] = useState<'CONFIRM' | 'FEEDBACK'>('CONFIRM');
  const [helperRating, setHelperRating] = useState(5);
  const [helperFeedback, setHelperFeedback] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Call / SMS modals
  const [showCallModal, setShowCallModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);

  // New SOS creation if none active
  const [selectedType, setSelectedType] = useState<EmergencyType>('Medical Emergency');
  const [copiedLink, setCopiedLink] = useState(false);

  // Live telemetry ping log simulation
  const [pingLogs, setPingLogs] = useState<Array<{ time: string; text: string; status: 'ok' | 'sending' }>>([]);

  // Direct Helpline Calling Feedback State
  const [directCallNotice, setDirectCallNotice] = useState<string | null>(null);

  const handleDirectCall = (target: string, number: string) => {
    setDirectCallNotice(`✓ Direct call sent directly to ${target} (${number}) • Live GPS coordinates transmitted (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`);
    window.location.href = `tel:${number}`;
    setTimeout(() => setDirectCallNotice(null), 5000);
  };

  useEffect(() => {
    const unsubSos = sosService.subscribe((sos) => setActiveSos(sos));
    const unsubLoc = locationService.subscribe((loc) => {
      setLocation(loc);
      if (activeSos) {
        const nowStr = new Date().toLocaleTimeString();
        setPingLogs((prev) => [
          {
            time: nowStr,
            text: `Ping #${locationService.getPingCount()} broadcasted (${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}) • Delivered to 2 Contacts & Helper`,
            status: 'ok'
          },
          ...prev.slice(0, 4)
        ]);
      }
    });
    const unsubHelpers = helperService.subscribe((h) => {
      setHelpers(h.filter((item) => item.verificationStatus === 'Verified'));
    });

    return () => {
      unsubSos();
      unsubLoc();
      unsubHelpers();
    };
  }, [activeSos]);

  const handleStartSos = () => {
    sosService.triggerSos(selectedType, {
      lat: location.lat,
      lng: location.lng,
      address: location.address
    });
  };

  const handleSimulateHelperAccept = () => {
    if (!activeSos) return;
    const firstHelper = helpers[0];
    if (firstHelper) {
      sosService.acceptSos(activeSos.id, firstHelper.id);
    }
  };

  const handleConfirmEndEmergency = () => {
    setResolutionStep('FEEDBACK');
  };

  const handleSubmitResolution = () => {
    if (!activeSos) return;
    sosService.endSos(activeSos.id, resolutionNotes, helperRating, helperFeedback);
    setShowEndModal(false);
    setResolutionStep('CONFIRM');
    navigate('/sos-history');
  };

  const handleCancelSos = () => {
    if (!activeSos) return;
    sosService.cancelSos(activeSos.id);
  };

  const handleCopyGpsLink = () => {
    const url = locationService.getGoogleMapsUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // If no SOS active, display emergency launchpad
  if (!activeSos) {
    return (
      <div className="min-h-screen pb-24 pt-8 px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-[#C0392B] flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Emergency Command Center
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Choose the emergency type below to immediately alert your emergency contacts and broadcast to nearby verified community responders.
          </p>
        </div>

        {/* Live GPS Beacon Preview before triggering */}
        <LiveLocationBadge variant="full" />

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Select Category of Incident:
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                'Medical Emergency',
                'Accident',
                'Unsafe Situation',
                'Fire',
                'Flood/Disaster',
                'Other'
              ] as EmergencyType[]
            ).map((tType) => (
              <button
                key={tType}
                onClick={() => setSelectedType(tType)}
                className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all ${
                  selectedType === tType
                    ? 'border-[#C0392B] bg-rose-50/70 text-[#C0392B] shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {tType === 'Medical Emergency' && '🩸 '}
                {tType === 'Accident' && '💥 '}
                {tType === 'Unsafe Situation' && '⚠️ '}
                {tType === 'Fire' && '🔥 '}
                {tType === 'Flood/Disaster' && '🌊 '}
                {tType === 'Other' && '🚨 '}
                {tType === 'Medical Emergency' ? t.medicalEmergency :
                 tType === 'Accident' ? t.accident :
                 tType === 'Unsafe Situation' ? t.unsafeSituation :
                 tType === 'Fire' ? t.fire :
                 tType === 'Flood/Disaster' ? t.floodDisaster : t.other}
              </button>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-[#0B5563] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800">{t.dispatchLocation}</div>
              <div className="text-[11px] text-slate-500">{location.address}</div>
            </div>
          </div>

          {/* Direct Call Feedback Banner */}
          {directCallNotice && (
            <div className="p-3 bg-emerald-700 text-white rounded-2xl shadow-md text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-left">
                <Check className="w-4 h-4 text-emerald-200 flex-shrink-0" />
                <span>{directCallNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setDirectCallNotice(null)}
                className="text-white/80 hover:text-white p-1"
              >
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 🚨 Small Helpline Buttons Directly Above SOS */}
          <div className="flex items-center justify-center gap-2">
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

          <button
            onClick={handleStartSos}
            className="w-full py-4 bg-[#C0392B] hover:bg-rose-700 text-white font-extrabold rounded-2xl text-base shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            {t.broadcastSosNow}
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <button onClick={() => setShowCallModal(true)} className="hover:text-slate-900 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-[#C0392B]" /> {t.call112}
          </button>
          <span>•</span>
          <button onClick={() => setShowSmsModal(true)} className="hover:text-slate-900 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-[#E8743B]" /> {t.smsDispatch}
          </button>
        </div>

        <EmergencyCallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} />
        <SmsFallbackModal
          isOpen={showSmsModal}
          onClose={() => setShowSmsModal(false)}
          locationAddress={location.address}
          lat={location.lat}
          lng={location.lng}
          emergencyType={selectedType}
        />
      </div>
    );
  }

  // Active SOS View
  return (
    <div className="min-h-screen pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* 🔔 Simulated Real-Time Push Notification & Location Dispatch Banner */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-slate-700 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0B5563] to-teal-500 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 animate-pulse">
            🔔
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#C0392B] px-2 py-0.5 rounded text-white">
                {t.pushSent}
              </span>
              <span className="text-[10px] bg-emerald-900 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Location Beacon Active
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1">
              Push notifications delivered to <strong>Sunita Sharma (Mother)</strong> and <strong>Rajesh Sharma (Father)</strong> with continuous live GPS tracking link.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopyGpsLink}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Live Link'}</span>
          </button>
          <a
            href={locationService.getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs"
            title="Open live coordinates in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 📡 Dedicated Live Location Sharing Telemetry Card (Addresses: "When SOS is clicked make it look like live location is shared") */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0B5563]/30 text-white p-5 rounded-3xl border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <span>🟢 {t.liveGpsActive}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full border border-slate-700">
                  {t.accuracy}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Broadcasting dynamic coordinates every 3 seconds to 2 trusted contacts & verified responder Ravi Kumar.
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            📡 LAT: {location.lat.toFixed(5)}° N | LNG: {location.lng.toFixed(5)}° E
          </div>
        </div>

        {/* Live Ping Feed */}
        <div className="bg-black/40 rounded-2xl p-3 border border-slate-800 space-y-1.5 text-xs font-mono">
          <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
            <span>Live Transmission Log (Real-Time Feed):</span>
            <span className="text-emerald-400">● Streaming Live</span>
          </div>
          {pingLogs.length === 0 ? (
            <div className="text-slate-400 text-[11px]">Initializing real-time coordinate socket...</div>
          ) : (
            pingLogs.map((log, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                <span className="text-slate-500">[{log.time}]</span>
                <span className="text-emerald-400 font-bold">✓</span>
                <span className="line-clamp-1">{log.text}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 🚨 Active Emergency Banner */}
      <div className="bg-[#C0392B] text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-sos-pulse">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl flex-shrink-0">
            🚨
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              {t.sosActive}
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              {activeSos.emergencyType.toUpperCase()}
            </h1>
            <p className="text-xs text-rose-100 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3.5 h-3.5" /> Triggered at {formatTimestamp(activeSos.createdAt)}
            </p>
          </div>
        </div>

        {/* Core Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCallModal(true)}
            className="px-4 py-2.5 bg-white text-[#C0392B] font-extrabold text-xs rounded-xl shadow hover:bg-rose-50 transition-colors flex items-center gap-1.5"
          >
            <Phone className="w-4 h-4" />
            {t.call112}
          </button>
          <button
            onClick={() => setShowEndModal(true)}
            className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-950 text-white font-extrabold text-xs rounded-xl border border-rose-400/30 transition-colors"
          >
            {t.endSos}
          </button>
          <button
            onClick={handleCancelSos}
            className="px-3 py-2.5 text-xs text-rose-200 hover:text-white underline font-semibold"
          >
            {t.cancelFalseAlarm}
          </button>
        </div>
      </div>

      {/* Grid: Status Cards & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Dispatch Status & Medical Summary */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Trusted Contacts Notification Status */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#1F497D]" />
                {t.trustedContacts} Alerted
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                ✓ Delivered
              </span>
            </div>

            <div className="space-y-2">
              {activeSos.trustedContactsNotified.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{c.phone}</div>
                  </div>
                  <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> SMS & Live GPS Sent
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Medical Summary Transmitted to Helpers (Strict Privacy Demonstration) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-[#C0392B]" />
                {t.basicEmergencyInfo}
              </h3>
              <span className="text-[10px] bg-teal-100 text-[#0B5563] font-bold px-2 py-0.5 rounded-full">
                Level 2 Restricted
              </span>
            </div>

            <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-3.5 text-xs space-y-2">
              <div className="text-[11px] font-extrabold text-rose-950 uppercase tracking-wider">
                🚨 Transmitted to Verified Helpers:
              </div>

              {activeSos.basicMedicalSummary ? (
                <div className="space-y-1 text-slate-800">
                  {activeSos.basicMedicalSummary.bloodGroup && (
                    <div>🩸 <strong>{t.bloodGroup}:</strong> {activeSos.basicMedicalSummary.bloodGroup}</div>
                  )}
                  {activeSos.basicMedicalSummary.criticalAllergies && (
                    <div>⚠️ <strong>{t.allergies}:</strong> {activeSos.basicMedicalSummary.criticalAllergies.join(', ')}</div>
                  )}
                  {activeSos.basicMedicalSummary.importantMedicationAlert && (
                    <div>💊 <strong>{t.medications}:</strong> Yes (Carries Inhaler / Essential Meds)</div>
                  )}
                  <p className="text-[10px] text-slate-500 italic mt-1 border-t border-rose-200/60 pt-1">
                    {activeSos.basicMedicalSummary.notice}
                  </p>
                </div>
              ) : (
                <div className="text-xs text-slate-600">
                  Medical information unavailable. Contact emergency services.
                </div>
              )}
            </div>

            {/* Privacy Shield Confirmation */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1">
                <span>🛡️ Private Data Protected:</span>
              </div>
              <div>Insurance, doctor contacts, full medications, and private medical documents are <strong>strictly hidden</strong> from helpers.</div>
            </div>
          </div>

          {/* 3. Nearby Responding Helpers */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#0B5563]" />
                {t.helpers} ({activeSos.acceptedHelpers.length} Responded)
              </h3>
              {activeSos.acceptedHelpers.length === 0 && (
                <button
                  onClick={handleSimulateHelperAccept}
                  className="text-[10px] bg-teal-50 text-[#0B5563] hover:bg-teal-100 font-bold px-2 py-1 rounded-lg border border-teal-200 transition-colors"
                >
                  Simulate Helper Acceptance
                </button>
              )}
            </div>

            {activeSos.acceptedHelpers.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl text-center space-y-2 border border-dashed border-slate-200">
                <div className="text-xs text-slate-600 font-medium">
                  Alert broadcasted to {activeSos.helpersNotifiedCount} verified nearby volunteers...
                </div>
                <div className="text-[11px] text-slate-400">
                  Waiting for nearest responder to accept mission.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {activeSos.acceptedHelpers.map((h, i) => (
                  <div key={i} className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                          ✓ {h.helperName}
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-semibold">
                            Verified Responder
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          {h.distanceKm} km away • {h.skills.join(', ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-700 block">
                          ETA ~{h.etaMinutes} min
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">En route (Tracking live)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`tel:${h.phone}`}
                        className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl text-center hover:bg-slate-50 flex items-center justify-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#0B5563]" />
                        Call Helper ({h.phone})
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Live Map & Emergency Navigation */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {t.liveGpsActive} - Dispatch Map
                </h3>
                <p className="text-xs text-slate-500">
                  {location.address}
                </p>
              </div>
              <div className="text-right text-xs font-mono font-bold text-slate-600">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            </div>

            {/* Live Navigation from Helper to Traveler on Map (Addresses Requirement 7) */}
            <SosNavigationMap
              travelerLocation={activeSos.location}
              travelerName={activeSos.userName}
              emergencyType={activeSos.emergencyType}
              helpers={helpers}
              activeHelper={
                activeSos.acceptedHelpers[0]
                  ? {
                      id: activeSos.acceptedHelpers[0].helperId,
                      name: activeSos.acceptedHelpers[0].helperName,
                      phone: activeSos.acceptedHelpers[0].phone,
                      distanceKm: activeSos.acceptedHelpers[0].distanceKm,
                      skills: activeSos.acceptedHelpers[0].skills,
                      etaMinutes: activeSos.acceptedHelpers[0].etaMinutes
                    }
                  : {
                      id: 'helper-ravi-02',
                      name: 'Ravi Kumar',
                      phone: '+91 98480 22334',
                      distanceKm: 0.8,
                      skills: ['First Aid Certified', 'CPR'],
                      etaMinutes: 4
                    }
              }
            />

            {/* Quick Links */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/safe-route"
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 border border-slate-200"
              >
                <Navigation className="w-4 h-4 text-[#0B5563]" />
                View Safe Route
              </Link>
              <button
                onClick={() => setShowSmsModal(true)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-center gap-2 border border-slate-200"
              >
                <MessageSquare className="w-4 h-4 text-[#E8743B]" />
                SMS Coordinates
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* After Emergency Flow Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            {resolutionStep === 'CONFIRM' ? (
              <>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#3A7D5C] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="text-center">
                  <h3 className="font-extrabold text-xl text-slate-900">
                    {t.areYouSafe}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Ending the emergency will notify your trusted contacts and release responding community helpers.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    onClick={handleConfirmEndEmergency}
                    className="w-full py-3.5 bg-[#3A7D5C] hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-md"
                  >
                    YES — I am Safe / End Emergency
                  </button>
                  <button
                    onClick={() => setShowEndModal(false)}
                    className="w-full py-2.5 text-xs text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                  >
                    NO — Keep SOS Active
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Emergency Resolution & Feedback
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Help us improve responder trust and record safety incident notes
                  </p>
                </div>

                {/* Helper Rating */}
                {activeSos.acceptedHelpers.length > 0 && (
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Rate Responding Helper ({activeSos.acceptedHelpers[0].helperName}):
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setHelperRating(star)}
                          className="p-1 text-2xl focus:outline-none"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= helperRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Optional helper feedback (e.g. Arrived quickly, first aid provided)..."
                      value={helperFeedback}
                      onChange={(e) => setHelperFeedback(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                    />
                  </div>
                )}

                {/* Resolution Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Incident Resolution Notes:
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of outcome (e.g. Ambulance arrived, safe inside hotel)..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleSubmitResolution}
                    className="w-full py-3 bg-[#1F497D] hover:bg-slate-800 text-white font-bold rounded-2xl text-xs shadow-md"
                  >
                    Submit & Save to SOS History
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Helper Call Modal & SMS Modals */}
      <EmergencyCallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} />
      <SmsFallbackModal
        isOpen={showSmsModal}
        onClose={() => setShowSmsModal(false)}
        locationAddress={location.address}
        lat={location.lat}
        lng={location.lng}
        emergencyType={activeSos.emergencyType}
      />

    </div>
  );
};
