import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';
import { 
  Loader2, X, Mail, Shield, UserX, 
  MoreHorizontal, Fingerprint, CheckCircle, ArrowRight
} from 'lucide-react';

interface TeamMember {
  workspace_id: string;
  user_id: string;
  email?: string; // Appended locally for UI
  role: string;
  public_key_fingerprint: string | null;
  joined_at: string;
}

export const TeamManagement = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  // UI States
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'viewer'>('viewer');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchMembers = async () => {
      if (!user) return;
      try {
        const { data: workspaceData } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (workspaceData) {
          setWorkspaceId(workspaceData.workspace_id);
          const { data: membersData, error } = await supabase
            .from('workspace_members')
            .select('*')
            .eq('workspace_id', workspaceData.workspace_id);
          
          if (error) throw error;
          
          // Map data and inject the current user's email for display
          const mappedMembers = (membersData as TeamMember[]).map(m => ({
            ...m,
            email: m.user_id === user.id ? user.email : `user_${m.user_id.substring(0,5)}@external.com`
          }));
          
          setMembers(mappedMembers);
        }
      } catch (err) {
        console.error("Error fetching team members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [user]);

  // Click outside handler to close action menus
  useEffect(() => {
    const handleClickOutside = () => setActiveActionMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // --- Actions ---

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    
    setInviteStatus('sending');
    
    // Simulating network request for MVP (Avoids Supabase Foreign Key crash on fake users)
    setTimeout(() => {
      const newMember: TeamMember = {
        workspace_id: workspaceId || 'ws',
        user_id: 'new_' + Math.random().toString(36).substr(2, 9),
        email: inviteEmail,
        role: inviteRole,
        public_key_fingerprint: 'Pending acceptance...',
        joined_at: new Date().toISOString()
      };
      
      setMembers([...members, newMember]);
      setInviteStatus('success');
      
      setTimeout(() => {
        setInviteModalOpen(false);
        setInviteStatus('idle');
        setInviteEmail('');
        setInviteRole('viewer');
      }, 1500);
    }, 1000);
  };

  const handleRemoveMember = async (userIdToRemove: string) => {
    if (window.confirm("Are you sure you want to remove this member? They will lose all access to cryptographic proofs.")) {
      // Optimistic UI update
      setMembers(members.filter(m => m.user_id !== userIdToRemove));
      
      // In production, execute: await supabase.from('workspace_members').delete().eq('user_id', userIdToRemove);
    }
  };

  const handleChangeRole = (userIdToUpdate: string, newRole: string) => {
    // Optimistic UI update
    setMembers(members.map(m => m.user_id === userIdToUpdate ? { ...m, role: newRole } : m));
    
    // In production, execute: await supabase.from('workspace_members').update({ role: newRole }).eq('user_id', userIdToUpdate);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative min-h-full font-['Space_Grotesk'] text-on-surface bg-surface z-0">
      <div className="max-w-[1200px] mx-auto p-6 md:p-12 flex flex-col gap-8 h-full pb-24">
        
        {/* Page Header */}
        <div className="flex flex-wrap justify-between items-end gap-4 border-b border-surface-variant pb-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl font-bold tracking-tight">Workspace Members</h1>
            <p className="text-on-surface-variant text-base">Manage team access and cryptographic permissions for your workspace.</p>
          </div>
          <button 
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-2 bg-tertiary hover:bg-tertiary text-white font-bold px-5 py-2.5 rounded-lg transition-all shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]"
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
            <span>Invite Member</span>
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Members Table */}
          <div className="w-full overflow-visible rounded-xl border border-surface-variant bg-surface-container-low shadow-xl">
            <div className="overflow-visible">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-surface-variant">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant w-1/4">User</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant w-1/6">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant w-1/3">Public Key Fingerprint</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant text-right w-1/6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {loading ? (
                    <tr><td colSpan={4} className="p-8 text-center"><Loader2 className="animate-spin text-tertiary mx-auto" /></td></tr>
                  ) : members.map((member) => {
                    const isMe = member.user_id === user?.id;
                    const isOwner = member.role === 'owner';

                    return (
                      <tr key={member.user_id} className="group hover:bg-surface-variant/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-sm
                              ${isMe ? 'bg-surface-container-highest border-outline-variant text-on-primary' : 'bg-surface-variant border-outline text-on-surface'}`}>
                              {member.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-white flex items-center gap-2">
                                {isMe ? 'You' : member.email?.split('@')[0]}
                              </span>
                              <span className="text-xs text-on-surface-variant">{member.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${member.role === 'owner' ? 'bg-tertiary/10 text-tertiary border-tertiary/20' : 
                              member.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                              'bg-surface-variant text-on-surface border-outline-variant'}`}>
                            {member.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div 
                            onClick={() => copyToClipboard(member.public_key_fingerprint || member.user_id, member.user_id)}
                            className="flex items-center gap-2 font-mono text-sm text-on-surface-variant hover:text-tertiary transition-colors cursor-pointer w-fit" 
                            title="Click to copy"
                          >
                            {copiedId === member.user_id ? <CheckCircle size={16} className="text-emerald-400" /> : <Fingerprint size={16} />}
                            <span>{member.public_key_fingerprint || `0x${member.user_id.split('-')[0]}...`}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenu(activeActionMenu === member.user_id ? null : member.user_id);
                            }}
                            className="text-on-surface-variant hover:text-white p-2 rounded-lg hover:bg-surface-variant transition-all"
                          >
                            <MoreHorizontal size={20} />
                          </button>

                          {/* Dynamic Action Menu Dropdown */}
                          {activeActionMenu === member.user_id && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-8 top-10 mt-1 w-48 bg-surface-container-low border border-outline-variant rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100"
                            >
                              {!isOwner && (
                                <>
                                  <div className="px-3 py-2 text-xs font-semibold text-on-surface-variant uppercase tracking-wider border-b border-surface-variant">Change Role</div>
                                  <button onClick={() => { handleChangeRole(member.user_id, 'admin'); setActiveActionMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-variant hover:text-white flex items-center gap-2">
                                    <Shield size={14} className="text-purple-400" /> Make Admin
                                  </button>
                                  <button onClick={() => { handleChangeRole(member.user_id, 'viewer'); setActiveActionMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm text-on-surface hover:bg-surface-variant hover:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">visibility</span> Make Viewer
                                  </button>
                                  <div className="border-t border-surface-variant my-1"></div>
                                  <button onClick={() => { handleRemoveMember(member.user_id); setActiveActionMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                                    <UserX size={14} /> Remove Member
                                  </button>
                                </>
                              )}
                              {isOwner && (
                                <div className="p-3 text-xs text-on-surface-variant text-center">
                                  Owner actions restricted. Transfer ownership first.
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-surface-variant bg-surface">
              <span className="text-sm text-on-surface-variant">Showing <span className="text-white font-medium">{members.length}</span> members</span>
            </div>
          </div>

          {/* Invite Info Card */}
          <div className="rounded-xl border border-dashed border-outline-variant bg-surface-variant/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0 border border-tertiary/20">
                <span className="material-symbols-outlined text-tertiary text-2xl">mail</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-white font-bold text-lg">Invite your team</h3>
                <p className="text-on-surface-variant text-sm max-w-lg">Collaborate securely by inviting your team members. You can assign specific roles and manage permissions at any time.</p>
              </div>
            </div>
            {/* Navigates to a future Docs page */}
            <Link to="/docs/roles" className="text-tertiary hover:text-tertiary font-medium text-sm whitespace-nowrap flex items-center gap-1 group bg-tertiary/10 px-4 py-2 rounded-lg border border-tertiary/20 transition-all">
              Learn about roles
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>

      {/* --- INVITE MODAL --- */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-container-low border border-surface-variant rounded-xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setInviteModalOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-white">
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-white mb-2 font-display">Invite Team Member</h2>
            <p className="text-sm text-on-surface-variant mb-6">Send an encrypted invitation link to join this workspace.</p>

            {inviteStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center py-8 text-emerald-400">
                <CheckCircle size={48} className="mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                <h3 className="text-xl font-bold text-white">Invitation Sent</h3>
                <p className="text-sm text-on-surface-variant mt-2 text-center">They have been added to the table as pending.</p>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input 
                      type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-tertiary"
                      placeholder="colleague@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Workspace Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button" onClick={() => setInviteRole('admin')} 
                      className={`py-3 px-4 rounded-lg border text-sm transition-all flex flex-col items-center gap-1 ${inviteRole === 'admin' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-surface border-outline-variant text-on-surface-variant hover:border-slate-500'}`}
                    >
                      <Shield size={18} />
                      <span className="font-semibold">Admin</span>
                    </button>
                    <button 
                      type="button" onClick={() => setInviteRole('viewer')} 
                      className={`py-3 px-4 rounded-lg border text-sm transition-all flex flex-col items-center gap-1 ${inviteRole === 'viewer' ? 'bg-slate-700 border-slate-400 text-white' : 'bg-surface border-outline-variant text-on-surface-variant hover:border-slate-500'}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">visibility</span>
                      <span className="font-semibold">Viewer</span>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" disabled={inviteStatus !== 'idle' || !inviteEmail}
                  className="w-full bg-tertiary hover:bg-tertiary disabled:opacity-50 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 mt-4"
                >
                  {inviteStatus === 'sending' ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : 'Send Invitation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
