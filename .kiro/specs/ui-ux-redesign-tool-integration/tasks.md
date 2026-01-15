# Implementation Plan: UI/UX Redesign and Tool Integration

## Overview

This implementation plan transforms the VIBE DEV 2026 platform from a tool-centric to a learning-centric interface. The work is organized into phases that progressively integrate tools into the course workflow while maintaining system stability. Each task builds on previous work, ensuring the application remains functional throughout the redesign.

## Tasks

- [x] 1. Extend data models for tool integration
  - Update the Lesson type to include requiredTool and toolContext fields
  - Update the ViewState type to remove standalone tool views
  - Create ToolUsage interface for tracking tool usage in context
  - Update course data files to mark which lessons require tools
  - _Requirements: 2.1, 3.1, 7.3_

- [ ]* 1.1 Write property test for lesson data model
  - **Property 1: Tool Embedding in Lab Lessons**
  - **Validates: Requirements 2.1, 3.1**

- [-] 2. Create EmbeddedTool wrapper component
  - [x] 2.1 Implement EmbeddedTool component that wraps existing tool components
    - Accept toolType, context, onComplete, lessonId, and courseId props
    - Render the appropriate tool component based on toolType
    - Inject lesson context into the tool component
    - Add "Done" button to return to lesson
    - Track tool usage for analytics
    - _Requirements: 3.1, 7.3, 9.1_

  - [ ]* 2.2 Write property test for tool context injection
    - **Property 13: Tool Context Pre-population**
    - **Validates: Requirements 7.3**

  - [ ]* 2.3 Write property test for functionality preservation
    - **Property 18: Tool Functionality Preservation**
    - **Validates: Requirements 9.1**

- [x] 3. Create ToolLaunchButton component
  - Implement button component that triggers tool modal/panel
  - Support inline and prominent variants
  - Pass toolContext to opened tool
  - _Requirements: 7.1, 7.2_

- [ ]* 3.1 Write property test for tool launch button
  - **Property 11: Tool Launch Button Presence**
  - **Property 12: Tool Modal Opening**
  - **Validates: Requirements 7.1, 7.2**

- [x] 4. Enhance CourseView component for tool embedding
  - [x] 4.1 Update CourseView to conditionally render EmbeddedTool
    - Check if activeLesson has requiredTool field
    - Render EmbeddedTool component when requiredTool is present
    - Pass toolContext from lesson to EmbeddedTool
    - Replace generic "Go to AI Tools" message with embedded tool
    - _Requirements: 2.1, 3.1, 3.5_

  - [ ]* 4.2 Write property test for tool embedding logic
    - **Property 1: Tool Embedding in Lab Lessons**
    - **Property 4: Tool Hiding When Not Relevant**
    - **Validates: Requirements 2.1, 3.1, 3.5**

  - [x] 4.3 Add tool launch buttons for inline tool mentions
    - Parse lesson content for tool references
    - Insert ToolLaunchButton components at appropriate locations
    - _Requirements: 7.1_

  - [x] 4.4 Implement context preservation during tool navigation
    - Store current lesson ID and course ID when tool is opened
    - Pass context to tool component
    - _Requirements: 2.2, 7.3_

  - [ ]* 4.5 Write property test for context preservation
    - **Property 2: Context Preservation During Tool Navigation**
    - **Validates: Requirements 2.2**

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Redesign Dashboard component
  - [x] 6.1 Reorder dashboard sections
    - Move "Active Courses" section to top (currently below stats)
    - Move "Direction Suite" (tools) section to bottom
    - Increase visual prominence of course cards
    - _Requirements: 4.1, 4.5, 10.2_

  - [ ]* 6.2 Write property test for dashboard layout
    - **Property 6: Dashboard Layout Priority**
    - **Validates: Requirements 4.1, 4.5, 10.2**

  - [-] 6.3 Implement tool filtering based on enrolled courses
    - Extract tools used in enrolled courses
    - Filter dashboard tool cards to only show relevant tools
    - Hide tools section entirely if no tools are used in courses
    - _Requirements: 4.2, 4.3_

  - [ ]* 6.4 Write property test for tool filtering
    - **Property 5: Dashboard Tool Filtering**
    - **Validates: Requirements 4.2, 4.3**

  - [x] 6.5 Add recent tool usage shortcuts
    - Query recent ToolUsage records for current user
    - Display "Continue" shortcuts for recent tool usage
    - Link shortcuts back to lesson context
    - _Requirements: 4.4_

  - [ ]* 6.6 Write property test for usage shortcuts
    - **Property 7: Recent Tool Usage Shortcuts**
    - **Validates: Requirements 4.4**

- [ ] 7. Redesign Sidebar component
  - [x] 7.1 Reorder sidebar sections
    - Move "Directing Tools" section below progress indicators
    - Ensure main navigation and progress appear first
    - _Requirements: 5.3_

  - [ ] 7.2 Write property test for sidebar ordering

    - **Property 10: Sidebar Section Ordering**
    - **Validates: Requirements 5.3**

  - [x] 7.3 Implement collapsible tools section
    - Add collapse/expand functionality to tools section
    - Set default state to collapsed
    - Persist collapse state in localStorage
    - _Requirements: 5.5_

  - [x] 7.4 Implement context-aware tool visibility
    - Accept currentLesson prop in Sidebar
    - Hide tools section when not in a lab lesson
    - Highlight only relevant tool when in lab lesson
    - _Requirements: 5.1, 5.2_

  - [ ]* 7.5 Write property test for tool visibility
    - **Property 8: Sidebar Tool Section Visibility**
    - **Property 9: Sidebar Tool Highlighting**
    - **Validates: Requirements 5.1, 5.2**

  - [x] 7.6 Remove tools with no course associations
    - Identify tools not used in any course
    - Remove navigation items for unused tools
    - _Requirements: 5.4_

  - [ ]* 7.7 Write property test for unused tool removal
    - **Property 11: Tool Launch Button Presence**
    - **Validates: Requirements 5.4**

