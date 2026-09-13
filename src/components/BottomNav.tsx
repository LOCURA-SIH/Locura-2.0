import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Navigation, ShieldAlert, HeartPulse, Users } from 'lucide-react';
import { sosService } from '../services/sosService';
import { useTranslation } from '../utils/i18n';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const activeSos = sosService.getActiveSos();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1 safe-area-pb">
      <div className="flex items-center justify-around">
        
        {/* Dashboard */}
        <Link
          to="/dashboard"
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            isActive('/dashboard') ? 'text-[#1F497D] font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.dashboard}</span>
        </Link>

        {/* Safe Route */}
        <Link
          to="/safe-route"
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            isActive('/safe-route') ? 'text-[#1F497D] font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Navigation className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.safeRoute}</span>
        </Link>

        {/* SOS Button (Center highlight) */}
        <Link
          to="/sos"
          className="flex flex-col items-center -mt-5 group"
          aria-label="Emergency SOS"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 ${
              activeSos
                ? 'bg-[#C0392B] animate-sos-pulse ring-4 ring-rose-300'
                : 'bg-gradient-to-tr from-[#C0392B] to-rose-600 ring-4 ring-white'
            }`}
          >
            <ShieldAlert className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-extrabold text-[#C0392B] mt-1 tracking-wider uppercase">
            {activeSos ? 'ACTIVE' : t.sos}
          </span>
        </Link>

        {/* Medical Profile */}
        <Link
          to="/medical-profile"
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            isActive('/medical-profile') ? 'text-[#1F497D] font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <HeartPulse className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.medicalProfile.split(' ')[0]}</span>
        </Link>

        {/* Verified Helpers */}
        <Link
          to="/helpers"
          className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all ${
            isActive('/helpers') ? 'text-[#1F497D] font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.helpers.split(' ')[0]}</span>
        </Link>

      </div>
    </nav>
  );
};
