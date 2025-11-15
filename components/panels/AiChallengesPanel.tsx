
import React, { useState } from 'react';
import Card from '../Card';
import { Tab } from '../../constants';
import { File, FileSystemTree } from '../../types';
import Button from '../Button';
import * as geminiService from '../../services/geminiService';
import Loader from '../Loader';

interface AiChallengesPanelProps {
    setFileSystem: React.Dispatch<React.SetStateAction<FileSystemTree>>;
    setOpenFileIds: React.Dispatch<React.SetStateAction<string[]>>;
    setActiveFileId: React.Dispatch<React.SetStateAction<string | null>>;
    setOutput: (output: string) => void;
    setActiveTab: (tab: Tab) => void;
}

type ChallengeKey = 'responsive-layout' | 'form-validation' | 'api-integration' | 'game-development';

const challenges: Record<ChallengeKey, { title: string; description: string; starterCode: string; difficulty: string; time: string; color: string; fileName: string }> = {
    'responsive-layout': { title: 'Responsive Layout', description: 'Build a website layout that works on all device sizes', starterCode: `/* CSS Starter Code */\n.container { max-width: 1200px; margin: 0 auto; padding: 20px; }\n\n/* Add your responsive CSS here */\n@media (max-width: 768px) {\n  /* Styles for tablets */\n}\n\n@media (max-width: 480px) {\n  /* Styles for mobile phones */\n}`, difficulty: 'Easy', time: '15 min', color: 'text-green-400', fileName: 'style.css' },
    'form-validation': { title: 'Form Validation System', description: 'Implement client-side form validation with custom messages', starterCode: `// JS Starter Code\nconst form = document.getElementById('myForm');\n\nform.addEventListener('submit', function(event) {\n  event.preventDefault();\n  // Add your validation logic here\n  console.log('Form submitted!');\n});`, difficulty: 'Medium', time: '25 min', color: 'text-yellow-400', fileName: 'validation.js' },
    'api-integration': { title: 'API Integration', description: 'Fetch data from a REST API and display it dynamically', starterCode: `// JS Starter Code\nasync function fetchData() {\n  try {\n    const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');\n    const data = await response.json();\n    console.log(data);\n    // Display the data on the page\n  } catch (error) {\n    console.error('Error fetching data:', error);\n  }\n}\n\nfetchData();`, difficulty: 'Medium', time: '30 min', color: 'text-yellow-400', fileName: 'api.js' },
    'game-development': { title: 'Simple Game Development', description: 'Create an interactive game like Tic-Tac-Toe', starterCode: `// JS Starter Code\nclass Game {\n  constructor() {\n    this.board = Array(9).fill(null);\n    this.currentPlayer = 'X';\n    console.log('Game initialized!');\n  }\n\n  makeMove(index) {\n    // Implement game logic here\n  }\n}\n\nconst myGame = new Game();`, difficulty: 'Hard', time: '45 min', color: 'text-red-400', fileName: 'game.js' }
};

const AiChallengesPanel: React.FC<AiChallengesPanelProps> = ({ setFileSystem, setOpenFileIds, setActiveFileId, setOutput, setActiveTab }) => {
    const [selectedChallenge, setSelectedChallenge] = useState<ChallengeKey | null>(null);
    const [solution, setSolution] = useState('');
    const [review, setReview] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const startChallenge = (challengeKey: ChallengeKey) => {
        const c = challenges[challengeKey];
        const newFileId = Date.now().toString();
        const newFile: File = { id: newFileId, name: c.fileName, content: c.starterCode, type: 'file' };
        
        setFileSystem(fs => [...fs, newFile]);
        setOpenFileIds(ids => [...ids, newFileId]);
        setActiveFileId(newFileId);

        setOutput(`🎯 Started challenge: ${c.title}. The starter code has been added as ${c.fileName}.`);
        setActiveTab(Tab.EDITOR);
    };

    const handleReview = async () => {
        if (!selectedChallenge) return;
        setIsLoading(true);
        setReview('');
        try {
            const result = await geminiService.getChallengeReview(challenges[selectedChallenge], solution);
            setReview(result);
        } catch (error) {
            setReview(`Error getting review: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI-Powered Coding Challenges" icon="fas fa-trophy">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    {Object.entries(challenges).map(([key, c]) => (
                         <div key={key} onClick={() => setSelectedChallenge(key as ChallengeKey)} className={`p-4 rounded-lg cursor-pointer hover:bg-gray-800 transition-all border-l-4 ${selectedChallenge === key ? 'border-cyan-500 bg-gray-800' : 'border-transparent bg-gray-900/50'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold">{c.title}</h4>
                                    <p className="text-sm text-gray-400">{c.description}</p>
                                </div>
                                <div className="text-right ml-4 flex-shrink-0">
                                    <span className={`font-semibold text-sm ${c.color}`}>{c.difficulty}</span>
                                    <div className="text-xs text-gray-500">{c.time}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div>
                    {selectedChallenge ? (
                        <div className="bg-gray-900/50 p-4 rounded-lg h-full flex flex-col">
                            <h3 className="text-lg font-bold mb-2">{challenges[selectedChallenge].title}</h3>
                            <Button onClick={() => startChallenge(selectedChallenge)} icon="fas fa-play" className="mb-4">Start Challenge in Editor</Button>
                            <label htmlFor="solution-textarea" className="font-semibold text-sm mb-1">Or paste your solution here for review:</label>
                            <textarea 
                                id="solution-textarea"
                                value={solution}
                                onChange={(e) => setSolution(e.target.value)}
                                placeholder={`Paste your code for "${challenges[selectedChallenge].title}" here.`}
                                className="w-full flex-grow p-2.5 rounded-lg border-none text-base bg-gray-900 text-white font-mono resize-y focus:ring-2 focus:ring-cyan-500"
                            />
                            <Button onClick={handleReview} isLoading={isLoading} icon="fas fa-check" className="mt-2">Submit for AI Review</Button>
                            {review && (
                                <div className="mt-4">
                                    <h4 className="font-semibold mb-1">AI Feedback:</h4>
                                    <pre className="bg-gray-900 p-2 rounded text-sm whitespace-pre-wrap max-h-40 overflow-auto">{review}</pre>
                                </div>
                            )}
                             {isLoading && <Loader text="AI is reviewing your solution..."/>}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gray-900/50 rounded-lg text-gray-500">
                            <p>Select a challenge to begin.</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default AiChallengesPanel;
