# Requirements Document

## Introduction

This specification defines the redesign of the VIBE DEV 2026 platform's layout and user experience to optimize for learning effectiveness. The primary goal is to integrate AI tools meaningfully into the course workflow or remove them if they create unnecessary complexity. The redesigned platform should provide a streamlined, cohesive learning experience where every feature serves the educational mission.

## Glossary

- **Platform**: The VIBE DEV 2026 web application
- **Course_View**: The interface displaying course content, lessons, and modules
- **Tool**: An AI-powered utility (Spec Architect, Visual Vibe Lab, Logic Auditor)
- **Dashboard**: The main landing page showing courses and tools
- **Sidebar**: The left navigation panel
- **Lesson**: A single unit of course content (video, reading, or lab)
- **Lab_Lesson**: A lesson type that requires hands-on practice with tools
- **User**: A student using the platform
- **Navigation_Flow**: The path users take through the application
- **Context_Switch**: When a user must leave their current learning context to access a tool
- **Integrated_Tool**: A tool embedded within the course workflow
- **Standalone_Tool**: A tool accessed separately from courses via sidebar or dashboard

## Requirements

### Requirement 1: Analyze Tool Usage Patterns

**User Story:** As a product designer, I want to understand how tools relate to course content, so that I can determine which tools should be integrated, standalone, or removed.

#### Acceptance Criteria

1. WHEN analyzing the Spec Architect tool, THE Platform SHALL identify which lessons or modules could benefit from spec generation
2. WHEN analyzing the Visual Vibe Lab tool, THE Platform SHALL identify which lessons require image generation or visual design skills
3. WHEN analyzing the Logic Auditor tool, THE Platform SHALL identify which lessons involve code review or security concepts
4. WHEN a tool has no clear connection to course content, THE Platform SHALL mark it as a candidate for removal
5. WHEN a tool is referenced by lab lessons, THE Platform SHALL mark it as a candidate for integration

### Requirement 2: Reduce Navigation Complexity

**User Story:** As a student, I want to access relevant tools without leaving my learning context, so that I can complete assignments efficiently without losing focus.

#### Acceptance Criteria

1. WHEN a user is viewing a lab lesson that requires a tool, THE Platform SHALL provide direct access to that tool within the lesson interface
2. WHEN a user navigates to a tool from a lesson, THE Platform SHALL maintain context about which lesson they came from
3. WHEN a user completes a tool-based task, THE Platform SHALL provide a clear path back to their lesson
4. WHEN a tool is not relevant to the current lesson, THE Platform SHALL not display it prominently in the interface
5. IF a user navigates away from a course to access a standalone tool, THEN THE Platform SHALL minimize the number of clicks required

### Requirement 3: Integrate Tools into Course Workflow

**User Story:** As a course designer, I want tools to be embedded in relevant lessons, so that students can practice skills in context rather than switching between disconnected interfaces.

#### Acceptance Criteria

1. WHEN a lesson is marked as type "lab", THE Platform SHALL display an embedded tool interface within the lesson view
2. WHEN a lab lesson requires the Spec Architect, THE Platform SHALL embed the spec generation interface in the lesson content area
3. WHEN a lab lesson requires the Visual Vibe Lab, THE Platform SHALL embed the image generation interface in the lesson content area
4. WHEN a lab lesson requires the Logic Auditor, THE Platform SHALL embed the code audit interface in the lesson content area
5. WHEN a lesson does not require tools, THE Platform SHALL display only the lesson content without tool interfaces

### Requirement 4: Redesign Dashboard Layout

**User Story:** As a student, I want the dashboard to prioritize my active learning path, so that I can quickly resume my studies without distraction.

#### Acceptance Criteria

1. WHEN a user visits the dashboard, THE Platform SHALL display active courses more prominently than standalone tools
2. WHEN displaying tools on the dashboard, THE Platform SHALL only show tools that are relevant to enrolled courses
3. WHEN a user has no courses requiring a specific tool, THE Platform SHALL hide that tool from the dashboard
4. WHEN a user has recently used a tool in a course context, THE Platform SHALL display a "Continue" shortcut on the dashboard
5. THE Platform SHALL organize dashboard content with courses at the top and tools below

