import React, { useState, useEffect, useRef } from 'react';
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function OtpVerification({
  email,
  title = 'Verify your email',
  subtitle = 'We sent a 6-digit verification code to',
  onSuccess,
  onBack,
  password = null,
  actionType = 'signup',
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputRefs = useRef([]);
  const { verifyOtp, resendOtp } = useAuth();

  // Focus the first input on initial mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Resend countdown timer
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    setErrorMsg('');
    setSuccessMsg('');

    // Handle single digit input
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue) {
      const nextDigits = [...digits];
      nextDigits[index] = '';
      setDigits(nextDigits);
      return;
    }

    const char = cleanValue.slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // Auto-advance to the next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    const pastedData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pastedData) return;

    const nextDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      if (i < pastedData.length) {
        nextDigits[i] = pastedData[i];
      }
    }
    setDigits(nextDigits);

    const focusIdx = Math.min(pastedData.length, 5);
    if (inputRefs.current[focusIdx]) {
      inputRefs.current[focusIdx].focus();
    }

    // Auto-trigger verify if exactly 6 digits pasted
    if (pastedData.length >= 6) {
      submitVerification(nextDigits.join(''));
    }
  };

  const submitVerification = async (codeToVerify) => {
    const fullCode = codeToVerify || digits.join('');
    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of the code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await verifyOtp(email, fullCode, password);
      if (res?.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
      } else {
        toast.success(res.message || 'Email verified successfully!');
        setSuccessMsg(res.message || 'Email verified successfully!');
        if (onSuccess) {
          onSuccess(res);
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      const msg = 'Unable to connect to verification server. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    submitVerification();
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await resendOtp(email);
      if (res?.error) {
        setErrorMsg(res.error);
        toast.error(res.error);
        if (res.secondsRemaining) {
          setCountdown(res.secondsRemaining);
        }
      } else {
        const msg = res.message || 'A fresh verification code has been sent to your email.';
        setSuccessMsg(msg);
        toast.success(msg);
        setCountdown(60);
        setDigits(['', '', '', '', '', '']);
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      const msg = 'Failed to resend code. Please try again later.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Back button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-ink-400 hover:text-white transition mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>{actionType === 'login' ? 'Back to Sign In' : 'Back to Sign Up'}</span>
        </button>
      )}

      {/* Header icon badge */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500/20 to-purple-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-md shadow-violet-500/10 animate-scale-in">
          <ShieldCheck className="w-8 h-8 text-violet-400" />
        </div>
      </div>

      {/* Title & Email Display */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight font-display">
          {title}
        </h2>
        <p className="text-ink-400 text-sm mt-1.5 leading-relaxed">
          {subtitle}
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-violet-950/60 border border-violet-800/80 text-violet-300 text-xs font-medium">
          <Mail className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span className="font-semibold break-all">{email}</span>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
          <div className="flex-1 leading-snug">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-violet-950/60 border border-violet-800 text-violet-300 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-violet-400 mt-0.5" />
          <div className="flex-1 leading-snug">{successMsg}</div>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleVerifySubmit} className="space-y-6">
        <div>
          <label className="block text-center text-xs font-semibold uppercase tracking-wider text-ink-300 mb-3">
            Enter 6-Digit Code
          </label>

          {/* 6 Digit Input Group */}
          <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading}
                className={`w-11 h-13 sm:w-13 sm:h-14 text-center text-xl sm:text-2xl font-bold rounded-xl border transition-all outline-none font-mono ${
                  digit
                    ? 'border-violet-500 bg-violet-950/50 text-white ring-2 ring-violet-500/30'
                    : 'border-ink-700 bg-ink-950 text-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
                } disabled:opacity-50`}
              />
            ))}
          </div>

          <p className="text-center text-xs text-ink-400 mt-3">
            Code expires in <span className="font-semibold text-ink-200">10 minutes</span>. Check your inbox &amp; spam folder.
          </p>
        </div>

        {/* Verify Action Button */}
        <button
          type="submit"
          disabled={loading || digits.join('').length !== 6}
          className="w-full py-3.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Verify &amp; Activate Account</span>
          )}
        </button>
      </form>

      {/* Resend Section */}
      <div className="mt-6 text-center pt-5 border-t border-ink-800">
        <p className="text-xs text-ink-400 mb-2">Didn't receive the verification code?</p>
        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 hover:underline transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>{resending ? 'Sending code…' : 'Resend Code'}</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-ink-400 font-medium">
            Resend available in{' '}
            <span className="font-semibold text-white font-mono">
              {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
