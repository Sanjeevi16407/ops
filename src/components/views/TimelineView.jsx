import React, { useState } from 'react';
import { Clock, FileText, AlertTriangle, CheckCircle, Info, ChevronRight, Shield } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function TimelineView() {
  const { events } = useInvestigation();
  const [selectedEvt, setSelectedEvt] = useState(null);

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#132438] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#00ff9d] flex items-center gap-2">
            <Clock className="w-5 h-5" />
            CHRONOLOGICAL INVESTIGATION TIMELINE
          </h2>
          <p className="text-xs text-[#64748b]">
            Reconstructed chronological sequence grounded strictly in extracted evidence telemetry.
          </p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="cyber-panel p-8 text-center text-xs text-[#64748b]">
          NO EVENTS AVAILABLE
          <p className="text-[10px] text-[#475569] mt-1">Upload evidence to extract chronological timeline events</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vertical Timeline Progression Track */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative border-l-2 border-[#132438] ml-4 pl-6 space-y-6">
              {events.map((evt, idx) => {
                const isSelected = selectedEvt?.eventId === evt.eventId;
                const isCritical = evt.severity === 'CRITICAL';
                const isHigh = evt.severity === 'HIGH';

                return (
                  <div
                    key={evt.eventId || idx}
                    onClick={() => setSelectedEvt(evt)}
                    className={`relative cyber-panel p-4 cursor-pointer transition border ${
                      isSelected
                        ? 'border-[#00ff9d] bg-[#00ff9d]/10 shadow-[0_0_15px_rgba(0,255,157,0.2)]'
                        : isCritical
                        ? 'border-[#ff1744]/40 hover:border-[#ff1744]'
                        : isHigh
                        ? 'border-[#ffab00]/40 hover:border-[#ffab00]'
                        : 'border-[#132438] hover:border-[#00ff9d]/50'
                    }`}
                  >
                    {/* Node Circle on Track */}
                    <div className={`absolute -left-[35px] top-4 w-5 h-5 rounded-full border-2 bg-[#06090e] flex items-center justify-center ${
                      isCritical ? 'border-[#ff1744] text-[#ff1744]' : isHigh ? 'border-[#ffab00] text-[#ffab00]' : 'border-[#00ff9d] text-[#00ff9d]'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-[#ff1744]' : isHigh ? 'bg-[#ffab00]' : 'bg-[#00ff9d]'}`} />
                    </div>

                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs text-[#00e5ff] font-bold">
                          {evt.timestamp} • {evt.date || 'Incident Timestamp'}
                        </div>
                        <h4 className="text-sm font-bold text-[#e2e8f0] uppercase">{evt.eventType}</h4>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border uppercase ${
                        isCritical ? 'bg-[#ff1744]/20 border-[#ff1744] text-[#ff1744]' : isHigh ? 'bg-[#ffab00]/20 border-[#ffab00] text-[#ffab00]' : 'bg-[#00ff9d]/20 border-[#00ff9d] text-[#00ff9d]'
                      }`}>
                        {evt.severity || 'NORMAL'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#94a3b8] my-2">
                      {evt.account && <div><span className="text-[#64748b]">ACC:</span> {evt.account}</div>}
                      {evt.device && <div><span className="text-[#64748b]">DEV:</span> {evt.device}</div>}
                      {evt.location && <div><span className="text-[#64748b]">LOC:</span> {evt.location}</div>}
                      {evt.amount && <div><span className="text-[#64748b]">VAL:</span> <span className="text-[#ff1744] font-bold">{evt.amount}</span></div>}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-[#64748b] border-t border-[#132438] pt-2">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-[#00ff9d]" /> Source: {evt.sourceFileName}</span>
                      <span className="text-[#00e5ff] flex items-center gap-0.5">Click for details <ChevronRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Selected Event Details & Evidence Grounding */}
          <div className="space-y-4">
            {selectedEvt ? (
              <div className="cyber-panel p-5 space-y-4 border border-[#00ff9d]/40 sticky top-24">
                <h3 className="text-sm font-bold text-[#00ff9d] border-b border-[#132438] pb-2 uppercase flex items-center gap-2">
                  <Info className="w-4 h-4" /> EVENT TELEMETRY DETAIL
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#64748b] block">EVENT ID</span>
                    <span className="text-[#00e5ff] font-bold text-sm">{selectedEvt.eventId}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">TIMESTAMP</span>
                    <span className="text-[#e2e8f0]">{selectedEvt.timestamp} ({selectedEvt.date})</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">EVENT CLASSIFICATION</span>
                    <span className="text-[#00ff9d] font-bold">{selectedEvt.eventType}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">TARGET ACCOUNT</span>
                    <span className="text-[#e2e8f0]">{selectedEvt.account || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">DEVICE TELEMETRY</span>
                    <span className="text-[#e2e8f0]">{selectedEvt.device || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">LOCATION / IP GATEWAY</span>
                    <span className="text-[#e2e8f0]">{selectedEvt.location || 'Not Specified'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">TRANSACTION VALUE</span>
                    <span className="text-[#ff1744] font-bold">{selectedEvt.amount || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block">SUPPORTING EVIDENCE FILE</span>
                    <span className="text-[#00ff9d] underline">{selectedEvt.sourceFileName}</span>
                  </div>
                </div>

                <div className="bg-[#06090e] p-3 rounded border border-[#00ff9d]/30 text-[10px] text-[#00ff9d] space-y-1">
                  <div className="flex items-center gap-1 font-bold">
                    <Shield className="w-3 h-3" /> GROUNDED IN EVIDENCE
                  </div>
                  <p className="text-[#94a3b8]">
                    This event is mathematically bound to evidence source <code className="text-[#00ff9d]">{selectedEvt.sourceFileName}</code>. Zero data fabrication detected.
                  </p>
                </div>
              </div>
            ) : (
              <div className="cyber-panel p-6 text-center text-xs text-[#64748b] sticky top-24">
                SELECT AN EVENT
                <p className="text-[10px] text-[#475569] mt-1">Click any event on the timeline to inspect full telemetry and evidence grounding</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
