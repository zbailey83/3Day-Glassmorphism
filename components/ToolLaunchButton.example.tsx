/**
 * ToolLaunchButton Component Usage Examples
 * 
 * This file demonstrates how to use the ToolLaunchButton component
 * in different scenarios within the VIBE DEV 2026 platform.
 */

import React from 'react';
import { ToolLaunchButton } from './ToolLaunchButton';

// Example 1: Prominent variant (default) - Use for primary CTAs in lessons
export const ProminentExample = () => {
    return (
        <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Lab Exercise: Create a Campaign</h3>
            <p className="mb-6">
                Now it's time to put your skills to practice. Use the Campaign Generator
                to create a marketing campaign for your project.
            </p>

            <ToolLaunchButton
                toolType="campaign"
                label="Launch Campaign Generator"
                lessonId="lesson-campaign-basics"
                courseId="course-marketing-101"
                context={{
                    instructions: "Create a campaign for a new mobile app launch",
                    successCriteria: "Generate at least 3 campaign ideas with target audiences"
                }}
            />
        </div>
    );
};

// Example 2: Inline variant - Use for tool mentions within lesson content
export const InlineExample = () => {
    return (
        <div className="p-6">
            <p className="mb-4">
                Visual design is crucial for user engagement. You can use the{' '}
                <ToolLaunchButton
                    toolType="image"
                    label="Visual Vibe Lab"
                    variant="inline"
                    lessonId="lesson-design-principles"
                    courseId="course-ui-design"
                    context={{
                        instructions: "Generate a hero image for your landing page",
                        prefilledData: {
                            initialAction: 'openLibrary'
                        }
                    }}
                />
                {' '}to generate mockups and visual assets for your project.
            </p>
        </div>
    );
};

// Example 3: Multiple tools in a lesson
export const MultipleToolsExample = () => {
    return (
        <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Lab: Complete Project Setup</h3>

            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold mb-2">Step 1: Plan Your Project</h4>
                    <ToolLaunchButton
                        toolType="campaign"
                        label="Create Project Spec"
                        variant="prominent"
                        lessonId="lesson-project-setup"
                        courseId="course-full-stack"
                    />
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Step 2: Design Visual Assets</h4>
                    <ToolLaunchButton
                        toolType="image"
                        label="Generate Images"
                        variant="prominent"
                        lessonId="lesson-project-setup"
                        courseId="course-full-stack"
                    />
                </div>

                <div>
                    <h4 className="font-semibold mb-2">Step 3: Optimize for SEO</h4>
                    <ToolLaunchButton
                        toolType="seo"
                        label="Analyze SEO"
                        variant="prominent"
                        lessonId="lesson-project-setup"
                        courseId="course-full-stack"
                    />
                </div>
            </div>
        </div>
    );
};

// Example 4: With pre-filled context data
export const PrefilledContextExample = () => {
    return (
        <div className="p-6">
            <h3 className="text-lg font-bold mb-4">Lab: Audit Your Code</h3>
            <p className="mb-6">
                Review the security of your authentication implementation using the Logic Auditor.
            </p>

            <ToolLaunchButton
                toolType="seo"
                label="Run Security Audit"
                lessonId="lesson-security-basics"
                courseId="course-web-security"
                context={{
                    instructions: "Analyze the authentication code for security vulnerabilities",
                    prefilledData: {
                        codeSnippet: "// Your authentication code here",
                        focusArea: "security"
                    },
                    successCriteria: "Identify at least 3 potential security issues"
                }}
            />
        </div>
    );
};
