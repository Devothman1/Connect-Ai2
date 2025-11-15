
import React from 'react';
import Loader from './Loader';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    isLoading?: boolean;
    icon?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading = false, icon, ...props }) => {
    const baseClasses = "w-full py-2.5 px-4 rounded-lg font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variantClasses = {
        primary: 'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-500',
        secondary: 'bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-700 focus:ring-gray-500',
    };

    return (
        <button className={`${baseClasses} ${variantClasses[variant]}`} disabled={isLoading} {...props}>
            {isLoading ? (
                <Loader size="sm" />
            ) : (
                <>
                    {icon && <i className={icon}></i>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
