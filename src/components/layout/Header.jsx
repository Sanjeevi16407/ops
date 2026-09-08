import React, { useState, useEffect } from 'react';
import { Shield, Database, RefreshCw, Droplets, Sparkles } from 'lucide-react';
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
    <header className="liquid-glass-header px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
      {/* Brand Header Left */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00f5d4]/20 via-[#0f3e4d]/50 to-[#00b4d8]/20 border border-[#00f5d4]/50 flex items-center justify-center text-[#00f5d4] shadow-[0_0_20px_rgba(0,245,212,0.35)] shrink-0 backdrop-blur-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider font-mono-cyber flex items-center gap-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f5d4] to-[#00b4d8]">
              ARVIX
              {isDemoDataLoaded && (
                <span className="text-[9px] bg-[#00f5d4]/15 text-[#00f5d4] border border-[#00f5d4]/40 px-2 py-0.5 rounded-full font-sans font-bold shadow-[0_0_10px_rgba(0,245,212,0.2)]">
                  SYNTHETIC DEMO
                </span>
              )}
            </h1>
            <p className="text-[10px] text-[#94a3b8] tracking-widest font-mono-cyber uppercase font-semibold">
              AI Digital Crime Scene Investigation Assistant
            </p>
          </div>
        </div>

        {/* Center Tagline Ticker */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono-cyber text-[#94a3b8] liquid-glass-subpanel px-3.5 py-1 ml-4">
          <span className="text-[#00f5d4] font-bold">TRACE</span> • 
          <span className="text-[#00b4d8] font-bold">ANALYZE</span> • 
          <span className="text-[#00f5d4] font-bold">RECONSTRUCT</span> • 
          <span className="text-[#ff1744] font-bold">INVESTIGATE</span>
        </div>
      </div>

      {/* Header Right */}
      <div className="flex items-center gap-4">
        {/* Synthetic Demo / Clear Toggle Buttons */}
        <div className="flex items-center gap-2">
          {!isDemoDataLoaded ? (
            <button
              onClick={loadDemoCase}
              className="text-xs liquid-glass-btn text-[#03121c] px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 font-mono-cyber cursor-pointer font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              LOAD SYNTHETIC DEMO
            </button>
          ) : (
            <button
              onClick={resetToEmptyState}
              className="text-xs bg-[#ff1744]/20 hover:bg-[#ff1744]/30 text-[#ff1744] border border-[#ff1744]/50 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 font-mono-cyber cursor-pointer font-bold shadow-[0_0_12px_rgba(255,23,68,0.3)]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              CLEAR CASE
            </button>
          )}
        </div>

        {/* System Status Online */}
        <div className="flex items-center gap-2 liquid-glass-pill px-3 py-1.5 rounded-full text-xs font-mono-cyber text-[#00f5d4]">
          <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-ping" />
          <span className="text-[#94a3b8]">STATUS:</span>
          <span className="font-bold">ONLINE</span>
        </div>

        {/* Realtime Tactical Clock */}
        <div className="text-right font-mono-cyber hidden sm:block">
          <div className="text-xs text-[#00f5d4] font-bold tracking-wider">{timeStr || '10:42:29 AM'}</div>
          <div className="text-[10px] text-[#94a3b8] tracking-widest">{dateStr || '11 AUG 2026'}</div>
        </div>
      </div>
    </header>
  );
}
