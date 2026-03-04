import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  Fingerprint, LayoutDashboard, Folders, ShieldCheck, 
  History, Key, Users, Bell, Plus, Search, ChevronDown, LogOut 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';
import { useState } from 'react';
import { NewWorkItemModal } from '../NewWorkItemModal';


export const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
    { name: 'Workspaces', icon: Folders, path: '/app/workspace' },
    { name: 'Verifier', icon: ShieldCheck, path: '/app/verify' },
    { name: 'Audit Log', icon: History, path: '/app/logs' },
    { name: 'API Config', icon: Key, path: '/app/developer' },
    { name: 'Team Settings', icon: Users, path: '/app/team' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[#0B1120] text-slate-300 font-sans">
      
      {/* --- TIER 1: Global Top Header --- */}
      <header className="h-14 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <Link to="/app/dashboard" className="flex items-center gap-2 text-white font-['Space_Grotesk'] font-bold text-xl tracking-tight">
            <div className="text-cyan-400">
              <Fingerprint size={24} />
            </div>
            Entrustory
          </Link>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 rounded-lg border border-slate-700/50 cursor-pointer transition-colors">
            <div className="w-5 h-5 rounded bg-cyan-900 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">AC</div>
            <span className="text-sm font-semibold text-slate-200">Acme Corp</span>
            <ChevronDown size={14} className="text-slate-400" />
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
          
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Plus size={16} />
              New WorkItem
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1"></div>
          
          <button className="text-slate-400 hover:text-white relative transition-colors">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-500 ring-2 ring-[#0B1120]"></span>
          </button>

          <div className="flex items-center gap-3 group relative cursor-pointer ml-2">
            <div className="w-8 h-8 rounded-full bg-cyan-900 border border-cyan-700 flex items-center justify-center text-xs font-bold text-cyan-100 hover:ring-2 hover:ring-cyan-500/50 transition-all uppercase">
              {user?.email?.charAt(0) || 'U'}
            </div>
            
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#111722] border border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <div className="px-4 py-3 border-b border-slate-800">
                <p className="text-sm text-white truncate">{user?.email || 'Logged in'}</p>
              </div>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800/50 flex items-center gap-2 rounded-b-lg transition-colors">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- TIER 2: GitHub-Style Navigation Tabs --- */}
      <div className="bg-[#111722] border-b border-slate-800 px-6 shrink-0 z-10 flex items-center">
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
      <main className="flex-1 flex flex-col min-w-0 relative overflow-y-auto bg-[#0B1120]">
        <Outlet />
      </main>

      <NewWorkItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => window.dispatchEvent(new Event('refresh_dashboard'))} 
      />
    </div>
  );
};
