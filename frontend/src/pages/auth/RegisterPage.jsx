import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Target, ArrowRight, Brain, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import OtpVerification from '../../components/auth/OtpVerification';

const passwordRules = [
  { id: 'len',   label: 'At least 6 characters',       test: (p) => p.length >= 6 },
  { id: 'upper', label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'num',   label: 'At least one number',           test: (p) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const initialStep = searchParams.get('step') === 'verify' && initialEmail ? 'verify' : 'form';

  const [step, setStep] = useState(initialStep);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const failedRules = passwordRules.filter((r) => !r.test(password));

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!fullName || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (failedRules.length > 0) {
      setPwTouched(true);
      toast.error('Password does not meet all requirements.');
      return;
    }
    setLoading(true);
    try {
      const res = await signUp(email, password, fullName);
      if (res?.error) {
        setAuthError(res.error);
        toast.error(res.error);
      } else if (res?.requiresVerification) {
        toast.success(res.message || 'Verification code sent to your email.');
        setStep('verify');
      } else if (res?.token) {
        toast.success('Account created successfully! Welcome aboard.');
        navigate('/app');
      }
    } catch (err) {
      console.error('Register error:', err);
      const msg = 'Unable to connect to server. Please check your connection.';
      setAuthError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-violet-500 selection:text-white">
      <div className="w-full max-w-5xl bg-ink-900 rounded-3xl shadow-2xl overflow-hidden grid md:grid-cols-2 border border-ink-800 min-h-[640px]">
        
        {/* LEFT SIDE: Distinct AI Interview Coaching Image Panel */}
        <div className="relative hidden md:flex flex-col justify-between p-10 overflow-hidden bg-ink-950">
          <img
            src="https://images.pexels.com/photos/8636626/pexels-photo-8636626.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="AI Interview Coaching Session"
            className="absolute inset-0 w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent" />
          
          {/* Top Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-white">
              <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">InterPrep AI</span>
            </Link>
          </div>

          {/* Bottom Overlay Content */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-semibold backdrop-blur-md">
              <Target className="w-3.5 h-3.5" />
              <span>{step === 'verify' ? 'Email Verification' : 'Join Successful Candidates'}</span>
            </div>

            <h2 className="text-3xl font-bold text-white leading-tight">
              {step === 'verify'
                ? 'One quick step to activate your AI interview prep.'
                : 'Start practicing free & land your dream job offer.'}
            </h2>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-violet-400" />
                <span>Zero configuration required to start</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-violet-400" />
                <span>Detailed AI performance analytics & scores</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-violet-400" />
                <span>Custom role & industry mock interviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Register Form OR OTP Verification Screen */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-ink-900 text-white">
          {step === 'verify' ? (
            <OtpVerification
              email={email}
              password={password}
              title="Verify your email"
              subtitle="Enter the 6-digit code sent to your inbox to activate your account."
              actionType="signup"
              onBack={() => setStep('form')}
              onSuccess={() => {
                navigate('/app');
              }}
            />
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Create an account</h1>
                <p className="text-ink-400 text-sm mt-1">Get started with AI mock interviews today.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {authError && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                    <span>⚠️ {authError}</span>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-ink-700 bg-ink-950/80 text-white placeholder-ink-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-sm transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-ink-700 bg-ink-950/80 text-white placeholder-ink-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none text-sm transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-300 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-ink-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPwTouched(true); }}
                      placeholder="Enter your password"
                      required
                      className={`w-full pl-11 pr-11 py-3 rounded-xl border bg-ink-950/80 text-white placeholder-ink-500 outline-none text-sm transition focus:ring-2 ${
                        pwTouched && failedRules.length > 0
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-500/20'
                          : pwTouched && failedRules.length === 0
                          ? 'border-violet-500 focus:border-violet-500 focus:ring-violet-500/20'
                          : 'border-ink-700 focus:border-violet-500 focus:ring-violet-500/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-white cursor-pointer p-0.5"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {/* Password Requirements */}
                  {pwTouched && (
                    <ul className="mt-2 space-y-1">
                      {passwordRules.map((rule) => {
                        const passed = rule.test(password);
                        return (
                          <li key={rule.id} className={`flex items-center gap-1.5 text-xs font-medium ${
                            passed ? 'text-violet-400' : 'text-red-400'
                          }`}>
                            {passed
                              ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              : <XCircle className="w-3.5 h-3.5 shrink-0" />}
                            {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {!pwTouched && (
                    <p className="mt-1.5 text-xs text-ink-400">
                      Must be 6+ chars, include an uppercase letter &amp; a number.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue &amp; Verify Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-ink-400 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
