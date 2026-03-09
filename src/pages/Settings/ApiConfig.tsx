import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { X, Copy, AlertTriangle, Key, Terminal, Plus, ExternalLink, CheckCircle } from 'lucide-react';

export const ApiConfig = () => {
  const { user } = useAuth();
  const [workspaceId, setWorkspaceId] = useState('ws_loading...');
  const [language, setLanguage] = useState<'python' | 'nodejs'>('nodejs');
  
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [keys, setKeys] = useState<any[]>([]);

  const fetchKeys = async () => {
    if (!user) return;
    
    // Get Workspace ID
    const { data: ws } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).limit(1).single();
    if (ws) setWorkspaceId(ws.workspace_id);

    // Get real API keys from database
    const { data: dbKeys } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });
    if (dbKeys) setKeys(dbKeys);
  };

  useEffect(() => { fetchKeys(); }, [user]);

  const generateRawKey = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return 'pk_live_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !user) return;

    const rawKey = generateRawKey();
    
    // Insert into real database!
    const { error } = await supabase.from('api_keys').insert([{
      name: newKeyName,
      key_value: rawKey,
      user_id: user.id,
      workspace_id: workspaceId
    }]);

    if (error) {
      alert("Failed to create key.");
      return;
    }

    setRevealedKey(rawKey); 
    setCreateModalOpen(false);
    setNewKeyName('');
    fetchKeys(); // Refresh list
  };

  const handleRevoke = async (id: string) => {
    if (window.confirm("Are you sure you want to revoke this key?")) {
      await supabase.from('api_keys').delete().eq('id', id);
      fetchKeys();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskKey = (rawKey: string) => `${rawKey.substring(0, 8)}••••••••••••${rawKey.slice(-4)}`;

  return (
    <div className="bg-[#0B1120] font-['Inter'] text-slate-100 min-h-full flex flex-col p-4 sm:p-10 relative">
      <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl font-bold tracking-tight">Developer API</h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Manage your cryptographic API keys and configure endpoints for the Entrustory network.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="flex flex-col gap-8 lg:col-span-2">
            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-white text-xl font-bold">Secret Keys</h2>
                <button onClick={() => setCreateModalOpen(true)} className="flex items-center justify-center rounded-lg h-9 px-4 bg-cyan-600 text-white hover:bg-cyan-500 gap-2 text-sm font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Plus size={16} /> <span>Create New Key</span>
                </button>
              </div>
              
              <div className="flex flex-col rounded-xl border border-slate-800 bg-[#111722] overflow-hidden">
                {keys.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No active API keys found.</div>
                ) : (
                  keys.map((k) => (
                    <div key={k.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border-b border-slate-800/50 hover:bg-slate-800/30 group">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center rounded-lg shrink-0 w-12 h-12 border bg-cyan-500/10 text-cyan-400 border-cyan-500/30">
                          <Key size={20} />
                        </div>
                        <div className="flex flex-col justify-center gap-1">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-base font-semibold leading-none">{k.name}</p>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Active</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 text-sm font-mono bg-[#0B1120] border border-slate-800 rounded px-2 py-1 w-fit mt-1">
                            <span>{maskKey(k.key_value)}</span>
                          </div>
                          <p className="text-slate-500 text-xs mt-1">Created: {new Date(k.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleRevoke(k.id)} className="px-3 py-1.5 border border-red-500/30 text-red-500 hover:bg-red-500/10 text-sm font-medium rounded-lg">
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
             {/* Code Snippet block hidden here for brevity, keep the old one but use 'keys[0]?.key_value' */}
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111722] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setCreateModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
            <h2 className="text-xl font-bold text-white mb-2">Create new secret key</h2>
            <form onSubmit={handleCreateKey} className="space-y-5 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Key Name</label>
                <input type="text" required value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" placeholder="e.g. Production CI/CD Agent" />
              </div>
              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg shadow-lg mt-2">Generate Key</button>
            </form>
          </div>
        </div>
      )}

      {revealedKey && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-[#111722] border border-cyan-500/50 rounded-xl w-full max-w-lg p-8 relative text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Save your API Key</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm p-4 rounded-lg flex items-start gap-3 text-left mb-6">
              <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p>For your security, <strong>we will never show this key again.</strong></p>
            </div>
            <div className="bg-[#0B1120] border border-slate-700 rounded-lg p-4 mb-6 flex items-center justify-between">
              <code className="text-cyan-400 font-mono text-sm break-all text-left">{revealedKey}</code>
              <button onClick={() => copyToClipboard(revealedKey)} className="ml-4 p-2 bg-slate-800 hover:bg-slate-700 rounded text-white">
                {copied ? <CheckCircle size={18} className="text-emerald-400" /> : <Copy size={18} />}
              </button>
            </div>
            <button onClick={() => { setRevealedKey(null); setCopied(false); }} className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg">I have stored it safely</button>
          </div>
        </div>
      )}
    </div>
  );
};
