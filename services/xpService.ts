import { db } from './firebase';
import { doc, updateDoc, increment, addDoc, collection, getDoc, serverTimestamp } from 'firebase/firestore';
import { XPTransaction, UserProfile } from '../types';
import { getLevelFromXP, Achievement } from '../src/data/gamification';
import { validateUserId, validateXPAmount, validateReason } from './validation';

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
 * Calculate XP reward for completing a lesson based on lesson type.
 * 
 * Different lesson types award different amounts of XP:
 * - Video lessons: 25 XP
 * - Reading lessons: 20 XP
 * - Lab lessons: 50 XP
 * 
 * @param lessonType - Type of lesson (video, reading, or lab)
 * @returns XP amount for the lesson type
 * 
 * @example
 * ```typescript
 * const videoXP = calculateLessonXP('video'); // Returns 25
 * const labXP = calculateLessonXP('lab'); // Returns 50
 * ```
 */
export function calculateLessonXP(lessonType: 'video' | 'reading' | 'lab'): number {
    return XP_REWARDS.lesson[lessonType];
}

/**
 * Calculate XP reward for unlocking an achievement.
 * 
 * Achievement XP varies by tier:
 * - Bronze: 50 XP
 * - Silver: 100 XP
 * - Gold: 300 XP
 * - Platinum: 500 XP
 * - Diamond: 1000 XP
 * 
 * @param achievement - Achievement object containing tier and xpReward
 * @returns XP amount for the achievement
 * 
 * @example
 * ```typescript
 * const achievement = ACHIEVEMENTS.find(a => a.id === 'first-lesson');
 * const xp = calculateAchievementXP(achievement); // Returns achievement.xpReward
 * ```
 */
export function calculateAchievementXP(achievement: Achievement): number {
    return achievement.xpReward;
}

/**
 * Calculate streak bonus XP based on consecutive login days.
 * 
 * Awards 5 XP per day of streak, capped at 50 XP (10+ day streak).
 * 
 * @param streakDays - Number of consecutive days the user has logged in
 * @returns Bonus XP amount (capped at 50 XP maximum)
 * 
 * @example
 * ```typescript
 * const bonus3Days = calculateStreakBonus(3); // Returns 15 XP
 * const bonus10Days = calculateStreakBonus(10); // Returns 50 XP
 * const bonus20Days = calculateStreakBonus(20); // Returns 50 XP (capped)
 * ```
 */
export function calculateStreakBonus(streakDays: number): number {
    const bonus = streakDays * XP_REWARDS.streak.base;
    return Math.min(bonus, XP_REWARDS.streak.max);
}

/**
 * Retry an async operation with exponential backoff strategy.
 * 
 * Implements exponential backoff: each retry waits longer than the previous one.
 * Delay increases as: delayMs * attemptNumber (e.g., 1s, 2s, 3s).
 * 
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param delayMs - Initial delay in milliseconds (default: 1000)
 * @returns Result of the operation if successful
 * @throws Error if all retries fail, with details of the last error
 * 
 * @example
 * ```typescript
 * const result = await retryOperation(
 *   async () => await updateDoc(docRef, data),
 *   3,
 *   1000
 * );
 * ```
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
 * Award XP to a user with validation, retry logic, and automatic level-up detection.
 * 
 * This function:
 * 1. Validates all inputs (userId, amount, reason)
 * 2. Updates the user's XP in Firestore with retry logic
 * 3. Logs the transaction to xpTransactions collection
 * 4. Checks if the user leveled up and updates their level
 * 
 * Side effects:
 * - Updates user's XP field in Firestore
 * - Creates an XP transaction record
 * - May update user's level field if level-up occurs
 * - Logs to console
 * 
 * @param userId - User ID to award XP to (must be non-empty string)
 * @param amount - Amount of XP to award (must be positive integer)
 * @param reason - Reason for the XP award (must be non-empty string)
 * @param metadata - Optional metadata for tracking (courseId, lessonId, achievementId, projectId)
 * @throws Error if validation fails or all database retries fail
 * 
 * @example
 * ```typescript
 * // Award XP for lesson completion
 * await awardXP('user123', 25, 'Completed video lesson', {
 *   courseId: 'course-1',
 *   lessonId: 'lesson-5'
 * });
 * 
 * // Award XP for achievement
 * await awardXP('user123', 100, 'Achievement unlocked: First Steps', {
 *   achievementId: 'first-lesson'
 * });
 * ```
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
    // Validate inputs using centralized validation
    validateUserId(userId);
    validateXPAmount(amount);
    validateReason(reason);

    try {
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
        } else {
            console.warn(`User profile not found after XP award: ${userId}`);
        }
    } catch (error) {
        console.error(`Failed to award XP (userId: ${userId}, amount: ${amount}, reason: ${reason}):`, error);
        handleGamificationError(error as Error, 'awardXP');
        throw error;
    }
}

/**
 * Award XP for uploading a project to the gallery and check social achievements.
 * 
 * Awards 30 XP for project uploads and triggers achievement checks for:
 * - Project upload count achievements
 * - XP total achievements
 * 
 * This function is designed to be non-blocking - errors won't break the upload flow.
 * 
 * Side effects:
 * - Awards XP to the user
 * - Checks and potentially unlocks social achievements
 * - Logs to console
 * 
 * @param userId - User ID who uploaded the project (must be non-empty string)
 * @param projectId - Project ID that was uploaded (must be non-empty string)
 * 
 * @example
 * ```typescript
 * // Called after successful project upload
 * await uploadProject('user123', 'project-abc-123');
 * ```
 */
