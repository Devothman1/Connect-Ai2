
import React, { useState } from 'react';
import { File, FileSystemTree } from '../../types';
import FileExplorer from '../editor/FileExplorer';
import Button from '../Button';
import * as geminiService from '../../services/geminiService';
import { LANGUAGES } from '../../constants';

interface EditorViewProps {
    fileSystem: FileSystemTree;
    setFileSystem: React.Dispatch<React.SetStateAction<FileSystemTree>>;
    openFileIds: string[];
    setOpenFileIds: React.Dispatch<React.SetStateAction<string[]>>;
    activeFileId: string | null;
    setActiveFileId: React.Dispatch<React.SetStateAction<string | null>>;
    activeFile: File | null;
    onCodeChange: (newCode: string) => void;
    setOutput: (output: string) => void;
    onAiFeature: (feature: (code: string) => Promise<string>) => void;
    saveHistoryEntry: (action: string, code: string) => void;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditorView: React.FC<EditorViewProps> = (props) => {
    const { activeFile, onCodeChange, setOutput, onAiFeature, saveHistoryEntry } = props;
    const [isGenerating, setIsGenerating] = useState(false);
    
    const runCode = () => {
        if (!activeFile?.content) {
            setOutput('No code to run.');
            return;
        }
        
        if (activeFile.name.endsWith('.html') || activeFile.content.trim().startsWith('<')) {
            setOutput('HTML/CSS/JS code detected. Opening in preview panel.');
        } else {
             setOutput('JavaScript code executed. Check console for output.');
        }
        saveHistoryEntry('Run Code', activeFile.content);
    };

    const handleGenerate = async () => {
        const description = prompt("Enter a detailed description of the code you want to generate:", "");
        if (!description || !activeFile) return;

        setIsGenerating(true);
        setOutput(`Generating code for ${activeFile.name}...`);
        try {
            const language = LANGUAGES.find(l => activeFile.name.endsWith(l.value))?.label || 'javascript';
            const generatedCode = await geminiService.generateCode(description, language, activeFile.name);
            onCodeChange(generatedCode);
            setOutput(`✅ AI code generated successfully in ${activeFile.name}.`);
            saveHistoryEntry('AI Code Generation', generatedCode);
        } catch (error) {
            setOutput(`❌ Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="grid grid-cols-12 gap-4 h-full">
            <div className="col-span-2 bg-[#1e2b35] rounded-lg p-2 shadow-lg min-h-[400px]">
                <FileExplorer {...props} />
            </div>
            <div className="col-span-10 flex flex-col gap-4">
                 <div className="bg-[#1e2b35] rounded-lg p-4 shadow-lg flex-grow">
                     <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-3">
                        <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-3"><i className="fas fa-keyboard"></i>Editor</h2>
                        <div className="flex gap-2">
                           <Button onClick={handleGenerate} icon="fas fa-magic" isLoading={isGenerating} variant="secondary" className="w-auto px-3 py-1 text-sm">Generate with AI</Button>
                           <Button onClick={runCode} icon="fas fa-play" variant="primary" className="w-auto px-3 py-1 text-sm">Run Code</Button>
                        </div>
                     </div>
                     
                     {activeFile ? (
                         <textarea
                            key={activeFile.id}
                            value={activeFile.content}
                            onChange={(e) => onCodeChange(e.target.value)}
                            placeholder="Your code appears here..."
                            className="w-full h-[calc(100%-40px)] p-2.5 rounded-lg border-none text-base bg-gray-900 text-white font-mono resize-none focus:ring-2 focus:ring-cyan-500"
                        />
                     ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <p>Select a file to start editing or create a new one.</p>
                        </div>
                     )}
                 </div>
            </div>
        </div>
    );
};

export default EditorView;
