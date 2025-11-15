export enum Tab {
    EDITOR = 'Editor',
    AI_FEATURES = 'AI Features',
    AI_TOOLS = 'AI Tools',
    AI_CHAT = 'AI Assistant',
    VOICE_CHAT = 'Voice Chat',
    UI_GENERATOR = 'UI Generator',
    LEARNING_PATH = 'Learning Path',
    AI_DASHBOARD = 'AI Dashboard',
    AI_CHALLENGES = 'AI Challenges',
    INSTANT_APP = 'Instant App',
    COLLABORATION = 'Collaboration',
    HISTORY = 'History'
}

export const TABS = Object.values(Tab);

export const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'react', label: 'React (TSX)' },
];