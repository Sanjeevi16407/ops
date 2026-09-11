import React, { useState, useRef, useEffect } from 'react';
import { Shield, Key, Cpu, CheckCircle2, AlertTriangle, Lock, RefreshCw, X, Mail, ArrowRight, Radio, Sparkles, Terminal, Activity, Zap, Droplets } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function AuthView() {
  const { requestOtpFromBackend, checkOtpRequestStatus, verifyOtpWithBackend, resendOtpInBackend, setActiveTab } = useInvestigation();

  const [email, setEmail] = useState('investigator@arvix.sec');
  const [emailTouched, setEmailTouched] = useState(false);
  const [currentReq, setCurrentReq] = useState(null);
  const [authStep, setAuthStep] = useState('idle'); // 'idle' | 'pending_auth' | 'otp_ready' | 'verifying' | 'success' | 'failure' | 'denied'

  // Email Validation Logic:
  // Predefined investigator identities (@arvix.sec) are accepted.
  // Any other email MUST be a valid @gmail.com address.
  const checkEmailValidity = (val) => {
    if (!val || !val.trim()) {
      return { isValid: false, message: 'Email address is required' };
    }
    const clean = val.trim().toLowerCase();
    const isGivenEmail = clean.endsWith('@arvix.sec');
    const isGmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(clean);

    if (isGivenEmail) {
      return { isValid: true, isGiven: true, message: 'Official Investigator Identity' };
    }
    if (isGmail) {
      return { isValid: true, isGmail: true, message: 'Verified @gmail.com Identity' };
    }
    return {
      isValid: false,
      message: 'Invalid email: Custom email must contain "@gmail.com" (e.g. yourname@gmail.com)'
    };
  };

  const emailValidity = checkEmailValidity(email);
  const isEmailValid = emailValidity.isValid;

  // Decryption Signal Animation State
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedDigits, setDecryptedDigits] = useState(['*', '*', '*', '*', '*', '*']);

  // Toast Notification State (Centered Top Floating Liquid Glass Toast)
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

  // Trigger Unique Liquid Decryption Sequence Animation when OTP arrives
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

  // Helper to trigger the top-centered liquid glass toast
  const showOtpSentToast = (otpCode) => {
    setToast({
      show: true,
      title: '🔐 2FA Dispatched Successfully',
      message: `Verification token generated. Code: ${otpCode || '••••••'}`,
      detail: 'Secure channel linked. Complete verification below.'
    });
  };

  // Step 1: User enters email and clicks LOGIN / REQUEST OTP
  const handleLoginSubmit = (e) => {
    if (e) e.preventDefault();
    setEmailTouched(true);
    const validity = checkEmailValidity(email);
    if (!validity.isValid) {
      setErrorMessage(validity.message);
      return;
    }

    try {
      setErrorMessage('');
      const req = requestOtpFromBackend(email.trim());
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
      {/* Translucent Cyber Security Hologram Wallpaper & Vignette (Exclusive to Login Screen) */}
      <div className="cyber-bg-wallpaper" />
      <div className="cyber-bg-vignette" />

      {/* Floating Fluid Liquid Ambient Light Orbs */}
      <div className="ambient-liquid-teal -top-24 -left-20" />
      <div className="ambient-liquid-cyan -bottom-28 -right-20" />
      <div className="ambient-liquid-indigo top-1/3 right-1/4 opacity-60" />

      {/* Dynamic Scanline Light Beam */}
      <div className="scanline-beam" />

      {/* TOP CENTER FLOATING LIQUID GLASS TOAST */}
      {toast && toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-slide-down">
          <div className="liquid-glass-toast rounded-2xl p-4 flex items-start gap-3.5 relative">
            <div className="p-2.5 rounded-xl bg-[#00f5d4]/20 text-[#00f5d4] shrink-0 border border-[#00f5d4]/50 shadow-[0_0_20px_rgba(0,245,212,0.45)]">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5 text-left flex-1 pr-3">
              <div className="text-xs font-bold text-[#00f5d4] tracking-wider uppercase flex items-center justify-between">
                <span>{toast.title}</span>
                <span className="text-[9px] bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/40 px-2 py-0.5 rounded-full font-mono">
                  LIQUID 2FA
                </span>
              </div>
              <p className="text-xs font-semibold text-[#f8fafc]">{toast.message}</p>
              <p className="text-[11px] text-[#94a3b8]">{toast.detail}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[#94a3b8] hover:text-[#f8fafc] transition p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MAIN LIQUID GLASS TERMINAL CARD CONTAINER */}
      <div className="w-full max-w-md mx-auto relative z-10 liquid-glass-card p-5 sm:p-8 sm:p-9 text-center">
        {/* HUD Corner Bracket Accents in Fluorescent Mint */}
        <div className="hud-corner-tl" />
        <div className="hud-corner-tr" />
        <div className="hud-corner-bl" />
        <div className="hud-corner-br" />

        {/* Live Clearance Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill text-[10px] font-bold text-[#00f5d4] uppercase tracking-widest mb-4">
          <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-ping" />
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-[#00f5d4]" />
            SECURITY ACCESS
          </span>
        </div>

        {/* ARVIX Holographic Brand Icon & Header */}
        <div className="flex flex-col items-center space-y-2 mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00f5d4]/30 via-[rgba(15,62,77,0.7)] to-[#00b4d8]/30 border border-[#00f5d4]/70 flex items-center justify-center text-[#00f5d4] shadow-[0_0_35px_rgba(0,245,212,0.45)] backdrop-blur-md">
              <Shield className="w-9 h-9" />
            </div>
            <div className="absolute -inset-1.5 rounded-2xl bg-[#00f5d4]/20 blur-lg pointer-events-none -z-10" />
          </div>

          <h1 className="text-3xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00f5d4] to-[#00b4d8] pt-1">
            ARVIX
          </h1>
          <p className="text-[10px] text-[#94a3b8] tracking-widest uppercase font-semibold">
            AI Digital Crime Scene Investigation Assistant
          </p>
        </div>

        {/* STATE 1: EMAIL-ONLY LOGIN FORM */}
        {authStep === 'idle' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-[#cbd5e1] tracking-widest uppercase flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#00f5d4]" /> INVESTIGATOR IDENTITY / EMAIL *
                </label>
                <span className="text-[9px] text-[#64748b]">REQUIRED</span>
              </div>

              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailTouched(true);
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="yourname@gmail.com or investigator@arvix.sec"
                  className={`w-full liquid-glass-input pl-10 pr-10 py-3.5 text-xs focus:outline-none placeholder-[#475569] transition ${
                    emailTouched && !isEmailValid
                      ? 'border-[#ff1744] bg-[#ff1744]/10 text-[#ff8080] focus:border-[#ff1744] shadow-[0_0_15px_rgba(255,23,68,0.35)]'
                      : emailTouched && isEmailValid
                      ? 'border-[#00f5d4] text-[#f8fafc] shadow-[0_0_12px_rgba(0,245,212,0.25)]'
                      : 'text-[#f8fafc]'
                  }`}
                />
                <Activity className={`w-4 h-4 absolute left-3.5 top-4 transition ${
                  emailTouched && !isEmailValid ? 'text-[#ff1744]' : 'text-[#00f5d4]/80'
                }`} />

                {/* Right Validation Status Indicator */}
                <div className="absolute right-3.5 top-3.5 pointer-events-none">
                  {emailTouched && (
                    isEmailValid ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00f5d4] animate-fade-in" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-[#ff1744] animate-fade-in" />
                    )
                  )}
                </div>
              </div>

              {/* Real-time Email Validation Message */}
              {emailTouched && (
                <div className={`text-[10px] font-mono-cyber flex items-center gap-1.5 px-1 py-0.5 animate-fade-in ${
                  isEmailValid ? 'text-[#00f5d4]' : 'text-[#ff1744]'
                }`}>
                  {isEmailValid ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#00f5d4]" />
                      <span>{emailValidity.message}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-[#ff1744]" />
                      <span>{emailValidity.message}</span>
                    </>
                  )}
                </div>
              )}

              {/* Quick Preset Investigator Badges */}
              <div className="pt-2">
                <div className="text-[9px] text-[#64748b] uppercase tracking-wider mb-1.5 font-bold">Quick Identity Presets:</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Agent Varma', val: 'agent.varma@arvix.sec' },
                    { label: 'SecOps Lead', val: 'secops.lead@arvix.sec' },
                    { label: 'Cyber Forensics', val: 'forensics.unit@arvix.sec' }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => {
                        setEmail(preset.val);
                        setEmailTouched(true);
                      }}
                      className="px-3 py-1 rounded-lg liquid-glass-chip text-[#cbd5e1] hover:text-[#00f5d4] text-[10px] cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Liquid Glass Action Button */}
            <button
              type="submit"
              disabled={emailTouched && !isEmailValid}
              className="w-full liquid-glass-btn text-[#03121c] font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              <Cpu className="w-4 h-4 text-[#03121c]" />
              <span>AUTHENTICATE & SEND OTP</span>
              <ArrowRight className="w-4 h-4 text-[#03121c]" />
            </button>
          </form>
        )}

        {/* STATE 2: PENDING AUTHORIZATION */}
        {authStep === 'pending_auth' && (
          <div className="py-8 space-y-4 liquid-glass-subpanel p-6 text-center">
            <Cpu className="w-12 h-12 text-[#00b4d8] animate-spin mx-auto" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#00f5d4] tracking-widest uppercase">
                ESTABLISHING LIQUID 2FA LINK...
              </div>
              <div className="text-[11px] text-[#cbd5e1]">
                Request ID: <strong className="text-[#00f5d4]">{currentReq?.requestId}</strong>
              </div>
            </div>
            <p className="text-[10px] text-[#64748b]">
              Connecting to secure cryptographic authority...
            </p>
          </div>
        )}

        {/* STATE 3: OTP READY WITH LIQUID GLASS DECRYPTION HUD */}
        {(authStep === 'otp_ready' || authStep === 'verifying') && (
          <div className="space-y-5 animate-fade-in text-left">
            <div className="space-y-1 text-center">
              <h2 className="text-xs font-bold text-[#00f5d4] uppercase tracking-wider flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00f5d4]" /> TWO-FACTOR OTP VERIFICATION
              </h2>
              <p className="text-[11px] text-[#cbd5e1]">
                Token sent to <strong className="text-[#00b4d8]">{currentReq?.email}</strong>
              </p>
            </div>

            {/* LIQUID GLASS DECRYPTION HUD */}
            {currentReq?.otp && (
              <div className="liquid-glass-subpanel p-4 space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#00f5d4] font-bold tracking-widest uppercase flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#00f5d4] animate-ping" />
                    {isDecrypting ? 'DECRYPTING QUANTUM STREAM...' : 'SIGNAL LOCKED // OTP DECRYPTED'}
                  </span>
                  <span className="text-[#00b4d8] font-mono text-[9px] bg-[#00b4d8]/15 border border-[#00b4d8]/40 px-2 py-0.5 rounded-md">
                    {currentReq.requestId}
                  </span>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 bg-[rgba(3,18,28,0.65)] p-2.5 sm:p-3 rounded-xl border border-[rgba(255,255,255,0.08)]">
                  <div className="flex gap-1.5 sm:gap-2 font-mono font-bold text-lg sm:text-xl text-[#00f5d4]">
                    {decryptedDigits.map((digit, i) => (
                      <span
                        key={i}
                        className={`w-6 h-9 sm:w-7 sm:h-10 flex items-center justify-center rounded-lg border ${
                          isDecrypting
                            ? 'bg-[rgba(0,180,216,0.2)] border-[#00b4d8] text-[#00b4d8] animate-pulse'
                            : 'bg-[rgba(0,245,212,0.12)] border-[#00f5d4]/70 text-[#00f5d4] shadow-[0_0_12px_rgba(0,245,212,0.4)]'
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
                    className="liquid-glass-btn text-[#03121c] font-extrabold text-[10px] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    AUTO-FILL
                  </button>
                </div>
              </div>
            )}

            {/* 6 Mechanical Frosted Digit Chambers */}
            <div className="flex justify-center items-center gap-1.5 sm:gap-2.5 my-4" onPaste={handlePaste}>
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
                      className={`w-9 h-12 sm:w-11 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl text-[#00f5d4] focus:outline-none transition-all duration-200 liquid-glass-input ${
                        isAnimating
                          ? 'border-[#00f5d4] bg-[#00f5d4]/25 shadow-[0_0_20px_rgba(0,245,212,0.9)] scale-105'
                          : activeBoxIndex === idx
                          ? 'border-[#00f5d4] shadow-[0_0_14px_rgba(0,245,212,0.45)]'
                          : ''
                      }`}
                    />
                    {isAnimating && (
                      <div className="absolute inset-x-0 h-0.5 bg-[#00f5d4] top-1/2 -translate-y-1/2 shadow-[0_0_12px_#00f5d4] animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>

            {authStep === 'verifying' ? (
              <div className="text-xs text-[#00b4d8] font-bold animate-pulse flex items-center justify-center gap-2 py-3">
                <Cpu className="w-4 h-4 animate-spin" /> VERIFYING CRYPTOGRAPHIC TOKEN...
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => handleVerifyOtp(otpDigits.join(''))}
                  disabled={otpDigits.join('').length < 6}
                  className="w-full liquid-glass-btn text-[#03121c] font-extrabold py-3.5 rounded-xl text-xs cursor-pointer disabled:opacity-40"
                >
                  VERIFY & ACCESS DASHBOARD
                </button>

                {/* Resend OTP Option */}
                <div className="flex justify-between items-center text-xs pt-2 border-t border-[rgba(255,255,255,0.08)]">
                  <span className="text-[10px] text-[#94a3b8]">Didn't receive verification code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isResending}
                    className="text-[#00b4d8] hover:text-[#00f5d4] font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
          <div className="py-8 space-y-4 animate-fade-in text-center">
            <div className="w-20 h-20 rounded-full bg-[#00f5d4]/25 border-2 border-[#00f5d4] text-[#00f5d4] flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,245,212,0.75)] animate-bounce backdrop-blur-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#00f5d4] tracking-widest uppercase">
                ✓ IDENTITY VERIFIED
              </h2>
              <p className="text-xs text-[#00b4d8]">AUTHENTICATION SUCCESSFUL • INITIALIZING DASHBOARD</p>
            </div>
          </div>
        )}

        {/* STATE 5: FAILURE NOTIFICATION */}
        {authStep === 'failure' && (
          <div className="space-y-4 animate-shake py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#ff1744]/25 border border-[#ff1744] text-[#ff1744] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(255,23,68,0.5)] backdrop-blur-md">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xs font-bold text-[#ff1744] tracking-wider uppercase">
                VERIFICATION FAILED
              </h2>
              <p className="text-xs text-[#cbd5e1]">{errorMessage || 'Authentication service temporarily unavailable.'}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setAuthStep('otp_ready'); setOtpDigits(['','','','','','']); inputRefs[0].current?.focus(); }}
                className="flex-1 bg-[#ff1744]/20 hover:bg-[#ff1744]/30 text-[#ff1744] border border-[#ff1744] py-2.5 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => setAuthStep('idle')}
                className="flex-1 liquid-glass-subpanel text-[#00b4d8] py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                BACK TO LOGIN
              </button>
            </div>
          </div>
        )}

        {/* STATE 6: DENIED BY OPERATOR */}
        {authStep === 'denied' && (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#ff1744]/25 border border-[#ff1744] text-[#ff1744] flex items-center justify-center mx-auto backdrop-blur-md">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xs font-bold text-[#ff1744] uppercase tracking-wider">
                OTP REQUEST DENIED
              </h2>
              <p className="text-xs text-[#cbd5e1]">
                Your verification request was not authorized.
              </p>
            </div>

            <button
              onClick={() => setAuthStep('idle')}
              className="w-full liquid-glass-subpanel text-[#00b4d8] py-3 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              REQUEST AGAIN
            </button>
          </div>
        )}

        {/* Telemetry Footer Bar */}
        <div className="border-t border-[rgba(255,255,255,0.08)] pt-4 mt-6 text-[10px] text-[#94a3b8] flex justify-center items-center">
          <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-[#00f5d4]" /> AES-256 ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
}
