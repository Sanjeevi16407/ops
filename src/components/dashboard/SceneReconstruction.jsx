import React, { useState } from 'react';
import { Network, Eye, Lock, ShieldAlert, Compass, UserCheck, MessageSquare, Key, ArrowRightLeft, FileText, Upload } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function SceneReconstruction() {
  const { events, evidenceList, setActiveTab } = useInvestigation();
  const [is3DView, setIs3DView] = useState(true);

  if (!evidenceList || evidenceList.length === 0 || !events || events.length === 0) {
    return (
      <div className="cyber-panel p-4 h-[350px] flex flex-col justify-between relative overflow-hidden font-mono-cyber">
        <div className="flex justify-between items-center z-10 border-b border-[#132438] pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#e2e8f0]">
            <Network className="w-4 h-4 text-[#00ff9d]" />
            <span>VISUAL CRIME SCENE RECONSTRUCTION</span>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-[#64748b]">3D VIEW</span>
            <button
              onClick={() => setIs3DView(!is3DView)}
              className={`w-8 h-4 rounded-full transition p-0.5 ${is3DView ? 'bg-[#00ff9d]/30 border border-[#00ff9d]' : 'bg-[#1e293b]'}`}
            >
              <div className={`w-3 h-3 rounded-full ${is3DView ? 'bg-[#00ff9d] translate-x-4' : 'bg-[#64748b]'} transition`}></div>
            </button>
          </div>
        </div>

        <div className="absolute inset-0 cyber-grid-3d-scene opacity-25 pointer-events-none" />

        <div className="flex flex-col items-center justify-center h-full z-10 text-center space-y-2">
          <ShieldAlert className="w-10 h-10 text-[#64748b]/50 animate-pulse" />
          <div className="text-xs font-bold text-[#64748b] tracking-wider uppercase">
            NO EVIDENCE AVAILABLE
          </div>
          <div className="text-[10px] text-[#475569]">
            Upload evidence to begin reconstruction.
          </div>
          <button
            onClick={() => setActiveTab('evidence')}
            className="mt-2 bg-[#00ff9d]/10 hover:bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/30 px-3.5 py-1.5 rounded text-xs transition flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <Upload className="w-3.5 h-3.5" />
            + UPLOAD EVIDENCE
          </button>
        </div>
      </div>
    );
  }

  // Node positions matching reference diagram accurately
  const demoNodes = [
    {
      id: 'node-1',
      time: '08:30 AM',
      title: 'UNFAMILIAR DEVICE LOGIN',
      detail1: 'Location: Chennai',
      detail2: 'Device: Unknown',
      color: 'green',
      icon: UserCheck,
      top: '18%',
      left: '12%'
    },
    {
      id: 'node-2',
      time: '08:31 AM',
      title: 'OTP REQUESTED',
      detail1: 'Via SMS Gateway',
      detail2: null,
      color: 'green',
      icon: MessageSquare,
      top: '55%',
      left: '22%'
    },
    {
      id: 'node-3',
      time: '08:32 AM',
      title: 'OTP VERIFIED',
      detail1: 'Via SMS Gateway',
      detail2: null,
      color: 'green',
      icon: UserCheck,
      top: '68%',
      left: '38%'
    },
    {
      id: 'node-4',
      time: '08:34 AM',
      title: 'NEW BENEFICIARY ADDED',
      detail1: 'Account: DEMO-7812',
      detail2: null,
      color: 'amber',
      icon: Lock,
      top: '22%',
      left: '42%'
    },
    {
      id: 'node-5',
      time: '08:36 AM',
      title: '₹2,50,000 TRANSFERRED',
      detail1: 'To: DEMO-7812',
      detail2: 'Status: Completed',
      color: 'red',
      icon: ArrowRightLeft,
      top: '38%',
      left: '60%'
    },
    {
      id: 'node-6',
      time: '08:37 AM',
      title: 'PASSWORD CHANGED',
      detail1: 'Account Secured',
      detail2: null,
      color: 'amber',
      icon: Key,
      top: '72%',
      left: '68%'
    }
  ];

  return (
    <div className="cyber-panel p-4 h-[370px] flex flex-col justify-between relative overflow-hidden font-mono-cyber">
      {/* Header Controls */}
      <div className="flex justify-between items-center z-20 border-b border-[#132438] pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#e2e8f0]">
          <Network className="w-4 h-4 text-[#00ff9d]" />
          <span>VISUAL CRIME SCENE RECONSTRUCTION</span>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="text-[#64748b]">3D VIEW</span>
            <button
              onClick={() => setIs3DView(!is3DView)}
              className={`w-9 h-4 rounded-full transition p-0.5 cursor-pointer ${is3DView ? 'bg-[#00ff9d]/30 border border-[#00ff9d]' : 'bg-[#1e293b]'}`}
            >
              <div className={`w-3 h-3 rounded-full ${is3DView ? 'bg-[#00ff9d] translate-x-5' : 'bg-[#64748b]'} transition`}></div>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Scene Viewport */}
      <div className="relative w-full h-[310px] my-auto flex items-center justify-center overflow-hidden">
        {/* Perspective Background Grid */}
        <div className={`absolute inset-0 ${is3DView ? 'cyber-grid-3d-scene' : 'cyber-grid'} opacity-40 pointer-events-none`} />

        {/* Top-Right Radar Compass Scope Graphic */}
        <div className="absolute right-4 top-2 text-[#00e5ff]/20 pointer-events-none z-10 flex flex-col items-center">
          <Compass className="w-16 h-16 radar-spin stroke-[1]" />
        </div>

        {/* SVG Laser Connecting Paths */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <path
            d="M 180 80 L 260 200 L 420 250 L 460 100"
            fill="none"
            stroke="#00ff9d"
            strokeWidth="2"
            strokeDasharray="6,6"
            className="animate-pulse"
          />
          <path
            d="M 460 100 L 640 150 L 720 260"
            fill="none"
            stroke="#ff1744"
            strokeWidth="2.5"
            className="shadow-[0_0_10px_#ff1744]"
          />
        </svg>

        {/* Floating Node Cards & Glowing Marker Rings */}
        <div className="relative w-full h-full z-20">
          {demoNodes.map((node) => {
            const Icon = node.icon;
            const isRed = node.color === 'red';
            const isAmber = node.color === 'amber';

            return (
              <div
                key={node.id}
                className="absolute flex items-start gap-2 transition-transform hover:scale-105"
                style={{ top: node.top, left: node.left }}
              >
                {/* Marker Ring Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border shrink-0 ${
                  isRed
                    ? 'bg-[#ff1744]/30 border-[#ff1744] text-[#ff1744] shadow-[0_0_15px_rgba(255,23,68,0.6)] animate-pulse'
                    : isAmber
                    ? 'bg-[#ffab00]/30 border-[#ffab00] text-[#ffab00] shadow-[0_0_12px_rgba(255,171,0,0.4)]'
                    : 'bg-[#00ff9d]/30 border-[#00ff9d] text-[#00ff9d] shadow-[0_0_12px_rgba(0,255,157,0.4)]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Cyber Card Box */}
                <div className={`p-2 rounded border backdrop-blur-md min-w-[130px] ${
                  isRed
                    ? 'glow-border-red bg-[#ff1744]/15 text-[#e2e8f0]'
                    : isAmber
                    ? 'glow-border-amber bg-[#ffab00]/15 text-[#e2e8f0]'
                    : 'glow-border-green bg-[#061018]/90 text-[#e2e8f0]'
                }`}>
                  <div className={`text-[9px] font-bold ${isRed ? 'text-[#ff1744]' : isAmber ? 'text-[#ffab00]' : 'text-[#00ff9d]'}`}>
                    {node.time}
                  </div>
                  <div className="text-[10px] font-bold uppercase truncate max-w-[140px]">
                    {node.title}
                  </div>
                  {node.detail1 && <div className="text-[9px] text-[#cbd5e1] truncate">{node.detail1}</div>}
                  {node.detail2 && <div className="text-[9px] text-[#64748b] truncate">{node.detail2}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
