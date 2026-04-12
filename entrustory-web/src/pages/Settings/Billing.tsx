import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { formatBytes } from '../../utils/format';
import { 
  BarChart3, Receipt, Download, 
  ShieldAlert, HardDrive, Fingerprint, Zap, Loader2, X, CheckCircle
} from 'lucide-react';

// --- PLAN CONFIGURATIONS ---
const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: '$0',
    proofLimit: 50,
    storageLimitBytes: 50 * 1024 * 1024, // 50 MB
    storageLabel: '50 MB',
    color: 'text-slate-400',
    bg: 'bg-slate-800'
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    price: '$49',
    proofLimit: 5000,
    storageLimitBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    storageLabel: '100 GB',
    color: 'text-cyan-400',
    bg: 'bg-cyan-600'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$1,250',
    proofLimit: 100000,
    storageLimitBytes: 2 * 1024 * 1024 * 1024 * 1024, // 2 TB
    storageLabel: '2 TB',
    color: 'text-purple-400',
    bg: 'bg-purple-600'
  }
};

type PlanKey = keyof typeof PLANS;

export const Billing = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Real Database Metrics
  const [proofCount, setProofCount] = useState(0);
  const [vaultBytes, setVaultBytes] = useState(0);

  // Active Plan State
  const [activePlan, setActivePlan] = useState<PlanKey>('starter');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;
      try {
        // 1. Get total cryptographic proofs generated
        const { count } = await supabase
          .from('versions')
          .select('*', { count: 'exact', head: true });
        
        setProofCount(count || 0);

        // 2. Get total vault storage used
        const { data: files } = await supabase
          .from('evidence_hashes')
          .select('file_size')
          .not('storage_path', 'is', null);

        if (files) {
          const totalBytes = files.reduce((acc, curr) => acc + Number(curr.file_size || 0), 0);
          setVaultBytes(totalBytes);
        }
      } catch (err) {
        console.error("Failed to load usage data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  const handleUpgrade = (planId: PlanKey) => {
    setIsProcessing(true);
    // Simulate Stripe Checkout Delay
    setTimeout(() => {
      setActivePlan(planId);
      setIsProcessing(false);
      setIsUpgradeModalOpen(false);
    }, 1500);
  };



  // Dynamic calculations based on the currently active plan
  const currentPlanDetails = PLANS[activePlan];
  const proofPercentage = Math.min((proofCount / currentPlanDetails.proofLimit) * 100, 100);
  const vaultPercentage = Math.min((vaultBytes / currentPlanDetails.storageLimitBytes) * 100, 100);

  // Generate dynamic mock invoices based on current date
  const generateInvoices = () => {
    if (activePlan === 'starter') return [];
    const date = new Date();
    return [
      { id: `INV-${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}12`, date: date.toLocaleDateString(), status: 'Paid', amount: currentPlanDetails.price },
      { id: `INV-${date.getFullYear()}-${(date.getMonth()).toString().padStart(2, '0')}12`, date: new Date(date.setMonth(date.getMonth() - 1)).toLocaleDateString(), status: 'Paid', amount: currentPlanDetails.price },
    ];
  };

  const invoices = generateInvoices();

  return (
    <div className="bg-[#0B1120] font-['Inter'] text-slate-100 min-h-full flex flex-col p-6 sm:p-10 relative z-0">
      <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-cyan-900/10 blur-[120px] -z-10 pointer-events-none"></div>

      <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-8 pb-20">
        
        {/* Page Header */}
        <div className="mb-4 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-display">Usage & Billing</h1>
          <p className="text-slate-400 text-base">
            Monitor your cryptographic consumption, vault storage limits, and manage your enterprise subscription.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Usage & Invoices */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Real-time Consumption Card */}
            <section className="bg-[#111722] border border-slate-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                <BarChart3 className="text-cyan-400" size={20} />
                Consumption Overview
              </h2>
              
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-cyan-500" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Proofs Usage */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                        <Fingerprint size={16} /> Cryptographic Proofs
                      </div>
                      <p className="text-sm font-bold text-white">{proofCount} <span className="text-slate-500 font-normal">/ {currentPlanDetails.proofLimit}</span></p>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${proofPercentage > 90 ? 'bg-red-500' : proofPercentage > 75 ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${Math.max(proofPercentage, 1)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500">{proofPercentage.toFixed(1)}% of monthly quota used</p>
                  </div>

                  {/* Storage Usage */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                        <HardDrive size={16} /> Zero-Knowledge Vault
                      </div>
                      <p className="text-sm font-bold text-white">{formatBytes(vaultBytes)} <span className="text-slate-500 font-normal">/ {currentPlanDetails.storageLabel}</span></p>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-1000 ${vaultPercentage > 90 ? 'bg-red-500' : vaultPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.max(vaultPercentage, 1)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500">{vaultPercentage.toFixed(1)}% of storage limit</p>
                  </div>
                </div>
              )}
            </section>

            {/* Invoices Table */}
            <section>
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                  <Receipt className="text-slate-400" size={20} />
                  Recent Invoices
                </h2>
                {invoices.length > 0 && <button className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Download All</button>}
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#111722]">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#0B1120]">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Invoice ID</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">No invoices found. You are currently on the Free Starter plan.</td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-slate-300">{inv.id}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{inv.date}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-white">{inv.amount}</td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-slate-500 hover:text-cyan-400 transition-colors p-1 rounded hover:bg-slate-800">
                              <Download size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Column: Plan & Payment */}
          <div className="space-y-6">
            
            {/* Active Plan Card */}
            <section className="bg-gradient-to-br from-[#111722] to-[#0B1120] border border-slate-700 rounded-xl overflow-hidden shadow-2xl relative group">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-700">Active Plan</span>
              </div>
              <div className="p-6 pt-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 bg-opacity-10 
                  ${activePlan === 'starter' ? 'bg-slate-500 border-slate-600 text-slate-400' : 
                    activePlan === 'pro' ? 'bg-cyan-500 border-cyan-500/30 text-cyan-400' : 
                    'bg-purple-500 border-purple-500/30 text-purple-400'}`}>
                  <Zap size={24} />
                </div>
                <h3 className={`text-2xl font-bold font-display mb-1 ${currentPlanDetails.color}`}>{currentPlanDetails.name}</h3>
                <p className="text-slate-400 text-sm mb-6">
                  {activePlan === 'starter' ? 'Basic cryptographic limits for testing.' : 'Scalable security for production workflows.'}
                </p>
                
                <div className="pt-6 border-t border-slate-800/50 space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Monthly Price</span>
                    <span className="text-white font-bold">{currentPlanDetails.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Next Renewal</span>
                    <span className="text-white font-medium">{activePlan === 'starter' ? 'N/A' : new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</span>
                  </div>
                </div>

                <button onClick={() => setIsUpgradeModalOpen(true)} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700">
                  {activePlan === 'enterprise' ? 'Contact Sales' : 'Change Plan'}
                </button>
              </div>
            </section>

            {/* Payment Method */}
            {activePlan !== 'starter' && (
              <section className="bg-[#111722] border border-slate-800 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="text-lg font-bold mb-4 text-white">Payment Method</h3>
                <div className="flex items-center gap-4 p-4 border border-slate-700 bg-[#0B1120] rounded-lg">
                  <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center font-bold text-xs text-blue-900">
                    VISA
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white font-mono">•••• •••• •••• 4242</p>
                    <p className="text-xs text-slate-400">Expires 12/28</p>
                  </div>
                  <button className="text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider">Edit</button>
                </div>
              </section>
            )}

            {/* Overage Warning (Only shows if close to limit) */}
            {(proofPercentage > 80 || vaultPercentage > 80) && (
              <section className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 animate-in fade-in">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-bold text-amber-400 mb-1 text-sm">Approaching Limits</h4>
                    <p className="text-xs text-amber-200/70 leading-relaxed">
                      You have reached {Math.max(proofPercentage, vaultPercentage).toFixed(0)}% of your plan limits. Upgrade now to prevent infrastructure downtime.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* --- UPGRADE MODAL --- */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111722] border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0B1120]">
              <div>
                <h2 className="text-2xl font-bold text-white font-display">Select a Plan</h2>
                <p className="text-slate-400 text-sm mt-1">Scale your integrity infrastructure securely.</p>
              </div>
              <button onClick={() => setIsUpgradeModalOpen(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X size={20} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0B1120]">
              
              {/* STARTER */}
              <div className={`rounded-xl border-2 p-6 flex flex-col ${activePlan === 'starter' ? 'border-slate-500 bg-slate-800/30' : 'border-slate-800 bg-[#111722]'}`}>
                <h3 className="text-xl font-bold text-slate-300 mb-2">Starter</h3>
                <div className="text-3xl font-black text-white mb-6">$0<span className="text-sm font-medium text-slate-500">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-slate-500" /> 50 Cryptographic Proofs</li>
                  <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-slate-500" /> 50 MB Vault Storage</li>
                  <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-slate-500" /> Shared Public Ledger</li>
                </ul>
                <button 
                  onClick={() => handleUpgrade('starter')} disabled={activePlan === 'starter' || isProcessing}
                  className="w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 bg-slate-800 text-white hover:bg-slate-700 border border-slate-600"
                >
                  {isProcessing ? 'Processing...' : activePlan === 'starter' ? 'Current Plan' : 'Downgrade to Starter'}
                </button>
              </div>

              {/* PRO */}
              <div className={`rounded-xl border-2 p-6 flex flex-col relative ${activePlan === 'pro' ? 'border-cyan-500 bg-cyan-900/10' : 'border-slate-700 bg-[#111722]'}`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-[#0B1120] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Recommended</div>
                <h3 className="text-xl font-bold text-cyan-400 mb-2 mt-2">Professional</h3>
                <div className="text-3xl font-black text-white mb-6">$49<span className="text-sm font-medium text-slate-500">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-sm text-slate-200"><CheckCircle size={18} className="text-cyan-500" /> 5,000 Cryptographic Proofs</li>
                  <li className="flex gap-3 text-sm text-slate-200"><CheckCircle size={18} className="text-cyan-500" /> 100 GB Encrypted Vault</li>
                  <li className="flex gap-3 text-sm text-slate-200"><CheckCircle size={18} className="text-cyan-500" /> Automated Webhooks</li>
                </ul>
                <button 
                  onClick={() => handleUpgrade('pro')} disabled={activePlan === 'pro' || isProcessing}
                  className="w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  {isProcessing ? <Loader2 className="animate-spin mx-auto" /> : activePlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                </button>
              </div>

              {/* ENTERPRISE */}
              <div className={`rounded-xl border-2 p-6 flex flex-col ${activePlan === 'enterprise' ? 'border-purple-500 bg-purple-900/10' : 'border-slate-800 bg-[#111722]'}`}>
                <h3 className="text-xl font-bold text-purple-400 mb-2">Enterprise</h3>
                <div className="text-3xl font-black text-white mb-6">$1,250<span className="text-sm font-medium text-slate-500">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-purple-500" /> 100,000+ Cryptographic Proofs</li>
                  <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-purple-500" /> 2 TB+ Encrypted Vault</li>
                  <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-purple-500" /> Dedicated HSM Signatures</li>
                  <li className="flex gap-3 text-sm text-slate-300"><CheckCircle size={18} className="text-purple-500" /> Custom Layer 4 Anchoring</li>
                </ul>
                <button 
                  onClick={() => handleUpgrade('enterprise')} disabled={activePlan === 'enterprise' || isProcessing}
                  className="w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 bg-slate-800 text-white hover:bg-slate-700 border border-slate-600"
                >
                  {isProcessing ? 'Processing...' : activePlan === 'enterprise' ? 'Current Plan' : 'Contact Sales'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
