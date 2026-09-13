import React, { useState } from 'react';
import {
  HeartPulse,
  Shield,
  Eye,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Key,
  Save,
  Info
} from 'lucide-react';
import { medicalService } from '../services/medicalService';
import { MedicalProfile } from '../types';
import { useTranslation } from '../utils/i18n';

export const MedicalProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<MedicalProfile>(medicalService.getProfile());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'EDIT' | 'PREVIEW' | 'TOKENS'>('EDIT');

  // Input states
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup);
  const [allergies, setAllergies] = useState(profile.criticalAllergies.join(', '));
  const [conditions, setConditions] = useState(profile.criticalConditions.join(', '));
  const [medications, setMedications] = useState(profile.emergencyMedications.join(', '));
  const [doctorName, setDoctorName] = useState(profile.doctorContact.name);
  const [doctorPhone, setDoctorPhone] = useState(profile.doctorContact.phone);
  const [doctorClinic, setDoctorClinic] = useState(profile.doctorContact.clinic);
  const [insuranceProvider, setInsuranceProvider] = useState(profile.insuranceInfo.provider);
  const [insurancePolicy, setInsurancePolicy] = useState(profile.insuranceInfo.policyNumber);
  const [medicalNotes, setMedicalNotes] = useState(profile.detailedMedicalNotes);

  // Permission states
  const [allowBasicSharing, setAllowBasicSharing] = useState(profile.permissions.allowBasicMedicalSharing);
  const [shareBloodGroup, setShareBloodGroup] = useState(profile.permissions.shareBloodGroup);
  const [shareAllergies, setShareAllergies] = useState(profile.permissions.shareAllergies);
  const [shareConditions, setShareConditions] = useState(profile.permissions.shareConditions);
  const [shareEmergencyMeds, setShareEmergencyMeds] = useState(profile.permissions.shareEmergencyMeds);
  const [doctorAccess, setDoctorAccess] = useState(profile.permissions.doctorContactAccess);
  const [insuranceAccess, setInsuranceAccess] = useState(profile.permissions.insuranceAccess);
  const [notesAccess, setNotesAccess] = useState(profile.permissions.medicalNotesAccess);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = medicalService.updateProfile({
      bloodGroup,
      criticalAllergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
      criticalConditions: conditions.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyMedications: medications.split(',').map((s) => s.trim()).filter(Boolean),
      doctorContact: {
        name: doctorName,
        phone: doctorPhone,
        clinic: doctorClinic
      },
      insuranceInfo: {
        provider: insuranceProvider,
        policyNumber: insurancePolicy,
        validTill: profile.insuranceInfo.validTill
      },
      detailedMedicalNotes: medicalNotes,
      permissions: {
        allowBasicMedicalSharing: allowBasicSharing,
        shareBloodGroup,
        shareAllergies,
        shareConditions,
        shareEmergencyMeds,
        doctorContactAccess: doctorAccess,
        insuranceAccess,
        medicalNotesAccess: notesAccess
      }
    });

    setProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const helperPreview = medicalService.getEmergencySummaryForHelpers(true);

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#C0392B] flex items-center justify-center flex-shrink-0">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.medicalProfile}
            </h1>
            <p className="text-xs text-slate-500">
              Encrypted, granular privacy controls with minimum emergency disclosure
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('EDIT')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'EDIT' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('PREVIEW')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'PREVIEW' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Helper Preview
          </button>
        </div>
      </div>

      {/* Core Medical Privacy Principle Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-[#1F497D] text-white p-5 rounded-3xl shadow-sm flex items-start gap-3.5">
        <Shield className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h3 className="font-extrabold text-sm text-emerald-300 uppercase tracking-wider">
            «"Share the minimum medical information necessary to help during an emergency."»
          </h3>
          <p className="text-slate-200 leading-relaxed">
            Unlike traditional apps that broadcast your entire health file, LOCURA strips sensitive insurance, doctor records, and private notes. Nearby verified helpers receive <strong>only</strong> vital emergency alerts when you explicitly allow them.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Medical profile and privacy visibility permissions updated successfully!
        </div>
      )}

      {activeTab === 'EDIT' ? (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Master Helper Sharing Switch */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-rose-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚨</span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {t.masterMedicalToggle}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t.masterMedicalSubtext}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={allowBasicSharing}
                  onChange={(e) => setAllowBasicSharing(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3A7D5C]"></div>
              </label>
            </div>
          </div>

          {/* Section 1: Basic Emergency Information (Eligible for Helper Sharing) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#C0392B] bg-rose-50 px-2.5 py-0.5 rounded-full">
                Level 2 Emergency Data
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                {t.basicEmergencyInfo}
              </h3>
              <p className="text-xs text-slate-500">
                Configure individual sharing permissions for verified community responders
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Blood Group */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    🩸 {t.bloodGroup}
                  </label>
                  <label className="text-[11px] flex items-center gap-1.5 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareBloodGroup}
                      onChange={(e) => setShareBloodGroup(e.target.checked)}
                      className="rounded text-[#0B5563] focus:ring-0"
                    />
                    <span>Share on SOS</span>
                  </label>
                </div>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-200 focus:ring-1 focus:ring-[#1F497D]"
                >
                  {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Critical Allergies */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    ⚠️ {t.allergies}
                  </label>
                  <label className="text-[11px] flex items-center gap-1.5 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareAllergies}
                      onChange={(e) => setShareAllergies(e.target.checked)}
                      className="rounded text-[#0B5563] focus:ring-0"
                    />
                    <span>Share on SOS</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts, Latex"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>

              {/* Critical Medical Conditions */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    🫀 {t.chronicConditions}
                  </label>
                  <label className="text-[11px] flex items-center gap-1.5 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareConditions}
                      onChange={(e) => setShareConditions(e.target.checked)}
                      className="rounded text-[#0B5563] focus:ring-0"
                    />
                    <span>Share on SOS</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Mild Asthma, Epilepsy, Type 1 Diabetes"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>

              {/* Emergency Medications */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    💊 {t.medications}
                  </label>
                  <label className="text-[11px] flex items-center gap-1.5 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={shareEmergencyMeds}
                      onChange={(e) => setShareEmergencyMeds(e.target.checked)}
                      className="rounded text-[#0B5563] focus:ring-0"
                    />
                    <span>Share Alert</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Salbutamol Inhaler, Insulin"
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Strictly Protected Private Information */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
                <Lock className="w-3 h-3 text-slate-500" />
                Level 1 / 3 Protected Data
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">
                {t.protectedPrivateInfo}
              </h3>
              <p className="text-xs text-slate-500">
                These fields are NEVER broadcast to nearby helpers. Accessible only by trusted contacts or with authorized responder tokens.
              </p>
            </div>

            <div className="space-y-4">
              
              {/* Emergency Doctor Contact */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    👨‍⚕️ {t.physicianContact}
                  </label>
                  <select
                    value={doctorAccess}
                    onChange={(e: any) => setDoctorAccess(e.target.value)}
                    className="text-[11px] font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1"
                  >
                    <option value="trusted_only">Trusted Contacts Only</option>
                    <option value="responder_only">Emergency Hospital Only</option>
                    <option value="private">Private (Only Me)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Doctor Name"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    className="text-xs p-2.5 bg-white rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Phone (+91...)"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    className="text-xs p-2.5 bg-white rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Hospital / Clinic"
                    value={doctorClinic}
                    onChange={(e) => setDoctorClinic(e.target.value)}
                    className="text-xs p-2.5 bg-white rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Insurance Information */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    🛡️ {t.insurancePolicy}
                  </label>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    🔒 Strictly Private
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Insurance Provider"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    className="text-xs p-2.5 bg-white rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    placeholder="Policy Number"
                    value={insurancePolicy}
                    onChange={(e) => setInsurancePolicy(e.target.value)}
                    className="text-xs p-2.5 bg-white rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Detailed Medical Notes */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    📝 {t.clinicalNotes}
                  </label>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded">
                    🔒 Strictly Private
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Private instructions, pouch location, past surgery history..."
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200"
                />
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#1F497D] hover:bg-slate-900 text-white font-extrabold rounded-2xl text-xs shadow-md flex items-center gap-2 transition-all active:scale-98"
            >
              <Save className="w-4 h-4" />
              {t.saveMedicalConfig}
            </button>
          </div>

        </form>
      ) : (
        /* Helper Live Preview Section */
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Audited Simulation
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                Verified Helper Emergency Screen Preview
              </h3>
              <p className="text-xs text-slate-500">
                This exact view is what nearby verified volunteers see when you activate SOS
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-[#0B5563] flex items-center justify-center font-bold">
              👁️
            </div>
          </div>

          {/* Mock Helper Alert Box */}
          <div className="max-w-md mx-auto p-5 rounded-3xl bg-slate-900 text-white shadow-2xl border-2 border-teal-500/50 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-rose-500 font-extrabold text-xs animate-pulse">● LIVE ALERT</span>
                <span className="text-xs text-slate-400">0.8 km away</span>
              </div>
              <span className="text-[10px] bg-teal-900/80 text-teal-300 font-mono px-2 py-0.5 rounded">
                HELPER VIEW
              </span>
            </div>

            <div>
              <div className="text-xs text-slate-400">User: <strong className="text-white">Ananya</strong> (First Name Only)</div>
              <div className="text-sm font-extrabold text-rose-400 mt-0.5">Emergency: Medical Emergency</div>
            </div>

            {/* Basic Medical Summary Box */}
            <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-2">
              <div className="text-xs font-black uppercase text-teal-400 tracking-wider">
                🚨 Emergency Medical Information
              </div>

              {allowBasicSharing ? (
                <div className="space-y-1.5 text-xs text-slate-200">
                  {shareBloodGroup && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Blood Group:</span>
                      <span className="font-extrabold text-rose-400 font-mono">{bloodGroup}</span>
                    </div>
                  )}
                  {shareAllergies && allergies && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Critical Allergy:</span>
                      <span className="font-bold text-amber-300">{allergies}</span>
                    </div>
                  )}
                  {shareEmergencyMeds && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Medication Alert:</span>
                      <span className="font-bold text-emerald-400">Yes (Carry Alert)</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic py-1">
                  "Medical information unavailable. Contact emergency services."
                </div>
              )}

              <div className="text-[10px] text-slate-400 italic pt-2 border-t border-slate-700/60">
                Only basic emergency medical information is shown.
              </div>
            </div>

            {/* Privacy Redaction Guarantee */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-300 font-bold flex items-center gap-1">
                <span>🛡️ Redacted for Safety:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500">
                <li>Insurance Policy ({insuranceProvider}): Hidden</li>
                <li>Physician Contact ({doctorName}): Hidden</li>
                <li>Full Clinical History & Notes: Encrypted / Hidden</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
