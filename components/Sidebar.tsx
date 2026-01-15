
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ViewState } from '../App';
import { Home, Terminal, Layout, ShieldCheck, X, Sparkles, Sun, Moon, Zap, LogOut, Trophy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AchievementsPanel } from './AchievementsPanel';
import { getLevelFromXP, getXPProgress } from '../src/data/gamification';

interface SidebarProps {
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
  onCloseMobile?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

import logo from '../logo-blue.png';

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentView, onCloseMobile, isDarkMode, onToggleTheme }) => {
  const { user, userProfile, signInWithGoogle, logout } = useAuth();
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  const xp = userProfile?.xp || 0;
  const currentLevel = getLevelFromXP(xp);
  const xpProgress = getXPProgress(xp);

  const navItemClass = (isActive: boolean) =>
    `flex items-center w-full px-5 py-3.5 mb-2 rounded-[14px] transition-all duration-300 group border ${isActive
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
          <img
            src={logo}
            alt="Vibe Dev"
            className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">VIBE DEV 2026</h1>
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

        {/* Achievements Section */}
        <div className="mb-8">
          <h2 className="text-[11px] font-bold text-slate-400 dark:text-[#64748B] uppercase tracking-[0.15em] mb-4 px-5">Progress</h2>
          <button
            onClick={() => setIsAchievementsOpen(true)}
            className="flex items-center w-full px-5 py-3.5 mb-2 rounded-[14px] transition-all duration-300 group border border-transparent text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#E5E7EB] hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <Trophy size={20} className="mr-3 stroke-[1.75px] text-[#F59E0B] group-hover:text-[#F59E0B]" />
            <span className="font-medium text-[15px]">Achievements</span>
            <span className="ml-auto text-[10px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] px-2 py-1 rounded-full">NEW</span>
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

        {/* Achievements Panel Modal - Rendered via Portal to escape sidebar overflow */}
        {isAchievementsOpen && createPortal(
          <AchievementsPanel isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />,
          document.body
        )}

        {user ? (
          <div
            onClick={() => handleNav({ type: 'profile' })}
            className="cursor-pointer p-4 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-white/5 dark:to-white/0 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md hover:border-slate-300 dark:hover:border-white/20 transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <img
                  src={currentLevel.animalSvg}
                  alt={currentLevel.animal}
                  className="w-12 h-12 object-contain"
                />
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {currentLevel.level}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm truncate">{currentLevel.title}</h3>
                <p className="text-[10px] text-slate-500 dark:text-[#94A3B8]">{xp} XP • ⚡ {userProfile?.streakDays || 1} day streak</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); logout(); }}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-red-500 transition-colors rounded-full"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#38BDF8] to-[#6366F1] h-full rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)] transition-all duration-500"
                style={{ width: `${xpProgress.percentage}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 text-right">{Math.round(xpProgress.percentage)}% to next level</p>
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white font-bold shadow-lg hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Initialize Link
          </button>
        )}
      </div>
    </div>
  );
};
