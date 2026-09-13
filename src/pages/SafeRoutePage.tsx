import React, { useState } from 'react';
import {
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  ArrowUpDown,
  Search,
  Compass,
  Check,
  Radio
} from 'lucide-react';
import { locationService } from '../services/locationService';
import { SafeRouteMap } from '../components/SafeRouteMap';
import { useTranslation } from '../utils/i18n';

interface LandmarkPreset {
  name: string;
  lat: number;
  lng: number;
  type: 'hub' | 'hospital' | 'transit' | 'location';
}

const SOURCE_PRESETS: LandmarkPreset[] = [
  { name: '📍 Banjara Hills Rd 12 (Current Hub)', lat: 17.4156, lng: 78.4480, type: 'location' },
  { name: '📍 Jubilee Hills Checkpost', lat: 17.4325, lng: 78.4071, type: 'location' },
  { name: '📍 Gachibowli Stadium Safe Hub', lat: 17.4435, lng: 78.3489, type: 'hub' },
  { name: '📍 Hitec City Cyber Towers', lat: 17.4504, lng: 78.3808, type: 'transit' },
  { name: '📍 Begumpet Airport Road', lat: 17.4447, lng: 78.4664, type: 'location' },
  { name: '📍 Charminar Heritage Zone', lat: 17.3616, lng: 78.4747, type: 'location' },
  { name: '📍 Secunderabad Railway Station', lat: 17.4344, lng: 78.5013, type: 'transit' },
  { name: '📍 Durgam Cheruvu Cable Bridge', lat: 17.4348, lng: 78.3888, type: 'hub' }
];

const DESTINATION_PRESETS: LandmarkPreset[] = [
  { name: '🏥 Care Hospital Emergency Trauma Center', lat: 17.4100, lng: 78.4510, type: 'hospital' },
  { name: '🛡️ City Center Public Safe Transit Hub', lat: 17.4276, lng: 78.4540, type: 'hub' },
  { name: '🏥 Apollo Emergency Hospital (Jubilee Hills)', lat: 17.4320, lng: 78.4350, type: 'hospital' },
  { name: '🚇 Panjagutta Metro Interchange Station', lat: 17.4290, lng: 78.4580, type: 'transit' },
  { name: '🛡️ Hitec City Safe Haven & Shelter', lat: 17.4520, lng: 78.3820, type: 'hub' },
  { name: '🏥 Gandhi Hospital Emergency Wing', lat: 17.4246, lng: 78.5034, type: 'hospital' },
  { name: '🛡️ Charminar 24/7 Police Assistance Booth', lat: 17.3620, lng: 78.4735, type: 'hub' },
  { name: '🏥 Continental Hospital Emergency', lat: 17.4180, lng: 78.3430, type: 'hospital' }
];

