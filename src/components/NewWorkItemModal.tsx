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
}

export const NewWorkItemModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'hashing' | 'saving' | 'success'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !projectName) return;

    setStatus('hashing');
    try {
      // 1. Safely check for user's workspace
      const { data: member, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle(); // Prevents the HTTP 406 crash if 0 rows exist
      
      if (memberError) throw memberError;
      if (!member || !member.workspace_id) {
        alert("No workspace found for this account. Please contact support or create a new account.");
        setStatus('idle');
        return;
      }
      
      const workspaceId = member.workspace_id;

      // 2. Hash the file locally
      const fileHash = await calculateFileHash(file);
      
      // 3. Generate Merkle Root
      const merkleRoot = await generateMerkleRoot([fileHash]);

      setStatus('saving');

      // 4. Create WorkItem
      const { data: workItem, error: wiError } = await supabase
        .from('work_items')
        .insert([{ workspace_id: workspaceId, name: projectName, created_by: user.id }])
        .select()
        .single();
      if (wiError) throw wiError;

      // 5. Create Version
      const { data: version, error: vError } = await supabase
        .from('versions')
        .insert([{ work_item_id: workItem.id, version_tag: 'v1.0', merkle_root: merkleRoot, created_by: user.id }])
        .select()
        .single();
      if (vError) throw vError;

      // 6. Save Evidence Hash
      const { error: ehError } = await supabase
        .from('evidence_hashes')
        .insert([{ version_id: version.id, file_name: file.name, file_size: file.size, sha256_hash: fileHash }]);
      if (ehError) throw ehError;

      // 7. Log Activity
      await supabase.from('audit_logs').insert([{ 
        workspace_id: workspaceId, actor_id: user.id, action_type: 'workitem_created', resource_id: workItem.id 
      }]);

      setStatus('success');
      setTimeout(() => {
        onSuccess();
        onClose();
        setStatus('idle');
        setFile(null);
        setProjectName('');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      alert(`Failed to secure WorkItem: ${err.message || 'Unknown error'}`);
      setStatus('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111722] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-2 font-display">New WorkItem</h2>
        <p className="text-sm text-slate-400 mb-6">Securely hash and anchor a new digital asset.</p>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-10 text-emerald-400">
            <Fingerprint size={48} className="mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h3 className="text-xl font-bold">Asset Secured</h3>
            <p className="text-sm text-slate-400 mt-2">Zero-knowledge proof anchored to ledger.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
              <input 
                type="text" required value={projectName} onChange={e => setProjectName(e.target.value)}
                className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500"
                placeholder="e.g. Acme Corp NDA"
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
              type="submit" disabled={status !== 'idle' || !file || !projectName}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 mt-4"
            >
              {status === 'hashing' && <><Loader2 size={18} className="animate-spin" /> Hashing locally...</>}
              {status === 'saving' && <><Loader2 size={18} className="animate-spin" /> Anchoring to database...</>}
              {status === 'idle' && <><Fingerprint size={18} /> Generate Proof & Save</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
