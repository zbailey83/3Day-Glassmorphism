
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Course } from '../types';
import { ViewState } from '../App';
import { PlayCircle, Clock, ArrowRight, Zap, Terminal, Layout, ShieldCheck, Code, Trophy } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getLevelFromXP, getXPProgress, ACHIEVEMENTS, COURSE_MASCOTS } from '../src/data/gamification';
import { AchievementsPanel } from './AchievementsPanel';
import { getRecentToolUsage } from '../services/firebase';

interface DashboardProps {
  courses: Course[];
  onNavigate: (view: ViewState) => void;
}

interface ToolUsageRecord {
  id: string;
  toolType: 'campaign' | 'image' | 'seo';
  lessonId: string;
  courseId: string;
  timestamp: Date;
  completed: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ courses, onNavigate }) => {
  const { user, userProfile } = useAuth();
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [recentToolUsage, setRecentToolUsage] = useState<ToolUsageRecord[]>([]);

  const xp = userProfile?.xp || 0;
  const currentLevel = getLevelFromXP(xp);
  const xpProgress = getXPProgress(xp);

  // Fetch recent tool usage
  useEffect(() => {
    const fetchRecentUsage = async () => {
      if (user?.uid) {
        const usage = await getRecentToolUsage(user.uid, 3);
        setRecentToolUsage(usage as ToolUsageRecord[]);
      }
    };

    fetchRecentUsage();
  }, [user?.uid]);

  // Extract tools used in enrolled courses
  const toolsUsedInCourses = React.useMemo(() => {
    const toolSet = new Set<'campaign' | 'image' | 'seo'>();

    courses.forEach(course => {
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          if (lesson.requiredTool) {
            toolSet.add(lesson.requiredTool);
          }
        });
      });
    });

    return Array.from(toolSet);
  }, [courses]);

  // Tool configuration
  const allTools = [
    {
      id: 'campaign' as const,
      name: 'Spec Architect',
      description: 'The Blueprint',
      icon: Terminal,
      color: 'indigo',
      onClick: () => onNavigate({ type: 'tool', toolName: 'campaign' })
    },
    {
      id: 'image' as const,
      name: 'Vibe Lab',
      description: 'UI Logic',
      icon: Layout,
      color: 'cyan',
      onClick: () => onNavigate({ type: 'tool', toolName: 'image' })
    },
    {
      id: 'seo' as const,
      name: 'Auditor',
      description: 'Code Review',
      icon: ShieldCheck,
      color: 'emerald',
      onClick: () => onNavigate({ type: 'tool', toolName: 'seo' })
    }
  ];

  // Filter tools to only show those used in courses
  const relevantTools = allTools.filter(tool => toolsUsedInCourses.includes(tool.id));

  // Helper function to get tool color classes
  const getToolColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; hover: string; shadow: string; border: string }> = {
      indigo: {
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-500',
        hover: 'group-hover:bg-indigo-500',
        shadow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]',
        border: 'border-indigo-500/20'
      },
      cyan: {
        bg: 'bg-[#38BDF8]/10',
        text: 'text-[#38BDF8]',
        hover: 'group-hover:bg-[#38BDF8]',
        shadow: 'group-hover:shadow-[0_0_20px_rgba(56,189,248,0.6)]',
        border: 'border-[#38BDF8]/20'
      },
      emerald: {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-500',
        hover: 'group-hover:bg-emerald-500',
        shadow: 'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]',
        border: 'border-emerald-500/20'
      }
    };
    return colorMap[color] || colorMap.indigo;
  };

  // Helper to get lesson details from usage record
  const getLessonDetails = (courseId: string, lessonId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return null;

    for (const module of course.modules) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        return {
          courseTitle: course.title,
          lessonTitle: lesson.title,
          moduleTitle: module.title
        };
      }
    }
    return null;
  };

  // Helper to get tool name
  const getToolName = (toolType: 'campaign' | 'image' | 'seo') => {
    const toolMap = {
      campaign: 'Spec Architect',
      image: 'Vibe Lab',
      seo: 'Auditor'
    };
    return toolMap[toolType];
  };

  // Filter recent usage to only show items from last 7 days
  const recentUsageWithinWeek = recentToolUsage.filter(usage => {
    const daysSince = (Date.now() - usage.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 7;
  });

  return (
    <div className="space-y-8 md:space-y-10 pb-10">
      {/* Achievements Panel - Rendered via Portal */}
      {isAchievementsOpen && createPortal(
        <AchievementsPanel isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />,
        document.body
      )}

      {/* Header & Greeting */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2 tracking-tight">System Online, {user?.displayName?.split(' ')[0] || 'User'}.</h1>
          <p className="text-slate-600 dark:text-[#CBD5F5] text-lg font-light">Your architectural fidelity is peaking at 2026 standards.</p>
        </div>

        {/* Level & Streak Card with Animal Mascot */}
        <div
          onClick={() => setIsAchievementsOpen(true)}
          className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-white/5 dark:to-white/0 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-md p-5 min-w-[280px] cursor-pointer hover:border-[#F59E0B]/30 transition-all group"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="relative">
              <img
                src={currentLevel.animalSvg}
                alt={currentLevel.animal}
                className="w-16 h-16 object-contain group-hover:scale-110 transition-transform"
              />
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                Lv.{currentLevel.level}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-slate-900 dark:text-white">{currentLevel.title}</h3>
                <Trophy size={18} className="text-[#F59E0B] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">{xp} XP • ⚡ {userProfile?.streakDays || 1} day streak</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#38BDF8] to-[#6366F1] h-full rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)] transition-all duration-500"
              style={{ width: `${xpProgress.percentage}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Click to view achievements</span>
            <span>{Math.round(xpProgress.percentage)}% to next level</span>
          </p>
        </div>
      </div>

      {/* Course Cards (Active Tracks) - PRIMARY FOCUS */}
      <div className="animate-slide-up delay-100">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-10 tracking-tight">Active Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
          {courses.map(course => {
            const mascot = COURSE_MASCOTS[course.id as keyof typeof COURSE_MASCOTS];
            return (
              <div key={course.id} className="group glass-panel rounded-[32px] overflow-hidden hover:border-indigo-400/50 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(99,102,241,0.3)] transition-all duration-300 border-2">
                <div className="h-64 overflow-hidden relative">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 dark:opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent dark:from-[#0F172A] dark:to-transparent opacity-90" />

                  {/* Course Mascot */}
                  {mascot && (
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20 group-hover:scale-110 transition-transform">
                      <img src={mascot.svg} alt={mascot.name} className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {course.tags.map(tag => (
                      <span key={tag} className="text-[10px] uppercase font-bold px-3 py-1 bg-white/10 backdrop-blur-md text-white dark:text-[#E2E8F0] rounded-full border border-white/10 shadow-sm">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="p-10">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white leading-tight group-hover:text-indigo-500 transition-colors">{course.title}</h3>
                    {mascot && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-full">
                        🐾 {mascot.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase tracking-wider mb-4">{course.subtitle}</p>
                  <p className="text-slate-500 dark:text-[#94A3B8] text-sm mb-6 leading-relaxed line-clamp-2 font-light">{course.description}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-white/5">
                    <span className="text-xs text-slate-500 dark:text-[#64748B] font-semibold flex items-center">
                      <PlayCircle size={14} className="mr-1" /> {course.modules.length} Sessions
                    </span>
                    <button
                      onClick={() => onNavigate({ type: 'course', courseId: course.id })}
                      className="flex items-center text-white bg-indigo-600 dark:bg-white/5 border border-transparent dark:border-white/10 px-8 py-4 rounded-full font-bold text-base hover:bg-indigo-500 hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all"
                    >
                      Sync Session <ArrowRight size={18} className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Tool Usage Shortcuts */}
      {recentUsageWithinWeek.length > 0 && (
        <div className="animate-slide-up delay-150">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Continue Where You Left Off</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentUsageWithinWeek.map(usage => {
              const details = getLessonDetails(usage.courseId, usage.lessonId);
              if (!details) return null;

              const toolName = getToolName(usage.toolType);
              const timeSince = Math.floor((Date.now() - usage.timestamp.getTime()) / (1000 * 60 * 60 * 24));
              const timeText = timeSince === 0 ? 'Today' : timeSince === 1 ? 'Yesterday' : `${timeSince} days ago`;

              return (
                <button
                  key={usage.id}
                  onClick={() => onNavigate({ type: 'course', courseId: usage.courseId, moduleId: usage.lessonId })}
                  className="glass-panel p-5 rounded-[20px] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-indigo-400/40 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-500 dark:text-slate-400">{timeText}</span>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-bold">
                      {toolName}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-500 transition-colors">
                    {details.lessonTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    {details.courseTitle}
                  </p>
                  <div className="flex items-center text-indigo-500 text-sm font-semibold">
                    Continue <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tools Grid - SECONDARY FOCUS - Only show if tools are used in courses */}
      {relevantTools.length > 0 && (
        <div className="animate-slide-up delay-200">
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Direction Suite</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relevantTools.map(tool => {
              const colors = getToolColorClasses(tool.color);
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={tool.onClick}
                  className="glass-panel flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-indigo-500/40 hover:-translate-y-1 transition-all group duration-300"
                >
                  <div className={`p-4 rounded-full ${colors.bg} ${colors.text} mb-3 group-hover:scale-110 ${colors.hover} group-hover:text-white ${colors.shadow} transition-all duration-300 border ${colors.border}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{tool.name}</h3>
                  <span className="text-xs text-slate-500 dark:text-[#94A3B8]">{tool.description}</span>
                </button>
              );
            })}

            {/* External tool - always show */}
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
      )}

      {/* Stats Section - TERTIARY FOCUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-slide-up delay-300">
        {/* Operational Mastery - Original Stats Card */}
        <div className="space-y-6 md:space-y-8 flex flex-col lg:col-span-3">
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
