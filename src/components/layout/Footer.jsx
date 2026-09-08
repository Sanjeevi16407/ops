import React from 'react';
import { Lock, Activity, Droplets } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="hidden md:flex liquid-glass-footer px-6 py-2 items-center justify-between text-[11px] font-mono-cyber text-[#94a3b8] sticky bottom-0 z-40">
      {/* Binary Stream Telemetry */}
      <div className="flex items-center gap-3 overflow-hidden max-w-md">
        <Droplets className="w-3.5 h-3.5 text-[#00f5d4] shrink-0" />
        <span className="text-[#00f5d4]/50 tracking-widest text-[9px] truncate">
          01000001 01010010 01010110 01001001 01011000 // LIQUID GLASS KERNEL ACTIVE
        </span>
      </div>

      {/* Security Status Center */}
      <div className="flex items-center gap-2 text-[#00f5d4] liquid-glass-pill px-3 py-0.5 rounded-full text-[10px] tracking-wider font-bold">
        <Lock className="w-3 h-3 text-[#00f5d4]" />
        <span>LIQUID CRYPTO SHIELD ACTIVE</span>
      </div>

      {/* Network Monitor */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[#00b4d8]">
          <Activity className="w-3.5 h-3.5 text-[#00f5d4] animate-pulse" />
          <span className="text-[10px] text-[#94a3b8]">TELEMETRY:</span>
          <span className="text-[#00f5d4]">IN: 4.8 KB/s</span>
          <span className="text-[#64748b]">|</span>
          <span className="text-[#00b4d8]">OUT: 2.1 KB/s</span>
        </div>
      </div>
    </footer>
  );
}
