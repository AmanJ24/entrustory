import React, { useState, useRef } from 'react';
import { X, UploadCloud, Fingerprint, Loader2, AlertTriangle, Database, Lock } from 'lucide-react';
import { calculateFileHash, encryptFile } from '../utils/crypto';
import { generateMerkleRoot } from '../utils/merkle';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';
import { generateServerSignature } from '../utils/serverSignature';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workItemId: string;
  workspaceId: string;
  nextVersionTag: string;
}

export const NewVersionModal: React.FC<Props> = ({ 
  isOpen, onClose, onSuccess, workItemId, workspaceId, nextVersionTag 
}) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [versionTag, setVersionTag] = useState(nextVersionTag);
  const [storeInVault, setStoreInVault] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'hashing' | 'encrypting' | 'uploading' | 'saving' | 'success' | 'duplicate'>('idle');
  const [duplicateHash, setDuplicateHash] = useState(''); // To show the user the hash
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !versionTag) return;
    if (file.size === 0) {
      toast.error("Cannot submit an empty file. Please select a valid file.");
      return;
    }
    if (storeInVault && !encryptionPassword) {
      toast.error("Please provide an encryption password for the Vault.");
      return;
    }

    setStatus('hashing');
    try {
      const fileHash = await calculateFileHash(file);

      // --- SAFER DUPLICATE CHECK ---
      const { data: duplicateCheck } = await supabase
        .from('evidence_hashes')
        .select('id')
        .eq('sha256_hash', fileHash)
        .limit(1);

      if (duplicateCheck && duplicateCheck.length > 0) {
        setDuplicateHash(fileHash);
        setStatus('duplicate'); 
        return; 
      }
      
      const merkleRoot = await generateMerkleRoot([fileHash]);
      const timestamp = new Date().toISOString();
      const signature = await generateServerSignature(merkleRoot, timestamp);

      let storagePath = null;
      if (storeInVault) {
        setStatus('encrypting');
        const encryptedBlob = await encryptFile(file, encryptionPassword);
        
        setStatus('uploading');
        const filePath = `${workspaceId}/${Date.now()}_${file.name}.enc`;
        const { data: uploadData, error: uploadError } = await supabase.storage.from('vault').upload(filePath, encryptedBlob, { contentType: 'application/octet-stream' });
        if (uploadError) throw uploadError;
        storagePath = uploadData.path;
      }

      setStatus('saving');

      const { data: version, error: vError } = await supabase
        .from('versions')
        .insert([{ 
          work_item_id: workItemId, version_tag: versionTag, merkle_root: merkleRoot, 
          server_signature: signature, created_at: timestamp, created_by: user.id 
        }]).select().single();
      if (vError) throw vError;

      const { error: ehError } = await supabase
        .from('evidence_hashes')
        .insert([{ 
          version_id: version.id, file_name: file.name, file_size: file.size, 
          sha256_hash: fileHash, storage_path: storagePath, is_encrypted: storeInVault
        }]);
      if (ehError) throw ehError;

      await supabase.from('audit_logs').insert([{ 
        workspace_id: workspaceId, actor_id: user.id, action_type: 'version_created', resource_id: version.id,
        details: { message: `Version ${versionTag} anchored. Vaulted: ${storeInVault}` }
      }]);

      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStatus('idle');
        setFile(null);
        setStoreInVault(false);
        setEncryptionPassword('');
      }, 1500);

    } catch (err: unknown) {
      console.error(err);
      toast.error(`Failed to append version: ${(err as Error).message || 'Unknown error'}`);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-low border border-surface-variant rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-on-surface-variant hover:text-white"><X size={20} /></button>
        
        <h2 className="text-xl font-bold text-white mb-2 font-display">Add New Version</h2>
        <p className="text-sm text-on-surface-variant mb-6">Append a new, cryptographically signed version to this timeline.</p>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-10 text-emerald-400 animate-in zoom-in">
            <Fingerprint size={48} className="mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h3 className="text-xl font-bold">Version Anchored</h3>
          </div>
        ) : status === 'duplicate' ? (
          <div className="flex flex-col items-center justify-center py-8 text-amber-400 animate-in zoom-in">
            <AlertTriangle size={48} className="mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <h3 className="text-xl font-bold text-amber-500">Duplicate Content Detected</h3>
            <p className="text-sm text-on-surface-variant mt-2 text-center px-2">
              The binary content of this file produces an identical hash to an existing asset on the ledger.
            </p>
            <div className="mt-4 bg-amber-900/20 border border-amber-500/30 rounded p-2 text-center w-full">
              <p className="text-[10px] text-amber-500/70 mb-1 uppercase">Conflicting SHA-256 Hash:</p>
              <code className="text-xs text-amber-400 font-mono break-all">{duplicateHash}</code>
            </div>
            <button onClick={() => {setStatus('idle'); setFile(null);}} className="mt-6 px-6 py-2 bg-surface-variant hover:bg-slate-700 text-white rounded-lg transition-colors w-full">
              Select Different File
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Version Tag</label>
              <input type="text" required value={versionTag} onChange={e => setVersionTag(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-white outline-none focus:border-tertiary font-mono text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Target File</label>
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-outline-variant bg-surface hover:bg-surface-variant/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer">
                <input type="file" required className="hidden" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} />
                <UploadCloud size={24} className={file ? 'text-tertiary' : 'text-on-surface-variant'} />
                <span className="text-sm text-on-surface mt-2 text-center">{file ? file.name : 'Click to select file'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-3 rounded-lg border border-outline-variant bg-surface-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Database className={`mt-0.5 ${storeInVault ? 'text-tertiary' : 'text-on-surface-variant'}`} size={18} />
                  <div>
                    <p className="text-sm font-medium text-white">Store in Vault</p>
                    <p className="text-[10px] text-on-surface-variant">Keep an AES-256 encrypted copy on our servers.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={storeInVault} onChange={(e) => setStoreInVault(e.target.checked)} />
                  <div className="w-9 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-tertiary"></div>
                </label>
              </div>

              {storeInVault && (
                <div className="relative animate-in fade-in slide-in-from-top-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
                  <input 
                    type="password" required={storeInVault} value={encryptionPassword} onChange={e => setEncryptionPassword(e.target.value)}
                    placeholder="Enter an encryption password"
                    className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-tertiary"
                  />
                </div>
              )}
            </div>

            <button type="submit" disabled={status !== 'idle' || !file || !versionTag} className="w-full bg-tertiary hover:bg-tertiary disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 mt-2 transition-all">
              {status === 'hashing' && <><Loader2 size={18} className="animate-spin" /> Hashing locally...</>}
              {status === 'encrypting' && <><Loader2 size={18} className="animate-spin" /> Encrypting AES-256...</>}
              {status === 'uploading' && <><Loader2 size={18} className="animate-spin" /> Uploading to Vault...</>}
              {status === 'saving' && <><Loader2 size={18} className="animate-spin" /> Anchoring...</>}
              {status === 'idle' && <><Fingerprint size={18} /> Append Version</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
