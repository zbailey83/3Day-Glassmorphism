import { LevelInfo, Achievement } from '../src/data/gamification';

// Notification types
export type NotificationType = 'xp' | 'levelUp' | 'achievement' | 'streak';

export interface Notification {
    id: string;
    type: NotificationType;
    data: any;
    timestamp: number;
}

// Notification queue to prevent spam
class NotificationQueue {
    private queue: Notification[] = [];
    private isProcessing: boolean = false;
    private listeners: Set<(notification: Notification) => void> = new Set();
    private readonly DELAY_BETWEEN_NOTIFICATIONS = 500; // ms

    // Add a notification to the queue
    enqueue(type: NotificationType, data: any): void {
        const notification: Notification = {
            id: `${type}-${Date.now()}-${Math.random()}`,
            type,
            data,
            timestamp: Date.now()
        };

        this.queue.push(notification);
        this.processQueue();
    }

    // Process the queue
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const notification = this.queue.shift();
            if (notification) {
                // Notify all listeners
                this.listeners.forEach(listener => listener(notification));

                // Wait before processing next notification
                await new Promise(resolve =>
                    setTimeout(resolve, this.DELAY_BETWEEN_NOTIFICATIONS)
                );
            }
        }

        this.isProcessing = false;
    }

    // Subscribe to notifications
    subscribe(listener: (notification: Notification) => void): () => void {
        this.listeners.add(listener);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    // Clear all notifications
    clear(): void {
        this.queue = [];
    }
}

// Singleton instance
const notificationQueue = new NotificationQueue();

// Export notification functions

/**
 * Show XP gain notification
 * @param amount - Amount of XP gained
 * @param reason - Reason for XP gain
 */
export function showXPGain(amount: number, reason: string): void {
    notificationQueue.enqueue('xp', { amount, reason });
}

/**
 * Show level up notification
 * @param newLevel - The new level information
 */
export function showLevelUp(newLevel: LevelInfo): void {
    notificationQueue.enqueue('levelUp', { newLevel });
}

/**
 * Show achievement unlock notification
 * @param achievement - The unlocked achievement
 */
export function showAchievementUnlock(achievement: Achievement): void {
    notificationQueue.enqueue('achievement', { achievement });
}

/**
 * Show streak update notification
 * @param streak - Current streak count
 */
export function showStreakUpdate(streak: number): void {
    notificationQueue.enqueue('streak', { streak });
}

/**
 * Subscribe to notification events
 * @param listener - Callback function to handle notifications
 * @returns Unsubscribe function
 */
export function subscribeToNotifications(
    listener: (notification: Notification) => void
): () => void {
    return notificationQueue.subscribe(listener);
}

/**
 * Clear all pending notifications
 */
export function clearNotifications(): void {
    notificationQueue.clear();
}
