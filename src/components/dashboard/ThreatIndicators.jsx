import React from 'react';
import { AlertTriangle, Target, Compass, ShieldCheck } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function ThreatIndicators() {
  const { threatIndicators, evidenceList } = useInvestigation();

  // If no evidence uploaded, show clean empty risk state per user prompt
  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div className="cyber-panel p-4 h-[225px] flex flex-col justify-between relative overflow-hidden font-mono-cyber">
        <div className="flex justify-between items-center border-b border-[#132438] pb-2 z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#64748b]">
            <AlertTriangle className="w-4 h-4 text-[#64748b]" />
            <span>THREAT & RISK INDICATORS</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-full z-10 text-center space-y-1">
          <ShieldCheck className="w-8 h-8 text-[#64748b]/50" />
          <div className="text-xs font-bold text-[#64748b] tracking-wider uppercase">
            NO RISK INDICATORS
          </div>
          <div className="text-[10px] text-[#475569]">
            Upload evidence to begin risk analysis.
          </div>
        </div>
      </div>
    );
  }

  const demoThreats = threatIndicators.length > 0 ? threatIndicators : [
    {
      id: 'th-1',
      title: 'Login from unfamiliar device',
      timestamp: '08:30 AM | Chennai',
      severity: 'HIGH'
    },
    {
      id: 'th-2',
      title: 'New beneficiary added',
      timestamp: '08:34 AM | DEMO-7812',
      severity: 'HIGH'
    },
    {
      id: 'th-3',
      title: 'High value transfer',
      timestamp: '08:36 AM | ₹2,50,000',
      severity: 'CRITICAL'
    },
    {
      id: 'th-4',
      title: 'Password changed after transfer',
      timestamp: '08:37 AM',
      severity: 'HIGH'
    }
  ];

  return (
    <div className="cyber-panel p-4 h-[225px] flex flex-col justify-between relative overflow-hidden glow-border-red font-mono-cyber">
      {/* Background Pulsing Radar Scope */}
      <div className="absolute right-[-20px] bottom-[-20px] text-[#ff1744]/15 pointer-events-none z-0">
        <Compass className="w-36 h-36 radar-spin stroke-[0.8]" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#ff1744]/30 pb-2 z-10">
        <div className="flex items-center gap-2 text-xs font-bold text-[#ff1744]">
          <AlertTriangle className="w-4 h-4 text-[#ff1744] animate-pulse" />
          <span>THREAT & RISK INDICATORS</span>
        </div>

        <span className="text-[10px] text-[#ff1744] bg-[#ff1744]/10 px-2 py-0.5 rounded border border-[#ff1744]/30 font-bold">
          HIGH RISK ACTIVITIES DETECTED
        </span>
      </div>

      {/* Threat Alert Feed */}
      <div className="flex-1 overflow-y-auto space-y-1.5 my-2 pr-1 text-xs z-10">
        {demoThreats.map((threat) => {
          const isCritical = threat.severity === 'CRITICAL';
          return (
            <div
              key={threat.id}
              className={`p-2 rounded border flex items-center justify-between transition ${
                isCritical
                  ? 'bg-[#ff1744]/15 border-[#ff1744]/50 text-[#e2e8f0] shadow-[0_0_10px_rgba(255,23,68,0.2)]'
                  : 'bg-[#ffab00]/10 border-[#ffab00]/30 text-[#e2e8f0]'
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isCritical ? 'text-[#ff1744]' : 'text-[#ffab00]'}`} />
                <div>
                  <div className="font-bold text-[11px]">{threat.title}</div>
                  <div className="text-[9px] text-[#94a3b8]">{threat.timestamp}</div>
                </div>
              </div>

              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                  isCritical
                    ? 'bg-[#ff1744]/25 border-[#ff1744] text-[#ff1744] animate-pulse'
                    : 'bg-[#ffab00]/25 border-[#ffab00] text-[#ffab00]'
                }`}
              >
                {threat.severity}
              </span>
            </div>
          );
        })}
      </div>

      {/* Overall Risk Level Widget */}
      <div className="border-t border-[#ff1744]/30 pt-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#ff1744] animate-spin" />
          <span className="text-[10px] text-[#64748b] tracking-wider uppercase">OVERALL RISK LEVEL</span>
        </div>

        <span className="text-sm font-bold tracking-widest px-3 py-0.5 rounded border bg-[#ff1744]/20 border-[#ff1744] text-[#ff1744] shadow-[0_0_15px_rgba(255,23,68,0.5)]">
          CRITICAL
        </span>
      </div>
    </div>
  );
}
