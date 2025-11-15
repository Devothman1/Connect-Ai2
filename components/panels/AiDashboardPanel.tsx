
import React, { useState } from 'react';
import Card from '../Card';
import { File } from '../../types';
import Button from '../Button';
import * as geminiService from '../../services/geminiService';
import Loader from '../Loader';

interface AiDashboardPanelProps {
    allFiles: File[];
}

const DashboardMetric: React.FC<{title: string; icon: string; value: number; color: string}> = ({title, icon, value, color}) => (
     <div className="bg-gray-900/50 p-4 rounded-lg">
        <h4 className="text-base font-semibold flex items-center gap-2"><i className={icon}></i> {title}</h4>
        <div className="flex gap-4 items-center mt-2">
            <div className="flex-shrink-0" style={{width: 78, height: 78, borderRadius: '50%', background: `conic-gradient(${color} 0% ${value}%, #374151 ${value}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <strong className="text-xl">{value}%</strong>
            </div>
            <div>
                 <div className="h-3.5 bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full" style={{width: `${value}%`, background: color}}></div>
                </div>
            </div>
        </div>
    </div>
);

const AiDashboardPanel: React.FC<AiDashboardPanelProps> = ({ allFiles }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [projectReview, setProjectReview] = useState('Click "Analyze Entire Project" to get an AI-powered review of your code.');

    const handleProjectReview = async () => {
        setIsLoading(true);
        setProjectReview('Analyzing project...');
        try {
            const review = await geminiService.getProjectReview(allFiles);
            setProjectReview(review);
        } catch (error) {
            setProjectReview(`Error getting project review: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="AI Learning Dashboard" icon="fas fa-tachometer-alt">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DashboardMetric title="Code Quality" icon="fas fa-code" value={78} color="#00bcd4" />
                <DashboardMetric title="Learning Progress" icon="fas fa-brain" value={62} color="#2196f3" />
                <DashboardMetric title="Performance Score" icon="fas fa-bolt" value={70} color="#ff9800" />
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-900/50 p-3 rounded-lg"><div className="text-2xl font-bold">15</div><div className="text-sm text-gray-400">Projects</div></div>
                <div className="bg-gray-900/50 p-3 rounded-lg"><div className="text-2xl font-bold">42</div><div className="text-sm text-gray-400">AI Reviews</div></div>
                <div className="bg-gray-900/50 p-3 rounded-lg"><div className="text-2xl font-bold">8</div><div className="text-sm text-gray-400">Skills</div></div>
                <div className="bg-gray-900/50 p-3 rounded-lg"><div className="text-2xl font-bold">127</div><div className="text-sm text-gray-400">Code Hours</div></div>
            </div>
            <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">AI Project Review</h3>
                    <Button onClick={handleProjectReview} isLoading={isLoading} icon="fas fa-search" variant="primary">Analyze Entire Project</Button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg min-h-[100px]">
                    {isLoading ? <Loader text="Reviewing all files..."/> : <pre className="text-sm text-gray-300 whitespace-pre-wrap">{projectReview}</pre>}
                </div>
            </div>
        </Card>
    );
};

export default AiDashboardPanel;
