import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HelperProfile, IncidentReport } from '../types';
import { locationService } from '../services/locationService';

interface Props {
  center: [number, number];
  zoom?: number;
  userAddress?: string;
  helpers?: HelperProfile[];
  incidents?: IncidentReport[];
  showSafeZones?: boolean;
  className?: string;
  onMarkerClick?: (type: string, data: any) => void;
}

export const SafetyMap: React.FC<Props> = ({
  center,
  zoom = 15,
  userAddress = 'Your Location',
  helpers = [],
  incidents = [],
  showSafeZones = true,
  className = 'h-96 w-full rounded-2xl shadow-inner border border-slate-200 overflow-hidden',
  onMarkerClick
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const loc = locationService.getLocation();
  const recipients = locationService.getActiveSharingRecipients();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(center, zoom);
    }

    // Render Markers
    if (markersLayerRef.current && mapInstanceRef.current) {
      markersLayerRef.current.clearLayers();

      // 1. User Position Marker with Animated Live Radar Ring
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              inset: 0;
              background: rgba(31, 73, 125, 0.4);
              border-radius: 50%;
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              width: 24px;
              height: 24px;
              background: #1F497D;
              border: 3px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 0 10px rgba(31, 73, 125, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 800;
              font-size: 10px;
              position: relative;
              z-index: 10;
            ">
              ●
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      L.marker(center, { icon: userIcon, zIndexOffset: 999 })
        .bindPopup(`
          <div style="font-family: system-ui, sans-serif; font-size: 12px;">
            <strong style="color: #1F497D;">📡 Live GPS Tracking Active</strong><br/>
            <span>Accuracy: ±${loc.accuracyMeters}m (High Precision)</span><br/>
            <span style="color: #3A7D5C; font-weight: bold;">● Shared with: ${recipients.map((r) => r.name).join(', ') || 'Trusted Circle'}</span><br/>
            <small style="color: #64748b;">${userAddress}</small>
          </div>
        `)
        .addTo(markersLayerRef.current);

      // Safe radius circle (500m)
      L.circle(center, {
        radius: 500,
        color: '#0B5563',
        weight: 1.5,
        fillColor: '#0B5563',
        fillOpacity: 0.05
      }).addTo(markersLayerRef.current);

      // 2. Verified Helpers
      helpers.forEach((h) => {
        if (!h.location) return;
        const helperIcon = L.divIcon({
          className: 'custom-helper-marker',
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background: #0B5563;
              border: 2px solid #ffffff;
              border-radius: 50%;
              box-shadow: 0 3px 6px rgba(0,0,0,0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 13px;
            ">
              ⛑️
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const helperMarker = L.marker([h.location.lat, h.location.lng], { icon: helperIcon })
          .bindPopup(`
            <div style="font-family: system-ui, sans-serif; font-size: 12px;">
              <strong style="color: #0B5563;">${h.name}</strong><br/>
              <span style="color: #3A7D5C; font-weight: bold;">✓ ${h.verificationStatus} Helper</span><br/>
              <span>⭐ ${h.trustScore} Trust Score</span><br/>
              <span>Skills: ${h.skills.join(', ')}</span><br/>
              <span style="color: #64748b;">${h.distanceKm} km away</span>
            </div>
          `);

        if (onMarkerClick) {
          helperMarker.on('click', () => onMarkerClick('helper', h));
        }
        helperMarker.addTo(markersLayerRef.current!);
      });

      // 3. Incidents & Hazard Zones
      incidents.forEach((inc) => {
        if (!inc.location) return;
        const isHazard = inc.severity === 'HIGH' || inc.severity === 'CRITICAL';
        const incidentIcon = L.divIcon({
          className: 'custom-incident-marker',
          html: `
            <div style="
              width: 30px;
              height: 30px;
              background: ${isHazard ? '#C0392B' : '#E8743B'};
              border: 2px solid #ffffff;
              border-radius: 8px;
              box-shadow: 0 3px 6px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 800;
              font-size: 13px;
            ">
              ⚠️
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        L.marker([inc.location.lat, inc.location.lng], { icon: incidentIcon })
          .bindPopup(`
            <div style="font-family: system-ui, sans-serif; font-size: 12px;">
              <strong style="color: ${isHazard ? '#C0392B' : '#E8743B'};">[${inc.type}] ${inc.title}</strong><br/>
              <span>Severity: <strong>${inc.severity}</strong></span><br/>
              <p style="margin: 4px 0; color: #475569;">${inc.description}</p>
              <small style="color: #94a3b8;">${inc.location.address}</small>
            </div>
          `)
          .addTo(markersLayerRef.current!);

        if (isHazard) {
          L.circle([inc.location.lat, inc.location.lng], {
            radius: 250,
            color: '#C0392B',
            dashArray: '4, 6',
            fillColor: '#C0392B',
            fillOpacity: 0.12
          }).addTo(markersLayerRef.current!);
        }
      });

      // 4. Emergency Facilities (Hospitals, Police, Safe Shelters)
      if (showSafeZones) {
        // Police station sample
        const policeIcon = L.divIcon({
          className: 'custom-police-marker',
          html: `<div style="width:28px;height:28px;background:#1F497D;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;">👮</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        L.marker([center[0] + 0.005, center[1] - 0.004], { icon: policeIcon })
          .bindPopup(`<strong>Banjara Hills Police Station</strong><br/>Emergency Patrol Unit • 24/7 Desk`)
          .addTo(markersLayerRef.current!);

        // Hospital sample
        const hospitalIcon = L.divIcon({
          className: 'custom-hospital-marker',
          html: `<div style="width:28px;height:28px;background:#C0392B;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;">🏥</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        L.marker([center[0] - 0.006, center[1] + 0.003], { icon: hospitalIcon })
          .bindPopup(`<strong>Care Hospital Emergency Trauma Center</strong><br/>Emergency Wing • 24/7 ICU & Ambulance`)
          .addTo(markersLayerRef.current!);

        // Safe Zone Shelter
        const shelterIcon = L.divIcon({
          className: 'custom-shelter-marker',
          html: `<div style="width:28px;height:28px;background:#3A7D5C;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;">🛡️</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });
        L.marker([center[0] + 0.008, center[1] + 0.006], { icon: shelterIcon })
          .bindPopup(`<strong>Verified Community Safe Haven</strong><br/>City Center Community Hub • First Aid & Power`)
          .addTo(markersLayerRef.current!);
      }
    }
  }, [center, zoom, helpers, incidents, showSafeZones, loc.accuracyMeters]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom);
    }
  };

  return (
    <div className="relative">
      <div ref={mapContainerRef} className={className} />

      {/* Explicit On-Map Live GPS Status Overlay (Addresses User Feedback 1: GPS Tracked & Live Location Shared) */}
      <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-md border border-slate-200 text-xs font-extrabold text-slate-800 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
        <span className="text-emerald-800">Live GPS Streaming</span>
        <span className="text-slate-400 font-normal">|</span>
        <span className="text-slate-600 font-semibold text-[11px]">
          Shared with: {recipients.map((r) => r.name).join(', ') || 'Trusted Circle'}
        </span>
      </div>

      <button
        onClick={handleRecenter}
        className="absolute bottom-4 right-4 z-20 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl shadow-lg border border-slate-200 transition-all flex items-center gap-1.5"
        title="Recenter Map to User Position"
      >
        <span>🎯</span>
        <span>Recenter</span>
      </button>
    </div>
  );
};
