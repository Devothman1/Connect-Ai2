
import React from 'react';
import { Tab } from '../constants';

interface TabsProps {
    tabs: Tab[];
    activeTab: Tab;
    setActiveTab: (tab: Tab) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-2">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                        activeTab === tab 
                        ? 'bg-cyan-500 text-slate-900' 
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
                    }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
