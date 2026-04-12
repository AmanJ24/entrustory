/**
 * CommandPalette — Global command palette triggered by Cmd+K / Ctrl+K.
 * Provides quick navigation and actions across the app.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutDashboard, ShieldCheck,
  History, Key, Users, DownloadCloud, Settings,
  CreditCard, FileText, Plus, Command
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  category: string;
}

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = [
    // Navigation
    { id: 'dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard size={16} />, action: () => navigate('/app/dashboard'), category: 'Navigation', shortcut: 'G D' },
    { id: 'verify', label: 'Verify Integrity', icon: <ShieldCheck size={16} />, action: () => navigate('/app/verify'), category: 'Navigation', shortcut: 'G V' },
    { id: 'export', label: 'Export Center', icon: <DownloadCloud size={16} />, action: () => navigate('/app/export'), category: 'Navigation' },
    { id: 'logs', label: 'Activity Logs', icon: <History size={16} />, action: () => navigate('/app/logs'), category: 'Navigation' },
    { id: 'team', label: 'Team Management', icon: <Users size={16} />, action: () => navigate('/app/team'), category: 'Navigation' },
    { id: 'settings', label: 'Workspace Settings', icon: <Settings size={16} />, action: () => navigate('/app/settings'), category: 'Navigation' },
    { id: 'api', label: 'API Configuration', icon: <Key size={16} />, action: () => navigate('/app/developer'), category: 'Navigation' },
    { id: 'billing', label: 'Usage & Billing', icon: <CreditCard size={16} />, action: () => navigate('/app/billing'), category: 'Navigation' },
    { id: 'docs', label: 'Documentation', icon: <FileText size={16} />, action: () => navigate('/docs/getting-started'), category: 'Navigation' },

    // Actions
    { id: 'new-item', label: 'Create New Work Item', description: 'Anchor a new digital asset', icon: <Plus size={16} />, action: () => { window.dispatchEvent(new Event('open_new_workitem_modal')); }, category: 'Actions', shortcut: '⌘ N' },
  ];

  const filteredCommands = query
    ? commands.filter((cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  const groupedCommands = filteredCommands.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
      filteredCommands[selectedIndex].action();
      setIsOpen(false);
    }
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={() => setIsOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-xl bg-[#111722] border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-slate-500"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] text-slate-400 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-5 py-8 text-center text-slate-500 text-sm">
              No commands found for "{query}"
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {category}
                </div>
                {items.map((cmd) => {
                  const flatIndex = filteredCommands.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => { cmd.action(); setIsOpen(false); }}
                      onMouseEnter={() => setSelectedIndex(flatIndex)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                        flatIndex === selectedIndex
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : 'text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={flatIndex === selectedIndex ? 'text-cyan-400' : 'text-slate-500'}>{cmd.icon}</span>
                      <span className="flex-1 text-left font-medium">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className="text-[10px] font-mono text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-5 py-3 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono">↵</kbd> Select</span>
          </div>
          <span className="flex items-center gap-1">
            <Command size={10} /> Entrustory
          </span>
        </div>
      </div>
    </div>
  );
};
