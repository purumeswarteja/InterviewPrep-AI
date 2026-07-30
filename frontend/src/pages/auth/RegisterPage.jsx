import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Sparkles, ArrowRight, Brain, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const passwordRules = [
  { id: 'len',   label: 'At least 6 characters',       test: (p) => p.length >= 6 },
  { id: 'upper', label: 'At least one uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'num',   label: 'At least one number',           test: (p) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      } else {
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2 border border-gray-100 min-h-[640px]">
        
        {/* LEFT SIDE: Distinct AI Interview Coaching Image Panel */}
        <div className="relative hidden md:flex flex-col justify-between p-10 overflow-hidden bg-gray-900">
          <img
            src="https://images.pexels.com/photos/8636626/pexels-photo-8636626.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="AI Interview Coaching Session"
            className="absolute inset-0 w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-700"
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
              <span>Join Successful Candidates</span>
            </div>

            <h2 className="text-3xl font-bold text-white leading-tight">
              Start practicing free & land your dream job offer.
            </h2>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero configuration required to start</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Detailed AI performance analytics & scores</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Custom role & industry mock interviews</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Register Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Create an account</h1>
            <p className="text-gray-500 text-sm mt-1">Get started with AI mock interviews today.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                <span>⚠️ {authError}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                />
              </div>
            </div>

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
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPwTouched(true); }}
                  placeholder="Enter your password"
                  required
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border outline-none text-sm text-gray-900 transition focus:ring-2 ${
                    pwTouched && failedRules.length > 0
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                      : pwTouched && failedRules.length === 0
                      ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-100'
                      : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-100'
                  }`}
                />
              </div>
              {/* Password Requirements */}
              {pwTouched && (
                <ul className="mt-2 space-y-1">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(password);
                    return (
                      <li key={rule.id} className={`flex items-center gap-1.5 text-xs font-medium ${
                        passed ? 'text-emerald-600' : 'text-red-500'
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
                <p className="mt-1.5 text-xs text-gray-400">
                  Must be 6+ chars, include an uppercase letter &amp; a number.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition">
              Sign in
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
