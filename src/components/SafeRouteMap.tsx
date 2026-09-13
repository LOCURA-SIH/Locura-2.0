import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SafeRouteOption } from '../types';

interface Props {
  userLocation: [number, number];
  destinationLocation: [number, number];
  fastestRoute: SafeRouteOption;
  saferRoute: SafeRouteOption;
  selectedRouteId: 'fastest' | 'safer';
  onSelectRoute: (id: 'fastest' | 'safer') => void;
  activeTrackingLocation?: [number, number] | null;
  isNavigating?: boolean;
  onMapClick?: (coord: [number, number]) => void;
  pickMode?: 'origin' | 'destination' | null;
}

export const SafeRouteMap: React.FC<Props> = ({
  userLocation,
  destinationLocation,
  fastestRoute,
  saferRoute,
  selectedRouteId,
  onSelectRoute,
  activeTrackingLocation,
  isNavigating,
  onMapClick,
  pickMode
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const walkerMarkerRef = useRef<L.Marker | null>(null);
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: userLocation,
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onMapClickRef.current) {
          onMapClickRef.current([Number(e.latlng.lat.toFixed(5)), Number(e.latlng.lng.toFixed(5))]);
        }
      });

      routesLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    if (routesLayerRef.current && mapInstanceRef.current) {
      routesLayerRef.current.clearLayers();

      // Start Marker (Origin)
      const startIcon = L.divIcon({
        className: 'start-marker',
        html: `<div style="width:30px;height:30px;background:#1F497D;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;box-shadow:0 3px 8px rgba(0,0,0,0.35)">📍</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      L.marker(userLocation, { icon: startIcon, zIndexOffset: 800 })
        .bindPopup(`<strong>Origin (Start Point)</strong><br/>Lat: ${userLocation[0].toFixed(4)}, Lng: ${userLocation[1].toFixed(4)}`)
        .addTo(routesLayerRef.current);

      // Destination Marker
      const endIcon = L.divIcon({
        className: 'end-marker',
        html: `<div style="width:30px;height:30px;background:#3A7D5C;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;box-shadow:0 3px 8px rgba(0,0,0,0.35)">🏁</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      L.marker(destinationLocation, { icon: endIcon, zIndexOffset: 800 })
        .bindPopup(`<strong>Destination (Safe Shelter)</strong><br/>Lat: ${destinationLocation[0].toFixed(4)}, Lng: ${destinationLocation[1].toFixed(4)}`)
        .addTo(routesLayerRef.current);

      // Hazard Marker dynamically placed near midpoint of fastest route
      const hazardCoord: [number, number] = [
        (userLocation[0] + destinationLocation[0]) / 2 + 0.002,
        (userLocation[1] + destinationLocation[1]) / 2 - 0.002
      ];
      const hazardIcon = L.divIcon({
        className: 'hazard-marker',
        html: `<div style="width:26px;height:26px;background:#C0392B;border:2px solid #fff;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold;box-shadow:0 2px 6px rgba(0,0,0,0.3)">⚠️</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      L.marker(hazardCoord, { icon: hazardIcon })
        .bindPopup('<strong>Hazard Zone</strong><br/>Active waterlogging & low street lighting.')
        .addTo(routesLayerRef.current);

      L.circle(hazardCoord, {
        radius: 220,
        color: '#C0392B',
        fillColor: '#C0392B',
        fillOpacity: 0.15,
        dashArray: '4, 6'
      }).addTo(routesLayerRef.current);

      // Draw Fastest Polyline
      const isFastestActive = selectedRouteId === 'fastest';
      const fastestLine = L.polyline(fastestRoute.path, {
        color: isFastestActive ? '#E8743B' : '#94a3b8',
        weight: isFastestActive ? 6 : 4,
        opacity: isFastestActive ? 0.95 : 0.6,
        dashArray: '6, 8'
      }).addTo(routesLayerRef.current);

      fastestLine.on('click', () => onSelectRoute('fastest'));

      // Draw Safer Polyline
      const isSaferActive = selectedRouteId === 'safer';
      const saferLine = L.polyline(saferRoute.path, {
        color: isSaferActive ? '#3A7D5C' : '#64748b',
        weight: isSaferActive ? 7 : 4,
        opacity: isSaferActive ? 0.95 : 0.6
      }).addTo(routesLayerRef.current);

      saferLine.on('click', () => onSelectRoute('safer'));

      // Active live tracking marker
      if (activeTrackingLocation) {
        const walkerIcon = L.divIcon({
          className: 'walker-marker',
          html: `
            <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
              <div style="position:absolute;inset:0;background:rgba(58,125,92,0.4);border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="width:30px;height:30px;background:#0B5563;border:3px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;box-shadow:0 3px 8px rgba(0,0,0,0.4);position:relative;z-index:10;">
                🚶
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });

        walkerMarkerRef.current = L.marker(activeTrackingLocation, { icon: walkerIcon, zIndexOffset: 1000 })
          .bindPopup('<strong>Live Safe Walk in Progress</strong><br/>Tracking your movement step-by-step')
          .addTo(routesLayerRef.current);

        if (isNavigating) {
          mapInstanceRef.current.panTo(activeTrackingLocation, { animate: true, duration: 0.8 });
        }
      }

      // Invalidate container size and smoothly fit bounds to new source & destination
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          if (!isNavigating) {
            const groupBounds = L.latLngBounds([userLocation, destinationLocation, hazardCoord]);
            mapInstanceRef.current.fitBounds(groupBounds, { padding: [50, 50], maxZoom: 16 });
          }
        }
      }, 80);
    }
  }, [userLocation, destinationLocation, fastestRoute, saferRoute, selectedRouteId, activeTrackingLocation, isNavigating]);

  return (
    <div className={`relative w-full h-88 rounded-2xl overflow-hidden border border-slate-200 shadow-sm ${pickMode ? 'cursor-crosshair' : ''}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* On-Map Pick Mode Indicator */}
      {pickMode && (
        <div className="absolute top-3 left-3 z-20 bg-amber-500 text-white px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg animate-pulse flex items-center gap-1.5">
          <span>🎯</span>
          <span>Click anywhere on map to place {pickMode === 'origin' ? 'Origin (📍)' : 'Destination (🏁)'}</span>
        </div>
      )}

      <div className="absolute top-3 right-3 z-20 bg-white/95 backdrop-blur-sm p-2.5 rounded-xl shadow-md border border-slate-200 text-[11px] space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-[#3A7D5C] rounded-full inline-block" />
          <span className="font-semibold text-slate-800">Safer Route (Well Lit & CCTV)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1 bg-[#E8743B] border-dashed border-t border-b rounded-full inline-block" />
          <span className="text-slate-600">Fastest Route (Passes Hazard)</span>
        </div>
        {isNavigating && (
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 text-emerald-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Live Safe Walk Tracking Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
