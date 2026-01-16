'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, X, Save, RotateCcw, Command } from 'lucide-react';

interface Shortcut {
  id: string;
  action: string;
  label: string;
  defaultKey: string;
  customKey: string;
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
  { id: 'bold', action: 'bold', label: 'In đậm', defaultKey: 'Mod+b', customKey: '' },
  { id: 'italic', action: 'italic', label: 'In nghiêng', defaultKey: 'Mod+i', customKey: '' },
  { id: 'underline', action: 'underline', label: 'Gạch chân', defaultKey: 'Mod+u', customKey: '' },
  { id: 'strike', action: 'strikethrough', label: 'Gạch ngang', defaultKey: 'Mod+Shift+x', customKey: '' },
  { id: 'code', action: 'code', label: 'Code inline', defaultKey: 'Mod+e', customKey: '' },
  { id: 'h1', action: 'heading-1', label: 'Tiêu đề 1', defaultKey: 'Mod+Alt+1', customKey: '' },
  { id: 'h2', action: 'heading-2', label: 'Tiêu đề 2', defaultKey: 'Mod+Alt+2', customKey: '' },
  { id: 'h3', action: 'heading-3', label: 'Tiêu đề 3', defaultKey: 'Mod+Alt+3', customKey: '' },
  { id: 'bullet-list', action: 'bullet-list', label: 'Danh sách chấm', defaultKey: 'Mod+Shift+8', customKey: '' },
  { id: 'ordered-list', action: 'ordered-list', label: 'Danh sách số', defaultKey: 'Mod+Shift+7', customKey: '' },
  { id: 'blockquote', action: 'blockquote', label: 'Trích dẫn', defaultKey: 'Mod+Shift+b', customKey: '' },
  { id: 'undo', action: 'undo', label: 'Hoàn tác', defaultKey: 'Mod+z', customKey: '' },
  { id: 'redo', action: 'redo', label: 'Làm lại', defaultKey: 'Mod+Shift+z', customKey: '' },
];

interface ShortcutsManagerProps {
  editor: any;
  onClose: () => void;
}

export const ShortcutsManager: React.FC<ShortcutsManagerProps> = ({ editor, onClose }) => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(DEFAULT_SHORTCUTS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved shortcuts from localStorage
    const saved = localStorage.getItem('editor-shortcuts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setShortcuts(parsed);
      } catch (e) {
        console.error('Failed to load shortcuts:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const startEditing = (id: string, currentKey: string) => {
    setEditingId(id);
    setEditingKey(currentKey || '');
  };

  const saveShortcut = (id: string) => {
    const updated = shortcuts.map(s => 
      s.id === id ? { ...s, customKey: editingKey } : s
    );
    setShortcuts(updated);
    setEditingId(null);
    setEditingKey('');
    
    // Save to localStorage
    localStorage.setItem('editor-shortcuts', JSON.stringify(updated));
  };

  const resetShortcut = (id: string) => {
    const updated = shortcuts.map(s => 
      s.id === id ? { ...s, customKey: '' } : s
    );
    setShortcuts(updated);
    localStorage.setItem('editor-shortcuts', JSON.stringify(updated));
  };

  const resetAll = () => {
    if (confirm('Bạn có chắc muốn reset tất cả phím tắt về mặc định?')) {
      setShortcuts(DEFAULT_SHORTCUTS);
      localStorage.removeItem('editor-shortcuts');
    }
  };

  const formatKey = (key: string) => {
    if (!key) return '';
    return key
      .replace(/Mod/g, navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
      .replace(/Alt/g, 'Alt')
      .replace(/Shift/g, 'Shift')
      .replace(/\+/g, ' + ')
      .toUpperCase();
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (editingId !== id) return;
    
    e.preventDefault();
    e.stopPropagation();

    const parts: string[] = [];
    if (e.metaKey || e.ctrlKey) parts.push('Mod');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');
    
    if (e.key && !['Meta', 'Control', 'Alt', 'Shift'].includes(e.key)) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase();
      parts.push(key);
      
      const combo = parts.join('+');
      setEditingKey(combo);
      
      // Auto-save after a short delay
      setTimeout(() => {
        saveShortcut(id);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div ref={ref} className="bg-white w-[700px] max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Keyboard size={20} className="text-blue-600" />
            Tùy chỉnh phím tắt
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors flex items-center gap-1"
            >
              <RotateCcw size={14} />
              Reset tất cả
            </button>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut) => {
              const isEditing = editingId === shortcut.id;
              const displayKey = shortcut.customKey || shortcut.defaultKey;
              
              return (
                <div
                  key={shortcut.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{shortcut.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Mặc định: {formatKey(shortcut.defaultKey)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingKey}
                        onChange={(e) => setEditingKey(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, shortcut.id)}
                        onBlur={() => saveShortcut(shortcut.id)}
                        className="px-3 py-1.5 border border-blue-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 w-32"
                        placeholder="Nhấn phím..."
                        autoFocus
                      />
                    ) : (
                      <button
                        onClick={() => startEditing(shortcut.id, shortcut.customKey)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm font-mono transition-colors min-w-[120px] text-left"
                      >
                        {formatKey(displayKey) || 'Nhấn để chỉnh sửa'}
                      </button>
                    )}
                    
                    {shortcut.customKey && (
                      <button
                        onClick={() => resetShortcut(shortcut.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="Reset về mặc định"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700">
            <p className="font-medium mb-1">💡 Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Nhấn vào phím tắt để chỉnh sửa</li>
              <li>Nhấn tổ hợp phím mới để lưu tự động</li>
              <li>Mod = ⌘ (Mac) hoặc Ctrl (Windows/Linux)</li>
              <li>Phím tắt tùy chỉnh sẽ được lưu tự động</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

