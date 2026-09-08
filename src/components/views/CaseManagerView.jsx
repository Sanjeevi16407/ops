import React, { useState } from 'react';
import { Briefcase, Plus, Shield, Calendar, User, FileText, CheckCircle2, Trash2, FolderOpen, AlertTriangle, X } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function CaseManagerView() {
  const { currentCase, createCase, userCases, openSavedCase, handleDeleteCase, resetToEmptyState, setActiveTab } = useInvestigation();

  const [caseName, setCaseName] = useState('');
  const [crimeType, setCrimeType] = useState('Bank Fraud');
  const [description, setDescription] = useState('');

  // Delete modal confirmation state
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const crimeTypes = ['Bank Fraud', 'Online Scam', 'Account Compromise', 'Cyberattack', 'Other'];

  const handleCreateNew = (e) => {
    e.preventDefault();
    if (!caseName.trim()) return;

    const newCase = {
      id: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
      name: caseName,
      crimeType: crimeType,
      status: 'ACTIVE',
      statusText: 'INVESTIGATION IN PROGRESS',
      investigator: 'Lead Investigator',
      createdAt: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString(),
      description: description || 'New digital crime investigation initialized.',
      isDemo: false
    };

    createCase(newCase);
    setCaseName('');
    setDescription('');
    setActiveTab('dashboard');
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    handleDeleteCase(deleteTargetId);
    setDeleteTargetId(null);
    setToastMessage('Investigation deleted successfully.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Top Header */}
      <div className="flex flex-wrap justify-between items-center border-b border-[#132438] pb-4 gap-2">
        <div>
          <h2 className="text-lg font-bold text-[#00ff9d] flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            CASE HISTORY & INVESTIGATION MANAGER
          </h2>
          <p className="text-xs text-[#64748b]">
            Secure investigator repository storing cases, chain of custody, and forensic state.
          </p>
        </div>

        <button
          onClick={resetToEmptyState}
          className="bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#06090e] font-bold px-4 py-2 rounded text-xs transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,255,157,0.3)]"
        >
          <Plus className="w-4 h-4" />
          + NEW INVESTIGATION
        </button>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="bg-[#00ff9d]/20 border border-[#00ff9d] text-[#00ff9d] p-3 rounded text-xs flex items-center justify-between font-bold">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {toastMessage}
          </span>
          <button onClick={() => setToastMessage('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Initialize New Case Form */}
        <div className="cyber-panel p-5 space-y-4 border border-[#00ff9d]/30">
          <h3 className="text-sm font-bold text-[#00e5ff] flex items-center gap-2 border-b border-[#132438] pb-2 uppercase">
            <Plus className="w-4 h-4" />
            Initialize New Case
          </h3>

          <form onSubmit={handleCreateNew} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#64748b] mb-1">CASE NAME *</label>
              <input
                type="text"
                required
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="e.g. Unauthorized High-Value Transfer"
                className="w-full bg-[#02070b] border border-[#132438] focus:border-[#00ff9d] text-[#e2e8f0] px-3 py-2 rounded focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#64748b] mb-1">CRIME TYPE *</label>
              <select
                value={crimeType}
                onChange={(e) => setCrimeType(e.target.value)}
                className="w-full bg-[#02070b] border border-[#132438] focus:border-[#00ff9d] text-[#e2e8f0] px-3 py-2 rounded focus:outline-none"
              >
                {crimeTypes.map((type) => (
                  <option key={type} value={type} className="bg-[#061018]">
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#64748b] mb-1">DESCRIPTION</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of initial incident report..."
                className="w-full bg-[#02070b] border border-[#132438] focus:border-[#00ff9d] text-[#e2e8f0] px-3 py-2 rounded focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#06090e] font-bold py-2.5 rounded text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,157,0.3)]"
            >
              <Shield className="w-4 h-4" />
              CREATE CASE
            </button>
          </form>
        </div>

        {/* Right 2 Columns: User Case History Table / List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider">
            INVESTIGATION CASE HISTORY ({userCases.length})
          </h3>

          {userCases.length === 0 ? (
            <div className="cyber-panel p-8 text-center text-xs text-[#64748b] space-y-2">
              <div className="font-bold text-xs text-[#64748b]">NO INVESTIGATION HISTORY</div>
              <p className="text-[10px] text-[#475569]">
                Create or upload evidence to begin a new investigation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userCases.map((c) => {
                const isActive = currentCase?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`cyber-panel p-4 space-y-3 transition border ${
                      isActive
                        ? 'border-[#00ff9d] bg-[#00ff9d]/10 shadow-[0_0_15px_rgba(0,255,157,0.2)]'
                        : 'border-[#132438] hover:border-[#00e5ff]/40'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#00e5ff] font-bold">{c.id}</span>
                          <span className="text-[10px] bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/30 px-2 py-0.5 rounded font-bold">
                            {c.crimeType}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#e2e8f0] mt-1">{c.name}</h4>
                      </div>

                      {/* Case Status Badge */}
                      <span className="text-[10px] text-[#00ff9d] bg-[#00ff9d]/20 px-2.5 py-1 rounded border border-[#00ff9d]/40 font-bold">
                        {c.status || 'ACTIVE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#94a3b8] bg-[#02070b] p-2.5 rounded border border-[#132438]">
                      <div>
                        <span className="text-[#64748b] block text-[9px]">CREATED</span>
                        <span className="text-[#e2e8f0]">{c.createdAt}</span>
                      </div>
                      <div>
                        <span className="text-[#64748b] block text-[9px]">LAST UPDATED</span>
                        <span className="text-[#e2e8f0]">{c.updatedAt || c.createdAt}</span>
                      </div>
                      <div>
                        <span className="text-[#64748b] block text-[9px]">EVIDENCE COUNT</span>
                        <span className="text-[#00ff9d] font-bold">{c.evidenceCount || (c.evidenceMetadata ? c.evidenceMetadata.length : 0)}</span>
                      </div>
                      <div>
                        <span className="text-[#64748b] block text-[9px]">INVESTIGATOR</span>
                        <span className="text-[#e2e8f0]">{c.investigator || 'Lead Agent'}</span>
                      </div>
                    </div>

                    {/* Case Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#132438] pt-2.5">
                      <button
                        onClick={() => openSavedCase(c)}
                        className="text-xs bg-[#00ff9d]/20 hover:bg-[#00ff9d]/30 text-[#00ff9d] border border-[#00ff9d]/50 px-4 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer font-bold"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        OPEN CASE
                      </button>

                      <button
                        onClick={() => setDeleteTargetId(c.id)}
                        className="text-xs bg-[#ff1744]/10 hover:bg-[#ff1744]/20 text-[#ff1744] border border-[#ff1744]/40 px-3 py-1.5 rounded transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        DELETE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Permanent Delete Case Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-[#02070b]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="cyber-panel p-6 max-w-md w-full border border-[#ff1744] space-y-4 shadow-[0_0_30px_rgba(255,23,68,0.3)]">
            <div className="flex items-center gap-2 text-sm font-bold text-[#ff1744]">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
              <span>DELETE INVESTIGATION?</span>
            </div>

            <p className="text-xs text-[#94a3b8] leading-relaxed">
              This will permanently remove this case (<strong className="text-[#00e5ff]">{deleteTargetId}</strong>) and its associated evidence, timeline, and forensic investigation data. This action cannot be undone.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 bg-[#061018] text-[#94a3b8] border border-[#132438] py-2 rounded text-xs font-bold transition cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-[#ff1744] hover:bg-[#ff1744]/80 text-[#ffffff] py-2 rounded text-xs font-bold transition cursor-pointer shadow-[0_0_15px_rgba(255,23,68,0.4)]"
              >
                DELETE PERMANENTLY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
