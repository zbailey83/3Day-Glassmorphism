import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserProfile, DailyChallengeProgress } from '../types';
import { getLevelFromXP, getXPProgress, LevelInfo, Achievement } from '../src/data/gamification';
import { awardXP as awardXPService } from '../services/xpService';
import { completeLesson as completeLessonService, completeCourse as completeCourseService } from '../services/lessonService';
import { checkAchievements as checkAchievementsService } from '../services/achievementService';
import { updateStreak as updateStreakService } from '../services/streakService';
import { getDailyChallenges, completeDailyChallenge as completeDailyChallengeService } from '../services/dailyChallengeService';
import { DailyChallenge } from '../src/data/gamification';
import { showXPGain, showLevelUp, showAchievementUnlock, showStreakUpdate } from '../services/notificationService';

// Context type definition
interface GamificationContextType {
    // State
    xp: number;
    level: number;
    levelInfo: LevelInfo;
    xpProgress: { current: number; needed: number; percentage: number };
    unlockedAchievements: string[];
    streak: number;
    dailyChallenges: DailyChallengeProgress[];
    loading: boolean;

    // Actions
    awardXP: (amount: number, reason: string) => Promise<void>;
    completeLesson: (courseId: string, lessonId: string, lessonType?: 'video' | 'reading' | 'lab') => Promise<void>;
    completeCourse: (courseId: string) => Promise<void>;
    checkAchievements: () => Promise<void>;
    updateStreak: () => Promise<void>;
    completeDailyChallenge: (challengeId: string) => Promise<void>;
    uploadProject: (projectId: string) => Promise<void>;
    receiveProjectLike: (projectId: string) => Promise<void>;

    // Utilities
    showLevelUpNotification: (newLevel: LevelInfo) => void;
    showAchievementNotification: (achievement: Achievement) => void;
}

// State type for reducer
interface GamificationState {
    xp: number;
    level: number;
    levelInfo: LevelInfo;
    xpProgress: { current: number; needed: number; percentage: number };
    unlockedAchievements: string[];
    streak: number;
    dailyChallenges: Array<DailyChallenge & { completed: boolean }>;
    loading: boolean;
}

// Action types for reducer
type GamificationAction =
    | { type: 'SET_PROFILE'; payload: UserProfile }
    | { type: 'UPDATE_XP'; payload: number }
    | { type: 'UPDATE_LEVEL'; payload: number }
    | { type: 'UPDATE_STREAK'; payload: number }
    | { type: 'ADD_ACHIEVEMENT'; payload: string }
    | { type: 'SET_DAILY_CHALLENGES'; payload: Array<DailyChallenge & { completed: boolean }> }
    | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: GamificationState = {
    xp: 0,
    level: 1,
    levelInfo: getLevelFromXP(0),
    xpProgress: getXPProgress(0),
    unlockedAchievements: [],
    streak: 0,
    dailyChallenges: [],
    loading: true
};

// Reducer function
function gamificationReducer(state: GamificationState, action: GamificationAction): GamificationState {
    switch (action.type) {
        case 'SET_PROFILE': {
            const profile = action.payload;
            const levelInfo = getLevelFromXP(profile.xp);
            const xpProgress = getXPProgress(profile.xp);

            return {
                ...state,
                xp: profile.xp,
                level: profile.level,
                levelInfo,
                xpProgress,
                unlockedAchievements: profile.unlockedAchievements || [],
                streak: profile.streakDays || 0,
                loading: false
            };
        }

        case 'UPDATE_XP': {
            const newXP = action.payload;
            const levelInfo = getLevelFromXP(newXP);
            const xpProgress = getXPProgress(newXP);

            return {
                ...state,
                xp: newXP,
                levelInfo,
                xpProgress
            };
        }

        case 'UPDATE_LEVEL': {
            return {
                ...state,
                level: action.payload
            };
        }

        case 'UPDATE_STREAK': {
            return {
                ...state,
                streak: action.payload
            };
        }

        case 'ADD_ACHIEVEMENT': {
            return {
                ...state,
                unlockedAchievements: [...state.unlockedAchievements, action.payload]
            };
        }

        case 'SET_DAILY_CHALLENGES': {
            return {
                ...state,
                dailyChallenges: action.payload
            };
        }

        case 'SET_LOADING': {
            return {
                ...state,
                loading: action.payload
            };
        }

        default:
            return state;
    }
}

