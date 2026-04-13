import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { Loader2, Plus, Download, Lock, X } from 'lucide-react';
import { NewVersionModal } from '../../components/NewVersionModal';
import { decryptFile } from '../../utils/crypto';
import toast from 'react-hot-toast';
import type { WorkItem } from '../../types';

export const Workspace = () => {
  const { id } = useParams();
  const [workItem, setWorkItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  // Decrypt Modal States
  const [downloadPassword, setDownloadPassword] = useState('');
  const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const fetchWorkItemData = async (isBackground = false) => {
    if (!id) return;
    if (!isBackground) setLoading(true); // Only show full-screen loader on initial visit
    
    try {
      const { data, error } = await supabase
        .from('work_items')
        .select(`*, versions (*, evidence_hashes (*))`)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data.versions && data.versions.length > 0) {
        data.versions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (!selectedVersionId) {
          setSelectedVersionId(data.versions[0].id);
        }
      }

      setWorkItem(data);
    } catch (err) {
      console.error('Error fetching workspace:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkItemData();
  }, [id]);

  if (loading && !workItem) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-tertiary w-8 h-8" /></div>;
  if (!workItem) return <div className="p-10 text-white">WorkItem not found.</div>;

  const activeVersionIndex = workItem.versions?.findIndex((v: any) => v.id === selectedVersionId) ?? 0;
  const activeVersion = workItem.versions?.[activeVersionIndex];
  const fileData = activeVersion?.evidence_hashes?.[0];
  
  const previousVersion = activeVersionIndex + 1 < (workItem.versions?.length || 0) ? workItem.versions![activeVersionIndex + 1] : null;
  const previousFileData = previousVersion?.evidence_hashes?.[0];
  const hasPreviousVersion = !!previousVersion;

  const nextVersionNum = (workItem.versions?.length || 0) + 1;
  const nextTag = `v${nextVersionNum}.0`;

  // --- DOWNLOAD LOGIC ---
  const triggerDownloadProcess = async () => {
    if (!fileData?.storage_path) return;
    if (fileData.is_encrypted) {
      setIsDecryptModalOpen(true);
    } else {
      await executeDownload(false);
    }
  };

  const executeDownload = async (isEncrypted: boolean) => {
    try {
      setIsDecrypting(true);
      const { data, error } = await supabase.storage.from('vault').download(fileData!.storage_path!);
      if (error || !data) throw error || new Error("Download failed");

      let finalBlob = data;
      if (isEncrypted) {
        finalBlob = await decryptFile(data, downloadPassword);
      }

      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileData!.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsDecryptModalOpen(false);
      setDownloadPassword('');
    } catch (err: any) {
      console.error("Download/Decrypt failed", err);
      toast.error("Failed to decrypt. Incorrect password or corrupted file.");
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col overflow-hidden font-sans text-[#E2E8F0] bg-[#0B0C10] relative">
      <style>{`.timeline-line::before { content: ''; position: absolute; top: 2rem; bottom: -1rem; left: 1.5rem; width: 2px; background: #2A2E3D; z-index: 0; } .timeline-item:last-child .timeline-line::before { display: none; }`}</style>
      
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(42, 46, 61, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(42, 46, 61, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <main className="flex-1 flex overflow-hidden z-10 relative">
        <aside className="w-96 border-r border-[#2A2E3D] bg-[#0B0C10] flex flex-col shrink-0">
          <div className="p-4 border-b border-[#2A2E3D] flex justify-between items-center shrink-0">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#94A3B8]">Version Lineage</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-0">
            {workItem.versions?.map((version: any, index: number) => {
              const isSelected = version.id === selectedVersionId;
              const isLatest = index === 0;
              return (
                <div key={version.id} onClick={() => setSelectedVersionId(version.id)} className="timeline-item relative pl-0 pb-8 group timeline-line cursor-pointer">
                  <div className="flex gap-4">
                    <div className="relative flex-shrink-0 z-10 w-12 flex justify-center pt-1">
                      <div className={`w-8 h-8 rounded-full border-4 border-[#0B0C10] flex items-center justify-center text-white font-bold text-xs transition-all duration-200 ${isSelected ? 'bg-[#3B82F6] shadow-[0_0_0_2px_#3B82F6]' : 'bg-[#2A2E3D] group-hover:bg-[#475569]'}`}>
                        {version.version_tag}
                      </div>
                    </div>
                    <div className={`flex-1 rounded-lg p-3 relative transition-all duration-200 ${isSelected ? 'bg-[#1F2230] border border-[#3B82F6] shadow-lg' : 'border border-[#2A2E3D] bg-[#14161F] hover:border-[#475569]'}`}>
                      {isSelected && <div className="absolute w-3 h-3 bg-[#1F2230] border-l border-b border-[#3B82F6] transform rotate-45 -left-1.5 top-3.5"></div>}
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-sm text-white truncate w-32">{version.evidence_hashes?.[0]?.file_name || 'Document'}</span>
                        {isLatest && <span className="text-[10px] font-mono text-[#10B981] bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-900">LATEST</span>}
                      </div>
                      <div className="text-xs text-[#94A3B8]">{new Date(version.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="flex-1 flex flex-col overflow-y-auto bg-transparent">
          <div className="h-14 border-b border-[#2A2E3D] bg-[#14161F] px-6 flex justify-between items-center sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-lg">{workItem.name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${activeVersionIndex === 0 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-surface-variant text-on-surface border-outline'}`}>
                VIEWING: {activeVersion?.version_tag}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {fileData?.storage_path && (
                <button onClick={triggerDownloadProcess} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-on-surface hover:text-white border border-outline-variant bg-surface-variant hover:bg-slate-700 rounded transition-colors">
                  <Download size={14} /> Download {fileData.is_encrypted && <Lock size={12} className="ml-1 text-tertiary" />}
                </button>
              )}
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#ffb148] hover:bg-tertiary text-[#0e0e0e] rounded transition-colors shadow-[0_0_15px_rgba(13,204,242,0.3)]">
                <Plus size={14} /> Add New Version
              </button>
            </div>
          </div>

          <div className="p-8 max-w-7xl mx-auto w-full space-y-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cryptographic Evidence Card */}
              <div className="bg-[#14161F] border border-[#2A2E3D] rounded-xl overflow-hidden shadow-xl">
                <div className="px-5 py-3 border-b border-[#2A2E3D] bg-[#1F2230]/30 flex justify-between items-center">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3B82F6] text-sm">fingerprint</span> Cryptographic Evidence
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
                      <span className="overflow-hidden text-ellipsis whitespace-nowrap select-all">{activeVersion?.merkle_root || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata Card */}
              <div className="bg-[#14161F] border border-[#2A2E3D] rounded-xl overflow-hidden flex flex-col shadow-xl">
                <div className="px-5 py-3 border-b border-[#2A2E3D] bg-[#1F2230]/30 flex justify-between items-center">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3B82F6] text-sm">info</span> Metadata
                  </h3>
                </div>
                <div className="p-5 grid grid-cols-2 gap-y-4 text-sm flex-1">
                  <div className="col-span-2 md:col-span-1">
                    <div className="text-[#94A3B8] text-[10px] uppercase">Original File Name</div>
                    <div className="font-mono mt-0.5 text-xs truncate w-48">{fileData?.file_name || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-[#94A3B8] text-[10px] uppercase">File Size</div>
                    <div className="font-mono mt-0.5 text-xs">{fileData?.file_size || 0} Bytes</div>
                  </div>
                  <div>
                    <div className="text-[#94A3B8] text-[10px] uppercase">Record ID</div>
                    <div className="font-mono mt-0.5 text-xs truncate w-32">{workItem.id.split('-')[0]}</div>
                  </div>
                </div>
              </div>
            </div>

            {hasPreviousVersion ? (
              <div className="border border-[#2A2E3D] rounded-xl bg-[#14161F] overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="px-5 py-3 border-b border-[#2A2E3D] bg-[#1F2230]/30 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#3B82F6] text-sm">difference</span>
                    <h3 className="text-sm font-semibold">Version Comparison</h3>
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-[#2A2E3D]">
                  <div className="p-5 bg-green-500/5">
                    <div className="text-xs font-bold text-[#10B981] mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-sm">arrow_left</span> {activeVersion?.version_tag}</div>
                    <div className="space-y-4">
                      <div className="p-3 border border-green-500/30 bg-green-500/10 rounded-lg">
                        <div className="text-[10px] text-[#94A3B8] uppercase mb-1">Hash</div>
                        <div className="font-mono text-xs text-[#E2E8F0] break-all">{fileData?.sha256_hash}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 bg-red-500/5">
                    <div className="text-xs font-bold text-red-400 mb-4 flex items-center justify-end gap-2">{previousVersion.version_tag} <span className="material-symbols-outlined text-sm">arrow_right</span></div>
                    <div className="space-y-4 text-right">
                      <div className="p-3 border border-red-500/30 bg-red-500/10 rounded-lg text-left">
                        <div className="text-[10px] text-[#94A3B8] uppercase mb-1">Hash</div>
                        <div className="font-mono text-xs text-[#E2E8F0] break-all">{previousFileData?.sha256_hash}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-[#2A2E3D] border-dashed rounded-xl bg-[#14161F]/50 p-10 flex flex-col items-center justify-center text-[#94A3B8] text-center">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">history_toggle_off</span>
                <h3 className="text-white font-semibold mb-1">Genesis Block</h3>
                <p className="text-sm max-w-sm">This is the initial upload. No preceding versions exist to compare.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* NEW VERSION MODAL */}
      <NewVersionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setSelectedVersionId(null); 
          fetchWorkItemData(true); // Passing true triggers a "soft refresh" in the background
        }}
        workItemId={workItem.id}
        workspaceId={workItem.workspace_id}
        nextVersionTag={nextTag}
      />

      {/* DECRYPT MODAL */}
      {isDecryptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-low border border-surface-variant rounded-xl shadow-2xl w-full max-w-sm p-6 relative">
            <button onClick={() => {setIsDecryptModalOpen(false); setDownloadPassword('');}} className="absolute top-4 right-4 text-on-surface-variant hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Lock size={20} className="text-tertiary" /> Encrypted Vault
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">Enter the vault password to decrypt this file locally.</p>
            <input 
              type="password" value={downloadPassword} onChange={e => setDownloadPassword(e.target.value)}
              placeholder="Vault Password"
              className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-white outline-none focus:border-tertiary mb-4"
            />
            <button 
              onClick={() => executeDownload(true)} disabled={!downloadPassword || isDecrypting}
              className="w-full bg-tertiary hover:bg-tertiary disabled:opacity-50 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2"
            >
              {isDecrypting ? <><Loader2 size={16} className="animate-spin" /> Decrypting...</> : 'Unlock & Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
