import { db } from './firebase';
import { doc, getDoc, updateDoc, addDoc, collection, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { UserProfile, AchievementUnlock, CourseProgress } from '../types';
import { ACHIEVEMENTS, Achievement } from '../src/data/gamification';
import { awardXP, calculateAchievementXP } from './xpService';
import { validateUserId, validateAchievementId } from './validation';

/**
 * Context object containing user activity data for achievement evaluation
 */
export interface AchievementContext {
    lessonsCompleted?: { courseId: string; lessonId: string }[];
    coursesCompleted?: string[];
    streak?: number;
    totalXP?: number;
    projectsUploaded?: number;
    likesReceived?: number;
}

/**
 * Evaluate if a user meets an achievement requirement
 * @param requirement - Achievement requirement to evaluate
 * @param context - Context containing user activity data
 * @param userProfile - User's profile data
 * @returns true if requirement is met, false otherwise
 */
export function evaluateRequirement(
    requirement: Achievement['requirement'],
    context: AchievementContext,
    userProfile: UserProfile
): boolean {
    switch (requirement.type) {
        case 'lesson_complete': {
            // Count lessons completed in the specified course (if courseId provided)
            if (requirement.courseId) {
                const lessonsInCourse = context.lessonsCompleted?.filter(
                    l => l.courseId === requirement.courseId
                ).length || 0;

                // Also check user's course progress for completed lessons
                const courseProgress = userProfile.courseProgress?.find(
                    cp => cp.courseId === requirement.courseId
                );
                const completedInProfile = courseProgress?.completedLessons?.length || 0;

                // Use the maximum of context and profile data
                const totalCompleted = Math.max(lessonsInCourse, completedInProfile);
                return totalCompleted >= requirement.value;
            } else {
                // Count all lessons completed across all courses
                const totalLessons = context.lessonsCompleted?.length || 0;
                const totalInProfile = userProfile.courseProgress?.reduce(
                    (sum, cp) => sum + (cp.completedLessons?.length || 0),
                    0
                ) || 0;

                const totalCompleted = Math.max(totalLessons, totalInProfile);
                return totalCompleted >= requirement.value;
            }
        }

        case 'course_complete': {
            // Count completed courses
            if (requirement.courseId) {
                // Check if specific course is completed
                const courseCompleted = context.coursesCompleted?.includes(requirement.courseId) ||
                    userProfile.courseProgress?.some(
                        cp => cp.courseId === requirement.courseId && cp.courseCompleted
                    ) || false;
                return courseCompleted;
            } else {
                // Count total completed courses
                const completedCount = context.coursesCompleted?.length ||
                    userProfile.courseProgress?.filter(cp => cp.courseCompleted).length || 0;
                return completedCount >= requirement.value;
            }
        }

        case 'streak': {
            // Check streak days
            const currentStreak = context.streak ?? userProfile.streakDays ?? 0;
            return currentStreak >= requirement.value;
        }

        case 'xp_total': {
            // Check total XP
            const totalXP = context.totalXP ?? userProfile.xp ?? 0;
            return totalXP >= requirement.value;
        }

        case 'projects': {
            // Check number of projects uploaded
            const projectCount = context.projectsUploaded ?? userProfile.savedProjects?.length ?? 0;
            return projectCount >= requirement.value;
        }

        case 'likes': {
            // Check number of likes received
            // Note: This would need to be tracked separately in a real implementation
            // For now, we'll use the context value if provided
            const likesCount = context.likesReceived ?? 0;
            return likesCount >= requirement.value;
        }

        default:
            console.warn(`Unknown requirement type: ${(requirement as any).type}`);
            return false;
    }
}

/**
 * Check all achievements for a user and unlock any that meet requirements
 * @param userId - User ID to check achievements for
 * @param context - Context containing user activity data
 * @returns Array of newly unlocked achievements
 */
export async function checkAchievements(
    userId: string,
    context: AchievementContext
): Promise<Achievement[]> {
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        console.error('Invalid user ID in checkAchievements:', userId);
        return [];
    }

    try {
        // Get user profile
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.error(`User profile not found in checkAchievements: ${userId}`);
            return [];
        }

        const userProfile = userSnap.data() as UserProfile;
        const unlockedIds = userProfile.unlockedAchievements || [];
        const newlyUnlocked: Achievement[] = [];

        // Check each achievement
        for (const achievement of ACHIEVEMENTS) {
            // Skip if already unlocked
            if (unlockedIds.includes(achievement.id)) {
                continue;
            }

            try {
                // Evaluate requirement
                const meetsRequirement = evaluateRequirement(
                    achievement.requirement,
                    context,
                    userProfile
                );

                if (meetsRequirement) {
                    // Unlock the achievement
                    await unlockAchievement(userId, achievement.id);
                    newlyUnlocked.push(achievement);

                    console.log(`Achievement unlocked: ${achievement.title} for user ${userId}`);
                }
            } catch (achievementError) {
                // Log error but continue checking other achievements
                console.error(`Error checking achievement ${achievement.id} for user ${userId}:`, achievementError);
            }
        }

        return newlyUnlocked;
    } catch (error) {
        console.error(`Error checking achievements for user ${userId}:`, error);
        handleGamificationError(error as Error, 'checkAchievements');
        // Don't throw - achievement checking shouldn't break the app
        return [];
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

/**
 * Unlock an achievement for a user
 * @param userId - User ID to unlock achievement for
 * @param achievementId - Achievement ID to unlock
 * @throws Error if achievement doesn't exist or database operation fails
 */
export async function unlockAchievement(
    userId: string,
    achievementId: string
): Promise<void> {
    // Validate inputs using centralized validation
    validateUserId(userId);
    validateAchievementId(achievementId);

    try {
        // Find the achievement (already validated by validateAchievementId)
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)!;

        // Get user profile to check if already unlocked
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error(`User profile not found: ${userId}`);
        }

        const userProfile = userSnap.data() as UserProfile;
        const unlockedAchievements = userProfile.unlockedAchievements || [];

        // Check if already unlocked (prevent duplicates)
        if (unlockedAchievements.includes(achievementId)) {
            console.log(`Achievement ${achievementId} already unlocked for user ${userId}`);
            return;
        }

        // Add achievement to user's unlocked achievements
        await updateDoc(userRef, {
            unlockedAchievements: arrayUnion(achievementId)
        });

        // Award achievement XP
        const xpAmount = calculateAchievementXP(achievement);
        await awardXP(
            userId,
            xpAmount,
            `Achievement unlocked: ${achievement.title}`,
            { achievementId }
        );

        // Log unlock to achievementUnlocks collection
        const unlockRecord: Omit<AchievementUnlock, 'unlockedAt'> & { unlockedAt: any } = {
            userId,
            achievementId,
            unlockedAt: serverTimestamp(),
            xpAwarded: xpAmount
        };

        await addDoc(collection(db, 'achievementUnlocks'), unlockRecord);

        console.log(`Achievement ${achievement.title} unlocked for user ${userId}, awarded ${xpAmount} XP`);
    } catch (error) {
        console.error(`Error unlocking achievement ${achievementId} for user ${userId}:`, error);
        handleGamificationError(error as Error, 'unlockAchievement');
        throw error;
    }
}

