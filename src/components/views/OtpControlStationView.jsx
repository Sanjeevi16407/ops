import React, { useState, useEffect } from 'react';
import { Shield, Key, RefreshCw, Copy, Check, Terminal, Lock, Activity, AlertTriangle, Cpu, Radio, CheckCircle2, XCircle } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';
import { apiGetPendingRequests } from '../../services/otpBackendService';

export default function OtpControlStationView() {
  const { authorizeOtpInBackend, denyOtpInBackend } = useInvestigation();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeAuthorizedReq, setActiveAuthorizedReq] = useState(null);

  const [rollingValues, setRollingValues] = useState(['0', '0', '0', '0', '0', '0']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lockedIndex, setLockedIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(120);

  const [logs, setLogs] = useState([
    { time: new Date().toLocaleTimeString(), text: "ARVIX OTP CONTROL STATION ACTIVE" },
    { time: new Date().toLocaleTimeString(), text: "AUTOMATIC SERVICE COMMUNICATION INITIALIZED" }
  ]);

  // Poll internal backend service & listen to database update events
  useEffect(() => {
    const fetchPending = () => {
      try {
        const list = apiGetPendingRequests();
        setPendingRequests(list);
      } catch (e) {
        addLog("Authentication service temporarily unavailable.");
      }
    };
    fetchPending();

    const handleUpdate = () => fetchPending();
    window.addEventListener('arvix_otp_db_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const interval = setInterval(fetchPending, 800);

    return () => {
      window.removeEventListener('arvix_otp_db_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  // Countdown timer for active OTP
  useEffect(() => {
    let timer = null;
    if (activeAuthorizedReq && activeAuthorizedReq.expiresAt) {
      timer = setInterval(() => {
        const left = Math.max(0, Math.floor((activeAuthorizedReq.expiresAt - Date.now()) / 1000));
        setRemainingSeconds(left);
        if (left === 0) {
          clearInterval(timer);
          addLog(`EXPIRED: OTP FOR ${activeAuthorizedReq.requestId} HAS EXPIRED`);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeAuthorizedReq]);

  const addLog = (text) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { time, text }]);
  };

  // Operator clicks AUTHORIZE OTP
  const handleAuthorize = (reqId) => {
    try {
      setIsGenerating(true);
      setCopied(false);
      setLockedIndex(-1);

      addLog(`OPERATOR AUTHORIZED REQUEST: ${reqId}`);
      addLog("INTERNAL ENGINE GENERATING SECURE OTP...");

      const result = authorizeOtpInBackend(reqId);
      setActiveAuthorizedReq(result);
      const targetDigits = result.otp.split('');

      let currentLockSlot = 0;
      const rollTick = setInterval(() => {
        setRollingValues(prev => {
          return prev.map((val, idx) => {
            if (idx <= currentLockSlot - 1) return targetDigits[idx];
            return Math.floor(Math.random() * 10).toString();
          });
        });
      }, 60);

      const lockTimer = setInterval(() => {
        if (currentLockSlot < 6) {
          setLockedIndex(currentLockSlot);
          addLog(`OTP DIGIT 0${currentLockSlot + 1} LOCKED → [ ${targetDigits[currentLockSlot]} ]`);
          currentLockSlot++;
        } else {
          clearInterval(rollTick);
          clearInterval(lockTimer);
          setRollingValues(targetDigits);
          setIsGenerating(false);
          setLockedIndex(5);
          addLog(`✓ VERIFICATION CODE GENERATED FOR REQUEST ${reqId}`);
        }
      }, 350);

    } catch (err) {
      addLog("Authentication service temporarily unavailable.");
      setIsGenerating(false);
    }
  };

  // Operator clicks DENY REQUEST
  const handleDeny = (reqId) => {
    denyOtpInBackend(reqId);
    addLog(`OPERATOR DENIED REQUEST: ${reqId}`);
    setPendingRequests(prev => prev.filter(r => r.requestId !== reqId));
  };

  const handleCopyOtp = () => {
    if (!activeAuthorizedReq) return;
    navigator.clipboard.writeText(activeAuthorizedReq.otp);
    setCopied(true);
    addLog(`COPIED OTP [ ${activeAuthorizedReq.otp} ] TO CLIPBOARD`);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#02060a] text-[#e2e8f0] font-mono-cyber flex flex-col justify-between p-6 scanline-overlay relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 cyber-forensics-bg opacity-40 pointer-events-none" />

      {/* Header */}
      <header className="border-b border-[#132438] bg-[#061018]/90 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[#00ff9d]/10 border border-[#00ff9d]/40 flex items-center justify-center text-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.3)]">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-[#00ff9d] flex items-center gap-2">
              ARVIX OTP CONTROL STATION
            </h1>
            <p className="text-[10px] text-[#64748b] tracking-widest uppercase">
              SECURE VERIFICATION CODE GENERATOR
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#00ff9d]/10 border border-[#00ff9d]/30 px-3 py-1.5 rounded text-[#00ff9d] font-bold text-xs">
          <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-pulse"></span>
          <span>SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Main 3-Column Control Room */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 my-6 z-20 flex-1 items-stretch">
        {/* Left Column: PENDING OTP GENERATION REQUESTS LIST */}
        <div className="cyber-panel p-5 space-y-4 border border-[#00e5ff]/40 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-xs font-bold text-[#00e5ff] uppercase tracking-wider border-b border-[#132438] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#00e5ff] animate-pulse" />
                <span>NEW OTP REQUEST ({pendingRequests.length})</span>
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="bg-[#02060a] p-4 rounded border border-[#132438] text-center text-xs text-[#64748b] py-8">
                NO PENDING REQUESTS
                <p className="text-[10px] text-[#475569] mt-1">Request an OTP from the ARVIX Login page to populate this panel</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {pendingRequests.map((req) => (
                  <div key={req.requestId} className="bg-[#02060a] p-3 rounded border border-[#00e5ff]/40 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-[#00e5ff] font-bold">{req.requestId}</span>
                      <span className="bg-[#ffab00]/20 text-[#ffab00] border border-[#ffab00]/40 px-1.5 py-0.5 rounded text-[9px] font-bold">
                        WAITING AUTHORIZATION
                      </span>
                    </div>

                    <div className="space-y-0.5 text-[11px]">
                      <div><span className="text-[#64748b]">USER:</span> <span className="text-[#e2e8f0] font-bold">{req.email}</span></div>
                      <div><span className="text-[#64748b]">USER ID:</span> <span className="text-[#00ff9d]">{req.userId}</span></div>
                    </div>

                    {/* Operator Action Buttons */}
                    <div className="flex gap-2 pt-1 border-t border-[#132438]">
                      <button
                        onClick={() => handleAuthorize(req.requestId)}
                        disabled={isGenerating}
                        className="flex-1 bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#02060a] font-bold py-1.5 rounded text-[10px] transition flex items-center justify-center gap-1 cursor-pointer shadow-[0_0_10px_rgba(0,255,157,0.3)]"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        AUTHORIZE OTP
                      </button>

                      <button
                        onClick={() => handleDeny(req.requestId)}
                        disabled={isGenerating}
                        className="bg-[#ff1744]/20 hover:bg-[#ff1744]/30 text-[#ff1744] border border-[#ff1744]/50 px-2.5 py-1.5 rounded text-[10px] font-bold transition cursor-pointer"
                      >
                        <XCircle className="w-3 h-3" />
                        DENY
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#02060a] p-2.5 rounded border border-[#132438] text-[10px] text-[#64748b]">
            Authorize requests to generate verification tokens automatically.
          </div>
        </div>

        {/* Center Main Screen: Mechanical Rolling Number Slots */}
        <div className="lg:col-span-2 cyber-panel p-8 text-center space-y-6 border border-[#00ff9d]/50 shadow-[0_0_50px_rgba(0,255,157,0.15)] flex flex-col justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-[#00ff9d] tracking-widest uppercase flex items-center justify-center gap-2">
              <Key className="w-5 h-5 text-[#00ff9d]" />
              VERIFICATION CODE GENERATED
            </h2>
            <p className="text-xs text-[#64748b]">
              Mechanical Digital Number Slot Verification Display
            </p>
          </div>

          {/* 6 Mechanical Digit Containers */}
          <div className="py-4">
            <div className="flex justify-center items-center gap-3">
              {rollingValues.map((val, idx) => {
                const isSlotRolling = isGenerating && idx >= lockedIndex;
                return (
                  <div key={idx} className="relative flex flex-col items-center">
                    <div
                      className={`w-14 h-20 rounded-lg border-2 flex items-center justify-center text-3xl font-bold font-mono transition-all duration-200 ${
                        isSlotRolling
                          ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-[#00e5ff] animate-pulse shadow-[0_0_20px_rgba(0,229,255,0.6)]'
                          : activeAuthorizedReq
                          ? 'bg-[#02060a] border-[#00ff9d] text-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.3)]'
                          : 'bg-[#02060a] border-[#132438] text-[#64748b]'
                      }`}
                    >
                      <span>{val}</span>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff9d]/10 to-transparent pointer-events-none rounded-lg" />
                    </div>

                    <div className="text-[9px] text-[#64748b] mt-1 font-bold">
                      SLOT 0{idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Panel */}
          {activeAuthorizedReq ? (
            <div className="bg-[#02060a] p-4 rounded border border-[#00ff9d]/40 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-[#132438] pb-1.5">
                <span className="text-[#00ff9d] font-bold uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00ff9d]" /> VERIFICATION CODE GENERATED
                </span>
                <span className="text-[10px] bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 px-2 py-0.5 rounded font-bold">
                  STATUS: ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-[11px] text-[#cbd5e1]">
                <div><span className="text-[#64748b]">USER:</span> {activeAuthorizedReq.email}</div>
                <div><span className="text-[#64748b]">REQUEST ID:</span> <strong className="text-[#00e5ff]">{activeAuthorizedReq.requestId}</strong></div>
                <div><span className="text-[#64748b]">USER ID:</span> {activeAuthorizedReq.userId}</div>
                <div>
                  <span className="text-[#64748b]">EXPIRATION:</span>{' '}
                  <strong className={remainingSeconds < 30 ? 'text-[#ff1744] animate-pulse' : 'text-[#ffab00]'}>
                    {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
                  </strong>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleCopyOtp}
                  disabled={isGenerating || remainingSeconds === 0}
                  className="bg-[#00e5ff]/20 hover:bg-[#00e5ff]/30 text-[#00e5ff] border border-[#00e5ff]/50 font-bold px-6 py-2 rounded text-xs transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50"
                >
                  {copied ? <Check className="w-4 h-4 text-[#00ff9d]" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'COPIED TO CLIPBOARD!' : 'COPY OTP'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#02060a] p-4 rounded border border-[#132438] text-xs text-[#64748b]">
              NO ACTIVE AUTHORIZED OTP
              <p className="text-[10px] text-[#475569] mt-1">Select a pending request from the left panel and click AUTHORIZE OTP</p>
            </div>
          )}
        </div>

        {/* Right Column: OTP GENERATION LOG STREAM */}
        <div className="cyber-panel p-5 space-y-4 border border-[#132438] flex flex-col justify-between">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="text-xs font-bold text-[#00e5ff] uppercase tracking-wider border-b border-[#132438] pb-2 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00e5ff]" />
                <span>OTP GENERATION LOG</span>
              </span>
            </div>

            <div className="bg-[#02060a] p-3 rounded border border-[#132438] flex-1 overflow-y-auto max-h-[320px] space-y-2 text-[10px] font-mono">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#64748b] shrink-0">{log.time}</span>
                  <span className={
                    log.text.includes('READY') || log.text.includes('LOCKED') 
                      ? 'text-[#00ff9d] font-bold' 
                      : log.text.includes('AUTHORIZED') || log.text.includes('COPIED')
                      ? 'text-[#00e5ff]'
                      : log.text.includes('DENIED') || log.text.includes('EXPIRED')
                      ? 'text-[#ff1744]'
                      : 'text-[#cbd5e1]'
                  }>
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] text-[#64748b] pt-2 border-t border-[#132438]">
            COPY OTP AND ENTER IT INTO THE ARVIX LOGIN PAGE
          </div>
        </div>
      </div>

      <footer className="border-t border-[#132438] pt-3 text-[10px] text-[#64748b] flex justify-between items-center z-20">
        <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-[#00ff9d]" /> ARVIX AUTHENTICATION CONTROL SYSTEM</span>
        <span className="text-[#00e5ff]">INTEGRATED SECURITY INFRASTRUCTURE</span>
      </footer>
    </div>
  );
}
