import React, { useState, useEffect } from 'react';
import { Course, Module, Lesson, QuizQuestion } from '../types';
import { CheckCircle, PlayCircle, FileText, HelpCircle, ChevronRight, AlertCircle, ArrowRight, ChevronDown, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateModuleProgress, addXP } from '../services/firebase';
import { COURSE_MASCOTS } from '../src/data/gamification';
import { EmbeddedTool } from './EmbeddedTool';
import { ToolLaunchButton } from './ToolLaunchButton';

// Tool mention patterns to detect in lesson content
const TOOL_PATTERNS = [
  { pattern: /\[Campaign Generator\]/gi, toolType: 'campaign' as const, label: 'Launch Campaign Generator' },
  { pattern: /\[Image Generator\]/gi, toolType: 'image' as const, label: 'Launch Image Generator' },
  { pattern: /\[Visual Vibe Lab\]/gi, toolType: 'image' as const, label: 'Launch Visual Vibe Lab' },
  { pattern: /\[SEO Analyzer\]/gi, toolType: 'seo' as const, label: 'Launch SEO Analyzer' },
  { pattern: /\[Logic Auditor\]/gi, toolType: 'seo' as const, label: 'Launch Logic Auditor' },
];

// Helper function to parse content and insert tool launch buttons
const parseContentWithToolButtons = (
  content: string,
  lessonId: string,
  courseId: string
): React.ReactNode[] => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    let processedLine = line;
    let hasToolMention = false;
    let toolMatch: { toolType: 'campaign' | 'image' | 'seo'; label: string } | null = null;

    // Check if line contains a tool mention
    for (const { pattern, toolType, label } of TOOL_PATTERNS) {
      if (pattern.test(line)) {
        hasToolMention = true;
        toolMatch = { toolType, label };
        // Remove the tool mention marker from the line
        processedLine = line.replace(pattern, '');
        break;
      }
    }

    // Render the line content
    if (processedLine.trim().startsWith('###')) {
      elements.push(
        <h3 key={i} className="text-xl font-display font-bold mt-10 mb-4 text-slate-900 dark:text-[#F9FAFB]">
          {processedLine.replace('###', '').replace(/\*/g, '')}
        </h3>
      );
    } else if (processedLine.trim().startsWith('**') && processedLine.trim().endsWith('**')) {
      elements.push(
        <h4 key={i} className="font-bold mt-6 mb-2 text-slate-800 dark:text-white">
          {processedLine.replace(/\*\*/g, '')}
        </h4>
      );
    } else if (processedLine.trim().startsWith('1.')) {
      elements.push(
        <div key={i} className="ml-4 mb-3 flex items-start">
          <span className="font-bold mr-3 text-[#38BDF8]">{processedLine.substring(0, 2)}</span>
          <span className="text-slate-600 dark:text-[#CBD5F5]">{processedLine.substring(2)}</span>
        </div>
      );
    } else if (processedLine.trim().startsWith('-')) {
      elements.push(
        <li key={i} className="ml-6 mb-2 list-disc marker:text-[#38BDF8] text-slate-600 dark:text-[#CBD5F5]">
          {processedLine.replace('-', '')}
        </li>
      );
    } else if (processedLine.trim().startsWith('*')) {
      elements.push(
        <li key={i} className="ml-6 mb-2 list-disc marker:text-[#38BDF8] text-slate-600 dark:text-[#CBD5F5]">
          {processedLine.replace('*', '')}
        </li>
      );
    } else if (processedLine.trim() === '') {
      elements.push(<br key={i} />);
    } else {
      elements.push(
        <p key={i} className="mb-4 leading-relaxed text-slate-600 dark:text-[#CBD5F5]">
          {processedLine}
        </p>
      );
    }

    // Add tool launch button if tool mention was detected
    if (hasToolMention && toolMatch) {
      elements.push(
        <div key={`tool-${i}`} className="my-4">
          <ToolLaunchButton
            toolType={toolMatch.toolType}
            label={toolMatch.label}
            variant="inline"
            lessonId={lessonId}
            courseId={courseId}
          />
        </div>
      );
    }
  });

  return elements;
};

interface CourseViewProps {
  course: Course;
  initialModuleId?: string; // This might now refer to a lesson ID or we need to parse it
}

