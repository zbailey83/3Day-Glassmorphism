import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CourseView } from './CourseView';
import { Course } from '../types';

// Mock dependencies
vi.mock('../hooks/useAuth', () => ({
    useAuth: () => ({ user: null }),
}));

vi.mock('../services/firebase', () => ({
    updateModuleProgress: vi.fn(),
    addXP: vi.fn(),
}));

vi.mock('../src/data/gamification', () => ({
    COURSE_MASCOTS: {},
}));

vi.mock('./EmbeddedTool', () => ({
    EmbeddedTool: () => <div data-testid="embedded-tool">Embedded Tool</div>,
}));

vi.mock('./ToolLaunchButton', () => ({
    ToolLaunchButton: ({ toolType, label }: any) => (
        <button data-testid={`tool-launch-${toolType}`}>{label}</button>
    ),
}));

describe('CourseView - Tool Mention Parsing', () => {
    const createMockCourse = (lessonContent: string): Course => ({
        id: 'test-course',
        title: 'Test Course',
        subtitle: 'Test Subtitle',
        description: 'Test Description',
        tags: ['test'],
        thumbnail: 'test.jpg',
        modules: [
            {
                id: 'test-module',
                title: 'Test Module',
                lessons: [
                    {
                        id: 'test-lesson',
                        title: 'Test Lesson',
                        type: 'reading',
                        duration: '10 min',
                        content: lessonContent,
                    },
                ],
            },
        ],
    });

    it('should parse and render Campaign Generator tool mention', () => {
        const content = 'This lesson uses the [Campaign Generator] to create content.';
        const course = createMockCourse(content);

        const { getByTestId, queryByText } = render(<CourseView course={course} />);

        // Tool launch button should be rendered
        expect(getByTestId('tool-launch-campaign')).toBeTruthy();
        expect(getByTestId('tool-launch-campaign').textContent).toBe('Launch Campaign Generator');

        // Tool mention marker should be removed from content
        expect(queryByText('[Campaign Generator]')).toBeNull();
    });

    it('should parse and render Image Generator tool mention', () => {
        const content = 'Use the [Image Generator] for this exercise.';
        const course = createMockCourse(content);

        const { getByTestId } = render(<CourseView course={course} />);

        expect(getByTestId('tool-launch-image')).toBeTruthy();
        expect(getByTestId('tool-launch-image').textContent).toBe('Launch Image Generator');
    });

    it('should parse and render Visual Vibe Lab tool mention', () => {
        const content = 'Try the [Visual Vibe Lab] to generate images.';
        const course = createMockCourse(content);

        const { getByTestId } = render(<CourseView course={course} />);

        expect(getByTestId('tool-launch-image')).toBeTruthy();
        expect(getByTestId('tool-launch-image').textContent).toBe('Launch Visual Vibe Lab');
    });

    it('should parse and render SEO Analyzer tool mention', () => {
        const content = 'Check your work with the [SEO Analyzer].';
        const course = createMockCourse(content);

        const { getByTestId } = render(<CourseView course={course} />);

        expect(getByTestId('tool-launch-seo')).toBeTruthy();
        expect(getByTestId('tool-launch-seo').textContent).toBe('Launch SEO Analyzer');
    });

    it('should parse and render Logic Auditor tool mention', () => {
        const content = 'Validate your code with [Logic Auditor].';
        const course = createMockCourse(content);

        const { getByTestId } = render(<CourseView course={course} />);

        expect(getByTestId('tool-launch-seo')).toBeTruthy();
        expect(getByTestId('tool-launch-seo').textContent).toBe('Launch Logic Auditor');
    });

    it('should handle multiple tool mentions in the same lesson', () => {
        const content = `
First, use the [Campaign Generator] to create content.
Then, use the [Image Generator] to create visuals.
Finally, check with the [SEO Analyzer].
        `;
        const course = createMockCourse(content);

        const { getByTestId } = render(<CourseView course={course} />);

        expect(getByTestId('tool-launch-campaign')).toBeTruthy();
        expect(getByTestId('tool-launch-image')).toBeTruthy();
        expect(getByTestId('tool-launch-seo')).toBeTruthy();
    });

    it('should not render tool buttons when no tool mentions exist', () => {
        const content = 'This is a regular lesson with no tool mentions.';
        const course = createMockCourse(content);

        const { queryByTestId } = render(<CourseView course={course} />);

        expect(queryByTestId('tool-launch-campaign')).toBeNull();
        expect(queryByTestId('tool-launch-image')).toBeNull();
        expect(queryByTestId('tool-launch-seo')).toBeNull();
    });

    it('should handle tool mentions case-insensitively', () => {
        const content = 'Use the [campaign generator] here.';
        const course = createMockCourse(content);

        const { getByTestId } = render(<CourseView course={course} />);

        expect(getByTestId('tool-launch-campaign')).toBeTruthy();
    });
});
