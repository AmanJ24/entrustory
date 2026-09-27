import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../utils/supabase';

import { LogoIcon } from '../../components/Logo';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/app/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-surface font-['Space_Grotesk'] text-white antialiased selection:bg-[#ffb148] selection:text-[#0e0e0e]">
      
      {/* Left Side: Visual */}
      <div className="hidden lg:flex w-1/2 relative bg-surface-container overflow-hidden flex-col justify-between p-12">
        {/* Background Lock Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0e0e0e]/30 to-[#0e0e0e]"></div>
          {/* 3D Lock visualization using CSS */}
          <div className="absolute inset-0 flex items-center justify-center opacity-50">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-80 h-80 border-[3px] border-[#ffb148]/20 rounded-full" />
              {/* Inner ring */}
              <div className="absolute inset-8 border-[2px] border-[#ffb148]/15 rounded-full" />
              {/* Lock body */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-28 bg-gradient-to-b from-[#ffb148]/10 to-[#ffb148]/5 rounded-2xl border border-[#ffb148]/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-[#ffb148]/30 border-2 border-[#ffb148]/40" />
              </div>
              {/* Lock shackle */}
              <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-20 h-24 border-[3px] border-[#ffb148]/20 rounded-t-full border-b-0" />
              {/* Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#ffb148]/5 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white mb-8">
            <div className="size-8 text-tertiary">
              <LogoIcon className="w-full h-full" />
            </div>
            <h2 className="text-2xl font-bold leading-tight tracking-tight">Entrustory</h2>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight">
            Secure Access for the <span className="text-tertiary">Digital Age</span>
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
            Entrustory provides verifiable proof of digital work with our programmable integrity infrastructure. Join thousands of developers building the future of trust.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-on-surface-variant">
            <div className="flex items-center gap-2">
              <Shield className="text-tertiary" size={20} />
              <span>SOC2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="text-tertiary" size={20} />
              <span>End-to-end Encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 relative">
        {/* Mobile Header Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3 text-white">
          <div className="size-6 text-tertiary">
            <LogoIcon className="w-full h-full" />
          </div>
          <h2 className="text-xl font-bold leading-tight">Entrustory</h2>
        </div>

        <div className="w-full max-w-[440px] flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-on-surface-variant text-sm">Enter your details to access your secure vault.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-tertiary transition-colors text-[20px]">mail</span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-surface-container border border-[#484848] text-white text-base rounded-xl focus:ring-2 focus:ring-[#ffb148]/50 focus:border-[#ffb148] block pl-11 p-3.5 placeholder:text-on-surface-variant/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-white">Password</label>
                <a className="text-xs font-medium text-tertiary hover:text-[#e79400] transition-colors cursor-pointer">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-on-surface-variant group-focus-within:text-tertiary transition-colors text-[20px]">lock</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-container border border-[#484848] text-white text-base rounded-xl focus:ring-2 focus:ring-[#ffb148]/50 focus:border-[#ffb148] block pl-11 pr-11 p-3.5 placeholder:text-on-surface-variant/50 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-white transition-colors"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#ffb148] hover:bg-[#e79400] disabled:opacity-50 text-[#0e0e0e] font-bold text-base py-3.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(255,177,72,0.15)] hover:shadow-[0_0_25px_rgba(255,177,72,0.3)] flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Processing...' : 'Continue Securely'}</span>
                {!loading && <ArrowRight size={20} />}
              </button>
            </div>
          </form>

          {/* Footer Security Notes */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-on-surface-variant opacity-70">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-tertiary">fingerprint</span>
              <span>Biometric Support</span>
            </div>
            <div className="w-1 h-1 bg-[#ababab] rounded-full"></div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-tertiary">encrypted</span>
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>

        <p className="absolute bottom-6 text-center text-xs text-on-surface-variant/50 max-w-sm">
          By continuing, you agree to Entrustory's <a className="underline hover:text-white" href="#">Terms of Service</a> and <a className="underline hover:text-white" href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};
