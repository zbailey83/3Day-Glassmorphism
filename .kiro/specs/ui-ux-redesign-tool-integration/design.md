# Design Document: UI/UX Redesign and Tool Integration

## Overview

This design transforms the VIBE DEV 2026 platform from a tool-centric interface to a learning-centric experience. The redesign addresses the core problem: AI tools are currently presented as standalone features disconnected from the educational workflow, creating unnecessary navigation complexity and cognitive load.

The solution involves three key strategies:
1. **Contextual Integration**: Embed tools directly into lab lessons where they're needed
2. **Progressive Disclosure**: Hide tool navigation until relevant to the user's current context
3. **Ruthless Simplification**: Remove or consolidate tools that don't directly support course objectives

This approach reduces context switching, clarifies the learning path, and ensures every interface element serves the educational mission.

## Architecture

### Component Hierarchy

```
App
├── Sidebar (Redesigned)
│   ├── Course Navigation (Primary)
│   ├── Progress Indicators
│   └── Tools Section (Collapsible, Context-Aware)
├── Dashboard (Redesigned)
│   ├── Active Courses (Primary Focus)
│   ├── Learning Progress
│   └── Contextual Tool Shortcuts (Secondary)
└── CourseView (Enhanced)
    ├── Lesson Content
    ├── Embedded Tool Interface (Conditional)
    └── Tool Launch Buttons (Contextual)
```

### Navigation Flow Changes

**Current Flow (Problematic):**
```
Dashboard → Sidebar → Tool (Standalone) → Back to Course (Lost Context)
```

**New Flow (Optimized):**
```
Dashboard → Course → Lesson → Embedded Tool (In Context) → Continue Lesson
```

### Tool Integration Strategy

| Tool | Integration Approach | Rationale |
|------|---------------------|-----------|
| Spec Architect | Embed in relevant lab lessons | Directly supports project planning lessons |
| Visual Vibe Lab | Embed in design/UI lessons | Teaches prompt engineering for visual content |
| Logic Auditor | Embed in code review lessons | Supports security and quality lessons |

## Components and Interfaces

### 1. Redesigned Sidebar Component

**Purpose**: Provide focused navigation that adapts to user context

**Interface**:
```typescript
interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onCloseMobile?: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  currentLesson?: Lesson; // NEW: Context awareness
  showTools?: boolean;     // NEW: Conditional tool display
}
```

**Key Changes**:
- Move "Directing Tools" section below progress indicators
- Make tools section collapsible (collapsed by default)
- Only show tools relevant to current lesson when in course view
- Hide tools section entirely when not in a lab lesson

### 2. Enhanced CourseView Component

**Purpose**: Provide seamless tool integration within lessons

**Interface**:
```typescript
interface CourseViewProps {
  course: Course;
  initialModuleId?: string;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'lab';
  content: string;
  duration: string;
  quiz?: QuizQuestion[];
  requiredTool?: 'spec-architect' | 'visual-lab' | 'logic-auditor'; // NEW
  toolContext?: ToolContext; // NEW: Pre-populate tool with lesson data
}

interface ToolContext {
  instructions?: string;
  prefilledData?: Record<string, any>;
  successCriteria?: string;
}
```

**Key Changes**:
- Add `requiredTool` field to Lesson type
- Add `toolContext` to pass lesson-specific data to tools
- Render embedded tool interface when `requiredTool` is present
- Replace generic "Go to AI Tools" message with embedded tool

### 3. Redesigned Dashboard Component

**Purpose**: Prioritize active learning over tool exploration

**Interface**:
```typescript
interface DashboardProps {
  courses: Course[];
  onNavigate: (view: ViewState) => void;
  recentToolUsage?: ToolUsageRecord[]; // NEW: Track tool usage in context
}

interface ToolUsageRecord {
  toolName: string;
  lessonId: string;
  courseId: string;
  timestamp: Date;
}
```

**Layout Changes**:
1. **Hero Section**: User greeting + level progress (unchanged)
2. **Active Courses** (moved to top, expanded): Course cards with continue buttons
3. **Recent Activity**: Show recent lessons and tool usage in context
4. **Tools Section** (moved to bottom, condensed): Only show tools used in enrolled courses

