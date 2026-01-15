// Gamification System - Animal Mascots, Achievements & Trophies

// Animal mascots mapped to courses - each course has a spirit animal
export const COURSE_MASCOTS = {
    'course-1-vibe-coding-101': {
        animal: 'rabbit',
        name: 'Dash',
        svg: '/svg-assets/rabbit-svgrepo-com.svg',
        personality: 'Quick learner, eager to start',
        catchphrase: 'Let\'s hop into coding!'
    },
    'course-2-full-stack': {
        animal: 'fox',
        name: 'Flux',
        svg: '/svg-assets/fox-svgrepo-com.svg',
        personality: 'Clever and resourceful',
        catchphrase: 'Time to build something real!'
    },
    'course-3-expert': {
        animal: 'lion',
        name: 'Apex',
        svg: '/svg-assets/lion-svgrepo-com.svg',
        personality: 'Bold leader, master of context',
        catchphrase: 'Rule the AI kingdom!'
    },
    'course-4-marketing': {
        animal: 'whale',
        name: 'Echo',
        svg: '/svg-assets/whale-svgrepo-com.svg',
        personality: 'Far-reaching, makes waves',
        catchphrase: 'Let your content make waves!'
    },
    'course-5-strategy': {
        animal: 'bear',
        name: 'Summit',
        svg: '/svg-assets/bear-svgrepo-com.svg',
        personality: 'Strategic, powerful presence',
        catchphrase: 'Dominate your market!'
    }
} as const;

// Achievement tiers with XP rewards
export const ACHIEVEMENT_TIERS = {
    bronze: { color: '#CD7F32', xpMultiplier: 1, glow: 'rgba(205, 127, 50, 0.4)' },
    silver: { color: '#C0C0C0', xpMultiplier: 1.5, glow: 'rgba(192, 192, 192, 0.4)' },
    gold: { color: '#FFD700', xpMultiplier: 2, glow: 'rgba(255, 215, 0, 0.5)' },
    platinum: { color: '#E5E4E2', xpMultiplier: 3, glow: 'rgba(229, 228, 226, 0.6)' },
    diamond: { color: '#B9F2FF', xpMultiplier: 5, glow: 'rgba(185, 242, 255, 0.7)' }
} as const;

export type AchievementTier = keyof typeof ACHIEVEMENT_TIERS;

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string; // SVG path
    tier: AchievementTier;
    xpReward: number;
    category: 'course' | 'streak' | 'social' | 'special';
    requirement: {
        type: 'lesson_complete' | 'course_complete' | 'streak' | 'xp_total' | 'projects' | 'likes';
        value: number;
        courseId?: string;
    };
    secret?: boolean; // Hidden until unlocked
}

