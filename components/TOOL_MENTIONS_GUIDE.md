# Tool Mention Parsing Guide

## Overview

The CourseView component automatically detects tool mentions in lesson content and renders interactive launch buttons. This allows course authors to seamlessly integrate tool access directly within lesson text.

## How It Works

### 1. Tool Mention Syntax

Use square brackets with the tool name in your lesson content:

```markdown
Try the [Campaign Generator] to create your content.
Use the [Image Generator] for visual assets.
Check your work with the [SEO Analyzer].
```

### 2. Supported Tool Mentions

| Mention Syntax | Tool Type | Button Label |
|----------------|-----------|--------------|
| `[Campaign Generator]` | `campaign` | Launch Campaign Generator |
| `[Image Generator]` | `image` | Launch Image Generator |
| `[Visual Vibe Lab]` | `image` | Launch Visual Vibe Lab |
| `[SEO Analyzer]` | `seo` | Launch SEO Analyzer |
| `[Logic Auditor]` | `seo` | Launch Logic Auditor |

### 3. Parsing Behavior

- Tool mentions are **case-insensitive** (`[campaign generator]` works)
- The mention marker is **removed** from the displayed content
- A **ToolLaunchButton** is inserted after the line containing the mention
- The button opens the tool in a modal overlay
- Multiple tool mentions in the same lesson are supported

## Implementation Details

### parseContentWithToolButtons Function

Located in `components/CourseView.tsx`, this function:

1. Splits lesson content by lines
2. Checks each line against `TOOL_PATTERNS` regex
3. Removes the tool mention marker from the text
4. Renders the line content with appropriate formatting
5. Inserts a ToolLaunchButton component after lines with tool mentions

### Tool Patterns Configuration

```typescript
const TOOL_PATTERNS = [
  { pattern: /\[Campaign Generator\]/gi, toolType: 'campaign', label: 'Launch Campaign Generator' },
  { pattern: /\[Image Generator\]/gi, toolType: 'image', label: 'Launch Image Generator' },
  { pattern: /\[Visual Vibe Lab\]/gi, toolType: 'image', label: 'Launch Visual Vibe Lab' },
  { pattern: /\[SEO Analyzer\]/gi, toolType: 'seo', label: 'Launch SEO Analyzer' },
  { pattern: /\[Logic Auditor\]/gi, toolType: 'seo', label: 'Launch Logic Auditor' },
];
```

## Usage Examples

### Example 1: Single Tool Mention

```typescript
{
  id: 'lesson-1',
  title: 'Introduction to Prompting',
  type: 'reading',
  content: `
### Practice Your Skills

Now that you understand the basics, try creating your own prompts.

[Campaign Generator]

Use the tool above to experiment with different prompt styles.
  `
}
```

**Result:** A "Launch Campaign Generator" button appears between the two paragraphs.

### Example 2: Multiple Tool Mentions

```typescript
{
  id: 'lesson-2',
  title: 'Building a Landing Page',
  type: 'lab',
  content: `
### Step 1: Generate Content

First, create your marketing copy. [Campaign Generator]

### Step 2: Create Visuals

Next, generate custom images for your page. [Visual Vibe Lab]

### Step 3: Optimize for SEO

Finally, check your page's SEO performance. [SEO Analyzer]
  `
}
```

**Result:** Three separate tool launch buttons appear, each after its respective section.

### Example 3: Inline Mention

```typescript
{
  id: 'lesson-3',
  title: 'Quick Tips',
  type: 'reading',
  content: `
You can use the [Image Generator] to create placeholder images while you're prototyping.
  `
}
```

**Result:** The tool mention is removed from the text, and a button appears after the paragraph.

## Button Variants

The ToolLaunchButton component supports two variants:

### Inline Variant (Default for Parsed Mentions)

```tsx
<ToolLaunchButton
  toolType="campaign"
  label="Launch Campaign Generator"
  variant="inline"
  lessonId={lessonId}
  courseId={courseId}
/>
```

- Smaller, compact button
- Indigo color scheme
- Fits naturally within content flow

### Prominent Variant

```tsx
<ToolLaunchButton
  toolType="campaign"
  label="Launch Campaign Generator"
  variant="prominent"
  lessonId={lessonId}
  courseId={courseId}
/>
```

- Larger, full-width button
- More visually prominent
- Better for primary CTAs

## Modal Behavior

When a tool launch button is clicked:

1. A full-screen modal opens
2. The EmbeddedTool component renders inside
3. The modal header shows the tool label
4. An X button allows closing the modal
5. Tool completion automatically closes the modal
6. Focus returns to the lesson content

## Context Passing

Tool launch buttons automatically pass:

- `lessonId`: Current lesson identifier
- `courseId`: Current course identifier
- `toolType`: Which tool to render
- `context`: Optional pre-filled data (if specified in lesson)

## Testing

Comprehensive tests are available in:

- `components/ToolLaunchButton.test.tsx` - Button component tests
- `components/CourseView.parseContent.test.tsx` - Parsing logic tests

Run tests with:

```bash
npm test -- ToolLaunchButton.test.tsx
npm test -- CourseView.parseContent.test.tsx
```

## Adding New Tool Mentions

To add support for a new tool:

1. Add a new pattern to `TOOL_PATTERNS` in `CourseView.tsx`:

```typescript
{ pattern: /\[New Tool Name\]/gi, toolType: 'new-tool', label: 'Launch New Tool' }
```

2. Ensure the `toolType` is supported by the EmbeddedTool component

3. Update this documentation with the new mention syntax

## Best Practices

### DO:
- ✅ Place tool mentions at natural break points in content
- ✅ Use tool mentions to encourage hands-on practice
- ✅ Provide context before the tool mention
- ✅ Use multiple tool mentions when appropriate

### DON'T:
- ❌ Place tool mentions mid-sentence
- ❌ Use tool mentions without explaining why
- ❌ Overuse tool mentions (one per section is usually enough)
- ❌ Rely solely on tool mentions (also use requiredTool for lab lessons)

## Troubleshooting

### Tool button not appearing

- Check that the mention syntax exactly matches a pattern (case-insensitive)
- Verify the lesson content is being rendered by CourseView
- Check browser console for errors

### Wrong tool opens

- Verify the tool mention matches the correct pattern
- Check that the toolType mapping is correct in TOOL_PATTERNS

### Button styling issues

- Ensure Tailwind CSS classes are properly configured
- Check that the variant prop is set correctly
- Verify no CSS conflicts with parent components

## Related Components

- `ToolLaunchButton.tsx` - The button component
- `EmbeddedTool.tsx` - The tool wrapper component
- `CourseView.tsx` - The parsing logic
- `types.ts` - Type definitions for ToolContext

## Requirements Validation

This implementation satisfies:

- **Requirement 7.1**: "WHEN a lesson mentions a tool, THE Platform SHALL display an inline button to launch that tool"
- **Property 11**: "Tool Launch Button Presence - For any lesson content that references a tool by name, the rendered interface should include an inline launch button for that tool"
