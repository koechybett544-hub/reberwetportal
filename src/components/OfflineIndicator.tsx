import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Wifi, WifiOff, CloudCheck, RefreshCw } from 'lucide-react';

interface OfflineIndicatorProps {
  isSimulatedOffline?: boolean;
  onToggleSimulatedOffline?: () => void;
  syncState?: 'idle' | 'saving' | 'saved' | 'offline';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isSimulatedOffline = false,
  onToggleSimulatedOffline,
  syncState = 'idle',
}) => {
  const isOnline = useOnlineStatus();
  const effectiveOffline = !isOnline || isSimulatedOffline;

  if (!effectiveOffline && syncState === 'idle') {
    return null;
  }

  return (
    <aside
      id="offline-safety-banner"
      aria-label="Network Connectivity and Offline Storage Status"
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all border ${
        effectiveOffline
          ? 'bg-stone-900/95 text-stone-100 border-amber-500/40 shadow-amber-950/20'
          : 'bg-emerald-950/90 text-emerald-100 border-emerald-500/40'
      }`}
    >
      <div className="flex h-2.5 w-2.5 relative shrink-0">
        {effectiveOffline ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {effectiveOffline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              {isSimulatedOffline ? 'Simulated Offline' : 'Offline Mode'} — 100% Operational via Local Storage
            </span>
          </>
        ) : (
          <>
            <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Online — All changes synced</span>
          </>
        )}
      </div>

      {onToggleSimulatedOffline && (
        <button
          onClick={onToggleSimulatedOffline}
          className="ml-2 px-2 py-0.5 rounded-md bg-stone-800 text-[10px] text-stone-300 hover:text-white border border-stone-700 transition"
          title="Toggle simulated offline mode for testing"
        >
          {isSimulatedOffline ? 'Go Online' : 'Test Offline'}
        </button>
      )}
    </aside>
  );
};
