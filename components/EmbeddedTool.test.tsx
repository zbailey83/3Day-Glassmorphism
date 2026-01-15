import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmbeddedTool } from './EmbeddedTool';

// Mock the tool components
vi.mock('./tools/CampaignGenerator', () => ({
    CampaignGenerator: () => <div data-testid="campaign-tool">Campaign Generator</div>,
}));

vi.mock('./tools/ImageGenLab', () => ({
    ImageGenLab: () => <div data-testid="image-tool">Image Gen Lab</div>,
}));

vi.mock('./tools/SeoAnalyzer', () => ({
    SeoAnalyzer: () => <div data-testid="seo-tool">SEO Analyzer</div>,
}));

describe('EmbeddedTool Component', () => {
    const mockOnComplete = vi.fn();
    const defaultProps = {
        toolType: 'campaign' as const,
        lessonId: 'lesson-1',
        courseId: 'course-1',
        onComplete: mockOnComplete,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should render the campaign tool when toolType is campaign', () => {
        render(<EmbeddedTool {...defaultProps} toolType="campaign" />);
        expect(screen.getByTestId('campaign-tool')).toBeTruthy();
    });

    it('should render the image tool when toolType is image', () => {
        render(<EmbeddedTool {...defaultProps} toolType="image" />);
        expect(screen.getByTestId('image-tool')).toBeTruthy();
    });

    it('should render the seo tool when toolType is seo', () => {
        render(<EmbeddedTool {...defaultProps} toolType="seo" />);
        expect(screen.getByTestId('seo-tool')).toBeTruthy();
    });

    it('should display context instructions when provided', () => {
        const context = {
            instructions: 'Test instructions for this lesson',
            successCriteria: 'Complete the task successfully',
        };

        render(<EmbeddedTool {...defaultProps} context={context} />);

        expect(screen.getByText('Lesson Instructions')).toBeTruthy();
        expect(screen.getByText('Test instructions for this lesson')).toBeTruthy();
        expect(screen.getByText('Success Criteria:')).toBeTruthy();
        expect(screen.getByText('Complete the task successfully')).toBeTruthy();
    });

    it('should not display context banner when no context is provided', () => {
        render(<EmbeddedTool {...defaultProps} />);

        expect(screen.queryByText('Lesson Instructions')).toBeNull();
    });

    it('should render Done button', () => {
        render(<EmbeddedTool {...defaultProps} />);

        const doneButton = screen.getByText('Done - Return to Lesson');
        expect(doneButton).toBeTruthy();
    });

    it('should call onComplete when Done button is clicked', () => {
        render(<EmbeddedTool {...defaultProps} />);

        const doneButton = screen.getByText('Done - Return to Lesson');
        fireEvent.click(doneButton);

        expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should track tool usage in localStorage on mount', () => {
        render(<EmbeddedTool {...defaultProps} />);

        const usage = JSON.parse(localStorage.getItem('toolUsage') || '[]');
        expect(usage.length).toBe(1);
        expect(usage[0]).toMatchObject({
            toolType: 'campaign',
            lessonId: 'lesson-1',
            courseId: 'course-1',
            completed: false,
        });
    });

    it('should track completion when Done button is clicked', () => {
        render(<EmbeddedTool {...defaultProps} />);

        // Clear the initial tracking
        localStorage.setItem('toolUsage', '[]');

        const doneButton = screen.getByText('Done - Return to Lesson');
        fireEvent.click(doneButton);

        const usage = JSON.parse(localStorage.getItem('toolUsage') || '[]');
        expect(usage.length).toBe(1);
        expect(usage[0]).toMatchObject({
            toolType: 'campaign',
            lessonId: 'lesson-1',
            courseId: 'course-1',
            completed: true,
        });
    });

    it('should accept all required props', () => {
        const props = {
            toolType: 'image' as const,
            lessonId: 'test-lesson',
            courseId: 'test-course',
            context: {
                instructions: 'Test instructions',
                prefilledData: { prompt: 'test prompt' },
                successCriteria: 'Success',
            },
            onComplete: mockOnComplete,
        };

        render(<EmbeddedTool {...props} />);

        expect(screen.getByTestId('image-tool')).toBeTruthy();
        expect(screen.getByText('Test instructions')).toBeTruthy();
    });
});
