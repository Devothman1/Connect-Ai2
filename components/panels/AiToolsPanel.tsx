import React, { useState, useMemo } from 'react';
import Card from '../Card';
import Button from '../Button';
import Loader from '../Loader';
import * as geminiService from '../../services/geminiService';

const AiToolsPanel: React.FC = () => {
    // State for Regex Generator
    const [isRegexLoading, setIsRegexLoading] = useState(false);
    const [regexDescription, setRegexDescription] = useState('');
    const [regexResult, setRegexResult] = useState('');
    const [copySuccess, setCopySuccess] = useState('');

    // State for Documentation Finder
    const [isDocLoading, setIsDocLoading] = useState(false);
    const [docQuery, setDocQuery] = useState('');
    const [docResult, setDocResult] = useState<{ answer: string; sources: any[] } | null>(null);

    const handleGenerateRegex = async () => {
        if (!regexDescription.trim()) {
            setRegexResult('---Please enter a description.');
            return;
        }
        setIsRegexLoading(true);
        setRegexResult('');
        setCopySuccess('');
        try {
            const res = await geminiService.generateRegex(regexDescription);
            setRegexResult(res);
        } catch (error) {
            const errorMessage = `Error generating regex: ${error instanceof Error ? error.message : 'Unknown error'}`;
            setRegexResult(`---${errorMessage}`);
        } finally {
            setIsRegexLoading(false);
        }
    };

    const { regex, explanation } = useMemo(() => {
        if (!regexResult) return { regex: '', explanation: '' };
        const parts = regexResult.split('---');
        return {
            regex: parts[0]?.trim() || '',
            explanation: parts[1]?.trim() || 'No explanation provided.'
        };
    }, [regexResult]);

    const copyRegex = () => {
        if (!regex) return;
        navigator.clipboard.writeText(regex).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };
    
    const handleFindDocs = async () => {
        if (!docQuery.trim()) return;
        setIsDocLoading(true);
        setDocResult(null);
        try {
            const result = await geminiService.findDocumentation(docQuery);
            setDocResult(result);
        } catch (error) {
            setDocResult({ answer: `Error finding documentation: ${error instanceof Error ? error.message : 'Unknown error'}`, sources: [] });
        } finally {
            setIsDocLoading(false);
        }
    };

    const regexSuggestions = [
        "A valid email address.", "A URL with http or https.", "A phone number in (555) 555-5555 format.", "A password with at least 8 characters, one uppercase, one lowercase, and one number."
    ];
    
    const docSuggestions = [
        "What are the new features in React 19?",
        "How to use async/await in JavaScript?",
        "Explain the CSS box model.",
    ];

    return (
        <Card title="AI Tools" icon="fas fa-tools">
            {/* Regex Generator */}
            <div className="bg-[#1e2b35] rounded-lg p-4 shadow-inner">
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-3 mb-3"><i className="fas fa-ruler-combined"></i>Regex Generator</h3>
                <p className="text-sm text-gray-400 mb-4">Describe the text pattern you want to match, and the AI will generate a regular expression for you.</p>
                <textarea value={regexDescription} onChange={(e) => setRegexDescription(e.target.value)} placeholder="e.g., A valid email address" className="w-full min-h-[100px] p-2.5 rounded-lg border-none text-base bg-gray-900 text-white font-mono resize-y focus:ring-2 focus:ring-cyan-500" aria-label="Regex description input" />
                <div className="mt-2 mb-4 text-xs text-gray-400"><h4 className="font-semibold mb-1">Suggestions:</h4><ul className="list-disc list-inside">{regexSuggestions.map((s, i) => (<li key={i} className="cursor-pointer hover:text-cyan-400" onClick={() => setRegexDescription(s)}>{s}</li>))}</ul></div>
                <Button onClick={handleGenerateRegex} isLoading={isRegexLoading} icon="fas fa-magic-wand-sparkles">Generate Regex</Button>
                <div className="mt-6"><h4 className="text-md font-semibold mb-2">Result:</h4><div className="bg-gray-900 p-4 rounded-lg min-h-[150px]">{isRegexLoading ? <Loader text="Generating..." /> : (regexResult ? (<div><div className="mb-4"><label className="block text-sm font-semibold text-gray-400 mb-1">Generated Expression:</label><div className="flex items-center gap-2 bg-gray-800 p-2 rounded-md"><pre className="text-cyan-300 text-sm whitespace-pre-wrap flex-grow font-mono">{regex}</pre><button onClick={copyRegex} title="Copy Regex" className="flex-shrink-0 w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center relative" aria-label="Copy regular expression"><i className="far fa-copy"></i>{copySuccess && <span className="absolute -top-7 text-xs bg-gray-900 px-2 py-0.5 rounded" role="status">{copySuccess}</span>}</button></div></div><div><label className="block text-sm font-semibold text-gray-400 mb-1">Explanation:</label><p className="text-gray-300 text-sm whitespace-pre-wrap">{explanation}</p></div></div>) : (<p className="text-gray-500">The generated regex and its explanation will appear here.</p>))}</div></div>
            </div>

            {/* Documentation Finder */}
            <div className="bg-[#1e2b35] rounded-lg p-4 shadow-inner mt-6">
                <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-3 mb-3"><i className="fas fa-book-reader"></i>AI Documentation Finder</h3>
                <p className="text-sm text-gray-400 mb-4">Ask a question about a programming concept or library, and the AI will find the latest information for you using Google Search.</p>
                <textarea value={docQuery} onChange={(e) => setDocQuery(e.target.value)} placeholder="e.g., How do Promises work in JavaScript?" className="w-full min-h-[70px] p-2.5 rounded-lg border-none text-base bg-gray-900 text-white font-mono resize-y focus:ring-2 focus:ring-cyan-500" aria-label="Documentation question input" />
                 <div className="mt-2 mb-4 text-xs text-gray-400"><h4 className="font-semibold mb-1">Suggestions:</h4><ul className="list-disc list-inside">{docSuggestions.map((s, i) => (<li key={i} className="cursor-pointer hover:text-cyan-400" onClick={() => setDocQuery(s)}>{s}</li>))}</ul></div>
                <Button onClick={handleFindDocs} isLoading={isDocLoading} icon="fas fa-search">Find Docs</Button>
                <div className="mt-6"><h4 className="text-md font-semibold mb-2">Answer:</h4><div className="bg-gray-900 p-4 rounded-lg min-h-[150px]">{isDocLoading ? <Loader text="Searching..." /> : (docResult ? (<div><p className="text-gray-300 text-sm whitespace-pre-wrap">{docResult.answer}</p>{docResult.sources && docResult.sources.length > 0 && (<div className="mt-4 pt-3 border-t border-gray-700"><h5 className="text-sm font-semibold text-gray-400 mb-2">Sources:</h5><ul className="list-disc list-inside space-y-1">{docResult.sources.map((s, i) => (<li key={i} className="text-xs"><a href={s.web?.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{s.web?.title}</a></li>))}</ul></div>)}</div>) : (<p className="text-gray-500">The answer will appear here.</p>))}</div></div>
            </div>
        </Card>
    );
};

export default AiToolsPanel;
