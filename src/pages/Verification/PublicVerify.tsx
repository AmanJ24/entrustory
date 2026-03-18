/**
 * PublicVerify — Public-facing verification page.
 * Allows anyone to verify a file hash against the Entrustory ledger
 * WITHOUT requiring an account. Supports:
 * - Direct URL: /verify/e3b0c44298fc1c14...
 * - File upload (client-side hashing)
 * - Manual hash input
 */

import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { calculateFileHash } from '../../utils/crypto';
import { supabase } from '../../utils/supabase';
import { verifyServerSignature } from '../../utils/serverSignature';
import { formatBytes } from '../../utils/format';
import { ShieldCheck, ShieldAlert, Upload, Hash, Loader2, Download, CheckCircle, XCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

type VerifyStatus = 'idle' | 'processing' | 'success' | 'failed';

export const PublicVerify = () => {
  const { hash: urlHash } = useParams();
  const [inputMode, setInputMode] = useState<'file' | 'hash'>('file');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<VerifyStatus>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [proofData, setProofData] = useState<any>(null);
  const [isSignatureValid, setIsSignatureValid] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-verify if hash is in the URL
  useEffect(() => {
    if (urlHash && urlHash.length === 64) {
      setInputMode('hash');
      setSearchQuery(urlHash);
      verifyHash(urlHash);
    }
  }, [urlHash]);

  const verifyHash = async (hashToVerify: string) => {
    setStatus('processing');
    try {
      const { data, error } = await supabase
        .from('evidence_hashes')
        .select(`*, versions ( version_tag, merkle_root, server_signature, created_at )`)
        .eq('sha256_hash', hashToVerify)
        .maybeSingle();

      if (error || !data) {
        setStatus('failed');
        setProofData(null);
        setIsSignatureValid(null);
      } else {
        setProofData(data);
        if (data.versions?.merkle_root && data.versions?.created_at && data.versions?.server_signature) {
          const isValid = await verifyServerSignature(data.versions.merkle_root, data.versions.created_at, data.versions.server_signature);
          setIsSignatureValid(isValid);
        } else {
          setIsSignatureValid(false);
        }
        setStatus('success');
      }
    } catch {
      setStatus('failed');
    }
  };

  const handleFileUpload = async (file: File) => {
    setSelectedFile(file);
    setStatus('processing');
    try {
      const hash = await calculateFileHash(file, () => {});
      setSearchQuery(hash);
      await verifyHash(hash);
    } catch {
      setStatus('idle');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setStatus('idle');
    setProofData(null);
    setSearchQuery('');
    setSelectedFile(null);
    setIsSignatureValid(null);
  };

  const generateCertificatePdf = async () => {
    if (!proofData) return;
    const doc = new jsPDF();
    const verifyUrl = `${window.location.origin}/verify/${proofData.sha256_hash}`;

    // Dark header
    doc.setFillColor(11, 17, 32);
    doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text('ENTRUSTORY', 20, 28);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('DIGITAL INTEGRITY CERTIFICATE', 120, 28);

    doc.setTextColor(40, 40, 40);

    // Asset info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('1. Asset Information', 20, 65);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`File Name: ${proofData.file_name}`, 20, 75);
    doc.text(`File Size: ${formatBytes(proofData.file_size)}`, 20, 83);
    doc.text(`Verified: ${new Date().toUTCString()}`, 20, 91);

    // Cryptographic proofs
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('2. Cryptographic Proofs', 20, 115);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Algorithm: SHA-256 (Client-Side Zero-Knowledge)', 20, 125);
    doc.setFont('courier', 'bold');
    doc.setFontSize(8);
    doc.text(`Hash  : ${proofData.sha256_hash}`, 20, 137);
    doc.text(`Root  : ${proofData.versions?.merkle_root || 'N/A'}`, 20, 147);

    // Signature info
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('3. Signature Verification', 20, 170);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Anchored: ${proofData.created_at}`, 20, 180);
    doc.text(`Signature Valid: ${isSignatureValid ? 'YES ✓' : 'UNVERIFIED'}`, 20, 188);
    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    const sig = proofData.versions?.server_signature || 'Pending';
    const splitSig = doc.splitTextToSize(`Sig: ${sig}`, 120);
    doc.text(splitSig, 20, 198);

    // QR code
    try {
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 140, margin: 1, color: { dark: '#0B1120', light: '#ffffff' } });
      doc.addImage(qrDataUrl, 'PNG', 150, 165, 40, 40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text('Scan to verify', 160, 210);
    } catch { /* QR generation failed — skip */ }

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 270, 190, 270);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('This certificate is mathematically verifiable via the Entrustory Network.', 20, 278);
    doc.text(verifyUrl, 20, 285);

    doc.save(`Entrustory_Proof_${proofData.sha256_hash.substring(0, 8)}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 font-['Inter']">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0B1120]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500/10 border border-cyan-500/30 rounded flex items-center justify-center text-cyan-400">
              <ShieldCheck size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Entrustory</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/docs/getting-started" className="text-sm text-slate-400 hover:text-white transition-colors">Docs</Link>
            <Link to="/login" className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-cyan-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Public Verification Node
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Verify Any Asset
          </h2>
          <p className="text-slate-400 text-lg">
            Independently validate the existence, timestamp, and integrity of any digital asset anchored on Entrustory. No account required.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Input */}
          <div className="space-y-6">
            <div className="flex bg-[#111722] p-1 rounded-lg border border-slate-800">
              <button onClick={() => { setInputMode('file'); reset(); }} className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${inputMode === 'file' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Upload size={14} className="inline mr-2 -mt-0.5" />Upload File
              </button>
              <button onClick={() => { setInputMode('hash'); reset(); }} className={`flex-1 py-2.5 px-4 rounded-md text-sm font-semibold transition-all ${inputMode === 'hash' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
                <Hash size={14} className="inline mr-2 -mt-0.5" />Direct Hash
              </button>
            </div>

            {inputMode === 'file' ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => status === 'idle' && fileInputRef.current?.click()}
                className={`rounded-xl p-10 text-center flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed transition-all cursor-pointer
                  ${isDragging ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-700 bg-[#111722] hover:border-slate-600'}`}
              >
                <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                {status === 'processing' ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                    <h3 className="text-lg font-bold text-cyan-400">Hashing & Querying Ledger...</h3>
                    {selectedFile && <p className="text-sm text-slate-400 mt-1 font-mono truncate max-w-[200px]">{selectedFile.name}</p>}
                  </div>
                ) : status !== 'idle' ? (
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 border ${status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {status === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{selectedFile?.name}</h3>
                    <p className="text-sm text-slate-400 mb-6">{status === 'success' ? 'Ledger Match Found' : 'No Match Found'}</p>
                    <button onClick={(e) => { e.stopPropagation(); reset(); }} className="px-6 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-all text-sm">
                      Verify Another File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
                      <Upload size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Drag and drop any file</h3>
                    <p className="text-sm text-slate-400 mb-6">Files are hashed locally in your browser. Nothing is uploaded.</p>
                    <span className="px-6 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-lg text-sm">Browse Files</span>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-xl p-10 bg-[#111722] border border-slate-800 min-h-[300px] flex flex-col justify-center">
                {status === 'processing' ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" />
                    <h3 className="text-lg font-bold text-cyan-400">Querying Ledger...</h3>
                  </div>
                ) : status !== 'idle' ? (
                  <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 border ${status === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                      {status === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{status === 'success' ? 'Ledger Match Found' : 'No Match Found'}</h3>
                    <button onClick={reset} className="mt-6 px-6 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-all text-sm">
                      Check Another Hash
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-4 mx-auto">
                      <Hash size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 text-center">Enter SHA-256 Hash</h3>
                    <p className="text-sm text-slate-400 mb-6 text-center">Paste the 64-character hash to verify.</p>
                    <input
                      type="text"
                      placeholder="e3b0c44298fc1c149afbf4c8996fb924..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0B1120] border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono text-sm text-white placeholder-slate-600 px-4 py-3 rounded-lg outline-none transition-all text-center mb-4"
                    />
                    <button
                      onClick={() => searchQuery.trim().length === 64 && verifyHash(searchQuery.trim().toLowerCase())}
                      disabled={searchQuery.trim().length !== 64}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
                    >
                      Verify Hash
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: Result */}
          <div className="relative">
            {status === 'idle' && (
              <div className="flex flex-col items-center justify-center bg-[#0B1120]/80 backdrop-blur-sm rounded-2xl border border-dashed border-slate-800 p-16">
                <ShieldCheck size={48} className="text-slate-700 mb-4" />
                <p className="text-slate-500 font-medium">Awaiting cryptographic input...</p>
              </div>
            )}

            {status === 'failed' && (
              <div className="flex flex-col items-center justify-center bg-red-900/10 backdrop-blur-sm rounded-2xl border border-red-500/30 p-16">
                <ShieldAlert size={48} className="text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Integrity Check Failed</h3>
                <p className="text-slate-400 max-w-sm text-center text-sm">
                  This hash does not exist in the Entrustory ledger. The asset may have been modified or was never anchored.
                </p>
              </div>
            )}

            {status === 'success' && proofData && (
              <div className="bg-[#111722] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                {/* Success banner */}
                <div className="bg-emerald-500/20 border-b border-emerald-500/30 px-8 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <CheckCircle size={22} />
                    <span className="font-bold text-lg tracking-wide">INTEGRITY VERIFIED</span>
                  </div>
                  {isSignatureValid && (
                    <span className="text-emerald-400/80 text-xs font-mono bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Ed25519 ✓</span>
                  )}
                </div>

                <div className="p-8 space-y-6">
                  {/* Asset info */}
                  <div className="flex justify-between items-start pb-6 border-b border-slate-800">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Asset Name</p>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {proofData.file_name || 'Verified Hash'}
                        <CheckCircle size={16} className="text-emerald-500" />
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Anchored</p>
                      <p className="text-sm font-medium text-white">{new Date(proofData.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Signature verification */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Timestamp</p>
                      <p className="font-mono text-sm text-slate-200">{new Date(proofData.created_at).toISOString()}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Signature</p>
                      {isSignatureValid === true && (
                        <p className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle size={14} /> Cryptographically Valid</p>
                      )}
                      {isSignatureValid === false && (
                        <p className="text-xs text-red-400 flex items-center gap-1"><XCircle size={14} /> Unverified</p>
                      )}
                    </div>
                  </div>

                  {/* Merkle path */}
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Merkle Path</h4>
                    <div className="space-y-3 pl-4 border-l-2 border-slate-800">
                      <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-slate-200 border border-slate-800">
                        <span className="text-slate-500 mr-2">ROOT:</span>
                        <span className="break-all">{proofData.versions?.merkle_root}</span>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg font-mono text-xs text-emerald-400">
                        <span className="text-emerald-500 mr-2">HASH:</span>
                        <span className="break-all">{proofData.sha256_hash}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shareable link */}
                  <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-lg p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">Shareable Proof Link</p>
                      <p className="text-xs text-slate-400 font-mono break-all">{`${window.location.origin}/verify/${proofData.sha256_hash}`}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/verify/${proofData.sha256_hash}`)}
                      className="shrink-0 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="bg-slate-900/80 px-8 py-4 border-t border-slate-800 flex justify-between items-center">
                  <button onClick={generateCertificatePdf} className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
                    <Download size={16} /> Download PDF (with QR)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Entrustory. Cryptographic integrity infrastructure.</p>
          <div className="flex gap-6">
            <Link to="/docs/getting-started" className="hover:text-white transition-colors">Docs</Link>
            <Link to="/status" className="hover:text-white transition-colors">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