### 4. Embedded Tool Wrapper Component

**Purpose**: Provide consistent interface for tools embedded in lessons

**New Component**:
```typescript
interface EmbeddedToolProps {
  toolType: 'spec-architect' | 'visual-lab' | 'logic-auditor';
  context?: ToolContext;
  onComplete?: (result: any) => void;
  lessonId: string;
  courseId: string;
}

const EmbeddedTool: React.FC<EmbeddedToolProps> = ({
  toolType,
  context,
  onComplete,
  lessonId,
  courseId
}) => {
  // Render appropriate tool with lesson context
  // Track usage for analytics
  // Handle completion and return to lesson
};
```

**Features**:
- Wraps existing tool components
- Injects lesson context into tool
- Tracks completion for progress
- Provides "Done" button to return to lesson
- Maintains scroll position in lesson

### 5. Tool Launch Button Component

**Purpose**: Provide clear call-to-action for tool usage in lessons

**New Component**:
```typescript
interface ToolLaunchButtonProps {
  toolType: 'spec-architect' | 'visual-lab' | 'logic-auditor';
  label: string;
  context?: ToolContext;
  variant?: 'inline' | 'prominent';
}

const ToolLaunchButton: React.FC<ToolLaunchButtonProps> = ({
  toolType,
  label,
  context,
  variant = 'prominent'
}) => {
  // Render styled button that opens embedded tool
  // Different styles for inline mentions vs. primary CTAs
};
```

## Data Models

### Extended Lesson Model

```typescript
interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'lab';
  content: string;
  duration: string;
  quiz?: QuizQuestion[];
  
  // NEW FIELDS for tool integration
  requiredTool?: 'spec-architect' | 'visual-lab' | 'logic-auditor';
  toolContext?: {
    instructions?: string;
    prefilledData?: Record<string, any>;
    successCriteria?: string;
  };
  toolEmbedded?: boolean; // If true, show tool inline; if false, show launch button
}
```

### Tool Usage Tracking Model

```typescript
interface ToolUsage {
  userId: string;
  toolType: string;
  lessonId: string;
  courseId: string;
  timestamp: Date;
  completed: boolean;
  result?: any; // Tool-specific output
}
```

### Navigation State Model

