import React, { useState } from 'react';
import { Network, FileText, User, Smartphone, MapPin, DollarSign, Lock, Eye, X } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function VisualGraphView() {
  const { events, evidenceList } = useInvestigation();
  const [selectedNode, setSelectedNode] = useState(null);

  // Generate unique nodes from events & evidence
  const nodes = [];
  const links = [];

  evidenceList.forEach(evd => {
    nodes.push({
      id: evd.id,
      label: evd.fileName,
      type: 'EVIDENCE',
      icon: FileText,
      color: '#00ff9d',
      details: `File Type: ${evd.fileType} | SHA-256: ${evd.hash.substring(0, 16)}...`
    });
  });

  events.forEach((evt, idx) => {
    // Event node
    const evtNodeId = `EVT-NODE-${idx}`;
    nodes.push({
      id: evtNodeId,
      label: evt.eventType,
      type: 'EVENT',
      icon: Network,
      color: evt.amount ? '#ff1744' : '#00e5ff',
      details: `${evt.timestamp} | Source: ${evt.sourceFileName}`
    });

    // Link event to source evidence
    if (evt.sourceEvidenceId) {
      links.push({ source: evtNodeId, target: evt.sourceEvidenceId, label: 'Extracted From' });
    }

    // Account node
    if (evt.account) {
      const accId = `ACC-${evt.account}`;
      if (!nodes.find(n => n.id === accId)) {
        nodes.push({
          id: accId,
          label: evt.account,
          type: 'ACCOUNT',
          icon: Lock,
          color: '#ffab00',
          details: `Target Account Registry`
        });
      }
      links.push({ source: evtNodeId, target: accId, label: 'Affects Account' });
    }
  });

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[#132438] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#00ff9d] flex items-center gap-2">
            <Network className="w-5 h-5" />
            EVIDENCE RELATIONSHIP GRAPH
          </h2>
          <p className="text-xs text-[#64748b]">
            Visual network topology linking evidence files, entities, accounts, and transactions.
          </p>
        </div>
      </div>

      {nodes.length === 0 ? (
        <div className="cyber-panel p-8 text-center text-xs text-[#64748b]">
          NO GRAPH NODES AVAILABLE
          <p className="text-[10px] text-[#475569] mt-1">Upload evidence files to generate entity relationship network</p>
        </div>
      ) : (
        <div className="cyber-panel p-6 h-[550px] relative overflow-hidden flex items-center justify-center">
          {/* Cyber Grid Background */}
          <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none" />

          {/* Interactive Graph Network Canvas simulation */}
          <div className="relative w-full h-full flex flex-wrap items-center justify-around p-8 z-10">
            {nodes.slice(0, 12).map((node, idx) => {
              const Icon = node.icon;
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3 rounded-lg border backdrop-blur-md cursor-pointer transition-all duration-300 hover:scale-110 flex items-center gap-2 m-2 ${
                    isSelected
                      ? 'bg-[#00ff9d]/20 border-[#00ff9d] shadow-[0_0_20px_rgba(0,255,157,0.4)] scale-105'
                      : 'bg-[#0d1424] border-[#132438] hover:border-[#00e5ff]'
                  }`}
                  style={{ color: node.color }}
                >
                  <Icon className="w-4 h-4" />
                  <div>
                    <div className="text-xs font-bold font-mono-cyber uppercase">{node.label}</div>
                    <div className="text-[9px] text-[#64748b]">{node.type}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Node Details Popover */}
          {selectedNode && (
            <div className="absolute bottom-6 right-6 w-80 bg-[#06090e]/95 p-4 rounded-lg border border-[#00ff9d] z-30 space-y-2 shadow-2xl">
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-[#00e5ff] font-bold">{selectedNode.type} NODE</span>
                <button onClick={() => setSelectedNode(null)} className="text-[#64748b] hover:text-[#ff1744]"><X className="w-4 h-4" /></button>
              </div>
              <h4 className="text-sm font-bold text-[#00ff9d]">{selectedNode.label}</h4>
              <p className="text-xs text-[#cbd5e1]">{selectedNode.details}</p>
              <div className="text-[9px] text-[#64748b] border-t border-[#132438] pt-2">
                CONNECTED RELATIONSHIPS SUPPORTED BY EVIDENCE
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
