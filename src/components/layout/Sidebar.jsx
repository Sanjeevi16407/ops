import React from 'react';
import { 
  LayoutDashboard, Briefcase, FolderLock, Clock, Network, 
  Bot, AlertTriangle, FileCheck, Settings, Download, Terminal
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function Sidebar() {
  const { activeTab, setActiveTab, currentCase } = useInvestigation();

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'cases', label: 'CASE MANAGER', icon: Briefcase },
    { id: 'evidence', label: 'EVIDENCE VAULT', icon: FolderLock },
    { id: 'timeline', label: 'TIMELINE', icon: Clock },
    { id: 'graph', label: 'VISUAL RECONSTRUCTION', icon: Network },
    { id: 'ai_assistant', label: 'AI ASSISTANT', icon: Bot },
    { id: 'conflicts', label: 'CONFLICT DETECTION', icon: AlertTriangle },
    { id: 'report', label: 'REPORTS', icon: FileCheck },
    { id: 'settings', label: 'SETTINGS', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#030a10]/95 border-r border-[#132438] p-4 flex flex-col justify-between h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto">
      {/* Navigation Items */}
      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-mono-cyber transition tracking-wider cursor-pointer ${
                isActive
                  ? 'bg-[#00ff9d]/15 text-[#00ff9d] border-l-4 border-[#00ff9d] shadow-[0_0_12px_rgba(0,255,157,0.2)] font-bold'
                  : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#061018]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#00ff9d]' : 'text-[#64748b]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Case Overview Card & Terminal Box */}
      <div className="space-y-4 pt-4 border-t border-[#132438]">
        <div className="cyber-panel p-3.5 space-y-2">
          <div className="text-[10px] text-[#64748b] tracking-wider uppercase font-mono-cyber">
            Case Overview
          </div>
          
          {currentCase ? (
            <div className="space-y-1.5 text-xs font-mono-cyber">
              <div className="flex justify-between">
                <span className="text-[#64748b]">CASE ID</span>
                <span className="text-[#00e5ff] font-bold">{currentCase.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748b]">TYPE</span>
                <span className="text-[#e2e8f0] truncate max-w-[120px]">{currentCase.crimeType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#64748b]">STATUS</span>
                <span className="text-[10px] text-[#00ff9d] bg-[#00ff9d]/10 px-1.5 py-0.5 rounded border border-[#00ff9d]/30 font-bold">
                  {currentCase.statusText || currentCase.status}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#64748b]">INVESTIGATOR</span>
                <span className="text-[#cbd5e1]">{currentCase.investigator || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#64748b]">CREATED ON</span>
                <span className="text-[#64748b]">{currentCase.createdAt}</span>
              </div>

              <button
                onClick={() => setActiveTab('report')}
                className="w-full mt-2 bg-[#061018] hover:bg-[#0b1b28] border border-[#00ff9d]/40 text-[#00ff9d] py-1.5 rounded text-[11px] font-mono-cyber transition flex items-center justify-center gap-2 cursor-pointer font-bold"
              >
                <Download className="w-3.5 h-3.5" />
                EXPORT REPORT
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-[#64748b] font-mono-cyber py-2 text-center">
              NO ACTIVE CASE
              <p className="text-[9px] text-[#475569] mt-1">Upload evidence or click Load Demo to initialize</p>
            </div>
          )}
        </div>

        {/* System Terminal Box */}
        <div className="bg-[#02070b] border border-[#132438] p-2.5 rounded font-mono-cyber text-[10px] space-y-1">
          <div className="flex items-center gap-1 text-[#64748b] border-b border-[#132438] pb-1 mb-1">
            <Terminal className="w-3 h-3 text-[#00ff9d]" />
            <span className="text-[9px] uppercase tracking-wider">SYSTEM TERMINAL</span>
          </div>
          <div className="text-[#00ff9d]">ARVIX FORENSICS READY...</div>
          <div className="text-[#00e5ff]">Evidence Hash Verification Active</div>
          <div className="text-[#64748b]">Zero-Fabrication Policy Enforced</div>
        </div>
      </div>
    </aside>
  );
}
