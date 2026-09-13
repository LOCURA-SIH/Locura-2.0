import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowRight, UserCheck, HeartHandshake, Lock, Mail, AlertCircle, Compass, Radio } from 'lucide-react';
import { authService } from '../services/authService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCustomLogin, setShowCustomLogin] = useState(false);

  const handleEnterAsTraveler = () => {
    authService.loginAsTraveler();
    navigate('/dashboard');
  };

  const handleEnterAsHelper = () => {
    authService.loginAsHelper();
    navigate('/dashboard');
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = authService.login(email);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-teal-50/30 pb-20 pt-10 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in duration-300">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-[#1F497D] to-[#0B5563] text-white flex items-center justify-center mx-auto shadow-xl ring-4 ring-white">
            <Shield className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              LOCURA 2.0
            </h1>
            <p className="text-sm font-semibold text-[#0B5563] tracking-wide mt-0.5">
              Intelligent Community Emergency Safety Network
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-2">
              Select your role below to enter the safety platform. All features, live tracking, and emergency coordination are ready.
            </p>
          </div>
        </div>

        {/* 🚪 2 SEPARATE ENTRY PORTALS (Addresses Requirement 3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Portal 1: Traveler Entry */}
          <div
            onClick={handleEnterAsTraveler}
            className="bg-white hover:bg-rose-50/40 p-6 sm:p-7 rounded-3xl border-2 border-rose-200 hover:border-[#C0392B] shadow-lg hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-5 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-100/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#C0392B] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-[#C0392B] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  ROLE 1 • TRAVELER & CITIZEN
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  Enter as Traveler
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  For solo travelers, women, elderly commuters, or anyone in unfamiliar areas. Access Instant SOS, Safe Route, and Emergency Circles.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1F497D] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  A
                </div>
                <div>
                  <div className="font-bold text-slate-900">Ananya Sharma</div>
                  <div className="text-[10px] text-slate-400">Solo Traveler • Hyderabad Zone</div>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEnterAsTraveler();
              }}
              className="w-full py-3.5 bg-[#C0392B] hover:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all group-hover:shadow-rose-600/30"
            >
              <span>ENTER AS TRAVELER</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Portal 2: Helper Entry */}
          <div
            onClick={handleEnterAsHelper}
            className="bg-white hover:bg-teal-50/40 p-6 sm:p-7 rounded-3xl border-2 border-teal-200 hover:border-[#0B5563] shadow-lg hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-5 text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-100/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none" />

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#0B5563] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-[#0B5563] px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                  ROLE 2 • VERIFIED RESPONDER
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  Enter as Verified Helper
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  For first-aid responders, CPR certified volunteers, and community guardians to receive nearby emergency SOS alerts.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0B5563] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  R
                </div>
                <div>
                  <div className="font-bold text-slate-900">Ravi Kumar</div>
                  <div className="text-[10px] text-slate-400">First Aid Certified • 0.8 km Proximity</div>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEnterAsHelper();
              }}
              className="w-full py-3.5 bg-[#0B5563] hover:bg-teal-800 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all group-hover:shadow-teal-600/30"
            >
              <span>ENTER AS HELPER</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </div>

        {/* Collapsible Custom Sign In / Registration Form */}
        <div className="text-center pt-2">
          {!showCustomLogin ? (
            <button
              onClick={() => setShowCustomLogin(true)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              Or sign in with custom email / password →
            </button>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto text-left space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Direct Email Login</h3>
                <button
                  onClick={() => setShowCustomLogin(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕ Close
                </button>
              </div>

              <form onSubmit={handleCustomLogin} className="space-y-3">
                {error && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. ananya.traveler@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#1F497D] hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Sign In
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">Need a new account? </span>
                <Link to="/register" className="font-bold text-[#0B5563] hover:underline">
                  Register here
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
