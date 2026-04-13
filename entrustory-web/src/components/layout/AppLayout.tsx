import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Fingerprint, LayoutDashboard, Folders, ShieldCheck, DownloadCloud, 
  History, Key, Users, Bell, Plus, Search, ChevronDown, LogOut, CreditCard, Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';
import { timeAgo } from '../../utils/format';
import { NewWorkItemModal } from '../NewWorkItemModal';
import type { AuditLog, WorkspaceData } from '../../types';



export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- UI States ---
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- Re-added Modal State
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [notifications, setNotifications] = useState<AuditLog[]>([]);

  // Dropdown States
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Refs for closing dropdowns
  const workspaceRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
    { name: 'Workspaces', icon: Folders, path: '/app/workspace' },
    { name: 'Verifier', icon: ShieldCheck, path: '/app/verify' },
    { name: 'Audit Log', icon: History, path: '/app/logs' },
    { name: 'Export', icon: DownloadCloud, path: '/app/export' },
    { name: 'API Config', icon: Key, path: '/app/developer' },
    { name: 'Settings', icon: SettingsIcon, path: '/app/settings' },
    { name: 'Team', icon: Users, path: '/app/team' },
    { name: 'Billing', icon: CreditCard, path: '/app/billing' },
  ];

  // Fetch Header Data
  useEffect(() => {
    const fetchHeaderData = async () => {
      if (!user) return;
      try {
        const { data: memberData } = await supabase
          .from('workspace_members')
          .select(`role, workspaces(id, name)`)
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (memberData && memberData.workspaces) {
          const ws = memberData.workspaces as unknown as { id: string; name: string };
          setWorkspace({ name: ws.name, role: memberData.role });

          const wsId = ws.id;
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
    window.addEventListener('refresh_dashboard', fetchHeaderData);
    return () => window.removeEventListener('refresh_dashboard', fetchHeaderData);
  }, [user]);

  // Click outside listener
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



  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface font-sans">
      
      {/* --- TIER 1: Global Top Header --- */}
      <header className="h-14 bg-surface border-b border-surface-variant flex items-center justify-between px-6 shrink-0 z-30">
        <div className="flex items-center gap-6">
          <Link to="/app/dashboard" className="flex items-center gap-2 text-white font-['Space_Grotesk'] font-bold text-xl tracking-tight">
            <div className="text-tertiary">
              <Fingerprint size={24} />
            </div>
            Entrustory
          </Link>

          <div className="relative" ref={workspaceRef}>
            <div 
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)} 
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-variant/50 hover:bg-surface-variant rounded-lg border border-outline-variant/50 cursor-pointer transition-colors"
            >
              <div className="w-5 h-5 rounded bg-surface-container-highest text-tertiary flex items-center justify-center text-xs font-bold font-mono uppercase">
                {workspace?.name?.substring(0, 2) || 'WS'}
              </div>
              <span className="text-sm font-semibold text-on-surface truncate max-w-[150px]">
                {workspace?.name || 'Loading...'}
              </span>
              <ChevronDown size={14} className="text-on-surface-variant" />
            </div>

            {isWorkspaceMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-surface-container-low border border-outline-variant rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-surface-variant">
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-1">Current Workspace</p>
                  <p className="text-sm font-bold text-white truncate">{workspace?.name}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-tertiary font-medium">
                    <ShieldCheck size={12} /> Role: <span className="capitalize">{workspace?.role}</span>
                  </div>
                </div>
                <div className="p-2">
                  <Link 
                    to="/app/team" 
                    onClick={() => setIsWorkspaceMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-variant hover:text-white rounded-lg transition-colors"
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
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Search hashes, IDs..." 
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-1 pl-9 pr-4 text-sm text-white placeholder-on-surface-variant focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all"
            />
          </div>
          
          {/* --- RE-WIRED: New WorkItem Button --- */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 bg-tertiary hover:bg-tertiary text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(255,177,72,0.2)]"
          >
            <Plus size={16} />
            New WorkItem
          </button>
          
          <div className="h-5 w-px bg-surface-variant mx-1"></div>
          
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)} 
              className="text-on-surface-variant hover:text-white relative transition-colors p-1"
            >
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-tertiary ring-2 ring-surface"></span>
              )}
            </button>

            {isNotifMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-96 bg-surface-container-low border border-outline-variant rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-5 py-4 border-b border-surface-variant flex justify-between items-center bg-surface">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Bell size={16} className="text-tertiary" /> Notifications
                  </p>
                  <Link 
                    to="/app/logs" 
                    onClick={() => setIsNotifMenuOpen(false)} 
                    className="text-xs text-tertiary hover:text-tertiary font-medium bg-tertiary/10 px-2 py-1 rounded transition-colors"
                  >
                    View All
                  </Link>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-surface-variant/50 flex items-center justify-center mb-3">
                        <Bell size={20} className="text-on-surface-variant" />
                      </div>
                      <p className="text-sm text-on-surface-variant">You're all caught up.</p>
                    </div>
                  ) : (
                    notifications.map(notif => {
                      const isCreate = notif.action_type.includes('create');
                      return (
                        <div key={notif.id} className="px-5 py-4 border-b border-surface-variant/50 hover:bg-surface-variant/30 transition-colors cursor-default group">
                          <div className="flex items-start justify-between mb-1.5 gap-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${isCreate ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-tertiary shadow-[0_0_8px_rgba(255,177,72,0.5)]'}`}></div>
                              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                                {notif.action_type.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-mono whitespace-nowrap pt-0.5">
                              {timeAgo(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-on-surface-variant leading-relaxed ml-4">
                            {(notif.details as Record<string, string>)?.message || `System executed: ${notif.action_type}`}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative ml-2" ref={profileRef}>
            <div 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-xs font-bold text-on-primary hover:ring-2 hover:ring-tertiary/50 transition-all uppercase cursor-pointer select-none"
            >
              {user?.email?.charAt(0) || 'U'}
            </div>
            
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-low border border-outline-variant rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-surface-variant bg-surface-container-lowest/50">
                  <p className="text-xs text-on-surface-variant mb-1">Signed in as</p>
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

      {/* --- TIER 2: Navigation Tabs --- */}
      <div className="bg-surface-container-low border-b border-surface-variant px-6 shrink-0 z-20 flex items-center">
        <nav className="flex items-center gap-2 overflow-x-auto pt-2">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all relative ${
                  isActive 
                    ? 'border-tertiary text-tertiary' 
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline'
                }`}
              >
                <item.icon size={16} className={isActive ? 'text-tertiary' : 'text-on-surface-variant'} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* --- Main Content Injection --- */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-y-auto bg-surface z-10">
        <Outlet />
      </main>

      {/* --- RE-ADDED: The Modal Component --- */}
      <NewWorkItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => window.dispatchEvent(new Event('refresh_dashboard'))} 
      />
    </div>
  );
};
