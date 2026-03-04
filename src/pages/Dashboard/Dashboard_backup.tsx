import React from 'react';

export const Dashboard = () => {
  return (
    // Replaced the h-screen container with a responsive padding container
    <div className="min-h-full font-['Inter'] bg-slate-50 text-slate-800 p-8">
      <div className="w-full space-y-6">
        
        {/* Top Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 relative overflow-hidden group">
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

          {/* Card 2 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Proofs</h3>
                <p className="text-xs text-slate-400 mt-1">This billing cycle</p>
              </div>
              <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-full">fingerprint</span>
            </div>
            <div className="flex items-end gap-2 mt-4">
              <span className="text-3xl font-bold text-slate-900">2,845</span>
              <span className="text-xs font-medium text-green-600 flex items-center mb-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                +12%
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pending Verification</h3>
                <p className="text-xs text-slate-400 mt-1">Requires attention</p>
              </div>
              <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-1.5 rounded-full">pending_actions</span>
            </div>
            <div className="flex items-end gap-2 mt-4">
              <span className="text-3xl font-bold text-slate-900">4</span>
              <span className="text-xs text-slate-500 mb-1">Items awaiting signature</span>
            </div>
          </div>
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Wide Table (Spans 2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Active WorkItems</h2>
              <div className="flex gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-slate-400 text-[18px]">search</span>
                  <input 
                    type="text" 
                    placeholder="Search proofs..." 
                    className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none w-48 transition-all"
                  />
                </div>
                <button className="p-1.5 text-slate-400 hover:bg-slate-50 rounded border border-slate-200">
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                </button>
              </div>
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
                  
                  <tr className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <span className="material-symbols-outlined text-[20px]">description</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">Q3 Financial Audit</div>
                          <div className="text-xs text-slate-400">ID: wi_83js92kd</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">v2.4.1</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">2 hours ago</td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                        <span className="material-symbols-outlined text-[16px] fill-1">verified_user</span> Verified
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-blue-600 p-1">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-orange-50 flex items-center justify-center text-orange-600">
                          <span className="material-symbols-outlined text-[20px]">architecture</span>
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">Project Alpha Blueprints</div>
                          <div className="text-xs text-slate-400">ID: wi_29sk48xm</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">v1.0.0-rc2</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">5 hours ago</td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
                        <span className="material-symbols-outlined text-[16px] fill-1">shield</span> Pending Anchor
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-blue-600 p-1">
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex items-center justify-between shrink-0">
              <p className="text-xs text-slate-500">Showing 2 of 24 WorkItems</p>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs border border-slate-200 bg-white rounded text-slate-600 hover:bg-slate-50">Previous</button>
                <button className="px-3 py-1 text-xs border border-slate-200 bg-white rounded text-slate-600 hover:bg-slate-50">Next</button>
              </div>
            </div>
          </div>

          {/* Side Feed */}
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-280px)] min-h-[500px]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-semibold text-slate-800">Recent Activity</h2>
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="overflow-auto flex-1 p-6">
              <div className="relative border-l border-slate-200 ml-3 space-y-8">
                
                <div className="relative pl-8">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm"></div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-600">VersionCreated</span>
                      <span className="text-[10px] text-slate-400">2m ago</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">New version added to "Q3 Financial Audit"</p>
                    <div className="mt-1 flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="material-symbols-outlined text-slate-400 text-[16px]">fingerprint</span>
                      <span className="text-[10px] font-mono text-slate-500 truncate w-32">SHA: 8f4a...9b2c</span>
                    </div>
                  </div>
                </div>

                <div className="relative pl-8">
                  <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm"></div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-600">WorkItemCreated</span>
                      <span className="text-[10px] text-slate-400">25m ago</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium">"Project Alpha Blueprints" initialized</p>
                    <p className="text-xs text-slate-500">Created by Sarah Connor</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
