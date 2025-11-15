
import React from 'react';
import { LANGUAGES, Tab } from '../../constants';
import Card from '../Card';
import Button from '../Button';

interface CodeGenerationPanelProps {
    description: string;
    setDescription: (value: string) => void;
    language: string;
    setLanguage: (value: string) => void;
    onGenerate: (useAi: boolean) => void;
    isLoading: boolean;
    setCode: (code: string) => void;
}

const CodeGenerationPanel: React.FC<CodeGenerationPanelProps> = ({ description, setDescription, language, setLanguage, onGenerate, isLoading, setCode }) => {
    
    const suggestions = [
        "Create a responsive navigation menu with a hamburger icon on mobile.",
        "Build a login form with validation for email and password fields.",
        "Implement a dark/light mode toggle using CSS variables and localStorage.",
    ];
    
    const applySuggestion = (suggestion: string) => {
        const enhancedSuggestion = `${suggestion} and add some nice styling.`;
        setCode(`// Refactoring with AI suggestion: ${suggestion}`);
    };

    return (
        <Card title="Code Generation" icon="fas fa-code">
             <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full mt-2 p-2.5 rounded-lg border-none text-base bg-gray-900 text-white focus:ring-2 focus:ring-cyan-500"
            >
                {LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
            </select>
            <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a detailed description of the code you want to generate..."
                className="w-full mt-2 min-h-[120px] p-2.5 rounded-lg border-none text-base bg-gray-900 text-white font-mono resize-y focus:ring-2 focus:ring-cyan-500"
            />
            <div className="mt-2 text-xs text-gray-400">
                <h4 className="font-semibold mb-1">Suggestions:</h4>
                {suggestions.map((s, i) => (
                    <div key={i} className="cursor-pointer hover:text-cyan-400" onClick={() => setDescription(s)}>{s}</div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <Button onClick={() => onGenerate(true)} icon="fas fa-magic" isLoading={isLoading}>
                    Generate with AI
                </Button>
            </div>
             <div className="bg-gray-900/50 mt-4 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-300">AI Quick Actions:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                    {['Add error handling', 'Optimize performance', 'Add comments', 'Make responsive'].map(s => (
                        <button key={s} onClick={() => applySuggestion(s)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1 rounded-full transition-colors">
                            {s}
                        </button>
                    ))}
                </div>
            </div>
        </Card>
    );
};

export default CodeGenerationPanel;
