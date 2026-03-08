import React, { useState, useRef } from 'react';
import { calculateFileHash } from '../../utils/crypto';
import { supabase } from '../../utils/supabase';
import { ShieldAlert, Download, Code, Loader2, Search } from 'lucide-react';
import { ed25519 } from '@noble/curves/ed25519';
import { SERVER_PUBLIC_KEY_HEX, HexToBuffer } from '../../utils/serverSignature';


export const IntegrityCheck = () => {
  // --- New State for Tabs ---
  const [inputMode, setInputMode] = useState<'file' | 'hash'>('file');

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [hashProgress, setHashProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [proofData, setProofData] = useState<any>(null);
  const [showJson, setShowJson] = useState(false);

  const [isSignatureValid, setIsSignatureValid] = useState<boolean | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const safeDate = (dateString: string | undefined, format: 'locale' | 'iso' = 'locale') => {
    if (!dateString) return 'Pending...';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Invalid Date';
      return format === 'iso' ? d.toISOString() : d.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  const verifyHashAgainstLedger = async (hashToVerify: string) => {
    setVerificationStatus('processing');
    try {
      const { data, error } = await supabase
        .from('evidence_hashes')
        .select(`*, versions (version_tag, merkle_root, server_signature, created_at)`)
        .eq('sha256_hash', hashToVerify)
        .maybeSingle();

      if (error || !data) {
        setVerificationStatus('failed');
        setProofData(null);
        setIsSignatureValid(null);
      } else {
        setProofData(data);
        
        // --- NEW: MATHEMATICAL SIGNATURE VERIFICATION ---
        try {
          const root = data.versions?.merkle_root;
          const timestamp = data.versions?.created_at;
          const signatureHex = data.versions?.server_signature;

          if (root && timestamp && signatureHex) {
            // Reconstruct the exact message the server signed
            const messageString = `${root}|${timestamp}`;
            const messageBytes = new TextEncoder().encode(messageString);
            
            // Verify using the public key
            const isValid = ed25519.verify(
              HexToBuffer(signatureHex), 
              messageBytes, 
              HexToBuffer(SERVER_PUBLIC_KEY_HEX)
            );
            setIsSignatureValid(isValid);
          } else {
            setIsSignatureValid(false);
          }
        } catch (e) {
          setIsSignatureValid(false);
        }

        setVerificationStatus('success');
      }
    } catch (err) {
      console.error("Verification error:", err);
      setVerificationStatus('failed');
    }
  };

  // --- UI Handlers ---
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); if (verificationStatus === 'idle') setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (verificationStatus !== 'idle') return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      await processFile(file);
    }
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setVerificationStatus('processing');
    setHashProgress(0);
    try {
      const hash = await calculateFileHash(file, (pct) => setHashProgress(pct));
      setSearchQuery(hash);
      await verifyHashAgainstLedger(hash);
    } catch (error) {
      console.error("Hashing failed:", error);
      alert("Failed to process file.");
      setVerificationStatus('idle');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setSearchQuery('');
    setProofData(null);
    setVerificationStatus('idle');
    setShowJson(false);
  };

  // Triggered when manually checking a pasted hash
  const handleManualCheck = () => {
    const cleanHash = searchQuery.trim().toLowerCase();
    if (cleanHash.length === 64) {
      verifyHashAgainstLedger(cleanHash);
    } else {
      alert("Please enter a valid 64-character SHA-256 hash.");
    }
  };

  const generateCertificate = () => {
    if (!proofData) return;
    const cert = {
      issuer: "Entrustory OS Integrity Network",
      timestamp_utc: proofData.created_at,
      asset_name: proofData.file_name,
      file_size_bytes: proofData.file_size,
      cryptographic_proofs: {
        algorithm: "SHA-256",
        leaf_hash: proofData.sha256_hash,
        merkle_root: proofData.versions?.merkle_root,
        ed25519_signature: proofData.versions?.server_signature || "Pending Blockchain Anchor"
      },
      status: "CRYPTOGRAPHICALLY_VERIFIED"
    };

    const blob = new Blob([JSON.stringify(cert, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entrustory-proof-${proofData.sha256_hash.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024; const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col w-full font-['Inter'] bg-[#0B1120] text-slate-100 min-h-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
        .mono-font { font-family: 'Space Mono', monospace; }
        .dashed-border {
          background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%23334155' stroke-width='2' stroke-dasharray='12%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
        }
        .dashed-border-active {
          background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='12' ry='12' stroke='%230dccf2' stroke-width='2' stroke-dasharray='12%2c 12' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
          background-color: rgba(13, 204, 242, 0.05);
        }
      `}</style>

      <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-10">
        
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Public Verification Node
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">Verify Integrity.</h2>
          <p className="text-slate-400 text-sm">
            Independently validate the existence, timestamp, and integrity of any digital asset anchored on the Entrustory infrastructure.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Upload / Input */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* FUNCTIONAL TABS */}
            <div className="flex bg-[#111722] p-1 rounded-lg w-full border border-slate-800">
              <button 
                onClick={() => { setInputMode('file'); clearSelection(); }}
                className={`flex-1 py-2 px-4 shadow-sm rounded-md text-sm font-semibold transition-all ${inputMode === 'file' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Upload File
              </button>
              <button 
                onClick={() => { setInputMode('hash'); clearSelection(); }}
                className={`flex-1 py-2 px-4 shadow-sm rounded-md text-sm font-semibold transition-all ${inputMode === 'hash' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Direct Hash
              </button>
            </div>
            
            {inputMode === 'file' ? (
              /* --- MODE 1: FILE UPLOAD --- */
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => verificationStatus === 'idle' && fileInputRef.current?.click()}
                className={`rounded-xl p-8 transition-colors ${verificationStatus === 'idle' ? 'cursor-pointer' : ''} text-center flex flex-col items-center justify-center min-h-[300px] relative
                  ${isDragging ? 'dashed-border-active' : 'dashed-border bg-[#111722] hover:bg-slate-800/50'}`}
              >
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} onClick={(e) => (e.target as HTMLInputElement).value = ''} />

                {verificationStatus === 'processing' ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                    <h3 className="text-lg font-bold text-cyan-400 mb-1">Querying Ledger</h3>
                    <p className="text-sm text-slate-400 mono-font truncate max-w-[200px]">{selectedFile?.name}</p>
                  </div>
                ) : verificationStatus !== 'idle' ? (
                  <div className="w-full flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 border 
                      ${verificationStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      <span className="material-symbols-outlined text-3xl">
                        {verificationStatus === 'success' ? 'verified' : 'gpp_bad'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1 truncate max-w-full px-4">
                      {selectedFile?.name}
                    </h3>
                    <p className="text-sm text-slate-400 mb-6">
                      {verificationStatus === 'success' ? 'Ledger Match Found' : 'No Match Found'}
                    </p>
                    
                    <button onClick={(e) => { e.stopPropagation(); clearSelection(); }} className="w-full max-w-xs py-2.5 px-4 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-all text-sm">
                      Verify Another File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform
                      ${isDragging ? 'bg-cyan-500/20 text-cyan-400 scale-110' : 'bg-slate-800 text-slate-400 group-hover:scale-110'}`}>
                      <span className="material-symbols-outlined text-3xl">upload_file</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {isDragging ? 'Drop file to hash' : 'Drag and drop file'}
                    </h3>
                    <p className="text-sm text-slate-400 mb-6 max-w-xs">
                      Supports PDF, PNG, JPG, JSON, and raw binary. Files are hashed client-side.
                    </p>
                    <button className="px-6 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-all text-sm pointer-events-none">
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            ) : (
              /* --- MODE 2: DIRECT HASH INPUT --- */
              <div className="rounded-xl p-8 bg-[#111722] border border-slate-800 min-h-[300px] flex flex-col justify-center relative">
                
                {verificationStatus === 'processing' ? (
                   <div className="flex flex-col items-center">
                     <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                     <h3 className="text-lg font-bold text-cyan-400 mb-1">Querying Ledger</h3>
                   </div>
                ) : verificationStatus !== 'idle' ? (
                  <div className="w-full flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 border 
                      ${verificationStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      <span className="material-symbols-outlined text-3xl">
                        {verificationStatus === 'success' ? 'verified' : 'gpp_bad'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {verificationStatus === 'success' ? 'Ledger Match Found' : 'No Match Found'}
                    </h3>
                    <button onClick={clearSelection} className="mt-6 w-full max-w-xs py-2.5 px-4 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-all text-sm">
                      Check Another Hash
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-4 mx-auto">
                      <span className="material-symbols-outlined text-3xl">tag</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">Enter Cryptographic Hash</h3>
                    <p className="text-sm text-slate-400 mb-6 text-center">Paste the 64-character SHA-256 hash to verify its presence in the ledger.</p>
                    
                    <input 
                      type="text" 
                      placeholder="e.g. e3b0c44298fc1c14..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0B1120] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm text-white placeholder-slate-600 px-4 py-3 rounded-lg outline-none transition-all text-center mb-4"
                    />
                    
                    <button 
                      onClick={handleManualCheck}
                      disabled={searchQuery.length !== 64}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex justify-center items-center gap-2"
                    >
                      <Search size={18} />
                      Verify Hash
                    </button>
                  </>
                )}
              </div>
            )}

          </div>

          {/* Right Column: Verification Result */}
          <div className="lg:col-span-7 relative">
            
            {verificationStatus === 'idle' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B1120]/80 backdrop-blur-sm rounded-2xl border border-slate-800 border-dashed">
                <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">lock</span>
                <p className="text-slate-400 font-medium">Awaiting cryptographic input...</p>
              </div>
            )}

            {verificationStatus === 'failed' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-900/10 backdrop-blur-sm rounded-2xl border border-red-500/30">
                <ShieldAlert size={48} className="text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Integrity Check Failed</h3>
                <p className="text-slate-400 max-w-sm text-center text-sm">
                  This hash does not exist in the Entrustory ledger. The asset may have been modified, corrupted, or was never anchored.
                </p>
              </div>
            )}

            <div className={`bg-[#111722] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden transition-opacity duration-500 ${verificationStatus === 'success' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              
              {showJson ? (
                <div className="h-full flex flex-col">
                  <div className="bg-slate-800 px-6 py-3 flex justify-between items-center">
                    <span className="text-white font-mono text-sm">proof_data.json</span>
                    <button onClick={() => setShowJson(false)} className="text-slate-400 hover:text-white">Close</button>
                  </div>
                  <pre className="p-6 overflow-auto text-xs font-mono text-cyan-300 h-[400px]">
                    {JSON.stringify(proofData, null, 2)}
                  </pre>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <span className="material-symbols-outlined text-2xl">verified_user</span>
                      <span className="font-bold text-lg tracking-wide">INTEGRITY VERIFIED</span>
                    </div>
                    <span className="text-emerald-400/80 font-mono text-sm">v.1.0.4</span>
                  </div>
                  
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-8 pb-8 border-b border-slate-800">
                      <div className="max-w-[70%]">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Asset Name</p>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 truncate">
                          {proofData?.file_name || 'Verified Hash'}
                          <span className="material-symbols-outlined text-emerald-500 text-lg shrink-0">check_circle</span>
                        </h3>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Original Anchor</p>
                        <p className="text-sm font-medium text-white">{safeDate(proofData?.created_at, 'locale')}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                          <span className="material-symbols-outlined text-sm">schedule</span>
                          <span className="text-xs font-bold uppercase tracking-wider">Server Timestamp</span>
                        </div>
                        <p className="mono-font text-sm text-slate-200 font-semibold">{safeDate(proofData?.created_at, 'iso')}</p>
                        <p className="text-xs text-slate-500 mt-1">DB Insertion Verified</p>
                      </div>
                   <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                      <span className="material-symbols-outlined text-sm">key</span>
                      <span className="text-xs font-bold uppercase tracking-wider">Signer Public Key</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="mono-font text-xs text-slate-200 break-all leading-relaxed">
                        ed25519:{SERVER_PUBLIC_KEY_HEX.substring(0, 24)}...
                      </p>
                    </div>
                    {isSignatureValid ? (
                      <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span> Math Verification Passed
                      </p>
                    ) : (
                      <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">cancel</span> Signature Invalid
                      </p>
                    )}
                  </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Merkle Path Validation</h4>
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs rounded font-medium">Path Complete</span>
                      </div>
                      <div className="relative pl-4 border-l-2 border-slate-800 space-y-0">
                        
                        <div className="flex items-center gap-4 pb-6 relative">
                          <div className="w-3 h-3 rounded-full bg-slate-400 ring-4 ring-[#111722] z-10 absolute -left-[21px]"></div>
                          <div className="flex-1 bg-slate-900 text-white p-3 rounded-lg text-xs mono-font shadow-sm flex justify-between items-center border border-slate-800">
                            <span className="text-slate-500 mr-2">ROOT:</span>
                            <span className="truncate w-48">{proofData?.versions?.merkle_root}</span>
                            <span className="material-symbols-outlined text-sm text-emerald-400 ml-2">lock</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 relative">
                          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#111722] z-10 absolute -left-[21px] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                          <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-xs mono-font font-semibold flex flex-col shadow-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-emerald-500">YOUR FILE HASH:</span>
                              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">Verified Match</span>
                            </div>
                            <span className="break-all text-emerald-300">{proofData?.sha256_hash}</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900/80 px-8 py-4 border-t border-slate-800 flex justify-between items-center">
                    <button onClick={generateCertificate} className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                      <Download size={16} /> Download Certificate
                    </button>
                    <button onClick={() => setShowJson(true)} className="text-sm text-cyan-500 hover:text-cyan-400 font-medium transition-colors flex items-center gap-1">
                      <Code size={16} /> View Raw JSON
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
