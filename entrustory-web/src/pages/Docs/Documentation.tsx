import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, Search, Rocket, Fingerprint, Terminal, 
  ChevronRight, CheckCircle, ThumbsUp, ThumbsDown, ArrowRight,
  Hash, Link2, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

// --- MASSIVE DYNAMIC CONTENT DICTIONARY ---
const DOC_DATA: Record<string, Record<string, any>> = {
  'getting-started': {
    title: 'Getting Started with Entrustory',
    subtitle: 'Initialize your cryptographic vault, generate API keys, and anchor your first asset in under 5 minutes.',
    tabs: ['overview', 'quickstart'],
    toc: ['Introduction', 'Prerequisites', 'Authentication', 'First Anchor'],
    content: {
      overview: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Introduction</h2>
          <p className="text-on-surface leading-relaxed">Entrustory is a zero-knowledge integrity network. Unlike traditional cloud storage, Entrustory relies on client-side hashing and cryptographic signatures to guarantee data immutability without exposing raw files to the server.</p>
          <div className="p-5 bg-tertiary/10 border border-tertiary/20 rounded-xl">
            <h3 className="text-tertiary font-bold mb-2 flex items-center gap-2"><Rocket size={18} /> The Entrustory Lifecycle</h3>
            <ol className="list-decimal pl-5 space-y-2 text-on-surface text-sm">
              <li><strong>Hash:</strong> Your client computes a SHA-256 hash locally.</li>
              <li><strong>Group:</strong> Hashes are grouped into deterministic Merkle Trees.</li>
              <li><strong>Sign:</strong> The server signs the Merkle Root using Ed25519.</li>
              <li><strong>Anchor:</strong> The root is batched and anchored to Layer 4 (Blockchain).</li>
            </ol>
          </div>
        </div>
      ),
      quickstart: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Installation</h2>
          <p className="text-on-surface">Install the official Node.js SDK via npm or yarn:</p>
          <div className="bg-[#0c1017] border border-surface-variant rounded-xl p-4 font-mono text-sm text-tertiary">npm install @entrustory/sdk</div>
          <h2 className="text-2xl font-bold text-white mt-8">Your First Request</h2>
          <p className="text-on-surface">Use your API key from the Dashboard to anchor an asset:</p>
          <div className="bg-[#0c1017] border border-surface-variant rounded-xl p-6 font-mono text-sm leading-relaxed text-on-surface">
            <span className="text-pink-400">import</span> {'{ Entrustory }'} <span className="text-pink-400">from</span> <span className="text-green-400">'@entrustory/sdk'</span>;<br/><br/>
            <span className="text-pink-400">const</span> client = <span className="text-pink-400">new</span> <span className="text-yellow-300">Entrustory</span>({'{'} apiKey: <span className="text-green-400">'pk_live_...'</span> {'}'});<br/>
            <span className="text-pink-400">await</span> client.proofs.<span className="text-blue-400">create</span>({'{'} hash: <span className="text-green-400">'e3b0c442...'</span> {'}'});
          </div>
        </div>
      )
    }
  },
  'merkle': {
    title: 'Merkle Tree Implementation',
    subtitle: 'Learn how Entrustory utilizes Merkle Trees for verifiable data integrity and efficient inclusion proofs in the audit ledger.',
    tabs: ['overview', 'structure', 'verification'],
    toc: ['Introduction', 'Generating a Proof', 'Lexicographical Sorting', 'Performance'],
    content: {
      overview: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Introduction</h2>
          <p className="text-on-surface leading-relaxed">A Merkle tree is a fundamental structure in cryptography. We use deterministic binary Merkle trees to summarize millions of transactions into a single root hash.</p>
          <div className="relative w-full bg-surface-container-low rounded-xl overflow-hidden border border-surface-variant flex flex-col items-center justify-center p-10 shadow-lg mt-6">
            <div className="flex flex-col items-center gap-10 w-full max-w-lg">
              <div className="w-40 py-3 bg-tertiary/10 border border-tertiary/30 text-tertiary text-center rounded-lg text-sm font-bold shadow-[0_0_20px_rgba(6,182,212,0.15)] z-10 relative">
                Root Hash
                <div className="absolute top-full left-1/2 w-px h-10 bg-slate-700"></div>
                <div className="absolute top-[calc(100%+40px)] left-1/4 right-1/4 h-px bg-slate-700"></div>
              </div>
              <div className="flex justify-between w-full relative z-10">
                <div className="w-28 py-2 bg-surface-variant border border-outline text-on-surface text-center rounded text-xs relative">
                  Hash 0-1
                  <div className="absolute top-full left-1/2 w-px h-10 bg-slate-700"></div>
                  <div className="absolute top-[calc(100%+40px)] -left-4 -right-4 h-px bg-slate-700"></div>
                </div>
                <div className="w-28 py-2 bg-surface-variant border border-outline text-on-surface text-center rounded text-xs relative">
                  Hash 2-3
                  <div className="absolute top-full left-1/2 w-px h-10 bg-slate-700"></div>
                  <div className="absolute top-[calc(100%+40px)] -left-4 -right-4 h-px bg-slate-700"></div>
                </div>
              </div>
              <div className="flex justify-between w-full relative z-10">
                <div className="w-20 py-1.5 bg-slate-900 border border-outline-variant text-on-surface-variant text-center rounded text-[10px]">Leaf A</div>
                <div className="w-20 py-1.5 bg-slate-900 border border-outline-variant text-on-surface-variant text-center rounded text-[10px]">Leaf B</div>
                <div className="w-20 py-1.5 bg-slate-900 border border-outline-variant text-on-surface-variant text-center rounded text-[10px]">Leaf C</div>
                <div className="w-20 py-1.5 bg-slate-900 border border-outline-variant text-on-surface-variant text-center rounded text-[10px]">Leaf D</div>
              </div>
            </div>
          </div>
        </div>
      ),
      structure: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Lexicographical Sorting</h2>
          <p className="text-on-surface leading-relaxed">To ensure that identical data sets always produce the exact same Merkle Root, Entrustory strictly enforces Lexicographical (alphabetical) sorting of all leaf hashes before tree construction.</p>
          <div className="bg-surface-container-low p-5 rounded-xl border border-surface-variant space-y-3">
            <h3 className="font-bold text-white flex items-center gap-2"><ArrowRight size={16} className="text-emerald-400"/> Sorting Algorithm</h3>
            <p className="text-sm text-on-surface-variant">1. Receive array of SHA-256 strings.<br/>2. Apply standard UTF-8 string sort.<br/>3. Pair hashes iteratively.<br/>4. If an odd number of leaves exists, duplicate the final leaf to balance the binary tree.</p>
          </div>
        </div>
      ),
      verification: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Client-Side Verification</h2>
          <p className="text-on-surface leading-relaxed">You can mathematically verify inclusion using our SDK without querying the server.</p>
          <div className="bg-[#0c1017] border border-surface-variant rounded-xl overflow-hidden shadow-xl">
            <div className="flex justify-between items-center px-4 py-3 border-b border-surface-variant bg-surface-container-low">
              <span className="text-xs font-mono text-on-surface-variant">verify_merkle.js</span>
            </div>
            <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed text-on-surface">
              <span className="text-pink-400">const</span> proof = tree.<span className="text-blue-400">getProof</span>(targetHash);<br/>
              <span className="text-pink-400">const</span> isValid = tree.<span className="text-blue-400">verify</span>(proof, targetHash, root);<br/>
              console.<span className="text-blue-400">log</span>(<span className="text-green-400">"Verified:"</span>, isValid);
            </div>
          </div>
        </div>
      )
    }
  },
  'hashes': {
    title: 'Cryptographic Hash Functions',
    subtitle: 'Understanding the SHA-256 zero-knowledge hashing engine powering Entrustory.',
    tabs: ['overview', 'security'],
    toc: ['SHA-256', 'Client-Side Execution', 'Collision Resistance'],
    content: {
      overview: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Why SHA-256?</h2>
          <p className="text-on-surface leading-relaxed">Entrustory uses the Secure Hash Algorithm 2 (SHA-256), designed by the NSA. It generates a mathematically unique 256-bit (64-character hexadecimal) signature for any digital file.</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900 border border-surface-variant rounded-xl">
              <Hash size={24} className="text-tertiary mb-3" />
              <h4 className="font-bold text-white mb-2">Deterministic</h4>
              <p className="text-sm text-on-surface-variant">The same file will always produce the exact same hash, every single time.</p>
            </div>
            <div className="p-5 bg-slate-900 border border-surface-variant rounded-xl">
              <ShieldAlert size={24} className="text-purple-400 mb-3" />
              <h4 className="font-bold text-white mb-2">Avalanche Effect</h4>
              <p className="text-sm text-on-surface-variant">Changing a single pixel in a 5GB video completely changes the entire hash.</p>
            </div>
          </div>
        </div>
      ),
      security: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Client-Side Architecture</h2>
          <p className="text-on-surface leading-relaxed">By default, all hashing is performed locally in the user's browser using the native Web Crypto API. This ensures a strictly Zero-Knowledge architecture.</p>
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-xl flex gap-4">
            <CheckCircle className="text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-400 mb-1">Privacy Guarantee</h4>
              <p className="text-sm text-emerald-200/70">The server only receives the 64-character hash string. We physically cannot read, access, or intercept your raw files.</p>
            </div>
          </div>
        </div>
      )
    }
  },
  'signatures': {
    title: 'Ed25519 Signature Schemes',
    subtitle: 'How Entrustory mathematically guarantees server-side timestamps and authenticity.',
    tabs: ['overview', 'implementation'],
    toc: ['Elliptic Curves', 'HMAC Signatures', 'Verification'],
    content: {
      overview: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Edwards-Curve Cryptography</h2>
          <p className="text-on-surface leading-relaxed">To prove that Entrustory received your hash at an exact millisecond, our core engine signs the Merkle Root and the UTC Timestamp using advanced elliptical curve cryptography.</p>
          <ul className="space-y-3 mt-4">
            <li className="flex gap-3 text-on-surface"><CheckCircle size={18} className="text-tertiary" /> Unforgeable mathematical proof of timestamping.</li>
            <li className="flex gap-3 text-on-surface"><CheckCircle size={18} className="text-tertiary" /> Protects against database-level tampering by malicious admins.</li>
          </ul>
        </div>
      ),
      implementation: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">HMAC vs Ed25519</h2>
          <p className="text-on-surface leading-relaxed">For edge environments and extreme high-throughput APIs, Entrustory falls back to HMAC-SHA256 signatures, leveraging Web Crypto API for millisecond-latency signing.</p>
        </div>
      )
    }
  }
};

