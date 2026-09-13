import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { incidentService } from '../services/incidentService';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingCount, setPendingCount] = useState<number>(incidentService.getPendingOfflineCount());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setPendingCount(incidentService.getPendingOfflineCount());
    };
    const handleOffline = () => {
      setIsOnline(false);
      setPendingCount(incidentService.getPendingOfflineCount());
    };

    const handleOfflineToggle = (e: any) => {
      setIsOnline(!e.detail?.isOffline);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('locura-offline-toggle', handleOfflineToggle as EventListener);

    const interval = setInterval(() => {
      setPendingCount(incidentService.getPendingOfflineCount());
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('locura-offline-toggle', handleOfflineToggle as EventListener);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="bg-[#E8743B] text-white px-4 py-2 text-xs sm:text-sm font-medium shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isOnline ? (
            <>
              <WifiOff className="w-4 h-4 flex-shrink-0 animate-pulse" />
              <span>
                <strong>🟠 OFFLINE MODE:</strong> Internet connection unavailable. Core emergency features, cached facilities, and SMS fallback remain available.
              </span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" />
              <span>
                Synchronizing {pendingCount} offline incident report{pendingCount > 1 ? 's' : ''}...
              </span>
            </>
          )}
        </div>
        <div className="hidden sm:block text-[11px] bg-white/20 px-2 py-0.5 rounded font-mono">
          PWA Local Cache
        </div>
      </div>
    </div>
  );
};
