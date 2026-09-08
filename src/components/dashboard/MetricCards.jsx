import React from 'react';
import { FolderLock, ListChecks, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function MetricCards() {
  const { evidenceList, events, conflicts, currentCase } = useInvestigation();

  // Unique entities count from real extracted events
  const uniqueEntities = new Set();
  events.forEach(e => {
    if (e.account) uniqueEntities.add(e.account);
    if (e.device) uniqueEntities.add(e.device);
    if (e.person) uniqueEntities.add(e.person);
  });

  const cards = [
    {
      id: 'files',
      label: 'EVIDENCE FILES',
      count: evidenceList.length,
      subtitle: 'FILES UPLOADED',
      icon: FolderLock,
      iconColor: 'text-[#00f5d4]',
      borderColor: 'border-[#00f5d4]/40',
      bgColor: 'bg-[#00f5d4]/15'
    },
    {
      id: 'events',
      label: 'EXTRACTED EVENTS',
      count: events.length,
      subtitle: 'EVENTS IDENTIFIED',
      icon: ListChecks,
      iconColor: 'text-[#00f5d4]',
      borderColor: 'border-[#00f5d4]/40',
      bgColor: 'bg-[#00f5d4]/15'
    },
    {
      id: 'entities',
      label: 'ENTITIES',
      count: uniqueEntities.size,
      subtitle: 'PEOPLE / ACCOUNTS / DEVICES',
      icon: Users,
      iconColor: 'text-[#00b4d8]',
      borderColor: 'border-[#00b4d8]/40',
      bgColor: 'bg-[#00b4d8]/15'
    },
    {
      id: 'conflicts',
      label: 'POTENTIAL CONFLICTS',
      count: conflicts.length,
      subtitle: conflicts.length > 0 ? 'HIGH PRIORITY ALERTS' : 'NO INCONSISTENCIES',
      icon: AlertTriangle,
      iconColor: conflicts.length > 0 ? 'text-[#ff1744]' : 'text-[#94a3b8]',
      borderColor: conflicts.length > 0 ? 'border-[#ff1744]/50' : 'border-[#00f5d4]/20',
      bgColor: conflicts.length > 0 ? 'bg-[#ff1744]/15' : 'bg-[rgba(15,62,77,0.3)]'
    },
    {
      id: 'status',
      label: 'CASE STATUS',
      count: evidenceList.length > 0 ? (currentCase?.status || 'ACTIVE') : 'AWAITING EVIDENCE',
      subtitle: evidenceList.length > 0 ? (currentCase?.statusText || 'INVESTIGATION ONGOING') : 'NO EVIDENCE LOADED',
      icon: ShieldCheck,
      iconColor: evidenceList.length > 0 ? 'text-[#00f5d4]' : 'text-[#94a3b8]',
      borderColor: evidenceList.length > 0 ? 'border-[#00f5d4]/50' : 'border-[#00f5d4]/20',
      bgColor: evidenceList.length > 0 ? 'bg-[#00f5d4]/15' : 'bg-[rgba(15,62,77,0.3)]',
      isStatusCard: true
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5 mb-4 sm:mb-5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className={`cyber-panel p-3 sm:p-4 flex items-center justify-between hover:border-[#00f5d4]/70 transition-all duration-300 group ${
              c.isStatusCard ? 'col-span-2 lg:col-span-1' : 'col-span-1'
            }`}
          >
            <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-1.5">
              <div className="text-[9px] sm:text-[10px] text-[#94a3b8] tracking-wider uppercase font-mono-cyber font-bold truncate">
                {c.label}
              </div>
              <div className={`font-extrabold font-mono-cyber truncate ${c.isStatusCard ? 'text-xs text-[#00f5d4] tracking-wider uppercase' : 'text-xl sm:text-2xl text-[#f8fafc] group-hover:text-[#00f5d4] transition'}`}>
                {c.count}
              </div>
              <div className="text-[8px] sm:text-[9px] text-[#64748b] tracking-widest uppercase font-mono-cyber truncate">
                {c.subtitle}
              </div>
            </div>

            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl ${c.bgColor} border ${c.borderColor} flex items-center justify-center ${c.iconColor} shrink-0 shadow-[0_0_15px_rgba(0,245,212,0.15)] group-hover:scale-110 transition duration-300`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