export const CourseView: React.FC<CourseViewProps> = ({ course, initialModuleId }) => {
  const { user } = useAuth();
  // Flatten all lessons to find the first one easily
  const allLessons = course.modules.flatMap(m => m.lessons);
  const [activeLesson, setActiveLesson] = useState<Lesson>(allLessons[0]);
  const [expandedModules, setExpandedModules] = useState<string[]>(course.modules.map(m => m.id));
  const [isChanging, setIsChanging] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  const mascot = COURSE_MASCOTS[course.id as keyof typeof COURSE_MASCOTS];

  useEffect(() => {
    if (initialModuleId) {
      // In the old system, this was a module ID. In the new, it might be a lesson ID if passed from dashboard?
      // For now, let's assume dashboard passes lesson ID or we find the right place.
      const foundLesson = allLessons.find(l => l.id === initialModuleId);
      if (foundLesson) {
        setActiveLesson(foundLesson);
      }
    }
  }, [initialModuleId, course]);

  const toggleModule = (modId: string) => {
    if (expandedModules.includes(modId)) {
      setExpandedModules(prev => prev.filter(id => id !== modId));
    } else {
      setExpandedModules(prev => [...prev, modId]);
    }
  };

  const handleLessonChange = (lesson: Lesson) => {
    if (lesson.id === activeLesson.id) return;
    setIsChanging(true);
    setTimeout(() => {
      setActiveLesson(lesson);
      setIsChanging(false);
      // Scroll top of content
      const contentArea = document.getElementById('lesson-content-area');
      if (contentArea) contentArea.scrollTop = 0;

      // Mark as "Started" or "Viewed" in backend could happen here
      if (user) {
        // Find parent module of this lesson
        const parentModule = course.modules.find(m => m.lessons.some(l => l.id === lesson.id));
        if (parentModule) {
          // We are tracking progress by Lesson ID now basically, but the backend function is named updateModuleProgress. 
          // Let's reuse it but pass lesson ID as the "moduleId" argument, assuming the backend just stores strings.
          updateModuleProgress(user.uid, course.id, lesson.id);

          // Award XP for viewing a new lesson
          const xpAmount = lesson.type === 'lab' ? 30 : lesson.type === 'video' ? 20 : 15;
          addXP(user.uid, xpAmount);
          setXpEarned(xpAmount);
          setTimeout(() => setXpEarned(null), 2000);
        }
      }
    }, 200);
  };

  const currentModule = course.modules.find(m => m.lessons.some(l => l.id === activeLesson.id));

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] animate-slide-up">
      {/* XP Earned Notification */}
      {xpEarned && (
        <div className="fixed top-24 right-8 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-[#F59E0B] to-[#EAB308] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-[#F59E0B]/30">
            <Zap size={18} fill="currentColor" />
            +{xpEarned} XP
          </div>
        </div>
      )}

      {/* Content Area */}
      <div id="lesson-content-area" className="flex-1 glass-panel rounded-[24px] overflow-y-auto p-8 md:p-10 relative scroll-smooth flex flex-col">
        <div className={`max-w-3xl mx-auto w-full transition-opacity duration-200 ${isChanging ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20 text-[#38BDF8] text-xs font-bold uppercase tracking-wider">{course.title}</span>
              <span className="text-slate-400 dark:text-slate-600">/</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{currentModule?.title}</span>
            </div>
            {mascot && (
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <img src={mascot.svg} alt={mascot.name} className="w-6 h-6" />
                <span className="text-xs text-slate-400">{mascot.name} says: "{mascot.catchphrase}"</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-8 leading-tight">{activeLesson.title}</h1>

          {/* Simulated Content Rendering */}
          <div className="prose prose-lg prose-invert max-w-none mb-12 font-light">
            {parseContentWithToolButtons(activeLesson.content, activeLesson.id, course.id)}
          </div>

          {/* Quiz Section */}
          {activeLesson.quiz && (
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[24px] p-8 mt-12 animate-fade-in backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-[#A855F7]/10 dark:bg-[#A855F7]/20 border border-[#A855F7]/30 rounded-lg mr-3 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <HelpCircle className="text-[#A855F7] w-5 h-5" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">Knowledge Check</h3>
              </div>
              {activeLesson.quiz.map((q, idx) => (
                <QuizItem key={q.id} question={q} index={idx} />
              ))}
            </div>
          )}

          {activeLesson.type === 'lab' && (
            <>
              {activeLesson.requiredTool ? (
                // Render embedded tool when requiredTool is specified
                <div className="bg-gradient-to-br from-[#6366F1]/5 to-transparent border border-[#6366F1]/20 rounded-[24px] p-8 mt-8 animate-fade-in">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display">Interactive Lab Tool</h3>
                    <p className="text-slate-600 dark:text-[#94A3B8] text-sm">Complete this hands-on exercise using the tool below.</p>
                  </div>
                  <EmbeddedTool
                    toolType={activeLesson.requiredTool}
                    context={activeLesson.toolContext}
                    lessonId={activeLesson.id}
                    courseId={course.id}
                  />
                </div>
              ) : (
                // Fallback for lab lessons without a specific tool
                <div className="bg-gradient-to-br from-[#F59E0B]/5 to-transparent border border-[#F59E0B]/20 rounded-[24px] p-8 mt-8 flex flex-col sm:flex-row items-start gap-5 animate-fade-in hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-shadow">
                  <div className="p-3 bg-[#F59E0B]/10 dark:bg-[#F59E0B]/20 rounded-xl shadow-sm dark:shadow-[0_0_15px_rgba(245,158,11,0.4)] text-[#F59E0B] flex-shrink-0 border border-[#F59E0B]/30">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">Interactive Lab Required</h3>
                    <p className="text-slate-600 dark:text-[#94A3B8] mb-5 text-sm leading-relaxed">This lesson requires you to use the AI Tools to complete the assignment. The best way to learn is by doing.</p>
                    <div className="inline-flex items-center text-amber-600 dark:text-[#FCD34D] text-sm font-bold bg-[#F59E0B]/10 px-5 py-2.5 rounded-full shadow-sm border border-[#F59E0B]/20 hover:bg-[#F59E0B]/20 transition-colors cursor-pointer">
                      Go to AI Tools in Sidebar <ArrowRight size={14} className="ml-2" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Module/Lesson Navigation */}
      <div className="w-full lg:w-[320px] glass-panel rounded-[24px] flex flex-col overflow-hidden h-fit max-h-full">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Course Curriculum</h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1 font-medium">{allLessons.length} lessons • {course.modules.length} modules</p>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {course.modules.map((mod, idx) => (
            <div key={mod.id} className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
              <button
                onClick={() => toggleModule(mod.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <div className="text-left">
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold block mb-1">Module {idx + 1}</span>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 leading-tight">{mod.title}</h4>
                </div>
                {expandedModules.includes(mod.id) ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
              </button>

              {expandedModules.includes(mod.id) && (
                <div className="border-t border-slate-200/50 dark:border-white/5">
                  {mod.lessons.map((lesson, lIdx) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonChange(lesson)}
                      className={`w-full text-left p-3 pl-6 transition-all flex items-start group relative ${activeLesson.id === lesson.id
                        ? 'bg-[#38BDF8]/10 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400'
                        }`}
                    >
                      {activeLesson.id === lesson.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#38BDF8]"></div>}

                      <div className={`flex-shrink-0 mt-0.5 mr-3 ${activeLesson.id === lesson.id ? 'text-[#38BDF8]' : 'text-slate-400'}`}>
                        {lesson.type === 'video' ? <PlayCircle size={16} /> : lesson.type === 'reading' ? <FileText size={16} /> : <CheckCircle size={16} />}
                      </div>
                      <div>
                        <span className={`text-sm font-medium block leading-snug ${activeLesson.id === lesson.id ? 'font-bold' : ''}`}>
                          {lesson.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">{lesson.duration}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const QuizItem: React.FC<{ question: QuizQuestion; index: number; onCorrectAnswer?: () => void }> = ({ question, index, onCorrectAnswer }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();

  const isCorrect = selected === question.correctAnswer;

  const handleSubmit = () => {
    setIsSubmitted(true);
    if (selected === question.correctAnswer && user) {
      // Award XP for correct quiz answer
      addXP(user.uid, 25);
      onCorrectAnswer?.();
    }
  };

  return (
    <div className="mb-8 last:mb-0">
      <p className="font-bold text-slate-900 dark:text-white mb-4 text-lg">{index + 1}. {question.question}</p>
      <div className="space-y-3">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            disabled={isSubmitted}
            onClick={() => setSelected(idx)}
            className={`w-full text-left px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 border ${isSubmitted
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
          onClick={handleSubmit}
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
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold block mb-1 text-base">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
              {isCorrect && (
                <span className="flex items-center gap-1 text-[#F59E0B] text-sm font-bold">
                  <Zap size={14} fill="currentColor" /> +25 XP
                </span>
              )}
            </div>
            <p className="opacity-90 leading-relaxed">{question.explanation}</p>
          </div>
        </div>
      )}
    </div>
  );
};