import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CourseView } from './components/CourseView';
import { CampaignGenerator } from './components/tools/CampaignGenerator';
import { ImageGenLab } from './components/tools/ImageGenLab';
import { SeoAnalyzer } from './components/tools/SeoAnalyzer';
import { Course, Module } from './types';
import { COURSES } from './constants';
import { Menu, X } from 'lucide-react';

// Simple view router state type
export type ViewState = 
  | { type: 'dashboard' }
  | { type: 'course'; courseId: string; moduleId?: string }
  | { type: 'tool'; toolName: 'campaign' | 'image' | 'seo'; action?: 'openLibrary' };

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>({ type: 'dashboard' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toggle body class
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
    // Scroll to top on navigation
    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.scrollTop = 0;
  };

  const renderContent = () => {
    switch (currentView.type) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} courses={COURSES} />;
      case 'course':
        const course = COURSES.find(c => c.id === currentView.courseId);
        if (!course) return <div>Course not found</div>;
        return <CourseView course={course} initialModuleId={currentView.moduleId} />;
      case 'tool':
        switch (currentView.toolName) {
          case 'campaign': return <CampaignGenerator />;
          case 'image': return <ImageGenLab initialAction={currentView.action} />;
          case 'seo': return <SeoAnalyzer />;
          default: return <div>Tool not found</div>;
        }
      default:
        return <Dashboard onNavigate={handleNavigate} courses={COURSES} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden selection:bg-[#38BDF8] selection:text-[#020712] transition-colors duration-300 ${isDarkMode ? 'text-[#F9FAFB]' : 'text-[#0F172A]'}`}>
      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-md z-40 transition-opacity duration-300 md:hidden ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white/80 dark:bg-[#0F172A]/85 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 transform transition-transform duration-400 cubic-bezier(0.21, 0.85, 0.35, 1.0) md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          currentView={currentView} 
          onNavigate={handleNavigate} 
          onCloseMobile={() => setIsMobileMenuOpen(false)} 
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 md:hidden flex items-center justify-between p-4 sticky top-0 z-30 transition-colors">
          <div className="flex items-center">
             <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            <span className="ml-3 font-display font-bold text-xl text-slate-900 dark:text-white">
              MarketerAI
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#38BDF8] to-[#A855F7] p-[2px] shadow-[0_0_15px_rgba(56,189,248,0.5)]">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="User" className="rounded-full bg-slate-100 dark:bg-[#0F172A] h-full w-full" />
          </div>
        </header>
        
        <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-slide-up">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;