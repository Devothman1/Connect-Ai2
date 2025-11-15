import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, LiveSession } from "@google/genai";
import Card from '../Card';
import Button from '../Button';
import { TranscriptEntry } from '../../types';
import { decode, decodeAudioData, createBlob } from '../../utils/audio';

const VoiceChatPanel: React.FC = () => {
    const [status, setStatus] = useState<'inactive' | 'connecting' | 'listening' | 'speaking' | 'error'>('inactive');
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const sessionPromise = useRef<Promise<LiveSession> | null>(null);
    const mediaStream = useRef<MediaStream | null>(null);
    const inputAudioContext = useRef<AudioContext | null>(null);
    const outputAudioContext = useRef<AudioContext | null>(null);
    const scriptProcessor = useRef<ScriptProcessorNode | null>(null);
    const streamSource = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputNode = useRef<GainNode | null>(null);
    
    const nextStartTime = useRef<number>(0);
    const sources = useRef<Set<AudioBufferSourceNode>>(new Set());

    const stopConversation = useCallback(() => {
        setStatus('inactive');
        
        if(sessionPromise.current) {
            sessionPromise.current.then(session => session.close());
            sessionPromise.current = null;
        }
        
        if (mediaStream.current) {
            mediaStream.current.getTracks().forEach(track => track.stop());
            mediaStream.current = null;
        }

        if (scriptProcessor.current) {
            scriptProcessor.current.disconnect();
            scriptProcessor.current = null;
        }

        if (streamSource.current) {
            streamSource.current.disconnect();
            streamSource.current = null;
        }

        if (inputAudioContext.current && inputAudioContext.current.state !== 'closed') {
            inputAudioContext.current.close();
        }
        if (outputAudioContext.current && outputAudioContext.current.state !== 'closed') {
            outputAudioContext.current.close();
        }
        
        sources.current.forEach(source => source.stop());
        sources.current.clear();
        nextStartTime.current = 0;

    }, []);

    const startConversation = async () => {
        setTranscript([]);
        setErrorMessage('');
        setStatus('connecting');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStream.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputNode.current = outputAudioContext.current.createGain();
            outputNode.current.connect(outputAudioContext.current.destination);

            sessionPromise.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('listening');
                        streamSource.current = inputAudioContext.current!.createMediaStreamSource(stream);
                        scriptProcessor.current = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            if (sessionPromise.current) {
                                sessionPromise.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        streamSource.current.connect(scriptProcessor.current);
                        scriptProcessor.current.connect(inputAudioContext.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle transcription
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            setTranscript(prev => {
                                const last = prev[prev.length - 1];
                                if (last?.sender === 'user' && !last.isFinal) {
                                    last.text += text;
                                    return [...prev.slice(0, -1), last];
                                }
                                return [...prev, { sender: 'user', text, isFinal: false }];
                            });
                        } else if (message.serverContent?.outputTranscription) {
                             setStatus('speaking');
                             const text = message.serverContent.outputTranscription.text;
                             setTranscript(prev => {
                                 const last = prev[prev.length - 1];
                                 if (last?.sender === 'ai' && !last.isFinal) {
                                     last.text += text;
                                     return [...prev.slice(0, -1), last];
                                 }
                                 return [...prev, { sender: 'ai', text, isFinal: false }];
                             });
                        }

                        if (message.serverContent?.turnComplete) {
                            setStatus('listening');
                            setTranscript(prev => prev.map(t => ({...t, isFinal: true})));
                        }

                        // Handle audio playback
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && outputAudioContext.current && outputNode.current) {
                            nextStartTime.current = Math.max(nextStartTime.current, outputAudioContext.current.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext.current, 24000, 1);
                            const source = outputAudioContext.current.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode.current);
                            source.addEventListener('ended', () => {
                                sources.current.delete(source);
                            });
                            source.start(nextStartTime.current);
                            nextStartTime.current += audioBuffer.duration;
                            sources.current.add(source);
                        }

                        if (message.serverContent?.interrupted) {
                            sources.current.forEach(s => s.stop());
                            sources.current.clear();
                            nextStartTime.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setErrorMessage(`An error occurred: ${e.message}. Please try again.`);
                        setStatus('error');
                        stopConversation();
                    },
                    onclose: () => {
                         console.log('Session closed.');
                         stopConversation();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                },
            });
        } catch (err) {
            console.error('Failed to start conversation:', err);
            const message = err instanceof Error ? err.message : 'Unknown error';
            setErrorMessage(`Could not start session: ${message}`);
            setStatus('error');
            stopConversation();
        }
    };
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    const getStatusIndicator = () => {
        switch (status) {
            case 'inactive': return <><i className="fas fa-microphone-slash mr-2"></i>Inactive</>;
            case 'connecting': return <><span className="animate-pulse"></span><i className="fas fa-wifi mr-2"></i>Connecting...</>;
            case 'listening': return <><span className="animate-ping h-2 w-2 rounded-full bg-green-400 opacity-75 mr-2"></span><i className="fas fa-microphone mr-2 text-green-400"></i>Listening...</>;
            case 'speaking': return <><i className="fas fa-volume-up mr-2 text-cyan-400"></i>AI Speaking...</>;
            case 'error': return <><i className="fas fa-exclamation-triangle mr-2 text-red-400"></i>Error</>;
            default: return null;
        }
    };

    return (
        <Card title="AI Voice Conversation" icon="fas fa-headset">
            <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-semibold flex items-center">{getStatusIndicator()}</div>
                <div>
                    {status === 'inactive' || status === 'error' ? (
                        <Button onClick={startConversation} icon="fas fa-play">Start Conversation</Button>
                    ) : (
                        <Button onClick={stopConversation} icon="fas fa-stop" variant="secondary">Stop Conversation</Button>
                    )}
                </div>
            </div>

            <div className="h-96 overflow-y-auto p-3 bg-gray-900 rounded-lg mb-3 flex flex-col gap-3">
                {transcript.length === 0 && status !== 'error' && (
                    <div className="text-center text-gray-500 m-auto">
                        <p>Press "Start Conversation" and begin speaking.</p>
                        <p>Your conversation will appear here.</p>
                    </div>
                )}
                {transcript.map((entry, index) => (
                    <div key={index} className={`p-3 rounded-lg max-w-[85%] ${
                        entry.sender === 'ai' 
                        ? 'bg-gray-700/60 self-start' 
                        : 'bg-cyan-600 self-end'
                    } ${!entry.isFinal ? 'opacity-70' : ''}`}>
                        <strong className="block text-sm mb-1 capitalize">{entry.sender}</strong>
                        <p className="text-sm whitespace-pre-wrap">{entry.text}</p>
                    </div>
                ))}
                {errorMessage && (
                     <div className="text-center text-red-400 m-auto p-4 bg-red-900/50 rounded-lg">
                        <p>{errorMessage}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default VoiceChatPanel;
