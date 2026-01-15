import { Course } from '../../types';

export const COURSE_1_VIBE_CODING_101: Course = {
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
                    duration: '12 min read',
                    type: 'reading',
                    content: `### Welcome to the Future of Building

You're about to learn a skill that didn't exist five years ago. Welcome to **Vibe Coding** — the art of building software by orchestrating AI, not memorizing syntax.

### The Old Way vs. The New Way

**The Old Way (2015-2023):**
- Spend months learning programming fundamentals
- Memorize syntax for HTML, CSS, JavaScript, Python
- Debug by searching Stack Overflow for hours
- Build slowly, one line at a time

**The New Way (2024+):**
- Learn to communicate clearly with AI
- Describe what you want in plain English
- Iterate rapidly with AI-assisted debugging
- Ship products in days, not months

### What is "Vibe Coding"?

The term comes from Andrej Karpathy, former Director of AI at Tesla. He described it as:

*"You fully give in to the vibes, embrace exponentials, and forget that the code even exists."*

This doesn't mean you'll never understand code. It means you'll learn to **read** code before you learn to **write** it. You'll understand what AI generates, guide it when it's wrong, and iterate until it's right.

### Your New Role: The Orchestrator

Think of yourself as a **film director**, not a camera operator. You don't need to know how every piece of equipment works — you need to know:
- What you want to create (the vision)
- How to communicate that vision clearly
- When something isn't working and needs adjustment

### Course Philosophy

Throughout this course, we follow three core principles:

1. **Ship First, Perfect Later** — A working prototype beats a perfect plan
2. **Embrace the Loop** — Prompt → Generate → Test → Iterate
3. **Learn by Building** — Every lesson ends with something you can show

### What You'll Build

By the end of this course, you will have:
- A fully configured AI-powered development environment
- Your first AI-generated scripts running locally
- A deployed "Link-in-Bio" landing page live on the internet

Let's begin the vibe shift.`,
                    quiz: [
                        {
                            id: 'c1-m1-l1-q1',
                            question: 'What is the primary mindset shift in "Vibe Coding"?',
                            options: [
                                'Memorizing more programming languages',
                                'Moving from syntax memorization to AI orchestration',
                                'Avoiding all code entirely',
                                'Only using no-code tools'
                            ],
                            correctAnswer: 1,
                            explanation: 'Vibe Coding is about shifting from memorizing syntax to learning how to effectively communicate with and orchestrate AI tools to generate code for you.'
                        },
                        {
                            id: 'c1-m1-l1-q2',
                            question: 'According to the lesson, what role does a Vibe Coder play?',
                            options: [
                                'Camera operator',
                                'Film director / Orchestrator',
                                'Script writer',
                                'Editor'
                            ],
                            correctAnswer: 1,
                            explanation: 'A Vibe Coder acts as an orchestrator or director — focusing on the vision and communication rather than the low-level implementation details.'
                        }
                    ]
                },
                {
                    id: 'c1-m1-l2',
                    title: '1.2 The Tech Stack',
                    duration: '20 min',
                    type: 'video',
                    content: `### Setting Up Google AI Studio

Google AI Studio is your gateway to Gemini, Google's most capable AI model. The "Build" section lets you create and test AI-powered applications directly in your browser.

### Step 1: Access Google AI Studio

1. Go to **aistudio.google.com**
2. Sign in with your Google account
3. Click on **"Get API Key"** in the left sidebar
4. Create a new API key and save it somewhere safe

### Step 2: Explore the Interface

The AI Studio interface has several key areas:

**Chat Mode:**
- Have conversations with Gemini
- Great for brainstorming and quick questions
- Use this for initial ideation

**Structured Prompts:**
- Create reusable prompt templates
- Add examples for better outputs
- Perfect for consistent code generation

**Build Section:**
- Create full applications
- Connect to APIs and databases
- Deploy directly from the interface

### Step 3: Your First Interaction

Try this prompt in Chat mode:

*"You are a senior software developer. I'm a beginner learning to code with AI assistance. Explain what HTML, CSS, and JavaScript do in simple terms, using a house-building analogy."*

Notice how adding context ("You are a senior software developer") and constraints ("simple terms", "house-building analogy") improves the response.

### Understanding the Response

Gemini will likely explain:
- **HTML** = The structure (walls, rooms, foundation)
- **CSS** = The styling (paint, decorations, furniture)
- **JavaScript** = The functionality (electricity, plumbing, smart home features)

This mental model will help you understand what AI generates for you.

### Key Settings to Know

**Temperature:** Controls creativity (0 = precise, 1 = creative)
- Use 0.2-0.4 for code generation
- Use 0.7-0.9 for creative writing

**Max Output Tokens:** How long the response can be
- Set higher (2048+) for code generation
- Lower (256-512) for quick answers

### Safety Settings

Google AI Studio has built-in safety filters. For coding tasks, the default settings work well. You may need to adjust if you're building content-related applications.

### What's Next

In the next lesson, we'll use this setup to generate our first real code — without writing a single line ourselves.`,
                    quiz: [
                        {
                            id: 'c1-m1-l2-q1',
                            question: 'What temperature setting is recommended for code generation?',
                            options: [
                                '0.9 - 1.0 (highly creative)',
                                '0.7 - 0.8 (balanced)',
                                '0.2 - 0.4 (precise)',
                                '0.0 (deterministic)'
                            ],
                            correctAnswer: 2,
                            explanation: 'For code generation, a lower temperature (0.2-0.4) produces more precise, consistent, and reliable outputs. Higher temperatures introduce more randomness which can lead to syntax errors.'
                        },
                        {
                            id: 'c1-m1-l2-q2',
                            question: 'In the house-building analogy, what does CSS represent?',
                            options: [
                                'The foundation and structure',
                                'The styling and visual appearance',
                                'The electrical and plumbing systems',
                                'The blueprint and plans'
                            ],
                            correctAnswer: 1,
                            explanation: 'CSS (Cascading Style Sheets) handles the visual styling of a webpage — colors, fonts, layouts, and decorations — just like paint and furniture style a house.'
                        }
                    ]
                },
                {
                    id: 'c1-m1-l3',
                    title: '1.3 "Hello World" in the AI Era',
                    duration: '25 min',
                    type: 'lab',
                    content: `### Your First AI-Generated Code

It's time to write your first program — without writing any code yourself. This is the essence of Vibe Coding.

### The Traditional "Hello World"

In traditional programming, beginners spend hours setting up environments just to print "Hello World". We're going to skip all that.

### Lab Instructions

**Step 1: Open Google AI Studio**

Navigate to aistudio.google.com and open a new Chat session.

**Step 2: Use This Exact Prompt**

Copy and paste this prompt:

*"Create a Python script that does the following:
1. Prints 'Hello, Vibe Dev 2026!' with a decorative border
2. Asks the user for their name
3. Calculates and displays the first 10 numbers of the Fibonacci sequence
4. Ends with a personalized goodbye message using their name

Make the output visually appealing with emojis and formatting. Include comments explaining each section."*

**Step 3: Review the Generated Code**

Before running anything, read through the code. You should see:
- Print statements with string formatting
- An input() function to get user data
- A loop or function for Fibonacci calculation
- String concatenation for the goodbye message

**Step 4: Run the Code**

Option A - Google AI Studio:
- Click "Run" if available in the interface

Option B - Online Python Runner:
- Go to replit.com or python.org/shell
- Paste the generated code
- Click Run

Option C - Local (if you have Python installed):
- Save as hello_vibe.py
- Run: python hello_vibe.py

### Understanding What Happened

You just:
1. Described what you wanted in plain English
2. Received working code instantly
3. Ran a program without writing syntax

This is the core loop of Vibe Coding.

### Common Issues & Fixes

**"The code has an error"**
Paste the error message back to Gemini with: "I got this error when running the code: [error]. Please fix it."

**"It doesn't look right"**
Be more specific: "Make the border use = characters and add more spacing between sections."

**"I want to change something"**
Just ask: "Modify the code to also calculate the user's lucky number based on their name length."

### Challenge: Extend It

Try these modifications using only prompts:
- Add a feature that tells the user what day of the week they were born (ask for birthdate)
- Make it save the output to a text file
- Add color to the terminal output

### Reflection

You've just experienced the fundamental workflow:
**Describe → Generate → Test → Iterate**

This loop will be your constant companion throughout your Vibe Coding journey.`
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
                    duration: '18 min read',
                    type: 'lab',
                    content: `### The Art of Prompt Engineering

The quality of AI output is directly proportional to the quality of your input. This lesson teaches you how to communicate effectively with AI to get the code you actually want.

### The Prompt Spectrum

**Vague Prompt (Bad):**
"Make me a website"

**Better Prompt:**
"Create a website for a coffee shop"

**Good Prompt:**
"Create a responsive landing page for a coffee shop called 'Bean There' with a hero section, menu preview, and contact form using HTML and Tailwind CSS"

**Excellent Prompt:**
"Create a responsive landing page for a coffee shop called 'Bean There'. Include:
- A hero section with a full-width background image, headline, and CTA button
- A menu preview section showing 6 items in a grid
- A contact form with name, email, and message fields
- A footer with social media links
Use HTML and Tailwind CSS. The color scheme should be warm browns (#8B4513) and cream (#FFF8DC). Make it mobile-first."

### The CRAFT Framework

Use this framework for every code-generation prompt:

**C - Context:** What's the background?
"I'm building a personal portfolio site..."

**R - Role:** Who should the AI be?
"Act as a senior frontend developer..."

**A - Action:** What specifically should it do?
"Create a responsive navigation component..."

**F - Format:** How should the output look?
"Provide the code in separate HTML and CSS files with comments..."

**T - Tone/Tech:** What style or technology?
"Use modern ES6 JavaScript and Tailwind CSS..."

### Example: Applying CRAFT

**Without CRAFT:**
"Make a login form"

**With CRAFT:**
"**Context:** I'm building a SaaS dashboard application.
**Role:** Act as a senior React developer who prioritizes accessibility.
**Action:** Create a login form component with email and password fields, a 'Remember me' checkbox, and a submit button.
**Format:** Provide a single React functional component using TypeScript. Include inline comments.
**Tech:** Use Tailwind CSS for styling and include proper ARIA labels for accessibility."

### Specificity Wins

The more specific you are, the less iteration you need. Compare:

❌ "Add validation"
✅ "Add client-side validation that checks: email format is valid, password is at least 8 characters with one number and one special character. Show error messages below each field in red text."

### The Iteration Mindset

Even with perfect prompts, you'll rarely get exactly what you want on the first try. That's normal. The skill is in **fast iteration**:

1. Generate initial code
2. Identify what's wrong or missing
3. Ask for specific changes
4. Repeat until satisfied

### Power Phrases for Code Prompts

Keep these in your toolkit:

- "Refactor this to be more readable"
- "Add error handling for edge cases"
- "Make this more performant"
- "Add TypeScript types to this JavaScript"
- "Convert this to use async/await instead of promises"
- "Add comments explaining the complex parts"
- "Make this accessible (WCAG 2.1 compliant)"

### Practice Exercise

Take this vague prompt and rewrite it using CRAFT:

**Original:** "Make a todo app"

Your improved version should specify the tech stack, features, styling approach, and any specific behaviors you want.`,
                    requiredTool: 'campaign',
                    toolContext: {
                        instructions: 'Use the Project Spec Generator to practice creating detailed project specifications. Try describing a simple web application idea and see how the tool helps you structure it into a complete specification with features, user flows, and style guide.',
                        prefilledData: {
                            brainDump: 'A simple todo app for students to track assignments',
                            techStack: 'React, TypeScript, Tailwind CSS'
                        },
                        successCriteria: 'Generate at least one complete project specification using the CRAFT framework principles. Review the generated PRD, feature list, and user flows to understand how detailed specifications improve development outcomes.'
                    },
                    quiz: [
                        {
                            id: 'c1-m2-l1-q1',
                            question: 'What does the "R" in the CRAFT framework stand for?',
                            options: [
                                'Requirements',
                                'Role',
                                'Response',
                                'Result'
                            ],
                            correctAnswer: 1,
                            explanation: 'The "R" stands for Role — defining who the AI should act as (e.g., "senior React developer") helps it provide more appropriate and expert-level responses.'
                        },
                        {
                            id: 'c1-m2-l1-q2',
                            question: 'Why is specificity important in prompts?',
                            options: [
                                'It makes the AI work harder',
                                'It reduces the number of iterations needed',
                                'It uses more tokens',
                                'It makes responses longer'
                            ],
                            correctAnswer: 1,
                            explanation: 'Specific prompts reduce iteration cycles because the AI understands exactly what you want the first time, saving you time and effort in the revision process.'
                        }
                    ]
                },
                {
                    id: 'c1-m2-l2',
                    title: '2.2 Iteration Speed',
                    duration: '22 min',
                    type: 'lab',
                    content: `### Debugging with AI: Your New Superpower

Errors are not failures — they're feedback. In Vibe Coding, debugging becomes a conversation, not a frustrating solo hunt through documentation.

### The Old Debugging Process

1. See error message
2. Google the error
3. Read 5 Stack Overflow posts
4. Try random solutions
5. Break something else
6. Repeat for hours

### The New Debugging Process

1. See error message
2. Paste it to AI with context
3. Get explanation + fix
4. Apply and verify
5. Done in minutes

### Lab: Intentional Debugging Practice

We're going to intentionally create errors and practice fixing them with AI.

**Step 1: Generate Buggy Code**

Ask Gemini:
"Create a JavaScript function that fetches user data from an API and displays it, but intentionally include 3 common bugs that beginners make. Don't tell me what the bugs are."

**Step 2: Try to Run It**

Paste the code into your browser console (F12 → Console) or a JavaScript playground like CodePen.

**Step 3: Capture the Error**

When it fails, copy the ENTIRE error message, including:
- The error type (TypeError, ReferenceError, etc.)
- The error message
- The line number if shown
- The stack trace

**Step 4: Debug with AI**

Use this template:

"I'm running this JavaScript code:
\`\`\`
[paste your code here]
\`\`\`

I'm getting this error:
\`\`\`
[paste error message here]
\`\`\`

Please explain:
1. What's causing this error
2. How to fix it
3. How to prevent this in the future"

**Step 5: Apply the Fix**

Don't just copy-paste blindly. Read the explanation, understand the fix, then apply it.

### Common Error Patterns

**TypeError: Cannot read property 'x' of undefined**
- Usually means you're accessing data before it loads
- Fix: Add null checks or use optional chaining (?.)

**SyntaxError: Unexpected token**
- Missing bracket, comma, or quote
- Fix: Check the line number and surrounding code

**ReferenceError: x is not defined**
- Variable doesn't exist or is out of scope
- Fix: Check spelling and where the variable is declared

**CORS Error**
- Browser blocking cross-origin requests
- Fix: Use a proxy or configure server headers

### Speed Tips

**Tip 1: Include Your Intent**
"This code should fetch users and display their names in a list, but it's showing nothing."

**Tip 2: Mention What You've Tried**
"I already checked that the API URL is correct and returns data in Postman."

**Tip 3: Ask for Prevention**
"How can I set up my code to catch this type of error automatically in the future?"

### Challenge: Debug Race

Generate 5 different buggy code snippets. Time yourself fixing each one using AI assistance. Your goal: under 2 minutes per bug.

### The Debugging Mindset

Remember: Every error you encounter and fix with AI is teaching you to recognize patterns. Over time, you'll start spotting issues before you even run the code.

You're not avoiding learning — you're accelerating it.`
                },
                {
                    id: 'c1-m2-l3',
                    title: '2.3 Deploying Your First Static Site',
                    duration: '35 min',
                    type: 'lab',
                    content: `### Action Item: Deploy a Link-in-Bio Page

This is it — your first real deployment. By the end of this lesson, you'll have a live website on the internet that you can share with anyone.

### What We're Building

A "Link-in-Bio" page is a simple landing page that consolidates all your important links in one place. Think Linktree, but custom and yours.

### Step 1: Generate the HTML

Use this prompt in Google AI Studio:

"Create a modern, visually stunning Link-in-Bio page with the following:

**Personal Info:**
- Name: [Your Name]
- Title: 'Vibe Coder in Training'
- A placeholder for a profile image (use a gradient circle as placeholder)

**Links (5-6 buttons):**
- Twitter/X
- LinkedIn  
- GitHub
- Portfolio (placeholder)
- Email contact

**Design Requirements:**
- Dark theme with gradient background (purple to blue)
- Glassmorphism effect on the link buttons
- Smooth hover animations
- Mobile-responsive (looks good on phones)
- Include subtle animations (fade-in on load)

**Technical:**
- Single HTML file with embedded CSS
- No external dependencies except Google Fonts
- Use modern CSS (flexbox, CSS variables, backdrop-filter)

Add comments explaining each section of the code."

### Step 2: Customize It

Once you have the base code:

1. Replace [Your Name] with your actual name
2. Update the links to your real profiles
3. Adjust colors if desired (ask AI: "Change the gradient to go from teal to purple instead")
4. Add or remove link buttons as needed

### Step 3: Test Locally

1. Save the code as index.html
2. Double-click to open in your browser
3. Test on mobile using browser dev tools (F12 → Toggle device toolbar)
4. Make sure all links work (even if they go to placeholder URLs for now)

### Step 4: Deploy to Netlify

**Option A: Drag and Drop (Easiest)**

1. Go to netlify.com and sign up (free)
2. From your dashboard, find "Sites"
3. Drag your index.html file directly onto the page
4. Wait 30 seconds — you're live!
5. Netlify gives you a random URL like amazing-curie-123456.netlify.app

**Option B: Connect to GitHub (Better for updates)**

1. Create a GitHub account if you don't have one
2. Create a new repository
3. Upload your index.html
4. In Netlify, click "Add new site" → "Import an existing project"
5. Connect your GitHub and select the repository
6. Deploy!

### Step 5: Custom Domain (Optional)

If you own a domain:
1. In Netlify, go to Site settings → Domain management
2. Add your custom domain
3. Follow the DNS configuration instructions
4. Free SSL certificate is automatic!

### Step 6: Share It!

Your site is live. Share the URL:
- Post it on Twitter/X with #VibeDev2026
- Add it to your social media bios
- Send it to friends and family

### Need Visual Assets?

Want to create custom graphics or a profile image for your page? Try the [Visual Vibe Lab] to generate unique visuals that match your brand.

### Iteration Ideas

Now that it's live, try these improvements using AI prompts:

- "Add a dark/light mode toggle"
- "Add a visitor counter"
- "Include an animated background with floating particles"
- "Add a 'Currently listening to' Spotify widget"
- "Make the buttons have a ripple effect on click"

### Reflection

You just:
1. Described a website in plain English
2. Generated production-ready code
3. Deployed it to the internet
4. Got a live URL to share

This is Vibe Coding. You're no longer learning to code — you're learning to ship.

### Submission

Take a screenshot of your live site and save the URL. You'll add this to your Vibe Dev portfolio as proof of completion.

**Congratulations — you've completed Course 1! 🎉**`,
                    requiredTool: 'image',
                    toolContext: {
                        instructions: 'Use the Visual Vibe Lab to generate custom visual assets for your Link-in-Bio page. Create a profile image, background graphics, or decorative elements that match your personal brand and the design aesthetic of your page.',
                        prefilledData: {
                            prompt: 'Modern gradient profile avatar for a developer, geometric tech-inspired patterns, professional yet creative, purple and blue color scheme'
                        },
                        successCriteria: 'Generate at least one custom visual asset (profile image, background, or decorative element) and successfully integrate it into your deployed Link-in-Bio page. The asset should enhance the visual appeal and match the overall design theme.'
                    }
                }
            ]
        }
    ]
};