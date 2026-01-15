
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
    requiredTool?: 'campaign' | 'image' | 'seo';
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

export interface UserProgress {
    courseId: string;
    completedModules: string[]; // module IDs
    lastPlayed: Date;
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
    enrolledCourses: string[]; // course IDs
    courseProgress: UserProgress[]; // Detailed progress
    savedProjects: string[]; // gallery IDs
    likedProjects: string[]; // gallery IDs
}

export interface ToolUsage {
    userId: string;
    toolType: 'campaign' | 'image' | 'seo';
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
