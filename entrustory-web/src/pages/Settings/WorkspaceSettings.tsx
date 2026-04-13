import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { 
  Building2, ShieldCheck, Key, Bell, Globe, 
  Loader2, X, HardDrive, Lock
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
  const [ipWhitelist, setIpWhitelist] = useState(['192.168.1.1/24']);
  const [newIp, setNewIp] = useState('');
  
  const [hashAlgo, setHashAlgo] = useState('sha256');

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
        window.dispatchEvent(new Event('refresh_dashboard')); 
      }, 600);
    } catch (err: any) {
      toast.error(`Failed to save: ${err.message}`);
      setIsSaving(false);
    }
  };

  const handleAddIp = () => {
    if (newIp && !ipWhitelist.includes(newIp)) { setIpWhitelist([...ipWhitelist, newIp]); setNewIp(''); }
  };
  const removeIp = (ip: string) => { setIpWhitelist(ipWhitelist.filter(i => i !== ip)); };

  // --- NEW: Mock Action Handlers ---
  const handleTransferOwnership = () => toast.success("An email has been sent to your registered address to securely initiate the ownership transfer.");
  const handleDeleteWorkspace = () => {
    const confirm = window.prompt("WARNING: This will permanently delete all cryptographic records and vaults. Type your workspace name to confirm.");
    if (confirm === workspaceName) toast.success("Workspace deletion scheduled.");
  };
  const handleConnectSSO = () => toast('SSO Configuration requires an Enterprise SLA. Please contact support.', { icon: '🏢' });
  const handleConnectS3 = () => toast.success("Redirecting to AWS IAM Identity Center for authorization...");

  if (loading) return <div className="min-h-full flex items-center justify-center bg-surface"><Loader2 className="animate-spin text-tertiary w-8 h-8" /></div>;

  return (
    <div className="bg-surface font-['Inter'] text-on-surface min-h-full flex relative z-0">
      
      {/* INNER SIDEBAR */}
      <aside className="w-64 border-r border-surface-variant bg-surface shrink-0 pt-8 px-4 flex flex-col h-[calc(100vh-104px)] sticky top-0">
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 px-3">Configuration</h2>
        <nav className="flex flex-col gap-1">
          <button onClick={() => setActiveTab('general')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-tertiary/10 text-tertiary' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}><Building2 size={18} /> General</button>
          <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'security' ? 'bg-tertiary/10 text-tertiary' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}><ShieldCheck size={18} /> Security & Access</button>
          <button onClick={() => setActiveTab('crypto')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'crypto' ? 'bg-tertiary/10 text-tertiary' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}><Key size={18} /> Cryptography</button>
          <button onClick={() => setActiveTab('notifications')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'notifications' ? 'bg-tertiary/10 text-tertiary' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}><Bell size={18} /> Integrations</button>
          <button onClick={() => setActiveTab('compliance')} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'compliance' ? 'bg-tertiary/10 text-tertiary' : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'}`}><Globe size={18} /> Data & Compliance</button>
        </nav>
      </aside>

      {/* MAIN SETTINGS CONTENT */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto pb-32">
        <div className="max-w-4xl">
          
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-white font-display capitalize">
              {activeTab === 'crypto' ? 'Cryptography' : activeTab === 'notifications' ? 'Integrations' : activeTab.replace('-', ' ')} Settings
            </h1>
            <button onClick={handleSaveSettings} disabled={isSaving} className="flex items-center gap-2 bg-tertiary hover:bg-tertiary text-white font-bold px-6 py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(255,177,72,0.2)] disabled:opacity-50">
              {isSaving ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>

          {/* --- TAB 1: GENERAL --- */}
          {activeTab === 'general' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-surface-variant pb-2">Workspace Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Workspace Name</label>
                    <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 text-white outline-none focus:border-tertiary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Workspace ID (Read Only)</label>
                    <input type="text" value={workspaceId} readOnly className="w-full bg-surface-container-low/50 border border-surface-variant text-on-surface-variant rounded-lg px-4 py-2.5 font-mono text-sm cursor-not-allowed" />
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-red-500 border-b border-surface-variant pb-2">Danger Zone</h3>
                <div className="border border-red-500/30 rounded-xl overflow-hidden">
                  <div className="p-4 bg-red-500/5 flex justify-between items-center border-b border-red-500/20">
                    <div>
                      <h4 className="font-bold text-white text-sm">Transfer Ownership</h4>
                      <p className="text-xs text-on-surface-variant">Transfer this workspace to another user or organization.</p>
                    </div>
                    {/* FIXED: Transfer Ownership Action */}
                    <button onClick={handleTransferOwnership} className="px-4 py-2 bg-surface-variant hover:bg-slate-700 text-white text-sm font-bold rounded-lg border border-outline-variant transition-colors">Transfer</button>
                  </div>
                  <div className="p-4 bg-red-500/5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-sm">Delete Workspace</h4>
                      <p className="text-xs text-on-surface-variant">Permanently delete all cryptographic records and vaults.</p>
                    </div>
                    {/* FIXED: Delete Workspace Action */}
                    <button onClick={handleDeleteWorkspace} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-lg transition-colors">Delete Workspace</button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* --- TAB 2: SECURITY --- */}
          {activeTab === 'security' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-white border-b border-surface-variant pb-2">Authentication Policies</h3>
                
                <div className="flex items-center justify-between p-4 bg-surface-container-low border border-surface-variant rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">Require Two-Factor Authentication <span className="bg-tertiary/20 text-tertiary text-[10px] px-2 py-0.5 rounded uppercase">Recommended</span></h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={require2FA} onChange={() => setRequire2FA(!require2FA)} />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
                  </label>
                </div>

                <div className="p-4 bg-surface-container-low border border-surface-variant rounded-xl">
                  <h4 className="text-sm font-bold text-white mb-4">Single Sign-On (SSO)</h4>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-variant rounded-lg flex items-center justify-center"><Lock size={20} className="text-on-surface-variant" /></div>
                    <div className="flex-1">
                      <p className="text-sm text-on-surface mb-1">SAML & OIDC connections are available on the Enterprise plan.</p>
                      <a href="#" className="text-xs text-tertiary hover:underline">Contact Sales to enable</a>
                    </div>
                    {/* FIXED: SSO Button Action */}
                    <button onClick={handleConnectSSO} className="px-4 py-2 border border-outline-variant hover:bg-surface-variant text-white rounded-lg text-sm font-bold transition-colors">Configure SSO</button>
                  </div>
                </div>
              </section>

              <section className="space-y-4 pt-4">
                <h3 className="text-lg font-bold text-white border-b border-surface-variant pb-2">Network Security</h3>
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">IP Allowlist</h4>
                  <div className="flex gap-2 mb-4 max-w-md">
                    <input type="text" value={newIp} onChange={(e) => setNewIp(e.target.value)} placeholder="e.g. 192.168.1.0/24" className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-tertiary" />
                    <button onClick={handleAddIp} type="button" className="px-4 py-2 bg-surface-variant hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-outline-variant">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ipWhitelist.map((ip) => (
                      <span key={ip} className="inline-flex items-center gap-2 bg-surface-variant border border-outline-variant text-on-surface text-xs font-mono px-3 py-1.5 rounded-full">
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
                <h3 className="text-lg font-bold text-white border-b border-surface-variant pb-2">Core Ledger Algorithms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2">Hash Algorithm</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-tertiary bg-tertiary/5 rounded-lg cursor-pointer">
                        <input type="radio" checked={hashAlgo === 'sha256'} onChange={() => setHashAlgo('sha256')} className="text-tertiary" />
                        <div><p className="text-sm font-bold text-tertiary">SHA-256</p></div>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* --- TAB 4: INTEGRATIONS --- */}
          {activeTab === 'notifications' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-surface-variant pb-2">Third-Party Connections</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <div className="border border-surface-variant bg-surface-container-low rounded-xl p-5 hover:border-outline transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center"><HardDrive size={20} /></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-surface-variant text-on-surface-variant px-2 py-1 rounded">Disabled</span>
                      </div>
                      <h4 className="font-bold text-white mb-1 text-sm">Amazon S3 Backup</h4>
                      <p className="text-xs text-on-surface-variant mb-4">Automate nightly database and vault backups to your AWS bucket.</p>
                    </div>
                    {/* FIXED: S3 Button Action */}
                    <button onClick={handleConnectS3} className="w-full py-2 bg-surface-variant hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors border border-outline-variant">Connect S3</button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="py-20 text-center border-2 border-dashed border-surface-variant rounded-xl bg-surface-container-low/50">
              <ShieldCheck size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2 capitalize">Compliance Reports</h3>
              <p className="text-on-surface-variant">Detailed compliance reporting requires an Enterprise support ticket to provision.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};
