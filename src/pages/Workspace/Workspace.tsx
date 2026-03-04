import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Loader2, Plus } from 'lucide-react';
import { NewVersionModal } from '../../components/NewVersionModal';

export const Workspace = () => {
  const { id } = useParams();
  const [workItem, setWorkItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWorkItemData = async () => {
    if (!id) return;
    try {
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

      // Sort versions: newest first
      if (data.versions) {
        data.versions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      setWorkItem(data);
    } catch (err) {
      console.error('Error fetching workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkItemData();
  }, [id]);

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500 w-8 h-8" /></div>;
  if (!workItem) return <div className="p-10 text-white">WorkItem not found.</div>;

  const latestVersion = workItem.versions?.[0];
  const fileData = latestVersion?.evidence_hashes?.[0];
  
  // Data for the comparison tool
  const hasMultipleVersions = workItem.versions?.length > 1;
  const previousVersion = hasMultipleVersions ? workItem.versions[1] : null;
  const previousFileData = previousVersion?.evidence_hashes?.[0];

  const nextVersionNum = (workItem.versions?.length || 0) + 1;
  const nextTag = `v${nextVersionNum}.0`;

  return (
    <div className="min-h-full flex flex-col overflow-hidden font-sans text-[#E2E8F0] bg-[#0B0C10] relative">
      <style>{`
        .timeline-line::before {
          content: ''; position: absolute; top: 2rem; bottom: -1rem; left: 1.5rem; width: 2px; background: #2A2E3D; z-index: 0;
        }
        .timeline-item:last-child .timeline-line::before { display: none; }
      `}</style>
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(42, 46, 61, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(42, 46, 61, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <main className="flex-1 flex overflow-hidden z-10 relative">
        
        {/* Left Sidebar: Timeline */}
        <aside className="w-96 border-r border-[#2A2E3D] bg-[#0B0C10] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#2A2E3D] flex justify-between items-center shrink-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">Version Lineage</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-0">
            {workItem.versions?.map((version: any, index: number) => {
              const isLatest = index === 0;
              return (
                <div key={version.id} className="timeline-item relative pl-0 pb-8 group timeline-line">
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0 z-10 w-12 flex justify-center pt-1">
                      <div className={`w-8 h-8 rounded-full border-4 border-[#0B0C10] flex items-center justify-center text-white font-bold text-xs ${isLatest ? 'bg-[#3B82F6] shadow-[0_0_0_2px_#3B82F6]' : 'bg-[#2A2E3D]'}`}>
                        {version.version_tag}
                      </div>
                    </div>
                    <div className={`flex-1 rounded-lg p-3 relative ${isLatest ? 'bg-[#1F2230] border border-[#3B82F6] shadow-lg' : 'border border-[#2A2E3D] bg-[#14161F]'}`}>
                      {isLatest && <div className="absolute w-3 h-3 bg-[#1F2230] border-l border-b border-[#3B82F6] transform rotate-45 -left-1.5 top-3.5"></div>}
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-white truncate w-32">{version.evidence_hashes?.[0]?.file_name || 'Document'}</span>
                        <span className="text-[10px] font-mono text-[#10B981] bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-900">ANCHORED</span>
                      </div>
                      <div className="text-xs text-[#94A3B8]">{new Date(version.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Area: Version Details */}
        <section className="flex-1 flex flex-col overflow-y-auto bg-transparent">
          <div className="h-14 border-b border-[#2A2E3D] bg-[#14161F] px-6 flex justify-between items-center sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg">{workItem.name}</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">CURRENT: {latestVersion?.version_tag}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#0dccf2] hover:bg-cyan-400 text-[#0B1120] rounded transition-colors shadow-[0_0_15px_rgba(13,204,242,0.3)]">
                <Plus size={14} /> Add New Version
              </button>
            </div>
          </div>

          <div className="p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">
            
            {/* Top Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cryptographic Evidence */}
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
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap select-all">{fileData?.sha256_hash || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="group">
                    <label className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-semibold mb-1 block">Merkle Root</label>
                    <div className="flex items-center gap-2 bg-[#0B0C10] border border-[#2A2E3D] rounded p-2 font-mono text-xs text-blue-400">
                      <span className="material-symbols-outlined text-sm">hub</span>
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap select-all">{latestVersion?.merkle_root || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-[#14161F] border border-[#2A2E3D] rounded-xl overflow-hidden flex flex-col shadow-xl">
                <div className="px-5 py-3 border-b border-[#2A2E3D] bg-[#1F2230]/30 flex justify-between items-center">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3B82F6] text-sm">info</span>
                    Metadata
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-y-4 text-sm flex-1">
                  <div className="col-span-2 md:col-span-1">
                    <div className="text-[#94A3B8] text-[10px] uppercase">Original File Name</div>
                    <div className="font-mono mt-0.5 text-xs truncate w-48" title={fileData?.file_name}>{fileData?.file_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[#94A3B8] text-[10px] uppercase">File Size</div>
                    <div className="font-mono mt-0.5 text-xs">{fileData?.file_size || 0} Bytes</div>
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

            {/* --- RESTORED: Version Comparison Card --- */}
            {hasMultipleVersions ? (
              <div className="border border-[#2A2E3D] rounded-xl bg-[#14161F] overflow-hidden shadow-xl">
                <div className="px-5 py-3 border-b border-[#2A2E3D] bg-[#1F2230]/30 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3B82F6] text-sm">difference</span>
                    <h3 className="text-sm font-semibold">Version Comparison</h3>
                  </div>
                  <div className="text-xs text-[#94A3B8]">
                    Comparing <span className="text-white font-mono">{latestVersion.version_tag}</span> against <span className="text-white font-mono">{previousVersion.version_tag}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 divide-x divide-[#2A2E3D]">
                  <div className="p-5 bg-green-500/5">
                    <div className="text-xs font-bold text-[#10B981] mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">arrow_left</span> {latestVersion.version_tag} (Current)
                    </div>
                    <div className="space-y-4">
                      <div className="p-3 border border-green-500/30 bg-green-500/10 rounded-lg">
                        <div className="text-[10px] text-[#94A3B8] uppercase mb-1">Hash</div>
                        <div className="font-mono text-xs text-[#E2E8F0] break-all">{fileData?.sha256_hash}</div>
                      </div>
                      <div className="p-2">
                        <div className="text-[10px] text-[#94A3B8] uppercase mb-1">File Size</div>
                        <div className="font-mono text-xs text-[#E2E8F0]">{fileData?.file_size} Bytes</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-red-500/5">
                    <div className="text-xs font-bold text-red-400 mb-4 flex items-center justify-end gap-2">
                      {previousVersion.version_tag} <span className="material-symbols-outlined text-sm">arrow_right</span>
                    </div>
                    <div className="space-y-4 text-right">
                      <div className="p-3 border border-red-500/30 bg-red-500/10 rounded-lg text-left">
                        <div className="text-[10px] text-[#94A3B8] uppercase mb-1">Hash</div>
                        <div className="font-mono text-xs text-[#E2E8F0] break-all">{previousFileData?.sha256_hash}</div>
                      </div>
                      <div className="p-2">
                        <div className="text-[10px] text-[#94A3B8] uppercase mb-1">File Size</div>
                        <div className="font-mono text-xs text-[#E2E8F0]">{previousFileData?.file_size} Bytes</div>
                      </div>
                    </div>
                  </div>
                </div>
                {fileData?.sha256_hash !== previousFileData?.sha256_hash && (
                  <div className="px-5 py-3 bg-[#0B0C10] border-t border-[#2A2E3D] text-center">
                    <span className="text-xs text-[#94A3B8]">
                      Cryptographic difference detected. Hashes do not match.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-[#2A2E3D] border-dashed rounded-xl bg-[#14161F]/50 p-10 flex flex-col items-center justify-center text-[#94A3B8] text-center">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">compare</span>
                <h3 className="text-white font-semibold mb-1">No Comparison Available</h3>
                <p className="text-sm max-w-sm">This WorkItem only has one version. Click "Add New Version" in the top right to enable cryptographic comparison features.</p>
              </div>
            )}

            {/* --- RESTORED: Detailed Activity Log --- */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#94A3B8] text-sm">history</span>
                Asset Audit Trail
              </h3>
              
              <div className="relative ml-2">
                <div className="absolute left-[9px] top-2 bottom-2 w-px bg-[#2A2E3D]"></div>
                
                {workItem.versions?.map((version: any, index: number) => (
                  <div key={'audit-'+version.id} className="relative pl-10 pb-8 last:pb-0">
                    <div className={`absolute left-0 top-1 w-5 h-5 rounded-full bg-[#0B0C10] border flex items-center justify-center ${index === 0 ? 'border-[#3B82F6]' : 'border-[#2A2E3D]'}`}>
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#3B82F6]' : 'bg-[#94A3B8]'}`}></div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#14161F] p-4 rounded-lg border border-[#2A2E3D]">
                      <div>
                        <div className="text-sm text-[#E2E8F0] font-medium">Version {version.version_tag} Secured</div>
                        <div className="text-xs text-[#94A3B8] mt-1">Hash appended to cryptographic ledger</div>
                      </div>
                      <div className="text-xs font-mono text-[#94A3B8] bg-[#0B0C10] px-2 py-1 rounded border border-[#2A2E3D]">
                        {new Date(version.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="relative pl-10 pt-8">
                  <div className="absolute left-0 top-9 w-5 h-5 rounded-full bg-[#0B0C10] border border-[#10B981] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-900/10 p-4 rounded-lg border border-emerald-900/30">
                    <div>
                      <div className="text-sm text-emerald-400 font-medium">WorkItem Initialized</div>
                      <div className="text-xs text-emerald-600/80 mt-1">Project container created</div>
                    </div>
                    <div className="text-xs font-mono text-emerald-600/80">
                      {new Date(workItem.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>
      </main>

      <NewVersionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchWorkItemData}
        workItemId={workItem.id}
        workspaceId={workItem.workspace_id}
        nextVersionTag={nextTag}
      />
    </div>
  );
};
