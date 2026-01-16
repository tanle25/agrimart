'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Ban } from 'lucide-react';
import { ColorPalette } from './ColorPalette';

interface ColorPickerProps {
  icon: React.ReactNode;
  type: 'text' | 'highlight';
  defaultColor: string;
  tooltip: string;
  onSelect: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ icon, type, defaultColor, tooltip, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState(defaultColor);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (color: string) => {
    setCurrentColor(color);
    onSelect(color);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseDown={(e) => e.preventDefault()}
        className="group relative flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
        title={tooltip}
      >
        <div className="flex flex-col items-center justify-center gap-0.5">
            <div className="text-gray-600">{icon}</div>
            <div 
                className="w-4 h-1 rounded-full border border-gray-200" 
                style={{ backgroundColor: currentColor === 'transparent' ? 'transparent' : currentColor }}
            >
                {/* Visual cue for transparent/no color */}
                {currentColor === 'transparent' && (
                    <div className="w-full h-full relative overflow-hidden">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-400 -rotate-12 transform -translate-y-1/2"></div>
                    </div>
                )}
            </div>
        </div>
        <ChevronDown size={10} className="ml-0.5 text-gray-400 group-hover:text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.15)] border border-gray-200 z-50 animate-in fade-in zoom-in-95 duration-100 min-w-[260px]">
           
           {/* Reset / Default Button */}
           <button 
              onClick={() => handleSelect(type === 'text' ? '#000000' : 'transparent')}
              className="w-full flex items-center gap-2 px-2 py-1.5 mb-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200 group"
           >
              <div className="w-6 h-6 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 group-hover:text-red-500 transition-colors">
                  <Ban size={14} />
              </div>
              <span className="font-medium">Mặc định</span>
           </button>

           <ColorPalette 
              selectedColor={currentColor}
              onSelect={handleSelect}
           />
           
           <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center px-1">
             <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                {type === 'text' ? 'Màu chữ' : 'Màu nền'}
             </span>
             <span className="text-[10px] text-gray-400 font-mono">
                {currentColor === 'transparent' ? 'None' : currentColor}
             </span>
           </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
