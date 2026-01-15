/**
 * Utility functions for managing tool navigation context
 * Ensures lesson and course context is preserved during tool usage
 */

export interface StoredToolContext {
    lessonId: string;
    courseId: string;
    toolType: 'campaign' | 'image' | 'seo';
    timestamp: string;
}

export interface NavigationContext {
    lessonId: string;
    courseId: string;
    toolType: 'campaign' | 'image' | 'seo';
    openedAt: string;
}

/**
 * Store the current tool context in sessionStorage
 * Called when a tool is opened from a lesson
 */
export const storeToolContext = (
    lessonId: string,
    courseId: string,
    toolType: 'campaign' | 'image' | 'seo'
): void => {
    const context: StoredToolContext = {
        lessonId,
        courseId,
        toolType,
        timestamp: new Date().toISOString()
    };
    sessionStorage.setItem('currentToolContext', JSON.stringify(context));
};

/**
 * Retrieve the stored tool context from sessionStorage
 * Returns null if no context is stored
 */
export const getToolContext = (): StoredToolContext | null => {
    const stored = sessionStorage.getItem('currentToolContext');
    if (!stored) return null;

    try {
        return JSON.parse(stored) as StoredToolContext;
    } catch (error) {
        console.error('Failed to parse stored tool context:', error);
        return null;
    }
};

/**
 * Clear the stored tool context from sessionStorage
 * Called when tool is closed or component unmounts
 */
export const clearToolContext = (): void => {
    sessionStorage.removeItem('currentToolContext');
};

/**
 * Store navigation context when opening a tool modal
 */
export const storeNavigationContext = (
    lessonId: string,
    courseId: string,
    toolType: 'campaign' | 'image' | 'seo'
): void => {
    const context: NavigationContext = {
        lessonId,
        courseId,
        toolType,
        openedAt: new Date().toISOString()
    };
    sessionStorage.setItem('toolNavigationContext', JSON.stringify(context));
};

/**
 * Retrieve the stored navigation context
 */
export const getNavigationContext = (): NavigationContext | null => {
    const stored = sessionStorage.getItem('toolNavigationContext');
    if (!stored) return null;

    try {
        return JSON.parse(stored) as NavigationContext;
    } catch (error) {
        console.error('Failed to parse stored navigation context:', error);
        return null;
    }
};

/**
 * Clear the stored navigation context
 */
export const clearNavigationContext = (): void => {
    sessionStorage.removeItem('toolNavigationContext');
};
