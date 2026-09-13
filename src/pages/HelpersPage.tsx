import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Star, MapPin, Award, Search, Filter, Phone, CheckCircle } from 'lucide-react';
import { helperService } from '../services/helperService';
import { HelperProfile } from '../types';

export const HelpersPage: React.FC = () => {
  const [helpers, setHelpers] = useState<HelperProfile[]>(helperService.getAllHelpers());
  const [filter, setFilter] = useState<'ALL' | 'VERIFIED' | 'AVAILABLE'>('VERIFIED');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = helperService.subscribe((h) => setHelpers(h));
    return () => unsub();
  }, []);

  const filtered = helpers.filter((h) => {
    if (filter === 'VERIFIED' && h.verificationStatus !== 'Verified') return false;
    if (filter === 'AVAILABLE' && (!h.available || h.verificationStatus !== 'Verified')) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        h.name.toLowerCase().includes(q) ||
        h.skills.some((s) => s.toLowerCase().includes(q)) ||
        h.languages.some((l) => l.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#0B5563] flex items-center justify-center flex-shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Verified Helper Network
            </h1>
            <p className="text-xs text-slate-500">
              Trained local volunteers, campus security, and first responders in your area
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600 self-start md:self-auto">
          <button
            onClick={() => setFilter('VERIFIED')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'VERIFIED' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Verified Responders
          </button>
          <button
            onClick={() => setFilter('AVAILABLE')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'AVAILABLE' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Available Now
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            All Registered
          </button>
        </div>
      </div>

      {/* Trust & Safety Guarantee Banner */}
      <div className="bg-gradient-to-r from-[#1F497D] to-[#0B5563] text-white p-5 rounded-3xl shadow-sm flex items-start gap-3.5">
        <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h3 className="font-extrabold text-sm text-emerald-300 uppercase tracking-wider">
            Certified Volunteer Guarantee
          </h3>
          <p className="text-slate-200">
            Only <strong>certified & credential-verified volunteers</strong> receive SOS emergency alerts. LOCURA never exposes your emergency coordinates to anonymous strangers or unverified accounts.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Filter by volunteer name, skill (e.g. First Aid, CPR), or language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 shadow-2xs focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
        />
      </div>

      {/* Helper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((h) => (
          <div
            key={h.id}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0B5563] text-white flex items-center justify-center font-extrabold text-base shadow-sm">
                  {h.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-slate-900">{h.name}</h3>
                    {h.verificationStatus === 'Verified' ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                        <CheckCircle className="w-2.5 h-2.5" /> Verified
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                        {h.verificationStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#0B5563]" />
                    {h.distanceKm} km away • <span className="font-mono">{h.location.address}</span>
                  </p>
                </div>
              </div>

              {/* Trust Score Badge */}
              <div className="text-right">
                <span className="text-xs font-black text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {h.trustScore.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {h.responseHistoryCount} responses
                </span>
              </div>
            </div>

            {/* Skills & Languages */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {h.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold bg-teal-50 text-[#0B5563] px-2 py-0.5 rounded-md border border-teal-100 flex items-center gap-1"
                  >
                    <span>🩹</span> {skill}
                  </span>
                ))}
              </div>

              <div className="text-xs text-slate-600 flex items-center gap-1 pt-1 border-t border-slate-100">
                <span className="text-slate-400">🗣 Languages:</span>
                <span className="font-medium text-slate-800">{h.languages.join(', ')}</span>
              </div>
            </div>

            {/* Availability Footer */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    h.available ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                  }`}
                />
                <span className={`text-[11px] font-semibold ${h.available ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {h.available ? 'On Standby / Available' : 'Currently Offline'}
                </span>
              </div>

              <a
                href={`tel:${h.phone}`}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1"
              >
                <Phone className="w-3 h-3 text-[#0B5563]" />
                Contact Helper
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
