import { db } from './firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';
import { awardXP, calculateStreakBonus } from './xpService';
import { validateUserId } from './validation';

/**
 * Update user's login streak based on time since last login
 * @param userId - User ID to update streak for
 * @returns New streak value
 * @throws Error if user not found or update fails
 */
export async function updateStreak(userId: string): Promise<number> {
    // Validate userId using centralized validation
    validateUserId(userId);

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error(`User ${userId} not found`);
        }

        const userProfile = userSnap.data() as UserProfile;
        const now = new Date();

        // Handle case where lastLogin might be undefined (new users)
        const lastLogin = userProfile.lastLogin?.toDate ? userProfile.lastLogin.toDate() : new Date(0);

        // Calculate hours since last login
        const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

        let newStreak: number;

        if (hoursSinceLastLogin < 24) {
            // Same day, no change to streak
            newStreak = userProfile.streakDays || 0;
            console.log(`User ${userId} logged in same day. Streak unchanged: ${newStreak}`);
        } else if (hoursSinceLastLogin < 48) {
            // Next day (24-48 hours), increment streak
            newStreak = (userProfile.streakDays || 0) + 1;
            console.log(`User ${userId} logged in on consecutive day. Streak incremented to: ${newStreak}`);

            // Award streak bonus XP
            const bonusXP = calculateStreakBonus(newStreak);
            await awardXP(userId, bonusXP, `Streak bonus (${newStreak} days)`);
        } else {
            // Missed a day (>48 hours), reset to 1
            newStreak = 1;
            console.log(`User ${userId} missed a day. Streak reset to: ${newStreak}`);
        }

        // Update database with new streak and lastLogin timestamp
        await updateDoc(userRef, {
            streakDays: newStreak,
            lastLogin: serverTimestamp()
        });

        return newStreak;
    } catch (error) {
        console.error(`Error updating streak for user ${userId}:`, error);
        handleGamificationError(error as Error, 'updateStreak');
        throw error;
    }
}

/**
 * Get streak information for a user
 * @param userId - User ID to get streak info for
 * @returns Streak information including current streak and last login
 */
export async function getStreakInfo(userId: string): Promise<{
    currentStreak: number;
    lastLogin: Date;
    streakActive: boolean;
}> {
    // Validate userId using centralized validation
    validateUserId(userId);

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error(`User ${userId} not found`);
        }

        const userProfile = userSnap.data() as UserProfile;
        const lastLogin = userProfile.lastLogin?.toDate ? userProfile.lastLogin.toDate() : new Date(0);
        const now = new Date();
        const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

        // Streak is active if user logged in within the last 48 hours
        const streakActive = hoursSinceLastLogin < 48;

        return {
            currentStreak: userProfile.streakDays || 0,
            lastLogin,
            streakActive
        };
    } catch (error) {
        console.error(`Error getting streak info for user ${userId}:`, error);
        handleGamificationError(error as Error, 'getStreakInfo');
        throw error;
    }
}

/**
 * Handle gamification errors with logging and user-friendly messages
 * @param error - Error object
 * @param context - Context where the error occurred
 */
function handleGamificationError(error: Error, context: string): void {
    console.error(`Gamification error in ${context}:`, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });

    // In a production environment, you would log to an error tracking service
    // Example: Sentry.captureException(error, { tags: { context } });
}