```typescript
type ViewState =
  | { type: 'dashboard' }
  | { type: 'course'; courseId: string; moduleId?: string }
  | { type: 'profile' }
  // REMOVED: Standalone tool views
  // Tools are now only accessible through courses
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Tool Embedding in Lab Lessons

*For any* lesson with type="lab" and a requiredTool specified, the rendered lesson interface should contain the corresponding embedded tool component.

**Validates: Requirements 2.1, 3.1, 3.2, 3.3, 3.4**

### Property 2: Context Preservation During Tool Navigation

*For any* navigation from a lesson to a tool, the system should preserve the originating lesson ID and course ID in the navigation state.

**Validates: Requirements 2.2**

### Property 3: Return Navigation from Tools

*For any* tool completion or close action, the interface should provide a navigation element that returns the user to their originating lesson.

**Validates: Requirements 2.3**

### Property 4: Tool Hiding When Not Relevant

*For any* lesson without a requiredTool field, the rendered interface should not display tool components prominently (tools section should be hidden or minimized).

**Validates: Requirements 2.4, 3.5**

### Property 5: Dashboard Tool Filtering

*For any* user with enrolled courses, the tools displayed on the dashboard should only include tools that are referenced by lessons in those enrolled courses.

**Validates: Requirements 4.2, 4.3**

### Property 6: Dashboard Layout Priority

*For any* dashboard render, course elements should appear before tool elements in the DOM order and have greater visual prominence (larger size or higher position).

**Validates: Requirements 4.1, 4.5, 10.2**

### Property 7: Recent Tool Usage Shortcuts

*For any* tool usage record within the last 7 days, the dashboard should display a "Continue" shortcut linking back to the lesson context.

**Validates: Requirements 4.4**

### Property 8: Sidebar Tool Section Visibility

*For any* view state where the current lesson is not a lab lesson, the sidebar's "Directing Tools" section should be collapsed or hidden.

**Validates: Requirements 5.1**

### Property 9: Sidebar Tool Highlighting

*For any* lab lesson with a requiredTool, only that specific tool should be highlighted in the sidebar's tools section.

**Validates: Requirements 5.2**

### Property 10: Sidebar Section Ordering

*For any* sidebar render, the "Directing Tools" section should appear after the main navigation and progress sections in the DOM order.

**Validates: Requirements 5.3**

### Property 11: Tool Launch Button Presence

*For any* lesson content that references a tool by name, the rendered interface should include an inline launch button for that tool.

**Validates: Requirements 7.1**

### Property 12: Tool Modal Opening

*For any* tool launch button click event, the system should open the tool in a modal or embedded panel within 500ms.

**Validates: Requirements 7.2**

### Property 13: Tool Context Pre-population

*For any* tool opened from a lesson with toolContext data, the tool should receive and display that context data in its initial state.

**Validates: Requirements 7.3**

### Property 14: Focus Return After Tool Close

*For any* tool modal close event, the browser focus should return to the lesson content area.

**Validates: Requirements 7.4**

### Property 15: Mobile Tool Navigation Hiding

*For any* viewport width below 768px, standalone tool navigation links should be hidden by default in the sidebar.

**Validates: Requirements 8.1**

### Property 16: Mobile Tool Modal Display

*For any* lab lesson rendered at viewport width below 768px, the embedded tool should be displayed in a full-screen modal.

**Validates: Requirements 8.2**

### Property 17: Mobile Navigation Priority

*For any* mobile menu render (viewport width below 768px), course navigation links should appear before tool navigation links in the DOM order.

**Validates: Requirements 8.3, 8.4**

### Property 18: Tool Functionality Preservation

*For any* tool feature available in standalone mode, the same feature should be available when the tool is embedded in a lesson.

**Validates: Requirements 9.1**

### Property 19: Tool Output Export

*For any* tool that generates output, the interface should provide save or export functionality for that output.

**Validates: Requirements 9.2**

### Property 20: Tool Error Handling

*For any* tool with missing or invalid API configuration, the system should display a user-friendly error message rather than crashing or showing a blank screen.

**Validates: Requirements 9.3**

### Property 21: Interactive Element Limit

*For any* page render, the number of primary interactive elements (buttons, links with prominent styling) should not exceed 12 to reduce cognitive load.

**Validates: Requirements 10.5**

## Error Handling

### Tool Loading Failures

**Scenario**: Tool component fails to load due to network issues or missing dependencies

**Handling**:
- Display error boundary with friendly message
- Provide "Retry" button
- Log error details for debugging
- Allow user to continue with lesson content

**Implementation**:
```typescript
class ToolErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="tool-error">
          <AlertTriangle />
          <h3>Tool temporarily unavailable</h3>
          <p>You can continue with the lesson and try again later.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Missing Tool Context

**Scenario**: Lesson specifies requiredTool but doesn't provide toolContext

**Handling**:
- Tool should still render with default/empty state
- Display placeholder instructions
- Log warning for content team to fix

### API Key Missing

**Scenario**: Tool requires API key (e.g., Gemini API) but key is not configured

**Handling**:
- Display clear error message explaining the issue
- Provide link to configuration instructions
- Don't block lesson content
- Track error for admin notification

### Mobile Viewport Edge Cases

**Scenario**: Tool interface doesn't fit in mobile viewport

**Handling**:
- Force full-screen modal on mobile
- Add scroll if content exceeds viewport
- Provide "Exit Tool" button at top
- Save tool state if user exits

### Tool State Persistence

**Scenario**: User navigates away from tool before completing task

**Handling**:
- Save tool state to localStorage
- Restore state if user returns within 24 hours
- Show "Resume" option if saved state exists
- Clear saved state after 24 hours

## Testing Strategy

### Unit Testing

**Focus Areas**:
- Component rendering logic (tool embedding, conditional display)
- State management (context preservation, navigation)
- Error boundaries and fallback UI
- Responsive behavior at different viewport sizes

