import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Star,
  Users,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
  Bell,
  ArrowRight
} from 'lucide-react';
import { authService } from '../services/authService';
import { helperService } from '../services/helperService';
import { sosService } from '../services/sosService';
import { HelperProfile, SosAlert } from '../types';

export const HelperDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [helpers, setHelpers] = useState<HelperProfile[]>(helperService.getAllHelpers());
  const [activeSos, setActiveSos] = useState<SosAlert | null>(sosService.getActiveSos());

  useEffect(() => {
    const unsubAuth = authService.subscribe((u) => setUser(u));
    const unsubHelp = helperService.subscribe((h) => setHelpers(h));
    const unsubSos = sosService.subscribe((s) => setActiveSos(s));
    return () => {
      unsubAuth();
      unsubHelp();
      unsubSos();
    };
  }, []);

  const currentHelper = helpers.find((h) => h.id === user?.id) || helpers[0];

  const handleToggleAvailability = () => {
    if (currentHelper) {
      helperService.toggleAvailability(currentHelper.id);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Helper Profile Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0B5563] text-white flex items-center justify-center font-black text-xl shadow-md">
            {currentHelper.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">
                {currentHelper.name}
              </h1>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                ✓ Verified Responder
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentHelper.skills.join(' • ')}
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Duty Status</span>
            <span className={`text-xs font-bold ${currentHelper.available ? 'text-emerald-700' : 'text-slate-500'}`}>
              {currentHelper.available ? '🟢 Ready for Missions' : '⚪ Offline'}
            </span>
          </div>
          <button
            onClick={handleToggleAvailability}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
              currentHelper.available
                ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                : 'bg-[#0B5563] text-white hover:bg-teal-800'
            }`}
          >
            {currentHelper.available ? 'Pause Duty' : 'Go On-Duty'}
          </button>
        </div>
      </div>

      {/* Trust Score & Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trust Score</span>
          <div className="flex items-center gap-1.5 text-xl font-black text-amber-500 mt-1">
            <Star className="w-5 h-5 fill-amber-400" />
            <span>{currentHelper.trustScore.toFixed(1)} / 5.0</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">+0.1 per verified rescue</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Successful Responses</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {currentHelper.responseHistoryCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">100% Reliability</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coverage Radius</span>
          <div className="text-xl font-black text-[#0B5563] mt-1">
            1.5 km
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Banjara Hills Sector</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Languages</span>
          <div className="text-xs font-bold text-slate-800 mt-1.5 line-clamp-1">
            {currentHelper.languages.join(', ')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Multi-lingual support</span>
        </div>
      </div>

      {/* 🚨 Active Emergency SOS Radar Section */}
      <div className="space-y-3">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#C0392B]" />
          Active Incident Radar
        </h2>

        {activeSos ? (
          <div className="bg-gradient-to-r from-rose-50 to-white p-6 rounded-3xl border-2 border-rose-300 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-extrabold text-2xl flex-shrink-0 animate-pulse">
                🚨
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded">
                    EMERGENCY NEARBY
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    ~0.8 km from your standby location
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  {activeSos.emergencyType} • Patient: {activeSos.userName.split(' ')[0]}
                </h3>
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0B5563]" />
                  {activeSos.location.address}
                </p>
              </div>
            </div>

            <Link
              to="/helper-sos"
              className="px-6 py-3 bg-[#C0392B] hover:bg-rose-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all active:scale-98 self-start md:self-auto"
            >
              <span>RESPOND TO SOS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#3A7D5C] flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h3 className="font-bold text-sm text-slate-800">
              No Active Emergencies in Your Radius
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your device is on standby. When a traveler activates an SOS within 1.5 km, you will receive an instant acoustic dispatch alert with minimal emergency medical notes.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
