import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Fingerprint, LayoutDashboard, Folders, ShieldCheck, 
  History, Key, Users, Bell, Plus, Search, ChevronDown, LogOut, CheckCircle, CreditCard
} from 'lucide-react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';


interface WorkspaceData {
  name: string;
  role: string;
}

export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Dynamic Data States
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Dropdown UI States
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Refs for closing dropdowns when clicking outside
  const workspaceRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
    { name: 'Workspaces', icon: Folders, path: '/app/workspace' },
    { name: 'Verifier', icon: ShieldCheck, path: '/app/verify' },
    { name: 'Audit Log', icon: History, path: '/app/logs' },
    { name: 'API Config', icon: Key, path: '/app/developer' },
    { name: 'Settings', icon: SettingsIcon, path: '/app/settings' },
    { name: 'Team Settings', icon: Users, path: '/app/team' },
    { name: 'Billing', icon: CreditCard, path: '/app/billing' },
  ];

  // Fetch Header Data (Workspace Name & Recent Logs)
  useEffect(() => {
    const fetchHeaderData = async () => {
      if (!user) return;
      
      try {
        // 1. Get Workspace Info
        const { data: memberData } = await supabase
          .from('workspace_members')
          .select(`role, workspaces(id, name)`)
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (memberData && memberData.workspaces) {
          // @ts-ignore - Supabase join typing
          const wsName = memberData.workspaces.name;
          setWorkspace({ name: wsName, role: memberData.role });

          // 2. Get Recent Notifications (Top 4 latest audit logs)
          // @ts-ignore
          const wsId = memberData.workspaces.id;
          const { data: logs } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('workspace_id', wsId)
            .order('created_at', { ascending: false })
            .limit(4);
            
          if (logs) setNotifications(logs);
        }
      } catch (err) {
        console.error("Error loading header data", err);
      }
    };

    fetchHeaderData();

    // Listen for the custom event fired when a new WorkItem is uploaded to refresh notifications
    window.addEventListener('refresh_dashboard', fetchHeaderData);
    return () => window.removeEventListener('refresh_dashboard', fetchHeaderData);
  }, [user]);

  // Handle clicking outside of dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) setIsWorkspaceMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotifMenuOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Helper for notification time
  const timeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1120] text-slate-300 font-sans">
      
      {/* --- TIER 1: Global Top Header --- */}
      <header className="h-14 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-6">
          {/* Brand */}
          <Link to="/app/dashboard" className="flex items-center gap-2 text-white font-['Space_Grotesk'] font-bold text-xl tracking-tight">
            <div className="text-cyan-400">
              <Fingerprint size={24} />
            </div>
            Entrustory
          </Link>

          {/* DYNAMIC: Workspace Context Switcher */}
          <div className="relative" ref={workspaceRef}>
            <div 
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)} 
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 cursor-pointer transition-colors"
            >
              <div className="w-5 h-5 rounded bg-cyan-900 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono uppercase">
                {workspace?.name?.substring(0, 2) || 'WS'}
              </div>
              <span className="text-sm font-semibold text-slate-200 truncate max-w-[150px]">
                {workspace?.name || 'Loading...'}
              </span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            {/* Workspace Dropdown */}
            {isWorkspaceMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#111722] border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Current Workspace</p>
                  <p className="text-sm font-bold text-white truncate">{workspace?.name}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-cyan-400 font-medium">
                    <ShieldCheck size={12} /> Role: <span className="capitalize">{workspace?.role}</span>
                  </div>
                </div>
                <div className="p-2">
                  <Link 
                    to="/app/team" 
                    onClick={() => setIsWorkspaceMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
                  >
                    <Users size={16} /> Manage Team Access
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search hashes, IDs..." 
              className="w-full bg-[#111722] border border-slate-700/50 rounded-lg py-1 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
          </div>
          
          <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Plus size={16} />
            New WorkItem
          </button>
          
          <div className="h-5 w-px bg-slate-800 mx-1"></div>
          
          {/* DYNAMIC: Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)} 
              className="text-slate-400 hover:text-white relative transition-colors p-1"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-[#0B1120]"></span>
              )}
            </button>

          {/* Notifications Dropdown (Fixed & Expanded) */}
            {isNotifMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-96 bg-[#111722] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0B1120]">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell size={16} className="text-cyan-400" /> Notifications
                  </p>
                  <Link 
                    to="/app/logs" 
                    onClick={() => setIsNotifMenuOpen(false)} 
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium bg-cyan-500/10 px-2 py-1 rounded transition-colors"
                  >
                    View All
                  </Link>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                        <Bell size={20} className="text-slate-500" />
                      </div>
                      <p className="text-sm text-slate-400">You're all caught up.</p>
                    </div>
                  ) : (
                    notifications.map(notif => {
                      // Visual indicator color based on action type
                      const isCreate = notif.action_type.includes('create');
                      return (
                        <div key={notif.id} className="px-5 py-4 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-default group">
                          <div className="flex items-start justify-between mb-1.5 gap-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${isCreate ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]'}`}></div>
                              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                                {notif.action_type.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap pt-0.5">
                              {timeAgo(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-400 leading-relaxed ml-4">
                            {notif.details?.message || `System executed: ${notif.action_type}`}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC: User Profile Dropdown */}
          <div className="relative ml-2" ref={profileRef}>
            <div 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-8 h-8 rounded-full bg-cyan-900 border border-cyan-700 flex items-center justify-center text-xs font-bold text-cyan-100 hover:ring-2 hover:ring-cyan-500/50 transition-all uppercase cursor-pointer select-none"
            >
              {user?.email?.charAt(0) || 'U'}
            </div>
            
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#111722] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                  <p className="text-xs text-slate-500 mb-1">Signed in as</p>
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={handleLogout} 
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- TIER 2: GitHub-Style Navigation Tabs --- */}
      <div className="bg-[#111722] border-b border-slate-800 px-6 shrink-0 z-20 flex items-center">
        <nav className="flex items-center gap-2 overflow-x-auto pt-2">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all relative ${
                  isActive 
                    ? 'border-cyan-500 text-cyan-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                }`}
              >
                <item.icon size={16} className={isActive ? 'text-cyan-400' : 'text-slate-500'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- Main Content Injection via React Router Outlet --- */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-y-auto bg-[#0B1120] z-10">
        <Outlet />
      </main>
    </div>
  );
};
