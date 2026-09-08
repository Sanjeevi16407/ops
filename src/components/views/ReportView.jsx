import React from 'react';
import { FileCheck, Printer, ShieldCheck, Download, AlertTriangle, FileText, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';
import { generateEvidenceNarrative } from '../../services/narrativeEngine';

export default function ReportView() {
  const { currentCase, evidenceList, events, conflicts } = useInvestigation();
  const narrativeData = generateEvidenceNarrative(currentCase, evidenceList, events, conflicts);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#132438] pb-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-[#00ff9d] flex items-center gap-2">
            <FileCheck className="w-5 h-5" />
            DIGITAL FORENSICS INVESTIGATION REPORT
          </h2>
          <p className="text-xs text-[#64748b]">
            Comprehensive evidence-grounded report ready for courtroom/legal chain-of-custody export.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#06090e] font-bold px-4 py-2 rounded text-xs transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,157,0.3)]"
        >
          <Printer className="w-4 h-4" />
          PRINT / EXPORT PDF
        </button>
      </div>

      {/* Report Document Body */}
      <div className="cyber-panel p-8 space-y-6 border border-[#00ff9d]/30 text-xs leading-relaxed max-w-4xl mx-auto bg-[#0d1424]">
        {/* Document Header */}
        <div className="border-b-2 border-[#00ff9d] pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-[#00ff9d] tracking-widest">ARVIX FORENSIC REPORT</h1>
            <p className="text-[10px] text-[#64748b] uppercase">AI DIGITAL CRIME SCENE INVESTIGATION SYSTEM</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-[#00e5ff]">{currentCase?.id || 'CASE-EMPTY'}</div>
            <div className="text-[10px] text-[#64748b]">REPORT GENERATED: {new Date().toLocaleString()}</div>
          </div>
        </div>

        {/* Section 1: Case Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#00ff9d] uppercase border-b border-[#132438] pb-1">
            1. CASE EXECUTIVE SUMMARY
          </h3>
          <div className="grid grid-cols-2 gap-4 bg-[#06090e] p-3 rounded border border-[#132438]">
            <div><span className="text-[#64748b]">CASE NAME:</span> <span className="text-[#e2e8f0] font-bold">{currentCase?.name || 'No Active Case'}</span></div>
            <div><span className="text-[#64748b]">CRIME TYPE:</span> <span className="text-[#00ff9d] font-bold">{currentCase?.crimeType || 'N/A'}</span></div>
            <div><span className="text-[#64748b]">INVESTIGATOR UNIT:</span> <span className="text-[#e2e8f0]">{currentCase?.investigator || 'N/A'}</span></div>
            <div><span className="text-[#64748b]">STATUS:</span> <span className="text-[#00ff9d] font-bold">{currentCase?.status || 'N/A'}</span></div>
          </div>
        </div>

        {/* Section 2: Chain of Custody Evidence Inventory */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#00ff9d] uppercase border-b border-[#132438] pb-1">
            2. EVIDENCE VAULT INVENTORY & SHA-256 CHECKSUMS ({evidenceList.length} FILES)
          </h3>
          {evidenceList.length === 0 ? (
            <p className="text-[#64748b]">No evidence files recorded.</p>
          ) : (
            <div className="space-y-2">
              {evidenceList.map((e) => (
                <div key={e.id} className="bg-[#06090e] p-2.5 rounded border border-[#132438] flex justify-between items-center text-[11px]">
                  <div>
                    <span className="font-bold text-[#00e5ff]">{e.fileName}</span> <span className="text-[#64748b]">({e.fileType})</span>
                    <div className="text-[9px] text-[#64748b]">SHA-256: {e.hash}</div>
                  </div>
                  <span className="text-[10px] text-[#00ff9d]">{e.uploadTime}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: AI Evidence Narrative */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#00ff9d] uppercase border-b border-[#132438] pb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> 3. RECONSTRUCTED EVIDENCE NARRATIVE
          </h3>
          <div className="bg-[#06090e] p-3.5 rounded border border-[#00ff9d]/30 text-[#cbd5e1] whitespace-pre-line leading-relaxed">
            {narrativeData.summary}
          </div>
        </div>

        {/* Section 4: Extracted Timeline */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#00ff9d] uppercase border-b border-[#132438] pb-1">
            4. RECONSTRUCTED INCIDENT TIMELINE ({events.length} EVENTS)
          </h3>
          {events.length === 0 ? (
            <p className="text-[#64748b]">No events extracted.</p>
          ) : (
            <div className="space-y-1.5">
              {events.map((evt, idx) => (
                <div key={idx} className="bg-[#06090e] p-2 rounded border border-[#132438] flex justify-between">
                  <span><strong className="text-[#00e5ff]">{evt.timestamp}</strong> — <span className="text-[#e2e8f0]">{evt.eventType}</span></span>
                  <span className="text-[#00ff9d]">Source: {evt.sourceFileName}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 5: Detected Inconsistencies */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#00ff9d] uppercase border-b border-[#132438] pb-1">
            5. DETECTED INCONSISTENCIES & HUMAN ADJUDICATION ({conflicts.length})
          </h3>
          {conflicts.length === 0 ? (
            <p className="text-[#64748b]">No data conflicts detected.</p>
          ) : (
            <div className="space-y-2">
              {conflicts.map((c) => (
                <div key={c.conflictId} className="bg-[#06090e] p-3 rounded border border-[#ff1744]/40 space-y-1">
                  <div className="flex justify-between text-[#ff1744] font-bold">
                    <span>{c.conflictId}: {c.type}</span>
                    <span>SEVERITY: {c.severity}</span>
                  </div>
                  <p className="text-[#94a3b8]">{c.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 6: Unknown / Unresolved Information */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#ffab00] uppercase border-b border-[#132438] pb-1 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> 6. UNKNOWN / UNRESOLVED INFORMATION
          </h3>
          <div className="bg-[#06090e] p-3 rounded border border-[#ffab00]/30 space-y-1 text-[#cbd5e1]">
            <div>• The available evidence does NOT establish the physical identity of the human operator behind the device or account.</div>
            <div>• The available evidence does NOT establish whether authorization credentials were voluntarily shared, coerced, or stolen via malware.</div>
          </div>
        </div>

        {/* Report Footer */}
        <div className="border-t border-[#132438] pt-4 text-center text-[10px] text-[#64748b] space-y-1">
          <div>THIS REPORT WAS AUTOMATICALLY COMPILED BY ARVIX FORENSIC SYSTEM</div>
          <div className="text-[#00ff9d] font-bold">STRICTLY GROUNDED IN EVIDENCE • ZERO FABRICATION POLICY ENFORCED</div>
        </div>
      </div>
    </div>
  );
}
