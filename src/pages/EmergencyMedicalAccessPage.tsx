import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Key, ShieldAlert, HeartPulse, CheckCircle2, AlertCircle, Lock, FileText } from 'lucide-react';
import { medicalService } from '../services/medicalService';
import { MedicalAccessToken } from '../types';

export const EmergencyMedicalAccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [inputToken, setInputToken] = useState(tokenFromUrl);
  const [accessorRole, setAccessorRole] = useState<'Paramedic' | 'Hospital Trauma Team' | 'Emergency Doctor'>('Hospital Trauma Team');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    if (tokenFromUrl) {
      handleVerify(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const handleVerify = (tkn?: string) => {
    const target = tkn || inputToken;
    setErrorNotice(null);
    setVerificationResult(null);

    if (!target.trim()) {
      setErrorNotice('Please provide a valid emergency medical access token.');
      return;
    }

    const result = medicalService.verifyAndAccessMedicalRecord(target, accessorRole);
    if (!result.valid) {
      setErrorNotice(result.reason || 'Token verification failed.');
    } else {
      setVerificationResult(result);
    }
  };

  const handleGenerateSampleToken = () => {
    const generated = medicalService.generateAccessToken('sos-demo-active', 'Ananya Sharma');
    setInputToken(generated.token);
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#0B5563] flex items-center justify-center flex-shrink-0">
          <Key className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Authorized Emergency Medical Access Gateway
          </h1>
          <p className="text-xs text-slate-500">
            Level 3 secure gateway for certified trauma centers, ER physicians, and hospital triage
          </p>
        </div>
      </div>

      {/* Mandatory Statutory Notice */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-2 text-xs border border-slate-800">
        <div className="text-amber-400 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" />
          Mandatory Regulatory Compliance
        </div>
        <p className="font-semibold text-slate-200">
          «"Emergency access only. Access is logged. Information is provided only to assist during this emergency."»
        </p>
        <p className="text-[11px] text-slate-400">
          Accessing medical records without explicit emergency justification violates patient privacy regulations and is recorded on the immutable audit trail.
        </p>
      </div>

      {/* Token Verification Input Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Enter Single-Use Emergency Access Token:
          </label>
          <button
            onClick={handleGenerateSampleToken}
            className="text-[11px] font-bold text-[#0B5563] hover:underline"
          >
            + Generate Valid Demo Token
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="e.g. LOCURA-MED-ABCD1234"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="w-full text-xs font-mono font-bold p-3 bg-slate-50 rounded-xl border border-slate-200 uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-[#0B5563]"
            />
          </div>
          <div>
            <select
              value={accessorRole}
              onChange={(e: any) => setAccessorRole(e.target.value)}
              className="w-full text-xs font-semibold p-3 bg-slate-50 rounded-xl border border-slate-200"
            >
              <option value="Hospital Trauma Team">Hospital Trauma Team</option>
              <option value="Emergency Doctor">Emergency ER Doctor</option>
              <option value="Paramedic">Certified Paramedic</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => handleVerify()}
          className="w-full py-3.5 bg-[#0B5563] hover:bg-teal-800 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <Key className="w-4 h-4" />
          Verify Token & Decrypt Emergency Record
        </button>

        {errorNotice && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorNotice}</span>
          </div>
        )}
      </div>

      {/* Verified Record Display */}
      {verificationResult && verificationResult.valid && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-emerald-500 shadow-lg space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-extrabold text-base text-slate-900">
                Verified Emergency Patient File: {verificationResult.tokenData?.patientName}
              </h3>
            </div>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Access Granted & Audited
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group</span>
              <strong className="text-base text-rose-600 font-mono">
                {verificationResult.fullMedicalRecord?.bloodGroup || 'Not provided'}
              </strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Critical Allergies</span>
              <strong className="text-amber-700">
                {verificationResult.fullMedicalRecord?.criticalAllergies?.join(', ') || 'None recorded'}
              </strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Chronic Conditions</span>
              <strong className="text-slate-800">
                {verificationResult.fullMedicalRecord?.criticalConditions?.join(', ') || 'None'}
              </strong>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Emergency Medications</span>
              <strong className="text-slate-800">
                {verificationResult.fullMedicalRecord?.emergencyMedications?.join(', ') || 'None'}
              </strong>
            </div>
          </div>

          {/* Doctor Info */}
          {verificationResult.fullMedicalRecord?.doctorContact && (
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 text-xs space-y-1">
              <span className="text-[10px] text-[#0B5563] font-bold uppercase block">Primary Physician</span>
              <div className="font-bold text-slate-900">
                {verificationResult.fullMedicalRecord.doctorContact.name} ({verificationResult.fullMedicalRecord.doctorContact.clinic})
              </div>
              <div className="text-slate-600 font-mono">
                {verificationResult.fullMedicalRecord.doctorContact.phone}
              </div>
            </div>
          )}

          {/* Clinical Notes */}
          {verificationResult.fullMedicalRecord?.detailedMedicalNotes && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Clinical Guidance</span>
              <p className="text-slate-700 italic">
                "{verificationResult.fullMedicalRecord.detailedMedicalNotes}"
              </p>
            </div>
          )}

          <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between font-mono">
            <span>Token: {verificationResult.tokenData?.token}</span>
            <span>Session Logged • Device: CLIENT-SECURE</span>
          </div>
        </div>
      )}

    </div>
  );
};
