import React from 'react';
import { Phone, Shield, HeartPulse, Flame, Users, MapPin, AlertCircle, ExternalLink } from 'lucide-react';
import { EMERGENCY_SERVICES } from '../data/mockData';

export const EmergencyServicesPage: React.FC = () => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Police': return <Shield className="w-6 h-6 text-blue-600" />;
      case 'Medical': return <HeartPulse className="w-6 h-6 text-rose-600" />;
      case 'Fire': return <Flame className="w-6 h-6 text-orange-600" />;
      case 'Women': return <Users className="w-6 h-6 text-purple-600" />;
      case 'Tourist': return <MapPin className="w-6 h-6 text-teal-600" />;
      default: return <Phone className="w-6 h-6 text-[#C0392B]" />;
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#C0392B] flex items-center justify-center flex-shrink-0">
          <Phone className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Emergency Services Directory
          </h1>
          <p className="text-xs text-slate-500">
            Verified emergency responder helplines with direct one-tap telephone dialer access
          </p>
        </div>
      </div>

      {/* Honest Transparency Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-xs text-amber-900 flex items-start gap-3.5">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-sm font-bold block">
            Direct Dialer Transparency Statement
          </strong>
          <p className="text-amber-800 leading-relaxed">
            In compliance with emergency communication standards, the buttons below trigger your phone's native telephony application using standard <code>tel:</code> protocols. LOCURA does not misrepresent simulated web requests as automated government emergency dispatches until direct civic API access is legally provisioned.
          </p>
        </div>
      </div>

      {/* Grid of Emergency Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EMERGENCY_SERVICES.map((srv) => (
          <div
            key={srv.number}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0">
                {getIcon(srv.category)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">{srv.name}</h3>
                </div>
                <div className="text-xl font-black text-[#C0392B] font-mono mt-0.5">
                  {srv.number}
                </div>
                <p className="text-xs text-slate-500 mt-1">{srv.description}</p>
              </div>
            </div>

            <a
              href={`tel:${srv.number}`}
              className="w-full py-3 bg-[#1F497D] hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-98"
            >
              <Phone className="w-4 h-4" />
              Dial {srv.number} Immediately
            </a>
          </div>
        ))}
      </div>

    </div>
  );
};
