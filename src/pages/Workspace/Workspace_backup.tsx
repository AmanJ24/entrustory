import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Loader2 } from 'lucide-react';

export const Workspace = () => {
  const { id } = useParams();
  const [workItem, setWorkItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkItemData = async () => {
      if (!id) return;
      try {
        // Deep query: Fetch WorkItem -> Versions -> Evidence Hashes
        const { data, error } = await supabase
          .from('work_items')
          .select(`
            *,
            versions (
              *,
              evidence_hashes (*)
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setWorkItem(data);
      } catch (err) {
        console.error('Error fetching workspace:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkItemData();
  }, [id]);

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-cyan-500" /></div>;
  if (!workItem) return <div className="p-10 text-white">WorkItem not found.</div>;

  // Assuming we are viewing the latest version for now
  const latestVersion = workItem.versions?.[0];
  const fileData = latestVersion?.evidence_hashes?.[0];

  return (
    <div className="min-h-full flex flex-col overflow-hidden font-sans text-[#E2E8F0] bg-[#0B0C10] relative">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(42, 46, 61, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(42, 46, 61, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <main className="flex-1 flex overflow-hidden z-10 relative">
        
        {/* Left Sidebar: Timeline */}
        <aside className="w-96 border-r border-[#2A2E3D] bg-[#0B0C10] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#2A2E3D] flex justify-between items-center shrink-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">Version Lineage</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-0">
            {workItem.versions?.map((version: any, index: number) => (
              <div key={version.id} className="relative pl-0 pb-8 group">
                <div className="flex gap-4">
                  <div className="relative flex-shrink-0 z-10 w-12 flex justify-center pt-1">
                    <div className={`w-8 h-8 rounded-full border-4 border-[#0B0C10] flex items-center justify-center text-white font-bold text-xs ${index === 0 ? 'bg-[#3B82F6] shadow-[0_0_0_2px_#3B82F6]' : 'bg-[#2A2E3D]'}`}>
                      {version.version_tag}
                    </div>
                  </div>
                  <div className={`flex-1 rounded-lg p-3 relative ${index === 0 ? 'bg-[#1F2230] border border-[#3B82F6] shadow-lg' : 'border border-[#2A2E3D] bg-[#14161F]'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-white">{workItem.name}</span>
                      <span className="text-[10px] font-mono text-[#10B981] bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-900">ANCHORED</span>
                    </div>
                    <div className="text-xs text-[#94A3B8] mb-2">{new Date(version.created_at).toUTCString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Area: Version Details */}
        <section className="flex-1 flex flex-col overflow-y-auto bg-transparent">
          <div className="h-14 border-b border-[#2A2E3D] bg-[#14161F] px-6 flex justify-between items-center sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg">{workItem.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">CURRENT</span>
            </div>
          </div>

          <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Cryptographic Evidence Card */}
              <div className="bg-[#14161F] border border-[#2A2E3D] rounded-xl overflow-hidden shadow-xl">
                <div className="px-5 py-3 border-b border-[#2A2E3D] bg-[#1F2230]/30 flex justify-between items-center">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3B82F6] text-sm">fingerprint</span>
                    Cryptographic Evidence
                  </h3>
                  <span className="text-[10px] text-[#94A3B8] font-mono">SHA-256</span>
                </div>
                <div className="p-5 space-y-5">
                  <div className="group">
                    <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-semibold mb-1 block">File Hash (Leaf Node)</label>
                    <div className="flex items-center gap-2 bg-[#0B0C10] border border-[#2A2E3D] rounded p-2 font-mono text-xs text-[#10B981]">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap select-all">{fileData?.sha256_hash}</span>
                    </div>
                  </div>
                  <div className="group">
                    <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-semibold mb-1 block">Merkle Root</label>
                    <div className="flex items-center gap-2 bg-[#0B0C10] border border-[#2A2E3D] rounded p-2 font-mono text-xs text-blue-400">
                      <span className="material-symbols-outlined text-sm">hub</span>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap select-all">{latestVersion?.merkle_root}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata Card */}
              <div className="bg-[#14161F] border border-[#2A2E3D] rounded-xl overflow-hidden flex flex-col shadow-xl">
                <div className="px-5 py-3 border-b border-[#2A2E3D] bg-[#1F2230]/30 flex justify-between items-center">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3B82F6] text-sm">info</span>
                    Metadata
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-y-4 text-sm flex-1">
                  <div>
                    <div className="text-[#94A3B8] text-[10px] uppercase">Original File Name</div>
                    <div className="font-mono mt-0.5 text-xs truncate w-40">{fileData?.file_name}</div>
                  </div>
                  <div>
                    <div className="text-[#94A3B8] text-[10px] uppercase">File Size</div>
                    <div className="font-mono mt-0.5 text-xs">{fileData?.file_size} Bytes</div>
                  </div>
                  <div>
                    <div className="text-[#94A3B8] text-[10px] uppercase">Record ID</div>
                    <div className="font-mono mt-0.5 text-xs truncate w-32">{workItem.id.split('-')[0]}</div>
                  </div>
                  <div>
                    <div className="text-[#94A3B8] text-[10px] uppercase">Status</div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-[#10B981] text-xs border border-green-500/20 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> DB Secured
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
