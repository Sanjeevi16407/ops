import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2, XCircle, HelpCircle, Save, AlertTriangle, FileText } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function CompareEvidenceView() {
  const { selectedConflictForCompare, conflicts, reviewConflict, setActiveTab } = useInvestigation();

  const conflict = selectedConflictForCompare || conflicts[0];
  const [note, setNote] = useState('');

  if (!conflict) {
    return (
      <div className="cyber-panel p-8 text-center text-xs font-mono-cyber text-[#64748b]">
        NO CONFLICT SELECTED FOR COMPARISON
        <p className="text-[10px] text-[#475569] mt-1">Go to Threat Analysis / Conflicts page and click "COMPARE"</p>
        <button
          onClick={() => setActiveTab('conflicts')}
          className="mt-4 bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 px-4 py-2 rounded"
        >
          GO TO CONFLICTS
        </button>
      </div>
    );
  }

  const handleDecision = (decision) => {
    reviewConflict(conflict.conflictId, decision, note);
    alert(`Investigator Review Saved: [${decision}] for Conflict ${conflict.conflictId}`);
  };

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#132438] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#00e5ff] flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5" />
            SIDE-BY-SIDE EVIDENCE COMPARISON TOOL
          </h2>
          <p className="text-xs text-[#64748b]">
            Inspect field-by-field discrepancies between independent evidence files.
          </p>
        </div>
      </div>

      {/* Side-by-Side Comparison Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Discrepancy Alert Badge Overlay in Center */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#ff1744]/20 border-2 border-[#ff1744] text-[#ff1744] flex items-center justify-center shadow-[0_0_20px_rgba(255,23,68,0.5)] animate-bounce">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-[#ff1744] bg-[#06090e] px-2 py-0.5 rounded border border-[#ff1744]/40 mt-1 uppercase">
            {conflict.type}
          </span>
        </div>

        {/* Source A Column */}
        <div className="cyber-panel p-5 space-y-4 border border-[#00ff9d]/40">
          <div className="flex justify-between items-center border-b border-[#132438] pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00ff9d]" />
              <span className="text-xs font-bold text-[#00ff9d] uppercase">
                SOURCE A: {conflict.sourceA.fileName}
              </span>
            </div>
            <span className="text-[10px] text-[#64748b]">EVIDENCE ID: {conflict.sourceA.evidenceId}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded bg-[#06090e] border border-[#132438] flex justify-between">
              <span className="text-[#64748b]">TRANSACTION ID:</span>
              <span className="text-[#00e5ff] font-bold">{conflict.transactionId}</span>
            </div>

            <div className="p-2.5 rounded bg-[#06090e] border border-[#132438] flex justify-between">
              <span className="text-[#64748b]">AMOUNT:</span>
              <span className="text-[#e2e8f0] font-bold">{conflict.sourceA.amount || '₹2,50,000'}</span>
            </div>

            <div className={`p-2.5 rounded border flex justify-between ${
              conflict.type.includes('Timestamp')
                ? 'bg-[#ff1744]/15 border-[#ff1744] text-[#ff1744] font-bold shadow-[0_0_12px_rgba(255,23,68,0.3)]'
                : 'bg-[#06090e] border-[#132438] text-[#e2e8f0]'
            }`}>
              <span>TIMESTAMP:</span>
              <span>{conflict.sourceA.timestamp}</span>
            </div>

            <div className="p-2.5 rounded bg-[#06090e] border border-[#132438] flex justify-between">
              <span className="text-[#64748b]">ACCOUNT:</span>
              <span className="text-[#e2e8f0]">{conflict.sourceA.account || 'A0019284'}</span>
            </div>
          </div>
        </div>

        {/* Source B Column */}
        <div className="cyber-panel p-5 space-y-4 border border-[#ff1744]/40">
          <div className="flex justify-between items-center border-b border-[#132438] pb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#ff1744]" />
              <span className="text-xs font-bold text-[#ff1744] uppercase">
                SOURCE B: {conflict.sourceB.fileName}
              </span>
            </div>
            <span className="text-[10px] text-[#64748b]">EVIDENCE ID: {conflict.sourceB.evidenceId}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-2.5 rounded bg-[#06090e] border border-[#132438] flex justify-between">
              <span className="text-[#64748b]">TRANSACTION ID:</span>
              <span className="text-[#00e5ff] font-bold">{conflict.transactionId}</span>
            </div>

            <div className="p-2.5 rounded bg-[#06090e] border border-[#132438] flex justify-between">
              <span className="text-[#64748b]">AMOUNT:</span>
              <span className="text-[#e2e8f0] font-bold">{conflict.sourceB.amount || '₹2,50,000'}</span>
            </div>

            <div className={`p-2.5 rounded border flex justify-between ${
              conflict.type.includes('Timestamp')
                ? 'bg-[#ff1744]/15 border-[#ff1744] text-[#ff1744] font-bold shadow-[0_0_12px_rgba(255,23,68,0.3)]'
                : 'bg-[#06090e] border-[#132438] text-[#e2e8f0]'
            }`}>
              <span>TIMESTAMP:</span>
              <span>{conflict.sourceB.timestamp}</span>
            </div>

            <div className="p-2.5 rounded bg-[#06090e] border border-[#132438] flex justify-between">
              <span className="text-[#64748b]">ACCOUNT:</span>
              <span className="text-[#e2e8f0]">{conflict.sourceB.account || 'A0019284'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Investigator Human Verification Panel */}
      <div className="cyber-panel p-6 space-y-4 border border-[#00ff9d]/30">
        <h3 className="text-sm font-bold text-[#00ff9d] uppercase flex items-center gap-2 border-b border-[#132438] pb-2">
          INVESTIGATOR HUMAN VERIFICATION & ADJUDICATION
        </h3>

        <div>
          <label className="block text-xs text-[#64748b] mb-1">INVESTIGATOR ANALYSIS NOTE</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Statement PDF reflects interbank clearing settlement time rather than core debit time..."
            className="w-full bg-[#06090e] border border-[#132438] focus:border-[#00ff9d] text-[#e2e8f0] text-xs p-3 rounded focus:outline-none"
          />
        </div>

        {/* Human Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => handleDecision('CONFIRMED CONFLICT')}
            className="bg-[#ff1744]/20 hover:bg-[#ff1744]/30 text-[#ff1744] border border-[#ff1744] px-4 py-2 rounded text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(255,23,68,0.3)]"
          >
            <CheckCircle2 className="w-4 h-4" />
            CONFIRM CONFLICT
          </button>

          <button
            onClick={() => handleDecision('NOT A CONFLICT')}
            className="bg-[#00ff9d]/20 hover:bg-[#00ff9d]/30 text-[#00ff9d] border border-[#00ff9d] px-4 py-2 rounded text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,255,157,0.3)]"
          >
            <XCircle className="w-4 h-4" />
            NOT A CONFLICT
          </button>

          <button
            onClick={() => handleDecision('NEEDS MORE EVIDENCE')}
            className="bg-[#ffab00]/20 hover:bg-[#ffab00]/30 text-[#ffab00] border border-[#ffab00] px-4 py-2 rounded text-xs font-bold transition flex items-center gap-2 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            NEEDS MORE EVIDENCE
          </button>
        </div>
      </div>
    </div>
  );
}
