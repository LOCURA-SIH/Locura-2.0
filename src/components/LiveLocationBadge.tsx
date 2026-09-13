import React, { useState, useEffect } from 'react';
import { Radio, Share2, Copy, Check, MapPin, RefreshCw, ShieldCheck, ExternalLink } from 'lucide-react';
import { locationService, LocationCoordinates } from '../services/locationService';
import { useTranslation } from '../utils/i18n';

interface Props {
  variant?: 'compact' | 'full' | 'sos';
  className?: string;
}

export const LiveLocationBadge: React.FC<Props> = ({ variant = 'full', className = '' }) => {
  const { t } = useTranslation();
  const [loc, setLoc] = useState<LocationCoordinates>(locationService.getLocation());
  const [copied, setCopied] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [recipients, setRecipients] = useState(locationService.getActiveSharingRecipients());

  useEffect(() => {
    const unsub = locationService.subscribe((newLoc) => {
      setLoc(newLoc);
      setSecondsAgo(0);
      setRecipients(locationService.getActiveSharingRecipients());
    });

    const timer = setInterval(() => {
      setSecondsAgo((prev) => prev + 1);
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const handleCopyLink = () => {
    const url = locationService.getGoogleMapsUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefresh = () => {
    locationService.requestRealGps();
  };

  const handleToggleSharing = () => {
    locationService.toggleSharing();
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
        loc.isSharingActive
          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      } ${className}`}>
        <span className="relative flex h-2.5 w-2.5">
          {loc.isSharingActive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${loc.isSharingActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        </span>
        <span>{loc.isSharingActive ? t.liveGpsActive : 'GPS STREAM PAUSED'}</span>
        <span className="text-[10px] text-slate-500 font-mono">±{loc.accuracyMeters}m</span>
      </div>
    );
  }

  // Full / SOS telemetry banner
  return (
    <div
      className={`rounded-3xl border p-4 sm:p-5 shadow-xs transition-all ${
        variant === 'sos'
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 text-white border-rose-500/40 shadow-xl'
          : 'bg-white text-slate-900 border-slate-200'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        
        {/* Left: Active Beacon Header */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              loc.isSharingActive
                ? variant === 'sos'
                  ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/40'
                  : 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Radio className={`w-5 h-5 ${loc.isSharingActive ? 'animate-pulse' : ''}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                loc.isSharingActive
                  ? variant === 'sos' ? 'text-rose-400' : 'text-emerald-700'
                  : 'text-slate-500'
              }`}>
                <span className="relative flex h-2 w-2">
                  {loc.isSharingActive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${loc.isSharingActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                </span>
                {loc.isSharingActive ? t.liveGpsActive : 'LIVE GPS SHARING PAUSED'}
              </span>

              <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                ±{loc.accuracyMeters}m {t.accuracy.replace('Accuracy: ', '')}
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t.liveGpsSharingWith}: <strong>{recipients.map((r) => r.name).join(', ') || 'Trusted Circle'}</strong>
            </p>
          </div>
        </div>

        {/* Right: Quick Sharing Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              copied
                ? 'bg-emerald-600 text-white border-emerald-600'
                : variant === 'sos'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
            title="Copy Live Google Maps link"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Copy Live Link'}</span>
          </button>

          <a
            href={locationService.getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-1.5 rounded-xl border text-xs transition-colors ${
              variant === 'sos'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Open in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleRefresh}
            className={`p-1.5 rounded-xl border text-xs transition-colors ${
              variant === 'sos'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
            title="Refresh High-Accuracy GPS"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Coordinate Telemetry Row */}
      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <MapPin className="w-3.5 h-3.5 text-[#0B5563]" />
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {loc.lat.toFixed(5)}° N, {loc.lng.toFixed(5)}° E
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 line-clamp-1">{loc.address}</span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono self-end sm:self-auto">
          <span>Ping #{locationService.getPingCount()}</span>
          <span>•</span>
          <span className="text-emerald-500 font-semibold">
            {secondsAgo === 0 ? 'Sent just now' : `Sent ${secondsAgo}s ago`}
          </span>
        </div>
      </div>
    </div>
  );
};
