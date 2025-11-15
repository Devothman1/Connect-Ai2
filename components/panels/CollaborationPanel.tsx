
import React from 'react';
import Card from '../Card';
import Button from '../Button';

const originalCode = `function example() {
  console.log("Hello World");
}`;

const improvedCode = `/**
 * Example function with improved documentation and strict mode.
 * It logs a greeting message to the console.
 */
function example() {
  'use strict';
  console.log("Hello World - Application initialized");
  return; // Explicit return
}`;

const CollaborationPanel: React.FC = () => {
    return (
        <Card title="Collaborative Coding" icon="fas fa-users">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="font-semibold mb-1">Original Code</h4>
                    <textarea readOnly value={originalCode} className="w-full h-48 bg-gray-900 font-mono text-sm p-2 rounded-lg" />
                </div>
                <div>
                    <h4 className="font-semibold mb-1">AI Improved Code</h4>
                    <textarea readOnly value={improvedCode} className="w-full h-48 bg-gray-900 font-mono text-sm p-2 rounded-lg" />
                </div>
            </div>
            <div className="mt-4">
                <h4 className="font-semibold mb-2">Code Version History</h4>
                <div className="space-y-1 text-sm">
                    <div className="bg-cyan-500/20 p-2 rounded-md"><strong>Version 3.1</strong> - AI optimized with documentation</div>
                    <div className="bg-gray-900/50 p-2 rounded-md"><strong>Version 3.0</strong> - Added error handling</div>
                    <div className="bg-gray-900/50 p-2 rounded-md"><strong>Version 2.0</strong> - Refactored structure</div>
                    <div className="bg-gray-900/50 p-2 rounded-md"><strong>Version 1.0</strong> - Initial implementation</div>
                </div>
            </div>
            <div className="mt-4">
                 <Button variant="primary" icon="fas fa-broadcast-tower">Start Live Collaboration Session</Button>
            </div>
        </Card>
    );
};

export default CollaborationPanel;
