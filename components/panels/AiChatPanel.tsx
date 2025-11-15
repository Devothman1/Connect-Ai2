import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, File } from '../../types';
import Card from '../Card';
import Button from '../Button';
import * as geminiService from '../../services/geminiService';
import * as audioUtils from '../../utils/audio';
import Loader from '../Loader';

interface AiChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (message: string, useCodeContext: boolean) => void;
    isLoading: boolean;
    activeFile: File | null;
}

const AiChatPanel: React.FC<AiChatPanelProps> = ({ messages, onSendMessage, isLoading, activeFile }) => {
    const [input, setInput] = useState('');
    const [useCodeContext, setUseCodeContext] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim(), useCodeContext);
            setInput('');
        }
    };
    
    const handleReadAloud = async (text: string) => {
        if (isSpeaking) return;
        setIsSpeaking(true);
        try {
            const audioB64 = await geminiService.generateSpeech(text);
            await audioUtils.playAudio(audioB64);
        } catch (e) {
            console.error("Speech generation/playback failed", e);
        } finally {
            setIsSpeaking(false);
        }
    };

    const quickQuestions = [
        "How do I fix this error?",
        "Explain this code simply.",
        "How can I optimize this?",
        "Show me an example.",
    ];

    return (
        <Card title="AI Programming Assistant" icon="fas fa-robot">
            <div ref={chatContainerRef} className="h-96 overflow-y-auto p-3 bg-gray-900 rounded-lg mb-3 flex flex-col gap-3">
                {messages.map((msg, index) => (
                    <div key={index} className={`p-3 rounded-lg max-w-[85%] group relative ${
                        msg.sender === 'ai' 
                        ? 'bg-gray-700/60 self-start border-l-4 border-cyan-500' 
                        : 'bg-cyan-600 self-end'
                    }`}>
                        <div className="flex justify-between items-start">
                             <strong className="block text-sm mb-1">{msg.sender === 'ai' ? 'AI Assistant' : 'You'}</strong>
                             {msg.sender === 'ai' && (
                                <button 
                                    onClick={() => handleReadAloud(msg.text)} 
                                    disabled={isSpeaking}
                                    className="ml-2 text-gray-400 hover:text-white transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    title="Read aloud"
                                >
                                    {isSpeaking ? <Loader size="sm"/> : <i className="fas fa-volume-up"></i>}
                                </button>
                             )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                ))}
                {isLoading && <div className="self-start bg-gray-700/60 p-3 rounded-lg"><span className="animate-pulse">AI is typing...</span></div>}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything about programming..."
                    className="flex-grow p-2.5 rounded-lg border-none bg-gray-900 text-white focus:ring-2 focus:ring-cyan-500"
                />
                <Button onClick={handleSend} isLoading={isLoading} icon="fas fa-paper-plane" className="w-auto px-5">{''}</Button>
            </div>
             <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {quickQuestions.map(q => <button key={q} onClick={() => setInput(q)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded-full transition-colors">{q}</button>)}
                </div>
                 <div className="flex items-center gap-2 text-sm text-gray-400">
                    <input 
                        type="checkbox" 
                        id="code-context-checkbox" 
                        checked={useCodeContext}
                        onChange={(e) => setUseCodeContext(e.target.checked)}
                        disabled={!activeFile}
                        className="w-4 h-4 rounded text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-600"
                    />
                    <label htmlFor="code-context-checkbox" title={activeFile ? `Include ${activeFile.name}` : 'Open a file to enable context'}>
                        Include Code Context
                    </label>
                </div>
            </div>
        </Card>
    );
};

export default AiChatPanel;