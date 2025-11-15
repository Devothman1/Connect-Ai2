
import React from 'react';
import { HistoryEntry } from '../../types';
import Card from '../Card';
import Button from '../Button';

interface HistoryPanelProps {
    history: HistoryEntry[];
    onClearHistory: () => void;
    onLoadHistory: (code: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClearHistory, onLoadHistory }) => {
    return (
        <Card title="Code History" icon="fas fa-history">
            <Button onClick={onClearHistory} variant="secondary" icon="fas fa-trash" className="mb-3 w-auto px-4 py-1.5 h-auto text-sm">
                Clear History
            </Button>
            <div className="max-h-96 overflow-y-auto space-y-2">
                {history.length > 0 ? history.map(h => (
                    <div key={h.id} onClick={() => onLoadHistory(h.code)} className="bg-gray-900/50 p-3 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                        <div className="font-semibold text-gray-300 text-sm">{new Date(h.id).toLocaleString()} - {h.action}</div>
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap mt-1 truncate">{h.code}</pre>
                    </div>
                )) : <p className="text-gray-500">No history yet.</p>}
            </div>
        </Card>
    );
};

export default HistoryPanel;
