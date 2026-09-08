import React from 'react';
import { LayoutDashboard, FolderLock, Clock, Bot, Menu, AlertTriangle } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab, setMobileMenuOpen, conflicts } = useInvestigation();

  const primaryTabs = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'evidence', label: 'EVIDENCE', icon: FolderLock },
    { id: 'timeline', label: 'TIMELINE', icon: Clock },
    { id: 'ai_assistant', label: 'AI ASSIST', icon: Bot }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pointer-events-none safe-area-bottom">
      <div className="max-w-md mx-auto liquid-glass-card pointer-events-auto px-3 py-2 flex items-center justify-around rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] border border-[rgba(0,245,212,0.4)] backdrop-blur-2xl bg-gradient-to-r from-[rgba(15,62,77,0.8)] via-[rgba(7,34,46,0.85)] to-[rgba(3,18,28,0.9)]">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition duration-200 cursor-pointer relative min-w-[58px] ${
                isActive 
                  ? 'text-[#00f5d4] scale-105' 
                  : 'text-[#94a3b8] hover:text-[#f8fafc]'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-[#00f5d4] shadow-[0_0_8px_#00f5d4]" />
              )}
              <Icon className={`w-5 h-5 mb-0.5 transition ${isActive ? 'text-[#00f5d4] drop-shadow-[0_0_8px_rgba(0,245,212,0.6)]' : 'text-[#64748b]'}`} />
              <span className="text-[9px] font-mono-cyber font-bold tracking-wider">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* More / Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition duration-200 cursor-pointer text-[#94a3b8] hover:text-[#00f5d4] min-w-[58px] relative"
          aria-label="Open Full Navigation Menu"
        >
          {conflicts && conflicts.length > 0 && (
            <span className="absolute -top-0.5 right-2 w-2 h-2 rounded-full bg-[#ff1744] ring-2 ring-black animate-pulse" />
          )}
          <Menu className="w-5 h-5 mb-0.5 text-[#64748b] hover:text-[#00f5d4]" />
          <span className="text-[9px] font-mono-cyber font-bold tracking-wider">
            MORE
          </span>
        </button>
      </div>
    </nav>
  );
}
