import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, MapPin, Camera, CheckCircle2, Filter, ShieldAlert, Sparkles } from 'lucide-react';
import { incidentService } from '../services/incidentService';
import { locationService } from '../services/locationService';
import { authService } from '../services/authService';
import { IncidentReport, IncidentCategory } from '../types';
import { formatTimestamp } from '../utils/geo';

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentReport[]>(incidentService.getAllIncidents());
  const [user, setUser] = useState(authService.getCurrentUser());
  const [location, setLocation] = useState(locationService.getLocation());

  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<IncidentCategory>('Accident');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  useEffect(() => {
    const unsubInc = incidentService.subscribe((inc) => setIncidents(inc));
    const unsubLoc = locationService.subscribe((loc) => setLocation(loc));
    return () => {
      unsubInc();
      unsubLoc();
    };
  }, []);

  // Simple rule-based classification assistant
  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    const lower = text.toLowerCase();
    if (lower.includes('water') || lower.includes('flood') || lower.includes('drain')) {
      setType('Flood');
      setSeverity('HIGH');
    } else if (lower.includes('fire') || lower.includes('smoke') || lower.includes('burn')) {
      setType('Fire');
      setSeverity('CRITICAL');
    } else if (lower.includes('crash') || lower.includes('collision') || lower.includes('bike') || lower.includes('car')) {
      setType('Accident');
      setSeverity('HIGH');
    } else if (lower.includes('dark') || lower.includes('light') || lower.includes('pothole') || lower.includes('road')) {
      setType('Unsafe Road');
      setSeverity('MEDIUM');
    } else if (lower.includes('harass') || lower.includes('stalk') || lower.includes('threat')) {
      setType('Harassment');
      setSeverity('HIGH');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    incidentService.reportIncident({
      type,
      title,
      description,
      severity,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address
      },
      photoUrl: photoPreview || undefined,
      reportedBy: user?.id || 'anon-user',
      reportedByName: user?.name || 'Community Member'
    });

    setTitle('');
    setDescription('');
    setPhotoPreview(null);
    setShowModal(false);
  };

  const categories: IncidentCategory[] = [
    'Accident',
    'Flood',
    'Fire',
    'Unsafe Road',
    'Harassment',
    'Suspicious Activity',
    'Medical Emergency',
    'Other Hazard'
  ];

  const filtered = incidents.filter((i) => {
    if (filterCategory !== 'ALL' && i.type !== filterCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#E8743B] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Community Incident Reports
            </h1>
            <p className="text-xs text-slate-500">
              Real-time crowdsourced safety warnings and hazard tracking
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-[#C0392B] hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Report New Incident
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
            filterCategory === 'ALL'
              ? 'bg-[#1F497D] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Incidents ({incidents.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-[#1F497D] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Incident Cards */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isCritical = item.severity === 'CRITICAL' || item.severity === 'HIGH';
          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                    {item.type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.severity} Severity
                  </span>
                  {item.verified && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-mono">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
              </div>

              {item.photoUrl && (
                <div className="w-32 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                  <img src={item.photoUrl} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#0B5563]" />
                  {item.location.address}
                </span>
                <span className="text-[10px] text-slate-400">
                  Reported by: <strong>{item.reportedByName}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Incident Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#E8743B]" />
                <h3 className="font-extrabold text-lg text-slate-900">
                  Submit Incident Report
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Incident Category</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fallen electrical cable blocking road..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                />
              </div>

              {/* Description with intelligent classification */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Detailed Description</label>
                  <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#0B5563]" /> Auto-classifying
                  </span>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe hazard, landmarks, vehicle involvement, water level..."
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                />
              </div>

              {/* Severity */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Severity Assessment</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${
                        severity === s
                          ? 'bg-[#1F497D] text-white border-[#1F497D]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload Simulation */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Photo Evidence (Optional)</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors">
                    <Camera className="w-4 h-4 text-slate-500" />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {photoPreview && (
                    <span className="text-xs text-emerald-600 font-semibold">
                      ✓ Image attached
                    </span>
                  )}
                </div>
              </div>

              {/* Location Stamp */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0B5563]" />
                <span>Auto-tagging location: <strong>{location.address}</strong></span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C0392B] hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Publish Report
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
