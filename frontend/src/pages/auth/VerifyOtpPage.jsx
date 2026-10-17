import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, Sparkles, CheckCircle2 } from 'lucide-react';
import OtpVerification from '../../components/auth/OtpVerification';

export default function VerifyOtpPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2 border border-gray-100 min-h-[640px]">
        {/* Left branding panel */}
        <div className="relative hidden md:flex flex-col justify-between p-10 overflow-hidden bg-gray-900">
          <img
            src="https://images.pexels.com/photos/8636626/pexels-photo-8636626.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="InterPrep AI Workspace"
            className="absolute inset-0 w-full h-full object-cover opacity-40 hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 text-white">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">InterPrep AI</span>
            </Link>
          </div>
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Email Verification</span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight">
              Verify your email to access your personalized interview dashboard.
            </h2>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Secure account protection with two-step validation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant access upon OTP verification</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side verification */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <OtpVerification
            email={email}
            title="Verify your email"
            subtitle="Please enter the 6-digit verification code sent to your inbox."
            actionType="signup"
            onBack={() => navigate('/login')}
            onSuccess={() => {
              navigate('/app');
            }}
          />
        </div>
      </div>
    </div>
  );
}
