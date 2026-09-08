import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, ShieldAlert, FileText } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function AIAssistantPanel() {
  const { chatMessages, sendAIMessage, evidenceList, setActiveTab } = useInvestigation();
  const [inputPrompt, setInputPrompt] = useState('');
  const chatEndRef = useRef(null);

  const quickPills = [
    "What happened?",
    "What evidence supports this event?",
    "Show the reconstructed timeline",
    "What inconsistencies were found?",
    "What remains unknown?",
    "What should I verify next?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    sendAIMessage(inputPrompt);
    setInputPrompt('');
  };

  const handlePillClick = (prompt) => {
    sendAIMessage(prompt);
  };

  if (!evidenceList || evidenceList.length === 0) {
    return (
      <div className="cyber-panel p-4 h-[360px] flex flex-col justify-between relative overflow-hidden font-mono-cyber">
        <div className="flex justify-between items-center border-b border-[#132438] pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#e2e8f0]">
            <Bot className="w-4 h-4 text-[#00ff9d]" />
            <span>ARVIX AI ASSISTANT</span>
          </div>
          <div className="text-[10px] text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-0.5 rounded border border-[#00ff9d]/30 font-bold">
            EVIDENCE-GROUNDED
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
          <ShieldAlert className="w-8 h-8 text-[#64748b]/50" />
          <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
            NO EVIDENCE LOADED
          </div>
          <div className="text-[10px] text-[#475569] max-w-xs">
            Upload evidence before asking ARVIX to reconstruct the case.
          </div>
          <button
            onClick={() => setActiveTab('evidence')}
            className="mt-2 bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/30 px-3 py-1 rounded text-[10px] font-bold"
          >
            [ UPLOAD EVIDENCE ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-panel p-4 h-[360px] flex flex-col justify-between relative font-mono-cyber">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#132438] pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#e2e8f0]">
          <Bot className="w-4 h-4 text-[#00ff9d]" />
          <span>ARVIX AI ASSISTANT</span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#00ff9d] bg-[#00ff9d]/10 px-2 py-0.5 rounded border border-[#00ff9d]/30 font-bold">
            EVIDENCE-GROUNDED
          </span>
        </div>
      </div>

      {/* Chat Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1 text-xs">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'INVESTIGATOR';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 text-[9px] text-[#64748b] mb-1">
                <span className={isUser ? 'text-[#00e5ff]' : 'text-[#00ff9d]'}>{msg.sender}</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[90%] p-3 rounded border text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#00e5ff]/10 border-[#00e5ff]/40 text-[#e2e8f0]'
                    : 'bg-[#061018] border-[#00ff9d]/40 text-[#e2e8f0] shadow-[0_0_12px_rgba(0,255,157,0.1)]'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {msg.evidenceRef && msg.evidenceRef.length > 0 && (
                  <div className="mt-2 pt-1.5 border-t border-[#132438] flex flex-wrap gap-1 text-[9px]">
                    <span className="text-[#64748b]">SOURCES:</span>
                    {msg.evidenceRef.map((src, i) => (
                      <span key={i} className="bg-[#00ff9d]/10 text-[#00ff9d] px-1.5 py-0.5 rounded border border-[#00ff9d]/30">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Question Pills */}
      <div className="flex flex-wrap gap-1 py-1.5 border-t border-[#132438]">
        {quickPills.slice(0, 4).map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handlePillClick(pill)}
            className="text-[9px] bg-[#02070b] hover:bg-[#00ff9d]/10 text-[#94a3b8] hover:text-[#00ff9d] border border-[#132438] hover:border-[#00ff9d]/40 px-2 py-0.5 rounded transition cursor-pointer"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask ARVIX anything..."
          className="flex-1 bg-[#02070b] border border-[#132438] focus:border-[#00ff9d] text-[#e2e8f0] placeholder-[#475569] text-xs font-mono-cyber px-3 py-2 rounded focus:outline-none transition"
        />
        <button
          type="submit"
          className="bg-[#00ff9d]/20 hover:bg-[#00ff9d]/30 border border-[#00ff9d]/60 text-[#00ff9d] p-2 rounded transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
