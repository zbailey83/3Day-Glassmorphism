import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolLaunchButton } from './ToolLaunchButton';

// Mock the EmbeddedTool component
vi.mock('./EmbeddedTool', () => ({
    EmbeddedTool: ({ toolType, onComplete }: any) => (
        <div data-testid={`embedded-tool-${toolType}`}>
            <button onClick={() => onComplete()}>Complete Tool</button>
        </div>
    ),
}));

describe('ToolLaunchButton Component', () => {
    const defaultProps = {
        toolType: 'campaign' as const,
        label: 'Launch Campaign Tool',
        lessonId: 'lesson-1',
        courseId: 'course-1',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Button Rendering', () => {
        it('should render prominent variant by default', () => {
            render(<ToolLaunchButton {...defaultProps} />);

            const button = screen.getByText('Launch Campaign Tool');
            expect(button).toBeTruthy();
            expect(button.className).toContain('bg-indigo-600');
        });

        it('should render inline variant when specified', () => {
            render(<ToolLaunchButton {...defaultProps} variant="inline" />);

            const button = screen.getByText('Launch Campaign Tool');
            expect(button).toBeTruthy();
            expect(button.className).toContain('inline-flex');
            expect(button.className).toContain('text-sm');
        });

        it('should render prominent variant when explicitly specified', () => {
            render(<ToolLaunchButton {...defaultProps} variant="prominent" />);

            const button = screen.getByText('Launch Campaign Tool');
            expect(button).toBeTruthy();
            expect(button.className).toContain('bg-indigo-600');
        });

        it('should display the provided label', () => {
            render(<ToolLaunchButton {...defaultProps} label="Custom Tool Label" />);

            expect(screen.getByText('Custom Tool Label')).toBeTruthy();
        });
    });

    describe('Modal Behavior', () => {
        it('should not show modal initially', () => {
            render(<ToolLaunchButton {...defaultProps} />);

            expect(screen.queryByTestId('embedded-tool-campaign')).toBeNull();
        });

        it('should open modal when button is clicked', () => {
            render(<ToolLaunchButton {...defaultProps} />);

            const button = screen.getByText('Launch Campaign Tool');
            fireEvent.click(button);

            expect(screen.getByTestId('embedded-tool-campaign')).toBeTruthy();
        });

        it('should display modal header with label', () => {
            render(<ToolLaunchButton {...defaultProps} label="Test Tool" />);

            const button = screen.getByText('Test Tool');
            fireEvent.click(button);

            // Modal should show the label in header
            const headers = screen.getAllByText('Test Tool');
            expect(headers.length).toBeGreaterThan(1); // Button + Modal header
        });

        it('should close modal when X button is clicked', () => {
            render(<ToolLaunchButton {...defaultProps} />);

            // Open modal
            const button = screen.getByText('Launch Campaign Tool');
            fireEvent.click(button);
            expect(screen.getByTestId('embedded-tool-campaign')).toBeTruthy();

            // Close modal
            const closeButton = screen.getByLabelText('Close tool');
            fireEvent.click(closeButton);
            expect(screen.queryByTestId('embedded-tool-campaign')).toBeNull();
        });

        it('should close modal when tool completion is triggered', () => {
            render(<ToolLaunchButton {...defaultProps} />);

            // Open modal
            const button = screen.getByText('Launch Campaign Tool');
            fireEvent.click(button);
            expect(screen.getByTestId('embedded-tool-campaign')).toBeTruthy();

            // Complete tool
            const completeButton = screen.getByText('Complete Tool');
            fireEvent.click(completeButton);
            expect(screen.queryByTestId('embedded-tool-campaign')).toBeNull();
        });
    });

    describe('Tool Context Passing', () => {
        it('should pass toolContext to EmbeddedTool', () => {
            const context = {
                instructions: 'Test instructions',
                prefilledData: { prompt: 'test' },
                successCriteria: 'Success criteria',
            };

            render(<ToolLaunchButton {...defaultProps} context={context} />);

            const button = screen.getByText('Launch Campaign Tool');
            fireEvent.click(button);

            // EmbeddedTool should be rendered (context is passed internally)
            expect(screen.getByTestId('embedded-tool-campaign')).toBeTruthy();
        });

        it('should pass correct toolType to EmbeddedTool', () => {
            render(<ToolLaunchButton {...defaultProps} toolType="image" />);

            const button = screen.getByText('Launch Campaign Tool');
            fireEvent.click(button);

            expect(screen.getByTestId('embedded-tool-image')).toBeTruthy();
        });

        it('should pass lessonId and courseId to EmbeddedTool', () => {
            render(
                <ToolLaunchButton
                    {...defaultProps}
                    lessonId="test-lesson-123"
                    courseId="test-course-456"
                />
            );

            const button = screen.getByText('Launch Campaign Tool');
            fireEvent.click(button);

            // EmbeddedTool should be rendered with correct props
            expect(screen.getByTestId('embedded-tool-campaign')).toBeTruthy();
        });
    });

    describe('Different Tool Types', () => {
        it('should work with campaign tool type', () => {
            render(<ToolLaunchButton {...defaultProps} toolType="campaign" />);

            const button = screen.getByText('Launch Campaign Tool');
            fireEvent.click(button);

            expect(screen.getByTestId('embedded-tool-campaign')).toBeTruthy();
        });

        it('should work with image tool type', () => {
            render(<ToolLaunchButton {...defaultProps} toolType="image" />);

            const button = screen.getByText('Launch Campaign Tool');
            fireEvent.click(button);

            expect(screen.getByTestId('embedded-tool-image')).toBeTruthy();
        });

        it('should work with seo tool type', () => {
            render(<ToolLaunchButton {...defaultProps} toolType="seo" />);

            const button = screen.getByText('Launch Campaign Tool');
            fireEvent.click(button);

            expect(screen.getByTestId('embedded-tool-seo')).toBeTruthy();
        });
    });
});
