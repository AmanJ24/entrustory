import React from 'react';

export const TeamManagement = () => {
  return (
    <div className="relative min-h-full font-['Space_Grotesk'] text-slate-100 bg-[#101f22] z-0">
      {/* Background gradient decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[#162629] to-transparent pointer-events-none -z-10"></div>
      
      <div className="max-w-[1200px] mx-auto p-6 md:p-12 flex flex-col gap-8 h-full">
        
        {/* Page Header */}
        <div className="flex flex-wrap justify-between items-end gap-4 border-b border-[#2a4045] pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl font-bold tracking-tight">Workspace Members</h1>
            <p className="text-[#9caeb3] text-base">Manage team access and control permissions for your Entrustory workspace.</p>
          </div>
          <button className="flex items-center gap-2 bg-[#0dccf2] hover:bg-[#0ab0d1] text-[#101f22] font-bold px-5 py-2.5 rounded-lg transition-all shadow-[0_0_15px_-3px_rgba(13,204,242,0.4)] hover:shadow-[0_0_20px_-3px_rgba(13,204,242,0.6)]">
            <span className="material-symbols-outlined text-xl">person_add</span>
            <span>Invite Member</span>
          </button>
        </div>

        {/* Content Container */}
        <div className="flex flex-col gap-6">
          
          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9caeb3]">search</span>
              <input
                type="text"
                placeholder="Search by name, email or public key..."
                className="w-full bg-[#162629] border border-[#2a4045] rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-[#9caeb3] focus:outline-none focus:border-[#0dccf2] focus:ring-1 focus:ring-[#0dccf2] transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2a4045] bg-[#162629] text-[#9caeb3] hover:text-white hover:border-[#9caeb3] transition-all">
                <span className="material-symbols-outlined text-lg">filter_list</span>
                <span className="text-sm font-medium">Filter</span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2a4045] bg-[#162629] text-[#9caeb3] hover:text-white hover:border-[#9caeb3] transition-all">
                <span className="material-symbols-outlined text-lg">download</span>
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          {/* Members Table */}
          <div className="w-full overflow-hidden rounded-xl border border-[#2a4045] bg-[#101f22] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#162629] border-b border-[#2a4045]">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#9caeb3] w-1/4">User</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#9caeb3] w-1/6">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#9caeb3] w-1/3">Public Key Fingerprint</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#9caeb3] text-right w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a4045]">
                  
                  {/* Row 1 */}
                  <tr className="group hover:bg-[#1e3236] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-cover bg-center ring-1 ring-[#2a4045]" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC5MebOgM_GuZZzNvVlQCjyQloCmNjw1kfzGUfZajy4aEdaPPeVvLnHJ7pCRP7Ih731DD6oFa9YJgzc3Bn44YrP0v3wNK1t2Rti8d3gcW4jUkHJklq4wC5DhTxMAmyGw3gQHU_OOhMqjlJSWoE5oFP5Gr8mR6oLnaogkz2w7gl0KwFC1XuaMNMc2kXgJmHi_x4OXNEbtG2A3gMewTUaOVYd44PdKZKiX7jNyjdstyuWAX5Ae0eijNNS4LY3hnC3ZrsM_DL2Dwu2GA")' }}></div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">Alice Chen</span>
                          <span className="text-xs text-[#9caeb3]">alice@entrustory.com</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0dccf2]/20 text-[#0dccf2] border border-[#0dccf2]/20">Owner</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-mono text-sm text-[#9caeb3] group-hover:text-[#0dccf2] transition-colors cursor-pointer" title="Click to copy">
                        <span className="material-symbols-outlined text-base">fingerprint</span>
                        <span>0x4f82...a1b2</span>
                        <span className="material-symbols-outlined text-base opacity-0 group-hover:opacity-100 transition-opacity">content_copy</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-[#9caeb3] hover:text-white p-2 rounded-lg hover:bg-[#2a4045] transition-all">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="group hover:bg-[#1e3236] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-cover bg-center ring-1 ring-[#2a4045]" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCjv_8d4wKw2ZhV3YD60SyEuKvwwqjYK7fXJKMjIOtTYwPjHPl7WAb7JEYDGEJZZhb6KP432FTLDFurfRnAWsOIJg14DANrS3OIonOs65YMk08aHhnxg7xn7I_K4_1BwrScRL28scAckFXP-zsV5z-3IYRhAb0YeT1tP6rZbXrD3ggjhilZfYZs6KmHseuuI4xTgiL9UcorzpgI3jls49D1GmPFbmUe45S8KgEqK_A_OZ3QMhC1KX9ZfGeHjgWdOZKL6AQtvMbx3A")' }}></div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">Bob Smith</span>
                          <span className="text-xs text-[#9caeb3]">bob@entrustory.com</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/20">Admin</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-mono text-sm text-[#9caeb3] group-hover:text-[#0dccf2] transition-colors cursor-pointer" title="Click to copy">
                        <span className="material-symbols-outlined text-base">fingerprint</span>
                        <span>0x9c11...3d4e</span>
                        <span className="material-symbols-outlined text-base opacity-0 group-hover:opacity-100 transition-opacity">content_copy</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-[#9caeb3] hover:text-white p-2 rounded-lg hover:bg-[#2a4045] transition-all">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="group hover:bg-[#1e3236] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0dccf2]/20 flex items-center justify-center text-[#0dccf2] font-bold text-xs ring-1 ring-[#2a4045]">CD</div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">Charlie Davis</span>
                          <span className="text-xs text-[#9caeb3]">charlie@external.com</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2a4045] text-[#9caeb3] border border-[#2a4045]">Viewer</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-mono text-sm text-[#9caeb3] group-hover:text-[#0dccf2] transition-colors cursor-pointer" title="Click to copy">
                        <span className="material-symbols-outlined text-base">fingerprint</span>
                        <span>0x1a77...5f6g</span>
                        <span className="material-symbols-outlined text-base opacity-0 group-hover:opacity-100 transition-opacity">content_copy</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="text-[#9caeb3] hover:text-white p-2 rounded-lg hover:bg-[#2a4045] transition-all">
                        <span className="material-symbols-outlined">more_horiz</span>
                      </button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#2a4045] bg-[#162629]">
              <span className="text-sm text-[#9caeb3]">Showing <span className="text-white font-medium">1-3</span> of <span className="text-white font-medium">12</span> members</span>
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#2a4045] text-[#9caeb3] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button className="flex items-center justify-center w-8 h-8 rounded bg-[#0dccf2] text-[#101f22] font-bold text-sm">1</button>
                <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#2a4045] text-[#9caeb3] hover:text-white text-sm">2</button>
                <button className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#2a4045] text-[#9caeb3] hover:text-white">
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Invite Info Card (Bottom) */}
          <div className="rounded-xl border border-dashed border-[#2a4045] bg-[#162629]/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0dccf2]/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[#0dccf2] text-2xl">mail</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-white font-bold text-lg">Invite your team</h3>
                <p className="text-[#9caeb3] text-sm max-w-lg">Collaborate securely by inviting your team members. You can assign specific roles and manage permissions at any time.</p>
              </div>
            </div>
            <button className="text-[#0dccf2] hover:text-white font-medium text-sm whitespace-nowrap flex items-center gap-1 group">
              Learn about roles
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
