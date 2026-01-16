'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Copy, Scissors, Clipboard, Undo, Redo, Trash2,
  Bold, Italic, Underline, Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, List, ListOrdered, Quote, Code,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Heading1, Heading2, Heading3, LayoutTemplate,
  MoreHorizontal, ChevronRight
} from 'lucide-react';


interface ContextMenuProps {
  editor: any;
  onOpenDialog?: (type: 'image' | 'video' | 'audio') => void;
  onOpenTemplates?: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  editor,
  onOpenDialog,
  onOpenTemplates
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't show context menu on toolbar or dialogs
      if (target.closest('.toolbar') || target.closest('[role="dialog"]')) {
        return;
      }

      // Check if click is inside editor
      const editorElement = editor.view.dom.closest('.tiptap');
      if (!editorElement || !editorElement.contains(target)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const selection = editor.state.selection;
      const hasSelection = !selection.empty;
      const selectedTextContent = hasSelection
        ? editor.state.doc.textBetween(selection.from, selection.to)
        : '';

      setSelectedText(selectedTextContent);
      setPosition({ x: e.clientX, y: e.clientY });
      setIsOpen(true);
    };

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    const editorElement = editor.view.dom.closest('.tiptap');
    if (editorElement) {
      editorElement.addEventListener('contextmenu', handleContextMenu as EventListener);
      document.addEventListener('click', handleClick as EventListener);
      window.addEventListener('scroll', handleScroll as EventListener, true);
    }

    return () => {
      if (editorElement) {
        editorElement.removeEventListener('contextmenu', handleContextMenu as EventListener);
      }
      document.removeEventListener('click', handleClick as EventListener);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [editor]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      // Adjust horizontal position if menu goes off screen
      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 10;
      }
      if (x < 10) {
        x = 10;
      }

      // Adjust vertical position if menu goes off screen
      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 10;
      }
      if (y < 10) {
        y = 10;
      }

      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    }
  }, [isOpen, position]);

  if (!isOpen || !editor) return null;

  const hasSelection = !editor.state.selection.empty;
  const isImage = editor.isActive('image');
  const isTable = editor.isActive('table');
  const isLink = editor.isActive('link');
  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  const menuItems = [];

  // Text formatting (only if text is selected)
  if (hasSelection && !isImage && !isTable) {
    menuItems.push({
      type: 'section',
      label: 'Format',
      items: [
        {
          icon: Bold,
          label: 'Bold',
          action: () => editor.chain().focus().toggleBold().run(),
          isActive: editor.isActive('bold'),
        },
        {
          icon: Italic,
          label: 'Italic',
          action: () => editor.chain().focus().toggleItalic().run(),
          isActive: editor.isActive('italic'),
        },
        {
          icon: Underline,
          label: 'Underline',
          action: () => editor.chain().focus().toggleUnderline().run(),
          isActive: editor.isActive('underline'),
        },
        {
          icon: Code,
          label: 'Code',
          action: () => editor.chain().focus().toggleCode().run(),
          isActive: editor.isActive('code'),
        },
      ],
    });
  }

  // Copy/Cut/Paste
  menuItems.push({
    type: 'section',
    label: 'Edit',
    items: [
      {
        icon: Copy,
        label: 'Copy',
        action: async () => {
          if (hasSelection) {
            const text = editor.state.doc.textBetween(
              editor.state.selection.from,
              editor.state.selection.to
            );
            await navigator.clipboard.writeText(text);
          }
        },
        disabled: !hasSelection,
      },
      {
        icon: Scissors,
        label: 'Cut',
        action: () => {
          if (hasSelection) {
            const text = editor.state.doc.textBetween(
              editor.state.selection.from,
              editor.state.selection.to
            );
            navigator.clipboard.writeText(text);
            editor.chain().focus().deleteSelection().run();
          }
        },
        disabled: !hasSelection,
      },
      {
        icon: Clipboard,
        label: 'Paste',
        action: async () => {
          const text = await navigator.clipboard.readText();
          editor.chain().focus().insertContent(text).run();
        },
      },
    ],
  });

  // Block types
  if (!isImage && !isTable) {
    menuItems.push({
      type: 'section',
      label: 'Turn into',
      items: [
        {
          icon: Heading1,
          label: 'Heading 1',
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          isActive: editor.isActive('heading', { level: 1 }),
        },
        {
          icon: Heading2,
          label: 'Heading 2',
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          isActive: editor.isActive('heading', { level: 2 }),
        },
        {
          icon: Heading3,
          label: 'Heading 3',
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          isActive: editor.isActive('heading', { level: 3 }),
        },
        {
          icon: List,
          label: 'Bullet List',
          action: () => editor.chain().focus().toggleBulletList().run(),
          isActive: editor.isActive('bulletList'),
        },
        {
          icon: ListOrdered,
          label: 'Numbered List',
          action: () => editor.chain().focus().toggleOrderedList().run(),
          isActive: editor.isActive('orderedList'),
        },
        {
          icon: Quote,
          label: 'Quote',
          action: () => editor.chain().focus().toggleBlockquote().run(),
          isActive: editor.isActive('blockquote'),
        },
      ],
    });
  }

  // Insert
  menuItems.push({
    type: 'section',
    label: 'Insert',
    items: [
      {
        icon: LinkIcon,
        label: 'Link',
        action: () => {
          const url = window.prompt('Enter URL:');
          if (url) {
            if (hasSelection) {
              editor.chain().focus().setLink({ href: url }).run();
            } else {
              editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
            }
          }
        },
      },
      {
        icon: ImageIcon,
        label: 'Image',
        action: () => {
          if (onOpenDialog) {
            onOpenDialog('image');
          }
        },
      },
      {
        icon: TableIcon,
        label: 'Table',
        action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      },
      {
        icon: LayoutTemplate,
        label: 'Template',
        action: () => {
          if (onOpenTemplates) {
            onOpenTemplates();
          }
        },
      },
    ],
  });

  // History
  menuItems.push({
    type: 'section',
    label: 'History',
    items: [
      {
        icon: Undo,
        label: 'Undo',
        action: () => editor.chain().focus().undo().run(),
        disabled: !canUndo,
      },
      {
        icon: Redo,
        label: 'Redo',
        action: () => editor.chain().focus().redo().run(),
        disabled: !canRedo,
      },
    ],
  });

  // Delete
  if (hasSelection || isImage || isTable) {
    menuItems.push({
      type: 'section',
      label: 'Delete',
      items: [
        {
          icon: Trash2,
          label: isImage ? 'Delete Image' : isTable ? 'Delete Table' : 'Delete',
          action: () => editor.chain().focus().deleteSelection().run(),
          className: 'text-red-600 hover:bg-red-50',
        },
      ],
    });
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-[10000] bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menuItems.map((section, sectionIndex) => (
        <div key={sectionIndex}>
          {sectionIndex > 0 && <div className="my-1 border-t border-gray-100" />}
          {section.label && (
            <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              {section.label}
            </div>
          )}
          {section.items.map((item, itemIndex) => {
            const Icon = item.icon;
            return (
              <button
                key={itemIndex}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                disabled={(item as any).disabled}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  ${(item as any).isActive ? 'bg-blue-50 text-blue-600' : ''}
                  ${(item as any).className || ''}
                `}
              >
                <Icon size={16} className={(item as any).isActive ? 'text-blue-600' : 'text-gray-400'} />
                <span className="flex-1 text-left">{(item as any).label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

