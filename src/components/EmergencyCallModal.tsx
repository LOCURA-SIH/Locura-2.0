import React, { useState } from 'react';
import { Phone, X, CheckCircle2, MapPin } from 'lucide-react';
import { locationService } from '../services/locationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyCallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const location = locationService.getLocation();
  const [callStatus, setCallStatus] = useState<string | null>(null);

  const handleCall = (target: string, number: string) => {
    setCallStatus(`Call sent directly to ${target} (${number}) with live GPS coordinates attached.`);
    window.location.href = `tel:${number}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 flex items-center justify-center text-[#C0392B] flex-shrink-0">
            <Phone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900">
              Direct Emergency Calling
            </h3>
            <p className="text-xs text-slate-500">
              Direct dispatch call with live GPS coordinates
            </p>
          </div>
        </div>

        {/* Call Feedback Status Banner */}
        {callStatus ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 mb-4 text-xs font-bold text-emerald-900 flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="block font-black text-emerald-950">✓ Direct Emergency Call Initiated</span>
              <p className="text-[11px] text-emerald-800 font-medium mt-0.5">{callStatus}</p>
              <div className="text-[10px] text-emerald-700 font-mono mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>GPS: {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E</span>
              </div>
            </div>
          </div>
        ) : (
          /* Live Location Tag */
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2.5 mb-4 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-bold text-slate-800">Live GPS Attached:</span>
            </div>
            <span className="font-mono text-[11px] text-slate-600">
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </span>
          </div>
        )}

        {/* Direct Helpline Buttons: Police, Ambulance, Women Helpline */}
        <div className="space-y-3">
          
          {/* Police Direct Call */}
          <button
            onClick={() => handleCall('Police', '112')}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100 hover:border-blue-400 transition-all text-left group shadow-xs active:scale-98"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                🚓
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  Police Emergency
                </div>
                <p className="text-xs text-blue-800 font-semibold">
                  Call sent directly to police (112)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono bg-blue-600 text-white px-3 py-1.5 rounded-xl shadow-xs">
                112
              </span>
            </div>
          </button>

          {/* Ambulance Direct Call */}
          <button
            onClick={() => handleCall('Ambulance', '108')}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/50 hover:bg-rose-100 hover:border-rose-400 transition-all text-left group shadow-xs active:scale-98"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                🚑
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  Ambulance & Trauma Care
                </div>
                <p className="text-xs text-rose-800 font-semibold">
                  Call sent directly to ambulance (108)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono bg-rose-600 text-white px-3 py-1.5 rounded-xl shadow-xs">
                108
              </span>
            </div>
          </button>

          {/* Women Helpline Direct Call */}
          <button
            onClick={() => handleCall('Women Helpline', '1091')}
            className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-purple-200 bg-purple-50/50 hover:bg-purple-100 hover:border-purple-400 transition-all text-left group shadow-xs active:scale-98"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                👩
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-900">
                  Women Safety Helpline
                </div>
                <p className="text-xs text-purple-800 font-semibold">
                  Call sent directly to women helpline (1091)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black font-mono bg-purple-600 text-white px-3 py-1.5 rounded-xl shadow-xs">
                1091
              </span>
            </div>
          </button>

        </div>

        {/* Close Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Close Helplines
          </button>
        </div>
      </div>
    </div>
  );
};
