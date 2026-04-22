import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

import { LogoIcon } from '../../components/Logo';


// Google SVG logo
const GoogleIcon = () => (
  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4" />
    <path d="M12.24 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853" />
    <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.5166C-0.18551 10.0056 -0.18551 14.0004 1.5166 17.3912L5.50253 14.3003Z" fill="#FBBC05" />
    <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50253 9.70575C6.45064 6.86173 9.10947 4.74966 12.24 4.74966Z" fill="#EA4335" />
  </svg>
);

// GitHub SVG logo
const GitHubIcon = () => (
  <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const Login = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
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
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success("Account created! Check your inbox if email confirmation is enabled.");
        setMode('signin'); 
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/app/dashboard');
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      toast.error(`Failed to sign in with ${provider}: ${error.message}`);
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
          {/* Toggle */}
          <div className="flex flex-col gap-2">
            <div className="bg-surface-container p-1 rounded-xl flex w-full border border-[#484848]">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'signin' ? 'bg-outline-variant text-white' : 'text-on-surface-variant hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'signup' ? 'bg-outline-variant text-white' : 'text-on-surface-variant hover:text-white'}`}
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'signin' ? 'Welcome back' : 'Initialize Workspace'}
            </h2>
            <p className="text-on-surface-variant text-sm">
              {mode === 'signin' ? 'Enter your details to access your secure vault.' : 'Set up your digital integrity infrastructure.'}
            </p>
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
                {mode === 'signin' && (
                  <a className="text-xs font-medium text-tertiary hover:text-[#e79400] transition-colors cursor-pointer">
                    Forgot password?
                  </a>
                )}
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
                <span>{loading ? 'Processing...' : (mode === 'signin' ? 'Continue Securely' : 'Generate Keys & Register')}</span>
                {!loading && <ArrowRight size={20} />}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#484848]"></div>
            <span className="flex-shrink-0 mx-4 text-on-surface-variant text-xs font-medium uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-[#484848]"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center gap-3 bg-surface-container hover:bg-outline-variant border border-[#484848] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 group"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="flex items-center justify-center gap-3 bg-surface-container hover:bg-outline-variant border border-[#484848] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 group"
            >
              <GitHubIcon />
              <span>GitHub</span>
            </button>
          </div>

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
