import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { UserProfile, CourseProgress, Lesson } from '../types';
import { awardXP, calculateLessonXP, XP_REWARDS } from './xpService';
import { checkAchievements, AchievementContext } from './achievementService';
import { validateUserId, validateCourseId, validateLessonId } from './validation';

/**
 * Complete a lesson for a user with idempotency protection.
 * 
 * This function:
 * 1. Validates inputs (userId, courseId, lessonId)
 * 2. Checks if lesson is already completed (prevents duplicates)
 * 3. Adds lesson to user's completed lessons for the course
 * 4. Awards lesson XP based on lesson type
 * 5. Checks for lesson-related achievements
 * 
 * Idempotency: Completing the same lesson multiple times will only award XP once.
 * 
 * Side effects:
 * - Updates user's courseProgress array
 * - Awards XP to the user
 * - May unlock achievements
 * - Logs to console
 * 
 * @param userId - User ID completing the lesson (must be non-empty string)
 * @param courseId - Course ID containing the lesson (must be non-empty string)
 * @param lessonId - Lesson ID being completed (must be non-empty string)
 * @param lessonType - Type of lesson for XP calculation (default: 'reading')
 * @throws Error if user not found or database operation fails
 * 
 * @example
 * ```typescript
 * // Complete a video lesson
 * await completeLesson('user123', 'course-1', 'lesson-5', 'video');
 * 
 * // Complete a lab lesson (awards more XP)
 * await completeLesson('user123', 'course-1', 'lesson-10', 'lab');
 * ```
 */
export async function completeLesson(
    userId: string,
    courseId: string,
    lessonId: string,
    lessonType: 'video' | 'reading' | 'lab' = 'reading'
): Promise<void> {
    // Validate inputs using centralized validation
    validateUserId(userId);
    validateCourseId(courseId);
    validateLessonId(lessonId);

    try {
        // Get user profile
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error(`User profile not found: ${userId}`);
        }

        const userProfile = userSnap.data() as UserProfile;
        const courseProgress = userProfile.courseProgress || [];

        // Find existing course progress
        const existingProgressIndex = courseProgress.findIndex(
            cp => cp.courseId === courseId
        );

        let updatedProgress: CourseProgress[];
        let isAlreadyCompleted = false;

        if (existingProgressIndex >= 0) {
            // Course progress exists
            const existingCourseProgress = courseProgress[existingProgressIndex];
            const completedLessons = existingCourseProgress.completedLessons || [];

            // Check if lesson already completed (prevent duplicates)
            if (completedLessons.includes(lessonId)) {
                console.log(`Lesson ${lessonId} already completed for user ${userId}`);
                isAlreadyCompleted = true;
                return; // Exit early - no XP award, no achievement check
            }

            // Add lesson to completed lessons
            const updatedCourseProgress: CourseProgress = {
                ...existingCourseProgress,
                completedLessons: [...completedLessons, lessonId],
                lastPlayed: new Date(),
                courseCompleted: existingCourseProgress.courseCompleted || false
            };

            updatedProgress = [...courseProgress];
            updatedProgress[existingProgressIndex] = updatedCourseProgress;
        } else {
            // Create new course progress entry
            const newCourseProgress: CourseProgress = {
                courseId,
                completedLessons: [lessonId],
                completedModules: [],
                lastPlayed: new Date(),
                courseCompleted: false
            };

            updatedProgress = [...courseProgress, newCourseProgress];
        }

        // Update user's course progress
        await updateDoc(userRef, {
            courseProgress: updatedProgress
        });

        console.log(`Lesson ${lessonId} completed for user ${userId} in course ${courseId}`);

        // Award lesson XP based on lesson type
        const xpAmount = calculateLessonXP(lessonType);
        await awardXP(
            userId,
            xpAmount,
            `Completed lesson: ${lessonId}`,
            { courseId, lessonId }
        );

        // Check for lesson-related achievements
        const achievementContext: AchievementContext = {
            lessonsCompleted: [{ courseId, lessonId }],
            actionType: 'lesson'
        };

        await checkAchievements(userId, achievementContext);

        console.log(`Lesson completion processed successfully for user ${userId}`);
    } catch (error) {
        console.error(`Error completing lesson ${lessonId} for user ${userId} in course ${courseId}:`, error);
        handleGamificationError(error as Error, 'completeLesson');
        throw error;
    }
}

/**
 * Complete a course for a user with idempotency protection.
 * 
 * This function:
 * 1. Validates inputs (userId, courseId)
 * 2. Checks if course is already completed (prevents duplicates)
 * 3. Marks course as completed in user's course progress
 * 4. Awards course completion XP (200 XP)
 * 5. Checks for course completion achievements
 * 
 * Idempotency: Completing the same course multiple times will only award XP once.
 * 
 * Side effects:
 * - Updates user's courseProgress array (sets courseCompleted to true)
 * - Awards 200 XP to the user
 * - May unlock achievements
 * - Logs to console
 * 
 * @param userId - User ID completing the course (must be non-empty string)
 * @param courseId - Course ID being completed (must be non-empty string)
 * @throws Error if user not found, course progress not found, or database operation fails
 * 
 * @example
 * ```typescript
 * // Mark course as completed after user finishes all lessons
 * await completeCourse('user123', 'course-1');
 * ```
 */
export async function completeCourse(
    userId: string,
    courseId: string
): Promise<void> {
    // Validate inputs using centralized validation
    validateUserId(userId);
    validateCourseId(courseId);

    try {
        // Get user profile
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            throw new Error(`User profile not found: ${userId}`);
        }

        const userProfile = userSnap.data() as UserProfile;
        const courseProgress = userProfile.courseProgress || [];

        // Find existing course progress
        const existingProgressIndex = courseProgress.findIndex(
            cp => cp.courseId === courseId
        );

        if (existingProgressIndex < 0) {
            throw new Error(`Course progress not found for course ${courseId}`);
        }

        const existingCourseProgress = courseProgress[existingProgressIndex];

        // Check if course already completed
        if (existingCourseProgress.courseCompleted) {
            console.log(`Course ${courseId} already completed for user ${userId}`);
            return; // Exit early - no XP award, no achievement check
        }

        // Mark course as completed
        const updatedCourseProgress: CourseProgress = {
            ...existingCourseProgress,
            courseCompleted: true,
            lastPlayed: new Date()
        };

        const updatedProgress = [...courseProgress];
        updatedProgress[existingProgressIndex] = updatedCourseProgress;

        // Update user's course progress
        await updateDoc(userRef, {
            courseProgress: updatedProgress
        });

        console.log(`Course ${courseId} marked as completed for user ${userId}`);

        // Award course completion XP
        const xpAmount = XP_REWARDS.course;
        await awardXP(
            userId,
            xpAmount,
            `Completed course: ${courseId}`,
            { courseId }
        );

        // Check for course completion achievements
        const achievementContext: AchievementContext = {
            coursesCompleted: [courseId],
            actionType: 'course'
        };

        await checkAchievements(userId, achievementContext);

        console.log(`Course completion processed successfully for user ${userId}`);
    } catch (error) {
        console.error(`Error completing course ${courseId} for user ${userId}:`, error);
        handleGamificationError(error as Error, 'completeCourse');
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
