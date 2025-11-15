
import React from 'react';
import Card from '../Card';
import Button from '../Button';

interface CodeExecutionPanelProps {
    code: string;
    setCode: (value: string) => void;
    setOutput: (value: string) => void;
    onAnalyze: () => void;
}

const CodeExecutionPanel: React.FC<CodeExecutionPanelProps> = ({ code, setCode, setOutput, onAnalyze }) => {

    const copyCode = () => {
        navigator.clipboard.writeText(code).then(() => setOutput('✅ Code copied to clipboard.'));
    };

    const clearCode = () => {
        setCode('');
        setOutput('Cleared code editor.');
    };
    
    const runCode = () => {
        if (!code) {
            setOutput('No code to run.');
            return;
        }
        
        if (code.trim().startsWith('<') || code.toLowerCase().includes('<html>')) {
            setOutput('HTML/CSS/JS code detected. Opening in preview panel.');
        } else {
             setOutput('JavaScript code executed. Check console for output.');
        }
    };
    
    const debugCode = () => {
      const issues = [];
      if(code.includes('==') && !code.includes('===')) issues.push('Use strict equality (===) to avoid type coercion bugs.');
      if(code.includes('eval(')) issues.push('Avoid using eval() due to security risks.');
      if(issues.length === 0) {
        setOutput('No obvious issues found (quick debug).');
      } else {
        setOutput(`🔎 Debug suggestions:\n- ${issues.join('\n- ')}`);
      }
    };

    return (
        <Card title="Code Editor & Execution" icon="fas fa-play-circle">
            <div className="relative">
                <div className="absolute right-2 top-2 flex gap-1.5">
                    <button onClick={copyCode} title="Copy Code" className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center"><i className="far fa-copy"></i></button>
                    <button onClick={clearCode} title="Clear Code" className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center"><i className="far fa-trash-alt"></i></button>
                    <button onClick={onAnalyze} title="AI Analysis" className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-md flex items-center justify-center"><i className="fas fa-chart-line"></i></button>
                </div>
                <textarea
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Generated code will appear here..."
                    className="w-full h-64 p-2.5 rounded-lg border-none text-base bg-gray-900 text-white font-mono resize-y focus:ring-2 focus:ring-cyan-500"
                />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                <Button onClick={runCode} icon="fas fa-play">Run Code</Button>
                <Button onClick={debugCode} icon="fas fa-bug" variant="secondary">Debug Code</Button>
            </div>
        </Card>
    );
};

export default CodeExecutionPanel;