export const Documentation = () => {
  const { user } = useAuth();
  
  // Dynamic State Control
  const [activeDoc, setActiveDoc] = useState<string>('getting-started');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentData = DOC_DATA[activeDoc] || DOC_DATA['getting-started'];

  // Handle changing documentation pages
  const handleNavClick = (docKey: string) => {
    setActiveDoc(docKey);
    setActiveTab(currentData.tabs[0] || 'overview'); // Reset to first tab of new page
    window.scrollTo(0,0);
  };



  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface font-sans selection:bg-tertiary/30 selection:text-on-primary">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-surface-variant bg-surface/80 backdrop-blur-md">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-tertiary/10 border border-tertiary/30 rounded flex items-center justify-center text-tertiary">
                <ShieldCheck size={20} />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white font-display">Entrustory</h2>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-sm font-medium hover:text-white transition-colors">Guides</a>
              <a href="#" className="text-sm font-bold text-tertiary transition-colors">API Docs</a>
              <a href="#" className="text-sm font-medium hover:text-white transition-colors">Changelog</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4 flex-1 justify-end max-w-md">
            {/* Interactive Search */}
            <div className="relative w-full max-w-xs hidden sm:block group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search documentation..." 
                className="w-full bg-surface-container-low border border-surface-variant rounded-lg py-1.5 pl-9 pr-4 text-sm text-white focus:ring-1 focus:ring-tertiary focus:border-tertiary transition-all outline-none"
              />
              {/* Search Dropdown Mock */}
              {searchQuery.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-low border border-outline-variant rounded-lg shadow-2xl p-2 z-50">
                  <p className="text-xs text-on-surface-variant px-2 pb-1">Results for "{searchQuery}"</p>
                  <button onClick={() => {handleNavClick('merkle'); setSearchQuery('');}} className="w-full text-left px-3 py-2 text-sm text-tertiary hover:bg-surface-variant rounded">Merkle Tree Verification</button>
                  <button onClick={() => {handleNavClick('hashes'); setSearchQuery('');}} className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-variant rounded">SHA-256 Hashing Engine</button>
                </div>
              )}
            </div>
            
            {user ? (
              <Link to="/app/dashboard" className="bg-surface-variant hover:bg-slate-700 border border-outline-variant text-white px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/login" className="bg-tertiary text-[#0e0e0e] px-4 py-2 rounded-lg text-sm font-bold hover:bg-tertiary transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] whitespace-nowrap">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1500px] mx-auto w-full">
        
        {/* Left Sidebar Navigation */}
        <aside className="hidden lg:block w-72 border-r border-surface-variant p-6 overflow-y-auto sticky top-16 h-[calc(100vh-64px)]">
          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Foundation</h3>
              <nav className="space-y-1">
                <button onClick={() => handleNavClick('getting-started')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${activeDoc === 'getting-started' ? 'bg-tertiary/10 text-tertiary' : 'hover:bg-surface-variant/50 hover:text-white'}`}>
                  <Rocket size={16} className={activeDoc === 'getting-started' ? 'text-tertiary' : 'text-on-surface-variant group-hover:text-tertiary'} />
                  <span className="text-sm font-medium">Getting Started</span>
                </button>
                <button onClick={() => handleNavClick('api-ref')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${activeDoc === 'api-ref' ? 'bg-tertiary/10 text-tertiary' : 'hover:bg-surface-variant/50 hover:text-white'}`}>
                  <Terminal size={16} className={activeDoc === 'api-ref' ? 'text-tertiary' : 'text-on-surface-variant group-hover:text-tertiary'} />
                  <span className="text-sm font-medium">API Reference</span>
                </button>
              </nav>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-3">Specs Overview</h3>
              <nav className="space-y-1">
                <button onClick={() => handleNavClick('hashes')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${activeDoc === 'hashes' ? 'bg-surface-variant text-white font-bold' : 'hover:bg-surface-variant/50 hover:text-white text-on-surface-variant'}`}>
                  <Hash size={16} className="text-on-surface-variant" />
                  <span className="text-sm">Hash Functions</span>
                </button>
                <button onClick={() => handleNavClick('merkle')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${activeDoc === 'merkle' ? 'bg-surface-variant text-white font-bold' : 'hover:bg-surface-variant/50 hover:text-white text-on-surface-variant'}`}>
                  <Link2 size={16} className="text-on-surface-variant" />
                  <span className="text-sm">Merkle Trees</span>
                </button>
                <button onClick={() => handleNavClick('signatures')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${activeDoc === 'signatures' ? 'bg-surface-variant text-white font-bold' : 'hover:bg-surface-variant/50 hover:text-white text-on-surface-variant'}`}>
                  <Fingerprint size={16} className="text-on-surface-variant" />
                  <span className="text-sm">Signature Schemes</span>
                </button>
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-12 lg:pr-8 overflow-x-hidden">
          <div className="max-w-4xl mx-auto">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-8">
              <span className="hover:text-tertiary transition-colors cursor-pointer">Docs</span>
              <ChevronRight size={14} />
              <span className="hover:text-tertiary transition-colors cursor-pointer capitalize">{activeDoc.replace('-', ' ')}</span>
            </nav>

            {/* Dynamic Page Header */}
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-2">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-white font-display">
                {currentData.title}
              </h1>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                {currentData.subtitle}
              </p>
            </div>

            {/* Dynamic Content Navigation Tabs */}
            <div className="flex border-b border-surface-variant mb-10 overflow-x-auto hide-scrollbar">
              {currentData.tabs.map((tab: string) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 border-b-2 text-sm font-bold capitalize whitespace-nowrap transition-colors ${
                    activeTab === tab 
                      ? 'border-tertiary text-tertiary' 
                      : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Dynamic Article Section */}
            <section className="space-y-10 animate-in fade-in duration-300">
              {currentData.content[activeTab] || (
                <div className="py-20 text-center border-2 border-dashed border-surface-variant rounded-xl bg-surface-container-low/50">
                  <Terminal size={48} className="mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2 capitalize">{activeTab} Docs Pending</h3>
                  <p className="text-on-surface-variant">Detailed technical specifications for this module are currently being written.</p>
                </div>
              )}
            </section>

            {/* Interactive Feedback & Footer */}
            <div className="mt-20 pt-8 border-t border-surface-variant flex flex-col sm:flex-row items-center justify-between gap-6 pb-10">
              <div className="flex items-center gap-4">
                <span className="text-sm text-on-surface-variant">Was this page helpful?</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setFeedback('up')}
                    className={`w-10 h-10 rounded-lg border transition-colors flex items-center justify-center ${feedback === 'up' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'border-outline-variant hover:bg-surface-variant text-on-surface-variant'}`}
                  >
                    <ThumbsUp size={16} />
                  </button>
                  <button 
                    onClick={() => setFeedback('down')}
                    className={`w-10 h-10 rounded-lg border transition-colors flex items-center justify-center ${feedback === 'down' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'border-outline-variant hover:bg-surface-variant text-on-surface-variant'}`}
                  >
                    <ThumbsDown size={16} />
                  </button>
                </div>
              </div>
              <div className="flex gap-6">
                <a href="#" className="text-sm text-on-surface-variant hover:text-tertiary transition-colors">Edit on GitHub</a>
                <a href="#" className="text-sm text-on-surface-variant hover:text-tertiary transition-colors">Contact Support</a>
              </div>
            </div>

          </div>
        </main>

        {/* Dynamic Right Sidebar: Table of Contents */}
        <aside className="hidden xl:block w-64 p-6 sticky top-16 h-[calc(100vh-64px)] border-l border-surface-variant">
          <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">On this page</h4>
          <nav className="space-y-3 text-sm">
            {currentData.toc.map((heading: string, i: number) => (
              <a 
                key={heading} 
                href="#" 
                className={`block transition-colors ${i === 0 ? 'text-tertiary font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {heading}
              </a>
            ))}
          </nav>

          <div className="mt-12 p-5 bg-tertiary/5 rounded-xl border border-tertiary/20">
            <p className="text-xs font-bold text-tertiary uppercase tracking-wider mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">lightbulb</span> Pro Tip
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Read the API Reference to see how to implement these algorithms programmatically.
            </p>
            <button onClick={() => handleNavClick('api-ref')} className="mt-3 text-xs text-tertiary font-bold hover:underline flex items-center gap-1">
              Read advanced docs <ArrowRight size={12} />
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
};
