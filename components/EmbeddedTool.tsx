import React, { useEffect, useState } from 'react';
import { CampaignGenerator } from './tools/CampaignGenerator';
import { ImageGenLab } from './tools/ImageGenLab';
import { SeoAnalyzer } from './tools/SeoAnalyzer';
import { ToolContext, ToolUsage } from '../types';
import { CheckCircle } from 'lucide-react';
import { storeToolContext, clearToolContext } from '../utils/toolContext';

interface EmbeddedToolProps {
    toolType: 'campaign' | 'image' | 'seo';
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

        // Call parent completion handler if provided
        if (onComplete) {
            onComplete(result);
        }
    };

    // Render the appropriate tool component based on toolType
    const renderTool = () => {
        // Extract prefilled data from context if available
        const prefilledData = context?.prefilledData || {};

        switch (toolType) {
            case 'campaign':
                return <CampaignGenerator />;
            case 'image':
                // Pass initialAction if specified in context
                return <ImageGenLab initialAction={prefilledData.initialAction as 'openLibrary' | undefined} />;
            case 'seo':
                return <SeoAnalyzer />;
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500 dark:text-[#94A3B8]">
                            Unknown tool type: {toolType}
                        </p>
                    </div>
                );
        }
    };

    return (
        <div className="relative h-full flex flex-col">
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
        </div>
    );
};
