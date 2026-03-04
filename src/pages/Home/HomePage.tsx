import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div className="antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-white bg-[#0B1120] text-[#f8fafc] font-sans min-h-screen">
      {/* Local Styles for Animations and Glassmorphism matching your HTML exactly */}
      <style>{`
        .glass-card {
          background: rgba(22, 30, 50, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        .text-glow {
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.4);
        }
        .grid-bg-home {
          background-image: 
            linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
          -webkit-mask-image: radial-gradient(circle at center, black, transparent 80%);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl font-bold">fingerprint</span>
              </div>
              <span className="font-bold text-xl tracking-tight">Entrustory</span>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium text-slate-300">
              <a className="hover:text-cyan-400 transition-colors" href="#">Platform</a>
              <a className="hover:text-cyan-400 transition-colors" href="#">Developers</a>
              <a className="hover:text-cyan-400 transition-colors" href="#">Security</a>
              <a className="hover:text-cyan-400 transition-colors" href="#">Pricing</a>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</Link>
              <Link to="/login" className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 grid-bg-home -z-10"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cyan-900/10 to-transparent -z-10 blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Text */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 mb-8 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">v1.0 API Live</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
                Digital Integrity <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-glow">Infrastructure</span>
                <br />
                for the Modern Era
              </h1>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg">
                A programmable, version-aware platform providing verifiable proof of digital work. Move beyond static timestamps to dynamic lifecycle integrity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login" className="px-8 py-4 rounded-lg bg-white text-slate-900 font-bold hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2 group">
                  Start Building
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg">arrow_forward</span>
                </Link>
                <button className="px-8 py-4 rounded-lg border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all text-slate-300 font-medium flex items-center justify-center gap-2 font-mono">
                  <span className="text-cyan-500">$</span> npm install entrustory
                </button>
              </div>
              <div className="mt-12 flex items-center gap-6 text-slate-500 text-sm">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">verified_user</span> SOC2 Ready</span>
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">code</span> API First</span>
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-lg">lock</span> Zero-Knowledge</span>
              </div>
            </div>

            {/* Hero 3D Animation Graphic */}
            <div className="relative h-[500px] w-full hidden lg:block" style={{ perspective: '1000px' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-32 h-32 bg-cyan-500/10 rounded-full border border-cyan-500/50 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.2)] z-20 backdrop-blur-md">
                  <span className="material-symbols-outlined text-6xl text-cyan-400">hub</span>
                </div>
                
                <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-slate-800/80 rounded-xl border border-slate-600 flex items-center justify-center z-10 glass-card animate-[bounce_3s_infinite]">
                  <span className="material-symbols-outlined text-2xl text-slate-400">folder_zip</span>
                </div>
                <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-slate-800/80 rounded-xl border border-slate-600 flex items-center justify-center z-10 glass-card animate-[bounce_4s_infinite]">
                  <span className="material-symbols-outlined text-2xl text-slate-400">history_edu</span>
                </div>
                <div className="absolute top-1/3 right-10 w-14 h-14 bg-slate-800/80 rounded-xl border border-slate-600 flex items-center justify-center z-10 glass-card animate-[bounce_5s_infinite]">
                  <span className="material-symbols-outlined text-xl text-slate-400">api</span>
                </div>
                
                <div className="absolute w-[200px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute w-[200px] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -rotate-45 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="absolute w-[400px] h-[400px] border border-slate-700/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute w-[550px] h-[550px] border border-dashed border-slate-700/30 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
                
                <div className="absolute -bottom-10 -right-10 w-64 glass-card p-4 rounded-lg font-mono text-xs text-slate-300 border-l-4 border-cyan-500 shadow-2xl">
                  <div className="flex justify-between mb-2 text-slate-500">
                    <span>proof.json</span><span>JSON</span>
                  </div>
                  <div className="space-y-1">
                    <p><span className="text-purple-400">"root"</span>: <span className="text-green-400">"0x7a2...f9"</span>,</p>
                    <p><span className="text-purple-400">"algo"</span>: <span className="text-yellow-400">"sha256"</span>,</p>
                    <p><span className="text-purple-400">"verified"</span>: <span className="text-cyan-400">true</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-24 relative bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Capabilities</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Built for developers who demand more than a simple timestamp. Our infrastructure is designed for scale, security, and version-awareness.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Capability 1 */}
            <div className="glass-card rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-900/30 transition-colors">
                <span className="material-symbols-outlined text-cyan-400 text-3xl">terminal</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Client-Side Hashing</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Files never leave your device in plaintext. Our engine handles SHA-256 hashing locally, ensuring absolute privacy before any data touches the network.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-xs text-slate-300 font-mono"><span className="material-symbols-outlined text-green-400 text-sm mr-2">check_circle</span> Zero-knowledge proof</li>
                <li className="flex items-center text-xs text-slate-300 font-mono"><span className="material-symbols-outlined text-green-400 text-sm mr-2">check_circle</span> Large file chunking</li>
              </ul>
            </div>
            
            {/* Capability 2 */}
            <div className="glass-card rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all"></div>
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-900/30 transition-colors relative z-10">
                <span className="material-symbols-outlined text-cyan-400 text-3xl">account_tree</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white relative z-10">Merkle Tree System</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 relative z-10">Deterministic version grouping using lexicographically sorted Merkle trees. Generate proofs of inclusion efficiently without exposing the entire dataset.</p>
              <ul className="space-y-2 relative z-10">
                <li className="flex items-center text-xs text-slate-300 font-mono"><span className="material-symbols-outlined text-green-400 text-sm mr-2">check_circle</span> O(log n) verification</li>
                <li className="flex items-center text-xs text-slate-300 font-mono"><span className="material-symbols-outlined text-green-400 text-sm mr-2">check_circle</span> Batch processing</li>
              </ul>
            </div>

            {/* Capability 3 */}
            <div className="glass-card rounded-2xl p-8 hover:border-cyan-500/30 transition-all duration-300 group">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-900/30 transition-colors">
                <span className="material-symbols-outlined text-cyan-400 text-3xl">layers</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Multi-Layer Proof</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Choose your assurance level. From simple digital signatures to public transparency logs and immutable blockchain anchoring for maximum integrity.</p>
              <ul className="space-y-2">
                <li className="flex items-center text-xs text-slate-300 font-mono"><span className="material-symbols-outlined text-green-400 text-sm mr-2">check_circle</span> Ed25519 Signatures</li>
                <li className="flex items-center text-xs text-slate-300 font-mono"><span className="material-symbols-outlined text-green-400 text-sm mr-2">check_circle</span> Blockchain Anchoring</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section className="py-20 border-t border-slate-800 bg-[#0B1120]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6">Designed for Developer Workflows</h3>
              <p className="text-slate-400 mb-8">
                Integrate integrity checks directly into your CI/CD pipeline, CMS, or application logic. We provide a robust API and SDKs for effortless implementation.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-800 rounded text-cyan-400"><span className="material-symbols-outlined">webhook</span></div>
                  <div>
                    <h4 className="font-semibold text-white">Webhooks</h4>
                    <p className="text-sm text-slate-500">Real-time notifications for verification attempts and version updates.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-800 rounded text-cyan-400"><span className="material-symbols-outlined">key</span></div>
                  <div>
                    <h4 className="font-semibold text-white">API Keys & Scopes</h4>
                    <p className="text-sm text-slate-500">Granular access control for team environments and automated agents.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Code Block */}
            <div className="rounded-xl overflow-hidden bg-[#1e1e1e] shadow-2xl border border-slate-700 font-mono text-sm">
              <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-black/20">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-slate-500 text-xs">verify.ts</div>
              </div>
              <div className="p-6 overflow-x-auto text-slate-300">
                <pre><code>
<span className="text-purple-400">import</span> {'{ Entrustory }'} <span className="text-purple-400">from</span> <span className="text-green-400">'@entrustory/sdk'</span>;<br/><br/>
<span className="text-slate-500">// Initialize client</span><br/>
<span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> <span className="text-yellow-400">Entrustory</span>(API_KEY);<br/><br/>
<span className="text-purple-400">async function</span> <span className="text-blue-400">verifyAsset</span>(file) {'{'}<br/>
  <span className="text-slate-500">  // 1. Hash locally</span><br/>
  <span className="text-purple-400">  const</span> hash = <span className="text-purple-400">await</span> client.crypto.<span className="text-blue-400">sha256</span>(file);<br/><br/>
  <span className="text-slate-500">  // 2. Verify against ledger</span><br/>
  <span className="text-purple-400">  const</span> proof = <span className="text-purple-400">await</span> client.proof.<span className="text-blue-400">verify</span>(hash);<br/><br/>
  <span className="text-purple-400">  if</span> (proof.isValid) {'{'}<br/>
    {'    '}console.<span className="text-blue-400">log</span>(<span className="text-green-400">`Verified at: ${'{'}proof.timestamp{'}'}`</span>);<br/>
    {'    '}console.<span className="text-blue-400">log</span>(<span className="text-green-400">`Merkle Root: ${'{'}proof.root{'}'}`</span>);<br/>
  {'  }'}<br/>
{'}'}
                </code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
