
import React, { useState, useEffect } from 'react';
import Button from '../Button';

interface OutputPanelProps {
    output: string;
    setOutput: (output: string) => void;
    code: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ output, setOutput, code }) => {
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const isHtml = code.trim().startsWith('<') || code.toLowerCase().includes('<html>');
        if (isHtml && output.includes('Opening in preview panel')) {
            setShowPreview(true);
        }
    }, [output, code]);

    const clearOutput = () => {
        setOutput('💡 Output will appear here...');
        setShowPreview(false);
    };

    const closePreview = () => {
        setShowPreview(false);
        setOutput('Preview closed.');
    };

    return (
        <div className="bg-[#1e2b35] rounded-lg p-4 shadow-lg">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold">Output:</h3>
                <Button onClick={clearOutput} icon="fas fa-broom" variant="secondary" className="w-auto px-4 text-sm">Clear Output</Button>
            </div>
            <pre className="bg-gray-900 p-3 rounded-lg text-gray-300 text-sm whitespace-pre-wrap min-h-[60px]">{output}</pre>
            
            {showPreview && (
                <div className="mt-4">
                     <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Live Preview</h4>
                        <Button onClick={closePreview} variant="secondary" className="w-auto px-4 text-sm">Close</Button>
                     </div>
                     <iframe
                        srcDoc={code}
                        title="Live Preview"
                        sandbox="allow-scripts"
                        className="w-full h-80 rounded-lg border-2 border-gray-700 bg-white"
                     />
                </div>
            )}
        </div>
    );
};

export default OutputPanel;
