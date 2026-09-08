import React, { useState } from 'react';
import { Key, Cpu, AlertTriangle, ArrowRight, RefreshCw, Lock, Terminal } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function DemoOtpConsoleView() {
  const { demoOtp, generateNewDemoOtp, setActiveTab } = useInvestigation();

  const [displayDigits, setDisplayDigits] = useState(demoOtp.split(''));
  const [isRolling, setIsRolling] = useState(false);
  const [rollingIndex, setRollingIndex] = useState(-1);

  const handleGenerateNew = () => {
    setIsRolling(true);
    const newCode = generateNewDemoOtp();
    const newDigits = newCode.split('');

    setDisplayDigits(['0', '0', '0', '0', '0', '0']);

    // Sequential mechanical combination lock rolling animation
    let currentIdx = 0;
    const interval = setInterval(() => {
      setRollingIndex(currentIdx);
      setDisplayDigits(prev => {
        const copy = [...prev];
        copy[currentIdx] = newDigits[currentIdx];
        return copy;
      });

      currentIdx++;
      if (currentIdx >= 6) {
        clearInterval(interval);
        setIsRolling(false);
        setRollingIndex(-1);
      }
    }, 250);
  };

  return (
    <div className="min-h-[calc(100vh-61px)] flex items-center justify-center p-6 bg-transparent cyber-forensics-bg font-mono-cyber relative overflow-hidden">
      {/* Main Console Box */}
      <div className="w-full max-w-lg cyber-panel p-8 space-y-6 border border-[#00e5ff]/40 shadow-[0_0_35px_rgba(0,229,255,0.15)] relative z-10 text-center">
        {/* Banner Notice: DEMO MODE ONLY */}
        <div className="bg-[#ffab00]/15 border border-[#ffab00]/40 p-2.5 rounded text-xs text-[#ffab00] flex items-center justify-center gap-2 font-bold uppercase">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>DEMO MODE — NOT A PRODUCTION AUTHENTICATION SERVICE</span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-[#00e5ff]">
            <Key className="w-5 h-5" />
            <span>ARVIX DEMO OTP CONSOLE</span>
          </div>
          <p className="text-[10px] text-[#64748b]">
            Simulated Hardware Token Generator for Hackathon Demonstration
          </p>
        </div>

        {/* Session Badge */}
        <div className="text-xs text-[#64748b] bg-[#061018] py-1.5 px-3 rounded border border-[#132438] inline-block font-mono">
          SESSION TOKEN: <span className="text-[#00e5ff] font-bold">DEMO-SEC-8819</span>
        </div>

        {/* 6 Combination Lock Digit Slots */}
        <div className="space-y-2 py-4">
          <div className="text-[10px] text-[#64748b] uppercase tracking-wider">
            CURRENT VERIFICATION CODE
          </div>

          <div className="flex justify-center items-center gap-3">
            {displayDigits.map((digit, idx) => {
              const isSlotRolling = isRolling && idx >= rollingIndex;
              return (
                <div
                  key={idx}
                  className={`w-12 h-14 rounded border flex items-center justify-center text-xl font-bold transition-all duration-300 ${
                    isSlotRolling
                      ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] animate-pulse shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                      : 'bg-[#061018] border-[#00ff9d]/50 text-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.2)]'
                  }`}
                >
                  {isSlotRolling ? '•' : digit}
                </div>
              );
            })}
          </div>
        </div>

        {/* Control Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGenerateNew}
            disabled={isRolling}
            className="w-full bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-[#061018] font-bold py-3 rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.4)] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
            GENERATE NEW OTP
          </button>

          <button
            onClick={() => setActiveTab('login')}
            className="w-full bg-[#00ff9d]/20 hover:bg-[#00ff9d]/30 text-[#00ff9d] border border-[#00ff9d]/50 py-2.5 rounded text-xs transition flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            <span>RETURN TO INVESTIGATOR LOGIN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Footer info */}
        <div className="border-t border-[#132438] pt-3 text-[10px] text-[#64748b] flex justify-between items-center">
          <span className="flex items-center gap-1"><Terminal className="w-3 h-3 text-[#00e5ff]" /> CONSOLE ACTIVE</span>
          <span className="text-[#00ff9d]">ARVIX LAB UTILITY</span>
        </div>
      </div>
    </div>
  );
}
