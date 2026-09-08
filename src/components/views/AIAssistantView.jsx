import React from 'react';
import AIAssistantPanel from '../dashboard/AIAssistantPanel';
import { Bot, Shield, FileText } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function AIAssistantView() {
  const { currentCase, evidenceList } = useInvestigation();

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#132438] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#00ff9d] flex items-center gap-2">
            <Bot className="w-5 h-5" />
            ARVIX EVIDENCE-GROUNDED AI INVESTIGATOR
          </h2>
          <p className="text-xs text-[#64748b]">
            Deterministic AI assistant bound strictly to current case evidence with zero hallucination guarantee.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIAssistantPanel />
        </div>

        {/* Right Info Box */}
        <div className="cyber-panel p-5 space-y-4 border border-[#00ff9d]/30">
          <h3 className="text-sm font-bold text-[#00ff9d] border-b border-[#132438] pb-2 uppercase flex items-center gap-2">
            <Shield className="w-4 h-4" /> ZERO-HALLUCINATION GUARANTEE
          </h3>

          <p className="text-xs text-[#94a3b8] leading-relaxed">
            The ARVIX AI Assistant evaluates queries strictly against uploaded evidence records. It will never invent suspects, timestamps, locations, or transactions.
          </p>

          <div className="bg-[#06090e] p-3 rounded border border-[#132438] text-xs space-y-2">
            <div className="text-[#00e5ff] font-bold">CURRENT BOUND EVIDENCE:</div>
            {evidenceList.length === 0 ? (
              <div className="text-[#64748b] text-[10px]">No evidence files currently bound.</div>
            ) : (
              evidenceList.map(e => (
                <div key={e.id} className="text-[#00ff9d] text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{e.fileName}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
