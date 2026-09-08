import React, { useState } from 'react';
import { AlertTriangle, Eye, ArrowLeftRight, CheckSquare, ShieldAlert } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function ConflictsView() {
  const { conflicts, setActiveTab, setSelectedConflictForCompare } = useInvestigation();
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const highCount = conflicts.filter(c => c.severity === 'HIGH').length;
  const medCount = conflicts.filter(c => c.severity === 'MEDIUM').length;
  const lowCount = conflicts.filter(c => c.severity === 'LOW').length;

  const filteredConflicts = filterSeverity === 'ALL'
    ? conflicts
    : conflicts.filter(c => c.severity === filterSeverity);

  const handleCompare = (conflict) => {
    setSelectedConflictForCompare(conflict);
    setActiveTab('compare');
  };

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#132438] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#ff1744] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            EVIDENCE CONFLICT DETECTION ENGINE
          </h2>
          <p className="text-xs text-[#64748b]">
            Automated detection of incompatible semantic statements across independent evidence sources.
          </p>
        </div>

        {/* Severity Summary Filter Pills */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1 rounded border cursor-pointer ${filterSeverity === 'ALL' ? 'bg-[#00ff9d]/20 border-[#00ff9d] text-[#00ff9d]' : 'bg-[#0d1424] border-[#132438] text-[#64748b]'}`}
          >
            ALL ({conflicts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-3 py-1 rounded border cursor-pointer ${filterSeverity === 'HIGH' ? 'bg-[#ff1744]/20 border-[#ff1744] text-[#ff1744]' : 'bg-[#0d1424] border-[#132438] text-[#64748b]'}`}
          >
            HIGH ({highCount})
          </button>
          <button
            onClick={() => setFilterSeverity('MEDIUM')}
            className={`px-3 py-1 rounded border cursor-pointer ${filterSeverity === 'MEDIUM' ? 'bg-[#ffab00]/20 border-[#ffab00] text-[#ffab00]' : 'bg-[#0d1424] border-[#132438] text-[#64748b]'}`}
          >
            MEDIUM ({medCount})
          </button>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <div className="cyber-panel p-8 text-center text-xs text-[#64748b]">
          NO POTENTIAL INCONSISTENCIES DETECTED
          <p className="text-[10px] text-[#475569] mt-1">Upload multiple evidence sources to trigger semantic conflict analysis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredConflicts.map((c) => {
            const isHigh = c.severity === 'HIGH';
            return (
              <div
                key={c.conflictId}
                className={`cyber-panel p-5 space-y-4 border ${
                  isHigh
                    ? 'border-[#ff1744]/40 bg-[#ff1744]/5 shadow-[0_0_15px_rgba(255,23,68,0.1)]'
                    : 'border-[#ffab00]/40 bg-[#ffab00]/5'
                }`}
              >
                {/* Card Top Row */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#00e5ff] font-bold">{c.conflictId}</span>
                      <span className="text-xs font-bold text-[#ff1744] uppercase tracking-wider">
                        POTENTIAL {c.type.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#e2e8f0]">{c.event}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-3 py-1 rounded border ${
                      isHigh ? 'bg-[#ff1744]/20 border-[#ff1744] text-[#ff1744]' : 'bg-[#ffab00]/20 border-[#ffab00] text-[#ffab00]'
                    }`}>
                      SEVERITY: {c.severity}
                    </span>
                    <span className="text-[10px] bg-[#0d1424] text-[#00ff9d] border border-[#132438] px-2 py-1 rounded">
                      {c.status}
                    </span>
                  </div>
                </div>

                {/* Source Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#06090e] p-3.5 rounded border border-[#132438] text-xs">
                  {/* Source A */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-[#64748b] uppercase font-bold">SOURCE A ({c.sourceA.fileName})</div>
                    <div className="text-[#00ff9d] font-bold">Recorded: {c.sourceA.timestamp || c.sourceA.amount || c.sourceA.location}</div>
                  </div>

                  {/* Source B */}
                  <div className="space-y-1 border-t md:border-t-0 md:border-l border-[#132438] pt-2 md:pt-0 md:pl-4">
                    <div className="text-[10px] text-[#64748b] uppercase font-bold">SOURCE B ({c.sourceB.fileName})</div>
                    <div className="text-[#ff1744] font-bold">Recorded: {c.sourceB.timestamp || c.sourceB.amount || c.sourceB.location}</div>
                  </div>
                </div>

                {/* Reason Explanation */}
                <p className="text-xs text-[#94a3b8] leading-relaxed italic">
                  "{c.reason}"
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 border-t border-[#132438] pt-3">
                  <button
                    onClick={() => setActiveTab('evidence')}
                    className="text-xs bg-[#0d1424] hover:bg-[#121c33] text-[#94a3b8] hover:text-[#00ff9d] border border-[#132438] px-3.5 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    VIEW EVIDENCE
                  </button>

                  <button
                    onClick={() => handleCompare(c)}
                    className="text-xs bg-[#00e5ff]/20 hover:bg-[#00e5ff]/30 text-[#00e5ff] border border-[#00e5ff]/50 px-3.5 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer font-bold"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    COMPARE
                  </button>

                  <button
                    onClick={() => handleCompare(c)}
                    className="text-xs bg-[#00ff9d]/20 hover:bg-[#00ff9d]/30 text-[#00ff9d] border border-[#00ff9d]/50 px-3.5 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer font-bold"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    REVIEW
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
