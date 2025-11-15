
import React from 'react';

interface CardProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '' }) => {
    return (
        <div className={`bg-[#1e2b35] rounded-lg p-4 shadow-lg hover:transform hover:-translate-y-1 transition-transform duration-250 ease-in-out ${className}`}>
            <div className="flex items-center gap-3 text-cyan-400 border-b border-gray-700 pb-2 mb-3">
                <i className={`${icon} text-xl`}></i>
                <h2 className="text-lg font-bold">{title}</h2>
            </div>
            {children}
        </div>
    );
};

export default Card;
