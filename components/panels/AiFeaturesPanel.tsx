import React, { useState, useEffect, useRef } from 'react';
import Card from '../Card';
import Loader from '../Loader';
import * as geminiService from '../../services/geminiService';
import * as audioUtils from '../../utils/audio';
import Button from '../Button';

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
    const [isSpeaking, setIsSpeaking] = useState(false);
    const mermaidContainerRef = useRef<HTMLDivElement>(null);
    
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
        { icon: 'fas fa-sitemap', title: 'Generate Diagram', description: 'Visualize with Mermaid.js', handler: () => onFeatureSelect(geminiService.generateDiagram) },
        { icon: 'fas fa-bug', title: 'Bug Prediction', description: 'Find potential issues', handler: () => onFeatureSelect(geminiService.bugPrediction) },
        { icon: 'fas fa-sitemap', title: 'Architecture Suggestions', description: 'Structural improvements', handler: () => onFeatureSelect(geminiService.architectureSuggestions) },
        { icon: 'fas fa-chart-bar', title: 'Code Metrics', description: 'Get detailed analysis', handler: () => onFeatureSelect(geminiService.codeMetrics) },
        { icon: 'fas fa-graduation-cap', title: 'Learning Recommendations', description: 'Personalized guidance', handler: () => onFeatureSelect(geminiService.learningRecommendations) },
        { icon: 'fas fa-users', title: 'AI Pair Programming', description: 'Collaborative coding', handler: () => onFeatureSelect(geminiService.aiPairProgramming) },
        { icon: 'fas fa-quote-left', title: 'Code to Text', description: 'Summarize code in English', handler: () => onFeatureSelect(geminiService.codeToNaturalLanguage) },
        { icon: 'fas fa-brain', title: 'Identify Algorithm', description: 'Detect known algorithms', handler: () => onFeatureSelect(geminiService.identifyAlgorithm) },
        { icon: 'fas fa-book-open', title: 'Generate Usage', description: 'Create an example of use', handler: () => onFeatureSelect(geminiService.generateApiUsage) },
    ];
    
    const isMermaid = aiOutput.trim().match(/^(graph|flowchart|sequenceDiagram|gantt|classDiagram|stateDiagram|pie|erDiagram|journey|requirementDiagram)/);
    const mermaidCode = aiOutput.replace(/```mermaid\n|```/g, '').trim();

    useEffect(() => {
        if (isMermaid && mermaidContainerRef.current) {
            try {
                mermaidContainerRef.current.innerHTML = mermaidCode;
                // Remove any previously rendered SVG by mermaid to prevent duplicates
                const existingSvg = mermaidContainerRef.current.querySelector('svg');
                if (existingSvg) {
                    existingSvg.remove();
                }
                (window as any).mermaid.run({ nodes: [mermaidContainerRef.current] });
            } catch(e) {
                console.error("Mermaid rendering error:", e);
                mermaidContainerRef.current.innerHTML = "Error rendering diagram.";
            }
        }
    }, [aiOutput, isMermaid, mermaidCode]);

    const handleReadAloud = async () => {
        if (!aiOutput || isLoading || isSpeaking) return;
        setIsSpeaking(true);
        try {
            const audioB64 = await geminiService.generateSpeech(aiOutput);
            await audioUtils.playAudio(audioB64);
        } catch (e) {
            console.error("Speech generation/playback failed", e);
        } finally {
            setIsSpeaking(false);
        }
    }

    return (
        <Card title="Advanced AI Features" icon="fas fa-robot">
             <p className="text-sm text-gray-400 mb-4">Select an AI feature to run on your currently active file in the editor.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {features.map(feature => <FeatureButton key={feature.title} {...feature} onClick={feature.handler} />)}
            </div>
            <div className="mt-6">
                <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
                    <i className="fas fa-magic-wand-sparkles"></i>AI Results:
                     <Button 
                        onClick={handleReadAloud} 
                        disabled={isSpeaking || !aiOutput || isLoading || isMermaid}
                        variant="secondary"
                        className="w-auto px-3 py-1 text-xs h-auto"
                        title={isMermaid ? "Cannot read diagrams" : "Read result aloud"}
                    >
                        {isSpeaking ? <Loader size="sm" /> : <><i className="fas fa-volume-up mr-1"></i> Read Aloud</>}
                    </Button>
                </h3>
                <div className="bg-gray-900 p-4 rounded-lg min-h-[150px] max-h-96 overflow-auto">
                    {isLoading ? <Loader text="Processing..." /> : (
                         isMermaid ? (
                             <div ref={mermaidContainerRef} className="mermaid-container" />
                         ) : (
                             <pre className="text-gray-300 text-sm whitespace-pre-wrap">{aiOutput}</pre>
                         )
                    )}
                </div>
            </div>
        </Card>
    );
};

export default AiFeaturesPanel;