/**
 * Get all unlocked achievement IDs for a user
 * @param userId - User ID to get unlocked achievements for
 * @returns Array of unlocked achievement IDs
 */
export async function getUnlockedAchievements(userId: string): Promise<string[]> {
    // Validate userId using centralized validation
    try {
        validateUserId(userId);
    } catch (error) {
        console.error('Invalid user ID in getUnlockedAchievements:', userId, error);
        return [];
    }

    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            console.warn(`User profile not found in getUnlockedAchievements: ${userId}`);
            return [];
        }

        const userProfile = userSnap.data() as UserProfile;
        return userProfile.unlockedAchievements || [];
    } catch (error) {
        console.error(`Error getting unlocked achievements for user ${userId}:`, error);
        handleGamificationError(error as Error, 'getUnlockedAchievements');
        return [];
    }
}

/**
 * Check if a specific achievement is unlocked for a user
 * @param userId - User ID to check
 * @param achievementId - Achievement ID to check
 * @returns true if achievement is unlocked, false otherwise
 */
export async function isAchievementUnlocked(
    userId: string,
    achievementId: string
): Promise<boolean> {
    // Validate inputs using centralized validation
    try {
        validateUserId(userId);
        validateAchievementId(achievementId);
    } catch (error) {
        console.error('Invalid parameters in isAchievementUnlocked:', { userId, achievementId }, error);
        return false;
    }

    try {
        const unlockedIds = await getUnlockedAchievements(userId);
        return unlockedIds.includes(achievementId);
    } catch (error) {
        console.error(`Error checking if achievement ${achievementId} is unlocked for user ${userId}:`, error);
        handleGamificationError(error as Error, 'isAchievementUnlocked');
        return false;
    }
}
