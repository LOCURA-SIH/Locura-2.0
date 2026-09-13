import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, CheckCircle2, Star, MapPin, Users, FileText } from 'lucide-react';
import { sosService } from '../services/sosService';
import { SosAlert } from '../types';
import { formatTimestamp } from '../utils/geo';

export const SosHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<SosAlert[]>(sosService.getHistory());

  useEffect(() => {
    const unsub = sosService.subscribe(() => {
      setHistory(sosService.getHistory());
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-[#1F497D] flex items-center justify-center flex-shrink-0">
          <Clock className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Emergency SOS History
          </h1>
          <p className="text-xs text-slate-500">
            Chronological audit log of activated emergencies, volunteer rescues, and resolution outcomes
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-sm text-slate-800">No Past Emergency Records</h3>
          <p className="text-xs text-slate-500">You have zero triggered SOS emergencies on file.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <div
              key={record.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-rose-100 text-[#C0392B] flex items-center justify-center font-bold text-sm">
                    🚨
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      {record.emergencyType}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatTimestamp(record.createdAt)}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${
                    record.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ✓ {record.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Incident Location</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#0B5563]" />
                    {record.location.address}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Verified Responders</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-[#1F497D]" />
                    {record.acceptedHelpers.length} helper(s) arrived
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Contacts Alerted</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {record.trustedContactsNotified.length} Family/Friends
                  </span>
                </div>
              </div>

              {/* Resolution Notes & Rating */}
              {record.resolutionNotes && (
                <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Resolution Outcome:</span>
                    {record.helperRating && (
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {record.helperRating} / 5 Rating Given
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 italic">"{record.resolutionNotes}"</p>
                  {record.helperFeedback && (
                    <p className="text-[11px] text-slate-500">
                      <strong>Volunteer Feedback:</strong> {record.helperFeedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
