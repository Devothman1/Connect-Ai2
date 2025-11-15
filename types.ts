
export interface HistoryEntry {
    id: number;
    action: string;
    code: string;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export interface TranscriptEntry {
    sender: 'user' | 'ai';
    text: string;
    isFinal: boolean;
}

export interface File {
    id: string;
    name: string;
    content: string;
    type: 'file';
}

export interface Folder {
    id: string;
    name: string;
    children: (File | Folder)[];
    type: 'folder';
}

export type FileSystemTree = (File | Folder)[];
