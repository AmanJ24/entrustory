import React, { useState, useRef } from 'react';
import { X, UploadCloud, Fingerprint, Loader2, AlertTriangle, Database, Lock } from 'lucide-react';
import { calculateFileHash, encryptFile } from '../utils/crypto';
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
  
  // Vault & Encryption State
  const [storeInVault, setStoreInVault] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'hashing' | 'encrypting' | 'uploading' | 'saving' | 'success' | 'duplicate'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user || !projectName) return;
    if (storeInVault && !encryptionPassword) {
      alert("Please provide an encryption password for the Vault.");
      return;
    }

    setStatus('hashing');
    try {
      const { data: member } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user.id).limit(1).maybeSingle();
      if (!member) throw new Error("No workspace found");
      const workspaceId = member.workspace_id;

      // 1. Hash the ORIGINAL file locally
      const fileHash = await calculateFileHash(file);

      // 2. Duplicate Detection
      const { data: duplicateCheck } = await supabase.from('evidence_hashes').select('id').eq('sha256_hash', fileHash).maybeSingle();
      if (duplicateCheck) { setStatus('duplicate'); return; }
      
      // 3. Merkle & Signature
      const merkleRoot = await generateMerkleRoot([fileHash]);
      const { signature, timestamp } = await generateServerSignature(merkleRoot);

      // --- VAULT LOGIC: ENCRYPT THEN UPLOAD ---
      let storagePath = null;
      if (storeInVault) {
        setStatus('encrypting');
        // Encrypt the file using the user's password
        const encryptedBlob = await encryptFile(file, encryptionPassword);
        
        setStatus('uploading');
        // Upload the encrypted blob, not the plaintext file!
        const filePath = `${workspaceId}/${Date.now()}_${file.name}.enc`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('vault')
          .upload(filePath, encryptedBlob, { contentType: 'application/octet-stream' });
          
        if (uploadError) throw uploadError;
        storagePath = uploadData.path;
      }

      setStatus('saving');

      // 4. Save to Database
      const { data: workItem } = await supabase.from('work_items').insert([{ workspace_id: workspaceId, name: projectName, created_by: user.id }]).select().single();
      const { data: version } = await supabase.from('versions').insert([{ work_item_id: workItem.id, version_tag: 'v1.0', merkle_root: merkleRoot, server_signature: signature, created_at: timestamp, created_by: user.id }]).select().single();
      
      // Save evidence with the 'is_encrypted' flag
      await supabase.from('evidence_hashes').insert([{ 
        version_id: version.id, file_name: file.name, file_size: file.size, 
        sha256_hash: fileHash, storage_path: storagePath, is_encrypted: storeInVault 
      }]);

      await supabase.from('audit_logs').insert([{ workspace_id: workspaceId, actor_id: user.id, action_type: 'workitem_created', resource_id: workItem.id, details: { message: `WorkItem anchored. Vaulted: ${storeInVault}` } }]);

      setStatus('success');
      setTimeout(() => {
        onSuccess(); onClose(); setStatus('idle'); setFile(null); setProjectName(''); setStoreInVault(false); setEncryptionPassword('');
      }, 1500);

    } catch (err: any) {
      console.error(err); alert(`Failed: ${err.message}`); setStatus('idle');
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
          </div>
        ) : status === 'duplicate' ? (
          <div className="flex flex-col items-center justify-center py-8 text-amber-400 animate-in zoom-in">
            <AlertTriangle size={48} className="mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
            <h3 className="text-xl font-bold">Duplicate Detected</h3>
            <button onClick={() => {setStatus('idle'); setFile(null);}} className="mt-6 px-6 py-2 bg-slate-800 text-white rounded-lg">Select Different File</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
              <input type="text" required value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-[#0B1120] border border-slate-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-cyan-500" placeholder="e.g. Acme Corp NDA" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Target File</label>
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-700 bg-[#0B1120] hover:bg-slate-800/50 transition-colors rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer">
                <input type="file" required className="hidden" ref={fileInputRef} onChange={e => setFile(e.target.files?.[0] || null)} />
                <UploadCloud size={24} className={file ? 'text-cyan-500' : 'text-slate-500'} />
                <span className="text-sm text-slate-300 mt-2 truncate w-full text-center">{file ? file.name : 'Click to select file'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 p-3 rounded-lg border border-slate-700 bg-slate-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Database className={`mt-0.5 ${storeInVault ? 'text-cyan-400' : 'text-slate-500'}`} size={18} />
                  <div>
                    <p className="text-sm font-medium text-white">Store in Vault</p>
                    <p className="text-[10px] text-slate-400">Keep an AES-256 encrypted copy on our servers.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={storeInVault} onChange={(e) => setStoreInVault(e.target.checked)} />
                  <div className="w-9 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Password Input (Only shows if Vault is ON) */}
              {storeInVault && (
                <div className="relative animate-in fade-in slide-in-from-top-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="password" required={storeInVault} value={encryptionPassword} onChange={e => setEncryptionPassword(e.target.value)}
                    placeholder="Enter an encryption password"
                    className="w-full bg-[#0B1120] border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>

            <button type="submit" disabled={status !== 'idle' || !file || !projectName} className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 mt-2 transition-all">
              {status === 'hashing' && <><Loader2 size={18} className="animate-spin" /> Hashing locally...</>}
              {status === 'encrypting' && <><Loader2 size={18} className="animate-spin" /> Encrypting AES-256...</>}
              {status === 'uploading' && <><Loader2 size={18} className="animate-spin" /> Uploading to Vault...</>}
              {status === 'saving' && <><Loader2 size={18} className="animate-spin" /> Anchoring...</>}
              {status === 'idle' && <><Fingerprint size={18} /> Generate Proof & Save</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
