import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Wifi,
  WifiOff,
  BatteryMedium,
  ChevronDown,
  LogOut,
  Globe,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { authService } from '../services/authService';
import { sosService } from '../services/sosService';
import { UserProfile, SosAlert } from '../types';
import { useTranslation, LanguageCode } from '../utils/i18n';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, currentLanguage, setLanguage } = useTranslation();

  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [activeSos, setActiveSos] = useState<SosAlert | null>(sosService.getActiveSos());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(84);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const unsubAuth = authService.subscribe((u) => setUser(u));
    const unsubSos = sosService.subscribe((sos) => setActiveSos(sos));

    const handleOnline = () => {
      if (!isSimulatedOffline) setIsOnline(true);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery API detection
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      }).catch(() => {});
    }

    return () => {
      unsubAuth();
      unsubSos();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline]);

  const allUsers = authService.getAllUsers();

  const handleSwitchPersona = (id: string) => {
    authService.switchPersona(id);
    setShowPersonaMenu(false);
    const targetUser = allUsers.find((u) => u.id === id);
    if (targetUser?.role === 'HELPER') {
      navigate('/helper-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleToggleOfflineSimulation = () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    setIsOnline(!nextState);
    window.dispatchEvent(new CustomEvent('locura-offline-toggle', { detail: { isOffline: nextState } }));
  };

  const handleLogout = () => {
    authService.logout();
    setShowPersonaMenu(false);
    navigate('/login');
  };

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
    { code: 'es', label: 'Español', flag: '🇪🇸' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1F497D] to-[#0B5563] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#1F497D] to-[#0B5563] bg-clip-text text-transparent">
                  LOCURA <span className="text-[#C0392B]">2.0</span>
                </span>
                <span className="hidden sm:block text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                  {t.tagline}
                </span>
              </div>
            </Link>

            {/* Live Safety Status Indicator */}
            {activeSos ? (
              <Link
                to="/sos"
                className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full animate-pulse border border-rose-300 shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-[#C0392B] animate-ping" />
                <span>🚨 {t.sosActive}</span>
              </Link>
            ) : (
              <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#3A7D5C]" />
                <span>🟢 {t.youAreSafe}</span>
              </div>
            )}
          </div>

          {/* Center Navigation Links (Desktop) - (Safety Map & Admin Completely Removed) */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-slate-100 text-[#1F497D] font-bold'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.dashboard}
            </Link>
            <Link
              to="/safe-route"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/safe-route'
                  ? 'bg-slate-100 text-[#1F497D] font-bold'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.safeRoute}
            </Link>
            <Link
              to="/medical-profile"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/medical-profile'
                  ? 'bg-slate-100 text-[#1F497D] font-bold'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.medicalProfile}
            </Link>
            <Link
              to="/helpers"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                location.pathname === '/helpers'
                  ? 'bg-slate-100 text-[#1F497D] font-bold'
                  : 'hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {t.helpers}
            </Link>
            {user?.role === 'HELPER' && (
              <Link
                to="/helper-dashboard"
                className="px-3 py-1.5 bg-teal-50 text-[#0B5563] font-bold rounded-lg border border-teal-200 hover:bg-teal-100 transition-colors"
              >
                Helper Station
              </Link>
            )}
          </nav>

          {/* Right Actions: Language Selector, Offline Simulator, Battery, Persona */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 🌐 Multi-Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs"
                title="Switch Application Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#0B5563]" />
                <span className="uppercase">{currentLanguage}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                        currentLanguage === lang.code
                          ? 'bg-slate-100 font-extrabold text-[#1F497D]'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{lang.flag} {lang.label}</span>
                      {currentLanguage === lang.code && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ⚡ Dual-Mode Network Status Indicator & Toggle */}
            <button
              onClick={handleToggleOfflineSimulation}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                !isOnline
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Toggle between Online Cloud and Offline Resilience Mode"
            >
              {!isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span className="hidden sm:inline">Offline Mode</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Online</span>
                </>
              )}
            </button>

            {/* Battery Indicator (5% warning) */}
            {batteryLevel !== null && (
              <div
                className={`hidden sm:flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
                  batteryLevel <= 15 ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-600'
                }`}
                title={`Device Battery: ${batteryLevel}%`}
              >
                <BatteryMedium className={`w-3.5 h-3.5 ${batteryLevel <= 15 ? 'text-[#C0392B]' : 'text-slate-500'}`} />
                <span>{batteryLevel}%</span>
              </div>
            )}

            {/* Quick Log Out Button on Desktop */}
            {user && (
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all shadow-2xs"
                title="Log Out of your current session"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Log Out</span>
              </button>
            )}

            {/* Persona Switcher (Admin Completely Removed) */}
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all text-left"
                aria-label="Switch Persona"
              >
                <div className="w-7 h-7 rounded-full bg-[#1F497D] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                  {user ? user.name.charAt(0) : '?'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {user?.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Persona Switcher Dropdown */}
              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                      Demo Persona Switcher
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Switch between Solo Traveler and Verified Helper
                    </p>
                  </div>

                  <div className="py-1">
                    {allUsers.map((u) => {
                      const isSelected = u.id === user?.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSwitchPersona(u.id)}
                          className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-slate-100' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              {u.name}
                              {isSelected && <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">Active</span>}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {u.badge} • <span className="font-semibold text-slate-700">{u.role}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="border-t border-slate-100 pt-1.5 px-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Log Out of Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
