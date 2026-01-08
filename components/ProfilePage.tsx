import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../hooks/useAuth';
import { Camera, Edit2, Grid, Award, Zap, Calendar, MessageSquare, Heart, Share2, UploadCloud, Terminal, Shield, Sparkles, Bookmark } from 'lucide-react';
import { GalleryItem } from '../types';
import { getUserGallery, getProjectsByIds, toggleProjectLike, toggleProjectSave } from '../services/firebase';
import { UploadProjectModal } from './modals/UploadProjectModal';
import { EditProfileModal } from './modals/EditProfileModal';

export const ProfilePage: React.FC = () => {
    const { user, userProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'work' | 'saved'>('work');
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoadingGallery, setIsLoadingGallery] = useState(true);

    const defaultProfile = {
        uid: user?.uid || '',
        email: user?.email || '',
        displayName: user?.displayName || '',
        photoURL: user?.photoURL || '',
        xp: 0,
        level: 1,
        streakDays: 1,
        lastLogin: new Date(),
        enrolledCourses: [],
        courseProgress: []
    };

    useEffect(() => {
        const fetchGallery = async () => {
            if (user) {
                setIsLoadingGallery(true);
                try {
                    let items: GalleryItem[] = [];
                    if (activeTab === 'work') {
                        items = await getUserGallery(user.uid);
                    } else if (activeTab === 'saved') {
                        const savedIds = userProfile?.savedProjects || [];
                        items = await getProjectsByIds(savedIds);
                    }
                    setGallery(items);
                } catch (e) {
                    console.error("Failed to load gallery", e);
                } finally {
                    setIsLoadingGallery(false);
                }
            }
        };
        fetchGallery();
    }, [user, activeTab, userProfile?.savedProjects]);

    const handleToggleLike = async (item: GalleryItem) => {
        if (!user || !userProfile) return;
        const isLiked = userProfile.likedProjects?.includes(item.id);

        // Optimistic UI update (local only for visual feedback, real sync comes from Firestore listener in AuthContext but we might need to manually update local gallery state if we want instant feedback on numbers)
        // For simple "Heart" color, we rely on userProfile.
        // For the count, we might need to increment locally.

        try {
            await toggleProjectLike(user.uid, item.id, !!isLiked);
            // Updating the local gallery item like count for immediate feedback
            setGallery(prev => prev.map(g =>
                g.id === item.id
                    ? { ...g, likes: g.likes + (isLiked ? -1 : 1) }
                    : g
            ));
        } catch (error) {
            console.error("Error toggling like", error);
        }
    };

    const handleToggleSave = async (item: GalleryItem) => {
        if (!user || !userProfile) return;
        const isSaved = userProfile.savedProjects?.includes(item.id);

        try {
            await toggleProjectSave(user.uid, item.id, !!isSaved);
            // If we are in 'saved' tab and we unsave, we might want to remove it from view? 
            // Better to let it stay until refresh or tab change to avoid jumppiness, 
            // but commonly users expect it to disappear or show as unsaved.
            // Since we rely on userProfile prop for "isSaved" status, it will update automatically via AuthContext.
        } catch (error) {
            console.error("Error toggling save", error);
        }
    };

    const handleUploadComplete = (newItem: GalleryItem) => {
        setGallery([newItem, ...gallery]);
    };

    if (!user) return null;

    return (
        <div className="flex flex-col h-full animate-slide-up relative z-0">
            {isUploadModalOpen && createPortal(
                <UploadProjectModal
                    onClose={() => setIsUploadModalOpen(false)}
                    onUploadComplete={handleUploadComplete}
                />,
                document.body
            )}

            {isEditModalOpen && createPortal(
                <EditProfileModal
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdateComplete={() => {
                        // Profile updates automatically via AuthContext Firestore listener
                        // No need to reload the page
                    }}
                    initialData={userProfile || defaultProfile}
                />,
                document.body
            )}

            {/* Header Profile Card */}
            <div className="relative w-full rounded-[24px] overflow-hidden bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-white/5 shadow-xl mb-8 group">

                {/* Banner */}
                <div className="h-48 w-full relative group/banner">
                    {userProfile?.bannerURL ? (
                        <img
                            src={userProfile.bannerURL}
                            alt="Profile Banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-[#38BDF8] via-[#6366F1] to-[#A855F7] relative">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        </div>
                    )}

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover/banner:opacity-100"
                    >
                        <Edit2 size={16} />
                    </button>

                    {/* Dark overlay gradient for text readability at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8 flex flex-col md:flex-row items-end md:items-center relative">
                    {/* Avatar */}
                    <div className="-mt-16 mr-6 relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-[#0F172A] shadow-lg overflow-hidden bg-[#0F172A]">
                            <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                        </div>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="absolute bottom-1 right-1 p-2 bg-[#38BDF8] text-white rounded-full shadow-lg hover:scale-110 transition-transform"
                        >
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
                        <p className="text-slate-500 dark:text-[#94A3B8] mt-1">
                            {userProfile?.role || "Full-Stack AI Developer"} • {userProfile?.location || "Global"}
                        </p>
                        {userProfile?.bio && (
                            <p className="text-sm text-slate-400 mt-2 max-w-lg">{userProfile.bio}</p>
                        )}
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
                    <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                        <Award className="text-[#A855F7] mr-2" size={20} /> Achievements
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { icon: Zap, color: '#F59E0B', label: 'Fast Starter' },
                            { icon: Calendar, color: '#10B981', label: 'Consistent' },
                            { icon: Heart, color: '#EF4444', label: 'Community' },
                            { icon: Share2, color: '#38BDF8', label: 'Sharer' },
                            { icon: Terminal, color: '#6366F1', label: 'Coder' },
                            { icon: Grid, color: '#A855F7', label: 'Architect' },
                            { icon: Shield, color: '#F43F5E', label: 'Guardian' },
                            { icon: Sparkles, color: '#EAB308', label: 'Wizard' }
                        ].map((badge, i) => (
                            <div key={i} className="aspect-square rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-all cursor-pointer group/badge relative" title={badge.label}>
                                <badge.icon size={20} style={{ color: badge.color }} className="opacity-80 group-hover/badge:opacity-100 group-hover/badge:scale-110 transition-all" />
                            </div>
                        ))}
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
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleLike(item); }}
                                                    className={`p-2 backdrop-blur-md rounded-full transition-colors ${userProfile?.likedProjects?.includes(item.id) ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                                >
                                                    <Heart size={18} fill={userProfile?.likedProjects?.includes(item.id) ? "currentColor" : "none"} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleToggleSave(item); }}
                                                    className={`p-2 backdrop-blur-md rounded-full transition-colors ${userProfile?.savedProjects?.includes(item.id) ? 'bg-[#38BDF8] text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
                                                >
                                                    <Bookmark size={18} fill={userProfile?.savedProjects?.includes(item.id) ? "currentColor" : "none"} />
                                                </button>
                                            </div>
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
                                            <Heart size={14} className={`mr-1 ${userProfile?.likedProjects?.includes(item.id) ? 'text-red-500 fill-red-500' : 'text-slate-400'}`} /> {item.likes}
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
