import React, { useEffect, useState } from 'react';
import { CampaignGenerator } from './tools/CampaignGenerator';
import { ImageGenLab } from './tools/ImageGenLab';
// SeoAnalyzer removed - not used in any course
import { ToolContext, ToolUsage } from '../types';
import { CheckCircle, X } from 'lucide-react';
import { storeToolContext, clearToolContext } from '../utils/toolContext';
import { ToolErrorBoundary } from './ToolErrorBoundary';
import { saveToolState, restoreToolState, clearToolState, hasToolState } from '../utils/toolStatePersistence';

interface EmbeddedToolProps {
    toolType: 'campaign' | 'image';
    context?: ToolContext;
    onComplete?: (result: any) => void;
    lessonId: string;
    courseId: string;
}

export const EmbeddedTool: React.FC<EmbeddedToolProps> = ({
    toolType,
    context,
    onComplete,
    lessonId,
    courseId
}) => {
    const [hasTrackedUsage, setHasTrackedUsage] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [hasSavedState, setHasSavedState] = useState(false);
    const previousFocusRef = React.useRef<HTMLElement | null>(null);

    // Store the previously focused element when tool mounts
    useEffect(() => {
        previousFocusRef.current = document.activeElement as HTMLElement;
        console.log('Stored previous focus element:', previousFocusRef.current);
    }, []);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Check for saved state on mount
    useEffect(() => {
        const savedStateExists = hasToolState(lessonId, courseId, toolType);
        setHasSavedState(savedStateExists);

        if (savedStateExists) {
            console.log('Saved tool state available for restoration');
        }
    }, [lessonId, courseId, toolType]);

    // Store lesson and course context when tool is opened
    useEffect(() => {
        // Store context using utility function
        storeToolContext(lessonId, courseId, toolType);
        console.log('Tool context stored:', { lessonId, courseId, toolType });

        // Cleanup: Clear context when component unmounts
        return () => {
            console.log('Tool context cleared on unmount');
            clearToolContext();
        };
    }, [lessonId, courseId, toolType]);

    // Track tool usage when component mounts
    useEffect(() => {
        if (!hasTrackedUsage) {
            trackToolUsage(false);
            setHasTrackedUsage(true);
        }
    }, [hasTrackedUsage]);

    // Track tool usage for analytics
    const trackToolUsage = (completed: boolean, result?: any) => {
        // Get current user from auth context if available
        const userId = localStorage.getItem('userId') || 'anonymous';

        const usage: ToolUsage = {
            userId,
            toolType,
            lessonId,
            courseId,
            timestamp: new Date(),
            completed,
            result
        };

        // Store usage in localStorage for now (can be synced to backend later)
        const existingUsage = JSON.parse(localStorage.getItem('toolUsage') || '[]');
        existingUsage.push(usage);
        localStorage.setItem('toolUsage', JSON.stringify(existingUsage));

        console.log('Tool usage tracked:', usage);
    };

    const handleComplete = (result?: any) => {
        // Track completion
        trackToolUsage(true, result);

        // Return focus to lesson content
        if (previousFocusRef.current) {
            previousFocusRef.current.focus();
            console.log('Focus returned to lesson content');
        } else {
            // Fallback: try to focus the main content area
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.focus();
                console.log('Focus returned to main content area');
            }
        }

        // Call parent completion handler if provided
        if (onComplete) {
            onComplete(result);
        }
    };

    // Render the appropriate tool component based on toolType
    const renderTool = () => {
        // Extract prefilled data from context if available
        const prefilledData = context?.prefilledData || {};

        // Get tool name for error boundary
        const toolName = toolType === 'campaign' ? 'Spec Architect' : 'Visual Vibe Lab';

        const toolComponent = (() => {
            switch (toolType) {
                case 'campaign':
                    return <CampaignGenerator />;
                case 'image':
                    // Pass initialAction if specified in context
                    return <ImageGenLab initialAction={prefilledData.initialAction as 'openLibrary' | undefined} />;
                default:
                    return (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-slate-500 dark:text-[#94A3B8]">
                                Unknown tool type: {toolType}
                            </p>
                        </div>
                    );
            }
        })();

        return (
            <ToolErrorBoundary toolName={toolName}>
                {toolComponent}
            </ToolErrorBoundary>
        );
    };

    // Render tool content
    const toolContent = (
        <>
            {/* Context Instructions Banner (if provided) */}
            {context?.instructions && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-500 p-4 mb-6 rounded-r-lg">
                    <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1">
                        Lesson Instructions
                    </h4>
                    <p className="text-indigo-800 dark:text-indigo-200 text-sm leading-relaxed">
                        {context.instructions}
                    </p>
                    {context.successCriteria && (
                        <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-800">
                            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                                Success Criteria:
                            </p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400">
                                {context.successCriteria}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Tool Component */}
            <div className="flex-1 overflow-auto">
                {renderTool()}
            </div>

            {/* Done Button */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end gap-3">
                <button
                    onClick={() => handleComplete()}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full transition-all hover:shadow-lg"
                >
                    <CheckCircle size={18} />
                    Done - Return to Lesson
                </button>
            </div>
        </>
    );

    // On mobile, render in full-screen modal
    if (isMobile) {
        return (
            <div className="fixed inset-0 z-50 bg-white dark:bg-[#0F172A] flex flex-col">
                {/* Mobile header with exit button */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl sticky top-0 z-10">
                    <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                        {toolType === 'campaign' ? 'Spec Architect' : 'Visual Vibe Lab'}
                    </h2>
                    <button
                        onClick={() => handleComplete()}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors"
                        aria-label="Close tool"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Tool content */}
                <div className="flex-1 overflow-auto p-4">
                    {toolContent}
                </div>
            </div>
        );
    }

    // On desktop, render inline
    return (
        <div className="relative h-full flex flex-col">
            {toolContent}
        </div>
    );
};
