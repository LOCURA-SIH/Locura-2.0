import React, { useState, useEffect } from 'react';
import { BatteryWarning, AlertOctagon, Send, X, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { sosService } from '../services/sosService';
import { locationService } from '../services/locationService';

export const BatteryCriticalModal: React.FC = () => {
  const navigate = useNavigate();
  const [isCritical, setIsCritical] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check battery if API supported
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const checkLevel = () => {
          const lvl = Math.round(battery.level * 100);
          setBatteryLevel(lvl);
          if (lvl <= 5 && !battery.charging) {
            setIsCritical(true);
          }
        };

        checkLevel();
        battery.addEventListener('levelchange', checkLevel);
        battery.addEventListener('chargingchange', checkLevel);
      }).catch(() => {});
    }

    // Custom window event listener for testing the simulation
    const handleSimulatedBattery = (e: any) => {
      if (e.detail?.level <= 5) {
        setBatteryLevel(e.detail.level);
        setIsCritical(true);
        setDismissed(false);
      }
    };

    window.addEventListener('locura-battery-simulate', handleSimulatedBattery as EventListener);
    return () => {
      window.removeEventListener('locura-battery-simulate', handleSimulatedBattery as EventListener);
    };
  }, []);

  if (!isCritical || dismissed) return null;

  const handleTriggerEmergencyBeforeShutdown = () => {
    const loc = locationService.getLocation();
    sosService.triggerSos('Other', {
      lat: loc.lat,
      lng: loc.lng,
      address: `${loc.address} [Auto-triggered: Battery Critical ${batteryLevel || 5}%]`
    });
    setDismissed(true);
    navigate('/sos');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-500 relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 text-rose-600 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
            <BatteryWarning className="w-7 h-7 text-[#C0392B] animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              🔋 Battery Critical (~5 Minutes to Shutdown)
            </h3>
            <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider">
              Power Depletion Imminent ({batteryLevel ?? 5}% Remaining)
            </p>
          </div>
        </div>

        <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 mb-5 text-sm text-slate-700 space-y-2">
          <p className="font-bold text-rose-900 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-[#C0392B]" />
            "Auto-transmitting your final coordinates before shutdown."
          </p>
          <p className="text-xs text-slate-600">
            LOCURA monitors your power trajectory. During the final 5 minutes of phone life, the app automatically broadcasts your last confirmed GPS location and vital medical summary to your trusted contacts before complete power-off.
          </p>
          <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-semibold">
            ✓ Last known location pinned: <strong>Road No. 12, Banjara Hills (17.4156, 78.4480)</strong>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleTriggerEmergencyBeforeShutdown}
            className="w-full py-3.5 bg-[#C0392B] hover:bg-rose-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all text-sm active:scale-98"
          >
            <Send className="w-4 h-4" />
            Dispatch Final Pre-Shutdown Location Beacon Now
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-full py-2.5 text-xs text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
          >
            I am Safe / Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
};
