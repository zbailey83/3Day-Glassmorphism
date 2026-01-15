import { db } from './firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { UserProfile, CourseProgress, Lesson } from '../types';
import { awardXP, calculateLessonXP, XP_REWARDS } from './xpService';
import { checkAchievements, AchievementContext } from './achievementService';

/**
 * Complete a lesson for a user
 * @param userId - User ID completing the lesson
 * @param courseId - Course ID containing the lesson
 * @param lessonId - Lesson ID being completed
 * @param lessonType - Type of lesson (video, reading, or lab) for XP calculation
 * @throws Error if user not found or database operation fails
 */
export async function completeLesson(
    userId: string,
    courseId: string,
    lessonId: string,
    lessonType: 'video' | 'reading' | 'lab' = 'reading'
): Promise<void> {
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
            lessonsCompleted: [{ courseId, lessonId }]
        };

        await checkAchievements(userId, achievementContext);

        console.log(`Lesson completion processed successfully for user ${userId}`);
    } catch (error) {
        console.error(`Error completing lesson ${lessonId} for user ${userId}:`, error);
        throw error;
    }
}

/**
 * Complete a course for a user
 * @param userId - User ID completing the course
 * @param courseId - Course ID being completed
 * @throws Error if user not found or database operation fails
 */
export async function completeCourse(
    userId: string,
    courseId: string
): Promise<void> {
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
            coursesCompleted: [courseId]
        };

        await checkAchievements(userId, achievementContext);

        console.log(`Course completion processed successfully for user ${userId}`);
    } catch (error) {
        console.error(`Error completing course ${courseId} for user ${userId}:`, error);
        throw error;
    }
}
