/**
 * Validation utilities for gamification system
 * Provides centralized validation for all input parameters
 */

import { ACHIEVEMENTS } from '../src/data/gamification';

/**
 * Validate that a user ID is valid
 * @param userId - User ID to validate
 * @throws Error if user ID is invalid
 */
export function validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        throw new Error('Invalid user ID: must be a non-empty string');
    }
}

/**
 * Validate that an XP amount is valid
 * @param amount - XP amount to validate
 * @throws Error if XP amount is invalid
 */
export function validateXPAmount(amount: number): void {
    if (typeof amount !== 'number') {
        throw new Error(`Invalid XP amount: must be a number, got ${typeof amount}`);
    }

    if (!Number.isInteger(amount)) {
        throw new Error(`Invalid XP amount: ${amount}. Must be an integer.`);
    }

    if (amount <= 0) {
        throw new Error(`Invalid XP amount: ${amount}. Must be a positive integer.`);
    }

    // Additional safety check for unreasonably large values
    if (amount > 1000000) {
        throw new Error(`Invalid XP amount: ${amount}. Amount exceeds maximum allowed value.`);
    }
}

/**
 * Validate that an achievement ID exists in the ACHIEVEMENTS array
 * @param achievementId - Achievement ID to validate
 * @throws Error if achievement ID is invalid or doesn't exist
 */
export function validateAchievementId(achievementId: string): void {
    if (!achievementId || typeof achievementId !== 'string' || achievementId.trim() === '') {
        throw new Error('Invalid achievement ID: must be a non-empty string');
    }

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) {
        throw new Error(`Achievement not found: ${achievementId}`);
    }
}

/**
 * Validate that a course ID is valid
 * @param courseId - Course ID to validate
 * @throws Error if course ID is invalid
 */
export function validateCourseId(courseId: string): void {
    if (!courseId || typeof courseId !== 'string' || courseId.trim() === '') {
        throw new Error('Invalid course ID: must be a non-empty string');
    }
}

/**
 * Validate that a lesson ID is valid
 * @param lessonId - Lesson ID to validate
 * @throws Error if lesson ID is invalid
 */
export function validateLessonId(lessonId: string): void {
    if (!lessonId || typeof lessonId !== 'string' || lessonId.trim() === '') {
        throw new Error('Invalid lesson ID: must be a non-empty string');
    }
}

/**
 * Validate that a challenge ID is valid
 * @param challengeId - Challenge ID to validate
 * @throws Error if challenge ID is invalid
 */
export function validateChallengeId(challengeId: string): void {
    if (!challengeId || typeof challengeId !== 'string' || challengeId.trim() === '') {
        throw new Error('Invalid challenge ID: must be a non-empty string');
    }
}

/**
 * Validate that a project ID is valid
 * @param projectId - Project ID to validate
 * @throws Error if project ID is invalid
 */
export function validateProjectId(projectId: string): void {
    if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') {
        throw new Error('Invalid project ID: must be a non-empty string');
    }
}

/**
 * Validate that a reason string is valid
 * @param reason - Reason string to validate
 * @throws Error if reason is invalid
 */
export function validateReason(reason: string): void {
    if (!reason || typeof reason !== 'string' || reason.trim() === '') {
        throw new Error('Invalid reason: must be a non-empty string');
    }

    // Optional: Check for maximum length
    if (reason.length > 500) {
        throw new Error('Invalid reason: exceeds maximum length of 500 characters');
    }
}

/**
 * Validate that a streak value is valid
 * @param streak - Streak value to validate
 * @throws Error if streak is invalid
 */
export function validateStreak(streak: number): void {
    if (typeof streak !== 'number') {
        throw new Error(`Invalid streak: must be a number, got ${typeof streak}`);
    }

    if (!Number.isInteger(streak)) {
        throw new Error(`Invalid streak: ${streak}. Must be an integer.`);
    }

    if (streak < 0) {
        throw new Error(`Invalid streak: ${streak}. Must be non-negative.`);
    }

    // Sanity check for unreasonably large streaks
    if (streak > 10000) {
        throw new Error(`Invalid streak: ${streak}. Value exceeds reasonable maximum.`);
    }
}

/**
 * Validate lesson type
 * @param lessonType - Lesson type to validate
 * @throws Error if lesson type is invalid
 */
export function validateLessonType(lessonType: string): void {
    const validTypes = ['video', 'reading', 'lab'];
    if (!validTypes.includes(lessonType)) {
        throw new Error(`Invalid lesson type: ${lessonType}. Must be one of: ${validTypes.join(', ')}`);
    }
}

/**
 * Check if a value is a valid non-empty string
 * @param value - Value to check
 * @returns true if valid, false otherwise
 */
export function isValidString(value: any): value is string {
    return typeof value === 'string' && value.trim() !== '';
}

/**
 * Check if a value is a valid positive integer
 * @param value - Value to check
 * @returns true if valid, false otherwise
 */
export function isValidPositiveInteger(value: any): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Check if a value is a valid non-negative integer
 * @param value - Value to check
 * @returns true if valid, false otherwise
 */
export function isValidNonNegativeInteger(value: any): value is number {
    return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

/**
 * Sanitize a string by trimming whitespace
 * @param value - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(value: string): string {
    return value.trim();
}

/**
 * Validate multiple parameters at once
 * @param validations - Array of validation functions to run
 * @throws Error if any validation fails
 */
export function validateAll(...validations: (() => void)[]): void {
    for (const validation of validations) {
        validation();
    }
}
