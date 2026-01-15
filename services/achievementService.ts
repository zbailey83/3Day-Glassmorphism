import { db } from './firebase';
import { doc, getDoc, updateDoc, addDoc, collection, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { UserProfile, AchievementUnlock, CourseProgress } from '../types';
import { ACHIEVEMENTS, Achievement } from '../src/data/gamification';
import { awardXP, calculateAchievementXP } from './xpService';
import { validateUserId, validateAchievementId } from './validation';

/**
 * Get relevant achievements to check based on the action performed.
 * 
 * This optimization reduces the number of achievements to evaluate by filtering
 * based on the action type. For example, when completing a lesson, only
 * lesson-related achievements are checked.
 * 
 * @param actionType - Type of action that triggered the check
 * @param context - Context containing action-specific data
 * @returns Array of achievements that could potentially be unlocked by this action
 * 
 * @example
 * ```typescript
 * // Only returns lesson completion achievements
 * const lessonAchievements = getRelevantAchievements('lesson', context);
 * 
 * // Returns all achievements
 * const allAchievements = getRelevantAchievements('all', context);
 * ```
 */
function getRelevantAchievements(
    actionType: 'lesson' | 'course' | 'streak' | 'xp' | 'project' | 'like' | 'all',
    context: AchievementContext
): Achievement[] {
    // If checking all achievements, return all
    if (actionType === 'all') {
        return ACHIEVEMENTS;
    }

    // Filter achievements based on action type
    return ACHIEVEMENTS.filter(achievement => {
        switch (actionType) {
            case 'lesson':
                // Only check lesson completion achievements
                return achievement.requirement.type === 'lesson_complete';

            case 'course':
                // Check course completion and potentially XP achievements
                return achievement.requirement.type === 'course_complete' ||
                    achievement.requirement.type === 'xp_total';

            case 'streak':
                // Only check streak achievements
                return achievement.requirement.type === 'streak';

            case 'xp':
                // Only check XP total achievements
                return achievement.requirement.type === 'xp_total';

            case 'project':
                // Check project upload achievements
                return achievement.requirement.type === 'projects';

            case 'like':
                // Check like-related achievements
                return achievement.requirement.type === 'likes';

            default:
                return false;
        }
    });
}

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
    actionType?: 'lesson' | 'course' | 'streak' | 'xp' | 'project' | 'like' | 'all';
}

/**
 * Evaluate if a user meets a specific achievement requirement.
 * 
 * Supports multiple requirement types:
 * - lesson_complete: Check if user completed N lessons (optionally in specific course)
 * - course_complete: Check if user completed N courses (or specific course)
 * - streak: Check if user has N consecutive login days
 * - xp_total: Check if user has earned N total XP
 * - projects: Check if user uploaded N projects
 * - likes: Check if user received N likes
 * 
 * @param requirement - Achievement requirement to evaluate
 * @param context - Context containing user activity data from current action
 * @param userProfile - User's profile data from Firestore
 * @returns true if requirement is met, false otherwise
 * 
 * @example
 * ```typescript
 * const requirement = { type: 'lesson_complete', value: 5, courseId: 'course-1' };
 * const context = { lessonsCompleted: [{ courseId: 'course-1', lessonId: 'lesson-1' }] };
 * const meets = evaluateRequirement(requirement, context, userProfile);
 * ```
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
 * Check all relevant achievements for a user and unlock any that meet requirements.
 * 
 * This function:
 * 1. Retrieves the user's profile from Firestore
 * 2. Filters achievements based on action type (optimization)
 * 3. Evaluates each relevant achievement's requirements
 * 4. Unlocks achievements that meet requirements
 * 5. Returns array of newly unlocked achievements
 * 
 * The function is designed to be non-blocking - errors in checking individual
 * achievements won't prevent other achievements from being checked.
 * 
 * Side effects:
 * - May unlock achievements (updates user profile)
 * - May award XP for unlocked achievements
 * - Logs to console
 * 
 * @param userId - User ID to check achievements for (must be non-empty string)
 * @param context - Context containing user activity data and action type
 * @returns Array of newly unlocked achievements (empty array on error)
 * 
 * @example
 * ```typescript
 * // Check lesson-related achievements after completing a lesson
 * const unlocked = await checkAchievements('user123', {
 *   lessonsCompleted: [{ courseId: 'course-1', lessonId: 'lesson-5' }],
 *   actionType: 'lesson'
 * });
 * 
 * // Check all achievements
 * const allUnlocked = await checkAchievements('user123', {
 *   actionType: 'all'
 * });
 * ```
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

        // Determine which achievements to check based on action type
        const actionType = context.actionType || 'all';
        const relevantAchievements = getRelevantAchievements(actionType, context);

        console.log(`Checking ${relevantAchievements.length} relevant achievements (action: ${actionType})`);

        // Check each relevant achievement
        for (const achievement of relevantAchievements) {
            // Skip if already unlocked (early exit optimization)
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
 * Unlock an achievement for a user with idempotency protection.
 * 
 * This function:
 * 1. Validates inputs (userId and achievementId)
 * 2. Checks if achievement is already unlocked (prevents duplicates)
 * 3. Adds achievement to user's unlocked achievements array
 * 4. Awards achievement XP
 * 5. Logs unlock to achievementUnlocks collection
 * 
 * Idempotency: Calling this function multiple times with the same achievement
 * will only unlock it once and award XP once.
 * 
 * Side effects:
 * - Updates user's unlockedAchievements array
 * - Awards XP to the user
 * - Creates an achievement unlock record
 * - Logs to console
 * 
 * @param userId - User ID to unlock achievement for (must be non-empty string)
 * @param achievementId - Achievement ID to unlock (must exist in ACHIEVEMENTS)
 * @throws Error if achievement doesn't exist, user not found, or database operation fails
 * 
 * @example
 * ```typescript
 * // Unlock the "First Steps" achievement
 * await unlockAchievement('user123', 'first-lesson');
 * 
 * // Calling again won't award XP twice
 * await unlockAchievement('user123', 'first-lesson'); // Logs "already unlocked"
 * ```
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
 * Get all unlocked achievement IDs for a user.
 * 
 * @param userId - User ID to get unlocked achievements for (must be non-empty string)
 * @returns Array of unlocked achievement IDs (empty array on error or if user not found)
 * 
 * @example
 * ```typescript
 * const unlockedIds = await getUnlockedAchievements('user123');
 * // Returns: ['first-lesson', 'streak-3', 'xp-100']
 * ```
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
 * Check if a specific achievement is unlocked for a user.
 * 
 * @param userId - User ID to check (must be non-empty string)
 * @param achievementId - Achievement ID to check (must exist in ACHIEVEMENTS)
 * @returns true if achievement is unlocked, false otherwise (or on error)
 * 
 * @example
 * ```typescript
 * const isUnlocked = await isAchievementUnlocked('user123', 'first-lesson');
 * if (isUnlocked) {
 *   console.log('User has completed their first lesson!');
 * }
 * ```
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
