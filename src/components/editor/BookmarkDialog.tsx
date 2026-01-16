'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Link as LinkIcon, X, Check, Hash } from 'lucide-react';

interface BookmarkDialogProps {
  editor: any;
  onClose: () => void;
  onInsert: (id: string, label: string) => void;
}

export const BookmarkDialog: React.FC<BookmarkDialogProps> = ({ editor, onClose, onInsert }) => {
  const [id, setId] = useState('');
  const [label, setLabel] = useState('');
  const [existingBookmarks, setExistingBookmarks] = useState<Array<{ id: string; label: string }>>([]);
  const idInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing bookmarks from editor
    if (editor) {
      const bookmarks: Array<{ id: string; label: string }> = [];
      editor.state.doc.descendants((node: any) => {
        if (node.type.name === 'bookmark') {
          bookmarks.push({
            id: node.attrs.id || '',
            label: node.attrs.label || node.attrs.id || '',
          });
        }
      });
      setExistingBookmarks(bookmarks);
    }
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    // Auto-focus ID input
    if (idInputRef.current) {
      idInputRef.current.focus();
    }
  }, []);

  const generateId = () => {
    const selectedText = editor?.state.selection.empty 
      ? '' 
      : editor?.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to);
    
    if (selectedText) {
      // Generate ID from selected text
      const generatedId = selectedText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .slice(0, 50);
      
      setId(generatedId);
      setLabel(selectedText);
    } else {
      setId(`bookmark-${Date.now()}`);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!id.trim()) {
      alert('Vui lòng nhập ID cho bookmark');
      return;
    }

    // Check if ID already exists
    const exists = existingBookmarks.some(b => b.id === id.trim());
    if (exists) {
      if (!confirm(`Bookmark với ID "${id.trim()}" đã tồn tại. Bạn có muốn tiếp tục không?`)) {
        return;
      }
    }

    onInsert(id.trim(), label.trim() || id.trim());
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      <div 
        ref={dialogRef}
        className="relative w-[480px] bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bookmark size={18} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Chèn Bookmark</h3>
              <p className="text-xs text-gray-500">Tạo anchor để link nội bộ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* ID Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
              <Hash size={12} />
              ID Bookmark <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={idInputRef}
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="bookmark-id-hoac-ten"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 font-mono"
              />
              <button
                onClick={generateId}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Tạo ID từ text đã chọn"
              >
                Tự động
              </button>
            </div>
            <p className="text-xs text-gray-500">
              ID sẽ được dùng trong link: <code className="bg-gray-100 px-1 rounded">#bookmark-id</code>
            </p>
          </div>

          {/* Label Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
              <Bookmark size={12} />
              Nhãn hiển thị (tùy chọn)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhãn hiển thị cho bookmark"
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500">
              Nếu để trống, sẽ dùng ID làm nhãn hiển thị
            </p>
          </div>

          {/* Existing Bookmarks */}
          {existingBookmarks.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Bookmark đã có ({existingBookmarks.length})
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
                {existingBookmarks.map((bm, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Hash size={12} className="text-gray-400" />
                      <code className="text-xs font-mono text-gray-700">{bm.id}</code>
                      {bm.label !== bm.id && (
                        <span className="text-xs text-gray-500">({bm.label})</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setId(bm.id);
                        setLabel(bm.label);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    >
                      Dùng
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <LinkIcon size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">Cách sử dụng:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                  <li>Tạo bookmark với ID: <code className="bg-blue-100 px-1 rounded">section-1</code></li>
                  <li>Link đến bookmark: <code className="bg-blue-100 px-1 rounded">#section-1</code></li>
                  <li>Click vào bookmark để copy ID</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!id.trim()}
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Check size={16} />
            Chèn Bookmark
          </button>
        </div>
      </div>
    </div>
  );
};

