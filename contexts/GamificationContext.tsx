import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef } from 'react';
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
import { getLocalXP, awardLocalXP, completeLocalLesson, syncToFirestore } from '../services/localStorageXP';

// XP award queue item
interface XPAwardQueueItem {
    amount: number;
    reason: string;
}

// Debounce delay for batching XP awards (in milliseconds)
const XP_DEBOUNCE_DELAY = 1000;

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

    // XP debouncing state
    const xpQueueRef = useRef<XPAwardQueueItem[]>([]);
    const xpDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Firestore connection state
    const useLocalStorageRef = useRef(false);
    const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Flush XP queue - batch all pending XP awards into a single database write
    const flushXPQueue = useCallback(async () => {
        if (!userId || xpQueueRef.current.length === 0) {
            console.log('[GamificationContext] Skipping XP flush:', { userId, queueLength: xpQueueRef.current.length });
            return;
        }

        const queueCopy = [...xpQueueRef.current];
        xpQueueRef.current = [];

        // Calculate total XP from all queued awards
        const totalXP = queueCopy.reduce((sum, item) => sum + item.amount, 0);

        // Combine reasons for logging
        const combinedReason = queueCopy.length === 1
            ? queueCopy[0].reason
            : `Batch award: ${queueCopy.map(item => `${item.amount} XP (${item.reason})`).join(', ')}`;

        console.log('[GamificationContext] Flushing XP queue:', {
            userId,
            totalXP,
            queueLength: queueCopy.length,
            combinedReason
        });

        try {
            // Try Firestore first
            await awardXPService(userId, totalXP, combinedReason);
            console.log(`[GamificationContext] ✅ Flushed XP queue to Firestore: ${totalXP} XP from ${queueCopy.length} awards`);
            useLocalStorageRef.current = false;

            // Show individual notifications for each award
            queueCopy.forEach(item => {
                showXPGain(item.amount, item.reason);
            });
        } catch (error: any) {
            console.error('[GamificationContext] ❌ Firestore flush failed, using localStorage:', error);

            // Fallback to localStorage
            useLocalStorageRef.current = true;
            const localData = awardLocalXP(userId, totalXP, combinedReason);

            // Update local state immediately
            dispatch({ type: 'UPDATE_XP', payload: localData.xp });
            dispatch({ type: 'UPDATE_LEVEL', payload: localData.level });

            console.log(`[GamificationContext] ✅ Flushed XP queue to localStorage: ${totalXP} XP`);

            // Show notifications
            queueCopy.forEach(item => {
                showXPGain(item.amount, item.reason);
            });
        }
    }, [userId]);

    // Cleanup XP debounce timer on unmount
    useEffect(() => {
        return () => {
            if (xpDebounceTimerRef.current) {
                clearTimeout(xpDebounceTimerRef.current);
                // Flush any remaining XP awards
                flushXPQueue();
            }
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [flushXPQueue]);

    // Periodic sync from localStorage to Firestore
    useEffect(() => {
        if (!userId) return;

        // Try to sync every 30 seconds if using localStorage
        syncIntervalRef.current = setInterval(async () => {
            if (useLocalStorageRef.current) {
                console.log('[GamificationContext] Attempting periodic sync to Firestore...');
                try {
                    await syncToFirestore(userId);
                    useLocalStorageRef.current = false;
                    console.log('[GamificationContext] ✅ Periodic sync successful, back to Firestore mode');
                } catch (error) {
                    console.log('[GamificationContext] Periodic sync failed, staying in localStorage mode');
                }
            }
        }, 30000); // 30 seconds

        return () => {
            if (syncIntervalRef.current) {
                clearInterval(syncIntervalRef.current);
            }
        };
    }, [userId]);

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
            console.error('[GamificationContext] Cannot award XP: No user logged in');
            return;
        }

        console.log('[GamificationContext] Queueing XP award:', { userId, amount, reason });

        // Add to queue instead of immediate database write
        xpQueueRef.current.push({ amount, reason });

        // Clear existing timer
        if (xpDebounceTimerRef.current) {
            clearTimeout(xpDebounceTimerRef.current);
        }

        // Set new timer to flush queue after debounce delay
        xpDebounceTimerRef.current = setTimeout(() => {
            console.log('[GamificationContext] Debounce timer triggered, flushing queue...');
            flushXPQueue();
            xpDebounceTimerRef.current = null;
        }, XP_DEBOUNCE_DELAY);

        console.log(`[GamificationContext] Queued ${amount} XP for: ${reason} (queue size: ${xpQueueRef.current.length})`);
    }, [userId, flushXPQueue]);

    const completeLesson = useCallback(async (
        courseId: string,
        lessonId: string,
        lessonType: 'video' | 'reading' | 'lab' = 'reading'
    ) => {
        if (!userId) {
            console.error('[GamificationContext] Cannot complete lesson: No user logged in');
            return;
        }

        console.log('[GamificationContext] Completing lesson:', { userId, courseId, lessonId, lessonType });

        try {
            // Try Firestore first
            await completeLessonService(userId, courseId, lessonId, lessonType);
            console.log('[GamificationContext] Lesson completed successfully in Firestore:', lessonId);
            useLocalStorageRef.current = false;
        } catch (error: any) {
            console.error('[GamificationContext] Firestore lesson completion failed, using localStorage:', error);

            // Fallback to localStorage
            useLocalStorageRef.current = true;

            // Calculate XP based on lesson type
            const xpAmount = lessonType === 'video' ? 10 : lessonType === 'lab' ? 30 : 15;
            const localData = completeLocalLesson(userId, courseId, lessonId, xpAmount);

            // Update local state immediately
            dispatch({ type: 'UPDATE_XP', payload: localData.xp });
            dispatch({ type: 'UPDATE_LEVEL', payload: localData.level });

            // Show XP notification
            showXPGain(xpAmount, `Completed ${lessonType} lesson`);

            console.log('[GamificationContext] ✅ Lesson completed in localStorage:', lessonId);
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
            const newAchievements = await checkAchievementsService(userId, { actionType: 'all' });
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

        // Load from localStorage immediately as fallback
        const localData = getLocalXP(userId);
        if (localData.xp > 0) {
            console.log('[GamificationContext] Loading from localStorage while connecting to Firestore...');
            dispatch({
                type: 'SET_PROFILE', payload: {
                    xp: localData.xp,
                    level: localData.level,
                    streakDays: localData.streak,
                    unlockedAchievements: localData.unlockedAchievements
                } as UserProfile
            });
        }

        // Subscribe to user profile document
        const userRef = doc(db, 'users', userId);
        const unsubscribe = onSnapshot(
            userRef,
            async (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const userProfile = docSnapshot.data() as UserProfile;

                    // Migration: Initialize missing gamification fields for existing users
                    if (userProfile.xp === undefined || userProfile.level === undefined) {
                        console.log('[GamificationContext] Migrating existing user profile - initializing gamification fields');
                        try {
                            const { updateDoc } = await import('firebase/firestore');
                            const updates: any = {};

                            if (userProfile.xp === undefined) updates.xp = 0;
                            if (userProfile.level === undefined) updates.level = 1;
                            if (userProfile.unlockedAchievements === undefined) updates.unlockedAchievements = [];
                            if (userProfile.streakDays === undefined) updates.streakDays = 1;

                            await updateDoc(userRef, updates);
                            console.log('[GamificationContext] Migration complete - gamification fields initialized');
                            return; // Let the next snapshot handle the updated data
                        } catch (error) {
                            console.error('[GamificationContext] Migration failed:', error);
                        }
                    }

                    // Update context state with new profile data
                    dispatch({ type: 'SET_PROFILE', payload: userProfile });
                    useLocalStorageRef.current = false; // Successfully connected to Firestore

                    // Check for level up
                    const newLevelInfo = getLevelFromXP(userProfile.xp);
                    if (newLevelInfo.level > state.level && state.level > 0) {
                        // User leveled up!
                        showLevelUpNotification(newLevelInfo);
                    }

                    console.log('Gamification profile updated from Firestore:', {
                        xp: userProfile.xp,
                        level: userProfile.level,
                        streak: userProfile.streakDays,
                        achievements: userProfile.unlockedAchievements?.length || 0
                    });
                } else {
                    console.error('User profile document does not exist');
                    dispatch({ type: 'SET_LOADING', payload: false });
                    useLocalStorageRef.current = true; // Fall back to localStorage
                }
            },
            (error) => {
                console.error('Error listening to user profile, falling back to localStorage:', error);
                useLocalStorageRef.current = true;
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
