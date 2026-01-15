import { LevelInfo, Achievement } from '../src/data/gamification';

// Notification types
export type NotificationType = 'xp' | 'levelUp' | 'achievement' | 'streak';

export interface Notification {
    id: string;
    type: NotificationType;
    data: any;
    timestamp: number;
}

/**
 * Notification queue to prevent spam and manage notification display timing.
 * 
 * Implements a FIFO queue with automatic processing and configurable delay
 * between notifications. Supports multiple subscribers via observer pattern.
 */
class NotificationQueue {
    private queue: Notification[] = [];
    private isProcessing: boolean = false;
    private listeners: Set<(notification: Notification) => void> = new Set();
    private readonly DELAY_BETWEEN_NOTIFICATIONS = 500; // ms

    /**
     * Add a notification to the queue.
     * 
     * @param type - Type of notification (xp, levelUp, achievement, streak)
     * @param data - Notification data specific to the type
     */
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

    /**
     * Process the notification queue sequentially with delays.
     * 
     * Ensures notifications are displayed one at a time with a 500ms delay
     * between each notification to prevent UI spam.
     */
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

    /**
     * Subscribe to notification events.
     * 
     * @param listener - Callback function to handle notifications
     * @returns Unsubscribe function to remove the listener
     */
    subscribe(listener: (notification: Notification) => void): () => void {
        this.listeners.add(listener);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Clear all pending notifications from the queue.
     */
    clear(): void {
        this.queue = [];
    }
}

// Singleton instance
const notificationQueue = new NotificationQueue();

// Export notification functions

/**
 * Show an XP gain notification to the user.
 * 
 * Displays a toast notification showing the amount of XP gained and the reason.
 * Notifications are queued to prevent spam.
 * 
 * @param amount - Amount of XP gained (positive integer)
 * @param reason - Reason for XP gain (e.g., "Completed video lesson")
 * 
 * @example
 * ```typescript
 * showXPGain(25, 'Completed video lesson');
 * showXPGain(100, 'Achievement unlocked: First Steps');
 * ```
 */
export function showXPGain(amount: number, reason: string): void {
    notificationQueue.enqueue('xp', { amount, reason });
}

/**
 * Show a level-up notification to the user.
 * 
 * Displays a full-screen modal celebrating the level up with the new level
 * title and unlocked perks.
 * 
 * @param newLevel - The new level information (level number, title, perks)
 * 
 * @example
 * ```typescript
 * const newLevel = getLevelFromXP(userXP);
 * showLevelUp(newLevel);
 * ```
 */
export function showLevelUp(newLevel: LevelInfo): void {
    notificationQueue.enqueue('levelUp', { newLevel });
}

/**
 * Show an achievement unlock notification to the user.
 * 
 * Displays an animated card showing the achievement details including
 * title, description, tier, and XP reward.
 * 
 * @param achievement - The unlocked achievement object
 * 
 * @example
 * ```typescript
 * const achievement = ACHIEVEMENTS.find(a => a.id === 'first-lesson');
 * showAchievementUnlock(achievement);
 * ```
 */
export function showAchievementUnlock(achievement: Achievement): void {
    notificationQueue.enqueue('achievement', { achievement });
}

/**
 * Show a streak update notification to the user.
 * 
 * Displays a corner badge showing the current login streak count.
 * 
 * @param streak - Current streak count (number of consecutive login days)
 * 
 * @example
 * ```typescript
 * showStreakUpdate(5); // Shows "5 day streak!"
 * ```
 */
export function showStreakUpdate(streak: number): void {
    notificationQueue.enqueue('streak', { streak });
}

/**
 * Subscribe to notification events.
 * 
 * Allows components to listen for notifications and display them in the UI.
 * The listener function is called whenever a notification is dequeued.
 * 
 * @param listener - Callback function to handle notifications
 * @returns Unsubscribe function to stop listening
 * 
 * @example
 * ```typescript
 * // In a React component
 * useEffect(() => {
 *   const unsubscribe = subscribeToNotifications((notification) => {
 *     if (notification.type === 'xp') {
 *       setXPToast(notification.data);
 *     }
 *   });
 *   return unsubscribe; // Cleanup on unmount
 * }, []);
 * ```
 */
export function subscribeToNotifications(
    listener: (notification: Notification) => void
): () => void {
    return notificationQueue.subscribe(listener);
}

/**
 * Clear all pending notifications from the queue.
 * 
 * Useful for cleanup or when navigating away from the app.
 * 
 * @example
 * ```typescript
 * // Clear notifications when user logs out
 * clearNotifications();
 * ```
 */
export function clearNotifications(): void {
    notificationQueue.clear();
}
