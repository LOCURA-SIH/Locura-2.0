import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  Navigation,
  HeartPulse,
  Lock,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { sosService } from '../services/sosService';
import { helperService } from '../services/helperService';
import { authService } from '../services/authService';
import { SafetyMap } from '../components/SafetyMap';
import { SosAlert, HelperProfile } from '../types';

export const HelperSosPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSos, setActiveSos] = useState<SosAlert | null>(sosService.getActiveSos());
  const [user, setUser] = useState(authService.getCurrentUser());
  const [helpers, setHelpers] = useState<HelperProfile[]>(helperService.getAllHelpers());
  const [accepted, setAccepted] = useState(false);
  const [markedResponded, setMarkedResponded] = useState(false);

  useEffect(() => {
    const unsub = sosService.subscribe((s) => {
      setActiveSos(s);
      if (s) {
        const hasAccepted = s.acceptedHelpers.some((h) => h.helperId === user?.id || h.helperId === 'helper-ravi-02');
        setAccepted(hasAccepted);
      }
    });
    return () => unsub();
  }, [user]);

  if (!activeSos) {
    return (
      <div className="min-h-screen pb-24 pt-12 px-4 max-w-md mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
          🛡️
        </div>
        <h2 className="text-xl font-black text-slate-900">
          No Active Emergency Alert
        </h2>
        <p className="text-xs text-slate-500">
          There are currently no active SOS calls dispatched to your helper station.
        </p>
        <Link
          to="/helper-dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B5563] text-white text-xs font-bold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Helper Station
        </Link>
      </div>
    );
  }

  const helperId = user?.role === 'HELPER' ? user.id : 'helper-ravi-02';

  const handleAccept = () => {
    sosService.acceptSos(activeSos.id, helperId);
    setAccepted(true);
  };

  const handleMarkHelpProvided = () => {
    setMarkedResponded(true);
    setTimeout(() => {
      navigate('/helper-dashboard');
    }, 2000);
  };

  const userFirstName = activeSos.userName.split(' ')[0];

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Back to helper station */}
      <Link
        to="/helper-dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Helper Station
      </Link>

      {/* Emergency Header */}
      <div className="bg-[#C0392B] text-white p-6 rounded-3xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-white/20 text-white font-extrabold text-[11px] rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            EMERGENCY NEARBY
          </span>
          <span className="text-xs font-mono text-rose-200">
            0.8 km distance
          </span>
        </div>

        <div>
          <h1 className="text-2xl font-black">
            {activeSos.emergencyType}
          </h1>
          <p className="text-xs text-rose-100 mt-1 flex items-center gap-2">
            <span>User: <strong>{userFirstName}</strong> (First Name Only)</span>
            <span>•</span>
            <span>📍 {activeSos.location.address}</span>
          </p>
        </div>
      </div>

      {/* Mandatory Medical Privacy Notice Banner */}
      <div className="bg-teal-50 border border-teal-200 text-[#0B5563] p-4 rounded-2xl text-xs font-semibold flex items-center gap-3">
        <HeartPulse className="w-5 h-5 flex-shrink-0 text-[#0B5563]" />
        <div>
          <strong>"Only basic emergency medical information is shown."</strong>
          <p className="text-[11px] text-teal-800 font-normal mt-0.5">
            Full clinical records, doctor contact, and insurance are encrypted to safeguard the patient's privacy during rescue.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left: Basic Emergency Medical Information (STRICT PRIVACY PROJECTION) */}
        <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🩸</span>
              Basic Emergency Medical Data
            </h3>
            <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
              Essential Only
            </span>
          </div>

          {activeSos.basicMedicalSummary ? (
            <div className="space-y-3">
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-bold">Medical Emergency:</span>
                <span className="text-xs font-black text-[#C0392B] uppercase">Yes</span>
              </div>

              {activeSos.basicMedicalSummary.bloodGroup && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-bold">Blood Group:</span>
                  <span className="text-sm font-black text-rose-600 font-mono">
                    {activeSos.basicMedicalSummary.bloodGroup}
                  </span>
                </div>
              )}

              {activeSos.basicMedicalSummary.criticalAllergies && (
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <span className="text-xs text-amber-900 font-bold">Critical Allergy:</span>
                  <span className="text-xs font-black text-amber-700">
                    {activeSos.basicMedicalSummary.criticalAllergies.join(', ')}
                  </span>
                </div>
              )}

              {activeSos.basicMedicalSummary.importantMedicationAlert && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-900 font-bold">Critical Medication Alert:</span>
                  <span className="text-xs font-black text-emerald-700">Yes (Inhaler / Meds on person)</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-500 italic text-center">
              "Medical information unavailable. Contact emergency services."
            </div>
          )}

          {/* Explicit Redaction Box (Proof of Medical Privacy Compliance) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Protected Private Medical Data (Redacted):</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500">
              <li>Doctor Contact: Hidden</li>
              <li>Insurance Provider & Policy: Hidden</li>
              <li>Complete Prescription Drug List: Hidden</li>
              <li>Private Medical Notes: Hidden</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {!accepted ? (
              <button
                onClick={handleAccept}
                className="w-full py-4 bg-[#3A7D5C] hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <CheckCircle2 className="w-5 h-5" />
                ACCEPT SOS & NOTIFY USER
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold text-center">
                  ✓ You accepted this emergency mission. User can track your ETA.
                </div>
                <button
                  onClick={handleMarkHelpProvided}
                  className="w-full py-3 bg-[#1F497D] hover:bg-slate-900 text-white font-bold rounded-2xl text-xs shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  MARK HELP PROVIDED & CLOSE
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <a
                href={`https://maps.google.com/?q=${activeSos.location.lat},${activeSos.location.lng}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-4 h-4 text-[#0B5563]" />
                Navigate in Maps
              </a>
              <a
                href="tel:112"
                className="p-3 bg-rose-50 hover:bg-rose-100 text-[#C0392B] font-bold text-xs rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call 112
              </a>
            </div>
          </div>
        </div>

        {/* Right: Map Navigation View */}
        <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              User Rescue Coordinates
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {activeSos.location.lat.toFixed(4)}, {activeSos.location.lng.toFixed(4)}
            </p>
          </div>

          <SafetyMap
            center={[activeSos.location.lat, activeSos.location.lng]}
            userAddress={activeSos.location.address}
            className="h-80 w-full rounded-2xl border border-slate-200"
          />
        </div>

      </div>

    </div>
  );
};
