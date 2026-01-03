
export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // Index
    explanation: string;
}

export interface Module {
    id: string;
    title: string;
    duration: string;
    content: string;
    type: 'video' | 'reading' | 'lab';
    quiz?: QuizQuestion[];
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