**Example Unit Tests**:
```typescript
describe('CourseView Tool Embedding', () => {
  it('should embed tool when lesson has requiredTool', () => {
    const lesson = { type: 'lab', requiredTool: 'spec-architect' };
    const { getByTestId } = render(<CourseView lesson={lesson} />);
    expect(getByTestId('embedded-tool-spec-architect')).toBeInTheDocument();
  });
  
  it('should not show tool when lesson has no requiredTool', () => {
    const lesson = { type: 'reading' };
    const { queryByTestId } = render(<CourseView lesson={lesson} />);
    expect(queryByTestId('embedded-tool')).not.toBeInTheDocument();
  });
});
```

### Property-Based Testing

**Configuration**:
- Minimum 100 iterations per property test
- Use fast-check library for TypeScript
- Generate random lessons, courses, and user states
- Each test references its design property number

**Example Property Tests**:
```typescript
import fc from 'fast-check';

// Feature: ui-ux-redesign-tool-integration, Property 1: Tool Embedding in Lab Lessons
test('Property 1: Lab lessons with requiredTool embed the tool', () => {
  fc.assert(
    fc.property(
      fc.record({
        type: fc.constant('lab'),
        requiredTool: fc.constantFrom('spec-architect', 'visual-lab', 'logic-auditor'),
        title: fc.string(),
        content: fc.string()
      }),
      (lesson) => {
        const { container } = render(<CourseView lesson={lesson} />);
        const toolElement = container.querySelector(`[data-tool="${lesson.requiredTool}"]`);
        expect(toolElement).toBeTruthy();
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: ui-ux-redesign-tool-integration, Property 5: Dashboard Tool Filtering
test('Property 5: Dashboard only shows tools from enrolled courses', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({
        id: fc.string(),
        lessons: fc.array(fc.record({
          requiredTool: fc.option(fc.constantFrom('spec-architect', 'visual-lab', 'logic-auditor'))
        }))
      })),
      (enrolledCourses) => {
        const { container } = render(<Dashboard courses={enrolledCourses} />);
        
        // Extract tools used in courses
        const usedTools = new Set(
          enrolledCourses.flatMap(c => 
            c.lessons.map(l => l.requiredTool).filter(Boolean)
          )
        );
        
        // Check that only used tools are displayed
        const displayedTools = container.querySelectorAll('[data-tool-card]');
        displayedTools.forEach(toolCard => {
          const toolName = toolCard.getAttribute('data-tool-card');
          expect(usedTools.has(toolName)).toBe(true);
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

**Focus Areas**:
- Full navigation flows (dashboard → course → lesson → tool → back)
- Tool state persistence across navigation
- Mobile responsive behavior
- Error recovery flows

**Example Integration Tests**:
```typescript
describe('Tool Integration Flow', () => {
  it('should maintain context through full tool usage flow', async () => {
    const { user } = renderApp();
    
    // Navigate to course
    await user.click(screen.getByText('Course 1'));
    
    // Navigate to lab lesson
    await user.click(screen.getByText('Lab: Build a Spec'));
    
    // Verify tool is embedded
    expect(screen.getByTestId('embedded-tool')).toBeInTheDocument();
    
    // Use tool
    await user.type(screen.getByPlaceholderText('Enter spec'), 'Test spec');
    await user.click(screen.getByText('Generate'));
    
    // Verify context is preserved
    expect(screen.getByText('Lab: Build a Spec')).toBeInTheDocument();
  });
});
```

### Visual Regression Testing

**Focus Areas**:
- Dashboard layout changes
- Sidebar tool section positioning
- Embedded tool styling
- Mobile responsive layouts

**Tools**: Percy, Chromatic, or similar visual testing platform

### Accessibility Testing

**Focus Areas**:
- Keyboard navigation through embedded tools
- Screen reader announcements for tool state changes
- Focus management when opening/closing tool modals
- Color contrast in tool interfaces

**Tools**: axe-core, WAVE, manual keyboard testing

### Performance Testing

**Metrics**:
- Tool load time < 3 seconds
- Page transition time < 500ms
- No layout shift when embedding tools
- Memory usage stable during tool usage

**Tools**: Lighthouse, WebPageTest, Chrome DevTools Performance tab
