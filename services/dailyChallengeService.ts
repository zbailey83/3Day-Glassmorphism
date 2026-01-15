import { db } from './firebase';
import { doc, getDoc, addDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { DailyChallengeProgress, UserProfile } from '../types';
import { DAILY_CHALLENGES, DailyChallenge } from '../src/data/gamification';
import { awardXP } from './xpService';

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
        console.error('Error getting daily challenges:', error);
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
        console.error('Error checking daily challenge completion:', error);
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
        console.error('Error getting daily challenge history:', error);
        return [];
    }
}
