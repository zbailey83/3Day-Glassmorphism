import { describe, it, expect, beforeEach } from 'vitest';
import {
    storeToolContext,
    getToolContext,
    clearToolContext,
    storeNavigationContext,
    getNavigationContext,
    clearNavigationContext
} from './toolContext';

describe('Tool Context Utilities', () => {
    beforeEach(() => {
        // Clear sessionStorage before each test
        sessionStorage.clear();
    });

    describe('Tool Context Management', () => {
        it('should store and retrieve tool context', () => {
            const lessonId = 'lesson-123';
            const courseId = 'course-456';
            const toolType = 'campaign' as const;

            storeToolContext(lessonId, courseId, toolType);
            const retrieved = getToolContext();

            expect(retrieved).not.toBeNull();
            expect(retrieved?.lessonId).toBe(lessonId);
            expect(retrieved?.courseId).toBe(courseId);
            expect(retrieved?.toolType).toBe(toolType);
            expect(retrieved?.timestamp).toBeDefined();
        });

        it('should return null when no context is stored', () => {
            const retrieved = getToolContext();
            expect(retrieved).toBeNull();
        });

        it('should clear stored tool context', () => {
            storeToolContext('lesson-1', 'course-1', 'image');
            expect(getToolContext()).not.toBeNull();

            clearToolContext();
            expect(getToolContext()).toBeNull();
        });

        it('should handle invalid JSON in storage gracefully', () => {
            sessionStorage.setItem('currentToolContext', 'invalid-json');
            const retrieved = getToolContext();
            expect(retrieved).toBeNull();
        });
    });

    describe('Navigation Context Management', () => {
        it('should store and retrieve navigation context', () => {
            const lessonId = 'lesson-789';
            const courseId = 'course-012';
            const toolType = 'seo' as const;

            storeNavigationContext(lessonId, courseId, toolType);
            const retrieved = getNavigationContext();

            expect(retrieved).not.toBeNull();
            expect(retrieved?.lessonId).toBe(lessonId);
            expect(retrieved?.courseId).toBe(courseId);
            expect(retrieved?.toolType).toBe(toolType);
            expect(retrieved?.openedAt).toBeDefined();
        });

        it('should return null when no navigation context is stored', () => {
            const retrieved = getNavigationContext();
            expect(retrieved).toBeNull();
        });

        it('should clear stored navigation context', () => {
            storeNavigationContext('lesson-1', 'course-1', 'campaign');
            expect(getNavigationContext()).not.toBeNull();

            clearNavigationContext();
            expect(getNavigationContext()).toBeNull();
        });

        it('should handle invalid JSON in navigation storage gracefully', () => {
            sessionStorage.setItem('toolNavigationContext', 'invalid-json');
            const retrieved = getNavigationContext();
            expect(retrieved).toBeNull();
        });
    });

    describe('Context Preservation Across Operations', () => {
        it('should maintain separate tool and navigation contexts', () => {
            // Store both contexts
            storeToolContext('lesson-1', 'course-1', 'campaign');
            storeNavigationContext('lesson-2', 'course-2', 'image');

            // Retrieve both
            const toolContext = getToolContext();
            const navContext = getNavigationContext();

            // Verify they are independent
            expect(toolContext?.lessonId).toBe('lesson-1');
            expect(navContext?.lessonId).toBe('lesson-2');
        });

        it('should allow updating context without clearing', () => {
            // Store initial context
            storeToolContext('lesson-1', 'course-1', 'campaign');
            const first = getToolContext();

            // Update context
            storeToolContext('lesson-2', 'course-2', 'image');
            const second = getToolContext();

            // Verify update
            expect(first?.lessonId).toBe('lesson-1');
            expect(second?.lessonId).toBe('lesson-2');
        });
    });
});
