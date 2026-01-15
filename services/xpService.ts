import { db } from './firebase';
import { doc, updateDoc, increment, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';
import { XPTransaction, UserProfile } from '../types';
import { getLevelFromXP, Achievement } from '../src/data/gamification';

// XP reward constants
export const XP_REWARDS = {
    lesson: {
        video: 25,
        reading: 20,
        lab: 50
    },
    course: 200,
    achievement: {
        bronze: 50,
        silver: 100,
        gold: 300,
        platinum: 500,
        diamond: 1000
    },
    social: {
        projectUpload: 30,
        likeReceived: 5
    },
    streak: {
        base: 5,
        max: 50
    }
} as const;

/**
 * Calculate XP reward for completing a lesson
 * @param lessonType - Type of lesson (video, reading, or lab)
 * @returns XP amount for the lesson type
 */
export function calculateLessonXP(lessonType: 'video' | 'reading' | 'lab'): number {
    return XP_REWARDS.lesson[lessonType];
}

/**
 * Calculate XP reward for unlocking an achievement
 * @param achievement - Achievement object
 * @returns XP amount for the achievement
 */
export function calculateAchievementXP(achievement: Achievement): number {
    return achievement.xpReward;
}

/**
 * Calculate streak bonus XP based on consecutive days
 * @param streakDays - Number of consecutive days
 * @returns Bonus XP amount (capped at max)
 */
export function calculateStreakBonus(streakDays: number): number {
    const bonus = streakDays * XP_REWARDS.streak.base;
    return Math.min(bonus, XP_REWARDS.streak.max);
}

/**
 * Retry an async operation with exponential backoff
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param delayMs - Initial delay in milliseconds (default: 1000)
 * @returns Result of the operation
 * @throws Error if all retries fail
 */
async function retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;
            console.error(`Attempt ${attempt} failed:`, error);

            if (attempt < maxRetries) {
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
            }
        }
    }

    throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError!.message}`);
}

/**
 * Award XP to a user with validation and retry logic
 * @param userId - User ID to award XP to
 * @param amount - Amount of XP to award
 * @param reason - Reason for the XP award
 * @param metadata - Optional metadata (courseId, lessonId, achievementId)
 * @throws Error if validation fails or all retries fail
 */
export async function awardXP(
    userId: string,
    amount: number,
    reason: string,
    metadata?: {
        courseId?: string;
        lessonId?: string;
        achievementId?: string;
        projectId?: string;
    }
): Promise<void> {
    // Validate amount
    if (amount <= 0 || !Number.isInteger(amount)) {
        console.error('Invalid XP amount:', amount);
        throw new Error(`Invalid XP amount: ${amount}. Must be a positive integer.`);
    }

    // Create transaction record
    const transaction: Omit<XPTransaction, 'timestamp'> & { timestamp: any } = {
        userId,
        amount,
        reason,
        timestamp: serverTimestamp(),
        metadata
    };

    // Update user XP with retry logic
    await retryOperation(async () => {
        const userRef = doc(db, 'users', userId);

        // Update XP
        await updateDoc(userRef, {
            xp: increment(amount)
        });

        // Log transaction
        await addDoc(collection(db, 'xpTransactions'), transaction);

        console.log(`Awarded ${amount} XP to user ${userId} for: ${reason}`);
    }, 3);

    // Check for level up
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userProfile = userSnap.data() as UserProfile;
        const newLevel = getLevelFromXP(userProfile.xp);

        if (newLevel.level > userProfile.level) {
            await updateDoc(userRef, {
                level: newLevel.level
            });
            console.log(`User ${userId} leveled up to level ${newLevel.level}: ${newLevel.title}`);
        }
    }
}

/**
 * Award XP for uploading a project to the gallery
 * @param userId - User ID who uploaded the project
 * @param projectId - Project ID that was uploaded
 */
export async function uploadProject(userId: string, projectId: string): Promise<void> {
    try {
        // Award XP for project upload
        await awardXP(
            userId,
            XP_REWARDS.social.projectUpload,
            'Project uploaded to gallery',
            { projectId }
        );

        console.log(`Awarded ${XP_REWARDS.social.projectUpload} XP to user ${userId} for uploading project ${projectId}`);

        // Check for social achievements
        const { checkAchievements } = await import('./achievementService');

        // Get user's total project count
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userProfile = userSnap.data() as UserProfile;
            const projectsUploaded = userProfile.savedProjects?.length || 0;

            await checkAchievements(userId, {
                projectsUploaded,
                totalXP: userProfile.xp
            });
        }
    } catch (error) {
        console.error(`Error awarding XP for project upload:`, error);
        // Don't throw - social XP shouldn't break the upload flow
    }
}

/**
 * Award XP when a user's project receives a like
 * @param userId - User ID who owns the project
 * @param projectId - Project ID that received the like
 */
export async function receiveProjectLike(userId: string, projectId: string): Promise<void> {
    try {
        // Award XP for receiving a like
        await awardXP(
            userId,
            XP_REWARDS.social.likeReceived,
            'Project received a like',
            { projectId }
        );

        console.log(`Awarded ${XP_REWARDS.social.likeReceived} XP to user ${userId} for like on project ${projectId}`);

        // Check for social achievements
        const { checkAchievements } = await import('./achievementService');

        // Get user's profile to check total XP
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userProfile = userSnap.data() as UserProfile;

            // Note: We would need to track total likes received separately
            // For now, we'll just check XP-based achievements
            await checkAchievements(userId, {
                totalXP: userProfile.xp
            });
        }
    } catch (error) {
        console.error(`Error awarding XP for project like:`, error);
        // Don't throw - social XP shouldn't break the like flow
    }
}
