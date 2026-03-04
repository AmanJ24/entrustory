import React from 'react';

export const ApiConfig = () => {
  return (
    <div className="bg-[#101f22] font-['Space_Grotesk'] text-slate-100 min-h-full flex flex-col p-4 sm:p-10">
      <div className="flex flex-col w-full max-w-[1200px] mx-auto gap-8">
        
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              Developer API & Webhooks
            </h1>
            <p className="text-slate-400 text-base max-w-2xl">
              Manage your API keys and configure webhooks to integrate Entrustory's digital integrity proofs into your applications.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-slate-800 hover:bg-slate-700 text-white gap-2 text-sm font-bold transition-colors">
              <span className="material-symbols-outlined text-[20px]">description</span>
              <span>Read Docs</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: API Keys & Webhooks */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            
            {/* API Keys Section */}
            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-white text-xl font-bold">API Keys</h2>
                <button className="flex items-center justify-center rounded-lg h-9 px-4 bg-[#0dccf2] text-[#101f22] hover:bg-[#0ab8da] gap-2 text-sm font-bold transition-colors shadow-lg shadow-[#0dccf2]/20">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Create New Key</span>
                </button>
              </div>
              <div className="flex flex-col rounded-xl border border-[#2a4045] bg-[#152528] overflow-hidden">
                
                {/* Active Key Item */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border-b border-[#2a4045]/50 hover:bg-[#1a2e32] transition-colors group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-[#0dccf2] bg-[#0dccf2]/10 flex items-center justify-center rounded-lg shrink-0 w-12 h-12">
                      <span className="material-symbols-outlined">vpn_key</span>
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-base font-semibold leading-none">Production API Key</p>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase border border-emerald-500/20">Active</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-mono bg-black/20 rounded px-1.5 py-0.5 w-fit">
                        <span>pk_live_...9x82</span>
                        <button className="hover:text-[#0dccf2] transition-colors" title="Copy">
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        </button>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">Created Oct 24, 2026 • Last used 2m ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:self-center self-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center justify-center rounded-lg h-8 px-3 bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium transition-colors">
                      Roll Key
                    </button>
                    <button className="flex items-center justify-center rounded-lg h-8 px-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 text-sm font-medium transition-colors">
                      Revoke
                    </button>
                  </div>
                </div>

                {/* Test Key Item */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-[#1a2e32] transition-colors group">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-slate-500 bg-slate-800 flex items-center justify-center rounded-lg shrink-0 w-12 h-12">
                      <span className="material-symbols-outlined">terminal</span>
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-base font-semibold leading-none">Development Test Key</p>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase border border-amber-500/20">Test Mode</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-sm font-mono bg-black/20 rounded px-1.5 py-0.5 w-fit">
                        <span>pk_test_...a7b1</span>
                        <button className="hover:text-[#0dccf2] transition-colors" title="Copy">
                          <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        </button>
                      </div>
                      <p className="text-slate-500 text-xs mt-1">Created Nov 01, 2026 • Never used</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:self-center self-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center justify-center rounded-lg h-8 px-3 bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-medium transition-colors">
                      Reveal
                    </button>
                    <button className="flex items-center justify-center rounded-lg h-8 px-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 text-sm font-medium transition-colors">
                      Revoke
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Webhooks Section */}
            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <div>
                  <h2 className="text-white text-xl font-bold">Webhooks</h2>
                  <p className="text-slate-400 text-sm mt-1">Receive real-time updates for events.</p>
                </div>
                <button className="flex items-center justify-center rounded-lg h-9 px-4 border border-slate-700 text-white hover:bg-slate-800 gap-2 text-sm font-bold transition-colors">
                  <span className="material-symbols-outlined text-[18px]">webhook</span>
                  <span>Add Endpoint</span>
                </button>
              </div>
              <div className="flex flex-col rounded-xl border border-[#2a4045] bg-[#152528] overflow-hidden">
                <div className="p-5 border-b border-[#2a4045]/50 hover:bg-[#1a2e32] transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="text-purple-400 bg-purple-500/10 flex items-center justify-center rounded-lg shrink-0 w-10 h-10 mt-1">
                        <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white font-semibold">Primary Workflow Listener</span>
                          <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded">Live</span>
                        </div>
                        <p className="text-slate-400 text-sm font-mono break-all">https://api.yourcompany.com/webhooks/entrustory</p>
                        <div className="flex gap-2 mt-2">
                          <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-500/10">workitem.created</span>
                          <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 ring-1 ring-inset ring-slate-500/10">proof.verified</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 sm:self-start self-end">
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-400">Success rate</span>
                        <span className="text-emerald-400 font-mono text-sm">99.8%</span>
                      </div>
                      <button className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* Right Column: Code Snippet & Status */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="sticky top-6 flex flex-col gap-6">
              
              {/* Code Window */}
              <div className="bg-slate-900 dark:bg-[#0c1618] rounded-xl border border-[#2a4045] overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 bg-[#111718] border-b border-[#2a4045]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-400">Quickstart</span>
                    <select className="bg-transparent text-xs font-bold text-[#0dccf2] focus:outline-none cursor-pointer">
                      <option>Python</option>
                      <option>Node.js</option>
                      <option>Go</option>
                    </select>
                  </div>
                </div>
                <div className="p-4 overflow-x-auto">
                  <code className="text-sm font-mono leading-relaxed block text-slate-300">
                    <span className="text-pink-400">import</span> entrustory<br /><br />
                    <span className="text-slate-500"># Initialize the client</span><br />
                    client = entrustory.Client(<br />
                    &nbsp;&nbsp;api_key=<span className="text-emerald-400">"pk_live_..."</span><br />
                    )<br /><br />
                    <span className="text-slate-500"># Create a proof of work</span><br />
                    proof = client.proofs.create(<br />
                    &nbsp;&nbsp;project_id=<span className="text-emerald-400">"prj_123"</span>,<br />
                    &nbsp;&nbsp;hash=<span className="text-emerald-400">"sha256:..."</span><br />
                    )<br /><br />
                    <span className="text-blue-400">print</span>(proof.status)
                  </code>
                </div>
                <div className="bg-[#111718] px-4 py-2 border-t border-[#2a4045] flex justify-between items-center">
                  <span className="text-xs text-slate-500">entrustory-python v2.1.0</span>
                  <button className="text-xs text-[#0dccf2] hover:text-white flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    Copy
                  </button>
                </div>
              </div>

              {/* Integration Status Card */}
              <div className="rounded-xl p-5 bg-gradient-to-br from-[#0dccf2]/20 to-transparent border border-[#0dccf2]/20">
                <h3 className="text-lg font-bold text-white mb-2">Integration Status</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative flex w-3 h-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0dccf2] opacity-75"></span>
                    <span className="relative inline-flex rounded-full w-3 h-3 bg-[#0dccf2]"></span>
                  </div>
                  <span className="text-sm font-medium text-slate-300">Systems Operational</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">API Latency</span>
                    <span className="text-white font-mono">24ms</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-[#0dccf2] h-1.5 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Success Rate (24h)</span>
                    <span className="text-white font-mono">100%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
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
