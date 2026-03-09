import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Added this
import { 
  CheckCircle, Fingerprint, 
  FileText, MoreVertical, TrendingUp, ShieldAlert, Loader2
} from 'lucide-react';
import { supabase } from '../../utils/supabase';

// --- Types based on your SQL Schema ---
interface WorkItem {
  id: string;
  name: string;
  created_at: string;
  versions: { version_tag: string }[];
}

interface AuditLog {
  id: string;
  action_type: string;
  created_at: string;
  details: any;
  actor_id: string;
}

const [pendingAnchors, setPendingAnchors] = useState(0);

// --- Helper to format "2 mins ago" ---
const timeAgo = (dateString: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export const Dashboard = () => {
  const navigate = useNavigate(); // <-- Initialized navigation
  
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalProofs, setTotalProofs] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch WorkItems with their latest version tag
      const { data: itemsData, error: itemsError } = await supabase
        .from('work_items')
        .select(`
          id, name, created_at,
          versions ( version_tag )
        `)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (itemsError) throw itemsError;
      setWorkItems(itemsData as WorkItem[]);

      // 2. Fetch Total Proofs Count
      const { count, error: countError } = await supabase
        .from('versions')
        .select('*', { count: 'exact', head: true });
      
      if (!countError) setTotalProofs(count || 0);

      const { count: pendingCount } = await supabase
        .from('versions')
        .select('*', { count: 'exact', head: true })
        .is('blockchain_anchor_id', null); // is null means it hasn't been batched yet!
      
      setPendingAnchors(pendingCount || 0);
        
      // 3. Fetch Recent Audit Logs
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!logsError) setLogs(logsData as AuditLog[]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for the custom event fired by the "New WorkItem" modal
    window.addEventListener('refresh_dashboard', fetchDashboardData);
    return () => window.removeEventListener('refresh_dashboard', fetchDashboardData);
  }, []);

  return (
    <div className="min-h-full font-['Inter'] bg-slate-50 text-slate-800 p-8">
      <div className="w-full space-y-6 max-w-[1600px] mx-auto">
        
        {/* Top Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">System Health</h3>
                <p className="text-xs text-slate-400 mt-1">Infrastructure Status</p>
              </div>
              <span className="material-symbols-outlined text-green-500 bg-green-50 p-1.5 rounded-full">check_circle</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Merkle Engine
                </div>
                <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded">OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Signature Layer
                </div>
                <span className="text-xs font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded">OPERATIONAL</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Proofs</h3>
                <p className="text-xs text-slate-400 mt-1">Secured records</p>
              </div>
              <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-full">fingerprint</span>
            </div>
            <div className="flex items-end gap-2 mt-4">
              <span className="text-3xl font-bold text-slate-900">
                {loading ? <Loader2 className="animate-spin text-slate-300" /> : totalProofs}
              </span>
              {!loading && totalProofs > 0 && (
                <span className="text-xs font-medium text-green-600 flex items-center mb-1">
                  <TrendingUp size={14} className="mr-1" /> +1
                </span>
              )}
            </div>
          </div>

          {/* Pending Action Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Anchors</h3>
                <p className="text-xs text-slate-400 mt-1">Requires L4 processing</p>
              </div>
              <span className={`material-symbols-outlined p-1.5 rounded-full ${pendingAnchors > 0 ? 'text-amber-500 bg-amber-50' : 'text-emerald-500 bg-emerald-50'}`}>
                {pendingAnchors > 0 ? 'pending_actions' : 'verified'}
              </span>
            </div>
            <div className="flex items-end gap-2 mt-4">
              <span className="text-3xl font-bold text-slate-900">
                {loading ? <Loader2 className="animate-spin text-slate-300" /> : pendingAnchors}
              </span>
              <span className="text-xs text-slate-500 mb-1">
                {pendingAnchors > 0 ? 'Awaiting batch transaction' : 'Blockchain synced'}
              </span>
            </div>
          </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Table: Active WorkItems */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Active WorkItems</h2>
            </div>
            
            <div className="overflow-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 w-1/3">Project Name</th>
                    <th className="px-6 py-3">Version</th>
                    <th className="px-6 py-3">Last Updated</th>
                    <th className="px-6 py-3">Integrity Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">
                        <Loader2 className="animate-spin mx-auto mb-2" /> Loading ledger...
                      </td>
                    </tr>
                  ) : workItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-slate-400">
                        No WorkItems found. Click "+ New WorkItem" to secure a file.
                      </td>
                    </tr>
                  ) : (
                    workItems.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => navigate(`/app/workspace/${item.id}`)} // <-- The fix is here
                        className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <FileText size={18} />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</div>
                              <div className="text-xs text-slate-400 font-mono">ID: {item.id.split('-')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                            {item.versions?.[0]?.version_tag || 'v1.0'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">{timeAgo(item.created_at)}</td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle size={14} /> Verified
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-blue-600 p-1">
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Activity Log Feed */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
            </div>
            <div className="overflow-auto flex-1 p-6">
              <div className="relative border-l border-slate-200 ml-3 space-y-8">
                {loading ? (
                   <p className="text-center text-slate-400 mt-4 text-sm">Loading logs...</p>
                ) : logs.length === 0 ? (
                  <p className="text-center text-slate-400 mt-4 text-sm">No activity recorded yet.</p>
                ) : (
                  logs.map((log) => {
                    let color = 'bg-slate-400';
                    if (log.action_type === 'workitem_created') color = 'bg-emerald-500';
                    if (log.action_type === 'workspace_created') color = 'bg-blue-500';

                    return (
                      <div key={log.id} className="relative pl-8">
                        <div className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white shadow-sm ${color}`}></div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold capitalize text-slate-700">
                              {log.action_type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-slate-400">{timeAgo(log.created_at)}</span>
                          </div>
                          <p className="text-sm text-slate-600 font-medium">
                            {log.details?.message || `System executed: ${log.action_type}`}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">ACTOR: {log.actor_id.split('-')[0]}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