// All achievements in the system
export const ACHIEVEMENTS: Achievement[] = [
    // === COURSE 1: VIBE CODING 101 ===
    {
        id: 'first-vibe',
        title: 'First Vibe',
        description: 'Complete your first lesson in Vibe Coding 101',
        icon: '/svg-assets/rabbit-svgrepo-com.svg',
        tier: 'bronze',
        xpReward: 50,
        category: 'course',
        requirement: { type: 'lesson_complete', value: 1, courseId: 'course-1-vibe-coding-101' }
    },
    {
        id: 'hello-world-2026',
        title: 'Hello World 2026',
        description: 'Complete the "Hello World in the AI Era" lab',
        icon: '/svg-assets/rabbit-svgrepo-com.svg',
        tier: 'silver',
        xpReward: 100,
        category: 'course',
        requirement: { type: 'lesson_complete', value: 3, courseId: 'course-1-vibe-coding-101' }
    },
    {
        id: 'prompt-whisperer',
        title: 'Prompt Whisperer',
        description: 'Master the CRAFT framework for prompting',
        icon: '/svg-assets/fox-svgrepo-com.svg',
        tier: 'silver',
        xpReward: 150,
        category: 'course',
        requirement: { type: 'lesson_complete', value: 4, courseId: 'course-1-vibe-coding-101' }
    },
    {
        id: 'shipped-it',
        title: 'Shipped It! 🚀',
        description: 'Deploy your first Link-in-Bio page',
        icon: '/svg-assets/penguin-svgrepo-com.svg',
        tier: 'gold',
        xpReward: 300,
        category: 'course',
        requirement: { type: 'course_complete', value: 1, courseId: 'course-1-vibe-coding-101' }
    },

    // === COURSE 2: FULL STACK ===
    {
        id: 'auth-guardian',
        title: 'Auth Guardian',
        description: 'Implement your first authentication system',
        icon: '/svg-assets/polar-bear-svgrepo-com.svg',
        tier: 'silver',
        xpReward: 200,
        category: 'course',
        requirement: { type: 'lesson_complete', value: 3, courseId: 'course-2-full-stack' }
    },
    {
        id: 'data-architect',
        title: 'Data Architect',
        description: 'Design and implement a database schema',
        icon: '/svg-assets/crocodile-svgrepo-com.svg',
        tier: 'gold',
        xpReward: 350,
        category: 'course',
        requirement: { type: 'lesson_complete', value: 5, courseId: 'course-2-full-stack' }
    },
    {
        id: 'micro-saas-founder',
        title: 'Micro-SaaS Founder',
        description: 'Build and deploy your first Micro-SaaS MVP',
        icon: '/svg-assets/fox-svgrepo-com.svg',
        tier: 'platinum',
        xpReward: 500,
        category: 'course',
        requirement: { type: 'course_complete', value: 1, courseId: 'course-2-full-stack' }
    },

    // === COURSE 3: EXPERT ===
    {
        id: 'context-engineer',
        title: 'Context Engineer',
        description: 'Master token limits and context windows',
        icon: '/svg-assets/lion-svgrepo-com.svg',
        tier: 'gold',
        xpReward: 400,
        category: 'course',
        requirement: { type: 'lesson_complete', value: 3, courseId: 'course-3-expert' }
    },
    {
        id: 'agent-smith',
        title: 'Agent Smith',
        description: 'Build your first AI agent',
        icon: '/svg-assets/dinosaur-svgrepo-com.svg',
        tier: 'platinum',
        xpReward: 600,
        category: 'course',
        requirement: { type: 'lesson_complete', value: 5, courseId: 'course-3-expert' }
    },
    {
        id: 'swarm-master',
        title: 'Swarm Master',
        description: 'Orchestrate a multi-agent swarm system',
        icon: '/svg-assets/jellyfish-svgrepo-com.svg',
        tier: 'diamond',
        xpReward: 1000,
        category: 'course',
        requirement: { type: 'course_complete', value: 1, courseId: 'course-3-expert' }
    },

    // === STREAK ACHIEVEMENTS ===
    {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Log in for 3 days in a row',
        icon: '/svg-assets/crab-svgrepo-com.svg',
        tier: 'bronze',
        xpReward: 25,
        category: 'streak',
        requirement: { type: 'streak', value: 3 }
    },
    {
        id: 'week-warrior',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '/svg-assets/elk-svgrepo-com.svg',
        tier: 'silver',
        xpReward: 100,
        category: 'streak',
        requirement: { type: 'streak', value: 7 }
    },
    {
        id: 'monthly-master',
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        icon: '/svg-assets/bear-svgrepo-com.svg',
        tier: 'gold',
        xpReward: 500,
        category: 'streak',
        requirement: { type: 'streak', value: 30 }
    },
    {
        id: 'century-coder',
        title: 'Century Coder',
        description: 'Maintain a 100-day streak',
        icon: '/svg-assets/lion-svgrepo-com.svg',
        tier: 'diamond',
        xpReward: 2000,
        category: 'streak',
        requirement: { type: 'streak', value: 100 }
    },

    // === SOCIAL ACHIEVEMENTS ===
    {
        id: 'first-share',
        title: 'First Share',
        description: 'Upload your first project to the gallery',
        icon: '/svg-assets/penguin-svgrepo-com.svg',
        tier: 'bronze',
        xpReward: 50,
        category: 'social',
        requirement: { type: 'projects', value: 1 }
    },
    {
        id: 'portfolio-builder',
        title: 'Portfolio Builder',
        description: 'Share 5 projects in the gallery',
        icon: '/svg-assets/whale-svgrepo-com.svg',
        tier: 'silver',
        xpReward: 200,
        category: 'social',
        requirement: { type: 'projects', value: 5 }
    },
    {
        id: 'community-favorite',
        title: 'Community Favorite',
        description: 'Receive 50 likes on your projects',
        icon: '/svg-assets/cute-animals-svgrepo-com.svg',
        tier: 'gold',
        xpReward: 300,
        category: 'social',
        requirement: { type: 'likes', value: 50 }
    },

    // === SPECIAL/SECRET ACHIEVEMENTS ===
    {
        id: 'night-owl',
        title: 'Night Owl',
        description: 'Complete a lesson between midnight and 4am',
        icon: '/svg-assets/fox-svgrepo-com.svg',
        tier: 'silver',
        xpReward: 75,
        category: 'special',
        requirement: { type: 'lesson_complete', value: 1 },
        secret: true
    },
    {
        id: 'speed-runner',
        title: 'Speed Runner',
        description: 'Complete Course 1 in under 24 hours',
        icon: '/svg-assets/rabbit-svgrepo-com.svg',
        tier: 'platinum',
        xpReward: 500,
        category: 'special',
        requirement: { type: 'course_complete', value: 1, courseId: 'course-1-vibe-coding-101' },
        secret: true
    },
    {
        id: 'vibe-master',
        title: 'Vibe Master',
        description: 'Complete all 5 courses',
        icon: '/svg-assets/lion-svgrepo-com.svg',
        tier: 'diamond',
        xpReward: 5000,
        category: 'special',
        requirement: { type: 'course_complete', value: 5 },
        secret: true
    }
];


