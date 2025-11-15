
import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import Loader from '../Loader';
import * as geminiService from '../../services/geminiService';
import { File, FileSystemTree } from '../../types';
import { Tab } from '../../constants';

interface InstantAppPanelProps {
    setFileSystem: React.Dispatch<React.SetStateAction<FileSystemTree>>;
    setOpenFileIds: React.Dispatch<React.SetStateAction<string[]>>;
    setActiveFileId: React.Dispatch<React.SetStateAction<string | null>>;
    setActiveTab: (tab: Tab) => void;
}

const InstantAppPanel: React.FC<InstantAppPanelProps> = ({ setFileSystem, setOpenFileIds, setActiveFileId, setActiveTab }) => {
    const [description, setDescription] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const suggestions = [
        "A modern landing page for a coffee shop with a hero image, features section, and contact form.",
        "An interactive to-do list application with add, delete, and mark-as-complete functionality.",
        "A personal portfolio website with a project gallery and an about me section.",
        "A weather app that shows the current temperature and a 5-day forecast for a city."
    ];

    const handleGenerate = async () => {
        if (!description.trim()) {
            alert('Please enter a description.');
            return;
        }
        setIsLoading(true);
        setGeneratedCode('');
        try {
            const code = await geminiService.generateWebApp(description);
            setGeneratedCode(code);
        } catch (error) {
            const errorMessage = `Error generating app: ${error instanceof Error ? error.message : 'Unknown error'}`;
            setGeneratedCode(`<!-- ${errorMessage} -->`);
            console.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleOpenInEditor = () => {
        if (!generatedCode) return;

        const newFileId = Date.now().toString();
        const newFile: File = { 
            id: newFileId, 
            name: `instant-app-${newFileId}.html`, 
            content: generatedCode, 
            type: 'file' 
        };
        
        setFileSystem(fs => [newFile, ...fs]);
        setOpenFileIds(ids => [...new Set([newFileId, ...ids])]);
        setActiveFileId(newFileId);
        setActiveTab(Tab.EDITOR);
    };

    const copyCode = () => {
        if (!generatedCode) return;
        navigator.clipboard.writeText(generatedCode).then(() => {
            alert('Code copied to clipboard!');
        });
    };

    return (
        <Card title="Instant App Generator" icon="fas fa-rocket">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Input Column */}
                <div>
                    <h3 className="text-md font-semibold mb-2">1. Describe Your App</h3>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g., A simple calculator with a clean interface and basic arithmetic operations."
                        className="w-full min-h-[150px] p-2.5 rounded-lg border-none text-base bg-gray-900 text-white font-mono resize-y focus:ring-2 focus:ring-cyan-500"
                    />
                    <div className="mt-2 text-xs text-gray-400">
                        <h4 className="font-semibold mb-1">Need inspiration? Try one of these:</h4>
                        <ul className="list-disc list-inside">
                            {suggestions.map((s, i) => (
                                <li key={i} className="cursor-pointer hover:text-cyan-400 mb-1" onClick={() => setDescription(s)}>{s}</li>
                            ))}
                        </ul>
                    </div>
                    <Button onClick={handleGenerate} isLoading={isLoading} icon="fas fa-magic-wand-sparkles" className="mt-4">
                        Generate & Preview
                    </Button>
                </div>

                {/* Output Column */}
                <div>
                    <h3 className="text-md font-semibold mb-2">2. Preview & Use</h3>
                    <div className="bg-gray-900 rounded-lg p-2 min-h-[400px] h-full flex flex-col">
                        {isLoading ? (
                            <div className="flex-grow flex items-center justify-center">
                                <Loader text="Building your app..." size="lg" />
                            </div>
                        ) : generatedCode ? (
                            <>
                                <div className="flex gap-2 mb-2">
                                    <Button onClick={copyCode} icon="far fa-copy" variant="secondary" className="text-xs py-1 px-3 w-auto">Copy Code</Button>
                                    <Button onClick={handleOpenInEditor} icon="fas fa-folder-open" variant="secondary" className="text-xs py-1 px-3 w-auto">Open in Editor</Button>
                                </div>
                                <iframe
                                    srcDoc={generatedCode}
                                    title="Live Preview"
                                    sandbox="allow-scripts allow-forms"
                                    className="w-full flex-grow rounded-md border-2 border-gray-700 bg-white"
                                />
                            </>
                        ) : (
                            <div className="flex-grow flex items-center justify-center text-gray-500">
                                <p>Your app preview will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default InstantAppPanel;
