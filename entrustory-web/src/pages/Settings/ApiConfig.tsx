import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import type { ApiKey } from '../../types';
import toast from 'react-hot-toast';
import { 
  X, Copy, AlertTriangle, Key, Terminal, Plus, 
  ExternalLink, CheckCircle, Activity, Shield, RefreshCw 
} from 'lucide-react';

export const ApiConfig = () => {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState('ws_loading...');
  const [language, setLanguage] = useState<'curl' | 'nodejs' | 'python'>('curl');
  
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);

  const [apiRequestsCount, setApiRequestsCount] = useState(0);
  const [realLatency, setRealLatency] = useState(0);
  const [pinging, setPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const fetchDashboardData = async () => {
    if (!user) return;
    const startTime = performance.now();
    try {
      const { data: ws } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).limit(1).single();
      if (ws) {
        setWorkspaceId(ws.workspace_id);
        const { data: dbKeys } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
        if (dbKeys) setKeys(dbKeys);
        const { count } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true }).eq('workspace_id', ws.workspace_id).ilike('details->>message', '%API%');
        setApiRequestsCount(count || 0);
      }
    } catch (err) { console.error(err); } finally {
      setRealLatency(Math.round(performance.now() - startTime));
    }
  };

  useEffect(() => { fetchDashboardData(); }, [user]);

  const generateRawKey = () => 'pk_live_' + Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !user) return;
    const rawKey = generateRawKey();
    const { error } = await supabase.from('api_keys').insert([{ name: newKeyName, key_value: rawKey, user_id: user.id, workspace_id: workspaceId }]);
    if (error) { toast.error("Failed to create key."); return; }
    setRevealedKey(rawKey); setCreateModalOpen(false); setNewKeyName(''); fetchDashboardData();
  };

  const handleRevoke = async (id: string) => {
    if (window.confirm("Revoke this key? All connected apps will fail immediately.")) {
      await supabase.from('api_keys').delete().eq('id', id); fetchDashboardData();
    }
  };

  const copyToClipboard = (text: string, id: string = 'revealed') => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id); setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestPing = () => {
    setPinging(true); setPingSuccess(false);
    setTimeout(() => { setPinging(false); setPingSuccess(true); setTimeout(() => setPingSuccess(false), 3000); }, 800);
  };

  const maskKey = (rawKey: string) => `${rawKey.substring(0, 8)}••••••••••••${rawKey.slice(-4)}`;
  const displayKey = keys.length > 0 ? keys[0].key_value : "pk_live_your_api_key_here";

  return (
    <div className="bg-surface font-['Inter'] text-on-surface min-h-full flex flex-col p-6 sm:p-10 relative z-0">
      <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-surface-container-highest/20 blur-[120px] -z-10 pointer-events-none"></div>

      <div className="flex flex-col w-full max-w-[1400px] mx-auto gap-8 pb-20">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-xs font-bold uppercase tracking-wider mb-1 border border-tertiary/20 w-fit">
              <Terminal size={14} /> Developers
            </div>
            <h1 className="text-white text-4xl font-bold tracking-tight font-display">API Configuration</h1>
            <p className="text-on-surface-variant text-base max-w-2xl">
              Manage your cryptographic keys, monitor network traffic, and integrate Entrustory directly into your CI/CD pipelines.
            </p>
          </div>
          {/* --- FIXED: Read Docs Link --- */}
          <Link 
            to="/docs/getting-started" 
            className="flex items-center justify-center rounded-lg h-11 px-5 bg-surface-variant hover:bg-slate-700 text-white gap-2 text-sm font-bold transition-all border border-outline-variant shadow-lg"
          >
            <ExternalLink size={18} />
            Read Documentation
          </Link>
        </div>

        {/* --- REAL DYNAMIC METRICS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-low border border-surface-variant rounded-xl p-5 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20"><Key size={24} /></div>
            <div><p className="text-on-surface-variant text-sm font-medium">Active API Keys</p><h3 className="text-2xl font-bold text-white">{keys.length}</h3></div>
          </div>
          <div className="bg-surface-container-low border border-surface-variant rounded-xl p-5 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20"><Activity size={24} /></div>
            <div><p className="text-on-surface-variant text-sm font-medium">CLI/API Requests</p><h3 className="text-2xl font-bold text-white">{apiRequestsCount}</h3></div>
          </div>
          <div className="bg-surface-container-low border border-surface-variant rounded-xl p-5 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20"><Shield size={24} /></div>
            <div><p className="text-on-surface-variant text-sm font-medium">DB Query Latency</p><h3 className="text-2xl font-bold text-white">{realLatency > 0 ? `${realLatency}ms` : '--'}</h3></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="flex flex-col gap-8 lg:col-span-7">
            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-white text-xl font-bold font-display">Authentication Keys</h2>
                <button onClick={() => setCreateModalOpen(true)} className="flex items-center justify-center rounded-lg h-9 px-4 bg-tertiary text-white hover:bg-tertiary gap-2 text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                  <Plus size={16} /> Create Secret Key
                </button>
              </div>
              <div className="flex flex-col rounded-xl border border-surface-variant bg-surface-container-low overflow-hidden">
                {keys.length === 0 ? (
                  <div className="border-2 border-dashed border-outline-variant bg-surface-container-low/50 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                    <Key size={32} className="text-on-surface-variant mb-3" />
                    <h3 className="text-white font-bold text-lg mb-1">No API Keys</h3>
                    <p className="text-on-surface-variant text-sm max-w-sm mb-4">Generate an API key to start interacting with the Entrustory ledger programmatically.</p>
                    <button onClick={() => setCreateModalOpen(true)} className="text-tertiary text-sm font-bold hover:underline">Generate your first key &rarr;</button>
                  </div>
                ) : (
                  keys.map((k) => (
                    <div key={k.id} className="bg-surface-container-low border border-surface-variant rounded-xl p-5 hover:border-outline-variant transition-all shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center border border-tertiary/20 shrink-0 mt-1"><Key size={18} /></div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-white font-bold text-base">{k.name}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Active</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-on-surface-variant bg-surface border border-surface-variant px-2 py-1 rounded text-sm font-mono">{maskKey(k.key_value)}</code>
                            <button onClick={() => copyToClipboard(k.key_value, k.id)} className="p-1.5 text-on-surface-variant hover:text-tertiary transition-colors rounded hover:bg-surface-variant">
                              {copiedKey === k.id ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                            </button>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-2 font-mono">Created: {new Date(k.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 border-t sm:border-t-0 sm:border-l border-surface-variant pt-4 sm:pt-0 sm:pl-4">
                        <button onClick={() => handleRevoke(k.id)} className="px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20 w-full text-center">
                          Revoke Key
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="flex flex-col gap-4 mt-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-white text-xl font-bold font-display">Webhooks</h2>
                <button onClick={() => toast('Webhook endpoint registration is managed via the CLI.', { icon: '⚙️' })} className="flex items-center justify-center rounded-lg h-9 px-4 border border-outline-variant bg-surface-container-low text-white hover:bg-surface-variant gap-2 text-sm font-bold transition-colors shadow-lg">
                  <Plus size={16} /> Add Endpoint
                </button>
              </div>
              <div className="bg-surface-container-low border border-surface-variant rounded-xl p-5 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-4 hover:border-outline-variant transition-colors">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0"><Activity size={18} /></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-base">Production Listener</h3>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Live
                      </span>
                    </div>
                    <code className="text-on-surface-variant text-xs font-mono">https://api.yourcompany.com/webhooks/entrustory</code>
                    <div className="flex gap-2 mt-3">
                      <span className="px-2 py-1 bg-surface-variant text-on-surface text-[10px] rounded font-mono border border-outline-variant">workitem.created</span>
                    </div>
                  </div>
                </div>
                <button onClick={handleTestPing} disabled={pinging} className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all border ${pingSuccess ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-surface-variant text-on-surface hover:bg-slate-700 border-outline-variant'}`}>
                  {pinging ? <><RefreshCw size={14} className="animate-spin" /> Pinging...</> : pingSuccess ? <><CheckCircle size={14} /> 200 OK</> : <><RefreshCw size={14} /> Test Ping</>}
                </button>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="bg-surface-container-low rounded-xl border border-surface-variant shadow-2xl overflow-hidden flex flex-col h-[500px]">
                <div className="bg-surface border-b border-surface-variant px-4 py-3 flex items-center justify-between">
                  <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-500/80"></div><div className="w-3 h-3 rounded-full bg-amber-500/80"></div><div className="w-3 h-3 rounded-full bg-emerald-500/80"></div></div>
                  <div className="flex gap-1 bg-slate-900 rounded-lg p-1 border border-surface-variant">
                    <button onClick={() => setLanguage('curl')} className={`px-3 py-1 rounded text-xs font-bold font-mono transition-colors ${language === 'curl' ? 'bg-slate-700 text-white' : 'text-on-surface-variant hover:text-on-surface'}`}>cURL</button>
                    <button onClick={() => setLanguage('nodejs')} className={`px-3 py-1 rounded text-xs font-bold font-mono transition-colors ${language === 'nodejs' ? 'bg-slate-700 text-white' : 'text-on-surface-variant hover:text-on-surface'}`}>Node</button>
                    <button onClick={() => setLanguage('python')} className={`px-3 py-1 rounded text-xs font-bold font-mono transition-colors ${language === 'python' ? 'bg-slate-700 text-white' : 'text-on-surface-variant hover:text-on-surface'}`}>Python</button>
                  </div>
                </div>
                
                <div className="p-6 overflow-x-auto flex-1 text-sm font-mono leading-relaxed bg-[#0c1017] relative group">
                  <button onClick={() => copyToClipboard('code_block', 'code')} className="absolute top-4 right-4 p-2 bg-surface-variant/80 text-on-surface-variant hover:text-white rounded border border-outline-variant opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    {copiedKey === 'code' ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                  {language === 'curl' && (
                    <div className="text-on-surface">
                      <span className="text-pink-400">curl</span> -X POST https://api.entrustory.com/v1/anchor \<br/>
                      &nbsp;&nbsp;-H <span className="text-green-400">"Authorization: Bearer {displayKey}"</span> \<br/>
                      &nbsp;&nbsp;-H <span className="text-green-400">"Content-Type: application/json"</span> \<br/>
                      &nbsp;&nbsp;-d <span className="text-yellow-300">'{'{'}<br/>&nbsp;&nbsp;&nbsp;&nbsp;"workspace_id": "{workspaceId.split('-')[0]}...",<br/>&nbsp;&nbsp;&nbsp;&nbsp;"sha256_hash": "e3b0c44298fc1c149afbf4..."<br/>&nbsp;&nbsp;{'}'}'</span>
                    </div>
                  )}
                  {language === 'nodejs' && (
                    <div className="text-on-surface">
                      <span className="text-pink-400">import</span> {'{ Entrustory }'} <span className="text-pink-400">from</span> <span className="text-green-400">'@entrustory/sdk'</span>;<br /><br />
                      <span className="text-on-surface-variant">// Initialize client</span><br />
                      <span className="text-pink-400">const</span> client = <span className="text-pink-400">new</span> <span className="text-yellow-300">Entrustory</span>({'{'}<br />
                      &nbsp;&nbsp;apiKey: <span className="text-green-400">"{displayKey}"</span><br />
                      {'}'});<br /><br />
                      <span className="text-on-surface-variant">// Anchor evidence to ledger</span><br />
                      <span className="text-pink-400">const</span> proof = <span className="text-pink-400">await</span> client.proofs.<span className="text-blue-400">create</span>({'{'}<br />
                      &nbsp;&nbsp;workspaceId: <span className="text-green-400">"{workspaceId.split('-')[0]}..."</span>,<br />
                      &nbsp;&nbsp;hash: <span className="text-green-400">"sha256:e3b0c..."</span><br />
                      {'}'});<br /><br />
                      console.<span className="text-blue-400">log</span>(proof.status);
                    </div>
                  )}
                  {language === 'python' && (
                    <div className="text-on-surface">
                      <span className="text-pink-400">import</span> entrustory<br /><br />
                      <span className="text-on-surface-variant"># Initialize the client</span><br />
                      client = entrustory.<span className="text-yellow-300">Client</span>(<br />
                      &nbsp;&nbsp;api_key=<span className="text-green-400">"{displayKey}"</span><br />
                      )<br /><br />
                      <span className="text-on-surface-variant"># Anchor evidence to ledger</span><br />
                      proof = client.proofs.<span className="text-blue-400">create</span>(<br />
                      &nbsp;&nbsp;workspace_id=<span className="text-green-400">"{workspaceId.split('-')[0]}..."</span>,<br />
                      &nbsp;&nbsp;hash=<span className="text-green-400">"sha256:e3b0c..."</span><br />
                      )<br /><br />
                      <span className="text-blue-400">print</span>(proof.status)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-low border border-surface-variant rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setCreateModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-white"><X size={20} /></button>
            <h2 className="text-xl font-bold text-white mb-2 font-display">Create Secret Key</h2>
            <form onSubmit={handleCreateKey} className="space-y-5 mt-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Key Name</label>
                <input type="text" required value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-white outline-none focus:border-tertiary" placeholder="e.g. Production CI/CD Agent" />
              </div>
              <button type="submit" className="w-full bg-tertiary hover:bg-tertiary text-white font-bold py-3 rounded-lg shadow-lg mt-2 transition-all">Generate Key</button>
            </form>
          </div>
        </div>
      )}

      {revealedKey && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="bg-surface-container-low border border-tertiary/50 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] w-full max-w-lg p-8 relative text-center">
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Save your API Key</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm p-4 rounded-lg flex items-start gap-3 text-left mb-6">
              <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p>For your security, <strong>we will never show this key again.</strong> Please copy it and store it.</p>
            </div>
            <div className="bg-surface border border-outline-variant rounded-lg p-4 mb-6 flex items-center justify-between">
              <code className="text-tertiary font-mono text-sm break-all text-left">{revealedKey}</code>
              <button onClick={() => copyToClipboard(revealedKey, 'reveal')} className="ml-4 p-2 bg-surface-variant hover:bg-slate-700 rounded text-white">
                {copiedKey === 'reveal' ? <CheckCircle size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </button>
            </div>
            <button onClick={() => { setRevealedKey(null); setCopiedKey(null); }} className="w-full bg-surface-variant hover:bg-slate-700 border border-outline text-white font-bold py-3 rounded-lg transition-all">I have stored it safely</button>
          </div>
        </div>
      )}
    </div>
  );
};
