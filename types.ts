
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // Index
    explanation: string;
}

export interface ToolContext {
    instructions?: string;
    prefilledData?: Record<string, any>;
    successCriteria?: string;
}

export interface Lesson {
    id: string;
    title: string;
    duration: string;
    content: string;
    type: 'video' | 'reading' | 'lab';
    quiz?: QuizQuestion[];
    requiredTool?: 'campaign' | 'image';
    toolContext?: ToolContext;
}

export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Course {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    tags: string[];
    thumbnail: string;
    modules: Module[];
}

export interface ProjectSpec {
    prd: string;
    featureList: string[];
    userFlows: string[];
    styleGuide: {
        fonts: string;
        colors: string;
        vibe: string;
    };
}

export interface CourseProgress {
    courseId: string;
    completedLessons: string[]; // lesson IDs
    completedModules: string[]; // module IDs
    lastPlayed: any; // Firestore Timestamp
    courseCompleted: boolean;
}

export interface XPTransaction {
    userId: string;
    amount: number;
    reason: string;
    timestamp: any; // Firestore Timestamp
    metadata?: {
        courseId?: string;
        lessonId?: string;
        achievementId?: string;
    };
}

export interface AchievementUnlock {
    userId: string;
    achievementId: string;
    unlockedAt: any; // Firestore Timestamp
    xpAwarded: number;
}

export interface DailyChallengeProgress {
    userId: string;
    challengeId: string;
    completedAt: any; // Firestore Timestamp
    xpAwarded: number;
    date: string; // YYYY-MM-DD format for daily reset
}

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    bannerURL?: string;
    bio?: string;
    location?: string;
    role?: string;
    xp: number;
    level: number;
    streakDays: number;
    lastLogin: any; // Firestore Timestamp
    unlockedAchievements: string[]; // achievement IDs
    enrolledCourses: string[]; // course IDs
    courseProgress: CourseProgress[]; // Detailed progress
    savedProjects: string[]; // gallery IDs
    likedProjects: string[]; // gallery IDs
}

export interface ToolUsage {
    userId: string;
    toolType: 'campaign' | 'image';
    lessonId: string;
    courseId: string;
    timestamp: Date;
    completed: boolean;
    result?: any;
}

export interface GalleryItem {
    id: string;
    userId: string;
    courseId: string;
    title: string;
    imageUrl: string;
    description: string;
    submittedAt: any;
    likes: number;
    tags: string[];
}
