import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { X, Copy, AlertTriangle, Key, Terminal, Plus, ExternalLink, CheckCircle } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  type: 'live' | 'test';
  created: string;
}

export const ApiConfig = () => {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState('ws_loading...');
  const [language, setLanguage] = useState<'python' | 'nodejs'>('nodejs');
  
  // Modal States
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'live' | 'test'>('live');
  
  // One-time reveal state
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Local state for keys (In a full production app, these map to an 'api_keys' Supabase table)
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Production API Key', maskedKey: 'pk_live_••••••••••••9x82', type: 'live', created: 'Oct 24, 2026' }
  ]);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!user) return;
      const { data } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).limit(1).single();
      if (data) setWorkspaceId(data.workspace_id);
    };
    fetchWorkspace();
  }, [user]);

  // Securely generates a random 32-character hex string simulating a real API key
  const generateRawKey = (type: 'live' | 'test') => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `pk_${type}_${hex}`;
  };

  const maskKey = (rawKey: string) => {
    const prefix = rawKey.substring(0, 8); // e.g., pk_live_
    const suffix = rawKey.slice(-4);       // e.g., abcd
    return `${prefix}••••••••••••${suffix}`;
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    const rawKey = generateRawKey(newKeyType);
    const newApiKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      maskedKey: maskKey(rawKey),
      type: newKeyType,
      created: 'Just now'
    };

    setKeys([newApiKey, ...keys]);
    setRevealedKey(rawKey); // Trigger the one-time reveal
    setCreateModalOpen(false);
    setNewKeyName('');
  };

  const handleRevoke = (id: string) => {
    if (window.confirm("Are you sure you want to revoke this key? Any applications using it will instantly fail.")) {
      setKeys(keys.filter(k => k.id !== id));
    }
  };

  const handleRoll = (keyToRoll: ApiKey) => {
    if (window.confirm(`Roll "${keyToRoll.name}"? This generates a new secret. The old secret will stop working immediately.`)) {
      const rawKey = generateRawKey(keyToRoll.type);
      
      setKeys(keys.map(k => k.id === keyToRoll.id ? { 
        ...k, 
        maskedKey: maskKey(rawKey), 
        created: 'Just now (Rolled)' 
      } : k));
      
      setRevealedKey(rawKey); // Trigger the one-time reveal for the rolled key
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0B1120] font-['Inter'] text-slate-100 min-h-full flex flex-col p-4 sm:p-10 relative">
      <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-8">
        
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl font-bold tracking-tight">Developer API</h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Manage your cryptographic API keys and configure endpoints for the Entrustory network.
            </p>
          </div>
          <a 
            href="https://docs.entrustory.com" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-center rounded-lg h-10 px-4 bg-slate-800 hover:bg-slate-700 text-white gap-2 text-sm font-bold transition-colors border border-slate-700"
          >
            <ExternalLink size={18} />
            <span>Read Docs</span>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: API Keys */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-white text-xl font-bold">Secret Keys</h2>
                <button 
                  onClick={() => setCreateModalOpen(true)}
                  className="flex items-center justify-center rounded-lg h-9 px-4 bg-cyan-600 text-white hover:bg-cyan-500 gap-2 text-sm font-bold transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <Plus size={16} />
                  <span>Create New Key</span>
                </button>
              </div>
              
              <div className="flex flex-col rounded-xl border border-slate-800 bg-[#111722] overflow-hidden">
                {keys.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No active API keys found.</div>
                ) : (
                  keys.map((k) => (
                    <div key={k.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`flex items-center justify-center rounded-lg shrink-0 w-12 h-12 border ${k.type === 'live' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                          {k.type === 'live' ? <Key size={20} /> : <Terminal size={20} />}
                        </div>
                        <div className="flex flex-col justify-center gap-1">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-base font-semibold leading-none">{k.name}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${k.type === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                              {k.type === 'live' ? 'Active' : 'Test Mode'}
                            </span>
                          </div>
                          {/* Masked Key Display */}
                          <div className="flex items-center gap-2 text-slate-400 text-sm font-mono bg-[#0B1120] border border-slate-800 rounded px-2 py-1 w-fit mt-1">
                            <span>{k.maskedKey}</span>
                          </div>
                          <p className="text-slate-500 text-xs mt-1">Created: {k.created}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:self-center self-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleRoll(k)}
                          className="flex items-center justify-center rounded-lg h-8 px-3 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-sm font-medium transition-colors"
                        >
                          Roll Key
                        </button>
                        <button 
                          onClick={() => handleRevoke(k.id)}
                          className="flex items-center justify-center rounded-lg h-8 px-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 text-sm font-medium transition-colors"
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Code Snippet & Status */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="sticky top-6 flex flex-col gap-6">
              
              {/* Dynamic Code Window */}
              <div className="bg-[#0c1618] rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-[#111722] border-b border-slate-800">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-400">Quickstart</span>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'python' | 'nodejs')}
                      className="bg-transparent text-xs font-bold text-cyan-400 focus:outline-none cursor-pointer"
                    >
                      <option value="nodejs">Node.js</option>
                      <option value="python">Python</option>
                    </select>
                  </div>
                </div>
                <div className="p-4 overflow-x-auto">
                  <code className="text-sm font-mono leading-relaxed block text-slate-300">
                    {language === 'nodejs' ? (
                      <>
                        <span className="text-purple-400">import</span> {'{ Entrustory }'} <span className="text-purple-400">from</span> <span className="text-green-400">'@entrustory/sdk'</span>;<br /><br />
                        <span className="text-slate-500">// Initialize client</span><br />
                        <span className="text-purple-400">const</span> client = <span className="text-purple-400">new</span> <span className="text-yellow-400">Entrustory</span>({'{'}<br />
                        &nbsp;&nbsp;apiKey: <span className="text-emerald-400">"pk_live_..."</span><br />
                        {'}'});<br /><br />
                        <span className="text-slate-500">// Anchor evidence to ledger</span><br />
                        <span className="text-purple-400">const</span> proof = <span className="text-purple-400">await</span> client.proofs.<span className="text-blue-400">create</span>({'{'}<br />
                        &nbsp;&nbsp;workspaceId: <span className="text-emerald-400">"{workspaceId.split('-')[0]}"</span>,<br />
                        &nbsp;&nbsp;hash: <span className="text-emerald-400">"sha256:e3b0c..."</span><br />
                        {'}'});<br /><br />
                        console.<span className="text-blue-400">log</span>(proof.status);
                      </>
                    ) : (
                      <>
                        <span className="text-purple-400">import</span> entrustory<br /><br />
                        <span className="text-slate-500"># Initialize the client</span><br />
                        client = entrustory.Client(<br />
                        &nbsp;&nbsp;api_key=<span className="text-emerald-400">"pk_live_..."</span><br />
                        )<br /><br />
                        <span className="text-slate-500"># Anchor evidence to ledger</span><br />
                        proof = client.proofs.create(<br />
                        &nbsp;&nbsp;workspace_id=<span className="text-emerald-400">"{workspaceId.split('-')[0]}"</span>,<br />
                        &nbsp;&nbsp;hash=<span className="text-emerald-400">"sha256:e3b0c..."</span><br />
                        )<br /><br />
                        <span className="text-blue-400">print</span>(proof.status)
                      </>
                    )}
                  </code>
                </div>
              </div>

              {/* Integration Status Card */}
              <div className="rounded-xl p-5 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20">
                <h3 className="text-lg font-bold text-white mb-2">Network Status</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex w-3 h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full w-3 h-3 bg-cyan-500"></span>
                  </div>
                  <span className="text-sm font-medium text-slate-300">Systems Operational</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">API Latency</span>
                    <span className="text-white font-mono">24ms</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Create Key Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111722] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setCreateModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-2">Create new secret key</h2>
            <p className="text-sm text-slate-400 mb-6">This key will grant programmatic access to your workspace's cryptographic ledger.</p>
            
            <form onSubmit={handleCreateKey} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Key Name</label>
                <input 
                  type="text" required value={newKeyName} onChange={e => setNewKeyName(e.target.value)}
                  className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500"
                  placeholder="e.g. Production CI/CD Agent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Environment</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setNewKeyType('live')} className={`py-2 rounded-lg border text-sm font-medium transition-all ${newKeyType === 'live' ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-[#0B1120] border-slate-700 text-slate-400'}`}>Live Data</button>
                  <button type="button" onClick={() => setNewKeyType('test')} className={`py-2 rounded-lg border text-sm font-medium transition-all ${newKeyType === 'test' ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-[#0B1120] border-slate-700 text-slate-400'}`}>Test Mode</button>
                </div>
              </div>
              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg mt-2">
                Generate Key
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. One-Time Reveal Modal */}
      {revealedKey && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-[#111722] border border-cyan-500/50 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] w-full max-w-lg p-8 relative text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <Key size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Save your API Key</h2>
            
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm p-4 rounded-lg flex items-start gap-3 text-left mb-6">
              <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p>For your security, <strong>we will never show this key again.</strong> Please copy it and store it in a secure password manager or environment variable file.</p>
            </div>

            <div className="bg-[#0B1120] border border-slate-700 rounded-lg p-4 mb-6 flex items-center justify-between">
              <code className="text-cyan-400 font-mono text-sm break-all text-left">{revealedKey}</code>
              <button 
                onClick={() => copyToClipboard(revealedKey)} 
                className="ml-4 p-2 bg-slate-800 hover:bg-slate-700 rounded text-white transition-colors flex shrink-0"
              >
                {copied ? <CheckCircle size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </button>
            </div>

            <button onClick={() => { setRevealedKey(null); setCopied(false); }} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold py-3 rounded-lg transition-all">
              I have stored it safely
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
