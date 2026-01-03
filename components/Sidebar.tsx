
import React from 'react';
import { ViewState } from '../App';
import { Home, Terminal, Layout, ShieldCheck, X, Sparkles, Sun, Moon, Zap } from 'lucide-react';

interface SidebarProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  onCloseMobile?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView, onCloseMobile, isDarkMode, onToggleTheme }) => {
  const navItemClass = (isActive: boolean) => 
    `flex items-center w-full px-5 py-3.5 mb-2 rounded-[14px] transition-all duration-300 group border ${
      isActive 
      ? 'bg-gradient-to-r from-slate-100/80 to-transparent dark:from-white/10 border-l-[3px] border-l-[#38BDF8] border-t-white/50 dark:border-t-white/5 border-r-transparent border-b-transparent text-slate-900 dark:text-white shadow-[0px_4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0px_4px_20px_rgba(0,0,0,0.2)]' 
      : 'border-transparent text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#E5E7EB] hover:bg-slate-100 dark:hover:bg-white/5'
    }`;

  const handleNav = (view: ViewState) => {
    onNavigate(view);
    if (onCloseMobile) onCloseMobile();
  }

  return (
    <div className="flex flex-col h-full p-6 relative">
      <div className="flex items-center justify-between mb-10 px-2 pt-2">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => handleNav({ type: 'dashboard' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#38BDF8] to-[#6366F1] flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.4)] group-hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-500">
            <Zap className="text-white w-5 h-5 group-hover:rotate-12 transition-transform" />
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">VibeCoder</h1>
        </div>
        <button onClick={onCloseMobile} className="md:hidden p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-[11px] font-bold text-slate-400 dark:text-[#64748B] uppercase tracking-[0.15em] mb-4 px-5">Main</h2>
          <button 
            onClick={() => handleNav({ type: 'dashboard' })}
            className={navItemClass(currentView.type === 'dashboard')}
          >
            <Home size={20} className={`mr-3 stroke-[1.75px] ${currentView.type === 'dashboard' ? 'text-[#38BDF8]' : 'text-slate-400 dark:text-[#64748B] group-hover:text-slate-600 dark:group-hover:text-[#CBD5F5]'}`} />
            <span className="font-medium text-[15px]">The Command Deck</span>
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-[11px] font-bold text-slate-400 dark:text-[#64748B] uppercase tracking-[0.15em] mb-4 px-5">Directing Tools</h2>
          
          <button 
            onClick={() => handleNav({ type: 'tool', toolName: 'campaign' })}
            className={navItemClass(currentView.type === 'tool' && currentView.toolName === 'campaign')}
          >
            <Terminal size={20} className={`mr-3 stroke-[1.75px] ${currentView.type === 'tool' && currentView.toolName === 'campaign' ? 'text-[#6366F1]' : 'text-slate-400 dark:text-[#64748B] group-hover:text-slate-600 dark:group-hover:text-[#CBD5F5]'}`} />
            <span className="font-medium text-[15px]">Spec Architect</span>
          </button>

          <button 
            onClick={() => handleNav({ type: 'tool', toolName: 'image' })}
            className={navItemClass(currentView.type === 'tool' && currentView.toolName === 'image')}
          >
            <Layout size={20} className={`mr-3 stroke-[1.75px] ${currentView.type === 'tool' && currentView.toolName === 'image' ? 'text-[#38BDF8]' : 'text-slate-400 dark:text-[#64748B] group-hover:text-slate-600 dark:group-hover:text-[#CBD5F5]'}`} />
            <span className="font-medium text-[15px]">Visual Vibe Lab</span>
          </button>

          <button 
            onClick={() => handleNav({ type: 'tool', toolName: 'seo' })}
            className={navItemClass(currentView.type === 'tool' && currentView.toolName === 'seo')}
          >
            <ShieldCheck size={20} className={`mr-3 stroke-[1.75px] ${currentView.type === 'tool' && currentView.toolName === 'seo' ? 'text-[#22C55E]' : 'text-slate-400 dark:text-[#64748B] group-hover:text-slate-600 dark:group-hover:text-[#CBD5F5]'}`} />
            <span className="font-medium text-[15px]">Logic Auditor</span>
          </button>
        </div>
      </nav>
      
      <div className="mt-auto space-y-4">
        <button 
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white"
        >
          <div className="flex items-center text-sm font-medium">
            {isDarkMode ? <Moon size={16} className="mr-3" /> : <Sun size={16} className="mr-3 text-amber-500" />}
            {isDarkMode ? 'Deep Space' : 'Paper Mode'}
          </div>
          <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-[#38BDF8]/20' : 'bg-slate-300'}`}>
            <div className={`w-3 h-3 rounded-full shadow-sm transition-transform ${isDarkMode ? 'translate-x-4 bg-[#38BDF8]' : 'translate-x-0 bg-white'}`} />
          </div>
        </button>

        <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-white/5 dark:to-white/0 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Vibe Streak</h3>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-[#818CF8] bg-indigo-100 dark:bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20">⚡ 12 Units</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mb-3">Syncing architecture...</p>
          <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-gradient-to-r from-[#38BDF8] to-[#6366F1] h-full rounded-full w-3/4 shadow-[0_0_8px_rgba(56,189,248,0.6)]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
