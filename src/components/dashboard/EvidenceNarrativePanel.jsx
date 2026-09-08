import React, { useState } from 'react';
import { Sparkles, Cpu, CheckCircle2, AlertTriangle, HelpCircle, FileText, ArrowRight, ShieldCheck, RefreshCw, Eye } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';
import { generateEvidenceNarrative } from '../../services/narrativeEngine';

export default function EvidenceNarrativePanel() {
  const { currentCase, evidenceList, events, conflicts, setActiveTab } = useInvestigation();

  const [isReconstructing, setIsReconstructing] = useState(false);
  const [reconstructionStep, setReconstructionStep] = useState(0);
  const [investigatorNote, setInvestigatorNote] = useState('');
  const [confirmedFindings, setConfirmedFindings] = useState([]);

  const narrativeData = generateEvidenceNarrative(currentCase, evidenceList, events, conflicts);

  const steps = [
    "ANALYZING EVIDENCE...",
    "RECONSTRUCTING EVENTS...",
    "CORRELATING SOURCES...",
    "CHECKING CONSISTENCY...",
    "GENERATING EVIDENCE NARRATIVE..."
  ];

  const handleTriggerReconstruction = () => {
    setIsReconstructing(true);
    setReconstructionStep(0);

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setReconstructionStep(stepIdx);
      } else {
        clearInterval(interval);
        setIsReconstructing(false);
      }
    }, 450);
  };

  const handleConfirmFinding = (index) => {
    setConfirmedFindings(prev => [...prev, index]);
  };

  if (!narrativeData.isAvailable) {
    return (
      <div className="cyber-panel p-6 border border-[#132438] text-center space-y-3 font-mono-cyber">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#00ff9d]">
          <Sparkles className="w-4 h-4 text-[#00ff9d]" />
          <span>AI EVIDENCE RECONSTRUCTION</span>
        </div>
        <div className="text-xs text-[#64748b]">
          Evidence narrative unavailable. Upload evidence to begin reconstruction.
        </div>
        <button
          onClick={() => setActiveTab('evidence')}
          className="bg-[#00ff9d]/10 hover:bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 px-4 py-2 rounded text-xs transition cursor-pointer font-bold inline-flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          UPLOAD EVIDENCE
        </button>
      </div>
    );
  }

  return (
    <div className="cyber-panel p-5 space-y-4 border border-[#00ff9d]/40 relative overflow-hidden font-mono-cyber">
      {/* Header & Reconstruct Story Trigger Button */}
      <div className="flex flex-wrap justify-between items-center border-b border-[#132438] pb-3 gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#00ff9d]">
          <Sparkles className="w-4 h-4 text-[#00ff9d] animate-pulse" />
          <span>AI EVIDENCE RECONSTRUCTION NARRATIVE</span>
        </div>

        <button
          onClick={handleTriggerReconstruction}
          disabled={isReconstructing}
          className="bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#06090e] font-bold px-4 py-1.5 rounded text-xs transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,157,0.4)] disabled:opacity-50"
        >
          <Cpu className={`w-4 h-4 ${isReconstructing ? 'animate-spin' : ''}`} />
          {isReconstructing ? 'RECONSTRUCTING...' : '⚡ RECONSTRUCT STORY'}
        </button>
      </div>

      {/* Step-by-Step Processing Animation Overlay */}
      {isReconstructing ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4 bg-[#06090e]/90 rounded border border-[#00ff9d]/30 my-2">
          <Cpu className="w-10 h-10 text-[#00ff9d] animate-spin" />
          <div className="text-xs font-bold text-[#00ff9d] tracking-widest animate-pulse">
            {steps[reconstructionStep]}
          </div>
          <div className="w-48 h-1.5 bg-[#132438] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00ff9d] transition-all duration-300"
              style={{ width: `${((reconstructionStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      ) : (
        /* Reconstructed Narrative Story Content */
        <div className="space-y-4 text-xs">
          {/* Executive Evidence Summary Box */}
          <div className="bg-[#06090e] p-4 rounded border border-[#00ff9d]/30 space-y-2 leading-relaxed">
            <div className="text-[10px] text-[#00e5ff] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>EVIDENCE-BACKED RECONSTRUCTED NARRATIVE</span>
              <span className="text-[#00ff9d] border border-[#00ff9d]/30 px-2 py-0.5 rounded text-[9px]">
                GROUNDED IN EVIDENCE
              </span>
            </div>
            <p className="text-[#cbd5e1] whitespace-pre-line">
              {narrativeData.summary}
            </p>
          </div>

          {/* Section 1: Direct Evidence vs Correlated vs Inconsistencies vs Unknown */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-[#00ff9d] uppercase tracking-wider border-b border-[#132438] pb-1">
              EVIDENCE CONFIDENCE CLASSIFICATIONS
            </h4>

            {/* Direct Evidence */}
            {narrativeData.directEvidence.slice(0, 3).map((item, idx) => (
              <div key={idx} className="bg-[#0d1424] p-3 rounded border border-[#00ff9d]/30 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 px-2 py-0.5 rounded font-bold">
                    DIRECT EVIDENCE
                  </span>
                  <span className="text-[#00e5ff] flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Source: {item.source}
                  </span>
                </div>
                <p className="text-[#e2e8f0] text-xs">{item.text}</p>
                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => handleConfirmFinding(idx)}
                    className={`text-[9px] px-2 py-0.5 rounded border transition cursor-pointer ${
                      confirmedFindings.includes(idx)
                        ? 'bg-[#00ff9d] text-[#06090e] font-bold border-[#00ff9d]'
                        : 'bg-[#06090e] text-[#00ff9d] border-[#00ff9d]/30 hover:bg-[#00ff9d]/20'
                    }`}
                  >
                    {confirmedFindings.includes(idx) ? '✓ CONFIRMED BY INVESTIGATOR' : '[ CONFIRM FINDING ]'}
                  </button>
                  <button
                    onClick={() => setActiveTab('evidence')}
                    className="text-[9px] bg-[#06090e] text-[#94a3b8] hover:text-[#00e5ff] border border-[#132438] px-2 py-0.5 rounded transition cursor-pointer"
                  >
                    [ VIEW EVIDENCE ]
                  </button>
                </div>
              </div>
            ))}

            {/* Inconsistencies */}
            {narrativeData.inconsistencies.map((item, idx) => (
              <div key={idx} className="bg-[#ff1744]/10 p-3 rounded border border-[#ff1744]/40 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="bg-[#ff1744]/20 text-[#ff1744] border border-[#ff1744]/50 px-2 py-0.5 rounded font-bold">
                    POTENTIAL INCONSISTENCY
                  </span>
                  <span className="text-[#ff1744]">SEVERITY: {item.severity}</span>
                </div>
                <p className="text-[#e2e8f0] text-xs">{item.text}</p>
                <div className="pt-1">
                  <button
                    onClick={() => setActiveTab('compare')}
                    className="text-[9px] bg-[#ff1744]/20 text-[#ff1744] border border-[#ff1744]/50 px-2 py-0.5 rounded transition cursor-pointer font-bold"
                  >
                    [ COMPARE SOURCES SIDE-BY-SIDE ]
                  </button>
                </div>
              </div>
            ))}

            {/* What Evidence Does NOT Establish (UNKNOWN) */}
            <div className="bg-[#06090e] p-3 rounded border border-[#ffab00]/30 space-y-2">
              <div className="text-[10px] text-[#ffab00] font-bold uppercase flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                WHAT THE EVIDENCE DOES NOT ESTABLISH (UNRESOLVED)
              </div>
              <ul className="space-y-1 text-xs text-[#cbd5e1]">
                {narrativeData.unknowns.map((unk, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-[#ffab00] font-bold">•</span>
                    <span>{unk.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Verification Steps */}
          <div className="bg-[#0d1424] p-3.5 rounded border border-[#132438] space-y-2">
            <div className="text-[10px] text-[#00e5ff] font-bold uppercase">
              RECOMMENDED INVESTIGATOR VERIFICATION STEPS
            </div>
            <ul className="space-y-1 text-xs text-[#94a3b8]">
              {narrativeData.recommendedSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-[#00ff9d] shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
