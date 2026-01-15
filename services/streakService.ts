import { db } from './firebase';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile } from '../types';
import { awardXP, calculateStreakBonus } from './xpService';

/**
 * Update user's login streak based on time since last login
 * @param userId - User ID to update streak for
 * @returns New streak value
 * @throws Error if user not found or update fails
 */
export async function updateStreak(userId: string): Promise<number> {
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
        newStreak = userProfile.streakDays;
        console.log(`User ${userId} logged in same day. Streak unchanged: ${newStreak}`);
    } else if (hoursSinceLastLogin < 48) {
        // Next day (24-48 hours), increment streak
        newStreak = userProfile.streakDays + 1;
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
        currentStreak: userProfile.streakDays,
        lastLogin,
        streakActive
    };
}
