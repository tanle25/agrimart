'use client';
import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { List } from 'lucide-react';

interface ToCItem {
  id: string;
  text: string;
  level: number;
  pos: number;
}

export const TableOfContents = ({ editor }: { editor: Editor | null }) => {
  const [items, setItems] = useState<ToCItem[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateToC = () => {
      const newItems: ToCItem[] = [];
      const doc = editor.state.doc;

      doc.descendants((node: any, pos: number) => {
        if (node.type.name === 'heading') {
          // Get text content
          const text = node.textContent;
          if (text) {
            newItems.push({
              id: `toc-${pos}`, // Simple ID based on position
              text,
              level: node.attrs.level,
              pos,
            });
          }
        }
      });

      setItems(newItems);
    };

    // Initial update
    updateToC();

    // Listen to updates
    editor.on('update', updateToC);

    return () => {
      editor.off('update', updateToC);
    };
  }, [editor]);

  const handleItemClick = (pos: number) => {
    if (editor) {
        // Create a transaction to scroll to the position
        editor.chain()
            .focus()
            .setTextSelection(pos)
            .run();
            
        // Manual smooth scroll because Tiptap's scrollIntoView sometimes falls short
        const domNode = editor.view.domAtPos(pos).node as HTMLElement;
        if (domNode && domNode.scrollIntoView) {
            domNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="hidden xl:block w-64 shrink-0 pl-6 print:hidden">
      <div className="sticky top-32 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex items-center gap-2 mb-4 text-gray-400 font-medium text-xs uppercase tracking-wider">
          <List size={14} />
          <span>Mục lục</span>
        </div>
        <div className="relative border-l border-gray-200 ml-1.5 space-y-1">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.pos)}
              className={`
                block w-full text-left py-1 pr-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-r transition-all duration-200 border-l-2 border-transparent hover:border-blue-400 -ml-[1px]
                ${item.level === 1 ? 'pl-4 font-medium text-gray-800' : ''}
                ${item.level === 2 ? 'pl-6' : ''}
                ${item.level >= 3 ? 'pl-9 text-xs' : ''}
              `}
            >
              <span className="truncate block">{item.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};