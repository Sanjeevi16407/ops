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
      iconColor: 'text-[#00ff9d]',
      borderColor: 'border-[#00ff9d]/30',
      bgColor: 'bg-[#00ff9d]/10'
    },
    {
      id: 'events',
      label: 'EXTRACTED EVENTS',
      count: events.length,
      subtitle: 'EVENTS IDENTIFIED',
      icon: ListChecks,
      iconColor: 'text-[#00ff9d]',
      borderColor: 'border-[#00ff9d]/30',
      bgColor: 'bg-[#00ff9d]/10'
    },
    {
      id: 'entities',
      label: 'ENTITIES',
      count: uniqueEntities.size,
      subtitle: 'PEOPLE / ACCOUNTS / DEVICES',
      icon: Users,
      iconColor: 'text-[#00e5ff]',
      borderColor: 'border-[#00e5ff]/30',
      bgColor: 'bg-[#00e5ff]/10'
    },
    {
      id: 'conflicts',
      label: 'POTENTIAL CONFLICTS',
      count: conflicts.length,
      subtitle: conflicts.length > 0 ? 'HIGH PRIORITY ALERTS' : 'NO INCONSISTENCIES',
      icon: AlertTriangle,
      iconColor: conflicts.length > 0 ? 'text-[#ff1744]' : 'text-[#64748b]',
      borderColor: conflicts.length > 0 ? 'border-[#ff1744]/40' : 'border-[#132438]',
      bgColor: conflicts.length > 0 ? 'bg-[#ff1744]/10' : 'bg-[#0d1424]'
    },
    {
      id: 'status',
      label: 'CASE STATUS',
      count: evidenceList.length > 0 ? (currentCase?.status || 'ACTIVE') : 'AWAITING EVIDENCE',
      subtitle: evidenceList.length > 0 ? (currentCase?.statusText || 'INVESTIGATION ONGOING') : 'NO EVIDENCE LOADED',
      icon: ShieldCheck,
      iconColor: evidenceList.length > 0 ? 'text-[#00ff9d]' : 'text-[#64748b]',
      borderColor: evidenceList.length > 0 ? 'border-[#00ff9d]/40' : 'border-[#132438]',
      bgColor: evidenceList.length > 0 ? 'bg-[#00ff9d]/10' : 'bg-[#0d1424]',
      isStatusCard: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.id}
            className={`cyber-panel p-3.5 flex items-center justify-between border ${c.borderColor} hover:border-[#00ff9d]/60 transition`}
          >
            <div className="space-y-1">
              <div className="text-[10px] text-[#64748b] tracking-wider uppercase font-mono-cyber font-semibold">
                {c.label}
              </div>
              <div className={`font-bold font-mono-cyber ${c.isStatusCard ? 'text-xs text-[#00ff9d] tracking-wider uppercase' : 'text-xl text-[#e2e8f0]'}`}>
                {c.count}
              </div>
              <div className="text-[9px] text-[#64748b] tracking-widest uppercase font-mono-cyber">
                {c.subtitle}
              </div>
            </div>

            <div className={`w-10 h-10 rounded ${c.bgColor} border ${c.borderColor} flex items-center justify-center ${c.iconColor} shrink-0`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
