import { Link } from 'react-router-dom';

export const HomePage = () => {
  return (
    <div className="antialiased overflow-x-hidden selection:bg-[#44d8f1]/30 selection:text-[#44d8f1] bg-[#0f131d] text-[#dfe2f1] min-h-screen">
      <style>{`
        .hero-gradient {
          background: radial-gradient(circle at 50% -20%, rgba(68, 216, 241, 0.15) 0%, rgba(15, 19, 29, 0) 60%);
        }
        .glass-effect {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .glow-border:hover {
          box-shadow: 0 0 20px rgba(68, 216, 241, 0.2);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f131d]/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(223,226,241,0.04)]">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-black text-[#44d8f1] tracking-tighter">
            Entrustory
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a className="font-bold tracking-tight text-sm text-[#44d8f1] border-b-2 border-[#44d8f1] pb-1" href="#platform">Platform</a>
            <a className="font-bold tracking-tight text-sm text-[#dfe2f1]/70 hover:text-[#44d8f1] transition-colors" href="#developers">Developers</a>
            <a className="font-bold tracking-tight text-sm text-[#dfe2f1]/70 hover:text-[#44d8f1] transition-colors" href="#how-it-works">Security</a>
            <a className="font-bold tracking-tight text-sm text-[#dfe2f1]/70 hover:text-[#44d8f1] transition-colors" href="#cta">Pricing</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="font-bold tracking-tight text-sm text-[#dfe2f1]/70 hover:text-[#44d8f1] transition-colors px-4 py-2 hover:bg-[#313540]/50 rounded-lg">
              Sign In
            </Link>
            <Link to="/login" className="bg-gradient-to-br from-[#44d8f1] to-[#00bcd4] text-[#00363e] font-bold tracking-tight text-sm px-6 py-2.5 rounded-lg active:scale-95 duration-200 shadow-lg shadow-[#44d8f1]/10">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 px-8 hero-gradient">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#313540]/50 border border-[#3c494c]/20 mb-8">
                <span className="w-2 h-2 rounded-full bg-[#45fec9] animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#45fec9]">v2.4 Integrity Protocol Live</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#dfe2f1] mb-6">
                Digital Integrity <br />
                <span className="text-[#44d8f1]">Infrastructure</span> <br />
                for the Modern Era
              </h1>
              <p className="text-lg text-[#bbc9cc] max-w-xl mb-10 leading-relaxed">
                A programmable, version-aware platform providing verifiable proof of digital work. Move beyond static timestamps to dynamic lifecycle integrity.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Link to="/login" className="bg-gradient-to-br from-[#44d8f1] to-[#00bcd4] text-[#00363e] font-bold px-8 py-4 rounded-xl flex items-center gap-3 transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(68,216,241,0.3)]">
                  Start Building
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <div className="group relative">
                  <div className="flex items-center gap-3 bg-[#0a0e18] border border-[#3c494c]/30 px-5 py-4 rounded-xl font-mono text-sm text-[#bbc9cc]">
                    <span className="text-[#44d8f1]">$</span>
                    <span>npm install entrustory</span>
                    <span className="material-symbols-outlined text-xs cursor-pointer hover:text-[#44d8f1] transition-colors">content_copy</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative lg:h-[600px] flex items-center justify-center">
              {/* Abstract Merkle Visualization */}
              <div className="relative w-full aspect-square max-w-md bg-gradient-to-tr from-[#44d8f1]/10 to-transparent rounded-full flex items-center justify-center">
                <div className="absolute inset-0 border border-[#44d8f1]/10 rounded-full animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute inset-8 border border-[#45fec9]/10 rounded-full animate-[spin_45s_linear_infinite_reverse]"></div>
                <div className="grid grid-cols-3 gap-8 relative z-10">
                  <div className="w-16 h-16 bg-[#1c1f2a] border border-[#44d8f1]/40 rounded-xl flex items-center justify-center shadow-2xl shadow-[#44d8f1]/20">
                    <span className="material-symbols-outlined text-[#44d8f1]">hub</span>
                  </div>
                  <div className="w-16 h-16 bg-[#1c1f2a] border border-[#3c494c]/40 rounded-xl translate-y-8 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#bbc9cc]">data_object</span>
                  </div>
                  <div className="w-16 h-16 bg-[#1c1f2a] border border-[#45fec9]/40 rounded-xl flex items-center justify-center shadow-2xl shadow-[#45fec9]/20">
                    <span className="material-symbols-outlined text-[#45fec9]">security</span>
                  </div>
                </div>
                {/* Glow effect behind nodes */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-64 h-64 bg-[#44d8f1]/10 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section id="platform" className="py-24 px-8 relative bg-[#171b26]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-sm font-bold tracking-[0.2em] text-[#45fec9] uppercase mb-4">Foundation of Trust</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-[#dfe2f1]">Built for Immutable Confidence</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-[#1c1f2a] p-8 rounded-2xl border border-[#3c494c]/10 hover:border-[#44d8f1]/30 transition-all duration-500 group">
                <div className="w-14 h-14 bg-[#44d8f1]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#44d8f1] text-3xl">lock_open</span>
                </div>
                <h4 className="text-xl font-bold mb-4 text-[#dfe2f1]">Client-Side Hashing</h4>
                <p className="text-[#bbc9cc] text-sm leading-relaxed mb-6">
                  Secure your data at the source. Generate cryptographic fingerprints locally before they ever touch the network.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs text-[#bbc9cc]">
                    <span className="material-symbols-outlined text-[#45fec9] text-lg">check_circle</span>
                    Zero-Knowledge Architecture
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[#bbc9cc]">
                    <span className="material-symbols-outlined text-[#45fec9] text-lg">check_circle</span>
                    Native Browser Support
                  </li>
                </ul>
              </div>
              {/* Card 2 */}
              <div className="bg-[#1c1f2a] p-8 rounded-2xl border border-[#3c494c]/10 hover:border-[#45fec9]/30 transition-all duration-500 group">
                <div className="w-14 h-14 bg-[#45fec9]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#45fec9] text-3xl">account_tree</span>
                </div>
                <h4 className="text-xl font-bold mb-4 text-[#dfe2f1]">Merkle Tree System</h4>
                <p className="text-[#bbc9cc] text-sm leading-relaxed mb-6">
                  Aggregate millions of hashes into a single root for efficient, low-cost verification at enterprise scale.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs text-[#bbc9cc]">
                    <span className="material-symbols-outlined text-[#45fec9] text-lg">check_circle</span>
                    Linear Scalability
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[#bbc9cc]">
                    <span className="material-symbols-outlined text-[#45fec9] text-lg">check_circle</span>
                    Fraud Proof Verification
                  </li>
                </ul>
              </div>
              {/* Card 3 */}
              <div className="bg-[#1c1f2a] p-8 rounded-2xl border border-[#3c494c]/10 hover:border-[#44d8f1]/30 transition-all duration-500 group">
                <div className="w-14 h-14 bg-[#44d8f1]/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-[#44d8f1] text-3xl">layers</span>
                </div>
                <h4 className="text-xl font-bold mb-4 text-[#dfe2f1]">Multi-Layer Proof</h4>
                <p className="text-[#bbc9cc] text-sm leading-relaxed mb-6">
                  Independent verification layers across distributed ledgers ensure your integrity outlasts any single provider.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs text-[#bbc9cc]">
                    <span className="material-symbols-outlined text-[#45fec9] text-lg">check_circle</span>
                    Multi-Chain Anchoring
                  </li>
                  <li className="flex items-center gap-2 text-xs text-[#bbc9cc]">
                    <span className="material-symbols-outlined text-[#45fec9] text-lg">check_circle</span>
                    Timestamped Durability
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24 px-8 relative overflow-hidden bg-[#0f131d]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-20">The Lifecycle of Integrity</h2>
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-12">
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#3c494c] to-transparent -z-0"></div>
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center max-w-[200px]">
                <div className="w-20 h-20 rounded-full bg-[#1c1f2a] flex items-center justify-center border-4 border-[#0f131d] relative z-10 shadow-xl">
                  <span className="material-symbols-outlined text-[#44d8f1] text-3xl">fingerprint</span>
                </div>
                <h4 className="mt-6 font-bold text-[#dfe2f1]">1. Hash</h4>
                <p className="text-xs text-[#bbc9cc] mt-2">Generate a unique SHA-256 fingerprint of your data locally.</p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center max-w-[200px]">
                <div className="w-20 h-20 rounded-full bg-[#1c1f2a] flex items-center justify-center border-4 border-[#0f131d] relative z-10 shadow-xl">
                  <span className="material-symbols-outlined text-[#45fec9] text-3xl">signature</span>
                </div>
                <h4 className="mt-6 font-bold text-[#dfe2f1]">2. Sign</h4>
                <p className="text-xs text-[#bbc9cc] mt-2">Bundle and anchor the hash to our high-performance infrastructure.</p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center max-w-[200px]">
                <div className="w-20 h-20 rounded-full bg-[#1c1f2a] flex items-center justify-center border-4 border-[#0f131d] relative z-10 shadow-xl">
                  <span className="material-symbols-outlined text-[#44d8f1] text-3xl">verified</span>
                </div>
                <h4 className="mt-6 font-bold text-[#dfe2f1]">3. Verify</h4>
                <p className="text-xs text-[#bbc9cc] mt-2">Provide cryptographically verifiable proof of existence and state.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Workflows */}
        <section id="developers" className="py-24 px-8 bg-[#0a0e18]">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-sm font-bold tracking-[0.2em] text-[#44d8f1] uppercase mb-4">Built for Builders</h2>
                <h3 className="text-4xl font-bold text-[#dfe2f1] mb-8 leading-tight">Integration in minutes,<br />Security forever</h3>
                <div className="space-y-8">
                  <div className="flex gap-6">
                    <div className="w-12 h-12 shrink-0 bg-[#1c1f2a] rounded-lg flex items-center justify-center border border-[#3c494c]/20">
                      <span className="material-symbols-outlined text-[#44d8f1]">webhook</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-[#dfe2f1] mb-1">Real-time Webhooks</h5>
                      <p className="text-sm text-[#bbc9cc]">Get notified the instant a proof is anchored to the global ledger.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 shrink-0 bg-[#1c1f2a] rounded-lg flex items-center justify-center border border-[#3c494c]/20">
                      <span className="material-symbols-outlined text-[#44d8f1]">key</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-[#dfe2f1] mb-1">Granular API Scopes</h5>
                      <p className="text-sm text-[#bbc9cc]">Control access with fine-grained permissions for specific environments.</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="w-12 h-12 shrink-0 bg-[#1c1f2a] rounded-lg flex items-center justify-center border border-[#3c494c]/20">
                      <span className="material-symbols-outlined text-[#44d8f1]">code</span>
                    </div>
                    <div>
                      <h5 className="font-bold text-[#dfe2f1] mb-1">SDK &amp; CLI Support</h5>
                      <p className="text-sm text-[#bbc9cc]">Native libraries for Node, Go, Python, and a powerful command line tool.</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Code Block */}
              <div className="relative">
                <div className="absolute -inset-4 bg-[#44d8f1]/5 blur-3xl rounded-full"></div>
                <div className="relative bg-[#1c1f2a] rounded-2xl overflow-hidden border border-[#3c494c]/20 shadow-2xl">
                  <div className="flex items-center justify-between px-6 py-4 bg-[#0a0e18] border-b border-[#3c494c]/10">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/30"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/30"></div>
                    </div>
                    <span className="text-[10px] text-[#bbc9cc]/50 font-mono">verify_asset.js</span>
                  </div>
                  <div className="p-8 font-mono text-sm leading-relaxed">
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">01</span>
                      <span><span className="text-[#00bcd4]">import</span> <span className="text-[#dfe2f1]">{'{ Entrust }'}</span> <span className="text-[#00bcd4]">from</span> <span className="text-[#45fec9]">'entrustory'</span>;</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">02</span>
                      <span>&nbsp;</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">03</span>
                      <span className="text-[#bbc9cc]/50">// Initialize with scoped key</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">04</span>
                      <span><span className="text-[#00bcd4]">const</span> <span className="text-[#dfe2f1]">client = </span><span className="text-[#00bcd4]">new</span> <span className="text-[#dfe2f1]">Entrust(process.env.KEY);</span></span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">05</span>
                      <span>&nbsp;</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">06</span>
                      <span><span className="text-[#00bcd4]">async function</span> <span className="text-[#dfe2f1]">protect() {'{'}</span></span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">07</span>
                      <span className="text-[#dfe2f1]">  <span className="text-[#00bcd4]">const</span> proof = <span className="text-[#00bcd4]">await</span> client.anchor({'{'}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">08</span>
                      <span className="text-[#dfe2f1]">    assetId: <span className="text-[#45fec9]">'doc_0842'</span>,</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">09</span>
                      <span className="text-[#dfe2f1]">    hash: <span className="text-[#45fec9]">'sha256:7f83b...'</span></span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">10</span>
                      <span className="text-[#dfe2f1]">  {'}'});</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">11</span>
                      <span className="text-[#dfe2f1]">  console.log(proof.root);</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-[#bbc9cc]/30 select-none">12</span>
                      <span className="text-[#dfe2f1]">{'}'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section id="cta" className="py-32 px-8 text-center bg-gradient-to-b from-[#0f131d] to-[#0f131d]">
          <div className="max-w-4xl mx-auto glass-effect bg-[#1c1f2a]/30 p-16 rounded-[2rem] border border-[#3c494c]/10">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Ready to anchor your data?</h2>
            <p className="text-[#bbc9cc] text-lg mb-10 max-w-2xl mx-auto">
              Join the thousands of developers building verifiable applications with Entrustory's digital integrity infrastructure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="bg-[#44d8f1] text-[#00363e] font-bold px-10 py-4 rounded-xl hover:shadow-[0_0_20px_rgba(68,216,241,0.4)] transition-all">
                Get API Key
              </Link>
              <a href="#developers" className="bg-[#313540] text-[#dfe2f1] font-bold px-10 py-4 rounded-xl border border-[#3c494c] hover:bg-[#353944] transition-all">
                Read Documentation
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0a0e18] w-full py-12 border-t border-[#3c494c]/15">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 max-w-7xl mx-auto mb-12">
          <div>
            <div className="text-lg font-bold text-[#44d8f1] mb-6">Entrustory</div>
            <p className="text-[#dfe2f1]/50 text-xs leading-relaxed">
              The backbone for digital asset verification and lifecycle integrity at a global scale.
            </p>
          </div>
          <div>
            <h6 className="text-[#dfe2f1] font-bold text-sm mb-6 uppercase tracking-widest">Company</h6>
            <ul className="space-y-3">
              <li><a className="text-[#dfe2f1]/50 text-xs hover:text-[#44d8f1] transition-colors hover:translate-x-1 inline-block duration-300" href="#">About</a></li>
              <li><a className="text-[#dfe2f1]/50 text-xs hover:text-[#44d8f1] transition-colors hover:translate-x-1 inline-block duration-300" href="#">Blog</a></li>
              <li><a className="text-[#dfe2f1]/50 text-xs hover:text-[#44d8f1] transition-colors hover:translate-x-1 inline-block duration-300" href="#">Careers</a></li>
            </ul>
          </div>
          <div>
            <h6 className="text-[#dfe2f1] font-bold text-sm mb-6 uppercase tracking-widest">Product</h6>
            <ul className="space-y-3">
              <li><Link className="text-[#dfe2f1]/50 text-xs hover:text-[#44d8f1] transition-colors hover:translate-x-1 inline-block duration-300" to="/verify">Verify</Link></li>
              <li><Link className="text-[#dfe2f1]/50 text-xs hover:text-[#44d8f1] transition-colors hover:translate-x-1 inline-block duration-300" to="/status">Status</Link></li>
              <li><a className="text-[#dfe2f1]/50 text-xs hover:text-[#44d8f1] transition-colors hover:translate-x-1 inline-block duration-300" href="#">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h6 className="text-[#dfe2f1] font-bold text-sm mb-6 uppercase tracking-widest">Legal</h6>
            <ul className="space-y-3">
              <li><a className="text-[#dfe2f1]/50 text-xs hover:text-[#44d8f1] transition-colors hover:translate-x-1 inline-block duration-300" href="#">Privacy</a></li>
              <li><a className="text-[#dfe2f1]/50 text-xs hover:text-[#44d8f1] transition-colors hover:translate-x-1 inline-block duration-300" href="#">Terms</a></li>
              <li><a className="text-[#dfe2f1]/50 text-xs hover:text-[#44d8f1] transition-colors hover:translate-x-1 inline-block duration-300" href="#">GDPR</a></li>
            </ul>
          </div>
        </div>
        <div className="px-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#3c494c]/10 gap-4">
          <div className="text-xs text-[#dfe2f1]/50">
            © 2024 Entrustory. Digital Integrity Infrastructure.
          </div>
          <div className="flex gap-6">
            <a className="text-[#dfe2f1]/50 hover:text-[#44d8f1] transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">public</span>
            </a>
            <a className="text-[#dfe2f1]/50 hover:text-[#44d8f1] transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">hub</span>
            </a>
            <a className="text-[#dfe2f1]/50 hover:text-[#44d8f1] transition-colors" href="#">
              <span className="material-symbols-outlined text-sm">chat</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
