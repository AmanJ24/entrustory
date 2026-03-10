import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  Building2, ShieldCheck, Key, Bell, Globe, 
  Loader2, X, AlertTriangle, CheckCircle, 
  Lock, Fingerprint, Database, Server
} from 'lucide-react';

export const WorkspaceSettings = () => {
  const { user } = useAuth();
  
  // Real Data States
  const [loading, setLoading] = useState(true);
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // UI State for Inner Tabs
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'crypto' | 'notifications' | 'compliance'>('general');

  // Advanced Form States
  const [require2FA, setRequire2FA] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [ipWhitelist, setIpWhitelist] = useState(['192.168.1.1/24']);
  const [newIp, setNewIp] = useState('');
  
  const [hashAlgo, setHashAlgo] = useState('sha256');
  const [anchorFreq, setAnchorFreq] = useState('daily');
  const [vaultPolicy, setVaultPolicy] = useState('optional');

  const [dataRegion, setDataRegion] = useState('us-east-1');
  const [retention, setRetention] = useState('indefinite');

  // Load Real Workspace Data
  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!user) return;
      try {
        const { data: member } = await supabase
          .from('workspace_members')
          .select('workspace_id, workspaces(id, name)')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (member && member.workspaces) {
          // @ts-ignore
          setWorkspaceName(member.workspaces.name);
          // @ts-ignore
          setWorkspaceId(member.workspaces.id);
        }
      } catch (err) {
        console.error("Error loading workspace data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [user]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('workspaces').update({ name: workspaceName }).eq('id', workspaceId);
      if (error) throw error;
      
      setTimeout(() => {
        setIsSaving(false);
        // Refresh the global header
        window.dispatchEvent(new Event('refresh_dashboard')); 
      }, 600);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save: ${err.message}`);
      setIsSaving(false);
    }
  };

  const handleAddIp = () => {
    if (newIp && !ipWhitelist.includes(newIp)) {
      setIpWhitelist([...ipWhitelist, newIp]);
      setNewIp('');
    }
  };

  if (loading) {
    return <div className="min-h-full flex items-center justify-center bg-[#0B1120]"><Loader2 className="animate-spin text-cyan-500 w-8 h-8" /></div>;
  }

  return (
    <div className="bg-[#0B1120] font-['Inter'] text-slate-100 min-h-full flex relative z-0">
      
      {/* INNER SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 bg-[#0B1120] shrink-0 pt-8 px-4 flex flex-col h-[calc(100vh-104px)] sticky top-0">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-3">Configuration</h2>
        <nav className="flex flex-col gap-1">
          <button onClick={() => setActiveTab('general')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Building2 size={18} /> General
          </button>
          <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <ShieldCheck size={18} /> Security & Access
          </button>
          <button onClick={() => setActiveTab('crypto')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'crypto' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Key size={18} /> Cryptography
          </button>
          <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'notifications' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Bell size={18} /> Notifications
          </button>
          <button onClick={() => setActiveTab('compliance')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'compliance' ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <Globe size={18} /> Data & Compliance
          </button>
        </nav>
      </aside>

      {/* MAIN SETTINGS CONTENT */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto pb-32">
        <div className="max-w-4xl">
          
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-white font-display capitalize">
              {activeTab === 'crypto' ? 'Cryptography' : activeTab.replace('-', ' ')} Settings
            </h1>
            <button onClick={handleSaveSettings} disabled={isSaving} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] disabled:opacity-50">
              {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>

          {/* --- TAB 1: GENERAL --- */}
          {activeTab === 'general' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Workspace Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Workspace Name</label>
                    <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full bg-[#111722] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Workspace ID</label>
                    <input type="text" value={workspaceId} readOnly className="w-full bg-[#111722]/50 border border-slate-800 text-slate-500 rounded-lg px-4 py-2.5 font-mono text-sm cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Support Email</label>
                  <input type="email" placeholder="security@yourcompany.com" className="w-full max-w-md bg-[#111722] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" />
                  <p className="text-xs text-slate-500 mt-1">Used for critical infrastructure alerts and billing.</p>
                </div>
              </section>

              <section className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-red-500 border-b border-slate-800 pb-2">Danger Zone</h3>
                <div className="border border-red-500/30 rounded-xl overflow-hidden">
                  <div className="p-4 bg-red-500/5 flex justify-between items-center border-b border-red-500/20">
                    <div>
                      <h4 className="font-bold text-white text-sm">Transfer Ownership</h4>
                      <p className="text-xs text-slate-400">Transfer this workspace to another user or organization.</p>
                    </div>
                    <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-lg border border-slate-700 transition-colors">Transfer</button>
                  </div>
                  <div className="p-4 bg-red-500/5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">Delete Workspace</h4>
                      <p className="text-xs text-slate-400">Permanently delete all cryptographic records and vaults. This cannot be undone.</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors">Delete Workspace</button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* --- TAB 2: SECURITY --- */}
          {activeTab === 'security' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Authentication Policies</h3>
                
                <div className="flex items-center justify-between p-4 bg-[#111722] border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">Require Two-Factor Authentication <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded uppercase">Recommended</span></h4>
                    <p className="text-xs text-slate-400">Force all workspace members to enable 2FA before accessing the ledger.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={require2FA} onChange={() => setRequire2FA(!require2FA)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <div className="p-4 bg-[#111722] border border-slate-800 rounded-xl">
                  <h4 className="text-sm font-bold text-white mb-4">Single Sign-On (SSO)</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center"><Lock size={20} className="text-slate-400" /></div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-300 mb-1">SAML & OIDC connections are available on the Enterprise plan.</p>
                      <a href="#" className="text-xs text-cyan-400 hover:underline">Contact Sales to enable</a>
                    </div>
                    <button disabled className="px-4 py-2 bg-slate-800 text-slate-500 rounded-lg text-sm font-bold cursor-not-allowed">Configure SSO</button>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Network Security</h3>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">IP Allowlist</h4>
                  <p className="text-xs text-slate-400 mb-3">Restrict dashboard and API access to specific corporate IP addresses or CIDR blocks.</p>
                  <div className="flex gap-2 mb-4 max-w-md">
                    <input type="text" value={newIp} onChange={(e) => setNewIp(e.target.value)} placeholder="e.g. 192.168.1.0/24" className="flex-1 bg-[#111722] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-cyan-500" />
                    <button onClick={handleAddIp} type="button" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ipWhitelist.map((ip) => (
                      <span key={ip} className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono px-3 py-1.5 rounded-full">
                        {ip}
                        <button onClick={() => removeIp(ip)} className="hover:text-red-400 focus:outline-none"><X size={14} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* --- TAB 3: CRYPTOGRAPHY --- */}
          {activeTab === 'crypto' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Core Ledger Algorithms</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Hash Algorithm</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-cyan-500 bg-cyan-500/5 rounded-lg cursor-pointer">
                        <input type="radio" checked={hashAlgo === 'sha256'} onChange={() => setHashAlgo('sha256')} className="text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500" />
                        <div>
                          <p className="text-sm font-bold text-cyan-400">SHA-256 <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded ml-2">Default</span></p>
                          <p className="text-xs text-slate-400">NIST Standard. Perfect balance of speed and security.</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-slate-800 bg-[#111722] rounded-lg cursor-pointer hover:border-slate-700">
                        <input type="radio" checked={hashAlgo === 'sha512'} onChange={() => setHashAlgo('sha512')} className="text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500" />
                        <div>
                          <p className="text-sm font-bold text-slate-300">SHA-512</p>
                          <p className="text-xs text-slate-500">Maximum bit-length security. Slower client-side processing.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Signature Curve</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-cyan-500 bg-cyan-500/5 rounded-lg cursor-pointer">
                        <input type="radio" checked readOnly className="text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500" />
                        <div>
                          <p className="text-sm font-bold text-cyan-400">Ed25519</p>
                          <p className="text-xs text-slate-400">Edwards-curve Digital Signature Algorithm.</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-slate-800 bg-[#111722]/50 opacity-50 rounded-lg cursor-not-allowed">
                        <input type="radio" disabled className="text-cyan-500 bg-slate-800 border-slate-600 focus:ring-cyan-500" />
                        <div>
                          <p className="text-sm font-bold text-slate-500">ECDSA P-256 <span className="bg-slate-800 text-slate-500 text-[10px] px-2 py-0.5 rounded ml-2">Coming Soon</span></p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-2">Vault & Blockchain Policies</h3>
                
                <div className="p-5 bg-[#111722] border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Database size={24} className="text-slate-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Default Vault Encryption</h4>
                      <p className="text-xs text-slate-400">Set the default behavior for AES-256 zero-knowledge file storage.</p>
                    </div>
                  </div>
                  <select value={vaultPolicy} onChange={e => setVaultPolicy(e.target.value)} className="bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                    <option value="optional">Optional (User Choice)</option>
                    <option value="forced">Always Enforce Encryption</option>
                    <option value="disabled">Disable Vault Entirely</option>
                  </select>
                </div>

                <div className="p-5 bg-[#111722] border border-slate-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Server size={24} className="text-slate-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Blockchain Batching Frequency</h4>
                      <p className="text-xs text-slate-400">How often Merkle roots are bundled and sent to Layer 4.</p>
                    </div>
                  </div>
                  <select value={anchorFreq} onChange={e => setAnchorFreq(e.target.value)} className="bg-[#0B1120] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily (Cost Optimized)</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </section>
            </div>
          )}

          {/* --- TAB 4 & 5 Placeholders (To keep the code clean and focused) --- */}
          {(activeTab === 'notifications' || activeTab === 'compliance') && (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-800 rounded-2xl animate-in fade-in">
              <ShieldCheck size={48} className="text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Module locked.</h3>
              <p className="text-slate-400 text-center max-w-sm">
                Advanced {activeTab} routing configurations require an Enterprise support ticket to provision.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
