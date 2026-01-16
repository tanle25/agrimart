'use client';
import React, { useRef, useEffect } from 'react';
import { Keyboard, X, Command, FileCode } from 'lucide-react';

export const HelpDialog = ({ onClose }: { onClose: () => void }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const SHORTCUTS = [
        { key: 'Ctrl + B', desc: 'Bold' },
        { key: 'Ctrl + I', desc: 'Italic' },
        { key: 'Ctrl + U', desc: 'Underline' },
        { key: 'Ctrl + Shift + X', desc: 'Strikethrough' },
        { key: 'Ctrl + E', desc: 'Inline Code' },
        { key: 'Ctrl + Alt + 1', desc: 'Heading 1' },
        { key: 'Ctrl + Alt + 2', desc: 'Heading 2' },
        { key: 'Ctrl + Shift + L', desc: 'Bullet List' },
        { key: 'Ctrl + Shift + 7', desc: 'Numbered List' },
        { key: 'Ctrl + Shift + B', desc: 'Blockquote' },
        { key: 'Ctrl + Enter', desc: 'Hard Break' },
        { key: 'Ctrl + Z', desc: 'Undo' },
        { key: 'Ctrl + Y', desc: 'Redo' },
    ];

    const MARKDOWN = [
        { syntax: '# Text', desc: 'Heading 1' },
        { syntax: '## Text', desc: 'Heading 2' },
        { syntax: '*Text*', desc: 'Italic' },
        { syntax: '**Text**', desc: 'Bold' },
        { syntax: '- Text', desc: 'Bullet List' },
        { syntax: '1. Text', desc: 'Numbered List' },
        { syntax: '`Code`', desc: 'Inline Code' },
        { syntax: '```', desc: 'Code Block' },
        { syntax: '> Text', desc: 'Blockquote' },
        { syntax: '---', desc: 'Divider' },
    ];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <div ref={ref} className="relative w-[600px] max-h-[80vh] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Keyboard size={20} className="text-blue-600" />
                        Keyboard Shortcuts
                    </h3>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-8">
                        {/* Hotkeys */}
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Command size={14} /> Essentials
                            </h4>
                            <div className="space-y-2">
                                {SHORTCUTS.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{item.desc}</span>
                                        <kbd className="px-2 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-500 min-w-[60px] text-center shadow-sm">
                                            {item.key}
                                        </kbd>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Markdown */}
                        <div>
                             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <FileCode size={14} /> Markdown
                            </h4>
                            <div className="space-y-2">
                                {MARKDOWN.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">{item.desc}</span>
                                        <code className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs font-mono text-blue-600 min-w-[60px] text-center">
                                            {item.syntax}
                                        </code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600 text-center">
                        <p>You can also use <span className="font-semibold text-gray-800">/</span> (slash) to open the command menu while typing.</p>
                    </div>
                </div>
             </div>
        </div>
    );
};