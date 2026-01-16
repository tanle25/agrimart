"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = 'Chọn...',
    disabled = false,
    className = ''
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get selected label
    const selectedOption = options.find(opt => opt.value === value);

    // Filter options
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const toggleOpen = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setTimeout(() => inputRef.current?.focus(), 100);
            }
        }
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                className={`w-full px-4 py-2 border rounded-lg flex items-center justify-between cursor-pointer bg-white transition-colors
                    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'hover:border-green-500'}
                    ${isOpen ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'}
                `}
                onClick={toggleOpen}
            >
                <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-800'}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                                placeholder="Tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    className={`px-3 py-2 text-sm rounded-md cursor-pointer transition-colors flex items-center justify-between
                                        ${opt.value === value ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}
                                    `}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(opt.value);
                                    }}
                                >
                                    {opt.label}
                                    {opt.value === value && <span className="w-1.5 h-1.5 rounded-full bg-green-500 ml-2" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                Không tìm thấy kết quả
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
