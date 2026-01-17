/**
 * Local Storage XP System - Fallback when Firestore is unavailable
 * This ensures XP tracking works even with Firestore connection issues
 */

import { getLevelFromXP } from '../src/data/gamification';

interface LocalXPData {
    xp: number;
    level: number;
    streak: number;
    unlockedAchievements: string[];
    completedLessons: Array<{ courseId: string; lessonId: string; timestamp: number }>;
    lastSync: number;
}

const STORAGE_KEY = 'vibe_dev_xp_data';

/**
 * Get XP data from localStorage
 */
export function getLocalXP(userId: string): LocalXPData {
    try {
        const key = `${STORAGE_KEY}_${userId}`;
        const stored = localStorage.getItem(key);

        if (stored) {
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('[LocalXP] Error reading from localStorage:', error);
    }

    // Default data
    return {
        xp: 0,
        level: 1,
        streak: 1,
        unlockedAchievements: [],
        completedLessons: [],
        lastSync: 0
    };
}

/**
 * Save XP data to localStorage
 */
export function saveLocalXP(userId: string, data: LocalXPData): void {
    try {
        const key = `${STORAGE_KEY}_${userId}`;
        data.lastSync = Date.now();
        localStorage.setItem(key, JSON.stringify(data));
        console.log('[LocalXP] ✅ Saved to localStorage:', { xp: data.xp, level: data.level });
    } catch (error) {
        console.error('[LocalXP] Error saving to localStorage:', error);
    }
}

/**
 * Award XP locally
 */
export function awardLocalXP(userId: string, amount: number, reason: string): LocalXPData {
    const data = getLocalXP(userId);
    data.xp += amount;

    // Check for level up
    const newLevelInfo = getLevelFromXP(data.xp);
    if (newLevelInfo.level > data.level) {
        data.level = newLevelInfo.level;
        console.log(`[LocalXP] 🎉 Level up! Now level ${data.level}`);
    }

    saveLocalXP(userId, data);
    console.log(`[LocalXP] ✅ Awarded ${amount} XP for: ${reason}`);

    return data;
}

/**
 * Mark lesson as completed locally
 */
export function completeLocalLesson(
    userId: string,
    courseId: string,
    lessonId: string,
    xpAmount: number
): LocalXPData {
    const data = getLocalXP(userId);

    // Check if already completed
    const alreadyCompleted = data.completedLessons.some(
        l => l.courseId === courseId && l.lessonId === lessonId
    );

    if (alreadyCompleted) {
        console.log('[LocalXP] Lesson already completed, no XP awarded');
        return data;
    }

    // Add to completed lessons
    data.completedLessons.push({
        courseId,
        lessonId,
        timestamp: Date.now()
    });

    // Award XP
    data.xp += xpAmount;

    // Check for level up
    const newLevelInfo = getLevelFromXP(data.xp);
    if (newLevelInfo.level > data.level) {
        data.level = newLevelInfo.level;
        console.log(`[LocalXP] 🎉 Level up! Now level ${data.level}`);
    }

    saveLocalXP(userId, data);
    console.log(`[LocalXP] ✅ Completed lesson ${lessonId}, awarded ${xpAmount} XP`);

    return data;
}

/**
 * Check if lesson is completed locally
 */
export function isLessonCompleted(userId: string, courseId: string, lessonId: string): boolean {
    const data = getLocalXP(userId);
    return data.completedLessons.some(
        l => l.courseId === courseId && l.lessonId === lessonId
    );
}

/**
 * Sync local data to Firestore when connection is available
 */
export async function syncToFirestore(userId: string): Promise<void> {
    const data = getLocalXP(userId);

    try {
        const { db } = await import('./firebase');
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');

        const userRef = doc(db, 'users', userId);

        await setDoc(userRef, {
            xp: data.xp,
            level: data.level,
            streakDays: data.streak,
            unlockedAchievements: data.unlockedAchievements,
            lastLogin: serverTimestamp()
        }, { merge: true });

        console.log('[LocalXP] ✅ Synced to Firestore successfully');

        // Update last sync time
        data.lastSync = Date.now();
        saveLocalXP(userId, data);
    } catch (error) {
        console.error('[LocalXP] ❌ Failed to sync to Firestore:', error);
        throw error;
    }
}

/**
 * Clear local XP data (use with caution)
 */
export function clearLocalXP(userId: string): void {
    const key = `${STORAGE_KEY}_${userId}`;
    localStorage.removeItem(key);
    console.log('[LocalXP] Cleared local data');
}
