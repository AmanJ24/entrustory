import React from 'react';

export const ActivityLog = () => {
  return (
    <div className="flex-1 w-full bg-[#111718] text-white font-['Space_Grotesk'] overflow-x-hidden p-4 md:p-6 lg:p-8">
      <style>{`
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #111718; }
        ::-webkit-scrollbar-thumb { background: #283639; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3b5054; }
      `}</style>

      {/* Page Header */}
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
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#283639] hover:bg-[#1b2527] text-white text-sm font-semibold transition-colors">
            <span className="material-symbols-outlined text-[18px]">settings</span>
            <span>Log Settings</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0dccf2] hover:bg-cyan-400 text-[#111718] text-sm font-bold shadow-[0_0_20px_rgba(13,204,242,0.2)] transition-all transform active:scale-95">
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Export Signed Report</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[#1b2527] rounded-xl border border-[#283639] p-4 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9cb5ba]">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              placeholder="Search by Resource ID, Actor, Hash, or IP..."
              className="w-full bg-[#111718] border border-[#283639] focus:border-[#0dccf2] focus:ring-1 focus:ring-[#0dccf2] rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#9cb5ba] outline-none transition-all"
            />
          </div>
          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            {['Date Range', 'Action Type', 'Actor', 'Status'].map((filter, index) => (
              <button key={index} className="group flex items-center gap-2 px-3 py-2.5 bg-[#111718] border border-[#283639] rounded-lg hover:border-[#0dccf2]/50 transition-colors min-w-[140px] justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#9cb5ba] group-hover:text-[#0dccf2]">
                    {index === 0 ? 'calendar_today' : index === 1 ? 'category' : index === 2 ? 'person' : 'toggle_on'}
                  </span>
                  <span className="text-sm font-medium text-slate-200">{filter}</span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#9cb5ba]">expand_more</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Applied Filters Tags */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#283639]">
          <span className="text-xs font-semibold text-[#9cb5ba] uppercase tracking-wider py-1">Active Filters:</span>
          <div className="flex items-center gap-1 pl-2 pr-1 py-0.5 bg-[#0dccf2]/10 border border-[#0dccf2]/20 rounded text-xs font-medium text-[#0dccf2]">
            <span>Status: Verified</span>
            <button className="hover:bg-[#0dccf2]/20 rounded p-0.5"><span className="material-symbols-outlined text-[14px]">close</span></button>
          </div>
          <button className="text-xs text-[#9cb5ba] hover:text-white underline ml-2">Clear all</button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#1b2527] rounded-xl border border-[#283639] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111718] border-b border-[#283639]">
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider w-[220px]">Timestamp (UTC)</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider w-[200px]">Actor</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider w-[200px]">Action Type</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider">Resource ID</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider w-[150px]">IP Address</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9cb5ba] uppercase tracking-wider text-center w-[100px]">Status</th>
                <th className="px-4 py-4 w-[50px]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#283639]">
              
              {/* Row 1 */}
              <tr className="group hover:bg-[#283639]/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                    <span className="text-sm font-medium text-slate-300">2026-10-27 14:32:01</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">AA</div>
                    <span className="text-sm font-medium text-white">Alice Admin</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-900/20 text-blue-300 text-xs font-semibold border border-blue-800">
                    <span className="material-symbols-outlined text-[14px]">edit_document</span> Signature Generated
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-xs text-[#9cb5ba] bg-[#111718] px-2 py-1 rounded border border-[#283639]">doc-8392-ver</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#9cb5ba] font-mono">192.168.1.54</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center">
                    <span className="material-symbols-outlined text-green-500 text-[20px]" title="Verified">check_circle</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="group hover:bg-[#283639]/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                    <span className="text-sm font-medium text-slate-300">2026-10-27 14:30:45</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">API</div>
                    <span className="text-sm font-medium text-white">System API</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-900/20 text-green-300 text-xs font-semibold border border-green-800">
                    <span className="material-symbols-outlined text-[14px]">verified</span> Hash Verified
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-xs text-[#9cb5ba] bg-[#111718] px-2 py-1 rounded border border-[#283639]">img-2211-raw</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#9cb5ba] font-mono">10.0.0.12</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center">
                    <span className="material-symbols-outlined text-green-500 text-[20px]" title="Verified">check_circle</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </td>
              </tr>

              {/* Row 3 (Alert) */}
              <tr className="group hover:bg-[#283639]/30 transition-colors bg-red-900/10">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">schedule</span>
                    <span className="text-sm font-medium text-slate-300">2026-10-27 14:15:22</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">BU</div>
                    <span className="text-sm font-medium text-white">Bob User</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-900/20 text-red-300 text-xs font-semibold border border-red-800">
                    <span className="material-symbols-outlined text-[14px]">block</span> Access Revoked
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono text-xs text-[#9cb5ba] bg-[#111718] px-2 py-1 rounded border border-[#283639]">key-9981-sec</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-[#9cb5ba] font-mono">172.16.0.2</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex justify-center">
                    <span className="material-symbols-outlined text-red-500 text-[20px]" title="Alert">error</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <button className="text-slate-400 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                  </button>
                </td>
              </tr>
              
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#283639] bg-[#1b2527]/50">
          <div className="text-sm text-[#9cb5ba]">
            Showing <span className="font-semibold text-white">1</span> to <span className="font-semibold text-white">3</span> of <span className="font-semibold text-white">128</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-[#283639] text-slate-400 hover:text-[#0dccf2] hover:border-[#0dccf2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 rounded-lg bg-[#0dccf2] text-[#111718] text-sm font-bold">1</button>
              <button className="w-8 h-8 rounded-lg hover:bg-[#283639] text-[#9cb5ba] text-sm font-medium transition-colors">2</button>
              <button className="w-8 h-8 rounded-lg hover:bg-[#283639] text-[#9cb5ba] text-sm font-medium transition-colors">3</button>
              <span className="text-[#9cb5ba] px-1">...</span>
              <button className="w-8 h-8 rounded-lg hover:bg-[#283639] text-[#9cb5ba] text-sm font-medium transition-colors">12</button>
            </div>
            <button className="p-2 rounded-lg border border-[#283639] text-slate-400 hover:text-[#0dccf2] hover:border-[#0dccf2] transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
