
import React, { useState } from 'react';
import Card from '../Card';
import { File } from '../../types';
import Button from '../Button';
import * as geminiService from '../../services/geminiService';
import Loader from '../Loader';

interface LearningPathPanelProps {
     allFiles: File[];
}

const PathStep: React.FC<{ number: number; title: string; status: string; progress?: number; }> = ({ number, title, status, progress }) => (
    <div className="flex items-center gap-4 p-2 rounded-lg">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${status === 'Completed' ? 'bg-green-500' : status === 'In Progress' ? 'bg-cyan-500' : 'bg-gray-600'}`}>
            {status === 'Completed' ? <i className="fas fa-check"></i> : number}
        </div>
        <div>
            <strong className="block">{title}</strong>
            <div className="text-sm text-gray-400">{status} {progress && `(${progress}%)`}</div>
        </div>
    </div>
);

const initialInsights = `<i class="fas fa-chart-line text-cyan-400 mt-1"></i><strong>Pattern Detected:</strong> You're improving quickly with loop structures!<br/>
<i class="fas fa-lightbulb text-yellow-400 mt-1"></i><strong>Recommendation:</strong> Practice with array methods like .map() and .filter() to strengthen your skills.<br/>
<i class="fas fa-crosshairs text-red-400 mt-1"></i><strong>Focus Area:</strong> Pay attention to error handling in your functions.`;

const LearningPathPanel: React.FC<LearningPathPanelProps> = ({ allFiles }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [aiInsights, setAiInsights] = useState(initialInsights);

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const result = await geminiService.getLearningPathUpdate(allFiles);
            // Simple formatting to make it look like the original
            const formattedResult = result
                .replace(/1\. (.*?):/g, '<i class="fas fa-chart-line text-cyan-400 mt-1"></i><strong>$1:</strong>')
                .replace(/2\. (.*?):/g, '<i class="fas fa-lightbulb text-yellow-400 mt-1"></i><strong>$1:</strong>')
                .replace(/3\. (.*?):/g, '<i class="fas fa-crosshairs text-red-400 mt-1"></i><strong>$1:</strong>')
                .replace(/\n/g, '<br/>');
            setAiInsights(formattedResult);
        } catch (error) {
            setAiInsights(`Error updating insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="Personalized Learning Path" icon="fas fa-graduation-cap">
            <h4 className="font-semibold text-gray-300 mb-2">Your JavaScript Learning Journey:</h4>
            <div className="space-y-2">
                <PathStep number={1} title="Basic Syntax" status="Completed" />
                <PathStep number={2} title="Functions & Variables" status="Completed" />
                <PathStep number={3} title="Control Structures" status="In Progress" progress={80} />
                <PathStep number={4} title="Object-Oriented Programming" status="Next Step" />
                <PathStep number={5} title="Advanced Algorithms" status="Locked" />
            </div>
            <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
                 <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-300">AI Learning Insights:</h4>
                    <Button onClick={handleUpdate} isLoading={isLoading} icon="fas fa-sync-alt" variant="secondary" className="w-auto px-3 py-1 text-xs">Update with AI</Button>
                 </div>
                 {isLoading ? <Loader text="Analyzing your code..."/> : (
                    <div className="space-y-2 text-sm text-gray-400" dangerouslySetInnerHTML={{ __html: aiInsights }} />
                 )}
            </div>
        </Card>
    );
};

export default LearningPathPanel;
