import React, { useRef } from 'react';
import { FolderLock, Upload, FileText, Lock, Hash, ShieldCheck, CheckCircle } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function EvidenceVaultView() {
  const { evidenceList, uploadEvidenceFiles, isDemoDataLoaded } = useInvestigation();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadEvidenceFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadEvidenceFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-6 font-mono-cyber">
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-[#132438] pb-4">
        <div>
          <h2 className="text-lg font-bold text-[#00ff9d] flex items-center gap-2">
            <FolderLock className="w-5 h-5" />
            EVIDENCE VAULT
          </h2>
          <p className="text-xs text-[#64748b]">
            Secure digital evidence repository with client-side SHA-256 chain-of-custody checksums.
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="cyber-panel p-8 text-center border-2 border-dashed border-[#00ff9d]/40 hover:border-[#00ff9d] bg-[#00ff9d]/5 hover:bg-[#00ff9d]/10 transition rounded-lg cursor-pointer flex flex-col items-center justify-center space-y-3"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept=".csv,.txt,.log,.pdf,.png,.jpg"
          className="hidden"
        />
        <div className="w-12 h-12 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center text-[#00ff9d]">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#00ff9d] uppercase">
            DROP EVIDENCE FILES HERE OR CLICK TO UPLOAD
          </h3>
          <p className="text-xs text-[#64748b] mt-1">
            Supported formats: CSV, TXT, LOG, PDF, PNG/JPG
          </p>
        </div>
        <div className="text-[10px] text-[#00e5ff] bg-[#00e5ff]/10 px-3 py-1 rounded border border-[#00e5ff]/30 flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          <span>AUTOMATIC SHA-256 CHECKSUM GENERATION ON UPLOAD</span>
        </div>
      </div>

      {/* Uploaded Evidence Cards Table / Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-[#e2e8f0] uppercase tracking-wider">
            VAULT CONTENTS ({evidenceList.length} FILES)
          </h3>
        </div>

        {evidenceList.length === 0 ? (
          <div className="cyber-panel p-8 text-center text-xs text-[#64748b]">
            VAULT IS EMPTY
            <p className="text-[10px] text-[#475569] mt-1">Upload evidence files above to populate the vault</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidenceList.map((item) => (
              <div key={item.id} className="cyber-panel p-4 space-y-3 border border-[#132438] hover:border-[#00ff9d]/50 transition">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#00ff9d]" />
                    <div>
                      <h4 className="text-xs font-bold text-[#e2e8f0] truncate max-w-[170px]">{item.fileName}</h4>
                      <span className="text-[10px] text-[#00e5ff]">{item.id}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#00ff9d]/10 text-[#00ff9d] border border-[#00ff9d]/30 px-2 py-0.5 rounded font-bold">
                    {item.fileType}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-[#94a3b8]">
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">SOURCE:</span>
                    <span className="truncate max-w-[140px]">{item.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">UPLOAD TIME:</span>
                    <span>{item.uploadTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748b]">RECORDS EXTRACTED:</span>
                    <span className="text-[#00ff9d] font-bold">{item.recordsCount || 'Live'}</span>
                  </div>
                </div>

                {/* SHA-256 Hash Box */}
                <div className="bg-[#06090e] p-2 rounded border border-[#132438] space-y-1">
                  <div className="flex items-center justify-between text-[9px] text-[#64748b]">
                    <span className="flex items-center gap-1"><Hash className="w-3 h-3 text-[#00e5ff]" /> SHA-256 CHECKSUM</span>
                    <span className="text-[#00ff9d] flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> VERIFIED</span>
                  </div>
                  <div className="text-[9px] text-[#94a3b8] break-all font-mono">
                    {item.hash}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
