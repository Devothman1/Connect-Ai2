
import React from 'react';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', text }) => {
    const sizeClasses = {
        sm: 'w-5 h-5 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-4',
    };

    return (
        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
            <div className={`spinner border-gray-600 border-t-cyan-400 rounded-full animate-spin ${sizeClasses[size]}`}></div>
            {text && <p className="text-sm">{text}</p>}
        </div>
    );
};

export default Loader;