// Trophy system - earned for major milestones
export interface Trophy {
    id: string;
    name: string;
    description: string;
    icon: string;
    tier: AchievementTier;
    courseId?: string;
    requirement: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const TROPHIES: Trophy[] = [
    // Course Completion Trophies
    {
        id: 'trophy-vibe-initiate',
        name: 'Vibe Initiate',
        description: 'Completed Vibe Coding 101',
        icon: '/svg-assets/rabbit-svgrepo-com.svg',
        tier: 'gold',
        courseId: 'course-1-vibe-coding-101',
        requirement: 'Complete all lessons in Course 1',
        rarity: 'common'
    },
    {
        id: 'trophy-full-stack-dev',
        name: 'Full Stack Developer',
        description: 'Completed Full Stack Vibe Coding',
        icon: '/svg-assets/fox-svgrepo-com.svg',
        tier: 'platinum',
        courseId: 'course-2-full-stack',
        requirement: 'Complete all lessons in Course 2',
        rarity: 'uncommon'
    },
    {
        id: 'trophy-context-master',
        name: 'Context Master',
        description: 'Completed Expert Vibe Coding',
        icon: '/svg-assets/lion-svgrepo-com.svg',
        tier: 'platinum',
        courseId: 'course-3-expert',
        requirement: 'Complete all lessons in Course 3',
        rarity: 'rare'
    },
    {
        id: 'trophy-content-engine',
        name: 'Content Engine',
        description: 'Completed Content Automation',
        icon: '/svg-assets/whale-svgrepo-com.svg',
        tier: 'platinum',
        courseId: 'course-4-marketing',
        requirement: 'Complete all lessons in Course 4',
        rarity: 'rare'
    },
    {
        id: 'trophy-strategist',
        name: 'Master Strategist',
        description: 'Completed Tools & Research',
        icon: '/svg-assets/bear-svgrepo-com.svg',
        tier: 'platinum',
        courseId: 'course-5-strategy',
        requirement: 'Complete all lessons in Course 5',
        rarity: 'epic'
    },
    {
        id: 'trophy-vibe-legend',
        name: 'Vibe Legend',
        description: 'Completed the entire Vibe Dev curriculum',
        icon: '/svg-assets/dinosaur-svgrepo-com.svg',
        tier: 'diamond',
        requirement: 'Complete all 5 courses',
        rarity: 'legendary'
    }
];

// Level progression system
export interface LevelInfo {
    level: number;
    title: string;
    minXP: number;
    maxXP: number;
    animal: string;
    animalSvg: string;
    perks: string[];
}

export const LEVELS: LevelInfo[] = [
    { level: 1, title: 'Curious Crab', minXP: 0, maxXP: 100, animal: 'crab', animalSvg: '/svg-assets/crab-svgrepo-com.svg', perks: ['Access to Course 1'] },
    { level: 2, title: 'Eager Rabbit', minXP: 100, maxXP: 300, animal: 'rabbit', animalSvg: '/svg-assets/rabbit-svgrepo-com.svg', perks: ['Profile customization'] },
    { level: 3, title: 'Steady Penguin', minXP: 300, maxXP: 600, animal: 'penguin', animalSvg: '/svg-assets/penguin-svgrepo-com.svg', perks: ['Gallery uploads'] },
    { level: 4, title: 'Clever Fox', minXP: 600, maxXP: 1000, animal: 'fox', animalSvg: '/svg-assets/fox-svgrepo-com.svg', perks: ['Access to Course 2'] },
    { level: 5, title: 'Wise Elk', minXP: 1000, maxXP: 1500, animal: 'elk', animalSvg: '/svg-assets/elk-svgrepo-com.svg', perks: ['Custom profile banner'] },
    { level: 6, title: 'Mighty Bear', minXP: 1500, maxXP: 2200, animal: 'bear', animalSvg: '/svg-assets/bear-svgrepo-com.svg', perks: ['Access to Course 3'] },
    { level: 7, title: 'Ancient Croc', minXP: 2200, maxXP: 3000, animal: 'crocodile', animalSvg: '/svg-assets/crocodile-svgrepo-com.svg', perks: ['Exclusive badge frames'] },
    { level: 8, title: 'Majestic Whale', minXP: 3000, maxXP: 4000, animal: 'whale', animalSvg: '/svg-assets/whale-svgrepo-com.svg', perks: ['Access to Course 4'] },
    { level: 9, title: 'Apex Lion', minXP: 4000, maxXP: 5500, animal: 'lion', animalSvg: '/svg-assets/lion-svgrepo-com.svg', perks: ['Access to Course 5', 'Mentor badge'] },
    { level: 10, title: 'Legendary Dino', minXP: 5500, maxXP: Infinity, animal: 'dinosaur', animalSvg: '/svg-assets/dinosaur-svgrepo-com.svg', perks: ['All courses', 'Exclusive Vault access', 'Legend status'] }
];

// Helper functions
export const getLevelFromXP = (xp: number): LevelInfo => {
    return LEVELS.find(l => xp >= l.minXP && xp < l.maxXP) || LEVELS[LEVELS.length - 1];
};

export const getXPProgress = (xp: number): { current: number; needed: number; percentage: number } => {
    const level = getLevelFromXP(xp);
    const current = xp - level.minXP;
    const needed = level.maxXP === Infinity ? 1000 : level.maxXP - level.minXP;
    const percentage = Math.min((current / needed) * 100, 100);
    return { current, needed, percentage };
};

export const getNextLevel = (xp: number): LevelInfo | null => {
    const currentLevel = getLevelFromXP(xp);
    const nextIndex = LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    return nextIndex < LEVELS.length ? LEVELS[nextIndex] : null;
};

// Daily challenges for bonus XP
export interface DailyChallenge {
    id: string;
    title: string;
    description: string;
    xpReward: number;
    icon: string;
    type: 'lesson' | 'quiz' | 'streak' | 'social';
}

export const DAILY_CHALLENGES: DailyChallenge[] = [
    { id: 'daily-lesson', title: 'Daily Learner', description: 'Complete 1 lesson today', xpReward: 25, icon: '/svg-assets/rabbit-svgrepo-com.svg', type: 'lesson' },
    { id: 'quiz-ace', title: 'Quiz Ace', description: 'Get 100% on any quiz', xpReward: 50, icon: '/svg-assets/fox-svgrepo-com.svg', type: 'quiz' },
    { id: 'streak-keeper', title: 'Streak Keeper', description: 'Maintain your streak', xpReward: 15, icon: '/svg-assets/penguin-svgrepo-com.svg', type: 'streak' },
    { id: 'community-love', title: 'Community Love', description: 'Like 3 projects in the gallery', xpReward: 20, icon: '/svg-assets/whale-svgrepo-com.svg', type: 'social' }
];
