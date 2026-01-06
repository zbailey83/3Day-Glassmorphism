
import React from 'react';
import { Course } from '../types';
import { ViewState } from '../App';
import { PlayCircle, Clock, ArrowRight, Zap, Terminal, Layout, ShieldCheck, Code } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  courses: Course[];
  onNavigate: (view: ViewState) => void;
}

const skillData = [
  { name: 'Directing', score: 88 },
  { name: 'Arch', score: 72 },
  { name: 'Visuals', score: 65 },
  { name: 'Auditing', score: 91 },
];

export const Dashboard: React.FC<DashboardProps> = ({ courses, onNavigate }) => {
  const { user, userProfile } = useAuth();

  return (
    <div className="space-y-8 md:space-y-10 pb-10">

      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2 tracking-tight">System Online, {user?.displayName?.split(' ')[0] || 'User'}.</h1>
          <p className="text-slate-600 dark:text-[#CBD5F5] text-lg font-light">Your architectural fidelity is peaking at 2026 standards.</p>
        </div>

        {/* Vibe Streak Card (Moved from Sidebar) */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-white/5 dark:to-white/0 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md p-5 min-w-[280px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-slate-900 dark:text-white text-sm">Vibe Streak</h3>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-[#818CF8] bg-indigo-100 dark:bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20">⚡ {userProfile?.streakDays || 1} Days</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] mb-3">Level {userProfile?.level || 1} • {userProfile?.xp || 0} XP</p>
          <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#38BDF8] to-[#6366F1] h-full rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]"
              style={{ width: `${Math.min(((userProfile?.xp || 0) % 1000) / 10, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Course Cards (Active Tracks) - MOVED TO TOP */}
      <div className="animate-slide-up delay-100">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Active Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {courses.map(course => (
            <div key={course.id} className="group glass-panel rounded-[24px] overflow-hidden hover:border-indigo-400/40 hover:-translate-y-1 transition-all duration-300">
              <div className="h-48 overflow-hidden relative">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 dark:opacity-80 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent dark:from-[#0F172A] dark:to-transparent opacity-90" />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  {course.tags.map(tag => (
                    <span key={tag} className="text-[10px] uppercase font-bold px-3 py-1 bg-white/10 backdrop-blur-md text-white dark:text-[#E2E8F0] rounded-full border border-white/10 shadow-sm">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-1 leading-tight group-hover:text-indigo-500 transition-colors">{course.title}</h3>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mb-4">{course.subtitle}</p>
                <p className="text-slate-500 dark:text-[#94A3B8] text-sm mb-6 leading-relaxed line-clamp-2 font-light">{course.description}</p>
                <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-white/5">
                  <span className="text-xs text-slate-500 dark:text-[#64748B] font-semibold flex items-center">
                    <PlayCircle size={14} className="mr-1" /> {course.modules.length} Sessions
                  </span>
                  <button
                    onClick={() => onNavigate({ type: 'course', courseId: course.id })}
                    className="flex items-center text-white bg-indigo-600 dark:bg-white/5 border border-transparent dark:border-white/10 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
                  >
                    Sync Session <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="animate-slide-up delay-200">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Direction Suite</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate({ type: 'tool', toolName: 'campaign' })}
            className="glass-panel flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all group duration-300"
          >
            <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-500 mb-3 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all duration-300 border border-indigo-500/20">
              <Terminal size={24} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Spec Architect</h3>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8]">The Blueprint</span>
          </button>

          <button
            onClick={() => onNavigate({ type: 'tool', toolName: 'image' })}
            className="glass-panel flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-[#38BDF8]/40 hover:-translate-y-1 transition-all group duration-300"
          >
            <div className="p-4 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] mb-3 group-hover:scale-110 group-hover:bg-[#38BDF8] group-hover:text-white group-hover:shadow-[0_0_20px_rgba(56,189,248,0.6)] transition-all duration-300 border border-[#38BDF8]/20">
              <Layout size={24} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Vibe Lab</h3>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8]">UI Logic</span>
          </button>

          <button
            onClick={() => onNavigate({ type: 'tool', toolName: 'seo' })}
            className="glass-panel flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-emerald-500/40 hover:-translate-y-1 transition-all group duration-300"
          >
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 mb-3 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all duration-300 border border-emerald-500/20">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Auditor</h3>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Code Review</span>
          </button>

          <button
            onClick={() => window.open('https://cursor.directory', '_blank')}
            className="glass-panel flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-purple-500/40 hover:-translate-y-1 transition-all group duration-300"
          >
            <div className="p-4 rounded-full bg-purple-500/10 text-purple-500 mb-3 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-300 border border-purple-500/20">
              <Code size={24} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Rules Dir</h3>
            <span className="text-xs text-slate-500 dark:text-[#94A3B8]">External Repo</span>
          </button>
        </div>
      </div>

      {/* Stats Section (Moved to Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-slide-up delay-300">
        <div className="glass-panel p-8 rounded-[24px] lg:col-span-2 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Director Aptitude</h3>
            <button className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-4 py-2 rounded-full hover:bg-indigo-500/20 transition-colors border border-indigo-500/20 uppercase tracking-widest">Calibration</button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15, 23, 42, 0.9)',
                    backdropFilter: 'blur(12px)',
                    color: '#fff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="score" radius={[6, 6, 6, 6]} barSize={40} animationDuration={1500}>
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#vibeGradient)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="vibeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Mastery - Original Stats Card */}
        <div className="space-y-6 md:space-y-8 flex flex-col">
          <div
            onClick={() => onNavigate({ type: 'profile' })}
            className="flex-1 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-cyan-500/10 dark:from-indigo-900/40 dark:to-blue-900/20 p-8 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-[0_0_40px_rgba(99,102,241,0.1)] text-slate-900 dark:text-white relative overflow-hidden group hover:border-indigo-400/30 transition-all duration-300 cursor-pointer active:scale-[0.99]"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700"></div>

            <h3 className="text-slate-600 dark:text-[#CBD5F5] font-medium mb-2 flex items-center relative z-10 uppercase tracking-widest text-[11px]"><Zap className="w-4 h-4 mr-2 text-indigo-500" /> Operational Mastery</h3>
            <div className="text-5xl font-display font-bold mb-6 relative z-10 text-slate-900 dark:text-white">Lvl {userProfile?.level || 1}</div>

            <div className="w-full bg-black/5 dark:bg-black/20 rounded-full h-3 mb-3 backdrop-blur-sm relative z-10 border border-black/5 dark:border-white/5">
              <div
                className="bg-gradient-to-r from-[#38BDF8] to-[#6366F1] h-3 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                style={{ width: `${Math.min(((userProfile?.xp || 0) % 1000) / 10, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 dark:text-[#E2E8F0] font-medium relative z-10">Rank: {userProfile?.role || 'Principal Vibe Director'}</p>
          </div>

          <div className="glass-panel p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 text-lg">Active Sprint</h3>
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-500/10 p-3.5 rounded-2xl border border-indigo-500/20">
                <Terminal className="text-indigo-500" size={22} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Hello World in AI Era</h4>
                <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-3">Module 1 • Lesson 1.3</p>
                <button
                  onClick={() => onNavigate({ type: 'course', courseId: 'course-1-vibe-coding-101', moduleId: 'c1-m1-l3' })}
                  className="text-indigo-500 text-sm font-bold hover:text-indigo-400 transition-colors flex items-center group"
                >
                  Open Terminal <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
