import { db } from './firebase';
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { DailyChallengeProgress, UserProfile } from '../types';
import { DAILY_CHALLENGES, DailyChallenge } from '../src/data/gamification';
import { awardXP } from './xpService';
import { validateUserId, validateChallengeId } from './validation';

/**
 * Get today's date in YYYY-MM-DD format (UTC)
 * @returns Date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0];
}

/**
 * Get all daily challenges for a user with completion status
 * @param userId - User ID to get challenges for
 * @returns Array of daily challenges with completion status
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
 * Complete a daily challenge for a user
 * @param userId - User ID completing the challenge
 * @param challengeId - Challenge ID being completed
 * @throws Error if challenge doesn't exist or database operation fails
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
 * Check if a specific daily challenge is completed today
 * @param userId - User ID to check
 * @param challengeId - Challenge ID to check
 * @returns true if challenge is completed today, false otherwise
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
 * Get user's daily challenge completion history
 * @param userId - User ID to get history for
 * @param limit - Maximum number of records to return (default: 30)
 * @returns Array of daily challenge progress records
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
