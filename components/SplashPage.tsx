import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, ArrowRight, Zap, Globe, Play, ChevronDown } from 'lucide-react';
import { AuthModal } from './modals/AuthModal';
import logo from '../logo-blue.png';

export const SplashPage: React.FC = () => {
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Trigger entrance animations
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                setMousePosition({
                    x: (e.clientX - rect.left - rect.width / 2) / 50,
                    y: (e.clientY - rect.top - rect.height / 2) / 50
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div
            ref={heroRef}
            className="min-h-screen bg-[#020712] relative overflow-hidden flex flex-col font-sans text-white selection:bg-[#38BDF8] selection:text-[#020712]"
        >
            {/* Custom CSS for Motion animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(2deg); }
                }
                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.4; filter: blur(80px); }
                    50% { opacity: 0.7; filter: blur(100px); }
                }
                @keyframes text-shimmer {
                    0% { background-position: -200% center; }
                    100% { background-position: 200% center; }
                }
                @keyframes border-dance {
                    0%, 100% { border-color: rgba(56, 189, 248, 0.3); }
                    33% { border-color: rgba(129, 140, 248, 0.3); }
                    66% { border-color: rgba(168, 85, 247, 0.3); }
                }
                @keyframes particle-float {
                    0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
                }
                .spring-bounce {
                    transition: transform 700ms linear(0, 0.1737, 0.5211, 0.8491, 1.0647, 1.1552, 1.1532, 1.1043, 1.0466, 1.0024, 0.979, 0.9735, 0.979, 0.9883, 0.9968, 1.0021, 1.0042, 1.004, 1.0026, 1.0011, 1, 0.9994, 1);
                }
                .spring-elastic {
                    transition: transform 1000ms linear(0, 0.1262, 0.4133, 0.7368, 1.0078, 1.1812, 1.2506, 1.2366, 1.1719, 1.0896, 1.0154, 0.9638, 0.9389, 0.9372, 0.9509, 0.9713, 0.9912, 1.0062, 1.0144, 1.0163, 1.0137, 1.0088, 1.0036, 0.9993, 0.9968, 1, 0.9962, 0.9974, 0.9987, 0.9999, 1.0007, 1, 1);
                }
                .spring-snappy {
                    transition: transform 350ms linear(0, 0.3772, 0.8604, 1.0738, 1.0846, 1.0353, 1.0006, 0.991, 0.9941, 0.9985, 1.0006, 1);
                }
                .bounce-drop {
                    animation: bounce-in 800ms linear(0, 0.0012, 0.0048, 0.0109, 0.0194, 0.0303, 0.0436, 0.0594, 0.0776, 0.0982, 0.1212, 0.1466, 0.1745, 0.2048, 0.2375, 0.2726, 0.3102, 0.3502, 0.3926, 0.4374, 0.4847, 0.5344, 0.5865, 0.641, 0.698, 0.7573, 0.8191, 0.8834, 0.95, 0.9906, 0.9577, 0.9271, 0.8991, 0.8734, 0.8501, 0.8293, 0.8109, 0.795, 0.7814, 0.7703, 0.7616, 0.7553, 0.7514, 0.75, 0.751, 0.7544, 0.7603, 0.7685, 0.7792, 0.7923, 0.8078, 0.8258, 0.8462, 0.869, 0.8942, 0.9219, 0.9519, 0.9844, 0.9909, 0.976, 0.9635, 0.9535, 0.9459, 0.9407, 0.938, 0.9377, 0.9398, 0.9443, 0.9512, 0.9606, 0.9724, 0.9866, 0.9985, 0.9914, 0.9868, 0.9846, 0.9848, 0.9874, 0.9925, 1) forwards;
                }
                @keyframes bounce-in {
                    from { transform: translateY(-100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-white/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            bottom: '-10px',
                            animation: `particle-float ${8 + Math.random() * 12}s linear infinite`,
                            animationDelay: `${Math.random() * 8}s`
                        }}
                    />
                ))}
            </div>

            {/* Dynamic Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-[800px] h-[800px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)',
                        top: '-20%',
                        left: '-10%',
                        transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)`,
                        transition: 'transform 0.3s ease-out',
                        animation: 'glow-pulse 4s ease-in-out infinite'
                    }}
                />
                <div
                    className="absolute w-[600px] h-[600px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
                        bottom: '-10%',
                        right: '-5%',
                        transform: `translate(${-mousePosition.x * 1.5}px, ${-mousePosition.y * 1.5}px)`,
                        transition: 'transform 0.3s ease-out',
                        animation: 'glow-pulse 5s ease-in-out infinite 1s'
                    }}
                />
                <div
                    className="absolute w-[400px] h-[400px] rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
                        top: '30%',
                        right: '20%',
                        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                        transition: 'transform 0.4s ease-out',
                        animation: 'glow-pulse 6s ease-in-out infinite 2s'
                    }}
                />
            </div>

            {/* Noise Texture Overlay */}
            <div
                className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
                }}
            />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

            {/* Main Hero Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6">
                <div className="max-w-6xl mx-auto text-center">

                    {/* Animated Badge */}
                    <div
                        className={`inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-full px-5 py-2 mb-10 backdrop-blur-xl transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
                        style={{ animationDelay: '0.1s', animation: isLoaded ? 'border-dance 3s ease-in-out infinite' : 'none' }}
                    >
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#38BDF8]"></span>
                        </span>
                        <span className="text-sm font-medium tracking-widest text-white/70 uppercase">Now Enrolling • Cohort 2026</span>
                    </div>

                    {/* Logo with 3D Parallax */}
                    <div
                        className={`relative mb-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                        style={{
                            transform: isLoaded ? `perspective(1000px) rotateX(${mousePosition.y * 0.5}deg) rotateY(${mousePosition.x * 0.5}deg)` : 'scale(0.9)',
                            transitionDelay: '0.2s'
                        }}
                    >
                        <img
                            src={logo}
                            alt="Vibe Dev Logo"
                            className="h-28 md:h-40 w-auto object-contain mx-auto"
                            style={{
                                filter: 'drop-shadow(0 0 60px rgba(56,189,248,0.4)) drop-shadow(0 0 120px rgba(56,189,248,0.2))',
                                animation: 'float 6s ease-in-out infinite'
                            }}
                        />
                    </div>

                    {/* Hero Title with Staggered Animation */}
                    <h1 className="mb-6">
                        <span
                            className={`block text-6xl md:text-8xl lg:text-9xl font-display font-black tracking-tighter leading-[0.9] transition-all duration-700 spring-elastic ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                            style={{ transitionDelay: '0.3s' }}
                        >
                            VIBE DEV
                        </span>
                        <span
                            className={`block text-7xl md:text-9xl lg:text-[12rem] font-display font-black tracking-tighter leading-[0.85] transition-all duration-700 spring-elastic ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                            style={{
                                transitionDelay: '0.45s',
                                background: 'linear-gradient(135deg, #38BDF8 0%, #818CF8 25%, #A855F7 50%, #38BDF8 75%, #818CF8 100%)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                animation: 'text-shimmer 4s linear infinite',
                                filter: 'drop-shadow(0 0 30px rgba(56,189,248,0.3))'
                            }}
                        >
                            2026
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p
                        className={`text-lg md:text-2xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                        style={{ transitionDelay: '0.55s' }}
                    >
                        The elite developer experience. AI-powered learning meets
                        <span className="text-white/80"> gamified mastery</span>.
                    </p>

                    {/* CTA Buttons */}
                    <div
                        className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                        style={{ transitionDelay: '0.65s' }}
                    >
                        <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="group relative px-10 py-5 rounded-full font-bold text-lg overflow-hidden spring-snappy hover:scale-105 active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 50%, #A855F7 100%)',
                                boxShadow: '0 0 40px rgba(56,189,248,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                            }}
                        >
                            <span className="relative z-10 flex items-center text-white">
                                Initialize Sequence
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>

                        <button className="group flex items-center gap-3 px-8 py-5 rounded-full font-bold text-lg text-white/80 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 backdrop-blur-xl transition-all spring-snappy hover:scale-105 active:scale-95">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                <Play size={16} className="ml-0.5" fill="currentColor" />
                            </div>
                            Watch Trailer
                        </button>
                    </div>

                    {/* Stats Row */}
                    <div
                        className={`flex flex-wrap items-center justify-center gap-8 md:gap-16 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                        style={{ transitionDelay: '0.75s' }}
                    >
                        {[
                            { value: '10K+', label: 'Developers' },
                            { value: '50+', label: 'AI Labs' },
                            { value: '98%', label: 'Completion' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1">{stat.value}</div>
                                <div className="text-sm text-white/40 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feature Cards - Bottom Section */}
            <div className="relative z-10 px-6 pb-24">
                <div
                    className={`max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    style={{ transitionDelay: '0.9s' }}
                >
                    {[
                        { icon: Zap, color: '#38BDF8', title: 'AI-Powered Labs', desc: 'Build with integrated Gemini agents assisting every keystroke.' },
                        { icon: Sparkles, color: '#A855F7', title: 'Gamified Progress', desc: 'Earn XP, maintain streaks, unlock exclusive capabilities.' },
                        { icon: Globe, color: '#10B981', title: 'Global Community', desc: 'Compete worldwide on the Vibe Coding leaderboard.' }
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl overflow-hidden spring-bounce hover:scale-[1.02] hover:bg-white/[0.04] cursor-pointer"
                            style={{ transitionDelay: `${0.9 + i * 0.1}s` }}
                        >
                            {/* Hover Glow */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `radial-gradient(circle at 50% 0%, ${feature.color}15 0%, transparent 70%)` }}
                            />

                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110"
                                style={{ backgroundColor: `${feature.color}15` }}
                            >
                                <feature.icon size={26} style={{ color: feature.color }} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                            <p className="text-white/40 leading-relaxed">{feature.desc}</p>

                            {/* Corner Accent */}
                            <div
                                className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ background: `radial-gradient(circle at 100% 0%, ${feature.color}10 0%, transparent 70%)` }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll Indicator */}
            <div
                className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: '1.2s' }}
            >
                <span className="text-xs text-white/30 uppercase tracking-widest">Scroll</span>
                <ChevronDown size={20} className="text-white/30 animate-bounce" />
            </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </div>
    );
};
