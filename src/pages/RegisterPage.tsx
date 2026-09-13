import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';
import { UserRole } from '../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('USER');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    authService.register(name, email, phone, role);
    if (role === 'HELPER') navigate('/helper-dashboard');
    else navigate('/dashboard');
  };

  return (
    <div className="min-h-screen pb-20 pt-10 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#1F497D] to-[#0B5563] text-white flex items-center justify-center mx-auto shadow-lg">
            <Shield className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create LOCURA Account
          </h1>
          <p className="text-xs text-slate-500">
            Join the decentralized community emergency safety circle
          </p>
        </div>

        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Role Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Your Primary Role:</label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { r: 'USER', label: 'Traveler / User', icon: '👤' },
                    { r: 'HELPER', label: 'Helper Volunteer', icon: '🩹' }
                  ] as const
                ).map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => setRole(item.r)}
                    className={`p-2.5 text-left rounded-2xl border text-xs font-bold transition-all ${
                      role === item.r
                        ? 'bg-[#1F497D] text-white border-[#1F497D] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="block text-base">{item.icon}</span>
                    <span className="text-[11px] block mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Meera Nambiar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="meera@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number (For SOS Verification)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98450 11223"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs pl-10 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1F497D]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#1F497D] hover:bg-slate-900 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>Register & Enter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">Already registered? </span>
            <Link to="/login" className="text-xs font-bold text-[#0B5563] hover:underline">
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
