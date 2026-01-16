import React from 'react';

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  active?: boolean;
  tooltip?: string;
  icon?: React.ReactNode;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ 
  isActive, 
  active,
  className = '', 
  children, 
  tooltip,
  icon,
  ...props 
}) => {
  const isActivated = isActive || active;

  return (
    <button 
      className={`
        p-1 rounded-sm min-w-[26px] h-[26px] flex items-center justify-center relative group transition-all duration-75
        ${isActivated 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'}
        ${props.disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-600' : ''}
        ${className}
      `}
      title={tooltip}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};