import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { AuthModal } from './modals/AuthModal';
import logo from '../logo-blue.png';

export const SplashPage: React.FC = () => {
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020712] relative overflow-hidden flex flex-col items-center justify-center font-sans text-white selection:bg-[#38BDF8] selection:text-[#020712]">

            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#38BDF8] opacity-10 rounded-full blur-[120px] animate-pulse-soft"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#6366F1] opacity-10 rounded-full blur-[120px] animate-pulse-soft"></div>
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-[#A855F7] opacity-10 rounded-full blur-[100px]"></div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">

                {/* Badge */}
                <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md animate-fade-in">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]"></span>
                    </span>
                    <span className="text-xs font-medium tracking-wide text-[#38BDF8] uppercase">Vibe Coding Masterclass 2026</span>
                </div>

                {/* Hero Title */}
                <div className="flex flex-col items-center mb-8 animate-slide-up">
                    <img src={logo} alt="Vibe Dev Logo" className="h-32 md:h-48 w-auto object-contain mb-8 drop-shadow-[0_0_30px_rgba(56,189,248,0.6)]" />
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[1.1] text-center">
                        VIBE DEV <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#A855F7] filter drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">2026</span>
                    </h1>
                </div>

                <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    Join the elite developer community building the future. Experience a gamified learning platform powered by real-time AI agents.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="group relative px-8 py-4 bg-white text-[#020712] rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
                    >
                        <span className="flex items-center">
                            Initialize Sequence
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <button className="px-8 py-4 rounded-full font-bold text-lg text-white border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95">
                        Explore Curriculum
                    </button>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 text-left animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-[#38BDF8]/20 flex items-center justify-center mb-4 text-[#38BDF8]">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">AI-Powered Labs</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Build real-world apps with integrated Gemini agents assisting your every keystroke.</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/20 flex items-center justify-center mb-4 text-[#A855F7]">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Gamified Progress</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Earn XP, maintain streaks, and unlock exclusive agent capabilities as you master concepts.</p>
                    </div>

                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-[#10B981]/20 flex items-center justify-center mb-4 text-[#10B981]">
                            <Globe size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Global Leaderboard</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">Compete with developers worldwide. showcasing your "Vibe Coding" proficiency.</p>
                    </div>
                </div>

            </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
};
