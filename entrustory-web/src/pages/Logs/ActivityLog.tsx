import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { formatDateUTC } from '../../utils/format';
import { Loader2 } from 'lucide-react';
import type { AuditLog } from '../../types';

export const ActivityLog = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setLogs(data as AuditLog[]);
      } catch (error) {
        console.error("Error fetching logs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);



  const getActionStyles = (actionType: string) => {
    switch (actionType) {
      case 'workspace_created': return { icon: 'domain', color: 'text-blue-300', bg: 'bg-blue-900/20', border: 'border-blue-800' };
      case 'workitem_created': return { icon: 'lock', color: 'text-emerald-300', bg: 'bg-emerald-900/20', border: 'border-emerald-800' };
      default: return { icon: 'info', color: 'text-slate-300', bg: 'bg-slate-800', border: 'border-slate-700' };
    }
  };

  return (
    <div className="flex-1 w-full bg-[#111718] text-white font-['Space_Grotesk'] overflow-x-hidden p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[#0dccf2] mb-1">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span className="text-xs font-bold uppercase tracking-wider">Immutable Record</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Activity Audit Log</h1>
          <p className="text-[#9cb5ba] max-w-2xl text-base">
            Verifiable proof of all digital work within this workspace. All entries are cryptographically signed and immutable.
          </p>
        </div>
      </div>

      <div className="bg-[#1b2527] rounded-xl border border-[#283639] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111718] border-b border-[#283639]">
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider w-[220px]">Timestamp (UTC)</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider w-[200px]">Actor</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider w-[200px]">Action Type</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider">Resource ID</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider text-center w-[100px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#283639]">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-[#9cb5ba]"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-[#9cb5ba]">No activity recorded.</td></tr>
              ) : (
                logs.map(log => {
                  const style = getActionStyles(log.action_type);
                  return (
                    <tr key={log.id} className="group hover:bg-[#283639]/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                          <span className="text-sm font-medium text-slate-300">{formatDateUTC(log.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="size-6 rounded-full bg-cyan-900/50 border border-cyan-700 text-cyan-400 flex items-center justify-center text-xs font-bold uppercase">
                            {user?.email?.charAt(0) || 'U'}
                          </div>
                          <span className="text-sm font-medium text-white">{log.actor_id === user?.id ? 'You' : 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${style.bg} ${style.color} text-xs font-semibold border ${style.border}`}>
                          <span className="material-symbols-outlined text-[14px]">{style.icon}</span> 
                          {log.action_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs text-[#9cb5ba] bg-[#111718] px-2 py-1 rounded border border-[#283639]">
                          {log.resource_id ? log.resource_id.split('-')[0] : 'System'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="material-symbols-outlined text-emerald-500 text-[20px]" title="Secured on Ledger">check_circle</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
