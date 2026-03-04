import React, { useState, useRef } from 'react';
import { X, UploadCloud, Fingerprint, Loader2 } from 'lucide-react';
import { calculateFileHash } from '../utils/crypto';
import { generateMerkleRoot } from '../utils/merkle';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workItemId: string;
  workspaceId: string;
  nextVersionTag: string;
}

export const NewVersionModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, workItemId, workspaceId, nextVersionTag }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [versionTag, setVersionTag] = useState(nextVersionTag);
  const [status, setStatus] = useState<'idle' | 'hashing' | 'saving' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !versionTag) return;

    setStatus('hashing');
    try {
      // 1. Hash the file locally
      const fileHash = await calculateFileHash(file);
      
      // 2. Generate Merkle Root
      const merkleRoot = await generateMerkleRoot([fileHash]);

      setStatus('saving');

      // 3. Create New Version
      const { data: version, error: vError } = await supabase
        .from('versions')
        .insert([{ work_item_id: workItemId, version_tag: versionTag, merkle_root: merkleRoot, created_by: user.id }])
        .select()
        .single();
      if (vError) throw vError;

      // 4. Save Evidence Hash
      const { error: ehError } = await supabase
        .from('evidence_hashes')
        .insert([{ version_id: version.id, file_name: file.name, file_size: file.size, sha256_hash: fileHash }]);
      if (ehError) throw ehError;

      // 5. Log Activity
      await supabase.from('audit_logs').insert([{ 
        workspace_id: workspaceId, actor_id: user.id, action_type: 'version_created', resource_id: version.id,
        details: { message: `Version ${versionTag} anchored.` }
      }]);

      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStatus('idle');
        setFile(null);
      }, 1500);

    } catch (err: any) {
      console.error(err);
      alert(`Failed to add version: ${err.message}`);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111722] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-2 font-['Space_Grotesk']">Add New Version</h2>
        <p className="text-sm text-slate-400 mb-6">Append a new, cryptographically signed version to this timeline.</p>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-10 text-emerald-400">
            <Fingerprint size={48} className="mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h3 className="text-xl font-bold">Version Anchored</h3>
            <p className="text-sm text-slate-400 mt-2">Timeline successfully updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Version Tag</label>
              <input 
                type="text" required value={versionTag} onChange={e => setVersionTag(e.target.value)}
                className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Target File</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 bg-[#0B1120] hover:bg-slate-800/50 transition-colors rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer"
              >
                <input type="file" required className="hidden" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} />
                <UploadCloud size={24} className={file ? 'text-cyan-500' : 'text-slate-500'} />
                <span className="text-sm text-slate-300 mt-2">{file ? file.name : 'Click to select file'}</span>
              </div>
            </div>

            <button 
              type="submit" disabled={status !== 'idle' || !file}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              {status === 'hashing' && <><Loader2 size={18} className="animate-spin" /> Hashing locally...</>}
              {status === 'saving' && <><Loader2 size={18} className="animate-spin" /> Anchoring to database...</>}
              {status === 'idle' && <><Fingerprint size={18} /> Append Version</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
