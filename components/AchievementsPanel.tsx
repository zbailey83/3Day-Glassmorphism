import React, { useState } from 'react';
import { Trophy, Star, Lock, Zap, Flame, Target, Gift } from 'lucide-react';
import {
    ACHIEVEMENTS,
    TROPHIES,
    LEVELS,
    ACHIEVEMENT_TIERS,
    DAILY_CHALLENGES,
    type Achievement,
    type AchievementTier
} from '../src/data/gamification';
import { useGamification } from '../contexts/GamificationContext';

interface AchievementsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ isOpen, onClose }) => {
    const { xp, levelInfo, xpProgress, unlockedAchievements } = useGamification();
    const [activeTab, setActiveTab] = useState<'achievements' | 'trophies' | 'levels'>('achievements');

    // Calculate next level info
    const nextLevel = LEVELS.find(l => l.level === levelInfo.level + 1);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#0F172A] w-full max-w-4xl rounded-[24px] border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header with Level Display */}
                <div className="p-6 border-b border-slate-200 dark:border-white/5 bg-gradient-to-r from-[#38BDF8]/10 via-[#6366F1]/10 to-[#A855F7]/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Trophy className="text-[#F59E0B]" size={28} />
                            Achievements & Rewards
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-500">
                            ✕
                        </button>
                    </div>

                    {/* Current Level Card */}
                    <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20">
                        <div className="relative">
                            <img
                                src={levelInfo.animalSvg}
                                alt={levelInfo.animal}
                                className="w-20 h-20 object-contain drop-shadow-lg"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#38BDF8] to-[#6366F1] text-white text-xs font-bold px-2 py-1 rounded-full">
                                Lv.{levelInfo.level}
                            </div>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{levelInfo.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-3 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#38BDF8] to-[#A855F7] rounded-full transition-all duration-500"
                                        style={{ width: `${xpProgress.percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                                    {xp} XP
                                </span>
                            </div>
                            {nextLevel && (
                                <p className="text-xs text-slate-500 mt-1">
                                    {xpProgress.needed - xpProgress.current} XP to {nextLevel.title}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-white/5 px-6">
                    {[
                        { id: 'achievements', label: 'Achievements', icon: Star },
                        { id: 'trophies', label: 'Trophies', icon: Trophy },
                        { id: 'levels', label: 'Level Rewards', icon: Gift }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all border-b-2 -mb-[2px] ${activeTab === tab.id
                                ? 'border-[#38BDF8] text-[#38BDF8]'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'achievements' && (
                        <AchievementsGrid unlockedIds={unlockedAchievements} />
                    )}
                    {activeTab === 'trophies' && (
                        <TrophiesGrid />
                    )}
                    {activeTab === 'levels' && (
                        <LevelsProgress currentXP={xp} />
                    )}
                </div>

                {/* Daily Challenges Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Target size={16} className="text-[#10B981]" />
                        Daily Challenges
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {DAILY_CHALLENGES.map(challenge => (
                            <div
                                key={challenge.id}
                                className="flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10"
                            >
                                <img src={challenge.icon} alt="" className="w-8 h-8" />
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{challenge.title}</p>
                                    <p className="text-xs text-slate-500">{challenge.description}</p>
                                </div>
                                <div className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
                                    +{challenge.xpReward} XP
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Achievement Card Component
const AchievementCard: React.FC<{ achievement: Achievement; isUnlocked: boolean }> = ({ achievement, isUnlocked }) => {
    const tierStyle = ACHIEVEMENT_TIERS[achievement.tier];

    return (
        <div
            className={`relative p-4 rounded-2xl border transition-all ${isUnlocked
                ? 'bg-white dark:bg-white/5 border-white/20 hover:scale-105'
                : 'bg-slate-100 dark:bg-white/[0.02] border-slate-200 dark:border-white/5 opacity-60'
                }`}
            style={isUnlocked ? { boxShadow: `0 0 20px ${tierStyle.glow}` } : {}}
        >
            {/* Tier Badge */}
            <div
                className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                style={{ backgroundColor: tierStyle.color, color: achievement.tier === 'gold' ? '#000' : '#fff' }}
            >
                {achievement.tier}
            </div>

            <div className="flex items-start gap-3">
                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked ? 'bg-white/10' : 'bg-slate-200 dark:bg-white/5'}`}>
                    {isUnlocked ? (
                        <img src={achievement.icon} alt="" className="w-10 h-10 object-contain" />
                    ) : (
                        <Lock size={20} className="text-slate-400" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                        {achievement.secret && !isUnlocked ? '???' : achievement.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {achievement.secret && !isUnlocked ? 'Secret achievement' : achievement.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <Zap size={12} className="text-[#F59E0B]" />
                        <span className="text-xs font-bold text-[#F59E0B]">+{achievement.xpReward} XP</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Achievements Grid
const AchievementsGrid: React.FC<{ unlockedIds: string[] }> = ({ unlockedIds }) => {
    const categories = [
        { id: 'course', label: 'Course Progress', icon: '📚' },
        { id: 'streak', label: 'Streaks', icon: '🔥' },
        { id: 'social', label: 'Community', icon: '💜' },
        { id: 'special', label: 'Special', icon: '✨' }
    ];

    return (
        <div className="space-y-8">
            {categories.map(category => {
                const categoryAchievements = ACHIEVEMENTS.filter(a => a.category === category.id);
                return (
                    <div key={category.id}>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span>{category.icon}</span>
                            {category.label}
                            <span className="text-sm font-normal text-slate-500">
                                ({categoryAchievements.filter(a => unlockedIds.includes(a.id)).length}/{categoryAchievements.length})
                            </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryAchievements.map(achievement => (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                    isUnlocked={unlockedIds.includes(achievement.id)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Trophies Grid
const TrophiesGrid: React.FC = () => {
    const rarityColors = {
        common: '#9CA3AF',
        uncommon: '#10B981',
        rare: '#3B82F6',
        epic: '#A855F7',
        legendary: '#F59E0B'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TROPHIES.map(trophy => (
                <div
                    key={trophy.id}
                    className="relative p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 text-center group hover:scale-105 transition-transform"
                >
                    <div
                        className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        style={{ backgroundColor: rarityColors[trophy.rarity], color: '#fff' }}
                    >
                        {trophy.rarity}
                    </div>

                    <div className="w-24 h-24 mx-auto mb-4 relative">
                        <div
                            className="absolute inset-0 rounded-full opacity-30 blur-xl"
                            style={{ backgroundColor: ACHIEVEMENT_TIERS[trophy.tier].color }}
                        />
                        <img
                            src={trophy.icon}
                            alt={trophy.name}
                            className="w-full h-full object-contain relative z-10 drop-shadow-lg grayscale group-hover:grayscale-0 transition-all"
                        />
                    </div>

                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{trophy.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{trophy.description}</p>
                    <p className="text-xs text-slate-400 mt-3 italic">{trophy.requirement}</p>
                </div>
            ))}
        </div>
    );
};

// Levels Progress
const LevelsProgress: React.FC<{ currentXP: number }> = ({ currentXP }) => {
    const { levelInfo } = useGamification();

    return (
        <div className="space-y-4">
            {LEVELS.map((level, idx) => {
                const isUnlocked = currentXP >= level.minXP;
                const isCurrent = level.level === levelInfo.level;

                return (
                    <div
                        key={level.level}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isCurrent
                            ? 'bg-gradient-to-r from-[#38BDF8]/10 to-[#A855F7]/10 border-[#38BDF8]/30'
                            : isUnlocked
                                ? 'bg-white/5 border-white/10'
                                : 'bg-white/[0.02] border-white/5 opacity-50'
                            }`}
                    >
                        <div className="relative">
                            <img
                                src={level.animalSvg}
                                alt={level.animal}
                                className={`w-16 h-16 object-contain ${!isUnlocked ? 'grayscale' : ''}`}
                            />
                            {isCurrent && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#10B981] rounded-full flex items-center justify-center">
                                    <Flame size={10} className="text-white" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500">LEVEL {level.level}</span>
                                {isCurrent && <span className="text-[10px] bg-[#10B981] text-white px-2 py-0.5 rounded-full">CURRENT</span>}
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{level.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{level.minXP.toLocaleString()} XP required</p>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-slate-500 mb-1">Perks:</p>
                            <div className="flex flex-wrap gap-1 justify-end">
                                {level.perks.map((perk, i) => (
                                    <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-400">
                                        {perk}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AchievementsPanel;
