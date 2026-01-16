'use client';
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { 
  Type, Heading1, Heading2, Heading3, 
  List, ListOrdered, ListTodo, Quote, 
  Code, Minus, Table, Image, Film, 
  Music, MapPin, AlertCircle, Layers, Sigma 
} from 'lucide-react';

interface CommandListProps {
  items: any[];
  command: any;
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback((index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  }, [props]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[300px] p-1 animate-in fade-in zoom-in-95 duration-100 z-50">
      <div className="max-h-[300px] overflow-y-auto">
        {props.items.length ? (
          props.items.map((item, index) => (
            <button
              className={`flex items-center gap-2 w-full text-left px-2 py-2 rounded text-sm transition-colors ${
                index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
              key={index}
              onClick={() => selectItem(index)}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded border ${index === selectedIndex ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                 {item.icon}
              </div>
              <div className="flex flex-col">
                  <span className="font-medium text-xs">{item.title}</span>
                  {item.description && <span className="text-[10px] text-gray-400">{item.description}</span>}
              </div>
            </button>
          ))
        ) : (
          <div className="px-3 py-2 text-sm text-gray-500">No result</div>
        )}
      </div>
      <div className="px-2 py-1 bg-gray-50 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between">
          <span>Use <b>↑</b> <b>↓</b> to navigate</span>
          <span><b>↵</b> to select</span>
      </div>
    </div>
  );
});

CommandList.displayName = 'CommandList';

export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Text',
      description: 'Start writing with plain text.',
      icon: <Type size={16} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      title: 'Heading 1',
      description: 'Big section heading.',
      icon: <Heading1 size={16} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading.',
      icon: <Heading2 size={16} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading.',
      icon: <Heading3 size={16} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Create a simple bullet list.',
      icon: <List size={16} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Numbered List',
      description: 'Create a list with numbering.',
      icon: <ListOrdered size={16} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'Task List',
      description: 'Track tasks with a todo list.',
      icon: <ListTodo size={16} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote.',
      icon: <Quote size={16} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
        title: 'Divider',
        description: 'Visually divide blocks.',
        icon: <Minus size={16} />,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
    },
    {
      title: 'Code Block',
      description: 'Capture a code snippet.',
      icon: <Code size={16} />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
        title: 'Math Block',
        description: 'Insert a LaTeX equation.',
        icon: <Sigma size={16} />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).insertContent({ type: 'equationBlock', attrs: { latex: '' } }).run();
        },
    },
    {
        title: 'Table',
        description: 'Insert a 3x3 table.',
        icon: <Table size={16} />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
    },
    {
        title: 'Alert',
        description: 'Insert an alert block.',
        icon: <AlertCircle size={16} />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setAlert({ type: 'info' }).run();
        },
    },
    {
        title: 'Collapsible',
        description: 'Insert a toggle list.',
        icon: <Layers size={16} />,
        command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setDetails().run();
        },
    },
    // We can't directly open dialogs from here easily without context, 
    // but we can trigger custom events or commands if we wired them up.
    // For now, simpler blocks are safer.
  ].filter(item => {
    if (typeof query === 'string' && query.length > 0) {
      return item.title.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  }).slice(0, 10);
};