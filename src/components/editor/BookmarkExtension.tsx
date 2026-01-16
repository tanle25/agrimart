'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { Bookmark, Link as LinkIcon } from 'lucide-react';

// Bookmark/Anchor Node - cho phép tạo anchor trong document để link nội bộ
export const BookmarkNode = Node.create({
  name: 'bookmark',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }
          return { id: attributes.id };
        },
      },
      label: {
        default: null,
        parseHTML: element => element.getAttribute('data-label') || element.textContent,
        renderHTML: attributes => {
          if (!attributes.label) {
            return {};
          }
          return { 'data-label': attributes.label };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-type="bookmark"]',
      },
      {
        tag: 'span[data-type="bookmark"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'bookmark',
        class: 'inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-medium cursor-pointer hover:bg-blue-100 transition-colors',
      }),
      [
        'span',
        { class: 'inline-flex items-center gap-1' },
        [
          'svg',
          {
            width: '12',
            height: '12',
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            'stroke-width': '2',
          },
          ['path', { d: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71' }],
          ['path', { d: 'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' }],
        ],
        HTMLAttributes.label || HTMLAttributes.id || 'Bookmark',
      ],
    ];
  },

  addCommands() {
    return {
      setBookmark: (options: { id: string; label?: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: {
            id: options.id,
            label: options.label || options.id,
          },
        });
      },
      removeBookmark: (id: string) => ({ tr, state }: any) => {
        let found = false;
        state.doc.descendants((node: any, pos: number) => {
          if (node.type.name === this.name && node.attrs.id === id) {
            tr.delete(pos, pos + node.nodeSize);
            found = true;
            return false;
          }
        });
        return found;
      },
    } as any;
  },
});

// Internal Link Extension - cho phép link đến bookmark trong cùng document
export const InternalLink = Node.create({
  name: 'internalLink',
  group: 'inline',
  inline: true,
  atom: false,

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML: element => element.getAttribute('href'),
        renderHTML: attributes => {
          if (!attributes.href) {
            return {};
          }
          return { href: attributes.href };
        },
      },
      target: {
        default: '_self',
        parseHTML: element => element.getAttribute('target') || '_self',
        renderHTML: attributes => {
          return { target: attributes.target };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[href^="#"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        class: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
        onClick: (e: MouseEvent) => {
          e.preventDefault();
          const href = HTMLAttributes.href;
          if (href && href.startsWith('#')) {
            const targetId = href.substring(1);
            const element = document.getElementById(targetId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        },
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setInternalLink: (options: { href: string; text?: string }) => ({ commands }: any) => {
        const text = options.text || options.href;
        return commands.insertContent(`<a href="${options.href}">${text}</a>`);
      },
    } as any;
  },
});