### Requirement 5: Simplify Sidebar Navigation

**User Story:** As a student, I want the sidebar to focus on my learning progress, so that I can navigate courses without being overwhelmed by tool options.

#### Acceptance Criteria

1. WHEN a user is not in a lab lesson, THE Platform SHALL minimize or hide the "Directing Tools" section in the sidebar
2. WHEN a user is in a lab lesson, THE Platform SHALL highlight only the relevant tool in the sidebar
3. THE Platform SHALL move the "Directing Tools" section below the main navigation and progress sections
4. WHEN a tool has no associated course content, THE Platform SHALL remove it from the sidebar entirely
5. THE Platform SHALL provide a collapsible "Tools" section that is collapsed by default

### Requirement 6: Remove Unused Tools

**User Story:** As a product manager, I want to identify and remove tools that don't serve the educational mission, so that the platform remains focused and maintainable.

#### Acceptance Criteria

1. WHEN a tool is not referenced by any course lesson, THE Platform SHALL mark it for removal
2. WHEN a tool is marked for removal, THE Platform SHALL remove all navigation links to that tool
3. WHEN a tool is marked for removal, THE Platform SHALL remove its component files from the codebase
4. WHEN a tool is marked for removal, THE Platform SHALL remove its dashboard card
5. WHEN a tool is marked for removal, THE Platform SHALL remove its sidebar navigation item

### Requirement 7: Create Contextual Tool Access

**User Story:** As a student, I want to access tools through clear calls-to-action in lessons, so that I understand when and why to use each tool.

#### Acceptance Criteria

1. WHEN a lesson mentions a tool, THE Platform SHALL display an inline button to launch that tool
2. WHEN a user clicks a tool launch button, THE Platform SHALL open the tool in a modal or embedded panel
3. WHEN a tool is opened from a lesson, THE Platform SHALL pre-populate any relevant context from the lesson
4. WHEN a user closes a tool modal, THE Platform SHALL return focus to the lesson content
5. THE Platform SHALL display tool usage instructions within the lesson content, not in a separate interface

### Requirement 8: Optimize Mobile Experience

**User Story:** As a mobile user, I want the platform to work efficiently on small screens, so that I can learn on any device without frustration.

#### Acceptance Criteria

1. WHEN viewing on mobile, THE Platform SHALL hide standalone tool navigation by default
2. WHEN a lab lesson requires a tool on mobile, THE Platform SHALL display the tool in a full-screen modal
3. WHEN navigating on mobile, THE Platform SHALL prioritize course content over tool access
4. WHEN the mobile menu is open, THE Platform SHALL show courses before tools
5. THE Platform SHALL ensure tool interfaces are responsive and usable on mobile devices

### Requirement 9: Maintain Tool Functionality for Relevant Use Cases

**User Story:** As a student, I want tools that are integrated into courses to work seamlessly, so that I can complete assignments without technical issues.

#### Acceptance Criteria

1. WHEN a tool is integrated into a lesson, THE Platform SHALL preserve all original tool functionality
2. WHEN a tool generates output, THE Platform SHALL allow users to save or export results
3. WHEN a tool requires API keys or configuration, THE Platform SHALL handle errors gracefully
4. WHEN a tool is embedded in a lesson, THE Platform SHALL maintain the same visual quality as the standalone version
5. THE Platform SHALL ensure integrated tools load within 3 seconds on standard connections

### Requirement 10: Provide Clear Visual Hierarchy

**User Story:** As a student, I want the interface to guide my attention to the most important elements, so that I can focus on learning without cognitive overload.

#### Acceptance Criteria

1. WHEN viewing any page, THE Platform SHALL use visual weight to emphasize primary actions over secondary options
2. WHEN displaying courses and tools together, THE Platform SHALL make courses visually more prominent
3. WHEN a user is in a course, THE Platform SHALL de-emphasize navigation elements that lead away from learning
4. THE Platform SHALL use consistent spacing and typography to create clear content sections
5. THE Platform SHALL limit the number of interactive elements visible at once to reduce decision fatigue
