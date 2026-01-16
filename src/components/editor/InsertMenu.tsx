'use client';
import React, { useRef, useEffect } from 'react';
import { 
  Type, Heading1, Heading2, Heading3, 
  List, ListOrdered, ListTodo, Quote, 
  Image as ImageIcon, Film, Music, MapPin,
  Table, Code, Sigma, AlertCircle, Layers, Minus,
  LayoutGrid, LayoutTemplate
} from 'lucide-react';

interface InsertMenuProps {
  editor: any;
  onClose: () => void;
  onOpenDialog: (type: 'image' | 'video' | 'audio') => void;
  onOpenMap: () => void;
  onInsertMath: () => void; // Using the toolbar's logic via callback if needed, or direct command
  onOpenTemplates: () => void;
}

export const InsertMenu = ({ editor, onClose, onOpenDialog, onOpenMap, onInsertMath, onOpenTemplates }: InsertMenuProps) => {
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

  const insert = (action: () => void) => {
    action();
    onClose();
  };

  const sections = [
    {
      title: 'Basic Text',
      items: [
        { label: 'Paragraph', icon: Type, action: () => editor.chain().focus().setParagraph().run() },
        { label: 'Heading 1', icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
        { label: 'Heading 2', icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { label: 'Heading 3', icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        { label: 'Quote', icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run() },
      ]
    },
    {
      title: 'Lists',
      items: [
        { label: 'Bullet List', icon: List, action: () => editor.chain().focus().toggleBulletList().run() },
        { label: 'Numbered List', icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run() },
        { label: 'Task List', icon: ListTodo, action: () => editor.chain().focus().toggleTaskList().run() },
      ]
    },
    {
      title: 'Media',
      items: [
        { label: 'Image', icon: ImageIcon, action: () => onOpenDialog('image') },
        { label: 'Video', icon: Film, action: () => onOpenDialog('video') },
        { label: 'Audio', icon: Music, action: () => onOpenDialog('audio') },
        { label: 'Map', icon: MapPin, action: () => onOpenMap() },
      ]
    },
    {
      title: 'Advanced',
      items: [
        { label: 'Table', icon: Table, action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
        { label: 'Code Block', icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run() },
        { label: 'Math Block', icon: Sigma, action: () => {
             editor.chain().focus().insertContent({ type: 'equationBlock', attrs: { latex: 'E = mc^2' } }).run();
        }},
        { label: 'Alert', icon: AlertCircle, action: () => editor.chain().focus().setAlert({ type: 'info' }).run() },
        { label: 'Details', icon: Layers, action: () => editor.chain().focus().setDetails().run() },
        { label: 'Divider', icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run() },
        { label: 'Block Template', icon: LayoutTemplate, action: () => onOpenTemplates() },
      ]
    }
  ];

  return (
    <div ref={ref} className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[80vh] overflow-y-auto">
      <div className="p-2 space-y-3">
        {sections.map((section, idx) => (
          <div key={idx}>
            <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {section.title}
            </div>
            <div className="grid grid-cols-1 gap-0.5">
              {section.items.map((item, itemIdx) => (
                <button
                  key={itemIdx}
                  onClick={() => insert(item.action)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors text-left"
                >
                  <div className="text-gray-400 group-hover:text-blue-500">
                    <item.icon size={16} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};