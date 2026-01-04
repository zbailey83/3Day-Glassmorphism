import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, Edit2, Grid, Award, Zap, Calendar, MessageSquare, Heart, Share2, UploadCloud } from 'lucide-react';
import { GalleryItem } from '../types';
import { getUserGallery } from '../services/firebase';
import { UploadProjectModal } from './modals/UploadProjectModal';

export const ProfilePage: React.FC = () => {
    const { user, userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'work' | 'saved'>('work');
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isLoadingGallery, setIsLoadingGallery] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            if (user) {
                try {
                    const items = await getUserGallery(user.uid);
                    setGallery(items);
                } catch (e) {
                    console.error("Failed to load gallery", e);
                } finally {
                    setIsLoadingGallery(false);
                }
            }
        };
        fetchGallery();
    }, [user]);

    const handleUploadComplete = (newItem: GalleryItem) => {
        setGallery([newItem, ...gallery]);
    };

    if (!user) return null;

    return (
        <div className="flex flex-col h-full animate-slide-up">
            {isUploadModalOpen && (
                <UploadProjectModal
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadComplete={handleUploadComplete}
                />
            )}

            {/* Header Profile Card */}
            <div className="relative w-full rounded-[24px] overflow-hidden bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 shadow-xl mb-8 group">

                {/* Banner */}
                <div className="h-48 bg-gradient-to-r from-[#38BDF8] via-[#6366F1] to-[#A855F7] w-full relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <button className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors">
                        <Edit2 size={16} />
                    </button>
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-center relative">
                    {/* Avatar */}
                    <div className="-mt-16 mr-6 relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#0F172A] shadow-lg overflow-hidden bg-[#0F172A]">
                            <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                        </div>
                        <button className="absolute bottom-1 right-1 p-2 bg-[#38BDF8] text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                            <Camera size={14} />
                        </button>
                    </div>

                    {/* Texts */}
                    <div className="flex-1 mt-4 md:mt-0">
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white flex items-center">
                            {user.displayName || "Anonymous Coder"}
                            <span className="ml-3 px-3 py-1 rounded-full bg-[#38BDF8]/10 text-[#38BDF8] text-xs font-bold uppercase tracking-wider border border-[#38BDF8]/20">
                                Level {userProfile?.level || 1}
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-[#94A3B8] mt-1">Full-Stack AI Developer • San Francisco, CA</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 mt-6 md:mt-0">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center">
                                {userProfile?.streakDays || 0} <Zap size={16} className="ml-1 text-[#F59E0B]" fill="currentColor" />
                            </div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Day Streak</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {userProfile?.xp || 0}
                            </div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total XP</div>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {gallery.length}
                            </div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Projects</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="flex flex-col lg:flex-row gap-8 flex-1">

                {/* Left: Stats/Badges */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="glass-panel p-6 rounded-[24px]">
                        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                            <Award className="text-[#A855F7] mr-2" size={20} /> Achievements
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="aspect-square rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-pointer hover:bg-[#38BDF8]/10 hover:border-[#38BDF8]/30">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#38BDF8] to-[#A855F7] opacity-60"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-[24px]">
                        <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                            <Calendar className="text-[#10B981] mr-2" size={20} /> Vibe Calendar
                        </h3>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <div key={i} className={`aspect-square rounded-md ${Math.random() > 0.7
                                    ? 'bg-[#10B981]/40 border border-[#10B981]/50'
                                    : 'bg-slate-100 dark:bg-white/5'
                                    }`}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Gallery */}
                <div className="flex-1">
                    {/* Tabs */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                            <button
                                onClick={() => setActiveTab('work')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'work' ? 'bg-white dark:bg-[#0F172A] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                My Work
                            </button>
                            <button
                                onClick={() => setActiveTab('saved')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'saved' ? 'bg-white dark:bg-[#0F172A] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                Saved
                            </button>
                        </div>

                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="flex items-center px-4 py-2 bg-[#38BDF8] hover:bg-[#0284C7] text-white rounded-xl font-bold transition-colors shadow-lg shadow-[#38BDF8]/20"
                        >
                            <UploadCloud size={18} className="mr-2" /> Upload Project
                        </button>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoadingGallery && (
                            <div className="col-span-2 py-12 flex justify-center text-slate-500">
                                <div className="animate-spin mr-2">🌀</div> Loading gallery...
                            </div>
                        )}

                        {!isLoadingGallery && gallery.map(item => (
                            <div key={item.id} className="group glass-panel rounded-[24px] overflow-hidden hover:translate-y-[-4px] transition-transform duration-300">
                                {/* Image */}
                                <div className="aspect-video bg-slate-200 dark:bg-[#020712] relative overflow-hidden">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                        <div className="w-full flex items-center justify-between">
                                            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                                                <Heart size={18} />
                                            </button>
                                            <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                                                <Share2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider">{item.tags[0]}</span>
                                        <span className="text-xs text-slate-400">
                                            {item.submittedAt?.toDate ? item.submittedAt.toDate().toLocaleDateString() : 'Just now'}
                                        </span>
                                    </div>
                                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-[#94A3B8] leading-relaxed line-clamp-2 mb-4">{item.description}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                                        <div className="flex items-center text-xs text-slate-400">
                                            <MessageSquare size={14} className="mr-1" /> 0 Comments
                                        </div>
                                        <div className="flex items-center text-xs font-bold text-slate-900 dark:text-white">
                                            <Heart size={14} className="mr-1 text-red-500 fill-red-500" /> {item.likes}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty State / Add New */}
                        <div
                            onClick={() => setIsUploadModalOpen(true)}
                            className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-[24px] flex flex-col items-center justify-center p-8 text-center min-h-[300px] hover:border-[#38BDF8]/50 hover:bg-[#38BDF8]/5 transition-all cursor-pointer group/add h-full"
                        >
                            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4 group-hover/add:bg-[#38BDF8]/20 group-hover/add:text-[#38BDF8] transition-colors">
                                <UploadCloud size={32} className="text-slate-400 dark:text-slate-600 group-hover/add:text-[#38BDF8]" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Upload New Project</h3>
                            <p className="text-sm text-slate-500 max-w-xs mx-auto">Share your progress with the community and earn XP for your portfolio.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
