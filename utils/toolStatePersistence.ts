/**
 * Tool State Persistence Utilities
 * 
 * Manages saving and restoring tool state to localStorage
 * with automatic cleanup of old states (> 24 hours)
 */

const TOOL_STATE_KEY_PREFIX = 'tool_state_';
const STATE_EXPIRY_HOURS = 24;

export interface ToolState {
    toolType: 'campaign' | 'image';
    lessonId: string;
    courseId: string;
    timestamp: string;
    state: any; // Tool-specific state
}

/**
 * Generate a unique key for tool state storage
 */
function getToolStateKey(lessonId: string, courseId: string, toolType: string): string {
    return `${TOOL_STATE_KEY_PREFIX}${courseId}_${lessonId}_${toolType}`;
}

/**
 * Save tool state to localStorage
 */
export function saveToolState(
    lessonId: string,
    courseId: string,
    toolType: 'campaign' | 'image',
    state: any
): void {
    try {
        const toolState: ToolState = {
            toolType,
            lessonId,
            courseId,
            timestamp: new Date().toISOString(),
            state
        };

        const key = getToolStateKey(lessonId, courseId, toolType);
        localStorage.setItem(key, JSON.stringify(toolState));

        console.log('Tool state saved:', { lessonId, courseId, toolType });
    } catch (error) {
        console.error('Failed to save tool state:', error);
    }
}

/**
 * Restore tool state from localStorage
 * Returns null if state doesn't exist or has expired
 */
export function restoreToolState(
    lessonId: string,
    courseId: string,
    toolType: 'campaign' | 'image'
): any | null {
    try {
        const key = getToolStateKey(lessonId, courseId, toolType);
        const stored = localStorage.getItem(key);

        if (!stored) {
            return null;
        }

        const toolState: ToolState = JSON.parse(stored);

        // Check if state has expired (> 24 hours)
        const savedTime = new Date(toolState.timestamp).getTime();
        const now = new Date().getTime();
        const hoursSinceCreation = (now - savedTime) / (1000 * 60 * 60);

        if (hoursSinceCreation > STATE_EXPIRY_HOURS) {
            // State has expired, remove it
            localStorage.removeItem(key);
            console.log('Tool state expired and removed:', { lessonId, courseId, toolType });
            return null;
        }

        console.log('Tool state restored:', { lessonId, courseId, toolType });
        return toolState.state;
    } catch (error) {
        console.error('Failed to restore tool state:', error);
        return null;
    }
}

/**
 * Clear tool state for a specific lesson/course/tool combination
 */
export function clearToolState(
    lessonId: string,
    courseId: string,
    toolType: 'campaign' | 'image'
): void {
    try {
        const key = getToolStateKey(lessonId, courseId, toolType);
        localStorage.removeItem(key);
        console.log('Tool state cleared:', { lessonId, courseId, toolType });
    } catch (error) {
        console.error('Failed to clear tool state:', error);
    }
}

/**
 * Check if saved state exists for a tool
 */
export function hasToolState(
    lessonId: string,
    courseId: string,
    toolType: 'campaign' | 'image'
): boolean {
    const key = getToolStateKey(lessonId, courseId, toolType);
    return localStorage.getItem(key) !== null;
}

/**
 * Clean up all expired tool states (> 24 hours old)
 * Should be called on app initialization
 */
export function cleanupExpiredToolStates(): void {
    try {
        const now = new Date().getTime();
        const keysToRemove: string[] = [];

        // Iterate through all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key && key.startsWith(TOOL_STATE_KEY_PREFIX)) {
                try {
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        const toolState: ToolState = JSON.parse(stored);
                        const savedTime = new Date(toolState.timestamp).getTime();
                        const hoursSinceCreation = (now - savedTime) / (1000 * 60 * 60);

                        if (hoursSinceCreation > STATE_EXPIRY_HOURS) {
                            keysToRemove.push(key);
                        }
                    }
                } catch (error) {
                    // If we can't parse the state, remove it
                    keysToRemove.push(key);
                }
            }
        }

        // Remove expired states
        keysToRemove.forEach(key => localStorage.removeItem(key));

        if (keysToRemove.length > 0) {
            console.log(`Cleaned up ${keysToRemove.length} expired tool states`);
        }
    } catch (error) {
        console.error('Failed to cleanup expired tool states:', error);
    }
}
