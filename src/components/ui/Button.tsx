import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  tooltip?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  isActive, 
  variant = 'ghost', 
  className = '', 
  children, 
  tooltip,
  ...props 
}) => {
  const baseStyles = "p-2 rounded-md transition-all duration-200 flex items-center justify-center relative group";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    ghost: isActive 
      ? "bg-blue-100 text-blue-700" 
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
      {tooltip && (
        <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
          {tooltip}
        </span>
      )}
    </button>
  );
};