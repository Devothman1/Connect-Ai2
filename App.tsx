import React, { useState, useCallback, useMemo } from 'react';
import { Tab, TABS } from './constants';
import { ChatMessage, File, FileSystemTree } from './types';
import { useHistory } from './hooks/useHistory';
import Tabs from './components/Tabs';
import EditorView from './components/panels/EditorView';
import AiFeaturesPanel from './components/panels/AiFeaturesPanel';
import AiChatPanel from './components/panels/AiChatPanel';
import LearningPathPanel from './components/panels/LearningPathPanel';
import AiDashboardPanel from './components/panels/AiDashboardPanel';
import AiChallengesPanel from './components/panels/AiChallengesPanel';
import InstantAppPanel from './components/panels/InstantAppPanel';
import CollaborationPanel from './components/panels/CollaborationPanel';
import HistoryPanel from './components/panels/HistoryPanel';
import OutputPanel from './components/panels/OutputPanel';
import VoiceChatPanel from './components/panels/VoiceChatPanel';
import * as geminiService from './services/geminiService';
import { findFile, getAllFiles } from './utils/fileSystem';
import AiToolsPanel from './components/panels/AiToolsPanel';
import UiGeneratorPanel from './components/panels/UiGeneratorPanel';

const initialFileSystem: FileSystemTree = [
    { id: '1', name: 'README.md', content: '# Welcome to your AI-Powered IDE!\n\nStart by creating a new file or uploading a project.', type: 'file' },
];

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.EDITOR);
    const [fileSystem, setFileSystem] = useState<FileSystemTree>(initialFileSystem);
    const [openFileIds, setOpenFileIds] = useState<string[]>(['1']);
    const [activeFileId, setActiveFileId] = useState<string | null>('1');

    const [output, setOutput] = useState<string>('💡 Output will appear here...');
    const [aiOutput, setAiOutput] = useState<string>('💡 AI results will appear here...');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: "Hello! I'm your AI programming assistant. Ask me anything!" }
    ]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { history, saveHistoryEntry, clearHistory } = useHistory();

    const activeFile = useMemo(() => {
        if (!activeFileId) return null;
        return findFile(fileSystem, activeFileId);
    }, [fileSystem, activeFileId]);

    const allFiles = useMemo(() => getAllFiles(fileSystem), [fileSystem]);

    const handleCodeChange = (newCode: string) => {
        if (!activeFileId) return;
        setFileSystem(prevFs => {
            const newFs = JSON.parse(JSON.stringify(prevFs)); // Deep copy
            const file = findFile(newFs, activeFileId);
            if (file) file.content = newCode;
            return newFs;
        });
    };
    
    const handleAiFeature = useCallback(async (feature: (code: string) => Promise<string>) => {
        if (!activeFile) {
            setAiOutput('⚠️ Please open a file first.');
            return;
        }
        setIsLoading(true);
        setActiveTab(Tab.AI_FEATURES);
        setAiOutput('Processing...');
        try {
            const result = await feature(activeFile.content);
            setAiOutput(result);
        } catch (error) {
            console.error(error);
            setAiOutput(`❌ Error processing AI feature: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    }, [activeFile]);

    const handleSendChatMessage = useCallback(async (message: string, useCodeContext: boolean) => {
        const newMessages: ChatMessage[] = [...chatMessages, { sender: 'user', text: message }];
        setChatMessages(newMessages);
        setIsLoading(true);
        try {
            const history = newMessages.slice(0, -1).map(m => `${m.sender}: ${m.text}`).join('\n');
            const codeContext = useCodeContext && activeFile ? activeFile.content : undefined;
            const response = await geminiService.getChatReply(message, history, codeContext);
            setChatMessages([...newMessages, { sender: 'ai', text: response }]);
        } catch (error) {
            console.error(error);
            setChatMessages([...newMessages, { sender: 'ai', text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}` }]);
        } finally {
            setIsLoading(false);
        }
    }, [chatMessages, activeFile]);

    const loadHistoryCode = useCallback((codeToLoad: string) => {
        if (activeFile) {
            handleCodeChange(codeToLoad);
        } else {
            // Create a new file if none is active
            const newFileId = Date.now().toString();
            const newFile: File = { id: newFileId, name: `history-${newFileId}.js`, content: codeToLoad, type: 'file' };
            setFileSystem(fs => [...fs, newFile]);
            setOpenFileIds(ids => [...ids, newFileId]);
            setActiveFileId(newFileId);
        }
        setOutput('✅ Loaded code from history into active file.');
        setActiveTab(Tab.EDITOR);
    }, [activeFile]);

    const renderActivePanel = () => {
        switch (activeTab) {
            case Tab.EDITOR:
                return (
                    <EditorView
                        fileSystem={fileSystem}
                        setFileSystem={setFileSystem}
                        openFileIds={openFileIds}
                        setOpenFileIds={setOpenFileIds}
                        activeFileId={activeFileId}
                        setActiveFileId={setActiveFileId}
                        activeFile={activeFile}
                        onCodeChange={handleCodeChange}
                        setOutput={setOutput}
                        onAiFeature={handleAiFeature}
                        saveHistoryEntry={saveHistoryEntry}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                    />
                );
            case Tab.AI_FEATURES:
                return <AiFeaturesPanel onFeatureSelect={handleAiFeature} isLoading={isLoading} aiOutput={aiOutput} />;
            case Tab.AI_TOOLS:
                return <AiToolsPanel />;
            case Tab.AI_CHAT:
                return <AiChatPanel messages={chatMessages} onSendMessage={handleSendChatMessage} isLoading={isLoading} activeFile={activeFile} />;
            case Tab.VOICE_CHAT:
                return <VoiceChatPanel />;
            case Tab.UI_GENERATOR:
                return <UiGeneratorPanel setFileSystem={setFileSystem} setOpenFileIds={setOpenFileIds} setActiveFileId={setActiveFileId} setActiveTab={setActiveTab} />;
            case Tab.LEARNING_PATH:
                return <LearningPathPanel allFiles={allFiles} />;
            case Tab.AI_DASHBOARD:
                return <AiDashboardPanel allFiles={allFiles} />;
            case Tab.AI_CHALLENGES:
                return <AiChallengesPanel setFileSystem={setFileSystem} setOpenFileIds={setOpenFileIds} setActiveFileId={setActiveFileId} setOutput={setOutput} setActiveTab={setActiveTab} />;
            case Tab.INSTANT_APP:
                return <InstantAppPanel setFileSystem={setFileSystem} setOpenFileIds={setOpenFileIds} setActiveFileId={setActiveFileId} setActiveTab={setActiveTab} />;
            case Tab.COLLABORATION:
                return <CollaborationPanel />;
            case Tab.HISTORY:
                return <HistoryPanel history={history} onClearHistory={clearHistory} onLoadHistory={loadHistoryCode} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans p-4 max-w-full mx-auto flex flex-col">
            <h1 className="text-center text-3xl font-bold text-cyan-400 glow mb-4 flex-shrink-0">
                <i className="fas fa-robot"></i> AI-Powered Smart Educational Platform
            </h1>

            <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-grow min-h-0">
                {renderActivePanel()}
            </main>
            
            {activeTab === Tab.EDITOR && <OutputPanel output={output} setOutput={setOutput} code={activeFile?.content ?? ''} />}
        </div>
    );
};

export default App;