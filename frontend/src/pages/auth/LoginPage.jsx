import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Brain,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  KeyRound,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import OtpVerification from '../../components/auth/OtpVerification';

const passwordRules = [
  { id: 'len', label: 'At least 6 characters', test: (p) => p.length >= 6 },
  { id: 'upper', label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'num', label: 'At least one number', test: (p) => /[0-9]/.test(p) },
];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const initialStep = searchParams.get('step') === 'verify' && initialEmail ? 'verify' : 'form';

  const [step, setStep] = useState(initialStep); // 'form' | 'verify' | 'forgot_email' | 'forgot_otp' | 'forgot_new_password'
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Forgot Password flow state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotCountdown, setForgotCountdown] = useState(60);
  const [forgotCanResend, setForgotCanResend] = useState(false);

  const { signIn, resetForgotPassword } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for forgot password OTP resend
  useEffect(() => {
    let timer;
    if (step === 'forgot_otp' && forgotCountdown > 0) {
      setForgotCanResend(false);
      timer = setInterval(() => {
        setForgotCountdown((prev) => {
          if (prev <= 1) {
            setForgotCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (forgotCountdown === 0) {
      setForgotCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, forgotCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await signIn(email, password);
      if (res?.requiresVerification) {
        toast.error('Email verification required. Please verify your email before logging in.');
        setStep('verify');
      } else if (res?.error) {
        const errorMsg = res.error.includes('verified')
          ? res.error
          : 'Credentials not matched. Please try again.';
        setAuthError(errorMsg);
        toast.error(errorMsg);
      } else {
        toast.success('Signed in successfully!');
        navigate('/app');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = 'Unable to connect to server. Please check your connection.';
      setAuthError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ─── Forgot Password Handlers ───────────────────────────────────────────────
  const handleStartForgotPassword = () => {
    setForgotEmail(email || '');
    setForgotError('');
    setForgotOtp(['', '', '', '', '', '']);
    setStep('forgot_email');
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    setForgotError('');
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setForgotError('Please enter a valid email address.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.forgotPasswordRequest(cleanEmail);
      if (res?.error) {
        setForgotError(res.error);
        toast.error(res.error);
      } else {
        toast.success(res.message || `Verification code sent to ${cleanEmail}`);
        setForgotOtp(['', '', '', '', '', '']);
        setForgotCountdown(60);
        setStep('forgot_otp');
      }
    } catch (err) {
      setForgotError('Failed to send verification code. Please check your connection.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    const code = forgotOtp.join('');
    if (code.length !== 6) {
      setForgotError('Please enter all 6 digits of the verification code.');
      return;
    }

    setForgotLoading(true);
    try {
      const cleanEmail = forgotEmail.trim().toLowerCase();
      const res = await api.forgotPasswordVerifyOtp(cleanEmail, code);
      if (res?.error) {
        setForgotError(res.error);
        toast.error(res.error);
      } else {
        toast.success('Code verified! Now choose a new password.');
        setForgotResetToken(res.resetToken);
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        setForgotError('');
        setStep('forgot_new_password');
      }
    } catch (err) {
      setForgotError('Failed to verify code. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResendOtp = async () => {
    if (!forgotCanResend || forgotLoading) return;
    setForgotLoading(true);
    setForgotError('');
    try {
      const cleanEmail = forgotEmail.trim().toLowerCase();
      const res = await api.forgotPasswordResend(cleanEmail);
      if (res?.error) {
        setForgotError(res.error);
        toast.error(res.error);
      } else {
        toast.success('A fresh verification code has been sent!');
        setForgotCountdown(60);
        setForgotOtp(['', '', '', '', '', '']);
      }
    } catch (err) {
      toast.error('Failed to resend code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }
    if (!/[A-Z]/.test(forgotNewPassword)) {
      setForgotError('New password must contain at least one uppercase letter.');
      return;
    }
    if (!/[0-9]/.test(forgotNewPassword)) {
      setForgotError('New password must contain at least one number.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please re-enter.');
      return;
    }

    setForgotLoading(true);
    try {
      const cleanEmail = forgotEmail.trim().toLowerCase();
      const res = await resetForgotPassword(cleanEmail, forgotResetToken, forgotNewPassword);
      if (res?.error) {
        setForgotError(res.error);
        toast.error(res.error);
      } else {
        toast.success(res?.message || 'Password reset successfully! Welcome to your interview workspace.');
        navigate('/app');
      }
    } catch (err) {
      setForgotError('Failed to reset password. Please check your connection.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleDigitChange = (idx, val) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const next = [...forgotOtp];
    next[idx] = clean;
    setForgotOtp(next);
    setForgotError('');
    if (clean && idx < 5) {
      const el = document.getElementById(`f-otp-${idx + 1}`);
      if (el) el.focus();
    }
  };

  const handleDigitKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !forgotOtp[idx] && idx > 0) {
      const el = document.getElementById(`f-otp-${idx - 1}`);
      if (el) el.focus();
    }
  };

  const handleDigitPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setForgotOtp(next);
    setForgotError('');
    const targetIdx = Math.min(pasted.length, 5);
    const el = document.getElementById(`f-otp-${targetIdx}`);
    if (el) el.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2 border border-gray-100 min-h-[640px]">
        
        {/* LEFT SIDE: Candidate Preparation Image Panel */}
        <div className="relative hidden md:flex flex-col justify-between p-10 overflow-hidden bg-gray-900">
          <img
            src="https://images.pexels.com/photos/5439152/pexels-photo-5439152.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Candidate preparing for interview"
            className="absolute inset-0 w-full h-full object-cover opacity-45 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          
          {/* Top Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-white">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">InterPrep AI</span>
            </Link>
          </div>

          {/* Bottom Overlay Content */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {step.startsWith('forgot')
                  ? 'Password Recovery'
                  : step === 'verify'
                  ? 'Account Verification'
                  : 'Sign In to Continue'}
              </span>
            </div>

            <h2 className="text-3xl font-bold text-white leading-tight">
              {step === 'forgot_new_password'
                ? 'Create a secure new password to regain access to your account.'
                : step === 'forgot_otp'
                ? 'Authenticate with your verification code to reset your password.'
                : step === 'forgot_email'
                ? 'Secure account recovery with instant email verification.'
                : step === 'verify'
                ? 'Verify your email to continue to your interview workspace.'
                : 'Welcome back! Resume your interview practice sessions.'}
            </h2>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Track your performance &amp; progress over time</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Access saved mock &amp; HR interview results</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Practice 2-way AI voice conversations</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Dynamic View (Login, Verification, or Forgot Password) */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          {/* STEP: Verify Existing Unverified Account */}
          {step === 'verify' && (
            <OtpVerification
              email={email}
              password={password}
              title="Verify your account"
              subtitle="Your account is not verified yet. Enter the code sent to your email to continue."
              actionType="login"
              onBack={() => setStep('form')}
              onSuccess={() => {
                navigate('/app');
              }}
            />
          )}

          {/* STEP: Forgot Password - 1. Enter Email */}
          {step === 'forgot_email' && (
            <div className="space-y-6 animate-fade-in">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Forgot password?</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Enter your registered account email. We'll send you a 6-digit verification code to reset your password.
                </p>
              </div>

              {forgotError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{forgotError}</span>
                </div>
              )}

              <form onSubmit={handleForgotRequest} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Account Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      required
                      autoFocus
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP: Forgot Password - 2. Enter 6-Digit OTP */}
          {step === 'forgot_otp' && (
            <div className="space-y-6 animate-fade-in">
              <button
                type="button"
                onClick={() => setStep('forgot_email')}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-800 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change email</span>
              </button>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Enter verification code</h1>
                <p className="text-gray-500 text-sm mt-1">
                  We sent a 6-digit reset code to:
                </p>
                <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-mono font-semibold border border-emerald-200">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{forgotEmail}</span>
                </div>
              </div>

              {forgotError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{forgotError}</span>
                </div>
              )}

              <form onSubmit={handleForgotVerifyOtp} className="space-y-5">
                <div>
                  <label className="block text-center text-xs font-semibold uppercase tracking-wider text-gray-600 mb-3">
                    6-Digit Verification Code
                  </label>
                  <div className="flex items-center justify-center gap-2.5" onPaste={handleDigitPaste}>
                    {forgotOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`f-otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        disabled={forgotLoading}
                        className={`w-11 h-13 text-center text-xl font-bold rounded-xl border transition-all outline-none font-mono ${
                          digit
                            ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 ring-2 ring-emerald-100'
                            : 'border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  {forgotCanResend ? (
                    <button
                      type="button"
                      onClick={handleForgotResendOtp}
                      disabled={forgotLoading}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend Code</span>
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Resend code in <span className="font-mono font-semibold text-gray-600">{forgotCountdown}s</span>
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || forgotOtp.join('').length !== 6}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Verify Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP: Forgot Password - 3. Create New Password */}
          {step === 'forgot_new_password' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Email verified: {forgotEmail}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Create new password</h1>
                <p className="text-gray-500 text-sm mt-1">
                  Choose a new strong password for your account.
                </p>
              </div>

              {forgotError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{forgotError}</span>
                </div>
              )}

              <form onSubmit={handleForgotResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      autoFocus
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                      title={showForgotNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showForgotNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Password rules checklist */}
                  <div className="mt-2 space-y-1">
                    {passwordRules.map((rule) => {
                      const passed = rule.test(forgotNewPassword);
                      return (
                        <div key={rule.id} className={`flex items-center gap-1.5 text-[11px] font-medium ${passed ? 'text-emerald-600' : 'text-gray-400'}`}>
                          <Check className={`w-3 h-3 shrink-0 ${passed ? 'text-emerald-600' : 'text-gray-300'}`} />
                          <span>{rule.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showForgotConfirmPassword ? 'text' : 'password'}
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                      title={showForgotConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showForgotConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading || !forgotNewPassword || !forgotConfirmPassword}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Reset &amp; Save Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP: Standard Login Form */}
          {step === 'form' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
                <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your interview workspace.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {authError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                    <span>⚠️ {authError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleStartForgotPassword}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-8">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 transition">
                  Create an account
                </Link>
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
