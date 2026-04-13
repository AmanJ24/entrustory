import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatBytes } from '../../utils/format';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { 
  FileCheck, Download, FileJson, FileText, 
  CheckCircle, Loader2, History, Link as LinkIcon, ShieldCheck
} from 'lucide-react';
import type { ExportItem } from '../../types';

export const ExportCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // <-- Initialize navigate
  const [items, setItems] = useState<ExportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const [exportFormat, setExportFormat] = useState<'pdf' | 'json'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchExportData = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('versions')
          .select(`
            id, version_tag, created_at, merkle_root, server_signature,
            work_items!inner(name, workspace_id),
            evidence_hashes(file_name, file_size, sha256_hash)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedData: ExportItem[] = data.map((v: any) => ({
          id: v.id,
          work_item_name: v.work_items.name,
          version_tag: v.version_tag,
          created_at: v.created_at,
          merkle_root: v.merkle_root,
          server_signature: v.server_signature,
          file_name: v.evidence_hashes?.[0]?.file_name || 'Unknown',
          file_size: v.evidence_hashes?.[0]?.file_size || 0,
          sha256_hash: v.evidence_hashes?.[0]?.sha256_hash || 'Unknown',
        }));

        setItems(formattedData);
      } catch (err) {
        console.error("Error fetching export data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExportData();
  }, [user]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map(i => i.id)));
  };



  const selectedItemsData = items.filter(i => selectedIds.has(i.id));
  const totalSelectedSize = selectedItemsData.reduce((acc, curr) => acc + curr.file_size, 0);

  const handleExport = async () => {
    if (selectedIds.size === 0) return;
    setIsExporting(true);

    try {
      if (exportFormat === 'json') {
        const payload = JSON.stringify({
          generated_at: new Date().toISOString(),
          issuer: "Entrustory OS",
          total_records: selectedItemsData.length,
          records: selectedItemsData
        }, null, 2);

        const blob = new Blob([payload], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Entrustory_Batch_Export_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } 
      else if (exportFormat === 'pdf') {
        const doc = new jsPDF();
        
        doc.setFillColor(11, 17, 32);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(13, 204, 242);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(30);
        doc.text("ENTRUSTORY", 105, 100, { align: "center" });
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text("CHAIN OF CUSTODY BATCH REPORT", 105, 115, { align: "center" });
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated: ${new Date().toUTCString()}`, 105, 140, { align: "center" });
        doc.text(`Total Records: ${selectedItemsData.length}`, 105, 150, { align: "center" });

        selectedItemsData.forEach((item, index) => {
          doc.addPage();
          doc.setFillColor(255, 255, 255);
          doc.rect(0, 0, 210, 297, 'F');
          
          doc.setTextColor(40, 40, 40);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          doc.text(`Record ${index + 1}: ${item.work_item_name}`, 20, 30);
          
          doc.setFontSize(11);
          doc.setFont("helvetica", "normal");
          doc.text(`Version Tag: ${item.version_tag}`, 20, 45);
          doc.text(`File Name: ${item.file_name}`, 20, 52);
          doc.text(`File Size: ${item.file_size} Bytes`, 20, 59);
          doc.text(`Anchored At: ${new Date(item.created_at).toUTCString()}`, 20, 66);

          doc.setFont("helvetica", "bold");
          doc.text("Cryptographic Proofs", 20, 85);
          
          doc.setFont("courier", "normal");
          doc.setFontSize(9);
          doc.text(`SHA-256 Hash : ${item.sha256_hash}`, 20, 95);
          doc.text(`Merkle Root  : ${item.merkle_root}`, 20, 105);
          
          const splitSig = doc.splitTextToSize(`Server Sig   : ${item.server_signature || 'Pending L4'}`, 170);
          doc.text(splitSig, 20, 115);

          doc.setDrawColor(200, 200, 200);
          doc.line(20, 270, 190, 270);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text("Mathematically verifiable via Entrustory Zero-Knowledge Protocol.", 20, 280);
        });

        doc.save(`Entrustory_Batch_Export_${Date.now()}.pdf`);
      }
      
      // Log the export event in Supabase!
      const wsResponse = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user?.id).limit(1).single();
      if (wsResponse.data) {
        await supabase.from('audit_logs').insert([{ 
          workspace_id: wsResponse.data.workspace_id, actor_id: user?.id, action_type: 'export_generated',
          details: { message: `Exported ${selectedItemsData.length} records as ${exportFormat.toUpperCase()}` }
        }]);
      }

    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to generate export bundle.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-surface font-['Inter'] text-on-surface min-h-full flex flex-col p-6 sm:p-10 relative z-0">
      <div className="absolute top-0 left-1/4 w-1/2 h-96 bg-surface-container-highest/10 blur-[120px] -z-10 pointer-events-none"></div>

      <div className="flex flex-col w-full max-w-[1400px] mx-auto gap-8 pb-20">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-surface-variant pb-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white font-display">Evidence Export Center</h1>
            <p className="text-on-surface-variant max-w-2xl text-sm">
              Bundle digital integrity proofs for legal and compliance review. All exports include cryptographic signatures and immutable timestamps.
            </p>
          </div>
          {/* --- FIXED: View Past Exports Button --- */}
          <button 
            onClick={() => navigate('/app/logs')}
            className="px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-variant hover:border-tertiary font-bold text-sm transition-all flex items-center gap-2 text-white bg-surface-container-low"
          >
            <History size={16} className="text-tertiary" />
            View Past Exports
          </button>
        </div>

        {/* ... Rest of the ExportCenter UI remains unchanged ... */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-tertiary text-[#0e0e0e] font-bold text-sm">1</span>
                <h2 className="text-lg font-bold text-white">Select Records</h2>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-surface-variant bg-surface-container-low shadow-lg h-[400px] flex flex-col">
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse relative">
                    <thead className="bg-surface sticky top-0 z-10 border-b border-surface-variant">
                      <tr>
                        <th className="px-4 py-3 w-12 text-center">
                          <input type="checkbox" onChange={toggleAll} checked={items.length > 0 && selectedIds.size === items.length} className="rounded border-outline bg-surface-variant text-tertiary focus:ring-tertiary" />
                        </th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">WorkItem</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Version</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Timestamp (UTC)</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {loading ? (
                        <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin text-tertiary mx-auto" /></td></tr>
                      ) : items.length === 0 ? (
                        <tr><td colSpan={5} className="p-10 text-center text-on-surface-variant">No cryptographic records found.</td></tr>
                      ) : (
                        items.map(item => (
                          <tr key={item.id} onClick={() => toggleSelection(item.id)} className="hover:bg-surface-variant/30 transition-colors cursor-pointer group">
                            <td className="px-4 py-4 text-center">
                              <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => {}} className="rounded border-outline bg-surface-variant text-tertiary focus:ring-tertiary" />
                            </td>
                            <td className="px-4 py-4 text-sm font-medium text-white">{item.work_item_name}</td>
                            <td className="px-4 py-4 text-xs text-on-surface-variant font-mono">{item.version_tag}</td>
                            <td className="px-4 py-4 text-xs text-on-surface-variant">{new Date(item.created_at).toLocaleString()}</td>
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-wide border border-emerald-500/20">
                                <CheckCircle size={10} /> Anchored
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-tertiary text-[#0e0e0e] font-bold text-sm">2</span>
                <h2 className="text-lg font-bold text-white">Export Format</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div onClick={() => setExportFormat('pdf')} className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${exportFormat === 'pdf' ? 'border-tertiary bg-tertiary/10' : 'border-surface-variant bg-surface-container-low hover:border-outline-variant'}`}>
                  <div className="flex-1">
                    <span className="block text-sm font-bold text-white mb-1">Signed PDF Archive</span>
                    <span className="block text-xs text-on-surface-variant">Human-readable report including visual proof of signature and chain metadata.</span>
                  </div>
                  <FileText className={exportFormat === 'pdf' ? 'text-tertiary' : 'text-on-surface-variant'} size={24} />
                </div>
                <div onClick={() => setExportFormat('json')} className={`relative flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${exportFormat === 'json' ? 'border-tertiary bg-tertiary/10' : 'border-surface-variant bg-surface-container-low hover:border-outline-variant'}`}>
                  <div className="flex-1">
                    <span className="block text-sm font-bold text-white mb-1">Technical JSON Bundle</span>
                    <span className="block text-xs text-on-surface-variant">Machine-verifiable JSON containing raw cryptographic hashes and Merkle paths.</span>
                  </div>
                  <FileJson className={exportFormat === 'json' ? 'text-tertiary' : 'text-on-surface-variant'} size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-tertiary text-[#0e0e0e] font-bold text-sm">3</span>
              <h2 className="text-lg font-bold text-white">Export Summary</h2>
            </div>
            
            <div className="rounded-xl border border-surface-variant bg-surface-container-low shadow-2xl overflow-hidden flex flex-col h-full min-h-[500px] xl:max-h-[640px]">
              <div className="p-4 bg-surface border-b border-surface-variant flex justify-between items-center">
                <span className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Draft Details</span>
                <ShieldCheck size={16} className="text-tertiary" />
              </div>
              
              <div className="flex-1 p-6 space-y-6 relative overflow-y-auto">
                <div className="absolute left-9 top-10 bottom-10 w-px bg-slate-700 border-dashed border-l"></div>
                
                <div className="relative flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-surface-variant border border-outline flex items-center justify-center z-10 shrink-0 mt-1"><FileCheck size={12} className="text-on-surface" /></div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant">Step 1</p>
                    <p className="text-sm font-medium text-white mb-1">Extract Hashes</p>
                    <p className="text-[10px] text-on-surface-variant">Pulling raw SHA-256 arrays from DB</p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-surface-variant border border-outline flex items-center justify-center z-10 shrink-0 mt-1"><LinkIcon size={12} className="text-on-surface" /></div>
                  <div>
                    <p className="text-xs font-bold text-on-surface-variant">Step 2</p>
                    <p className="text-sm font-medium text-white mb-1">Resolve Merkle Paths</p>
                    <p className="text-[10px] text-on-surface-variant">Attaching root vectors to selection</p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-tertiary/20 border border-tertiary flex items-center justify-center z-10 shrink-0 mt-1"><span className="material-symbols-outlined text-[12px] text-tertiary font-bold">draw</span></div>
                  <div>
                    <p className="text-xs font-bold text-tertiary">Step 3</p>
                    <p className="text-sm font-medium text-white mb-1">Compile Signatures</p>
                    <p className="text-[10px] text-on-surface-variant">Attaching Ed25519/HMAC auth tags</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-surface border-t border-surface-variant text-xs">
                <div className="flex justify-between mb-2">
                  <span className="text-on-surface-variant">Selected Items:</span>
                  <span className="font-bold text-white">{selectedIds.size} Records</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Original Data Size:</span>
                  <span className="font-bold text-white font-mono">{formatBytes(totalSelectedSize)}</span>
                </div>
              </div>
              
              <div className="p-4 bg-surface-container-low">
                <button onClick={handleExport} disabled={selectedIds.size === 0 || isExporting} className="w-full bg-tertiary hover:bg-tertiary disabled:opacity-50 text-[#0e0e0e] font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2">
                  {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                  {isExporting ? 'Generating...' : `Export ${selectedIds.size} Proofs`}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