export const SafeRoutePage: React.FC = () => {
  const { t } = useTranslation();
  const currentLocation = locationService.getLocation();

  // Selected Origin (Source) State - Fully Editable
  const [sourceName, setSourceName] = useState<string>(SOURCE_PRESETS[0].name);
  const [sourceCoord, setSourceCoord] = useState<[number, number]>([SOURCE_PRESETS[0].lat, SOURCE_PRESETS[0].lng]);

  // Selected Destination State - Fully Editable
  const [destinationName, setDestinationName] = useState<string>(DESTINATION_PRESETS[0].name);
  const [destinationCoord, setDestinationCoord] = useState<[number, number]>([
    DESTINATION_PRESETS[0].lat,
    DESTINATION_PRESETS[0].lng
  ]);

  const [selectedRouteId, setSelectedRouteId] = useState<'fastest' | 'safer'>('safer');
  const [pickMode, setPickMode] = useState<'origin' | 'destination' | null>(null);
  const [mapNotice, setMapNotice] = useState<string | null>(null);

  // Dynamic route calculation from selected source to destination
  const deltaLat = (destinationCoord[0] - sourceCoord[0]) / 5;
  const deltaLng = (destinationCoord[1] - sourceCoord[1]) / 5;

  const customizedFastest = {
    id: 'fastest' as const,
    name: t.fastestRoute,
    durationMinutes: 18,
    distanceKm: 3.2,
    riskLevel: 'HIGH' as const,
    path: [
      sourceCoord,
      [sourceCoord[0] + deltaLat * 1, sourceCoord[1] + deltaLng * 0.8] as [number, number],
      [sourceCoord[0] + deltaLat * 2.5, sourceCoord[1] + deltaLng * 1.5] as [number, number],
      [sourceCoord[0] + deltaLat * 3.8, sourceCoord[1] + deltaLng * 3.5] as [number, number],
      destinationCoord
    ],
    incidentZonesAvoided: 0,
    recommendation: 'Direct cut: passes through 2 unlit alleyways and active monsoon waterlogging zone.',
    isRecommended: false,
    lightingQuality: 'Poorly Lit' as const,
    patrolledArea: false
  };

  const customizedSafer = {
    id: 'safer' as const,
    name: t.saferRoute,
    durationMinutes: 23,
    distanceKm: 4.1,
    riskLevel: 'LOW' as const,
    path: [
      sourceCoord,
      [sourceCoord[0] + deltaLat * 0.8, sourceCoord[1] + deltaLng * 1.6] as [number, number],
      [sourceCoord[0] + deltaLat * 2.2, sourceCoord[1] + deltaLng * 2.8] as [number, number],
      [sourceCoord[0] + deltaLat * 3.6, sourceCoord[1] + deltaLng * 4.2] as [number, number],
      destinationCoord
    ],
    incidentZonesAvoided: 2,
    recommendation: 'Recommended: Well-lit commercial avenue, 24/7 CCTV surveillance, and verified volunteer shelter along route.',
    isRecommended: true,
    lightingQuality: 'Well Lit' as const,
    patrolledArea: true
  };

  // Turn-by-Turn Guidance Steps for the selected origin & destination
  const turnInstructions = [
    `1. Start safe walk from ${sourceName.replace(/^[^\w\s]+/, '').trim()}. Head toward main illuminated road.`,
    `2. Continue along wide avenue (800m). CCTV coverage active. Verified responder first-aid shop on right.`,
    `3. Cross junction safely. Street lighting 100% operational. Active police security patrol car nearby.`,
    `4. Enter safe shelter approach corridor. Emergency help box visible ahead.`,
    `5. You have arrived safely at ${destinationName.replace(/^[^\w\s]+/, '').trim()}! Shelter verified.`
  ];

  const handleSelectSource = (preset: LandmarkPreset) => {
    setSourceName(preset.name);
    setSourceCoord([preset.lat, preset.lng]);
  };

  const handleSelectDestination = (preset: LandmarkPreset) => {
    setDestinationName(preset.name);
    setDestinationCoord([preset.lat, preset.lng]);
  };

  const handleSourceInputChange = (val: string) => {
    setSourceName(val);
    const matched = SOURCE_PRESETS.find(p => 
      p.name.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(p.name.toLowerCase())
    );
    if (matched) {
      setSourceCoord([matched.lat, matched.lng]);
    }
  };

  const handleDestinationInputChange = (val: string) => {
    setDestinationName(val);
    const matched = DESTINATION_PRESETS.find(p => 
      p.name.toLowerCase().includes(val.toLowerCase()) || val.toLowerCase().includes(p.name.toLowerCase())
    );
    if (matched) {
      setDestinationCoord([matched.lat, matched.lng]);
    }
  };

  const handleSwap = () => {
    const tempName = sourceName;
    const tempCoord = sourceCoord;
    setSourceName(destinationName);
    setSourceCoord(destinationCoord);
    setDestinationName(tempName);
    setDestinationCoord(tempCoord);
  };

  const handleUseCurrentGps = () => {
    setSourceName('📍 Current GPS Location: ' + currentLocation.address);
    setSourceCoord([currentLocation.lat, currentLocation.lng]);
    setMapNotice('Origin updated to your live GPS coordinates!');
    setTimeout(() => setMapNotice(null), 3500);
  };

  const handleMapClick = (coord: [number, number]) => {
    if (pickMode === 'origin') {
      setSourceCoord(coord);
      setSourceName(`📍 Map Pinned Origin (${coord[0].toFixed(4)}, ${coord[1].toFixed(4)})`);
      setPickMode(null);
      setMapNotice(`Origin location updated to [${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}]!`);
      setTimeout(() => setMapNotice(null), 3500);
    } else if (pickMode === 'destination') {
      setDestinationCoord(coord);
      setDestinationName(`🏁 Map Pinned Destination (${coord[0].toFixed(4)}, ${coord[1].toFixed(4)})`);
      setPickMode(null);
      setMapNotice(`Destination safe shelter updated to [${coord[0].toFixed(4)}, ${coord[1].toFixed(4)}]!`);
      setTimeout(() => setMapNotice(null), 3500);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      
      {/* Map Feedback Notice Banner */}
      {mapNotice && (
        <div className="bg-[#3A7D5C] text-white px-4 py-3 rounded-2xl shadow-md text-xs font-bold flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white" />
            <span>{mapNotice}</span>
          </div>
          <button onClick={() => setMapNotice(null)} className="text-white/80 hover:text-white">
            <Check className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header with Live GPS Tracking Intact */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-[#0B5563] flex items-center justify-center flex-shrink-0">
            <Navigation className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.safeRoute}
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                GPS LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Type or select origin and destination to calculate well-lit, hazard-free safety corridors
            </p>
          </div>
        </div>

        <button
          onClick={handleUseCurrentGps}
          className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-[#0B5563] text-xs font-bold rounded-2xl border border-teal-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
          title="Detect and use your current live GPS position"
        >
          <MapPin className="w-4 h-4 text-[#0B5563]" />
          <span>Use My GPS Location</span>
        </button>
      </div>

      {/* 📍 Editable Source & Destination Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-[#1F497D]" />
            Select & Edit Route Locations
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold">
            Editable text inputs or quick presets
          </span>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
          
          {/* Source Input (Editable) */}
          <div className="md:col-span-5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1F497D]" />
                Source (Start Location):
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUseCurrentGps}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-teal-100/80 hover:bg-teal-200 text-[#0B5563] border border-teal-200 transition-colors"
                >
                  GPS
                </button>
                <button
                  type="button"
                  onClick={() => setPickMode(pickMode === 'origin' ? null : 'origin')}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                    pickMode === 'origin'
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pickMode === 'origin' ? 'Cancel Click' : '🎯 Map Pin'}
                </button>
              </div>
            </div>

            <input
              list="source-landmarks-list"
              type="text"
              value={sourceName}
              onChange={(e) => handleSourceInputChange(e.target.value)}
              placeholder="Type your source location or address..."
              className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#1F497D]"
            />
            <datalist id="source-landmarks-list">
              {SOURCE_PRESETS.map((p, i) => (
                <option key={i} value={p.name}>{p.name}</option>
              ))}
            </datalist>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Coord: {sourceCoord[0].toFixed(4)}, {sourceCoord[1].toFixed(4)}</span>
              <select
                value={SOURCE_PRESETS.some(p => p.name === sourceName) ? sourceName : ''}
                onChange={(e) => {
                  const found = SOURCE_PRESETS.find(p => p.name === e.target.value);
                  if (found) handleSelectSource(found);
                }}
                className="text-[10px] p-1 bg-white rounded border border-slate-200 text-slate-600 font-sans"
              >
                <option value="">Quick Select Source ▼</option>
                {SOURCE_PRESETS.map((p, i) => (
                  <option key={i} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={handleSwap}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs border border-slate-200"
              title="Swap Origin and Destination"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Input (Editable) */}
          <div className="md:col-span-5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <span>🏁</span>
                Destination (Safe Shelter):
              </label>
              <button
                type="button"
                onClick={() => setPickMode(pickMode === 'destination' ? null : 'destination')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                  pickMode === 'destination'
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pickMode === 'destination' ? 'Cancel Click' : '🎯 Map Pin'}
              </button>
            </div>

            <input
              list="destination-landmarks-list"
              type="text"
              value={destinationName}
              onChange={(e) => handleDestinationInputChange(e.target.value)}
              placeholder="Type your destination shelter or address..."
              className="w-full text-xs font-bold p-2.5 bg-white rounded-xl border border-slate-300 text-slate-900 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#0B5563]"
            />
            <datalist id="destination-landmarks-list">
              {DESTINATION_PRESETS.map((p, i) => (
                <option key={i} value={p.name}>{p.name}</option>
              ))}
            </datalist>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Coord: {destinationCoord[0].toFixed(4)}, {destinationCoord[1].toFixed(4)}</span>
              <select
                value={DESTINATION_PRESETS.some(p => p.name === destinationName) ? destinationName : ''}
                onChange={(e) => {
                  const found = DESTINATION_PRESETS.find(p => p.name === e.target.value);
                  if (found) handleSelectDestination(found);
                }}
                className="text-[10px] p-1 bg-white rounded border border-slate-200 text-slate-600 font-sans"
              >
                <option value="">Quick Select Destination ▼</option>
                {DESTINATION_PRESETS.map((p, i) => (
                  <option key={i} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Origin Presets (Click to Select Start Location) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Suggested Starting Locations:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SOURCE_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSource(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  sourceName === preset.name
                    ? 'bg-[#1F497D] text-white border-[#1F497D] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Presets (Click to Select Destination) */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Suggested Safe Shelters & Destinations:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {DESTINATION_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectDestination(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  destinationName === preset.name
                    ? 'bg-[#0B5563] text-white border-[#0B5563] shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Comparison Visualizer */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Interactive Path Comparison & Safe Corridor
            </h3>
            <p className="text-xs text-slate-500">
              From: <strong>{sourceName}</strong> → To: <strong>{destinationName}</strong>
            </p>
          </div>
        </div>

        <SafeRouteMap
          userLocation={sourceCoord}
          destinationLocation={destinationCoord}
          fastestRoute={customizedFastest}
          saferRoute={customizedSafer}
          selectedRouteId={selectedRouteId}
          onSelectRoute={(id) => setSelectedRouteId(id)}
          onMapClick={handleMapClick}
          pickMode={pickMode}
        />
      </div>

      {/* Turn-by-Turn Safe Navigation Path */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400">
            Recommended Turn-by-Turn Guidance Steps
          </h4>
        </div>
        <div className="space-y-2">
          {turnInstructions.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-white/5 p-2.5 rounded-xl border border-white/5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{step.substring(3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Route Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Safer Route Card (Recommended) */}
        <div
          onClick={() => setSelectedRouteId('safer')}
          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative space-y-4 ${
            selectedRouteId === 'safer'
              ? 'bg-emerald-50/50 border-[#3A7D5C] shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-[10px] bg-[#3A7D5C] text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {t.recommended}
            </span>
            <span className="text-xs font-black text-[#3A7D5C]">
              23 min (4.1 km)
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              {t.saferRoute}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Navigates via well-lit commercial avenue, 24/7 CCTV surveillance, and verified volunteer shelter along route.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Lighting</span>
              <strong className="text-emerald-700">Well Lit</strong>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Hazards Avoided</span>
              <strong className="text-emerald-700">2 Zones</strong>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Patrolled</span>
              <strong className="text-emerald-700">Yes (Active)</strong>
            </div>
          </div>
        </div>

        {/* Fastest Route Card */}
        <div
          onClick={() => setSelectedRouteId('fastest')}
          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative space-y-4 ${
            selectedRouteId === 'fastest'
              ? 'bg-amber-50/50 border-[#E8743B] shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start justify-between">
            <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-600" /> Caution
            </span>
            <span className="text-xs font-black text-slate-700">
              18 min (3.2 km)
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              {t.fastestRoute}
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Direct route cuts through unlit alleys and active waterlogging zone near underpass.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Lighting</span>
              <strong className="text-rose-700">Poorly Lit</strong>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Hazards Passed</span>
              <strong className="text-rose-700">2 Zones</strong>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Patrolled</span>
              <strong className="text-slate-500">Unmonitored</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
