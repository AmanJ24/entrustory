import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  FileText, MoreVertical, TrendingUp, Loader2
} from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { timeAgo } from '../../utils/format';
import { useCountUp } from '../../hooks/useCountUp';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import type { DashboardWorkItem, AuditLog } from '../../types';



export const Dashboard = () => {
  const navigate = useNavigate();
  
  // State Management
  const [workItems, setWorkItems] = useState<DashboardWorkItem[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalProofs, setTotalProofs] = useState(0);
  const [pendingAnchors, setPendingAnchors] = useState(0);
  const [loading, setLoading] = useState(true);

  // Animated counters
  const animatedProofs = useCountUp(totalProofs);
  const animatedAnchors = useCountUp(pendingAnchors);

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
      setWorkItems(itemsData as DashboardWorkItem[]);

      // 2. Fetch Total Proofs Count
      const { count: totalCount, error: countError } = await supabase
        .from('versions')
        .select('*', { count: 'exact', head: true });
      
      if (!countError) setTotalProofs(totalCount || 0);

      // 3. Fetch Pending Blockchain Anchors Count (Files waiting for Layer 4 cron job)
      const { count: pendingCount, error: pendingError } = await supabase
        .from('versions')
        .select('*', { count: 'exact', head: true })
        .is('blockchain_anchor_id', null);
      
      if (!pendingError) setPendingAnchors(pendingCount || 0);

      // 4. Fetch Recent Audit Logs
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

    // Listen for the custom event fired by the "New WorkItem" modal to auto-refresh the UI
    window.addEventListener('refresh_dashboard', fetchDashboardData);
    return () => window.removeEventListener('refresh_dashboard', fetchDashboardData);
  }, []);

  return (
    <div className="min-h-full font-['Inter'] bg-surface text-on-surface p-8">
      <div className="w-full space-y-6 max-w-[1600px] mx-auto">
        
        {/* --- Top Metrics Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Metric 1: System Health */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant shadow-sm p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">System Health</h3>
                <p className="text-xs text-on-surface-variant mt-1">Infrastructure Status</p>
              </div>
              <span className="material-symbols-outlined text-emerald-400 bg-emerald-900/30 p-1.5 rounded-full">check_circle</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Merkle Engine
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 px-2 py-0.5 rounded">OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-on-surface">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Signature Layer
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 border border-emerald-800/50 px-2 py-0.5 rounded">OPERATIONAL</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Total Proofs */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Total Proofs</h3>
                <p className="text-xs text-on-surface-variant mt-1">Secured records</p>
              </div>
              <span className="material-symbols-outlined text-blue-400 bg-blue-900/30 p-1.5 rounded-full">fingerprint</span>
            </div>
            <div className="flex items-end gap-2 mt-4">
              <span className="text-3xl font-bold text-white">
                {loading ? <Loader2 className="animate-spin text-on-surface" /> : animatedProofs}
              </span>
              {!loading && totalProofs > 0 && (
                <span className="text-xs font-medium text-emerald-400 flex items-center mb-1">
                  <TrendingUp size={14} className="mr-1" /> Active
                </span>
              )}
            </div>
          </div>

          {/* Metric 3: Pending Anchors (Layer 4) */}
          <div className="bg-surface-container-low rounded-xl border border-outline-variant shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider">Pending Anchors</h3>
                <p className="text-xs text-on-surface-variant mt-1">Requires L4 processing</p>
              </div>
              <span className={`material-symbols-outlined p-1.5 rounded-full ${pendingAnchors > 0 ? 'text-amber-400 bg-amber-900/30' : 'text-emerald-400 bg-emerald-900/30'}`}>
                {pendingAnchors > 0 ? 'pending_actions' : 'verified'}
              </span>
            </div>
            <div className="flex items-end gap-2 mt-4">
              <span className="text-3xl font-bold text-white">
                {loading ? <Loader2 className="animate-spin text-on-surface" /> : animatedAnchors}
              </span>
              <span className="text-xs text-on-surface-variant mb-1">
                {pendingAnchors > 0 ? 'Awaiting batch transaction' : 'Blockchain synced'}
              </span>
            </div>
          </div>
        </div>

        {/* --- Main Content Row --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Area: Active WorkItems Table */}
          <div className="lg:col-span-2 bg-surface-container-low rounded-xl border border-outline-variant shadow-sm flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
            <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between shrink-0">
              <h2 className="text-base font-semibold text-white">Active WorkItems</h2>
            </div>
            
            <div className="overflow-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container text-on-surface-variant font-medium border-b border-outline-variant/40 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 w-1/3">Project Name</th>
                    <th className="px-6 py-3">Version</th>
                    <th className="px-6 py-3">Last Updated</th>
                    <th className="px-6 py-3">Integrity Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {loading ? (
                    <TableRowSkeleton columns={5} rows={5} />
                  ) : workItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-on-surface-variant">
                        No WorkItems found. Click "+ New WorkItem" to secure a file.
                      </td>
                    </tr>
                  ) : (
                    workItems.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => navigate(`/app/workspace/${item.id}`)}
                        className="hover:bg-surface-variant/20 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded bg-surface-variant flex items-center justify-center text-tertiary">
                              <FileText size={18} />
                            </div>
                            <div>
                              <div className="font-medium text-on-surface group-hover:text-tertiary transition-colors truncate max-w-[200px]">{item.name}</div>
                              <div className="text-xs text-on-surface-variant font-mono">ID: {item.id?.split('-')[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-surface-container border border-outline-variant/50 px-2 py-1 rounded text-on-surface-variant">
                            {item.versions?.[0]?.version_tag || 'v1.0'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">{timeAgo(item.created_at)}</td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border bg-emerald-900/30 text-emerald-400 border-emerald-800/50">
                            <CheckCircle size={12} /> Verified
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-on-surface-variant hover:text-tertiary p-1 transition-colors">
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

          {/* Right Area: Activity Log Feed */}
          <div className="lg:col-span-1 bg-surface-container-low rounded-xl border border-outline-variant shadow-sm flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
            <div className="px-6 py-4 border-b border-outline-variant/50 flex items-center justify-between shrink-0">
              <h2 className="text-base font-semibold text-white">Recent Activity</h2>
            </div>
            <div className="overflow-auto flex-1 p-6">
              <div className="relative border-l border-outline-variant/40 ml-3 space-y-8">
                {loading ? (
                   <p className="text-center text-on-surface-variant mt-4 text-sm">Loading logs...</p>
                ) : logs.length === 0 ? (
                  <p className="text-center text-on-surface-variant mt-4 text-sm">No activity recorded yet.</p>
                ) : (
                  logs.map((log) => {
                    let color = 'bg-outline border-outline';
                    if (log.action_type === 'workitem_created') color = 'bg-emerald-500 border-emerald-500';
                    if (log.action_type === 'version_created') color = 'bg-blue-500 border-blue-500';
                    if (log.action_type === 'workspace_created') color = 'bg-purple-500 border-purple-500';

                    return (
                      <div key={log.id} className="relative pl-6">
                        <div className={`absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-surface-container-low shadow-sm ${color}`}></div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold capitalize text-on-surface">
                              {log.action_type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-on-surface-variant whitespace-nowrap ml-2">{timeAgo(log.created_at)}</span>
                          </div>
                          <p className="text-sm text-on-surface-variant font-medium">
                            {(log.details as Record<string, string>)?.message || `System executed: ${log.action_type}`}
                          </p>
                          <p className="text-[10px] text-on-surface-variant/60 font-mono mt-1">ACTOR: {log.actor_id?.split('-')[0]}</p>
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
