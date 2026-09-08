import React, { useState, useRef, useEffect } from 'react';
import { Shield, Key, Cpu, CheckCircle2, AlertTriangle, Lock, RefreshCw, X, Mail, ArrowRight, Radio, Sparkles, Terminal, Activity, Zap } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function AuthView() {
  const { requestOtpFromBackend, checkOtpRequestStatus, verifyOtpWithBackend, resendOtpInBackend, setActiveTab } = useInvestigation();

  const [email, setEmail] = useState('investigator@arvix.sec');
  const [currentReq, setCurrentReq] = useState(null);
  const [authStep, setAuthStep] = useState('idle'); // 'idle' | 'pending_auth' | 'otp_ready' | 'verifying' | 'success' | 'failure' | 'denied'

  // Decryption Signal Animation State
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedDigits, setDecryptedDigits] = useState(['*', '*', '*', '*', '*', '*']);

  // Toast Notification State (Centered Top Dynamic Island)
  const [toast, setToast] = useState(null);

  // 6 Digit OTP Input State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [activeBoxIndex, setActiveBoxIndex] = useState(0);
  const [animatingBox, setAnimatingBox] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Resend Countdown Timer & Counter
  const [resendTimer, setResendTimer] = useState(30);
  const [resendCount, setResendCount] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = [
    useRef(null), useRef(null), useRef(null),
    useRef(null), useRef(null), useRef(null)
  ];

  // Auto-dismiss Toast Notification after 4.5 seconds
  useEffect(() => {
    let timer = null;
    if (toast && toast.show) {
      timer = setTimeout(() => {
        setToast(prev => prev ? { ...prev, show: false } : null);
      }, 4500);
    }
    return () => clearTimeout(timer);
  }, [toast]);

  // Resend Cooldown Countdown Timer
  useEffect(() => {
    let timer = null;
    if (authStep === 'otp_ready' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [authStep, resendTimer]);

  // Trigger Unique Cyber Decryption Sequence Animation when OTP arrives
  const triggerDecryptionAnimation = (otpCode) => {
    if (!otpCode) return;
    setIsDecrypting(true);
    const target = otpCode.split('');
    let tickCount = 0;

    const interval = setInterval(() => {
      tickCount++;
      setDecryptedDigits(target.map((d, i) => {
        if (tickCount > (i + 1) * 3) return d;
        return Math.floor(Math.random() * 10).toString();
      }));

      if (tickCount > 20) {
        clearInterval(interval);
        setDecryptedDigits(target);
        setIsDecrypting(false);
      }
    }, 45);
  };

  // Real-time Detection of OTP Status via Backend Polling / Events
  useEffect(() => {
    let interval = null;
    if (authStep === 'pending_auth' && currentReq) {
      interval = setInterval(() => {
        const statusObj = checkOtpRequestStatus(currentReq.requestId);
        if (statusObj.status === 'ACTIVE') {
          setCurrentReq(prev => ({ ...prev, ...statusObj }));
          setAuthStep('otp_ready');
          showOtpSentToast(statusObj.otp);
          triggerDecryptionAnimation(statusObj.otp);
          clearInterval(interval);
          setTimeout(() => inputRefs[0].current?.focus(), 150);
        } else if (statusObj.status === 'DENIED') {
          setAuthStep('denied');
          clearInterval(interval);
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [authStep, currentReq]);

  // Helper to trigger the top-centered notification toast
  const showOtpSentToast = (otpCode) => {
    setToast({
      show: true,
      title: '🔐 2FA Dispatched Successfully',
      message: `Verification token generated. Code: ${otpCode || '••••••'}`,
      detail: 'Registered device linked. Complete verification below.'
    });
  };

  // Step 1: User enters email and clicks LOGIN / REQUEST OTP
  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    try {
      setErrorMessage('');
      const req = requestOtpFromBackend(email);
      setCurrentReq(req);

      if (req.status === 'ACTIVE') {
        setAuthStep('otp_ready');
        setOtpDigits(['', '', '', '', '', '']);
        setResendTimer(30);
        showOtpSentToast(req.otp);
        triggerDecryptionAnimation(req.otp);
        setTimeout(() => inputRefs[0].current?.focus(), 150);
      } else {
        setAuthStep('pending_auth');
      }
    } catch (err) {
      setAuthStep('failure');
      setErrorMessage('Authentication service temporarily unavailable.');
    }
  };

  // 1-Click Auto-Fill & Verify OTP
  const handleAutoFillOtp = () => {
    if (!currentReq?.otp) return;
    const digits = currentReq.otp.split('');
    setOtpDigits(digits);
    setActiveBoxIndex(5);
    handleVerifyOtp(currentReq.otp);
  };

  // Digit Input Handler with mechanical micro-animations
  const handleDigitChange = (index, value) => {
    const char = value.slice(-1);
    if (char && !/^\d$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char) {
      setAnimatingBox(index);
      setTimeout(() => setAnimatingBox(null), 250);

      if (index < 5) {
        setActiveBoxIndex(index + 1);
        inputRefs[index + 1].current?.focus();
      } else {
        handleVerifyOtp(newDigits.join(''));
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      setActiveBoxIndex(index - 1);
      inputRefs[index - 1].current?.focus();
    }
  };

  // Paste Handler for 6-Digit OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      setActiveBoxIndex(5);
      handleVerifyOtp(pastedData);
    }
  };

  // Resend OTP Action
  const handleResendOtp = () => {
    if (!currentReq || resendTimer > 0 || isResending) return;
    setIsResending(true);

    setTimeout(() => {
      const result = resendOtpInBackend(currentReq.requestId, currentReq.userId);
      setIsResending(false);

      if (result.success) {
        setCurrentReq(prev => ({ ...prev, otp: result.otp }));
        setOtpDigits(['', '', '', '', '', '']);
        setResendCount(prev => prev + 1);
        setResendTimer(30);
        showOtpSentToast(result.otp);
        triggerDecryptionAnimation(result.otp);
        setTimeout(() => inputRefs[0].current?.focus(), 150);
      } else {
        setErrorMessage(result.error || 'Failed to resend OTP.');
      }
    }, 400);
  };

  // Step 2: Verify OTP against Backend Engine
  const handleVerifyOtp = (submittedCode) => {
    if (!currentReq || submittedCode.length < 6) return;
    setAuthStep('verifying');

    setTimeout(() => {
      const result = verifyOtpWithBackend(currentReq.requestId, currentReq.userId, submittedCode);
      if (result.verified) {
        setAuthStep('success');
        setTimeout(() => {
          setActiveTab('dashboard');
        }, 1100);
      } else {
        setAuthStep('failure');
        setErrorMessage(result.message || 'Invalid verification code.');
      }
    }, 450);
  };

  return (
    <div className="w-screen min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#02070b] cyber-forensics-bg font-mono-cyber relative overflow-hidden">
      {/* Dynamic Scanline Beam */}
      <div className="scanline-beam" />

      {/* Atmospheric Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff9d]/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00e5ff]/5 rounded-full blur-3xl pointer-events-none" />

      {/* TOP CENTER FLOATING DYNAMIC ISLAND TOAST */}
      {toast && toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-slide-down">
          <div className="bg-[#05111b]/95 border border-[#00ff9d]/60 rounded-xl p-4 shadow-[0_0_40px_rgba(0,255,157,0.35)] flex items-start gap-3.5 backdrop-blur-xl relative">
            <div className="p-2 rounded-lg bg-[#00ff9d]/15 text-[#00ff9d] shrink-0 border border-[#00ff9d]/40 shadow-[0_0_15px_rgba(0,255,157,0.5)]">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5 text-left flex-1 pr-3">
              <div className="text-xs font-bold text-[#00ff9d] tracking-wider uppercase flex items-center justify-between">
                <span>{toast.title}</span>
                <span className="text-[9px] bg-[#00ff9d]/20 text-[#00ff9d] border border-[#00ff9d]/40 px-1.5 py-0.5 rounded font-mono">
                  LIVE 2FA
                </span>
              </div>
              <p className="text-xs font-semibold text-[#f1f5f9]">{toast.message}</p>
              <p className="text-[11px] text-[#94a3b8]">{toast.detail}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[#64748b] hover:text-[#f1f5f9] transition p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN CYBER HUD TERMINAL CARD */}
      <div className="w-full max-w-md mx-auto relative z-10 cyber-panel p-8 sm:p-9 border border-[#00ff9d]/30 rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] text-center bg-[#070e17]/95 backdrop-blur-2xl">
        {/* HUD Corner Bracket Accents */}
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        {/* Live Clearance Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff9d]/10 border border-[#00ff9d]/30 text-[10px] font-bold text-[#00ff9d] uppercase tracking-widest mb-4 shadow-[0_0_12px_rgba(0,255,157,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#00ff9d] animate-ping" />
          <span>SECURITY ACCESS GATEWAY // LEVEL 4</span>
        </div>

        {/* ARVIX Holographic Brand Icon & Header */}
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00ff9d]/20 via-[#061826] to-[#00e5ff]/20 border border-[#00ff9d]/60 flex items-center justify-center text-[#00ff9d] shadow-[0_0_30px_rgba(0,255,157,0.35)]">
              <Shield className="w-9 h-9" />
            </div>
            <div className="absolute -inset-1 rounded-2xl bg-[#00ff9d]/20 blur-md pointer-events-none -z-10" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00ff9d] to-[#00e5ff] pt-1">
            ARVIX
          </h1>
          <p className="text-[10px] text-[#64748b] tracking-widest uppercase font-semibold">
            AI Digital Crime Scene Investigation Assistant
          </p>
        </div>

        {/* STATE 1: EMAIL-ONLY LOGIN FORM */}
        {authStep === 'idle' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-[#94a3b8] tracking-widest uppercase flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#00ff9d]" /> INVESTIGATOR IDENTITY / EMAIL *
                </label>
                <span className="text-[9px] text-[#64748b]">REQUIRED</span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@arvix.sec"
                  className="w-full bg-[#030910] border border-[#172b42] focus:border-[#00ff9d] text-[#f1f5f9] pl-10 pr-4 py-3.5 rounded-xl text-xs focus:outline-none transition-all duration-300 focus:shadow-[0_0_20px_rgba(0,255,157,0.25)] placeholder-[#334155]"
                />
                <Activity className="w-4 h-4 text-[#00ff9d]/70 absolute left-3.5 top-4" />
              </div>

              {/* Quick Preset Investigator Badges */}
              <div className="pt-2">
                <div className="text-[9px] text-[#475569] uppercase tracking-wider mb-1.5 font-bold">Quick Identity Presets:</div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Agent Varma', val: 'agent.varma@arvix.sec' },
                    { label: 'SecOps Lead', val: 'secops.lead@arvix.sec' },
                    { label: 'Cyber Forensics', val: 'forensics.unit@arvix.sec' }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setEmail(preset.val)}
                      className="px-2.5 py-1 bg-[#051421] hover:bg-[#00ff9d]/15 text-[#94a3b8] hover:text-[#00ff9d] border border-[#13283f] hover:border-[#00ff9d]/50 rounded-md text-[10px] transition-all duration-200 cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00ff9d] via-[#00f0aa] to-[#00e5ff] hover:opacity-95 text-[#040a10] font-extrabold py-3.5 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,255,157,0.45)] hover:shadow-[0_0_35px_rgba(0,255,157,0.65)] hover:scale-[1.01] active:scale-[0.99] mt-3"
            >
              <Cpu className="w-4 h-4 text-[#040a10]" />
              <span>AUTHENTICATE & SEND OTP</span>
              <ArrowRight className="w-4 h-4 text-[#040a10]" />
            </button>
          </form>
        )}

        {/* STATE 2: PENDING AUTHORIZATION */}
        {authStep === 'pending_auth' && (
          <div className="py-8 space-y-4 bg-[#040c14] p-6 rounded-xl border border-[#00e5ff]/40 shadow-[0_0_30px_rgba(0,229,255,0.15)]">
            <Cpu className="w-12 h-12 text-[#00e5ff] animate-spin mx-auto" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#00e5ff] tracking-widest uppercase">
                ESTABLISHING QUANTUM 2FA LINK...
              </div>
              <div className="text-[11px] text-[#94a3b8]">
                Request ID: <strong className="text-[#00ff9d]">{currentReq?.requestId}</strong>
              </div>
            </div>
            <p className="text-[10px] text-[#64748b]">
              Connecting to secure cryptographic authority...
            </p>
          </div>
        )}

        {/* STATE 3: OTP READY WITH UNIQUE CYBER DECRYPTION ANIMATION */}
        {(authStep === 'otp_ready' || authStep === 'verifying') && (
          <div className="space-y-5 animate-fade-in text-left">
            <div className="space-y-1 text-center">
              <h2 className="text-xs font-bold text-[#00ff9d] uppercase tracking-wider flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00ff9d]" /> TWO-FACTOR OTP VERIFICATION
              </h2>
              <p className="text-[11px] text-[#94a3b8]">
                Token sent to <strong className="text-[#00e5ff]">{currentReq?.email}</strong>
              </p>
            </div>

            {/* UNIQUE CYBER DECRYPTION RECEPTION HUD DISPLAY */}
            {currentReq?.otp && (
              <div className="bg-[#020b12] border border-[#00ff9d]/50 rounded-xl p-4 space-y-2.5 relative overflow-hidden shadow-[0_0_30px_rgba(0,255,157,0.2)]">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#00ff9d] font-bold tracking-widest uppercase flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#00ff9d] animate-ping" />
                    {isDecrypting ? 'DECRYPTING QUANTUM STREAM...' : 'SIGNAL LOCKED // OTP DECRYPTED'}
                  </span>
                  <span className="text-[#00e5ff] font-mono text-[9px] bg-[#00e5ff]/10 border border-[#00e5ff]/30 px-1.5 py-0.5 rounded">
                    {currentReq.requestId}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#04111d] p-3 rounded-xl border border-[#00ff9d]/30">
                  <div className="flex gap-2 font-mono font-bold text-xl text-[#00ff9d]">
                    {decryptedDigits.map((digit, i) => (
                      <span
                        key={i}
                        className={`w-7 h-10 flex items-center justify-center rounded-lg bg-[#02060b] border ${
                          isDecrypting
                            ? 'border-[#00e5ff] text-[#00e5ff] animate-pulse'
                            : 'border-[#00ff9d]/70 text-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.45)]'
                        }`}
                      >
                        {digit}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    disabled={isDecrypting}
                    className="bg-gradient-to-r from-[#00ff9d] to-[#00e5ff] hover:opacity-90 text-[#02070b] font-extrabold text-[10px] px-3.5 py-2.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,255,157,0.5)] disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AUTO-FILL
                  </button>
                </div>
              </div>
            )}

            {/* 6 Mechanical Digit Input Boxes */}
            <div className="flex justify-center items-center gap-2.5 my-4" onPaste={handlePaste}>
              {otpDigits.map((digit, idx) => {
                const isAnimating = animatingBox === idx;
                return (
                  <div key={idx} className="relative">
                    <input
                      ref={inputRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onFocus={() => setActiveBoxIndex(idx)}
                      className={`w-11 h-14 text-center text-xl font-bold bg-[#02070b] border rounded-xl text-[#00ff9d] focus:outline-none transition-all duration-200 ${
                        isAnimating
                          ? 'border-[#00ff9d] bg-[#00ff9d]/20 shadow-[0_0_18px_rgba(0,255,157,0.85)] scale-105'
                          : activeBoxIndex === idx
                          ? 'border-[#00ff9d] shadow-[0_0_12px_rgba(0,255,157,0.4)]'
                          : 'border-[#15273b]'
                      }`}
                    />
                    {isAnimating && (
                      <div className="absolute inset-x-0 h-0.5 bg-[#00ff9d] top-1/2 -translate-y-1/2 shadow-[0_0_10px_#00ff9d] animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>

            {authStep === 'verifying' ? (
              <div className="text-xs text-[#00e5ff] font-bold animate-pulse flex items-center justify-center gap-2 py-3">
                <Cpu className="w-4 h-4 animate-spin" /> VERIFYING CRYPTOGRAPHIC TOKEN...
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => handleVerifyOtp(otpDigits.join(''))}
                  disabled={otpDigits.join('').length < 6}
                  className="w-full bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#02070b] font-extrabold py-3.5 rounded-xl text-xs transition cursor-pointer disabled:opacity-40 shadow-[0_0_20px_rgba(0,255,157,0.35)]"
                >
                  VERIFY & ACCESS DASHBOARD
                </button>

                {/* Resend OTP Button with Live Countdown Timer */}
                <div className="flex justify-between items-center text-xs pt-2 border-t border-[#132438]">
                  <span className="text-[10px] text-[#64748b]">Didn't receive verification code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isResending}
                    className="text-[#00e5ff] hover:text-[#00ff9d] font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STATE 4: SUCCESS TRANSITION */}
        {authStep === 'success' && (
          <div className="py-8 space-y-4 animate-fade-in">
            <div className="w-18 h-18 rounded-full bg-[#00ff9d]/20 border-2 border-[#00ff9d] text-[#00ff9d] flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(0,255,157,0.7)] animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#00ff9d] tracking-widest uppercase">
                ✓ IDENTITY VERIFIED
              </h2>
              <p className="text-xs text-[#00e5ff]">AUTHENTICATION SUCCESSFUL • INITIALIZING DASHBOARD</p>
            </div>
          </div>
        )}

        {/* STATE 5: FAILURE NOTIFICATION */}
        {authStep === 'failure' && (
          <div className="space-y-4 animate-shake py-4">
            <div className="w-14 h-14 rounded-full bg-[#ff1744]/20 border border-[#ff1744] text-[#ff1744] flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,23,68,0.4)]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xs font-bold text-[#ff1744] tracking-wider uppercase">
                VERIFICATION FAILED
              </h2>
              <p className="text-xs text-[#94a3b8]">{errorMessage || 'Authentication service temporarily unavailable.'}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setAuthStep('otp_ready'); setOtpDigits(['','','','','','']); inputRefs[0].current?.focus(); }}
                className="flex-1 bg-[#ff1744]/20 hover:bg-[#ff1744]/30 text-[#ff1744] border border-[#ff1744] py-2.5 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => setAuthStep('idle')}
                className="flex-1 bg-[#061018] text-[#00e5ff] border border-[#00e5ff]/40 py-2.5 rounded-lg text-xs transition cursor-pointer"
              >
                BACK TO LOGIN
              </button>
            </div>
          </div>
        )}

        {/* STATE 6: DENIED BY OPERATOR */}
        {authStep === 'denied' && (
          <div className="space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-[#ff1744]/20 border border-[#ff1744] text-[#ff1744] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xs font-bold text-[#ff1744] uppercase tracking-wider">
                OTP REQUEST DENIED
              </h2>
              <p className="text-xs text-[#94a3b8]">
                Your verification request was not authorized.
              </p>
            </div>

            <button
              onClick={() => setAuthStep('idle')}
              className="w-full bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 py-3 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              REQUEST AGAIN
            </button>
          </div>
        )}

        {/* Telemetry Footer Bar */}
        <div className="border-t border-[#132438] pt-4 mt-6 text-[10px] text-[#64748b] flex justify-between items-center">
          <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-[#00ff9d]" /> AES-256 ENCRYPTED</span>
          <span className="text-[#00e5ff] flex items-center gap-1"><Zap className="w-3 h-3 text-[#00e5ff]" /> ARVIX v2.4 CORE</span>
        </div>
      </div>
    </div>
  );
}
