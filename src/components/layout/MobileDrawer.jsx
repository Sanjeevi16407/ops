import React from 'react';
import { 
  LayoutDashboard, Briefcase, FolderLock, Clock, Network, 
  Bot, AlertTriangle, FileCheck, Settings, Download, Terminal, 
  X, Shield, Sparkles, RefreshCw, Key
} from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function MobileDrawer() {
  const { 
    mobileMenuOpen, 
    setMobileMenuOpen, 
    activeTab, 
    setActiveTab, 
    currentCase,
    isDemoDataLoaded,
    loadDemoCase,
    resetToEmptyState
  } = useInvestigation();

  if (!mobileMenuOpen) return null;

  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'cases', label: 'CASE MANAGER', icon: Briefcase },
    { id: 'evidence', label: 'EVIDENCE VAULT', icon: FolderLock },
    { id: 'timeline', label: 'TIMELINE', icon: Clock },
    { id: 'graph', label: 'VISUAL RECONSTRUCTION', icon: Network },
    { id: 'ai_assistant', label: 'AI ASSISTANT', icon: Bot },
    { id: 'conflicts', label: 'CONFLICT DETECTION', icon: AlertTriangle },
    { id: 'report', label: 'REPORTS', icon: FileCheck },
    { id: 'otp_control', label: 'OTP CONTROL STATION', icon: Key }
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Dark Translucent Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Slide-out Liquid Glass Drawer */}
      <div className="relative w-[300px] max-w-[85vw] h-full liquid-glass-sidebar p-5 flex flex-col justify-between overflow-y-auto z-10 shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-slide-down border-r border-[#00f5d4]/40">
        <div className="space-y-5">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[rgba(0,245,212,0.2)] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00f5d4]/20 via-[#0f3e4d]/50 to-[#00b4d8]/20 border border-[#00f5d4]/50 flex items-center justify-center text-[#00f5d4] shadow-[0_0_15px_rgba(0,245,212,0.35)] shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-mono-cyber text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f5d4] to-[#00b4d8]">
                  ARVIX
                </h2>
                <div className="flex items-center gap-1.5 text-[9px] text-[#00f5d4] font-mono-cyber">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f5d4] animate-ping" />
                  <span>ONLINE • SECURE</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-[#94a3b8] hover:text-[#00f5d4] hover:bg-[rgba(15,62,77,0.4)] transition cursor-pointer"
              aria-label="Close Mobile Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Demo Actions on Mobile */}
          <div className="space-y-2">
            {!isDemoDataLoaded ? (
              <button
                onClick={() => {
                  loadDemoCase();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs liquid-glass-btn text-[#03121c] py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 font-mono-cyber cursor-pointer font-bold"
              >
                <Sparkles className="w-4 h-4" />
                LOAD SYNTHETIC DEMO
              </button>
            ) : (
              <button
                onClick={() => {
                  resetToEmptyState();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs bg-[#ff1744]/20 hover:bg-[#ff1744]/30 text-[#ff1744] border border-[#ff1744]/50 py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 font-mono-cyber cursor-pointer font-bold"
              >
                <RefreshCw className="w-4 h-4" />
                CLEAR CASE
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <div className="text-[10px] text-[#94a3b8] tracking-widest font-mono-cyber uppercase font-bold px-2 mb-2">
              MAIN NAVIGATION
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-mono-cyber transition tracking-wider cursor-pointer min-h-[44px] ${
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
        </div>

        {/* Case Status and Footer Info */}
        <div className="space-y-3 pt-4 border-t border-[rgba(0,245,212,0.2)] mt-4">
          <div className="liquid-glass-subpanel p-3 space-y-1.5 text-xs font-mono-cyber">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-[#94a3b8] uppercase font-bold">CASE STATUS</span>
              <span className="text-[10px] text-[#00f5d4] liquid-glass-pill px-2 py-0.5 rounded-full font-bold">
                {currentCase ? (currentCase.statusText || currentCase.status) : 'IDLE'}
              </span>
            </div>
            {currentCase && (
              <div className="text-[11px] text-[#cbd5e1] truncate">
                {currentCase.id} • {currentCase.crimeType}
              </div>
            )}
          </div>

          <div className="text-center font-mono-cyber text-[10px] text-[#64748b]">
            ARVIX FORENSICS v2.6 • LIQUID MOBILE
          </div>
        </div>
      </div>
    </div>
  );
}
