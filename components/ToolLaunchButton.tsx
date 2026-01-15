import React, { useState } from 'react';
import { Wrench, X } from 'lucide-react';
import { EmbeddedTool } from './EmbeddedTool';
import { ToolContext } from '../types';
import { storeNavigationContext, getNavigationContext, clearNavigationContext } from '../utils/toolContext';

interface ToolLaunchButtonProps {
    toolType: 'campaign' | 'image';
    label: string;
    context?: ToolContext;
    variant?: 'inline' | 'prominent';
    lessonId: string;
    courseId: string;
}

export const ToolLaunchButton: React.FC<ToolLaunchButtonProps> = ({
    toolType,
    label,
    context,
    variant = 'prominent',
    lessonId,
    courseId
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenTool = () => {
        // Store navigation context before opening tool using utility function
        storeNavigationContext(lessonId, courseId, toolType);
        console.log('Tool navigation context stored:', { lessonId, courseId, toolType });

        setIsModalOpen(true);
    };

    const handleCloseTool = () => {
        // Retrieve stored context to verify it was preserved
        const storedContext = getNavigationContext();
        if (storedContext) {
            console.log('Returning to lesson context:', storedContext);
        }

        setIsModalOpen(false);

        // Clear navigation context after closing
        clearNavigationContext();
    };

    const handleComplete = (result?: any) => {
        // Retrieve stored context to verify it was preserved
        const storedContext = getNavigationContext();
        if (storedContext) {
            console.log('Tool completed, returning to lesson context:', storedContext);
        }

        // Tool completed, close modal
        setIsModalOpen(false);

        // Clear navigation context after completion
        clearNavigationContext();
    };

    // Render button based on variant
    const renderButton = () => {
        if (variant === 'inline') {
            return (
                <button
                    onClick={handleOpenTool}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors border border-indigo-200 dark:border-indigo-800"
                >
                    <Wrench size={14} />
                    {label}
                </button>
            );
        }

        // Prominent variant
        return (
            <button
                onClick={handleOpenTool}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-all hover:shadow-lg w-full sm:w-auto"
            >
                <Wrench size={18} />
                {label}
            </button>
        );
    };

    return (
        <>
            {renderButton()}

            {/* Tool Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full h-full sm:h-[90vh] sm:max-w-6xl sm:rounded-2xl bg-white dark:bg-[#0F172A] shadow-2xl overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {label}
                            </h2>
                            <button
                                onClick={handleCloseTool}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                                aria-label="Close tool"
                            >
                                <X size={20} className="text-slate-600 dark:text-slate-400" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-auto p-6">
                            <EmbeddedTool
                                toolType={toolType}
                                context={context}
                                onComplete={handleComplete}
                                lessonId={lessonId}
                                courseId={courseId}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
