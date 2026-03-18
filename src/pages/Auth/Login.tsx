import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fingerprint as FingerprintIcon, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import toast from 'react-hot-toast';

export const Login = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        // 1. Register the user
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Account created! Check your inbox if email confirmation is enabled.");
        // Automatically switch to sign in mode after successful signup
        setMode('signin'); 
      } else {
        // 2. Log the user in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // 3. Redirect to the secure dashboard
        navigate('/app/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#111718] font-['Space_Grotesk'] text-white antialiased selection:bg-[#0dccf2] selection:text-[#111718]">
      
      {/* ... Left Side Visual (Keep this exactly as it was) ... */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1b2527] overflow-hidden flex-col justify-between p-12 border-r border-[#283639]">
        {/* Background Image & Grid */}
        <div className="absolute inset-0 z-0 opacity-20">
           <div className="absolute inset-0" style={{
             backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.2) 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
           }}></div>
        </div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white mb-8">
            <div className="w-10 h-10 rounded bg-[#0dccf2]/10 border border-[#0dccf2]/30 flex items-center justify-center text-[#0dccf2] shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <FingerprintIcon size={24} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Entrustory</h2>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Secure Access for the <span className="text-[#0dccf2]">Digital Age</span>
          </h1>
          <p className="text-lg text-[#9cb5ba] leading-relaxed mb-8">
            Entrustory provides verifiable proof of digital work with our programmable integrity infrastructure.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-[#9cb5ba]">
            <div className="flex items-center gap-2">
              <Shield className="text-[#0dccf2]" size={20} />
              <span>SOC2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="text-[#0dccf2]" size={20} />
              <span>Zero-Knowledge Proofs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 relative bg-[#111718]">
        
        <div className="w-full max-w-[440px] flex flex-col gap-8">
          
          {/* Toggle */}
          <div className="bg-[#1b2527] p-1 rounded-xl flex w-full border border-[#283639]">
            <button 
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'signin' ? 'bg-[#283639] text-white' : 'text-[#9cb5ba] hover:text-white'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'signup' ? 'bg-[#283639] text-white' : 'text-[#9cb5ba] hover:text-white'}`}
            >
              Create Account
            </button>
          </div>
          
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white">
              {mode === 'signin' ? 'Welcome back' : 'Initialize Workspace'}
            </h2>
            <p className="text-[#9cb5ba] text-sm">
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
                  <span className="material-symbols-outlined text-[#9cb5ba] group-focus-within:text-[#0dccf2] transition-colors text-[20px]">mail</span>
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#1b2527] border border-[#283639] text-white text-base rounded-xl focus:ring-2 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2] block pl-11 p-3.5 placeholder:text-[#9cb5ba]/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-white">Password</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#9cb5ba] group-focus-within:text-[#0dccf2] transition-colors text-[20px]">lock</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#1b2527] border border-[#283639] text-white text-base rounded-xl focus:ring-2 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2] block pl-11 pr-11 p-3.5 placeholder:text-[#9cb5ba]/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0dccf2] hover:bg-[#0ab8da] disabled:opacity-50 text-[#111718] font-bold text-base py-3.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(13,204,242,0.15)] flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Processing...' : (mode === 'signin' ? 'Continue Securely' : 'Generate Keys & Register')}</span>
                {!loading && <ArrowRight size={20} />}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
