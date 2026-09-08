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
    <aside className="w-64 liquid-glass-sidebar p-4 flex flex-col justify-between h-[calc(100vh-61px)] sticky top-[61px] overflow-y-auto">
      {/* Navigation Items */}
      <div className="space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono-cyber transition tracking-wider cursor-pointer ${
                isActive
                  ? 'liquid-glass-pill text-[#00f5d4] font-bold shadow-[0_0_18px_rgba(0,245,212,0.3)] border-l-4 border-l-[#00f5d4]'
                  : 'text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[rgba(15,62,77,0.3)]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#00f5d4]' : 'text-[#64748b]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Case Overview Card & Terminal Box */}
      <div className="space-y-4 pt-4 border-t border-[rgba(0,245,212,0.2)]">
        <div className="liquid-glass-subpanel p-3.5 space-y-2">
          <div className="text-[10px] text-[#94a3b8] tracking-wider uppercase font-mono-cyber font-bold flex justify-between items-center">
            <span>Case Overview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-ping" />
          </div>
          
          {currentCase ? (
            <div className="space-y-1.5 text-xs font-mono-cyber">
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">CASE ID</span>
                <span className="text-[#00f5d4] font-bold">{currentCase.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#94a3b8]">TYPE</span>
                <span className="text-[#f8fafc] truncate max-w-[120px]">{currentCase.crimeType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#94a3b8]">STATUS</span>
                <span className="text-[10px] text-[#00f5d4] liquid-glass-pill px-2 py-0.5 rounded-full font-bold">
                  {currentCase.statusText || currentCase.status}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#94a3b8]">INVESTIGATOR</span>
                <span className="text-[#cbd5e1]">{currentCase.investigator || 'Unassigned'}</span>
              </div>

              <button
                onClick={() => setActiveTab('report')}
                className="w-full mt-2 liquid-glass-btn text-[#03121c] py-1.5 rounded-xl text-[11px] font-mono-cyber transition flex items-center justify-center gap-2 cursor-pointer font-bold"
              >
                <Download className="w-3.5 h-3.5 text-[#03121c]" />
                EXPORT REPORT
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-[#94a3b8] font-mono-cyber py-2 text-center">
              NO ACTIVE CASE
              <p className="text-[9px] text-[#64748b] mt-1">Upload evidence or load demo</p>
            </div>
          )}
        </div>

        {/* System Terminal Box */}
        <div className="bg-[rgba(3,18,28,0.7)] border border-[rgba(0,245,212,0.2)] p-2.5 rounded-xl font-mono-cyber text-[10px] space-y-1 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[#94a3b8] border-b border-[rgba(255,255,255,0.08)] pb-1 mb-1">
            <Terminal className="w-3 h-3 text-[#00f5d4]" />
            <span className="text-[9px] uppercase tracking-wider font-bold">LIQUID CORE LOGS</span>
          </div>
          <div className="text-[#00f5d4]">ARVIX FORENSICS READY...</div>
          <div className="text-[#00b4d8]">Quantum Decryption Active</div>
          <div className="text-[#64748b]">SHA-256 Chain of Custody</div>
        </div>
      </div>
    </aside>
  );
}
