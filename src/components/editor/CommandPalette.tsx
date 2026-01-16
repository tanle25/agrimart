'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Command, Search, X, Hash, FileText, Image, Link as LinkIcon, Table, Code, Type } from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  keywords: string[];
  icon: React.ReactNode;
  category: string;
  action: () => void;
}

interface CommandPaletteProps {
  editor: any;
  onClose: () => void;
  onAction: (action: string, value?: any) => void;
}

const COMMANDS: Omit<CommandItem, 'action'>[] = [
  // Formatting
  { id: 'bold', label: 'Bold', keywords: ['bold', 'in đậm', 'đậm'], icon: <Type size={16} />, category: 'Formatting' },
  { id: 'italic', label: 'Italic', keywords: ['italic', 'nghiêng'], icon: <Type size={16} />, category: 'Formatting' },
  { id: 'underline', label: 'Underline', keywords: ['underline', 'gạch chân'], icon: <Type size={16} />, category: 'Formatting' },
  
  // Headings
  { id: 'h1', label: 'Heading 1', keywords: ['h1', 'heading', 'tiêu đề'], icon: <Hash size={16} />, category: 'Headings' },
  { id: 'h2', label: 'Heading 2', keywords: ['h2', 'heading', 'tiêu đề'], icon: <Hash size={16} />, category: 'Headings' },
  { id: 'h3', label: 'Heading 3', keywords: ['h3', 'heading', 'tiêu đề'], icon: <Hash size={16} />, category: 'Headings' },
  
  // Insert
  { id: 'image', label: 'Insert Image', keywords: ['image', 'ảnh', 'picture'], icon: <Image size={16} />, category: 'Insert' },
  { id: 'link', label: 'Insert Link', keywords: ['link', 'liên kết', 'url'], icon: <LinkIcon size={16} />, category: 'Insert' },
  { id: 'table', label: 'Insert Table', keywords: ['table', 'bảng'], icon: <Table size={16} />, category: 'Insert' },
  { id: 'code', label: 'Insert Code Block', keywords: ['code', 'mã'], icon: <Code size={16} />, category: 'Insert' },
  
  // Actions
  { id: 'undo', label: 'Undo', keywords: ['undo', 'hoàn tác'], icon: <Command size={16} />, category: 'Actions' },
  { id: 'redo', label: 'Redo', keywords: ['redo', 'làm lại'], icon: <Command size={16} />, category: 'Actions' },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({ editor, onClose, onAction }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [search, selectedIndex]);

  const filteredCommands = useMemo(() => {
    if (!search.trim()) return [];

    const searchLower = search.toLowerCase();
    const items: CommandItem[] = COMMANDS.map(cmd => ({
      ...cmd,
      action: () => {
        onAction(cmd.id);
        onClose();
      },
    })).filter(cmd => {
      return cmd.label.toLowerCase().includes(searchLower) ||
             cmd.keywords.some(k => k.toLowerCase().includes(searchLower));
    });

    // Group by category
    const grouped = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, CommandItem[]>);

    return Object.values(grouped).flat();
  }, [search, onAction, onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!editor) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        ref={dialogRef}
        className="relative w-[600px] bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <Search size={20} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm lệnh... (Gõ để tìm)"
            className="flex-1 text-lg outline-none text-gray-800 placeholder:text-gray-400"
          />
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono text-gray-600">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {search.trim() === '' ? (
            <div className="text-center py-12 text-gray-400">
              <Command size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">Gõ để tìm kiếm lệnh...</p>
              <p className="text-xs mt-2 text-gray-500">Ví dụ: "bold", "image", "table"</p>
            </div>
          ) : filteredCommands.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm">Không tìm thấy lệnh</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredCommands.map((cmd, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`p-1.5 rounded ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {cmd.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{cmd.label}</div>
                      <div className="text-xs text-gray-500">{cmd.category}</div>
                    </div>
                    {isSelected && (
                      <kbd className="px-2 py-1 bg-blue-100 border border-blue-300 rounded text-xs font-mono">
                        ⏎
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-gray-300 rounded">⏎</kbd>
              Select
            </span>
          </div>
          <span>{filteredCommands.length} kết quả</span>
        </div>
      </div>
    </div>
  );
};

