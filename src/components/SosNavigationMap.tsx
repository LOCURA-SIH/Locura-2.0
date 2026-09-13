import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HelperProfile } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, Navigation, Compass, ShieldCheck } from 'lucide-react';

interface Props {
  travelerLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  travelerName: string;
  emergencyType: string;
  helpers: HelperProfile[];
  activeHelper?: {
    id: string;
    name: string;
    phone: string;
    distanceKm: number;
    skills: string[];
    etaMinutes?: number;
  };
}

export const SosNavigationMap: React.FC<Props> = ({
  travelerLocation,
  travelerName,
  emergencyType,
  helpers,
  activeHelper
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  // Default helper position ~0.8km away from traveler
  const helperStartCoord: [number, number] = [
    travelerLocation.lat + 0.0072,
    travelerLocation.lng + 0.0065
  ];
  const travelerCoord: [number, number] = [travelerLocation.lat, travelerLocation.lng];

  // 6 realistic navigation waypoints from Helper to Traveler
  const dLat = (travelerCoord[0] - helperStartCoord[0]) / 5;
  const dLng = (travelerCoord[1] - helperStartCoord[1]) / 5;

  const navPath: [number, number][] = [
    helperStartCoord,
    [helperStartCoord[0] + dLat * 1, helperStartCoord[1] + dLng * 0.9],
    [helperStartCoord[0] + dLat * 2.2, helperStartCoord[1] + dLng * 1.8],
    [helperStartCoord[0] + dLat * 3.4, helperStartCoord[1] + dLng * 3.1],
    [helperStartCoord[0] + dLat * 4.3, helperStartCoord[1] + dLng * 4.4],
    travelerCoord
  ];

  const stepsDescriptions = [
    'Helper dispatched: Disembarking from station onto Main Avenue.',
    'Approaching Rd 10 intersection with emergency first-aid kit.',
    'Passing commercial corridor: Police security car in visual view.',
    'Entering Traveler\'s approach lane (approx 200m away).',
    'Arrived on scene! Helper in direct contact with Traveler.'
  ];

  // Navigation state
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef<any>(null);

  const totalSteps = navPath.length;
  const progressRatio = currentStep / (totalSteps - 1);
  const initialDist = activeHelper?.distanceKm || 0.8;
  const currentDist = (Math.max(0, initialDist * (1 - progressRatio))).toFixed(2);
  const initialEta = activeHelper?.etaMinutes || 4;
  const currentEta = Math.max(0, Math.round(initialEta * (1 - progressRatio)));
  const isArrived = currentStep >= totalSteps - 1;

  // Auto-play animation timer
  useEffect(() => {
    if (isAutoPlaying && !isArrived) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < totalSteps - 1) {
            return prev + 1;
          } else {
            setIsAutoPlaying(false);
            return prev;
          }
        });
      }, 2200);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, isArrived, totalSteps]);

  // Leaflet map setup & reactive updates
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: travelerCoord,
        zoom: 15,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    if (layersGroupRef.current && mapInstanceRef.current) {
      layersGroupRef.current.clearLayers();

      // 1. Traveler Emergency Marker (🚨)
      const travelerIcon = L.divIcon({
        className: 'traveler-marker',
        html: `
          <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;background:rgba(192,57,43,0.4);border-radius:50%;animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:32px;height:32px;background:#C0392B;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;box-shadow:0 3px 10px rgba(192,57,43,0.6);position:relative;z-index:10;">
              🚨
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      L.marker(travelerCoord, { icon: travelerIcon, zIndexOffset: 900 })
        .bindPopup(`
          <div style="font-family:system-ui;font-size:12px;">
            <strong style="color:#C0392B;">🚨 ${travelerName} (Emergency Beacon)</strong><br/>
            <span>${emergencyType}</span><br/>
            <small style="color:#64748b;">${travelerLocation.address}</small>
          </div>
        `)
        .addTo(layersGroupRef.current);

      // Traveler emergency beacon aura (300m)
      L.circle(travelerCoord, {
        radius: 300,
        color: '#C0392B',
        fillColor: '#C0392B',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 6'
      }).addTo(layersGroupRef.current);

      // 2. Nearby Helpers (Demonstrates that helpers are nearby in maps)
      const nearbyHelpersList = helpers.length > 0 ? helpers : [
        { id: 'h2', name: 'Dr. Priya Nair', distanceKm: 1.2, location: { lat: travelerCoord[0] - 0.006, lng: travelerCoord[1] + 0.005, address: 'Apollo Road' }, verificationStatus: 'Verified', skills: ['Emergency Care'] },
        { id: 'h3', name: 'Vikram Reddy', distanceKm: 1.5, location: { lat: travelerCoord[0] + 0.009, lng: travelerCoord[1] - 0.006, address: 'Road 36' }, verificationStatus: 'Verified', skills: ['CPR', 'First Aid'] }
      ];

      nearbyHelpersList.forEach((h: any) => {
        if (!h.location) return;
        const isResponding = h.name === (activeHelper?.name || 'Ravi Kumar');
        if (isResponding) return; // Drawn separately as navigating responder

        const icon = L.divIcon({
          className: 'nearby-helper-marker',
          html: `
            <div style="width:28px;height:28px;background:#0B5563;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">
              ⛑️
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        L.marker([h.location.lat, h.location.lng], { icon })
          .bindPopup(`
            <div style="font-family:system-ui;font-size:12px;">
              <strong style="color:#0B5563;">${h.name}</strong><br/>
              <span style="color:#3A7D5C;">✓ Nearby Verified Helper</span><br/>
              <span>Proximity: <strong>${h.distanceKm} km</strong></span>
            </div>
          `)
          .addTo(layersGroupRef.current!);
      });

      // 3. Navigation Polyline from Helper to Traveler
      L.polyline(navPath, {
        color: '#0B5563',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layersGroupRef.current);

      // Glowing dashed route overlay
      L.polyline(navPath, {
        color: '#38bdf8',
        weight: 3,
        opacity: 0.95,
        dashArray: '6, 10'
      }).addTo(layersGroupRef.current);

      // 4. Animated Approaching Responder Marker (🚑)
      const currentPos = navPath[currentStep];
      const responderIcon = L.divIcon({
        className: 'active-responder-marker',
        html: `
          <div style="position:relative;width:42px;height:42px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:0;background:rgba(11,85,99,0.45);border-radius:50%;animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:34px;height:34px;background:#0B5563;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;box-shadow:0 4px 12px rgba(11,85,99,0.6);position:relative;z-index:20;">
              ${isArrived ? '🤝' : '🚑'}
            </div>
          </div>
        `,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });

      L.marker(currentPos, { icon: responderIcon, zIndexOffset: 1000 })
        .bindPopup(`
          <div style="font-family:system-ui;font-size:12px;">
            <strong style="color:#0B5563;">${activeHelper?.name || 'Ravi Kumar'}</strong><br/>
            <span>${isArrived ? '🎉 Arrived on Scene!' : 'En Route to Traveler'}</span><br/>
            <span>Distance: <strong>${currentDist} km</strong></span>
          </div>
        `)
        .addTo(layersGroupRef.current);

      // Invalidate and fit bounds smoothly
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          const bounds = L.latLngBounds([travelerCoord, helperStartCoord]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
      }, 50);
    }
  }, [travelerCoord, travelerName, emergencyType, currentStep, isArrived, helpers, activeHelper]);

  return (
    <div className="space-y-3">
      {/* Live Helper-to-Traveler Navigation HUD Card */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-[#0B5563] text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-teal-500/40 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold shadow-md ${
              isArrived ? 'bg-emerald-500 text-white' : 'bg-teal-500/30 text-teal-300 animate-pulse'
            }`}>
              {isArrived ? '🎉' : '🚑'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm sm:text-base text-white">
                  {activeHelper?.name || 'Ravi Kumar'}
                </h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                  isArrived ? 'bg-emerald-500 text-white' : 'bg-teal-400/20 text-teal-300'
                }`}>
                  {isArrived ? 'ARRIVED ON SCENE' : 'EN ROUTE • NAVIGATING'}
                </span>
              </div>
              <p className="text-xs text-teal-200/80 mt-0.5">
                {activeHelper?.skills?.join(', ') || 'First Aid Certified, CPR Responder'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!isArrived && (
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors"
                title="Toggle live navigation motion"
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoPlaying ? 'Pause Movement' : 'Auto Move'}</span>
              </button>
            )}
            {!isArrived && (
              <button
                onClick={() => setCurrentStep(prev => Math.min(totalSteps - 1, prev + 1))}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Step Closer →
              </button>
            )}
            {isArrived && (
              <button
                onClick={() => {
                  setCurrentStep(0);
                  setIsAutoPlaying(true);
                }}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Replay Motion</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Telemetry Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          <div className="bg-black/30 p-2.5 rounded-2xl border border-white/10">
            <span className="text-[10px] text-teal-300 font-bold uppercase block">Proximity Distance</span>
            <span className="text-base font-black text-white">
              {isArrived ? '0.00 km' : `${currentDist} km`}
            </span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-2xl border border-white/10">
            <span className="text-[10px] text-teal-300 font-bold uppercase block">Estimated Arrival</span>
            <span className="text-base font-black text-amber-300">
              {isArrived ? 'Arrived!' : `~${currentEta} mins`}
            </span>
          </div>
          <div className="bg-black/30 p-2.5 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-teal-300 font-bold uppercase block">Route Progress</span>
            <span className="text-base font-black text-emerald-400">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Live Step Guidance Banner */}
        <div className="bg-white/10 p-3 rounded-2xl border border-white/15 flex items-start gap-2.5">
          <Compass className="w-4 h-4 text-teal-300 flex-shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="text-xs text-slate-100 font-medium leading-relaxed">
            {stepsDescriptions[Math.min(currentStep, stepsDescriptions.length - 1)]}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/15 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-teal-400 h-full transition-all duration-700 rounded-full"
            style={{ width: `${Math.round(progressRatio * 100)}%` }}
          />
        </div>
      </div>

      {/* Leaflet Map Display */}
      <div className="relative w-full h-96 rounded-3xl overflow-hidden border border-slate-200 shadow-md">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping" />
          <span>Live Helper → Traveler Navigation</span>
        </div>
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[10px] text-slate-600 font-semibold flex items-center gap-2">
          <span>🚨 Victim Beacon</span>
          <span>•</span>
          <span>🚑 Responding Helper</span>
          <span>•</span>
          <span>⛑️ Nearby Available Helpers</span>
        </div>
      </div>
    </div>
  );
};
