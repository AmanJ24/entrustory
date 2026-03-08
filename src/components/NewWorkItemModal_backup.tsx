import React, { useState, useRef } from 'react';
import { X, UploadCloud, Fingerprint, Loader2, AlertTriangle } from 'lucide-react';
import { calculateFileHash } from '../utils/crypto';
import { generateMerkleRoot } from '../utils/merkle';
import { supabase } from '../utils/supabase';
import { useAuth } from '../hooks/useAuth';
import { generateServerSignature } from '../utils/serverSignature';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewWorkItemModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [projectName, setProjectName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'hashing' | 'saving' | 'success' | 'duplicate'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !projectName) return;

    setStatus('hashing');
    try {
      const { data: member, error: memberError } = await supabase
        .from('workspace_members').select('workspace_id').eq('user_id', user.id).limit(1).maybeSingle();
      
      if (memberError) throw memberError;
      if (!member || !member.workspace_id) {
        alert("No workspace found.");
        setStatus('idle');
        return;
      }
      const workspaceId = member.workspace_id;

      // 1. Hash the file locally
      const fileHash = await calculateFileHash(file);

      // --- NEW: DUPLICATE PROOF DETECTION ---
      const { data: duplicateCheck } = await supabase
        .from('evidence_hashes')
        .select('id')
        .eq('sha256_hash', fileHash)
        .maybeSingle();

      if (duplicateCheck) {
        setStatus('duplicate');
        return; // Stop the process!
      }
      
      // 2. Generate Merkle Root & Signature
      const merkleRoot = await generateMerkleRoot([fileHash]);
      const { signature, timestamp } = await generateServerSignature(merkleRoot);

      setStatus('saving');

      // 3. Save to Database
      const { data: workItem, error: wiError } = await supabase
        .from('work_items')
        .insert([{ workspace_id: workspaceId, name: projectName, created_by: user.id }])
        .select().single();
      if (wiError) throw wiError;

      const { data: version, error: vError } = await supabase
        .from('versions')
        .insert([{ 
          work_item_id: workItem.id, version_tag: 'v1.0', merkle_root: merkleRoot, 
          server_signature: signature, created_at: timestamp, created_by: user.id 
        }]).select().single();
      if (vError) throw vError;

      const { error: ehError } = await supabase
        .from('evidence_hashes')
        .insert([{ version_id: version.id, file_name: file.name, file_size: file.size, sha256_hash: fileHash }]);
      if (ehError) throw ehError;

      await supabase.from('audit_logs').insert([{ 
        workspace_id: workspaceId, actor_id: user.id, action_type: 'workitem_created', resource_id: workItem.id,
        details: { message: `WorkItem initialized with hash: ${fileHash.substring(0, 8)}...` }
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
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
        
        <h2 className="text-xl font-bold text-white mb-2 font-display">New WorkItem</h2>
        <p className="text-sm text-slate-400 mb-6">Securely hash and anchor a new digital asset.</p>

        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-10 text-emerald-400 animate-in zoom-in">
            <Fingerprint size={48} className="mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h3 className="text-xl font-bold">Asset Secured</h3>
            <p className="text-sm text-slate-400 mt-2">Zero-knowledge proof anchored to ledger.</p>
          </div>
        ) : status === 'duplicate' ? (
          <div className="flex flex-col items-center justify-center py-8 text-amber-400 animate-in zoom-in">
            <AlertTriangle size={48} className="mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <h3 className="text-xl font-bold text-amber-500">Duplicate Detected</h3>
            <p className="text-sm text-slate-400 mt-2 text-center px-4">
              This exact file has already been anchored to the Entrustory network. Creating duplicate records is restricted.
            </p>
            <button onClick={() => {setStatus('idle'); setFile(null);}} className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
              Select Different File
            </button>
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
                <span className="text-sm text-slate-300 mt-2 text-center">{file ? file.name : 'Click to select file'}</span>
              </div>
            </div>
            <button 
              type="submit" disabled={status !== 'idle' || !file || !projectName}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 mt-4 transition-all"
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
