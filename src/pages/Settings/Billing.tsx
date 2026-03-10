import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  CreditCard, BarChart3, Receipt, Download, 
  ShieldAlert, HardDrive, Fingerprint, Zap, Loader2
} from 'lucide-react';

export const Billing = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Real Database Metrics
  const [proofCount, setProofCount] = useState(0);
  const [vaultBytes, setVaultBytes] = useState(0);

  // Enterprise Quotas (Mocked limits for the UI)
  const PROOF_LIMIT = 10000;
  const VAULT_LIMIT_BYTES = 2 * 1024 * 1024 * 1024 * 1024; // 2 TB

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return;
      try {
        // 1. Get total cryptographic proofs generated
        const { count } = await supabase
          .from('versions')
          .select('*', { count: 'exact', head: true });
        
        setProofCount(count || 0);

        // 2. Get total vault storage used (sum of file_size where storage_path exists)
        const { data: files } = await supabase
          .from('evidence_hashes')
          .select('file_size')
          .not('storage_path', 'is', null);

        if (files) {
          const totalBytes = files.reduce((acc, curr) => acc + Number(curr.file_size), 0);
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

  // Helper to format bytes cleanly (e.g., MB, GB)
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calculate Percentages
  const proofPercentage = Math.min((proofCount / PROOF_LIMIT) * 100, 100);
  const vaultPercentage = Math.min((vaultBytes / VAULT_LIMIT_BYTES) * 100, 100);

  // Mock Invoice Data
  const invoices = [
    { id: 'INV-2026-1012', date: 'Oct 12, 2026', status: 'Paid', amount: '$1,250.00' },
    { id: 'INV-2026-0912', date: 'Sep 12, 2026', status: 'Paid', amount: '$1,250.00' },
    { id: 'INV-2026-0812', date: 'Aug 12, 2026', status: 'Paid', amount: '$1,420.00' },
  ];

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
                      <p className="text-sm font-bold text-white">{proofCount} <span className="text-slate-500 font-normal">/ {PROOF_LIMIT}</span></p>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(proofPercentage, 1)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500">{proofPercentage.toFixed(2)}% of monthly quota used</p>
                  </div>

                  {/* Storage Usage */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                        <HardDrive size={16} /> Zero-Knowledge Vault
                      </div>
                      <p className="text-sm font-bold text-white">{formatBytes(vaultBytes)} <span className="text-slate-500 font-normal">/ 2 TB</span></p>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(vaultPercentage, 1)}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500">{vaultPercentage.toFixed(4)}% of storage used</p>
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
                <button className="text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">Download All</button>
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
                    {invoices.map((inv) => (
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
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right Column: Plan & Payment */}
          <div className="space-y-6">
            
            {/* Active Plan Card (Premium Design) */}
            <section className="bg-gradient-to-br from-[#111722] to-[#0B1120] border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.1)] relative group">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-cyan-500/30">Active Plan</span>
              </div>
              <div className="p-6 pt-10">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20 mb-4">
                  <Zap className="text-cyan-400" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-white font-display mb-1">Enterprise Pro</h3>
                <p className="text-slate-400 text-sm mb-6">Scalable security for high-growth engineering teams.</p>
                
                <div className="pt-6 border-t border-slate-800/50 space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Monthly Price</span>
                    <span className="text-white font-bold">$1,250.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Next Renewal</span>
                    <span className="text-white font-medium">Nov 12, 2026</span>
                  </div>
                </div>

                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-700">
                  Upgrade Plan
                </button>
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-[#111722] border border-slate-800 rounded-xl p-6">
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

            {/* Overage Warning */}
            <section className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-bold text-amber-400 mb-1 text-sm">Overage Protection</h4>
                  <p className="text-xs text-amber-200/70 leading-relaxed">
                    We automatically scale your infrastructure if you exceed 10,000 proofs to prevent downtime. <a href="#" className="underline hover:text-amber-400">View pricing tiers</a>.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
