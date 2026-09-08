import React from 'react';
import { ShieldAlert, Upload, Database, Lock } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function EmptyState() {
  const { loadDemoCase, setActiveTab } = useInvestigation();

  return (
    <div className="cyber-panel p-8 text-center my-6 flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto border border-[#00ff9d]/30 shadow-[0_0_30px_rgba(0,255,157,0.1)]">
      <div className="w-16 h-16 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center text-[#00ff9d] animate-pulse">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl font-bold font-mono-cyber text-[#00ff9d] tracking-wider uppercase">
          NO EVIDENCE LOADED
        </h2>
        <p className="text-xs font-mono-cyber text-[#94a3b8]">
          Upload authorized evidence to begin reconstruction.
        </p>
      </div>

      <div className="text-[11px] font-mono-cyber text-[#64748b] max-w-md bg-[#06090e] p-3 rounded border border-[#132438] space-y-1">
        <div className="flex items-center justify-center gap-1 text-[#ffab00]">
          <Lock className="w-3 h-3" />
          <span className="font-bold uppercase">ZERO-FABRICATION POLICY ACTIVE</span>
        </div>
        <div>
          ARVIX strictly processes, extracts, and analyzes events only after evidence files are uploaded by the investigator. No data is fabricated or auto-assumed.
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => setActiveTab('evidence')}
          className="bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#06090e] font-bold px-5 py-2.5 rounded text-xs font-mono-cyber transition flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,157,0.4)] cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          + UPLOAD EVIDENCE
        </button>

        <button
          onClick={loadDemoCase}
          className="bg-[#0d1424] hover:bg-[#121c33] text-[#00e5ff] border border-[#00e5ff]/40 px-5 py-2.5 rounded text-xs font-mono-cyber transition flex items-center gap-2 cursor-pointer font-bold"
        >
          <Database className="w-4 h-4" />
          LOAD SYNTHETIC DEMO
        </button>
      </div>
    </div>
  );
}
