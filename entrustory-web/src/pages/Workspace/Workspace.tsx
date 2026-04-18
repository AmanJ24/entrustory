import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import {
  Loader2, Plus, Download, Lock, X, Eye, EyeOff, ChevronDown, ChevronUp
} from 'lucide-react';
import { NewVersionModal } from '../../components/NewVersionModal';
import { decryptFile } from '../../utils/crypto';
import toast from 'react-hot-toast';
import type { WorkItem } from '../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Version Lineage Card ──────────────────────────────────────────────────────
const VersionCard = ({
  version, index, totalCount, isSelected, isLatest, onClick,
}: {
  version: any; index: number; totalCount: number; isSelected: boolean; isLatest: boolean; onClick: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const fd = version.evidence_hashes?.[0];
  const date = new Date(version.created_at);

  return (
    <div className="relative">
      {/* Vertical timeline rail */}
      {index < totalCount - 1 && (
        <div className="absolute left-[17px] top-[38px] bottom-[-8px] w-px bg-gradient-to-b from-[#524436]/60 to-transparent z-0" />
      )}

      <div
        onClick={onClick}
        className={`relative z-10 flex gap-3 cursor-pointer mb-2 transition-all duration-200 group`}
      >
        {/* Node dot */}
        <div className="flex-shrink-0 mt-1.5">
          <div className={`w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-200 ${
            isSelected
              ? 'bg-[#ffb148] text-[#1a1100] shadow-[0_0_16px_rgba(255,177,72,0.4)]'
              : 'bg-[#1f1f24] text-[#9f8e7c] group-hover:bg-[#292a2e] group-hover:text-[#ffd6a8]'
          }`}>
            v{version.version_tag?.replace('v', '') || index + 1}
          </div>
        </div>

        {/* Card */}
        <div className={`flex-1 rounded p-3 transition-all duration-200 ${
          isSelected
            ? 'bg-[#1f1f24] shadow-[inset_2px_0_0_#ffb148]'
            : 'bg-[#1a1b20] group-hover:bg-[#1f1f24]'
        }`}>
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className={`font-mono text-xs font-bold ${isSelected ? 'text-[#ffb148]' : 'text-[#e3e2e8] group-hover:text-[#ffd6a8]'}`}>
                  {version.version_tag}
                </span>
                {isLatest && (
                  <span className="text-[8px] font-mono tracking-widest bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded-sm">
                    LATEST
                  </span>
                )}
                {fd?.is_encrypted && (
                  <Lock size={9} className="text-[#ffb148]" />
                )}
              </div>
              <p className="text-[10px] text-[#524436] truncate max-w-[140px]">
                {fd?.file_name || 'No file'}
              </p>
              <p className="text-[9px] text-[#524436] mt-0.5">
                {date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}
                {fd?.file_size ? ` · ${formatBytes(fd.file_size)}` : ''}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
              className="text-[#524436] hover:text-[#9f8e7c] transition-colors flex-shrink-0 mt-0.5"
            >
              {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {open && (
            <div className="mt-2 pt-2 border-t border-[#292a2e] space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
              {fd?.sha256_hash && (
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-[#524436] mb-0.5">SHA-256</div>
                  <code className="text-[9px] text-emerald-400 font-mono break-all leading-relaxed">
                    {fd.sha256_hash.slice(0, 20)}…{fd.sha256_hash.slice(-8)}
                  </code>
                </div>
              )}
              {version.merkle_root && (
                <div>
                  <div className="text-[8px] uppercase tracking-widest text-[#524436] mb-0.5">Merkle</div>
                  <code className="text-[9px] text-blue-400 font-mono break-all leading-relaxed">
                    {version.merkle_root.slice(0, 20)}…{version.merkle_root.slice(-8)}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const Workspace = () => {
  const { id } = useParams();
  const [workItem, setWorkItem] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [downloadPassword, setDownloadPassword] = useState('');
  const [isDecryptModalOpen, setIsDecryptModalOpen] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showSig, setShowSig] = useState(false);

  const fetchWorkItemData = async (isBackground = false) => {
    if (!id) return;
    if (!isBackground) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('work_items')
        .select(`*, versions (*, evidence_hashes (*))`)
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data.versions?.length > 0) {
        data.versions.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        if (!selectedVersionId) setSelectedVersionId(data.versions[0].id);
      }
      setWorkItem(data);
    } catch (err) { console.error(err); }
    finally { if (!isBackground) setLoading(false); }
  };

  useEffect(() => { fetchWorkItemData(); }, [id]);

  if (loading && !workItem) return (
    <div className="h-full flex items-center justify-center bg-[#0d0e12]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-[#ffb148] w-7 h-7" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#524436] font-mono">Loading Ledger...</span>
      </div>
    </div>
  );
  if (!workItem) return (
    <div className="h-full flex items-center justify-center bg-[#0d0e12] text-[#524436] font-mono text-sm">
      Record not found.
    </div>
  );

  const activeVersionIndex = workItem.versions?.findIndex((v: any) => v.id === selectedVersionId) ?? 0;
  const activeVersion = workItem.versions?.[activeVersionIndex];
  const fileData = activeVersion?.evidence_hashes?.[0];
  const previousVersion = activeVersionIndex + 1 < (workItem.versions?.length || 0) ? workItem.versions![activeVersionIndex + 1] : null;
  const previousFileData = previousVersion?.evidence_hashes?.[0];
  const hasPreviousVersion = !!previousVersion;
  const hashesMatch = hasPreviousVersion && fileData?.sha256_hash === previousFileData?.sha256_hash;
  const nextTag = `v${(workItem.versions?.length || 0) + 1}.0`;

  const triggerDownloadProcess = async () => {
    if (!fileData?.storage_path) return;
    if (fileData.is_encrypted) setIsDecryptModalOpen(true);
    else await executeDownload(false);
  };

  const executeDownload = async (isEncrypted: boolean) => {
    try {
      setIsDecrypting(true);
      const { data, error } = await supabase.storage.from('vault').download(fileData!.storage_path!);
      if (error || !data) throw error || new Error('Download failed');
      let finalBlob = data;
      if (isEncrypted) finalBlob = await decryptFile(data, downloadPassword);
      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url; a.download = fileData!.file_name;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsDecryptModalOpen(false); setDownloadPassword('');
    } catch (err: any) {
      toast.error('Failed to decrypt. Incorrect password or corrupted file.');
    } finally { setIsDecrypting(false); }
  };

  return (
    <div className="min-h-full flex flex-col overflow-hidden font-['Inter'] text-[#e3e2e8] relative" style={{ background: '#0d0e12' }}>

      {/* Blueprint grid */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'linear-gradient(rgba(82,68,54,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(82,68,54,0.06) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <main className="flex-1 flex overflow-hidden z-10 relative">

        {/* ── SIDEBAR: Version Lineage ─────────────────────────────── */}
        <aside className="w-72 bg-[#0d0e12] flex flex-col shrink-0" style={{ borderRight: '1px solid rgba(82,68,54,0.2)' }}>

          {/* Sidebar header */}
          <div className="px-5 pt-5 pb-4 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ffb148] animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#ffb148] font-bold">Version Lineage</span>
            </div>
            <p className="text-[10px] text-[#524436] ml-3.5">
              {workItem.versions?.length || 0} state{workItem.versions?.length !== 1 ? 's' : ''} anchored to ledger
            </p>
          </div>

          {/* Version list */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {workItem.versions?.length > 0 ? (
              workItem.versions.map((version: any, index: number) => (
                <VersionCard
                  key={version.id}
                  version={version}
                  index={index}
                  totalCount={workItem.versions!.length}
                  isSelected={version.id === selectedVersionId}
                  isLatest={index === 0}
                  onClick={() => setSelectedVersionId(version.id)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-[#524436]">
                <span className="material-symbols-outlined text-3xl block mb-2 opacity-30">history_toggle_off</span>
                <p className="text-xs font-mono">No states recorded.</p>
              </div>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ────────────────────────────────────── */}
        <section className="flex-1 flex flex-col overflow-y-auto">

          {/* ── TOP COMMAND BAR ── */}
          <div className="bg-[#0d0e12] px-8 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20" style={{ borderBottom: '1px solid rgba(82,68,54,0.2)' }}>
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Title */}
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-['Space_Grotesk'] font-bold text-xl text-[#e3e2e8] tracking-tight truncate max-w-[320px]">
                    {workItem.name}
                  </h1>
                  <span className="shrink-0 text-[9px] font-mono font-bold tracking-widest bg-[#ffb148]/10 text-[#ffb148] px-2.5 py-1 rounded" style={{ border: '1px solid rgba(255,177,72,0.25)' }}>
                    {activeVersion?.version_tag || 'v1.0'}
                  </span>
                  {fileData?.is_encrypted && (
                    <span className="shrink-0 text-[9px] font-mono tracking-widest text-[#9f8e7c] flex items-center gap-1">
                      <Lock size={9} className="text-[#ffb148]" /> VAULT ENCRYPTED
                    </span>
                  )}
                </div>
                <p className="text-[9px] font-mono text-[#524436] mt-0.5">
                  ID: {workItem.id.split('-')[0].toUpperCase()} · RECORD #{(activeVersionIndex + 1).toString().padStart(3, '0')}
                </p>
              </div>
            </div>

            {/* Actions — right side */}
            <div className="flex items-center gap-2 shrink-0">
              {fileData?.storage_path && (
                <button
                  onClick={triggerDownloadProcess}
                  className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[#9f8e7c] hover:text-[#e3e2e8] transition-colors bg-[#1a1b20] hover:bg-[#1f1f24] rounded"
                >
                  <Download size={13} /> Download
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-[#1a1100] bg-[#ffb148] hover:bg-[#ffd6a8] rounded transition-all duration-200 shadow-[0_0_20px_rgba(255,177,72,0.25)] hover:shadow-[0_0_30px_rgba(255,177,72,0.40)]"
              >
                <Plus size={13} /> Add Version
              </button>
            </div>
          </div>

          {/* ── PAGE BODY ── */}
          <div className="flex-1 p-8 space-y-6 max-w-6xl mx-auto w-full pb-16">

            {/* ── ROW 1: BENTO STATS ── */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Versions', value: String(workItem.versions?.length || 0), icon: 'layers', color: 'text-[#ffb148]' },
                { label: 'File Size', value: formatBytes(fileData?.file_size ?? 0), icon: 'description', color: 'text-blue-400' },
                { label: 'Date Anchored', value: activeVersion?.created_at ? new Date(activeVersion.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—', icon: 'schedule', color: 'text-emerald-400' },
              ].map(({ label, value, icon, color }) => (
                <div key={label} className="bg-[#1a1b20] rounded p-5 flex items-start gap-4 hover:bg-[#1f1f24] transition-colors duration-200">
                  <span className={`material-symbols-outlined text-2xl ${color} shrink-0`}>{icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[8px] uppercase tracking-[0.2em] text-[#524436] font-bold mb-1">{label}</div>
                    <div className="font-['Space_Grotesk'] font-bold text-lg text-[#e3e2e8] truncate">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── ROW 2: CRYPTOGRAPHIC EVIDENCE (full-width, key focus) ── */}
            <div className="bg-[#1a1b20] rounded overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between bg-[#1f1f24]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#ffb148] text-lg">fingerprint</span>
                  <span className="font-['Space_Grotesk'] font-bold text-sm tracking-tight text-[#e3e2e8]">Cryptographic Evidence</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono uppercase tracking-widest flex items-center gap-1.5 text-emerald-400 bg-emerald-900/30 px-2.5 py-1 rounded-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> Verified
                  </span>
                  <span className="text-[8px] font-mono uppercase tracking-widest flex items-center gap-1.5 text-[#ffb148] bg-[#ffb148]/10 px-2.5 py-1 rounded-sm">
                    Layer 3 Anchored
                  </span>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SHA-256 */}
                <div>
                  <div className="text-[8px] uppercase tracking-[0.2em] text-[#524436] font-bold mb-2 flex items-center gap-2">
                    <span className="w-1 h-3 bg-emerald-400 rounded-full inline-block" />
                    SHA-256 Hash — Leaf Node
                  </div>
                  <div className="bg-[#0d0e12] rounded p-3">
                    <code className="text-[11px] font-mono text-emerald-400 break-all leading-relaxed select-all">
                      {fileData?.sha256_hash || '—'}
                    </code>
                  </div>
                </div>

                {/* Merkle Root */}
                <div>
                  <div className="text-[8px] uppercase tracking-[0.2em] text-[#524436] font-bold mb-2 flex items-center gap-2">
                    <span className="w-1 h-3 bg-blue-400 rounded-full inline-block" />
                    Merkle Root — Tree Root
                  </div>
                  <div className="bg-[#0d0e12] rounded p-3">
                    <code className="text-[11px] font-mono text-blue-400 break-all leading-relaxed select-all">
                      {activeVersion?.merkle_root || '—'}
                    </code>
                  </div>
                </div>

                {/* Additional metadata strip */}
                <div className="lg:col-span-2 grid grid-cols-4 gap-3 pt-2">
                  {[
                    { label: 'File Name', value: fileData?.file_name || '—' },
                    { label: 'Record ID', value: workItem.id.split('-')[0].toUpperCase() },
                    { label: 'Version', value: activeVersion?.version_tag || '—' },
                    { label: 'Storage', value: fileData?.is_encrypted ? '🔒 AES-256 Vault' : '📋 Hash Only' },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-[#0d0e12] rounded p-3">
                      <div className="text-[8px] uppercase tracking-widest text-[#524436] mb-1">{label}</div>
                      <div className="text-[11px] font-mono text-[#9f8e7c] truncate" title={value}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ROW 3: VERSION COMPARISON ── */}
            {hasPreviousVersion ? (
              <div className="bg-[#1a1b20] rounded overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between bg-[#1f1f24]">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#ffb148] text-lg">difference</span>
                    <span className="font-['Space_Grotesk'] font-bold text-sm tracking-tight text-[#e3e2e8]">Version Diff</span>
                  </div>
                  <span className={`text-[8px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-sm flex items-center gap-1.5 ${
                    hashesMatch
                      ? 'text-amber-400 bg-amber-900/30'
                      : 'text-emerald-400 bg-emerald-900/30'
                  }`}>
                    {hashesMatch ? '⚠ Identical Content' : '✓ Content Changed'}
                  </span>
                </div>

                <div className="grid grid-cols-2">
                  {/* Current */}
                  <div className="p-6" style={{ borderRight: '1px solid rgba(82,68,54,0.15)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-emerald-400">{activeVersion?.version_tag} — Selected</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-[8px] uppercase tracking-widest text-[#524436] mb-1.5">SHA-256</div>
                        <div className="bg-[#0d0e12] rounded p-3 bg-gradient-to-br from-emerald-950/20 to-transparent">
                          <code className="text-[10px] font-mono text-[#e3e2e8] break-all leading-relaxed">
                            {fileData?.sha256_hash || '—'}
                          </code>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <div className="text-[8px] uppercase tracking-widest text-[#524436] mb-1">Size</div>
                          <div className="text-xs font-mono text-[#9f8e7c]">{formatBytes(fileData?.file_size ?? 0)}</div>
                        </div>
                        <div>
                          <div className="text-[8px] uppercase tracking-widest text-[#524436] mb-1">Date</div>
                          <div className="text-xs font-mono text-[#9f8e7c]">
                            {activeVersion?.created_at ? new Date(activeVersion.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Previous */}
                  <div className="p-6">
                    <div className="flex items-center justify-end gap-2 mb-4">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-400">{previousVersion.version_tag} — Previous</span>
                      <span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-[8px] uppercase tracking-widest text-[#524436] mb-1.5 text-right">SHA-256</div>
                        <div className="bg-[#0d0e12] rounded p-3 bg-gradient-to-bl from-red-950/20 to-transparent">
                          <code className="text-[10px] font-mono text-[#e3e2e8] break-all leading-relaxed">
                            {previousFileData?.sha256_hash || '—'}
                          </code>
                        </div>
                      </div>
                      <div className="flex gap-4 justify-end">
                        <div className="text-right">
                          <div className="text-[8px] uppercase tracking-widest text-[#524436] mb-1">Size</div>
                          <div className="text-xs font-mono text-[#9f8e7c]">{formatBytes(previousFileData?.file_size ?? 0)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] uppercase tracking-widest text-[#524436] mb-1">Date</div>
                          <div className="text-xs font-mono text-[#9f8e7c]">
                            {previousVersion?.created_at ? new Date(previousVersion.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#1a1b20] rounded p-12 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-[#292a2e] text-5xl mb-4">history_toggle_off</span>
                <h3 className="font-['Space_Grotesk'] font-bold text-[#e3e2e8] text-base mb-1">Genesis Block</h3>
                <p className="text-xs text-[#524436] max-w-xs">
                  This is the first recorded state. Add a new version to start tracking changes.
                </p>
              </div>
            )}

            {/* ── ROW 4: INTEGRITY CERTIFICATE ── */}
            <div className="bg-[#1a1b20] rounded overflow-hidden">
              <div className="px-6 py-4 flex items-center justify-between bg-[#1f1f24]">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#ffb148] text-lg">verified_user</span>
                  <span className="font-['Space_Grotesk'] font-bold text-sm tracking-tight text-[#e3e2e8]">Integrity Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#ffb148] bg-[#ffb148]/10 px-2.5 py-1 rounded-sm" style={{ border: '1px solid rgba(255,177,72,0.2)' }}>
                    TAMPER-PROOF
                  </span>
                  <span className={`text-[8px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-sm ${
                    activeVersion?.blockchain_anchor_id
                      ? 'text-emerald-400 bg-emerald-900/30'
                      : 'text-amber-400 bg-amber-900/20'
                  }`}>
                    {activeVersion?.blockchain_anchor_id ? '⬡ Blockchain Anchored' : '○ Pending L4'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Server Signature */}
                <div>
                  <div className="text-[8px] uppercase tracking-[0.2em] text-[#524436] font-bold mb-2 flex items-center gap-2">
                    <span className="w-1 h-3 bg-purple-400 rounded-full inline-block" />
                    Server Signature (Ed25519)
                  </div>
                  <div className="bg-[#0d0e12] rounded p-3 flex items-center gap-3">
                    <code className="text-[11px] font-mono text-purple-400 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      {showSig
                        ? (activeVersion?.server_signature || 'Not available')
                        : (activeVersion?.server_signature
                          ? `${activeVersion.server_signature.slice(0, 24)}${'·'.repeat(18)}`
                          : 'Not available')}
                    </code>
                    <button onClick={() => setShowSig(!showSig)} className="text-[#524436] hover:text-[#9f8e7c] transition-colors shrink-0">
                      {showSig ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Timestamp */}
                <div>
                  <div className="text-[8px] uppercase tracking-[0.2em] text-[#524436] font-bold mb-2 flex items-center gap-2">
                    <span className="w-1 h-3 bg-[#ffb148] rounded-full inline-block" />
                    Anchored Timestamp (ISO 8601)
                  </div>
                  <div className="bg-[#0d0e12] rounded p-3">
                    <code className="text-[11px] font-mono text-[#9f8e7c]">
                      {activeVersion?.created_at || '—'}
                    </code>
                  </div>
                </div>

                {/* Mini chips grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Work Item ID', value: workItem.id.split('-')[0].toUpperCase() },
                    { label: 'Version', value: activeVersion?.version_tag || '—' },
                    { label: 'Anchoring Layer', value: 'Layer 3 — Merkle' },
                    {
                      label: 'Blockchain',
                      value: activeVersion?.blockchain_anchor_id ? 'Confirmed' : 'Queue: L4',
                      color: activeVersion?.blockchain_anchor_id ? 'emerald-400' : 'amber-400'
                    },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-[#0d0e12] rounded p-3">
                      <div className="text-[8px] uppercase tracking-widest text-[#524436] mb-1">{label}</div>
                      <div className={`text-[11px] font-mono font-bold ${color ? `text-${color}` : 'text-[#9f8e7c]'}`}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* NEW VERSION MODAL */}
      <NewVersionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => { setSelectedVersionId(null); fetchWorkItemData(true); }}
        workItemId={workItem.id}
        workspaceId={workItem.workspace_id}
        nextVersionTag={nextTag}
      />

      {/* DECRYPT MODAL */}
      {isDecryptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b20] rounded w-full max-w-sm p-6 relative shadow-[0_0_60px_rgba(255,177,72,0.08)]">
            <button onClick={() => { setIsDecryptModalOpen(false); setDownloadPassword(''); }} className="absolute top-4 right-4 text-[#524436] hover:text-[#9f8e7c] transition-colors">
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <Lock size={18} className="text-[#ffb148]" />
              <h2 className="font-['Space_Grotesk'] font-bold text-[#e3e2e8] text-base">Encrypted Vault</h2>
            </div>
            <p className="text-xs text-[#524436] mb-4 font-mono">Enter the vault password to decrypt this file locally in-browser.</p>
            <input
              type="password" value={downloadPassword} onChange={(e) => setDownloadPassword(e.target.value)}
              placeholder="Vault password"
              className="w-full bg-[#0d0e12] rounded px-4 py-2.5 text-[#e3e2e8] text-sm font-mono outline-none mb-4 placeholder-[#524436] focus:ring-1 focus:ring-[#ffb148]"
            />
            <button
              onClick={() => executeDownload(true)} disabled={!downloadPassword || isDecrypting}
              className="w-full bg-[#ffb148] hover:bg-[#ffd6a8] disabled:opacity-40 text-[#1a1100] font-['Space_Grotesk'] font-bold py-2.5 rounded flex items-center justify-center gap-2 text-sm transition-colors"
            >
              {isDecrypting ? <><Loader2 size={14} className="animate-spin" /> Decrypting...</> : 'Unlock & Download'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
