import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, Brain, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await signIn(email, password);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Signed in successfully!');
        navigate('/app');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Unable to connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2 border border-gray-100 min-h-[640px]">
        
        {/* LEFT SIDE: Distinct Candidate Preparation Image Panel */}
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
              <span>Sign In to Continue</span>
            </div>

            <h2 className="text-3xl font-bold text-white leading-tight">
              Welcome back! Resume your interview practice sessions.
            </h2>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Track your performance & progress over time</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Access saved mock & HR interview results</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Practice 2-way AI voice conversations</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your interview workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-sm text-gray-900 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
        </div>

      </div>
    </div>
  );
}
