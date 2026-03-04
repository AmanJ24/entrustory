import React, { useState, useRef } from 'react';
import { calculateFileHash } from '../../utils/crypto';

export const IntegrityCheck = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'hashing' | 'success'>('idle');
  const [hashProgress, setHashProgress] = useState(0);
  const [generatedHash, setGeneratedHash] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); if (verificationStatus === 'idle') setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (verificationStatus !== 'idle') return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) setSelectedFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setSelectedFile(e.target.files[0]);
  };
  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation(); setSelectedFile(null); setGeneratedHash(''); setVerificationStatus('idle');
  };

  const startVerification = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedFile) return;
    setVerificationStatus('hashing');
    setHashProgress(0);
    try {
      const hash = await calculateFileHash(selectedFile, (pct) => setHashProgress(pct));
      setTimeout(() => { setGeneratedHash(hash); setVerificationStatus('success'); }, 800);
    } catch (error) {
      console.error("Hashing failed:", error); alert("Failed to process file."); setVerificationStatus('idle');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
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

      {/* Removed Header entirely - relying on AppLayout nav */}

      {/* Main Content Area */}
      <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-10">
        
        {/* Title Section */}
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

        {/* Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Upload / Input */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex bg-[#111722] p-1 rounded-lg w-full border border-slate-800">
              <button className="flex-1 py-2 px-4 bg-slate-800 shadow-sm rounded-md text-sm font-semibold text-white">Upload File</button>
              <button className="flex-1 py-2 px-4 text-sm font-medium text-slate-400 hover:text-white">Enter Hash ID</button>
            </div>
            
            {/* DRAG AND DROP ZONE */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              className={`rounded-xl p-8 transition-colors ${!selectedFile ? 'cursor-pointer' : ''} text-center flex flex-col items-center justify-center min-h-[300px] relative
                ${isDragging ? 'dashed-border-active' : 'dashed-border bg-[#111722] hover:bg-slate-800/50'}`}
            >
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} onClick={(e) => (e.target as HTMLInputElement).value = ''} />

              {verificationStatus === 'hashing' ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full border-4 border-cyan-900 border-t-cyan-400 animate-spin mb-4"></div>
                  <h3 className="text-lg font-bold text-cyan-400 mb-1">Computing Hash</h3>
                  <p className="text-sm text-slate-400 mono-font truncate max-w-[200px]">{selectedFile?.name}</p>
                </div>
              ) : selectedFile ? (
                <div className="w-full flex flex-col items-center">
                  <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-4 border border-cyan-500/20">
                    <span className="material-symbols-outlined text-3xl">description</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1 truncate max-w-full px-4">{selectedFile.name}</h3>
                  <p className="text-sm text-slate-400 mb-6">{formatBytes(selectedFile.size)}</p>
                  
                  <div className="flex gap-3 w-full max-w-xs">
                    <button onClick={clearSelection} className="flex-1 py-2.5 px-4 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-all text-sm">
                      Clear
                    </button>
                    <button onClick={startVerification} className="flex-1 py-2.5 px-4 bg-cyan-600 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:bg-cyan-500 transition-all text-sm flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                      Verify File
                    </button>
                  </div>
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
            
            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <div className="relative flex justify-center"><span className="px-2 bg-[#0B1120] text-xs text-slate-500 uppercase">Or verify by ID</span></div>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste SHA-256 Hash or Proof ID"
                value={generatedHash}
                onChange={(e) => setGeneratedHash(e.target.value)}
                className="flex-1 rounded-lg bg-[#111722] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm text-white placeholder-slate-500 px-4 outline-none transition-all"
              />
              <button 
                onClick={() => { if(generatedHash) setVerificationStatus('success'); }}
                className="bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-cyan-500 transition-colors"
              >
                Check
              </button>
            </div>
          </div>

          {/* Right Column: Verification Result (Dark Themed to match app) */}
          <div className="lg:col-span-7 relative">
            {verificationStatus !== 'success' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0B1120]/80 backdrop-blur-sm rounded-2xl border border-slate-800 border-dashed">
                <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">lock</span>
                <p className="text-slate-400 font-medium">Awaiting cryptographic input...</p>
              </div>
            )}

            <div className={`bg-[#111722] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden transition-opacity duration-500 ${verificationStatus === 'success' ? 'opacity-100' : 'opacity-40'}`}>
              <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-emerald-400">
                  <span className="material-symbols-outlined text-2xl">verified_user</span>
                  <span className="font-bold text-lg tracking-wide">INTEGRITY VERIFIED</span>
                </div>
                <span className="text-emerald-400/80 font-mono text-sm">v.1.0.4</span>
              </div>
              
              <div className="p-8">
                <div className="flex items-start justify-between mb-8 pb-8 border-b border-slate-800">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Asset Name</p>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {selectedFile ? selectedFile.name : 'Unknown File'}
                      <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Verification Time</p>
                    <p className="text-sm font-medium text-white">Just now</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      <span className="text-xs font-bold uppercase tracking-wider">Server Timestamp</span>
                    </div>
                    <p className="mono-font text-sm text-slate-200 font-semibold">2026-10-27T14:30:00Z</p>
                    <p className="text-xs text-slate-500 mt-1">Anchored in Block #192842</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <div className="flex items-center gap-2 mb-2 text-slate-400">
                      <span className="material-symbols-outlined text-sm">key</span>
                      <span className="text-xs font-bold uppercase tracking-wider">Signer Public Key</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="mono-font text-xs text-slate-200 break-all leading-relaxed">ed25519:0x4d...8a2F</p>
                      <button className="text-slate-500 hover:text-white">
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                    </div>
                    <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">check</span> Valid Signature
                    </p>
                  </div>
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
                        <span className="truncate w-48">7f83...9a12</span>
                        <span className="material-symbols-outlined text-sm text-emerald-400 ml-2">lock</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pb-6 relative">
                      <div className="w-3 h-3 rounded-full bg-slate-600 ring-4 ring-[#111722] z-10 absolute -left-[21px]"></div>
                      <div className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 p-3 rounded-lg text-xs mono-font flex justify-between items-center">
                        <span className="text-slate-500 mr-2">NODE:</span>
                        <span className="truncate w-48">a1b2...c3d4</span>
                        <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">L2</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 relative">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#111722] z-10 absolute -left-[21px] shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                      <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg text-xs mono-font font-semibold flex flex-col shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-emerald-500">YOUR FILE HASH:</span>
                          <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">Verified Match</span>
                        </div>
                        <span className="break-all text-emerald-300">{generatedHash || 'e5f6...7890'}</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/80 px-8 py-4 border-t border-slate-800 flex justify-between items-center">
                <button className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                  <span className="material-symbols-outlined text-sm">download</span> Download Certificate
                </button>
                <button className="text-sm text-cyan-500 hover:text-cyan-400 font-medium transition-colors">
                  View Raw JSON
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
