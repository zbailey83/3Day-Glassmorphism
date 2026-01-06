
import { Course } from './types';

export const GEMINI_TEXT_MODEL = 'gemini-3-pro-preview';
export const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';

export const COURSES: Course[] = [
  {
    id: 'course-1-vibe-coding-101',
    title: 'Course 1: Vibe Coding 101',
    subtitle: 'Shift from Syntax to AI Orchestration',
    description: 'Get your development environment set up and ship your first simple web app by shifting your mindset from syntax memorization to AI orchestration.',
    tags: ['Beginner', 'Setup', 'Prompting'],
    thumbnail: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=800&auto=format&fit=crop',
    modules: [
      {
        id: 'c1-m1',
        title: 'Module 1: The Vibe Shift',
        lessons: [
          {
            id: 'c1-m1-l1',
            title: '1.1 Welcome to Vibe Dev 2026',
            duration: '10 min',
            type: 'video',
            content: `### Philosophy & Expectations
            
Welcome to the future of coding. In this module, we explore why "learning syntax" is no longer the barrier to entry. We focus on:

- **AI Orchestration**: Managing tools like Cursor and Replit.
- **The New Workflow**: Prompt -> Code -> Iterate.
            `
          },
          {
            id: 'c1-m1-l2',
            title: '1.2 The Tech Stack',
            duration: '20 min',
            type: 'video',
            content: `### Setting up your Environment
            
We will be setting up the core tools for Vibe Coding:
1. **Cursor**: The AI-first code editor.
2. **VS Code**: The classic standard (as fallback).
3. **Replit**: For quick cloud deployments.
4. **Python Basics**: Just enough to understand the scripts AI generates for you.
            `
          },
          {
            id: 'c1-m1-l3',
            title: '1.3 "Hello World" in the AI Era',
            duration: '15 min',
            type: 'lab',
            content: `### Writing specific scripts without code
            
Your task: Use Cursor to generate a Python script that prints "Hello, Vibe Dev!" and calculates the Fibonacci sequence. Do not write a single line yourself.
            `
          }
        ]
      },
      {
        id: 'c1-m2',
        title: 'Module 2: Prompting for Code',
        lessons: [
          {
            id: 'c1-m2-l1',
            title: '2.1 Talking to the Machine',
            duration: '25 min',
            type: 'reading',
            content: `### Basic Prompt Engineering
            
Learn the difference between "Write a website" and "Create a responsive landing page with a hero section using Tailwind CSS." 
Precision is key.
            `
          },
          {
            id: 'c1-m2-l2',
            title: '2.2 Iteration Speed',
            duration: '20 min',
            type: 'lab',
            content: `### Debugging with AI
            
Errors are part of the process. Learn how to paste error logs into the AI context to get instant fixes.
            `
          },
          {
            id: 'c1-m2-l3',
            title: '2.3 Deploying Your First Static Site',
            duration: '30 min',
            type: 'lab',
            content: `### Action Item: Deploy a Link-in-Bio Page
            
**Goal**: Deploy a personal "Link-in-Bio" landing page using only AI prompts.
**Tools**: HTML/CSS (generated), Netlify or Vercel (drag and drop).
            `
          }
        ]
      }
    ]
  },
  {
    id: 'course-2-full-stack',
    title: 'Course 2: Full Stack Vibe Coding',
    subtitle: 'Build Real Apps with Memory',
    description: 'Move beyond static pages. Build real applications with user accounts, authentication, and databases.',
    tags: ['Intermediate', 'Full Stack', 'Database'],
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    modules: [
      {
        id: 'c2-m1',
        title: 'Module 1: Authentication',
        lessons: [
          {
            id: 'c2-m1-l1',
            title: '1.1 Understanding Auth Flows',
            duration: '20 min',
            type: 'video',
            content: `### Sign up, Login, Reset
            
Understanding the security flow:
- JWTs (JSON Web Tokens)
- OAuth (Google/GitHub Login)
- Session Management
            `
          },
          {
            id: 'c2-m1-l2',
            title: '1.2 Implementing Authentication',
            duration: '45 min',
            type: 'lab',
            content: `### Supabase/Firebase Integration
            
We will use AI to generate the boilerplate code for Firebase Authentication.
**Task**: Connect your "Hello World" app to Firebase.
            `
          },
          {
            id: 'c2-m1-l3',
            title: '1.3 Protected Routes',
            duration: '30 min',
            type: 'lab',
            content: `### Keeping Pages Private
            
Learn how to redirect unauthenticated users away from the Dashboard.
            `
          }
        ]
      },
      {
        id: 'c2-m2',
        title: 'Module 2: The Database',
        lessons: [
          {
            id: 'c2-m2-l1',
            title: '2.1 Database Schemas Explained',
            duration: '25 min',
            type: 'reading',
            content: `### Data Modeling with AI
            
Ask the AI: "Design a Firestore schema for a To-Do app." specialized for NoSQL structure.
            `
          },
          {
            id: 'c2-m2-l2',
            title: '2.2 CRUD Operations',
            duration: '40 min',
            type: 'lab',
            content: `### Create, Read, Update, Delete
            
The core of every app. We will build functions to add items to the database and display them.
            `
          },
          {
            id: 'c2-m2-l3',
            title: '2.3 Connecting User Profiles',
            duration: '60 min',
            type: 'lab',
            content: `### Action Item: Micro-SaaS MVP
            
**Goal**: Build a simple To-Do list or Journal app where users can log in and save unique data.
            `
          }
        ]
      }
    ]
  },
  {
    id: 'course-3-expert',
    title: 'Course 3: Expert Vibe Coding',
    subtitle: 'Context Engineering & Agents',
    description: 'Master the secret sauce: Architecting complex AI systems, managing token limits, and building autonomous agents.',
    tags: ['Advanced', 'Agents', 'RAG'],
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
    modules: [
      {
        id: 'c3-m1',
        title: 'Module 1: The Context Engineer',
        lessons: [
          {
            id: 'c3-m1-l1',
            title: '1.1 What is Context Engineering?',
            duration: '20 min',
            type: 'reading',
            content: 'Beyond simple prompt engineering. How to structure massive context for the AI.'
          },
          {
            id: 'c3-m1-l2',
            title: '1.2 Managing Token Limits',
            duration: '25 min',
            type: 'video',
            content: 'Understanding how much memory your AI has and how to optimize it.'
          },
          {
            id: 'c3-m1-l3',
            title: '1.3 System Prompts vs User Prompts',
            duration: '30 min',
            type: 'lab',
            content: 'Crafting the "God Mode" system instructions that define how your agent behaves.'
          }
        ]
      },
      {
        id: 'c3-m2',
        title: 'Module 2: Building Agents & Swarms',
        lessons: [
          {
            id: 'c3-m2-l1',
            title: '2.1 Structuring Complex Logic',
            duration: '35 min',
            type: 'reading',
            content: 'Chain-of-Thought prompting and multi-step reasoning.'
          },
          {
            id: 'c3-m2-l2',
            title: '2.2 Feeding Data (RAG)',
            duration: '45 min',
            type: 'lab',
            content: 'Retrieval Augmented Generation: Giving your AI access to external documentation.'
          },
          {
            id: 'c3-m2-l3',
            title: '2.3 Creating an Agent Swarm',
            duration: '90 min',
            type: 'lab',
            content: `### Action Item: Specialized AI Assistant
            
**Goal**: Build a "Research Agent" or "Coding Buddy" that follows a strict system persona and has access to specific docs.
            `
          }
        ]
      }
    ]
  },
  {
    id: 'course-4-marketing',
    title: 'Course 4: Content Automation',
    subtitle: 'Scale Your Output with AI',
    description: 'Solve the distribution problem. Leverage AI to create content at scale, from SEO blogs to automated social posts.',
    tags: ['Marketing', 'Automation', 'Growth'],
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    modules: [
      {
        id: 'c4-m1',
        title: 'Module 1: Modern Marketing Stack',
        lessons: [
          { id: 'c4-m1-l1', title: '1.1 SEO in an AI-Search World', duration: '20 min', type: 'reading', content: 'How search is changing with Perplexity and SearchGPT.' },
          { id: 'c4-m1-l2', title: '1.2 Defining Content Pillars', duration: '25 min', type: 'video', content: 'Structuring your niche authority.' }
        ]
      },
      {
        id: 'c4-m2',
        title: 'Module 2: Content Automation',
        lessons: [
          { id: 'c4-m2-l1', title: '2.1 Building the Content Engine', duration: '30 min', type: 'lab', content: 'Automating tweets and LinkedIn posts.' },
          { id: 'c4-m2-l2', title: '2.2 Video & Image Gen', duration: '40 min', type: 'lab', content: 'Midjourney and Runway workflows.' },
          { id: 'c4-m2-l3', title: '2.3 Webhooks & Zapier', duration: '60 min', type: 'lab', content: '**Action Item**: Turn 1 YouTube video into 3 Tweets and a LinkedIn post automatically.' }
        ]
      }
    ]
  },
  {
    id: 'course-5-strategy',
    title: 'Course 5: Tools & Research',
    subtitle: 'Brand Growth & High-Level Strategy',
    description: 'Use AI for deep market research, competitive analysis, and building a consistent brand voice.',
    tags: ['Strategy', 'Research', 'Business'],
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop',
    modules: [
      {
        id: 'c5-m1',
        title: 'Module 1: Deep Research',
        lessons: [
          { id: 'c5-m1-l1', title: '1.1 Perplexity Market Analysis', duration: '20 min', type: 'video', content: 'Deep diving into market trends.' },
          { id: 'c5-m1-l2', title: '1.2 Competitor Analysis', duration: '30 min', type: 'lab', content: 'Spying on the competition with AI.' }
        ]
      },
      {
        id: 'c5-m2',
        title: 'Module 2: Brand & Growth',
        lessons: [
          { id: 'c5-m2-l1', title: '2.1 Consistent Branding', duration: '25 min', type: 'reading', content: 'Maintaining voice and visuals.' },
          { id: 'c5-m2-l2', title: '2.2 Growth Hacking 2026', duration: '35 min', type: 'video', content: 'New tactics for a new era.' },
          { id: 'c5-m2-l3', title: '2.3 Building a Second Brain', duration: '60 min', type: 'lab', content: '**Action Item**: Create a "Brand Bible" and 3-month growth plan.' }
        ]
      }
    ]
  }
];
