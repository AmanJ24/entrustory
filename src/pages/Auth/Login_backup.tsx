import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen flex w-full bg-[#111718] font-['Space_Grotesk'] text-white antialiased selection:bg-[#0dccf2] selection:text-[#111718]">
      {/* Left Side: Visual */}
      <div className="hidden lg:flex w-1/2 relative bg-[#1b2527] overflow-hidden flex-col justify-between p-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            alt="Abstract 3D secure digital lock"
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEd-uRO3dTMBGdfoYqy9qJbHCTMQsb8ECJsG1tN4GmYzwZqCv4h1aX5Ece4ciSBFVswu1fZqOFDQAdSMHyJztbGbIAgFJjmpqqhN4S3kGusaJwApvV52EtOOAPPyHpQm2f6M2kzsipwTtVsU5rKAEhYv8xL2_majMQpGoPhIIaDYNlEr22KRD65M9nb3OsHaUAfVeX2cNKpIpsv8lePR4CKEsUd51bRFzEe9RPyYJW8emg7lB5NHRNL34RNyK9veorqFC8zFmWpw" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111718] via-transparent to-transparent"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="w-8 h-8 text-[#0dccf2]">
              <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold leading-tight tracking-tight">Entrustory</h2>
          </div>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight">
            Secure Access for the <span className="text-[#0dccf2]">Digital Age</span>
          </h1>
          <p className="text-lg text-[#9cb5ba] leading-relaxed mb-8">
            Entrustory provides verifiable proof of digital work with our programmable integrity infrastructure. Join thousands of developers building the future of trust.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-[#9cb5ba]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0dccf2] text-[20px]">shield</span>
              <span>SOC2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0dccf2] text-[20px]">lock</span>
              <span>End-to-end Encryption</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 relative bg-[#111718]">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-3 text-white">
          <div className="w-6 h-6 text-[#0dccf2]">
            <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold leading-tight">Entrustory</h2>
        </div>

        <div className="w-full max-w-[440px] flex flex-col gap-8">
          {/* Toggle */}
          <div className="bg-[#1b2527] p-1 rounded-xl flex w-full border border-[#283639]">
            <button 
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'signin' ? 'bg-[#283639] text-white' : 'text-[#9cb5ba] hover:text-white'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-center text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'signup' ? 'bg-[#283639] text-white' : 'text-[#9cb5ba] hover:text-white'}`}
            >
              Create Account
            </button>
          </div>
          
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-[#9cb5ba] text-sm">Enter your details to access your secure vault.</p>
          </div>

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
                  placeholder="name@company.com"
                  className="w-full bg-[#1b2527] border border-[#283639] text-white text-base rounded-xl focus:ring-2 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2] block pl-11 p-3.5 placeholder-[#9cb5ba]/50 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-white">Password</label>
                <a href="#" className="text-xs font-medium text-[#0dccf2] hover:text-[#0ab8da] transition-colors">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#9cb5ba] group-focus-within:text-[#0dccf2] transition-colors text-[20px]">lock</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-[#1b2527] border border-[#283639] text-white text-base rounded-xl focus:ring-2 focus:ring-[#0dccf2]/50 focus:border-[#0dccf2] block pl-11 pr-11 p-3.5 placeholder-[#9cb5ba]/50 transition-all outline-none"
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9cb5ba] hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full bg-[#0dccf2] hover:bg-[#0ab8da] text-[#111718] font-bold text-base py-3.5 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(13,204,242,0.15)] flex items-center justify-center gap-2">
                <span>Continue Securely</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#283639]"></div>
            <span className="flex-shrink-0 mx-4 text-[#9cb5ba] text-xs font-medium uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-[#283639]"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center gap-3 bg-[#1b2527] hover:bg-[#283639] border border-[#283639] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"></path>
                <path d="M12.24 24.0008C15.4766 24.0008 18.2059 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853"></path>
                <path d="M5.50253 14.3003C5.00236 12.8099 5.00236 11.1961 5.50253 9.70575V6.61481H1.5166C-0.18551 10.0056 -0.18551 14.0004 1.5166 17.3912L5.50253 14.3003Z" fill="#FBBC05"></path>
                <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.61481L5.50253 9.70575C6.45064 6.86173 9.10947 4.74966 12.24 4.74966Z" fill="#EA4335"></path>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-3 bg-[#1b2527] hover:bg-[#283639] border border-[#283639] text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 group">
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"></path>
              </svg>
              <span>GitHub</span>
            </button>
          </div>

          {/* Footer Security Notes */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#9cb5ba] opacity-70">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0dccf2]">fingerprint</span>
              <span>Biometric Support</span>
            </div>
            <div className="w-1 h-1 bg-[#9cb5ba] rounded-full"></div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#0dccf2]">encrypted</span>
              <span>256-bit Encryption</span>
            </div>
          </div>
        </div>
        
        <p className="absolute bottom-6 text-center text-xs text-[#9cb5ba]/50 max-w-sm">
          By continuing, you agree to Entrustory's <a className="underline hover:text-white" href="#">Terms of Service</a> and <a className="underline hover:text-white" href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};
