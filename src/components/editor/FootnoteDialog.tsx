'use client';
import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, X, Check, FileText, Hash } from 'lucide-react';

interface FootnoteDialogProps {
  editor: any;
  onClose: () => void;
  onInsert: (content: string) => void;
}

export const FootnoteDialog: React.FC<FootnoteDialogProps> = ({ editor, onClose, onInsert }) => {
  const [content, setContent] = useState('');
  const [footnoteNumber, setFootnoteNumber] = useState(1);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Count existing footnotes
    if (editor) {
      let count = 0;
      editor.state.doc.descendants((node: any) => {
        if (node.type.name === 'footnoteReference') {
          count++;
        }
      });
      setFootnoteNumber(count + 1);
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
    // Auto-focus content textarea
    if (contentTextareaRef.current) {
      contentTextareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!content.trim()) {
      alert('Vui lòng nhập nội dung footnote');
      return;
    }

    onInsert(content.trim());
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
        className="relative w-[520px] bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <StickyNote size={18} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Chèn Footnote</h3>
              <p className="text-xs text-gray-500">Thêm ghi chú ở cuối document</p>
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
          {/* Preview Number */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-full text-sm font-bold">
                {footnoteNumber}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Số footnote</p>
                <p className="text-xs text-gray-500">Sẽ hiển thị trong document</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 font-mono bg-white px-2 py-1 rounded border border-purple-200">
              <sup className="text-purple-600 font-bold">{footnoteNumber}</sup>
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
              <FileText size={12} />
              Nội dung Footnote <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={contentTextareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập nội dung footnote... Ví dụ: Nguồn tham khảo, giải thích chi tiết, v.v."
              rows={5}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-gray-400 resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {content.length} ký tự
              </p>
              <p className="text-xs text-gray-400">
                Ctrl/Cmd + Enter để chèn
              </p>
            </div>
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Ví dụ
            </label>
            <div className="space-y-1.5">
              {[
                'Nguồn: Wikipedia, truy cập ngày 12/01/2024',
                'Xem thêm: Tài liệu tham khảo tại trang 45',
                'Ghi chú: Dữ liệu được cập nhật hàng quý',
              ].map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setContent(example)}
                  className="w-full text-left p-2.5 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg text-xs text-gray-600 hover:text-purple-700 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-start gap-2">
              <StickyNote size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-purple-700">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-0.5 text-purple-600">
                  <li>Footnote sẽ tự động đánh số theo thứ tự</li>
                  <li>Hiển thị ở cuối document</li>
                  <li>Có thể click vào số footnote để xem nội dung</li>
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
            disabled={!content.trim()}
            className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Check size={16} />
            Chèn Footnote
          </button>
        </div>
      </div>
    </div>
  );
};