- [-] 8. Implement mobile responsive behavior
  - [x] 8.1 Hide standalone tool navigation on mobile
    - Add media query to hide tools section on viewports < 768px
    - Show tools only when in relevant lab lesson
    - _Requirements: 8.1_

  - [ ]* 8.2 Write property test for mobile tool hiding
    - **Property 15: Mobile Tool Navigation Hiding**
    - **Validates: Requirements 8.1**

  - [x] 8.3 Implement full-screen tool modals on mobile
    - Detect mobile viewport in EmbeddedTool component
    - Render tool in full-screen modal on mobile
    - Add exit button at top of modal
    - _Requirements: 8.2_

  - [ ]* 8.4 Write property test for mobile tool display
    - **Property 16: Mobile Tool Modal Display**
    - **Validates: Requirements 8.2**

  - [x] 8.5 Prioritize course navigation on mobile
    - Reorder mobile menu to show courses before tools
    - Ensure course links appear first in DOM order
    - _Requirements: 8.3, 8.4_

  - [ ]* 8.6 Write property test for mobile navigation priority
    - **Property 17: Mobile Navigation Priority**
    - **Validates: Requirements 8.3, 8.4**

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement error handling and edge cases
  - [x] 10.1 Create ToolErrorBoundary component
    - Catch tool loading errors
    - Display user-friendly error message
    - Provide retry functionality
    - Allow user to continue with lesson
    - _Requirements: 9.3_

  - [ ]* 10.2 Write property test for error handling
    - **Property 20: Tool Error Handling**
    - **Validates: Requirements 9.3**

  - [x] 10.3 Implement tool state persistence
    - Save tool state to localStorage on navigation away
    - Restore state when user returns within 24 hours
    - Clear old saved states
    - _Requirements: 2.3_

  - [x] 10.4 Implement focus management
    - Return focus to lesson content when tool modal closes
    - Ensure keyboard navigation works correctly
    - _Requirements: 7.4_

  - [ ]* 10.5 Write property test for focus return
    - **Property 14: Focus Return After Tool Close**
    - **Validates: Requirements 7.4**

  - [x] 10.6 Add save/export functionality to tools
    - Add export buttons to tool output areas
    - Implement download functionality for generated content
    - _Requirements: 9.2_

  - [ ]* 10.7 Write property test for tool output export
    - **Property 19: Tool Output Export**
    - **Validates: Requirements 9.2**

- [x] 11. Update App.tsx navigation logic
  - [x] 11.1 Remove standalone tool routes
    - Remove tool cases from ViewState type
    - Remove tool rendering in renderContent function
    - Update navigation handlers to prevent direct tool access
    - _Requirements: 6.2, 6.4, 6.5_

  - [x] 11.2 Pass lesson context to Sidebar
    - Extract current lesson from CourseView state
    - Pass currentLesson prop to Sidebar component
    - Update Sidebar to use lesson context for tool visibility
    - _Requirements: 5.1, 5.2_

- [x] 12. Implement visual hierarchy improvements
  - [x] 12.1 Update styling for primary vs secondary actions
    - Increase size and prominence of primary actions
    - Reduce visual weight of secondary actions
    - Ensure consistent button hierarchy across pages
    - _Requirements: 10.1_

  - [ ]* 12.2 Write property test for visual hierarchy
    - **Property 21: Interactive Element Limit**
    - **Validates: Requirements 10.5**

  - [x] 12.3 De-emphasize navigation when in course
    - Reduce opacity or size of sidebar when in course view
    - Add subtle visual cues to keep focus on content
    - _Requirements: 10.3_

  - [x] 12.4 Ensure consistent spacing and typography
    - Audit spacing values across components
    - Standardize typography scale
    - Apply consistent section separators
    - _Requirements: 10.4_

- [x] 13. Update course data with tool requirements
  - [x] 13.1 Identify lessons that should use tools
    - Review course content to find lab lessons
    - Determine which tool each lab lesson requires
    - Add requiredTool field to appropriate lessons
    - _Requirements: 1.5, 3.1_

  - [x] 13.2 Add toolContext to lessons
    - Write instructions for each tool-based lesson
    - Add pre-filled data where appropriate
    - Define success criteria for tool tasks
    - _Requirements: 7.3, 7.5_

- [x] 14. Final integration and cleanup
  - [x] 14.1 Remove unused tool files
    - Identify tools not used in any course
    - Remove component files for unused tools
    - Remove service functions for unused tools
    - Update imports across codebase
    - _Requirements: 6.3_

  - [ ] 14.2 Update navigation tests
    - Update existing navigation tests for new flow
    - Remove tests for standalone tool routes
    - Add tests for embedded tool navigation
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 14.3 Perform accessibility audit
    - Test keyboard navigation through embedded tools
    - Verify screen reader announcements
    - Check color contrast in tool interfaces
    - Fix any accessibility issues found
    - _Requirements: 7.4, 9.1_

  - [ ] 14.4 Run performance tests
    - Measure tool load times
    - Check for layout shifts
    - Verify memory usage is stable
    - Optimize if metrics exceed thresholds
    - _Requirements: 9.5_

- [ ] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation maintains backward compatibility until all pieces are in place
- Tool components are wrapped rather than rewritten to preserve functionality
