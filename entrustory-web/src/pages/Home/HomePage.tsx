import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../utils/supabase';

/* ── tiny scroll-reveal hook ───────────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── animated counter ──────────────────────────────────────── */
function Counter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(id); }
      else setCount(start);
    }, 16);
    return () => clearInterval(id);
  }, [visible, end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── particle canvas for hero ──────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    let w = 0, h = 0;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];

    function resize() {
      w = canvas!.width = canvas!.offsetWidth * devicePixelRatio;
      h = canvas!.height = canvas!.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    function init() {
      resize();
      const count = Math.min(120, Math.floor((w * h) / 12000));
      particles.length = 0;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * (w / devicePixelRatio),
          y: Math.random() * (h / devicePixelRatio),
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.5 + 0.5,
          o: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function draw() {
      const cw = w / devicePixelRatio;
      const ch = h / devicePixelRatio;
      ctx.clearRect(0, 0, cw, ch);

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(255,177,72,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > cw) p.vx *= -1;
        if (p.y < 0 || p.y > ch) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(198,198,199,${p.o})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', init);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', init); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* ── live stats hook ───────────────────────────────────────── */
function useLiveStats() {
  const [hashCount, setHashCount] = useState(0);
  const [recentHashes, setRecentHashes] = useState<string[]>([]);
  useEffect(() => {
    async function fetch() {
      try {
        const { count } = await supabase.from('evidence_hashes').select('*', { count: 'exact', head: true });
        if (count !== null) setHashCount(count);

        const { data } = await supabase.from('evidence_hashes').select('sha256_hash').order('created_at', { ascending: false }).limit(20);
        if (data && data.length > 0) {
          setRecentHashes(data.map((d: { sha256_hash: string }) => d.sha256_hash));
        }
      } catch { /* silent — fallback to 0 / empty */ }
    }
    fetch();
  }, []);
  return { hashCount, recentHashes };
}

/* ── live hash ticker ──────────────────────────────────────── */
function HashTicker({ seedHashes }: { seedHashes: string[] }) {
  const [hashes, setHashes] = useState<string[]>([]);
  const poolRef = useRef<string[]>([]);
  useEffect(() => {
    poolRef.current = seedHashes;
  }, [seedHashes]);

  useEffect(() => {
    function next() {
      const pool = poolRef.current;
      if (pool.length > 0) return pool[Math.floor(Math.random() * pool.length)];
      return Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
    }
    setHashes([next(), next(), next()]);
    const id = setInterval(() => {
      setHashes(prev => [next(), ...prev].slice(0, 5));
    }, 2800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="font-mono text-[10px] leading-relaxed space-y-1 text-outline overflow-hidden">
      {hashes.map((h, i) => (
        <div key={h + i} className="animate-fade-in-down flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary inline-block shrink-0 animate-pulse" />
          <span className="truncate opacity-60">{h}</span>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
export const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { hashCount, recentHashes } = useLiveStats();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // reveal refs
  const r1 = useReveal();
  const r2 = useReveal();
  const r3 = useReveal();
  const r4 = useReveal();
  const r5 = useReveal();
  const r6 = useReveal();

  return (
    <div className="bg-surface min-h-screen text-on-surface font-body relative overflow-x-hidden selection:bg-tertiary/30 selection:text-tertiary">

      {/* ─── NAV ───────────────────────────────────────────── */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/90 backdrop-blur-2xl shadow-2xl shadow-black/40 py-3' : 'bg-transparent py-5'}`}>
        <nav className="flex justify-between items-center max-w-[1440px] mx-auto px-6 md:px-12">
          <Link to="/" className="text-2xl font-headline font-bold tracking-tighter text-white hover:text-tertiary transition-colors duration-300">
            Entrustory
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#platform" className="nav-link">Platform</a>
            <a href="#architecture" className="nav-link">Architecture</a>
            <a href="#developers" className="nav-link">Developers</a>
            <Link to="/docs" className="nav-link">Docs</Link>
            <Link to="/status" className="nav-link">Status</Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/login" className="bg-white text-black font-headline font-bold text-sm px-6 py-2.5 rounded hover:bg-tertiary hover:text-black transition-all duration-300 active:scale-95">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-white">
            <span className="material-symbols-outlined text-2xl">{mobileMenu ? 'close' : 'menu'}</span>
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-black/95 backdrop-blur-2xl border-t border-outline-variant/20 px-6 py-6 space-y-4 animate-fade-in-down">
            <a href="#platform" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-300 hover:text-white">Platform</a>
            <a href="#architecture" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-300 hover:text-white">Architecture</a>
            <a href="#developers" onClick={() => setMobileMenu(false)} className="block text-sm text-zinc-300 hover:text-white">Developers</a>
            <Link to="/docs" className="block text-sm text-zinc-300 hover:text-white">Docs</Link>
            <Link to="/status" className="block text-sm text-zinc-300 hover:text-white">Status</Link>
            <div className="pt-4 border-t border-outline-variant/20 flex flex-col gap-3">
              <Link to="/login" className="text-sm text-zinc-300 hover:text-white">Sign In</Link>
              <Link to="/login" className="bg-white text-black font-bold text-sm px-6 py-2.5 rounded text-center">Get Started</Link>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* ─── HERO: full-bleed immersive ──────────────────── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Particle network background */}
          <ParticleCanvas />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-surface z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent z-[1]" />

          {/* Grid overlay for techno feel */}
          <div className="absolute inset-0 z-[1] opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />

          {/* Hero content */}
          <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
            {/* Status badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-outline-variant/20 backdrop-blur-sm mb-10 animate-fade-in-down">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-tertiary">Integrity Protocol Active</span>
            </div>

            <h1 className="font-headline font-bold tracking-tighter text-white mb-8 leading-[0.95] animate-hero-title"
                style={{ fontSize: 'clamp(2.8rem, 8vw, 7rem)' }}>
              Digital Integrity,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-tertiary">Engineered.</span>
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up animation-delay-300">
              Programmable, zero-knowledge infrastructure for tamper-evident proof of every digital asset,
              anchored to cryptographic truth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-500">
              <Link to="/login" className="group bg-white text-black font-headline font-bold px-10 py-4 rounded hover:shadow-[0_0_40px_rgba(255,177,72,0.3)] transition-all duration-500 active:scale-95 flex items-center gap-3 justify-center">
                Start Building
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <a href="#architecture" className="border border-outline-variant/40 text-zinc-300 font-headline font-bold px-10 py-4 rounded hover:bg-white/5 hover:border-outline-variant transition-all duration-500 flex items-center gap-3 justify-center">
                Explore Architecture
                <span className="material-symbols-outlined text-lg">expand_more</span>
              </a>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce-slow">
            <span className="material-symbols-outlined text-zinc-500 text-3xl">keyboard_arrow_down</span>
          </div>
        </section>

        {/* ─── TRUST METRICS ──────────────────────────────── */}
        <section className="py-20 border-t border-b border-outline-variant/10 bg-surface-container-lowest">
          <div ref={r1.ref} className={`max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-1000 ${r1.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-headline font-bold text-white mb-2">
                <Counter end={hashCount} suffix="+" />
              </div>
              <div className="text-xs uppercase tracking-[0.15em] text-outline font-label">Hashes Anchored</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-headline font-bold text-white mb-2">
                <Counter end={99} suffix=".99%" duration={1500} />
              </div>
              <div className="text-xs uppercase tracking-[0.15em] text-outline font-label">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-headline font-bold text-tertiary mb-2">
                <Counter end={0} suffix=" breaches" duration={500} />
              </div>
              <div className="text-xs uppercase tracking-[0.15em] text-outline font-label">Since Genesis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-headline font-bold text-white mb-2">
                {'<'}<Counter end={50} suffix="ms" duration={1000} />
              </div>
              <div className="text-xs uppercase tracking-[0.15em] text-outline font-label">Proof Latency</div>
            </div>
          </div>
        </section>

        {/* ─── PLATFORM FEATURES ──────────────────────────── */}
        <section id="platform" className="py-32 px-6 md:px-12">
          <div ref={r2.ref} className={`max-w-[1440px] mx-auto transition-all duration-1000 ${r2.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="text-center mb-20">
              <span className="text-tertiary text-xs font-bold uppercase tracking-[0.2em] font-label">Capabilities</span>
              <h2 className="font-headline text-4xl md:text-6xl font-bold text-white mt-4 tracking-tighter">Four Layers of Trust</h2>
              <p className="text-outline mt-4 max-w-lg mx-auto">An unbroken chain from the browser to the blockchain.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-1">
              {[
                { icon: 'fingerprint', label: 'LAYER 01', title: 'Client Hashing', desc: 'SHA-256 computed entirely in-browser. Your raw data never leaves your device.', color: 'text-white' },
                { icon: 'account_tree', label: 'LAYER 02', title: 'Merkle Trees', desc: 'Deterministic, lexicographically sorted trees with O(log n) inclusion proofs.', color: 'text-primary' },
                { icon: 'verified_user', label: 'LAYER 03', title: 'Ed25519 Signing', desc: 'The Merkle Root is signed via asymmetric cryptography with precise UTC timestamps.', color: 'text-tertiary' },
                { icon: 'link', label: 'LAYER 04', title: 'Blockchain Anchor', desc: 'Super Roots are committed to a public chain for permanent, decentralized trust.', color: 'text-white' },
              ].map((item, i) => (
                <div key={i} className="group bg-surface-container-low hover:bg-surface-container-high p-10 transition-all duration-500 border border-transparent hover:border-outline-variant/20 relative overflow-hidden cursor-default"
                     style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-tertiary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <span className={`material-symbols-outlined text-4xl ${item.color} mb-6 block group-hover:scale-110 transition-transform duration-500`}>{item.icon}</span>
                  <div className="text-tertiary text-[10px] font-bold tracking-[0.2em] font-label mb-3">{item.label}</div>
                  <h3 className="font-headline text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── ARCHITECTURE (immersive split) ──────────────── */}
        <section id="architecture" className="py-32 px-6 md:px-12 bg-surface-container-lowest relative overflow-hidden">
          {/* Subtle animated grid background */}
          <div className="absolute inset-0 blueprint-grid opacity-[0.04]" />

          <div ref={r3.ref} className={`max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10 transition-all duration-1000 ${r3.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div>
              <span className="text-tertiary text-xs font-bold uppercase tracking-[0.2em] font-label">Architecture</span>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mt-4 mb-8 tracking-tighter">The Architecture<br />of Certainty</h2>

              <div className="space-y-10">
                {[
                  { num: '01', title: 'Zero-Knowledge Proofs', desc: 'Validate integrity without exposing underlying data. Privacy by design, verified by mathematics.' },
                  { num: '02', title: 'Merkle Tree Engine', desc: 'Recursive hashing ensuring every record is tethered to the genesis block of your ledger.' },
                  { num: '03', title: 'Immutable Audit Trail', desc: 'Append-only logs with PL/pgSQL triggers that block any UPDATE or DELETE on cryptographic records.' },
                ].map((item, i) => (
                  <div key={i} className="group flex gap-6 cursor-default">
                    <div className="shrink-0 w-12 h-12 border border-outline-variant/30 flex items-center justify-center font-headline font-bold text-sm text-tertiary group-hover:bg-tertiary/10 group-hover:border-tertiary/40 transition-all duration-500">
                      {item.num}
                    </div>
                    <div>
                      <h3 className="font-headline text-xl font-bold text-white mb-2 group-hover:text-tertiary transition-colors duration-300">{item.title}</h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed max-w-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live hash feed + diagram */}
            <div className="relative">
              <div className="bg-surface-container border border-outline-variant/20 p-8 relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-tertiary font-bold">Live Integrity Feed</span>
                  </div>
                  <span className="text-[10px] font-mono text-outline-variant">v4.02</span>
                </div>

                {/* Merkle visualization */}
                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="w-14 h-14 border border-tertiary/60 flex items-center justify-center animate-pulse-slow">
                    <span className="material-symbols-outlined text-tertiary">hub</span>
                  </div>
                  <div className="w-px h-8 bg-outline-variant/40" />
                  <div className="flex gap-16">
                    {['lock', 'shield'].map((icon, i) => (
                      <div key={i} className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border border-outline-variant/40 flex items-center justify-center hover:border-primary/60 transition-colors duration-500">
                          <span className="material-symbols-outlined text-on-surface-variant text-sm">{icon}</span>
                        </div>
                        <div className="w-px h-5 bg-outline-variant/30" />
                        <div className="flex gap-4">
                          <div className="w-5 h-5 border border-outline-variant/20 hover:border-tertiary/40 transition-colors" />
                          <div className="w-5 h-5 border border-outline-variant/20 hover:border-tertiary/40 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live hash feed */}
                <div className="border-t border-outline-variant/15 pt-6">
                  <div className="text-[10px] font-mono text-outline-variant uppercase tracking-widest mb-3">Recent Anchors</div>
                  <HashTicker seedHashes={recentHashes} />
                </div>

                {/* Status badge */}
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-[10px] font-mono text-outline-variant">
                    X: 44.029 · Y: 12.883 · Z: 99.110
                  </div>
                  <div className="px-3 py-1 bg-tertiary/10 border border-tertiary/30 inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                    <span className="text-[10px] text-tertiary font-bold tracking-wider">AUTHENTICATED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── DEVELOPER SECTION ─────────────────────────── */}
        <section id="developers" className="py-32 px-6 md:px-12">
          <div ref={r4.ref} className={`max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${r4.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div>
              <span className="text-tertiary text-xs font-bold uppercase tracking-[0.2em] font-label">For Developers</span>
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-white mt-4 mb-8 tracking-tighter">
                Integration in minutes.<br />Security forever.
              </h2>
              <div className="space-y-8">
                {[
                  { icon: 'terminal', title: 'CLI & SDK', desc: 'Anchor any file from terminal or integrate via our Node.js SDK.' },
                  { icon: 'webhook', title: 'Real-time Webhooks', desc: 'Get notified instantly when a proof is anchored to the ledger.' },
                  { icon: 'key', title: 'API Key Scopes', desc: 'Fine-grained permissions for workspace-level access control.' },
                  { icon: 'deployed_code', title: 'GitHub Action', desc: 'Automatically anchor every build artifact in your CI/CD pipeline.' },
                ].map((item, i) => (
                  <div key={i} className="group flex gap-5 cursor-default">
                    <div className="shrink-0 w-11 h-11 bg-surface-container-low border border-outline-variant/15 flex items-center justify-center group-hover:border-tertiary/30 transition-all duration-500">
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-tertiary transition-colors">{item.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-on-surface-variant">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code block */}
            <div className="relative">
              <div className="absolute -inset-4 bg-tertiary/5 blur-3xl rounded-full" />
              <div className="relative bg-surface-container-lowest border border-outline-variant/20 overflow-hidden shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between px-5 py-3 bg-surface-container border-b border-outline-variant/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  </div>
                  <span className="text-[10px] font-mono text-outline-variant">anchor.js</span>
                </div>
                <pre className="p-6 font-mono text-sm leading-7 overflow-x-auto">
<code><span className="text-tertiary">import</span> {'{ Entrust }'} <span className="text-tertiary">from</span> <span className="text-green-400">'entrustory'</span>;{'\n'}
{'\n'}
<span className="text-outline-variant">// Initialize with scoped key</span>{'\n'}
<span className="text-tertiary">const</span> client = <span className="text-tertiary">new</span> Entrust(process.env.KEY);{'\n'}
{'\n'}
<span className="text-tertiary">async function</span> <span className="text-white">protect</span>() {'{'}{'\n'}
  <span className="text-tertiary">const</span> proof = <span className="text-tertiary">await</span> client.anchor({'{'}{'\n'}
    assetId: <span className="text-green-400">'doc_0842'</span>,{'\n'}
    hash:    <span className="text-green-400">'sha256:7f83b...'</span>{'\n'}
  {'}'});{'\n'}
{'\n'}
  console.log(proof.root);{'\n'}
  <span className="text-outline-variant">// → "0xae4f...c912"</span>{'\n'}
{'}'}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ─── BENTO SHOWCASE ─────────────────────────────── */}
        <section className="py-24 px-6 md:px-12">
          <div ref={r5.ref} className={`max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-1 transition-all duration-1000 ${r5.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

            <div className="md:col-span-2 bg-surface-container-high hover:bg-surface-container-highest p-12 min-h-[320px] flex flex-col justify-between transition-all duration-700 group cursor-default">
              <h4 className="font-headline text-3xl font-bold text-white max-w-xs group-hover:text-tertiary transition-colors duration-500">Encrypted Vault Storage</h4>
              <div className="flex justify-between items-end">
                <p className="text-on-surface-variant text-sm max-w-[240px]">AES-256-GCM encrypted client-side before upload. We never see your files.</p>
                <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform duration-500">enhanced_encryption</span>
              </div>
            </div>

            <div className="bg-surface-container-low hover:bg-surface-container p-12 min-h-[320px] flex flex-col justify-between transition-all duration-700 group cursor-default">
              <h4 className="font-headline text-3xl font-bold text-white group-hover:text-tertiary transition-colors duration-500">PDF Certificates</h4>
              <div className="flex flex-col gap-4">
                <div className="h-1 w-full bg-outline-variant/20 overflow-hidden">
                  <div className="h-full w-0 group-hover:w-full bg-gradient-to-r from-tertiary to-primary transition-all duration-1000 ease-out" />
                </div>
                <p className="text-on-surface-variant text-sm">Legal-grade evidence exports with hashes, Merkle paths, and QR codes.</p>
              </div>
            </div>

            <div className="bg-surface-container-low hover:bg-surface-container p-12 min-h-[320px] flex flex-col justify-between transition-all duration-700 group cursor-default">
              <span className="material-symbols-outlined text-tertiary text-4xl group-hover:rotate-12 transition-transform duration-500">monitoring</span>
              <h4 className="font-headline text-3xl font-bold text-white group-hover:text-tertiary transition-colors duration-500">Live Status</h4>
              <p className="text-on-surface-variant text-sm">Real-time latency checks and 90-day uptime chart at <Link to="/status" className="text-tertiary hover:underline">/status</Link>.</p>
            </div>

            <div className="md:col-span-2 bg-surface-container-highest hover:bg-surface-bright p-12 min-h-[320px] relative overflow-hidden flex flex-col justify-center transition-all duration-700 group cursor-default">
              <div className="relative z-10">
                <h4 className="font-headline text-4xl md:text-5xl font-bold text-white mb-4 group-hover:text-tertiary transition-colors duration-500">Public Verification</h4>
                <p className="text-on-surface-variant max-w-sm mb-8">Anyone can verify a file at <Link to="/verify" className="text-tertiary hover:underline">/verify</Link> — no account needed.</p>
                <Link to="/verify" className="inline-flex items-center gap-2 bg-white text-black font-headline font-bold px-8 py-3 rounded hover:shadow-[0_0_30px_rgba(255,177,72,0.2)] transition-all duration-500 active:scale-95">
                  Try Verification
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ────────────────────────────────────────── */}
        <section className="py-40 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface-container-lowest to-surface" />
          <div ref={r6.ref} className={`relative z-10 max-w-3xl mx-auto text-center transition-all duration-1000 ${r6.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <h2 className="font-headline text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
              Future-proof your<br />digital legacy.
            </h2>
            <p className="text-on-surface-variant text-lg mb-12 leading-relaxed max-w-xl mx-auto">
              Join the network securing their digital future with cryptographic permanence. Engineered for enterprises that demand integrity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="group bg-white text-black font-headline font-bold px-12 py-5 rounded hover:shadow-[0_0_60px_rgba(255,177,72,0.25)] transition-all duration-500 active:scale-95 flex items-center gap-3 justify-center">
                Request Access
                <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
              <Link to="/docs" className="border border-outline-variant/40 text-zinc-300 font-headline font-bold px-12 py-5 rounded hover:bg-white/5 hover:border-outline-variant transition-all duration-500 flex items-center gap-3 justify-center">
                View Documentation
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-black w-full py-20 px-6 md:px-12 border-t border-outline-variant/10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 max-w-[1440px] mx-auto">
          <div className="col-span-2">
            <Link to="/" className="text-xl font-headline font-bold text-white mb-6 block hover:text-tertiary transition-colors">Entrustory</Link>
            <p className="text-[11px] uppercase tracking-[0.05em] text-zinc-500 max-w-[220px] leading-relaxed">
              Programmable, Zero-Knowledge Digital Integrity Infrastructure.
              <br /><br />© {new Date().getFullYear()} Entrustory. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.1em] text-white font-bold mb-2 font-label">Platform</span>
            <a href="#platform" className="footer-link">Features</a>
            <a href="#architecture" className="footer-link">Architecture</a>
            <Link to="/verify" className="footer-link">Verify</Link>
            <Link to="/status" className="footer-link">Status</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.1em] text-white font-bold mb-2 font-label">Developers</span>
            <a href="#developers" className="footer-link">SDK</a>
            <Link to="/docs" className="footer-link">Documentation</Link>
            <a href="https://github.com/AmanJ24/entrustory" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.1em] text-white font-bold mb-2 font-label">Legal</span>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Security</a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-[11px] uppercase tracking-[0.1em] text-white font-bold mb-2 font-label">Connect</span>
            <a href="https://github.com/AmanJ24/entrustory" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-link">Twitter / X</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
