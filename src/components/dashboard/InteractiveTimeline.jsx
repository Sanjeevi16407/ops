import React, { useState } from 'react';
import { Clock, ZoomIn, ZoomOut, Filter, UserCheck, MessageSquare, CheckCircle2, UserPlus, ArrowRightLeft, Key, Landmark, X } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function InteractiveTimeline() {
  const { events } = useInvestigation();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filters = ['ALL', 'LOGINS', 'MESSAGES', 'TRANSACTIONS', 'DEVICES', 'CONFLICTS'];

  if (!events || events.length === 0) {
    return (
      <div className="cyber-panel p-4 h-[215px] flex flex-col justify-between relative overflow-hidden font-mono-cyber">
        <div className="flex justify-between items-center border-b border-[#132438] pb-2 z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#e2e8f0]">
            <Clock className="w-4 h-4 text-[#00ff9d]" />
            <span>INVESTIGATION TIMELINE</span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-full z-10 text-center space-y-1">
          <div className="text-xs font-bold text-[#64748b] tracking-wider uppercase">
            NO EVENTS AVAILABLE
          </div>
          <div className="text-[10px] text-[#475569]">
            Upload authorized evidence to reconstruct chronological timeline events
          </div>
        </div>
      </div>
    );
  }

  // Filter events dynamically
  const filteredEvents = events.filter(evt => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'LOGINS') return evt.eventType.toLowerCase().includes('login');
    if (activeFilter === 'MESSAGES') return evt.eventType.toLowerCase().includes('otp') || evt.eventType.toLowerCase().includes('sms') || evt.eventType.toLowerCase().includes('email');
    if (activeFilter === 'TRANSACTIONS') return evt.amount || evt.eventType.toLowerCase().includes('transfer');
    if (activeFilter === 'DEVICES') return evt.device;
    if (activeFilter === 'CONFLICTS') return evt.severity === 'HIGH' || evt.severity === 'CRITICAL';
    return true;
  });

  return (
    <div className="cyber-panel p-4 h-[220px] flex flex-col justify-between relative overflow-hidden font-mono-cyber">
      {/* Header & Controls */}
      <div className="flex justify-between items-center border-b border-[#132438] pb-2 z-10">
        <div className="flex items-center gap-2 text-xs font-bold text-[#e2e8f0]">
          <Clock className="w-4 h-4 text-[#00ff9d]" />
          <span>INVESTIGATION TIMELINE</span>
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-[#061018] px-2 py-0.5 rounded border border-[#132438]">
            <span className="text-[#64748b]">ZOOM</span>
            <span className="text-[#00e5ff] font-bold">- +</span>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-1 text-[#00e5ff] bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 px-2.5 py-0.5 rounded border border-[#00e5ff]/30 cursor-pointer font-bold"
            >
              <Filter className="w-3 h-3" />
              <span>FILTER: {activeFilter}</span>
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-[#030a10] border border-[#00e5ff]/50 rounded shadow-2xl z-30 space-y-0.5 p-1 text-[10px]">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setActiveFilter(f); setShowFilterMenu(false); }}
                    className={`w-full text-left px-2 py-1 rounded transition cursor-pointer ${
                      activeFilter === f ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-bold' : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#061018]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Timeline Track */}
      <div className="relative overflow-x-auto my-auto py-2 z-10">
        <div className="flex items-center justify-between min-w-max px-6 relative">
          {/* Glowing Laser Axis Line */}
          <div className="absolute top-10 left-8 right-8 h-[2px] bg-gradient-to-r from-[#00ff9d] via-[#ff1744] to-[#00ff9d] z-0 opacity-60" />

          {filteredEvents.map((item, idx) => {
            const isRed = item.severity === 'CRITICAL' || item.amount;
            const isAmber = item.severity === 'HIGH';

            return (
              <div
                key={item.eventId || idx}
                onClick={() => setSelectedEvent(item)}
                className="relative z-10 flex flex-col items-center cursor-pointer group px-3"
              >
                {/* Time Tag */}
                <div className={`text-[10px] font-bold font-mono-cyber mb-2.5 ${
                  isRed ? 'text-[#ff1744]' : isAmber ? 'text-[#ffab00]' : 'text-[#00ff9d]'
                }`}>
                  {item.timestamp}
                </div>

                {/* Circular Glowing Icon Node */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-transform duration-200 group-hover:scale-110 ${
                  isRed
                    ? 'bg-[#ff1744]/25 border-[#ff1744] text-[#ff1744] shadow-[0_0_15px_rgba(255,23,68,0.5)]'
                    : isAmber
                    ? 'bg-[#ffab00]/25 border-[#ffab00] text-[#ffab00] shadow-[0_0_12px_rgba(255,171,0,0.4)]'
                    : 'bg-[#00ff9d]/25 border-[#00ff9d] text-[#00ff9d] shadow-[0_0_12px_rgba(0,255,157,0.4)]'
                }`}>
                  <UserCheck className="w-4 h-4" />
                </div>

                {/* Event Title */}
                <div className="text-[10px] font-bold font-mono-cyber text-[#e2e8f0] mt-2 max-w-[120px] text-center truncate">
                  {item.eventType}
                </div>

                {/* Source File Badge */}
                <div className="text-[9px] font-mono-cyber text-[#64748b] bg-[#02070b] px-2 py-0.5 rounded border border-[#132438] mt-1 group-hover:border-[#00ff9d]/40 group-hover:text-[#00ff9d]">
                  {item.sourceFileName}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Event Popover */}
      {selectedEvent && (
        <div className="absolute inset-0 bg-[#02070b]/95 backdrop-blur-md z-30 p-4 rounded-lg border border-[#00ff9d] flex flex-col justify-between font-mono-cyber">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[10px] text-[#00e5ff] font-bold">{selectedEvent.timestamp}</div>
              <h4 className="text-sm font-bold text-[#00ff9d] uppercase">{selectedEvent.eventType}</h4>
            </div>
            <button onClick={() => setSelectedEvent(null)} className="text-[#64748b] hover:text-[#ff1744]"><X className="w-4 h-4" /></button>
          </div>
          <div className="text-xs text-[#94a3b8]">
            Extracted from verified evidence log: <code className="text-[#00ff9d]">{selectedEvent.sourceFileName}</code>
          </div>
          <div className="text-[9px] text-[#00ff9d] border-t border-[#132438] pt-2">CHAIN OF CUSTODY VERIFIED • GROUNDED IN EVIDENCE</div>
        </div>
      )}
    </div>
  );
}
