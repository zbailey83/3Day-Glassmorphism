import { db } from './firebase';
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { DailyChallengeProgress, UserProfile } from '../types';
import { DAILY_CHALLENGES, DailyChallenge } from '../src/data/gamification';
import { awardXP } from './xpService';
import { validateUserId, validateChallengeId } from './validation';

/**
 * Get today's date in YYYY-MM-DD format (UTC timezone).
 * 
 * Used for daily challenge reset logic - challenges reset at midnight UTC.
 * 
 * @returns Date string in YYYY-MM-DD format
 * 
 * @example
 * ```typescript
 * const today = getTodayDateString(); // Returns "2026-01-15"
 * ```
 */
function getTodayDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

/**
 * Get all daily challenges for a user with their completion status for today.
 * 
 * Returns all available daily challenges with a 'completed' flag indicating
 * whether the user has completed each challenge today. Challenges reset at
 * midnight UTC.
 * 
 * @param userId - User ID to get challenges for (must be non-empty string)
 * @returns Array of daily challenges with completion status (returns all incomplete on error)
 * 
 * @example
 * ```typescript
 * const challenges = await getDailyChallenges('user123');
 * challenges.forEach(challenge => {
 *   console.log(`${challenge.title}: ${challenge.completed ? 'Done' : 'Pending'}`);
 * });
 * ```
 */
export async function getDailyChallenges(userId: string): Promise<(DailyChallenge & { completed: boolean })[]> {
    // Validate userId using centralized validation
    try {
        validateUserId(userId);
    } catch (error) {
        console.error('Invalid user ID in getDailyChallenges:', userId, error);
        // Return challenges with all marked as incomplete on error
        return DAILY_CHALLENGES.map(challenge => ({
            ...challenge,
            completed: false
        }));
    }

    try {
        const today = getTodayDateString();

        // Query for today's completed challenges
        const progressQuery = query(
            collection(db, 'dailyChallengeProgress'),
            where('userId', '==', userId),
            where('date', '==', today)
        );

        const progressSnap = await getDocs(progressQuery);
        const completedChallengeIds = new Set<string>();

        progressSnap.forEach(doc => {
            const data = doc.data() as DailyChallengeProgress;
            completedChallengeIds.add(data.challengeId);
        });

        // Map challenges with completion status
        const challengesWithStatus = DAILY_CHALLENGES.map(challenge => ({
            ...challenge,
            completed: completedChallengeIds.has(challenge.id)
        }));

        return challengesWithStatus;
    } catch (error) {
        console.error(`Error getting daily challenges for user ${userId}:`, error);
        handleGamificationError(error as Error, 'getDailyChallenges');
        // Return challenges with all marked as incomplete on error
        return DAILY_CHALLENGES.map(challenge => ({
            ...challenge,
            completed: false
        }));
    }
}

/**
 * Complete a daily challenge for a user with idempotency protection.
 * 
 * This function:
 * 1. Validates inputs (userId, challengeId)
 * 2. Checks if challenge is already completed today (prevents duplicates)
 * 3. Awards challenge XP
 * 4. Logs completion to dailyChallengeProgress collection
 * 
 * Idempotency: Completing the same challenge multiple times in one day will
 * only award XP once. The challenge can be completed again the next day.
 * 
 * Side effects:
 * - Awards XP to the user
 * - Creates a daily challenge progress record
 * - Logs to console
 * 
 * @param userId - User ID completing the challenge (must be non-empty string)
 * @param challengeId - Challenge ID being completed (must exist in DAILY_CHALLENGES)
 * @throws Error if challenge doesn't exist or database operation fails
 * 
 * @example
 * ```typescript
 * // Complete a daily challenge
 * await completeDailyChallenge('user123', 'daily-lesson');
 * 
 * // Trying again today won't award XP
 * await completeDailyChallenge('user123', 'daily-lesson'); // Logs "already completed"
 * ```
 */
