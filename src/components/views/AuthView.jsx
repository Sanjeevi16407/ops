import React, { useState, useRef, useEffect } from 'react';
import { Shield, Key, Cpu, CheckCircle2, AlertTriangle, Lock, RefreshCw, X, Mail, ArrowRight, Radio, Sparkles, Terminal } from 'lucide-react';
import { useInvestigation } from '../../store/InvestigationContext';

export default function AuthView() {
  const { requestOtpFromBackend, checkOtpRequestStatus, verifyOtpWithBackend, resendOtpInBackend, setActiveTab } = useInvestigation();

  const [email, setEmail] = useState('investigator@example.com');
  const [currentReq, setCurrentReq] = useState(null);
  const [authStep, setAuthStep] = useState('idle'); // 'idle' | 'pending_auth' | 'otp_ready' | 'verifying' | 'success' | 'failure' | 'denied'

  // Decryption Signal Animation State
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedDigits, setDecryptedDigits] = useState(['*', '*', '*', '*', '*', '*']);

  // Toast Notification State (Centered Top Toast)
  const [toast, setToast] = useState(null); // { show: boolean, title: string, message: string, detail: string }

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

  // Auto-dismiss Toast Notification after 5 seconds
  useEffect(() => {
    let timer = null;
    if (toast && toast.show) {
      timer = setTimeout(() => {
        setToast(prev => prev ? { ...prev, show: false } : null);
      }, 5000);
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

  // Trigger Decryption Sequence Animation when OTP code arrives
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

      if (tickCount > 22) {
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
      title: '🔐 OTP Verification',
      message: `OTP sent successfully. Code: ${otpCode || '••••••'}`,
      detail: 'Please enter the code below to complete verification.'
    });
  };

  // Step 1: User enters email credentials and clicks LOGIN / REQUEST OTP
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

  // Auto-fill OTP on login page click
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
        // Redirect to dashboard after brief success animation
        setTimeout(() => {
          setActiveTab('dashboard');
        }, 1200);
      } else {
        setAuthStep('failure');
        setErrorMessage(result.message || 'Invalid verification code.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen w-full flex-1 flex flex-col items-center justify-center p-6 bg-[#02070b] cyber-forensics-bg font-mono-cyber relative overflow-hidden text-center mx-auto">
      {/* Scanline Overlay */}
      <div className="absolute inset-0 scanline-overlay pointer-events-none opacity-40" />

      {/* TOP CENTERED FLOATING TOAST NOTIFICATION */}
      {toast && toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-slide-down">
          <div className="bg-[#04121d] border-l-4 border-[#00ff9d] border-t border-r border-b border-[#00ff9d]/40 rounded-r-lg p-4 shadow-[0_0_35px_rgba(0,255,157,0.3)] flex items-start gap-3 relative backdrop-blur-md">
            <div className="p-2.5 rounded bg-[#00ff9d]/10 text-[#00ff9d] shrink-0 border border-[#00ff9d]/40 animate-pulse">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 text-left flex-1 pr-4">
              <div className="text-xs font-bold text-[#00ff9d] tracking-wider uppercase flex items-center justify-between">
                <span>{toast.title}</span>
              </div>
              <p className="text-xs font-semibold text-[#e2e8f0]">{toast.message}</p>
              <p className="text-[11px] text-[#94a3b8]">{toast.detail}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[#64748b] hover:text-[#e2e8f0] transition text-xs p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Authentication Card - PERFECTLY CENTERED */}
      <div className="w-full max-w-md mx-auto cyber-panel p-8 space-y-6 border border-[#00ff9d]/40 shadow-[0_0_50px_rgba(0,255,157,0.2)] relative z-10 text-center bg-[#070d14]/90 backdrop-blur-md rounded-xl">
        {/* ARVIX Branding */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-14 h-14 rounded-lg bg-[#00ff9d]/10 border border-[#00ff9d]/50 flex items-center justify-center text-[#00ff9d] shadow-[0_0_20px_rgba(0,255,157,0.4)] animate-pulse">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-widest text-[#00ff9d]">ARVIX</h1>
          <p className="text-[10px] text-[#64748b] tracking-widest uppercase">
            AI Digital Crime Scene Investigation Assistant
          </p>
        </div>

        {/* STATE 1: EMAIL-ONLY LOGIN FORM (Password Field Removed) */}
        {authStep === 'idle' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
            <h2 className="text-xs font-bold text-[#e2e8f0] uppercase tracking-wider text-center border-b border-[#132438] pb-2">
              INVESTIGATOR CREDENTIAL LOGIN
            </h2>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-[#64748b] font-bold tracking-wider">EMAIL OR USERNAME *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigator@arvix.sec"
                  className="w-full bg-[#02070b] border border-[#132438] focus:border-[#00ff9d] text-[#e2e8f0] pl-10 pr-4 py-3 rounded text-xs focus:outline-none transition-all duration-200 focus:shadow-[0_0_15px_rgba(0,255,157,0.2)]"
                />
                <Mail className="w-4 h-4 text-[#64748b] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#06090e] font-bold py-3.5 rounded text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(0,255,157,0.4)] mt-2"
            >
              <Cpu className="w-4 h-4" />
              AUTHENTICATE & SEND OTP
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STATE 2: PENDING AUTHORIZATION */}
        {authStep === 'pending_auth' && (
          <div className="py-6 space-y-4 bg-[#061018] p-5 rounded border border-[#00e5ff]/40">
            <Cpu className="w-10 h-10 text-[#00e5ff] animate-spin mx-auto" />
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#00e5ff] tracking-widest uppercase">
                INITIATING 2FA OTP REQUEST...
              </div>
              <div className="text-[11px] text-[#94a3b8]">
                Request ID: <strong className="text-[#00ff9d]">{currentReq?.requestId}</strong> | User: {currentReq?.email}
              </div>
            </div>
            <p className="text-[10px] text-[#64748b]">
              Connecting to backend OTP authority service...
            </p>
          </div>
        )}

        {/* STATE 3: OTP READY / INPUT 6 DIGITS WITH UNIQUE CYBER DECRYPTION ANIMATION */}
        {(authStep === 'otp_ready' || authStep === 'verifying') && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-[#00ff9d] uppercase tracking-wider flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00ff9d]" /> TWO-FACTOR OTP VERIFICATION
              </h2>
              <p className="text-[11px] text-[#94a3b8]">
                Enter 6-digit verification code sent to <strong className="text-[#00e5ff]">{currentReq?.email}</strong>
              </p>
            </div>

            {/* UNIQUE CYBER DECRYPTION RECEPTION DISPLAY BANNER */}
            {currentReq?.otp && (
              <div className="bg-[#020b12] border border-[#00ff9d]/50 rounded-xl p-3.5 space-y-2 text-left relative overflow-hidden shadow-[0_0_25px_rgba(0,255,157,0.2)]">
                {/* Background scanning light */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00ff9d]/10 to-transparent animate-pulse pointer-events-none" />

                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#00ff9d] font-bold tracking-widest uppercase flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-[#00ff9d] animate-ping" />
                    {isDecrypting ? 'DECRYPTING QUANTUM OTP...' : 'SIGNAL LOCKED // OTP DECRYPTED'}
                  </span>
                  <span className="text-[#00e5ff] font-mono text-[9px]">{currentReq.requestId}</span>
                </div>

                <div className="flex items-center justify-between bg-[#061422] p-2.5 rounded-lg border border-[#00ff9d]/30">
                  <div className="flex gap-2 font-mono font-bold text-xl text-[#00ff9d]">
                    {decryptedDigits.map((digit, i) => (
                      <span
                        key={i}
                        className={`w-7 h-9 flex items-center justify-center rounded bg-[#02070b] border ${
                          isDecrypting
                            ? 'border-[#00e5ff] text-[#00e5ff] animate-pulse'
                            : 'border-[#00ff9d]/60 text-[#00ff9d] shadow-[0_0_8px_rgba(0,255,157,0.4)]'
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
                    className="bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#06090e] font-bold text-[10px] px-3 py-2 rounded-md transition cursor-pointer flex items-center gap-1 shadow-[0_0_12px_rgba(0,255,157,0.5)] disabled:opacity-50"
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
                      className={`w-11 h-13 text-center text-lg font-bold bg-[#02070b] border rounded-lg text-[#00ff9d] focus:outline-none transition-all duration-200 ${
                        isAnimating
                          ? 'border-[#00ff9d] bg-[#00ff9d]/20 shadow-[0_0_15px_rgba(0,255,157,0.8)] scale-105'
                          : activeBoxIndex === idx
                          ? 'border-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.3)]'
                          : 'border-[#132438]'
                      }`}
                    />
                    {isAnimating && (
                      <div className="absolute inset-x-0 h-0.5 bg-[#00ff9d] top-1/2 -translate-y-1/2 shadow-[0_0_8px_#00ff9d] animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>

            {authStep === 'verifying' ? (
              <div className="text-xs text-[#00e5ff] font-bold animate-pulse flex items-center justify-center gap-2 py-2">
                <Cpu className="w-4 h-4 animate-spin" /> VERIFYING OTP WITH BACKEND...
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => handleVerifyOtp(otpDigits.join(''))}
                  disabled={otpDigits.join('').length < 6}
                  className="w-full bg-[#00ff9d] hover:bg-[#00ff9d]/80 text-[#06090e] font-bold py-3 rounded text-xs transition cursor-pointer disabled:opacity-40 shadow-[0_0_15px_rgba(0,255,157,0.3)]"
                >
                  VERIFY & LOGIN
                </button>

                {/* Resend OTP Button with Live Countdown Timer */}
                <div className="flex justify-between items-center text-xs pt-1 border-t border-[#132438]">
                  <span className="text-[10px] text-[#64748b]">Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isResending}
                    className="text-[#00e5ff] hover:text-[#00ff9d] font-bold text-xs flex items-center gap-1 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STATE 4: SUCCESS TRANSITION */}
        {authStep === 'success' && (
          <div className="py-6 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-[#00ff9d]/20 border-2 border-[#00ff9d] text-[#00ff9d] flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(0,255,157,0.6)] animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
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
          <div className="space-y-4 animate-shake">
            <div className="w-12 h-12 rounded-full bg-[#ff1744]/20 border border-[#ff1744] text-[#ff1744] flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(255,23,68,0.4)]">
              <AlertTriangle className="w-6 h-6" />
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
                className="flex-1 bg-[#ff1744]/20 hover:bg-[#ff1744]/30 text-[#ff1744] border border-[#ff1744] py-2 rounded text-xs font-bold transition cursor-pointer"
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => setAuthStep('idle')}
                className="flex-1 bg-[#061018] text-[#00e5ff] border border-[#00e5ff]/40 py-2 rounded text-xs transition cursor-pointer"
              >
                BACK TO LOGIN
              </button>
            </div>
          </div>
        )}

        {/* STATE 6: DENIED BY OPERATOR */}
        {authStep === 'denied' && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#ff1744]/20 border border-[#ff1744] text-[#ff1744] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
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
              className="w-full bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 py-2.5 rounded text-xs font-bold transition cursor-pointer"
            >
              REQUEST AGAIN
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#132438] pt-3 text-[10px] text-[#64748b] flex justify-between items-center">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-[#00ff9d]" /> ARVIX AUTHENTICATION SYSTEM</span>
          <span className="text-[#00e5ff]">ARVIX v2.1</span>
        </div>
      </div>
    </div>
  );
}
