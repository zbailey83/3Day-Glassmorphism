
import { Course } from './types';

export const GEMINI_TEXT_MODEL = 'gemini-3-pro-preview';
export const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

export const COURSES: Course[] = [
  {
    id: 'vibe-coding-2026',
    title: 'The 2026 Vibe Coding Masterclass',
    subtitle: 'Ship Production-Grade Software Without Writing Syntax',
    description: 'Master the art of directing AI agents (Cursor, Claude, Gemini) to build, deploy, and scale web applications using the Vibe methodology.',
    tags: ['AI Engineering', 'Vibe Coding', 'No-Code/Directing'],
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    modules: [
      {
        id: 'm1-foundation',
        title: 'The Foundation & The Stack',
        duration: '25 min',
        type: 'reading',
        content: `
### The Vibe Shift
Moving from manual syntax entry to high-level systems architecture and direction. Understanding the role of the "AI Coding Agent" vs. the "Human Director."

### The 4-Pillar Stack
1. **Cursor:** The AI-native editor (The Engine).
2. **Supabase:** Backend, Auth, and Database (The Brain).
3. **GitHub:** Version Control (The Save File).
4. **Vercel:** Deployment (The Stage).

### The "Context Window" Strategy
Understanding tokens, context windows (Claude vs. Gemini), and why "more context" isn't always better.
        `,
        quiz: [
          {
            id: 'v1-q1',
            question: 'What is the core role of a human in Vibe Coding?',
            options: ['Writing every line of CSS', 'High-level systems architecture and direction', 'Manually debugging semicolon errors', 'Running npm install repeatedly'],
            correctAnswer: 1,
            explanation: 'In Vibe Coding, the human acts as a Director/Architect while AI agents handle the syntax.'
          }
        ]
      },
      {
        id: 'm2-architect',
        title: 'The Architect’s Workflow',
        duration: '45 min',
        type: 'lab',
        content: `
### Spec Mode Workflow
Translate a "shower thought" into a rigorous technical specification. 

*   **The Brain Dump Protocol:** Using voice dictation to record stream-of-consciousness ideas.
*   **Visual Context Injection:** Programming with sketches and screenshots.
*   **The Senior EM Prompt:** Forcing the AI to "interview" you before writing code.

*Interactive Lab: Use the Project Spec Architect tool.*
        `
      },
      {
        id: 'm3-execution',
        title: 'Execution, Refactoring & Shipping',
        duration: '50 min',
        type: 'lab',
        content: `
### Cursor Composer Mastery
How to use "Plan Mode" vs. "Normal Mode." When to use @files to pin documentation for context.

### Model Selection Strategy
*   **Planning/Architecture:** Use Claude 3.7 Opus (High intelligence).
*   **Refactoring/Deep Logic:** Use OpenAI o1/o3-mini.
*   **Small UI Tweaks:** Use Gemini 2.5 Flash (Fast, cheap).

### The ELI5 Loop
Prevent code bloat by keeping files under 200 lines and using "Critique Yourself" prompts.
        `
      }
    ]
  },
  {
    id: 'vibe-mindset',
    title: 'The Vibe Mindset',
    subtitle: 'Stay Focused in a Sea of AI Noise',
    description: 'Bonus material on Documentation-Driven Development (DDD) and managing project scope.',
    tags: ['Mindset', 'Product Management', 'DDD'],
    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop',
    modules: [
      {
        id: 'mindset-1',
        title: 'Documentation-Driven Development',
        duration: '20 min',
        type: 'reading',
        content: `
### The Idea Parking Lot
How to resist the urge to add "Dark Mode" in the middle of building the database. Using backlog.md to stay focused.

### Brains on Disk
Why updating your .md files (instructions.md, style.md) is more important than updating your code. Your documentation is the AI's "Source of Truth."
        `
      }
    ]
  }
];