export async function completeDailyChallenge(
    userId: string,
    challengeId: string
): Promise<void> {
    // Validate inputs using centralized validation
    validateUserId(userId);
    validateChallengeId(challengeId);

    try {
        // Find the challenge
        const challenge = DAILY_CHALLENGES.find(c => c.id === challengeId);

        if (!challenge) {
            throw new Error(`Daily challenge not found: ${challengeId}`);
        }

        const today = getTodayDateString();

        // Check if challenge already completed today (prevent duplicates)
        const progressQuery = query(
            collection(db, 'dailyChallengeProgress'),
            where('userId', '==', userId),
            where('challengeId', '==', challengeId),
            where('date', '==', today)
        );

        const existingProgress = await getDocs(progressQuery);

        if (!existingProgress.empty) {
            console.log(`Daily challenge ${challengeId} already completed today for user ${userId}`);
            return; // Exit early - no XP award
        }

        // Award challenge XP
        await awardXP(
            userId,
            challenge.xpReward,
            `Daily challenge completed: ${challenge.title}`,
            { achievementId: challengeId }
        );

        // Store completion in dailyChallengeProgress collection
        const progressRecord: Omit<DailyChallengeProgress, 'completedAt'> & { completedAt: any } = {
            userId,
            challengeId,
            completedAt: serverTimestamp(),
            xpAwarded: challenge.xpReward,
            date: today
        };

        await addDoc(collection(db, 'dailyChallengeProgress'), progressRecord);

        console.log(`Daily challenge ${challenge.title} completed for user ${userId}, awarded ${challenge.xpReward} XP`);
    } catch (error) {
        console.error(`Error completing daily challenge ${challengeId} for user ${userId}:`, error);
        handleGamificationError(error as Error, 'completeDailyChallenge');
        throw error;
    }
}

/**
 * Check if a specific daily challenge is completed today.
 * 
 * @param userId - User ID to check (must be non-empty string)
 * @param challengeId - Challenge ID to check (must exist in DAILY_CHALLENGES)
 * @returns true if challenge is completed today, false otherwise (or on error)
 * 
 * @example
 * ```typescript
 * const isCompleted = await isDailyChallengeCompleted('user123', 'daily-lesson');
 * if (!isCompleted) {
 *   console.log('Challenge still available today!');
 * }
 * ```
 */
export async function isDailyChallengeCompleted(
    userId: string,
    challengeId: string
): Promise<boolean> {
    // Validate inputs using centralized validation
    try {
        validateUserId(userId);
        validateChallengeId(challengeId);
    } catch (error) {
        console.error('Invalid parameters in isDailyChallengeCompleted:', { userId, challengeId }, error);
        return false;
    }

    try {
        const today = getTodayDateString();

        const progressQuery = query(
            collection(db, 'dailyChallengeProgress'),
            where('userId', '==', userId),
            where('challengeId', '==', challengeId),
            where('date', '==', today)
        );

        const progressSnap = await getDocs(progressQuery);
        return !progressSnap.empty;
    } catch (error) {
        console.error(`Error checking daily challenge completion for user ${userId}, challenge ${challengeId}:`, error);
        handleGamificationError(error as Error, 'isDailyChallengeCompleted');
        return false;
    }
}

/**
 * Get user's daily challenge completion history.
 * 
 * Returns a list of completed daily challenges, sorted by date descending
 * (most recent first), limited to the specified number of records.
 * 
 * @param userId - User ID to get history for (must be non-empty string)
 * @param limit - Maximum number of records to return (default: 30, must be positive integer)
 * @returns Array of daily challenge progress records (empty array on error)
 * 
 * @example
 * ```typescript
 * // Get last 30 days of challenge completions
 * const history = await getDailyChallengeHistory('user123');
 * 
 * // Get last 7 days only
 * const recentHistory = await getDailyChallengeHistory('user123', 7);
 * ```
 */
export async function getDailyChallengeHistory(
    userId: string,
    limit: number = 30
): Promise<DailyChallengeProgress[]> {
    // Validate userId using centralized validation
    try {
        validateUserId(userId);
    } catch (error) {
        console.error('Invalid user ID in getDailyChallengeHistory:', userId, error);
        return [];
    }

    // Validate limit
    if (limit <= 0 || !Number.isInteger(limit)) {
        console.warn('Invalid limit in getDailyChallengeHistory, using default:', limit);
        limit = 30;
    }

    try {
        const progressQuery = query(
            collection(db, 'dailyChallengeProgress'),
            where('userId', '==', userId)
        );

        const progressSnap = await getDocs(progressQuery);
        const history: DailyChallengeProgress[] = [];

        progressSnap.forEach(doc => {
            history.push(doc.data() as DailyChallengeProgress);
        });

        // Sort by date descending and limit
        history.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
        });

        return history.slice(0, limit);
    } catch (error) {
        console.error(`Error getting daily challenge history for user ${userId}:`, error);
        handleGamificationError(error as Error, 'getDailyChallengeHistory');
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