// Create context
export const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Provider component
export const GamificationProvider: React.FC<{ children: React.ReactNode; userId: string | null }> = ({
    children,
    userId
}) => {
    const [state, dispatch] = useReducer(gamificationReducer, initialState);

    // Notification functions integrated with notification service
    const showLevelUpNotification = useCallback((newLevel: LevelInfo) => {
        console.log('Level up!', newLevel);
        showLevelUp(newLevel);
    }, []);

    const showAchievementNotification = useCallback((achievement: Achievement) => {
        console.log('Achievement unlocked!', achievement);
        showAchievementUnlock(achievement);
    }, []);

    // Action methods (to be implemented in task 7.3)
    const awardXP = useCallback(async (amount: number, reason: string) => {
        if (!userId) {
            console.error('Cannot award XP: No user logged in');
            return;
        }

        try {
            await awardXPService(userId, amount, reason);
            console.log(`Awarded ${amount} XP for: ${reason}`);

            // Show XP gain notification
            showXPGain(amount, reason);
        } catch (error) {
            console.error('Error awarding XP:', error);
        }
    }, [userId]);

    const completeLesson = useCallback(async (
        courseId: string,
        lessonId: string,
        lessonType: 'video' | 'reading' | 'lab' = 'reading'
    ) => {
        if (!userId) {
            console.error('Cannot complete lesson: No user logged in');
            return;
        }

        try {
            await completeLessonService(userId, courseId, lessonId, lessonType);
            console.log(`Completed lesson ${lessonId} in course ${courseId}`);
        } catch (error) {
            console.error('Error completing lesson:', error);
        }
    }, [userId]);

    const completeCourse = useCallback(async (courseId: string) => {
        if (!userId) {
            console.error('Cannot complete course: No user logged in');
            return;
        }

        try {
            await completeCourseService(userId, courseId);
            console.log(`Completed course ${courseId}`);
        } catch (error) {
            console.error('Error completing course:', error);
        }
    }, [userId]);

    const checkAchievements = useCallback(async () => {
        if (!userId) {
            console.error('Cannot check achievements: No user logged in');
            return;
        }

        try {
            const newAchievements = await checkAchievementsService(userId, {});
            console.log(`Checked achievements, found ${newAchievements.length} new unlocks`);

            // Show notifications for new achievements
            newAchievements.forEach(achievement => {
                showAchievementNotification(achievement);
            });
        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    }, [userId, showAchievementNotification]);

    const updateStreak = useCallback(async () => {
        if (!userId) {
            console.error('Cannot update streak: No user logged in');
            return;
        }

        try {
            const newStreak = await updateStreakService(userId);
            console.log(`Updated streak to ${newStreak} days`);

            // Show streak update notification
            showStreakUpdate(newStreak);
        } catch (error) {
            console.error('Error updating streak:', error);
        }
    }, [userId]);

    const completeDailyChallenge = useCallback(async (challengeId: string) => {
        if (!userId) {
            console.error('Cannot complete daily challenge: No user logged in');
            return;
        }

        try {
            await completeDailyChallengeService(userId, challengeId);
            console.log(`Completed daily challenge ${challengeId}`);

            // Refresh daily challenges to update completion status
            const updatedChallenges = await getDailyChallenges(userId);
            dispatch({ type: 'SET_DAILY_CHALLENGES', payload: updatedChallenges });
        } catch (error) {
            console.error('Error completing daily challenge:', error);
        }
    }, [userId]);

    const uploadProject = useCallback(async (projectId: string) => {
        if (!userId) {
            console.error('Cannot upload project: No user logged in');
            return;
        }

        console.log(`Project ${projectId} upload - to be implemented in task 9`);
        // TODO: Implement in task 9
    }, [userId]);

    const receiveProjectLike = useCallback(async (projectId: string) => {
        if (!userId) {
            console.error('Cannot receive project like: No user logged in');
            return;
        }

        console.log(`Project ${projectId} like received - to be implemented in task 9`);
        // TODO: Implement in task 9
    }, [userId]);

    // Real-time Firestore listener for user profile updates
    useEffect(() => {
        if (!userId) {
            // No user logged in, reset to initial state
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });

        // Subscribe to user profile document
        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(
            userRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userProfile = docSnapshot.data() as UserProfile;

                    // Update context state with new profile data
                    dispatch({ type: 'SET_PROFILE', payload: userProfile });

                    // Check for level up
                    const newLevelInfo = getLevelFromXP(userProfile.xp);
                    if (newLevelInfo.level > state.level && state.level > 0) {
                        // User leveled up!
                        showLevelUpNotification(newLevelInfo);
                    }

                    console.log('Gamification profile updated:', {
                        xp: userProfile.xp,
                        level: userProfile.level,
                        streak: userProfile.streakDays,
                        achievements: userProfile.unlockedAchievements?.length || 0
                    });
                } else {
                    console.error('User profile document does not exist');
                    dispatch({ type: 'SET_LOADING', payload: false });
                }
            },
            (error) => {
                console.error('Error listening to user profile:', error);
                dispatch({ type: 'SET_LOADING', payload: false });
            }
        );

        // Cleanup listener on unmount or when userId changes
        return () => {
            console.log('Cleaning up gamification listener');
            unsubscribe();
        };
    }, [userId, state.level, showLevelUpNotification]);

    // Load daily challenges when user logs in
    useEffect(() => {
        if (!userId) {
            return;
        }

        const loadDailyChallenges = async () => {
            try {
                const challenges = await getDailyChallenges(userId);
                dispatch({ type: 'SET_DAILY_CHALLENGES', payload: challenges });
                console.log('Loaded daily challenges:', challenges);
            } catch (error) {
                console.error('Error loading daily challenges:', error);
            }
        };

        loadDailyChallenges();
    }, [userId]);

    const contextValue: GamificationContextType = {
        // State
        xp: state.xp,
        level: state.level,
        levelInfo: state.levelInfo,
        xpProgress: state.xpProgress,
        unlockedAchievements: state.unlockedAchievements,
        streak: state.streak,
        dailyChallenges: state.dailyChallenges,
        loading: state.loading,

        // Actions
        awardXP,
        completeLesson,
        completeCourse,
        checkAchievements,
        updateStreak,
        completeDailyChallenge,
        uploadProject,
        receiveProjectLike,

        // Utilities
        showLevelUpNotification,
        showAchievementNotification
    };

    return (
        <GamificationContext.Provider value={contextValue}>
            {children}
        </GamificationContext.Provider>
    );
};

// Custom hook to use the context
export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};
