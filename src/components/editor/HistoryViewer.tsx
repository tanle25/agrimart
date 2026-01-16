'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Clock, RotateCcw, RotateCw, X, Check } from 'lucide-react';

interface HistoryViewerProps {
  editor: any;
  onClose: () => void;
}

export const HistoryViewer: React.FC<HistoryViewerProps> = ({ editor, onClose }) => {
  const [history, setHistory] = useState<Array<{ timestamp: number; preview: string; type: 'undo' | 'redo' }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  // Capture history state
  useEffect(() => {
    if (!editor) return;

    const updateHistory = () => {
      const historyItems: Array<{ timestamp: number; preview: string; type: 'undo' | 'redo' }> = [];
      
      // Get undo stack (simplified - Tiptap doesn't expose full history easily)
      // We'll track changes manually
      const doc = editor.state.doc;
      const preview = doc.textContent.slice(0, 50) + (doc.textContent.length > 50 ? '...' : '');
      
      historyItems.push({
        timestamp: Date.now(),
        preview: preview || '(Empty)',
        type: 'undo',
      });

      setHistory(historyItems);
      
      // Estimate current position based on undo/redo availability
      let estimatedIndex = 0;
      let canUndo = editor.can().undo();
      let canRedo = editor.can().redo();
      
      // This is an approximation - Tiptap doesn't expose exact history index
      setCurrentIndex(estimatedIndex);
    };

    // Listen to editor updates
    editor.on('update', updateHistory);
    updateHistory();

    return () => {
      editor.off('update', updateHistory);
    };
  }, [editor]);

  const jumpToVersion = (index: number) => {
    if (!editor) return;
    
    const targetIndex = history.length - 1 - index;
    const steps = currentIndex - targetIndex;
    
    if (steps > 0) {
      // Need to undo
      for (let i = 0; i < steps; i++) {
        if (editor.can().undo()) {
          editor.chain().focus().undo().run();
        }
      }
    } else if (steps < 0) {
      // Need to redo
      for (let i = 0; i < Math.abs(steps); i++) {
        if (editor.can().redo()) {
          editor.chain().focus().redo().run();
        }
      }
    }
    
    setCurrentIndex(targetIndex);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div ref={ref} className="bg-white w-[600px] max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            Lịch sử chỉnh sửa
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>Chưa có lịch sử chỉnh sửa</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={index}
                    onClick={() => jumpToVersion(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-blue-50 border-blue-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === 'undo' ? (
                            <RotateCcw size={14} className="text-gray-400" />
                          ) : (
                            <RotateCw size={14} className="text-gray-400" />
                          )}
                          <span className="text-xs font-medium text-gray-500">
                            {formatTime(item.timestamp)}
                          </span>
                          {isActive && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Hiện tại</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{item.preview}</p>
                      </div>
                      {isActive && (
                        <Check size={16} className="text-blue-600 ml-2 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {history.length} phiên bản trong lịch sử
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <RotateCcw size={14} />
              Undo
            </button>
            <button
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <RotateCw size={14} />
              Redo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