export async function uploadProject(userId: string, projectId: string): Promise<void> {
    // Validate inputs
    validateUserId(userId);

    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
        console.error('Invalid project ID in uploadProject:', projectId);
        return; // Don't throw - social XP shouldn't break the upload flow
    }

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
                totalXP: userProfile.xp,
                actionType: 'project'
            });
        }
    } catch (error) {
        console.error(`Error awarding XP for project upload (userId: ${userId}, projectId: ${projectId}):`, error);
        handleGamificationError(error as Error, 'uploadProject');
        // Don't throw - social XP shouldn't break the upload flow
    }
}

/**
 * Award XP when a user's project receives a like from another user.
 * 
 * Awards 5 XP for each like received and triggers XP-based achievement checks.
 * This function is designed to be non-blocking - errors won't break the like flow.
 * 
 * Side effects:
 * - Awards XP to the project owner
 * - Checks and potentially unlocks XP-based achievements
 * - Logs to console
 * 
 * @param userId - User ID who owns the project (must be non-empty string)
 * @param projectId - Project ID that received the like (must be non-empty string)
 * 
 * @example
 * ```typescript
 * // Called when user 'user456' likes a project owned by 'user123'
 * await receiveProjectLike('user123', 'project-abc-123');
 * ```
 */
export async function receiveProjectLike(userId: string, projectId: string): Promise<void> {
    // Validate inputs
    validateUserId(userId);

    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
        console.error('Invalid project ID in receiveProjectLike:', projectId);
        return; // Don't throw - social XP shouldn't break the like flow
    }

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
                totalXP: userProfile.xp,
                actionType: 'xp'
            });
        }
    } catch (error) {
        console.error(`Error awarding XP for project like (userId: ${userId}, projectId: ${projectId}):`, error);
        handleGamificationError(error as Error, 'receiveProjectLike');
        // Don't throw - social XP shouldn't break the like flow
    }
}

/**
 * Handle gamification errors with comprehensive logging and user-friendly notifications.
 * 
 * This centralized error handler:
 * 1. Logs detailed error information to console
 * 2. Would send errors to tracking service in production (e.g., Sentry)
 * 3. Attempts to show user-friendly notification
 * 
 * @param error - Error object containing message and stack trace
 * @param context - Context string describing where the error occurred (e.g., 'awardXP', 'uploadProject')
 * 
 * @example
 * ```typescript
 * try {
 *   await awardXP(userId, amount, reason);
 * } catch (error) {
 *   handleGamificationError(error as Error, 'awardXP');
 * }
 * ```
 */
function handleGamificationError(error: Error, context: string): void {
    console.error(`Gamification error in ${context}:`, {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });

    // In a production environment, you would log to an error tracking service
    // Example: Sentry.captureException(error, { tags: { context } });

    // Show user-friendly notification (if notification service is available)
    try {
        const { showNotification } = require('./notificationService');
        if (showNotification) {
            showNotification({
                type: 'error',
                message: 'Something went wrong with your progress. Please try again.',
                duration: 5000
            });
        }
    } catch (notificationError) {
        // Silently fail if notification service is not available
        console.warn('Could not show error notification:', notificationError);
    }
}
