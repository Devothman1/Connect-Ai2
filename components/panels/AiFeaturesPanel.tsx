import React from 'react';
import Card from '../Card';
import Loader from '../Loader';
import * as geminiService from '../../services/geminiService';

interface AiFeaturesPanelProps {
    onFeatureSelect: (feature: (code: string) => Promise<string>) => void;
    isLoading: boolean;
    aiOutput: string;
}

const FeatureButton: React.FC<{icon: string, title: string, description: string, onClick: () => void}> = ({icon, title, description, onClick}) => (
    <div className="bg-gray-900/50 p-3 rounded-lg text-center cursor-pointer hover:bg-gray-800 transition-colors h-full flex flex-col justify-center items-center" onClick={onClick}>
        <div className="text-2xl text-cyan-400 mb-1"><i className={icon}></i></div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-gray-400 mt-1">{description}</div>
    </div>
);


const AiFeaturesPanel: React.FC<AiFeaturesPanelProps> = ({ onFeatureSelect, isLoading, aiOutput }) => {
    const features = [
        { icon: 'fas fa-info-circle', title: 'Explain Code', description: 'Get detailed explanations', handler: () => onFeatureSelect(geminiService.explainCode) },
        { icon: 'fas fa-sync-alt', title: 'Refactor Code', description: 'Improve code structure', handler: () => onFeatureSelect(geminiService.refactorCode) },
        { icon: 'fas fa-wrench', title: 'Fix Bugs', description: 'Automatically fix errors', handler: () => onFeatureSelect(geminiService.fixCode) },
        { icon: 'fas fa-tachometer-alt', title: 'Optimize Code', description: 'Improve performance', handler: () => onFeatureSelect(geminiService.optimizeCode) },
        { icon: 'far fa-comment-dots', title: 'Add Comments', description: 'Generate documentation', handler: () => onFeatureSelect(geminiService.addComments) },
        { icon: 'fas fa-file-alt', title: 'Generate Docs', description: 'Add JSDoc comments', handler: () => onFeatureSelect(geminiService.generateDocs) },
        { icon: 'fab fa-git-alt', title: 'Commit Message', description: 'Suggest a commit message', handler: () => onFeatureSelect(geminiService.generateCommitMessage) },
        { icon: 'fas fa-palette', title: 'UI/UX Review', description: 'Get design feedback', handler: () => onFeatureSelect(geminiService.reviewUiUx) },
        { icon: 'fas fa-language', title: 'Translate Code', description: 'To Python, JS, etc.', handler: () => onFeatureSelect(code => geminiService.translateCode(code, 'Python')) },
        { icon: 'fas fa-lightbulb', title: 'Suggest Improvements', description: 'AI recommendations', handler: () => onFeatureSelect(geminiService.suggestImprovements) },
        { icon: 'fas fa-search', title: 'Code Review', description: 'Comprehensive analysis', handler: () => onFeatureSelect(geminiService.codeReview) },
        { icon: 'fas fa-vial', title: 'Generate Tests', description: 'Create unit tests', handler: () => onFeatureSelect(geminiService.generateTests) },
        { icon: 'fas fa-project-diagram', title: 'Detect Patterns', description: 'Identify code patterns', handler: () => onFeatureSelect(geminiService.detectPatterns) },
        { icon: 'fas fa-shield-alt', title: 'Security Scan', description: 'Vulnerability detection', handler: () => onFeatureSelect(geminiService.securityScan) },
        { icon: 'fas fa-chart-line', title: 'Performance Analysis', description: 'Find bottlenecks', handler: () => onFeatureSelect(geminiService.performanceAnalysis) },
        { icon: 'fas fa-code-branch', title: 'Code Visualization', description: 'Generate text diagrams', handler: () => onFeatureSelect(geminiService.codeVisualization) },
        { icon: 'fas fa-bug', title: 'Bug Prediction', description: 'Find potential issues', handler: () => onFeatureSelect(geminiService.bugPrediction) },
        { icon: 'fas fa-sitemap', title: 'Architecture Suggestions', description: 'Structural improvements', handler: () => onFeatureSelect(geminiService.architectureSuggestions) },
        { icon: 'fas fa-chart-bar', title: 'Code Metrics', description: 'Get detailed analysis', handler: () => onFeatureSelect(geminiService.codeMetrics) },
        { icon: 'fas fa-graduation-cap', title: 'Learning Recommendations', description: 'Personalized guidance', handler: () => onFeatureSelect(geminiService.learningRecommendations) },
        { icon: 'fas fa-users', title: 'AI Pair Programming', description: 'Collaborative coding', handler: () => onFeatureSelect(geminiService.aiPairProgramming) },
    ];
    
    return (
        <Card title="Advanced AI Features" icon="fas fa-robot">
             <p className="text-sm text-gray-400 mb-4">Select an AI feature to run on your currently active file in the editor.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {features.map(feature => <FeatureButton key={feature.title} {...feature} onClick={feature.handler} />)}
            </div>
            <div className="mt-6">
                <h3 className="text-md font-semibold mb-2 flex items-center gap-2"><i className="fas fa-magic-wand-sparkles"></i>AI Results:</h3>
                <div className="bg-gray-900 p-4 rounded-lg min-h-[150px] max-h-96 overflow-auto">
                    {isLoading ? <Loader text="Processing..." /> : (
                         <pre className="text-gray-300 text-sm whitespace-pre-wrap">{aiOutput}</pre>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default AiFeaturesPanel;