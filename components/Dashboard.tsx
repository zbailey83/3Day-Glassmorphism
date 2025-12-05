import React from 'react';
import { Course } from '../types';
import { ViewState } from '../App';
import { PlayCircle, Clock, ArrowRight, Zap, PenTool, Image as ImageIcon, Search, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  courses: Course[];
  onNavigate: (view: ViewState) => void;
}

const data = [
  { name: 'Writing', score: 85 },
  { name: 'SEO', score: 65 },
  { name: 'Visuals', score: 92 },
  { name: 'Strategy', score: 70 },
];

export const Dashboard: React.FC<DashboardProps> = ({ courses, onNavigate }) => {
  return (
    <div className="space-y-8 md:space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Hello, Alex</h1>
          <p className="text-slate-600 dark:text-[#CBD5F5] text-lg font-light">Your creative stats are looking stellar today.</p>
        </div>
        <div className="hidden md:flex -space-x-3 hover:space-x-1 transition-all duration-300">
            {[1,2,3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0F172A] bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-lg hover:scale-110 transition-transform z-0 hover:z-10">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="peer" />
                </div>
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0F172A] bg-[#38BDF8] flex items-center justify-center text-xs font-bold text-[#0F172A] shadow-[0_0_15px_rgba(56,189,248,0.4)]">+42</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 animate-slide-up delay-100">
        {/* Progress Chart */}
        <div className="glass-panel p-8 rounded-[24px] lg:col-span-2 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Skill Matrix</h3>
            <button className="text-xs font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-4 py-2 rounded-full hover:bg-[#38BDF8]/20 transition-colors border border-[#38BDF8]/20">View Details</button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: 'rgba(148, 163, 184, 0.1)'}}
                    contentStyle={{
                      borderRadius: '16px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      background: 'rgba(15, 23, 42, 0.9)', 
                      backdropFilter: 'blur(12px)', 
                      color: '#fff', 
                      boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{color: '#fff'}}
                />
                <Bar dataKey="score" radius={[6, 6, 6, 6]} barSize={40} animationDuration={1500}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="url(#colorGradient)" />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6 md:space-y-8 flex flex-col">
            <div className="flex-1 bg-gradient-to-br from-[#38BDF8]/10 via-[#38BDF8]/5 to-[#A855F7]/10 dark:from-[#38BDF8]/20 dark:to-[#A855F7]/20 p-8 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-[0_0_40px_rgba(56,189,248,0.1)] text-slate-900 dark:text-white relative overflow-hidden group hover:border-[#38BDF8]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#38BDF8]/10 dark:bg-[#38BDF8]/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[#38BDF8]/20 dark:group-hover:bg-[#38BDF8]/30 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#A855F7]/10 dark:bg-[#A855F7]/20 rounded-full -ml-10 -mb-10 blur-2xl group-hover:bg-[#A855F7]/20 dark:group-hover:bg-[#A855F7]/30 transition-colors duration-700"></div>
                
                <h3 className="text-slate-600 dark:text-[#CBD5F5] font-medium mb-2 flex items-center relative z-10"><Zap className="w-4 h-4 mr-2 text-amber-500 dark:text-[#FCD34D]" /> Overall Progress</h3>
                <div className="text-5xl font-display font-bold mb-6 relative z-10 text-slate-900 dark:text-white dark:drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">72%</div>
                
                <div className="w-full bg-black/5 dark:bg-black/20 rounded-full h-3 mb-3 backdrop-blur-sm relative z-10 border border-black/5 dark:border-white/5">
                    <div className="bg-gradient-to-r from-[#38BDF8] to-[#A855F7] h-3 rounded-full w-[72%] shadow-[0_0_15px_rgba(56,189,248,0.6)]"></div>
                </div>
                <p className="text-sm text-slate-500 dark:text-[#E2E8F0] font-medium relative z-10">Level 4: Marketing Wizard</p>
            </div>
            
            <div className="glass-panel p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 text-lg">Continue Learning</h3>
                <div className="flex items-start space-x-4">
                    <div className="bg-[#F59E0B]/10 p-3.5 rounded-2xl border border-[#F59E0B]/20">
                        <Clock className="text-[#F59E0B]" size={22} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Visual Asset Creation</h4>
                        <p className="text-xs text-slate-500 dark:text-[#94A3B8] mb-3">Module 2 • 15m remaining</p>
                        <button 
                            onClick={() => onNavigate({type: 'course', courseId: 'marketing-ai-101', moduleId: 'm2-visuals'})}
                            className="text-[#38BDF8] text-sm font-bold hover:text-[#7DD3FC] transition-colors flex items-center group"
                        >
                            Resume <ArrowRight size={14} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Quick Tools Grid */}
      <div className="animate-slide-up delay-200">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Creative Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
                onClick={() => onNavigate({ type: 'tool', toolName: 'campaign' })} 
                className="glass-panel flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-[#A855F7]/40 hover:-translate-y-1 transition-all group duration-300"
            >
                <div className="p-4 rounded-full bg-[#A855F7]/10 text-[#A855F7] mb-3 group-hover:scale-110 group-hover:bg-[#A855F7] group-hover:text-white group-hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all duration-300 border border-[#A855F7]/20">
                    <PenTool size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Campaign Gen</h3>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Full Ads</span>
            </button>

            <button 
                onClick={() => onNavigate({ type: 'tool', toolName: 'image' })} 
                className="glass-panel flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-[#38BDF8]/40 hover:-translate-y-1 transition-all group duration-300"
            >
                <div className="p-4 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] mb-3 group-hover:scale-110 group-hover:bg-[#38BDF8] group-hover:text-white group-hover:shadow-[0_0_20px_rgba(56,189,248,0.6)] transition-all duration-300 border border-[#38BDF8]/20">
                    <ImageIcon size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Visual Lab</h3>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Image Gen</span>
            </button>

            <button 
                onClick={() => onNavigate({ type: 'tool', toolName: 'image', action: 'openLibrary' })} 
                className="glass-panel flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-[#F472B6]/40 hover:-translate-y-1 transition-all group duration-300"
            >
                <div className="p-4 rounded-full bg-[#F472B6]/10 text-[#F472B6] mb-3 group-hover:scale-110 group-hover:bg-[#F472B6] group-hover:text-white group-hover:shadow-[0_0_20px_rgba(244,114,182,0.6)] transition-all duration-300 border border-[#F472B6]/20">
                    <BookOpen size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">Prompt Library</h3>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Explore Styles</span>
            </button>

            <button 
                onClick={() => onNavigate({ type: 'tool', toolName: 'seo' })} 
                className="glass-panel flex flex-col items-center justify-center p-6 rounded-[24px] hover:bg-slate-50 dark:hover:bg-white/10 hover:border-[#22C55E]/40 hover:-translate-y-1 transition-all group duration-300"
            >
                <div className="p-4 rounded-full bg-[#22C55E]/10 text-[#22C55E] mb-3 group-hover:scale-110 group-hover:bg-[#22C55E] group-hover:text-white group-hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all duration-300 border border-[#22C55E]/20">
                    <Search size={24} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">SEO Analyzer</h3>
                <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Optimize</span>
            </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="animate-slide-up delay-300">
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Active Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {courses.map(course => (
            <div key={course.id} className="group glass-panel rounded-[24px] overflow-hidden hover:border-[#38BDF8]/40 hover:-translate-y-1 transition-all duration-300">
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
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-3 leading-tight group-hover:text-[#38BDF8] transition-colors">{course.title}</h3>
                <p className="text-slate-500 dark:text-[#94A3B8] text-sm mb-6 leading-relaxed line-clamp-2 font-light">{course.description}</p>
                <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-white/5">
                  <span className="text-xs text-slate-500 dark:text-[#64748B] font-semibold flex items-center">
                    <PlayCircle size={14} className="mr-1" /> {course.modules.length} Modules
                  </span>
                  <button 
                    onClick={() => onNavigate({ type: 'course', courseId: course.id })}
                    className="flex items-center text-white bg-slate-900 dark:bg-white/5 border border-transparent dark:border-white/10 px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-[#38BDF8] hover:border-[#38BDF8] hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all"
                  >
                    Start Learning <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};