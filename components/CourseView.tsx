import React, { useState, useEffect } from 'react';
import { Course, Module, QuizQuestion } from '../types';
import { CheckCircle, PlayCircle, FileText, HelpCircle, ChevronRight, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';

interface CourseViewProps {
  course: Course;
  initialModuleId?: string;
}

export const CourseView: React.FC<CourseViewProps> = ({ course, initialModuleId }) => {
  const [activeModule, setActiveModule] = useState<Module>(course.modules[0]);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    if (initialModuleId) {
      const found = course.modules.find(m => m.id === initialModuleId);
      if (found) setActiveModule(found);
    }
  }, [initialModuleId, course.modules]);

  const handleModuleChange = (mod: Module) => {
    if (mod.id === activeModule.id) return;
    setIsChanging(true);
    setTimeout(() => {
        setActiveModule(mod);
        setIsChanging(false);
        // Scroll top of content
        const contentArea = document.getElementById('module-content-area');
        if(contentArea) contentArea.scrollTop = 0;
    }, 200);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-140px)] animate-slide-up">
      {/* Content Area */}
      <div id="module-content-area" className="flex-1 glass-panel rounded-[24px] overflow-y-auto p-8 md:p-10 relative scroll-smooth">
        <div className={`max-w-3xl mx-auto transition-opacity duration-200 ${isChanging ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center space-x-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-xs font-bold uppercase tracking-wider">{course.title}</span>
            <span className="text-slate-400 dark:text-slate-600">/</span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Module {course.modules.findIndex(m => m.id === activeModule.id) + 1}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-8 leading-tight">{activeModule.title}</h1>
          
          {/* Simulated Content Rendering */}
          <div className="prose prose-lg prose-invert max-w-none mb-12 font-light">
             {activeModule.content.split('\n').map((line, i) => {
                 if (line.startsWith('###')) return <h3 key={i} className="text-2xl font-display font-bold mt-10 mb-4 text-slate-900 dark:text-[#F9FAFB]">{line.replace('###', '')}</h3>;
                 if (line.startsWith('1.')) return <div key={i} className="ml-4 mb-3 flex items-start"><span className="font-bold mr-3 text-[#38BDF8]">{line.substring(0, 2)}</span><span className="text-slate-600 dark:text-[#CBD5F5]">{line.substring(2)}</span></div>;
                 if (line.startsWith('*')) return <li key={i} className="ml-6 mb-2 list-disc marker:text-[#38BDF8] text-slate-600 dark:text-[#CBD5F5]">{line.replace('*', '')}</li>;
                 if (line.trim() === '') return <br key={i} />;
                 return <p key={i} className="mb-4 leading-relaxed text-slate-600 dark:text-[#CBD5F5]">{line}</p>;
             })}
          </div>

          {/* Quiz Section */}
          {activeModule.quiz && (
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[24px] p-8 mt-12 animate-fade-in backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-[#A855F7]/10 dark:bg-[#A855F7]/20 border border-[#A855F7]/30 rounded-lg mr-3 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <HelpCircle className="text-[#A855F7] w-5 h-5" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Knowledge Check</h3>
              </div>
              {activeModule.quiz.map((q, idx) => (
                <QuizItem key={q.id} question={q} index={idx} />
              ))}
            </div>
          )}

          {activeModule.type === 'lab' && (
            <div className="bg-gradient-to-br from-[#F59E0B]/5 to-transparent border border-[#F59E0B]/20 rounded-[24px] p-8 mt-8 flex flex-col sm:flex-row items-start gap-5 animate-fade-in hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-shadow">
                <div className="p-3 bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 rounded-xl shadow-sm dark:shadow-[0_0_15px_rgba(245,158,11,0.4)] text-[#F59E0B] flex-shrink-0 border border-[#F59E0B]/30">
                    <CheckCircle size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">Interactive Lab Required</h3>
                    <p className="text-slate-600 dark:text-[#94A3B8] mb-5 text-sm leading-relaxed">This module requires you to use the AI Tools to complete the assignment. The best way to learn is by doing.</p>
                    <div className="inline-flex items-center text-amber-600 dark:text-[#FCD34D] text-sm font-bold bg-[#F59E0B]/10 px-5 py-2.5 rounded-full shadow-sm border border-[#F59E0B]/20 hover:bg-[#F59E0B]/20 transition-colors cursor-pointer">
                        Go to AI Tools in Sidebar <ArrowRight size={14} className="ml-2" />
                    </div>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* Module List */}
      <div className="w-full lg:w-[340px] glass-panel rounded-[24px] flex flex-col overflow-hidden h-fit max-h-full">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Course Modules</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">{course.modules.length} lessons • 2h 15m total</p>
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-1">
          {course.modules.map((mod, idx) => (
            <button
              key={mod.id}
              onClick={() => handleModuleChange(mod)}
              className={`w-full text-left p-4 rounded-2xl transition-all flex items-start group relative overflow-hidden ${
                activeModule.id === mod.id 
                ? 'bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/5 shadow-inner' 
                : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
              }`}
            >
              {activeModule.id === mod.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-[#38BDF8] rounded-r-full shadow-[0_0_10px_rgba(56,189,248,0.8)]"></div>}
              
              <div className={`mt-0.5 mr-4 flex-shrink-0 transition-colors ${activeModule.id === mod.id ? 'text-[#38BDF8]' : 'text-slate-400 dark:text-[#64748B] group-hover:text-slate-600 dark:group-hover:text-[#94A3B8]'}`}>
                {mod.type === 'video' && <PlayCircle size={20} strokeWidth={activeModule.id === mod.id ? 2.5 : 2} />}
                {mod.type === 'reading' && <FileText size={20} strokeWidth={activeModule.id === mod.id ? 2.5 : 2} />}
                {mod.type === 'lab' && <CheckCircle size={20} strokeWidth={activeModule.id === mod.id ? 2.5 : 2} />}
              </div>
              <div className="flex-1">
                <span className={`text-[15px] font-bold block mb-1 font-display transition-colors ${activeModule.id === mod.id ? 'text-[#38BDF8]' : 'text-slate-500 dark:text-[#94A3B8] group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                  {idx + 1}. {mod.title}
                </span>
                <span className="text-xs text-slate-400 dark:text-[#64748B] font-medium">{mod.duration}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const QuizItem: React.FC<{ question: QuizQuestion; index: number }> = ({ question, index }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isCorrect = selected === question.correctAnswer;

  return (
    <div className="mb-8 last:mb-0">
      <p className="font-bold text-slate-900 dark:text-white mb-4 text-lg">{index + 1}. {question.question}</p>
      <div className="space-y-3">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            disabled={isSubmitted}
            onClick={() => setSelected(idx)}
            className={`w-full text-left px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 border ${
              isSubmitted
                ? idx === question.correctAnswer
                  ? 'bg-[#10B981]/20 border-[#10B981]/50 text-emerald-600 dark:text-[#34D399]'
                  : idx === selected
                  ? 'bg-red-500/20 border-red-500/50 text-red-600 dark:text-red-400'
                  : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 dark:text-slate-500'
                : selected === idx
                ? 'bg-[#38BDF8]/20 border-[#38BDF8]/50 text-[#0284C7] dark:text-[#38BDF8] shadow-sm'
                : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-600 dark:text-[#CBD5F5]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {!isSubmitted && selected !== null && (
        <button 
          onClick={() => setIsSubmitted(true)}
          className="mt-5 glass-button text-sm font-bold text-white px-8 py-3 rounded-full hover:scale-105 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
        >
          Submit Answer
        </button>
      )}
      {isSubmitted && (
        <div className={`mt-5 p-5 rounded-2xl text-sm flex items-start animate-fade-in border ${isCorrect ? 'bg-[#10B981]/10 border-[#10B981]/30 text-emerald-600 dark:text-[#34D399]' : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'}`}>
            <div className={`mr-3 mt-0.5 p-1 rounded-full ${isCorrect ? 'bg-[#10B981] text-white dark:text-[#020617]' : 'bg-red-500 text-white'}`}>
                {isCorrect ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            </div>
            <div>
                <span className="font-bold block mb-1 text-base">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
                <p className="opacity-90 leading-relaxed">{question.explanation}</p>
            </div>
        </div>
      )}
    </div>
  );
};