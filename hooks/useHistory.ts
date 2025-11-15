
import { useState, useCallback, useEffect } from 'react';
import { HistoryEntry } from '../types';

const HISTORY_KEY = 'ai_smart_editor_history';

export const useHistory = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(HISTORY_KEY);
            if (storedHistory) {
                setHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load history from localStorage", error);
        }
    }, []);

    const saveHistoryEntry = useCallback((action: string, code: string) => {
        setHistory(prevHistory => {
            const newEntry: HistoryEntry = { id: Date.now(), action, code };
            const updatedHistory = [newEntry, ...prevHistory].slice(0, 50);
            try {
                localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
            } catch (error) {
                console.error("Failed to save history to localStorage", error);
            }
            return updatedHistory;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        try {
            localStorage.removeItem(HISTORY_KEY);
        } catch (error) {
            console.error("Failed to clear history from localStorage", error);
        }
    }, []);

    return { history, saveHistoryEntry, clearHistory };
};
