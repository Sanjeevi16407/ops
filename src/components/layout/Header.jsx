import React, { useState, useEffect } from 'react';
import { Shield, Database, RefreshCw } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function Header() {
  const { isDemoDataLoaded, loadDemoCase, resetToEmptyState } = useInvestigation();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setDateStr(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-[#132438] bg-[#030a10]/95 backdrop-blur-md px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      {/* Brand Header Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center text-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.3)] shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-[#00ff9d] font-mono-cyber flex items-center gap-2">
              ARVIX
              {isDemoDataLoaded && (
                <span className="text-[9px] bg-[#ffab00]/20 text-[#ffab00] border border-[#ffab00]/40 px-2 py-0.5 rounded font-sans font-bold">
                  SYNTHETIC DEMO DATA
                </span>
              )}
            </h1>
            <p className="text-[10px] text-[#64748b] tracking-widest font-mono-cyber uppercase">
              AI Digital Crime Scene Investigation Assistant
            </p>
          </div>
        </div>

        {/* Center Tagline Ticker */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono-cyber text-[#64748b] bg-[#061018] px-3.5 py-1 rounded border border-[#132438] ml-4">
          <span className="text-[#00e5ff] font-bold">TRACE</span> • 
          <span className="text-[#00ff9d] font-bold">ANALYZE</span> • 
          <span className="text-[#ffab00] font-bold">RECONSTRUCT</span> • 
          <span className="text-[#ff1744] font-bold">INVESTIGATE</span>
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-5">
        {/* Synthetic Demo / Clear Toggle Buttons */}
        <div className="flex items-center gap-2">
          {!isDemoDataLoaded ? (
            <button
              onClick={loadDemoCase}
              className="text-xs bg-[#00ff9d]/10 hover:bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 px-3 py-1.5 rounded transition flex items-center gap-1.5 font-mono-cyber cursor-pointer font-bold shadow-[0_0_10px_rgba(0,255,157,0.15)]"
            >
              <Database className="w-3.5 h-3.5" />
              LOAD SYNTHETIC DEMO
            </button>
          ) : (
            <button
              onClick={resetToEmptyState}
              className="text-xs bg-[#ff1744]/10 hover:bg-[#ff1744]/20 text-[#ff1744] border border-[#ff1744]/40 px-3 py-1.5 rounded transition flex items-center gap-1.5 font-mono-cyber cursor-pointer font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              CLEAR INVESTIGATION
            </button>
          )}
        </div>

        {/* System Status Online */}
        <div className="flex items-center gap-2 bg-[#00ff9d]/10 border border-[#00ff9d]/30 px-3 py-1.5 rounded text-xs font-mono-cyber text-[#00ff9d]">
          <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse"></span>
          <span className="text-[#64748b]">SYSTEM STATUS</span>
          <span className="font-bold">• ONLINE</span>
        </div>

        {/* Realtime Tactical Clock */}
        <div className="text-right font-mono-cyber">
          <div className="text-xs text-[#00e5ff] font-bold tracking-wider">{timeStr || '10:42:29 AM'}</div>
          <div className="text-[10px] text-[#64748b] tracking-widest">{dateStr || '11 AUG 2026'}</div>
        </div>
      </div>
    </header>
  );
}
