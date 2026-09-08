import React from 'react';
import { Lock, Activity } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#132438] bg-[#04060a] px-6 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono-cyber text-[#64748b] sticky bottom-0 z-40">
      {/* Binary Stream Telemetry */}
      <div className="flex items-center gap-3 overflow-hidden max-w-md">
        <span className="text-[#00ff9d]/40 tracking-widest text-[9px] truncate">
          01010000000000000000000000000000 010000000100010000000000
        </span>
      </div>

      {/* Security Status Center */}
      <div className="flex items-center gap-2 text-[#ffab00] bg-[#ffab00]/10 border border-[#ffab00]/30 px-3 py-0.5 rounded text-[10px] tracking-wider font-bold">
        <Lock className="w-3 h-3 text-[#ffab00]" />
        <span>SECURE MODE ENABLED</span>
      </div>

      {/* Network Monitor */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[#00e5ff]">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[10px] text-[#64748b]">NETWORK MONITOR:</span>
          <span className="text-[#00ff9d]">INCOMING 2.3 KB/s</span>
          <span className="text-[#64748b]">|</span>
          <span className="text-[#00e5ff]">OUTGOING 1.1 KB/s</span>
        </div>
      </div>
    </footer>
  );
}
