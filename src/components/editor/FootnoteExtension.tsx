'use client';
import { Node, mergeAttributes } from '@tiptap/core';

// Footnote Reference Node - inline reference đến footnote
export const FootnoteReference = Node.create({
  name: 'footnoteReference',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }
          return { 'data-footnote-id': attributes.id };
        },
      },
      number: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-number'),
        renderHTML: attributes => {
          if (!attributes.number) {
            return {};
          }
          return { 'data-footnote-number': attributes.number };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'sup[data-footnote-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'sup',
      mergeAttributes(HTMLAttributes, {
        class: 'inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full cursor-pointer hover:bg-blue-100 transition-colors',
        id: `footnote-ref-${HTMLAttributes.id}`,
      }),
      HTMLAttributes.number || '?',
    ];
  },

  addCommands() {
    return {
      insertFootnote: (options: { id?: string; content: string }) => ({ commands, tr, state }: any) => {
        // Count existing footnotes
        let footnoteCount = 0;
        state.doc.descendants((node: any) => {
          if (node.type.name === 'footnoteReference') {
            footnoteCount++;
          }
        });
        
        const footnoteNumber = footnoteCount + 1;
        const refId = options.id || `footnote-${Date.now()}`;

        // Insert reference at cursor
        commands.insertContent({
          type: this.name,
          attrs: {
            id: refId,
            number: footnoteNumber,
          },
        });

        // Insert footnote at the end of document
        const docSize = state.doc.content.size;
        const footnoteNode = state.schema.nodes.footnote.create(
          {
            id: refId,
            number: footnoteNumber,
          },
          state.schema.nodes.paragraph.create({}, state.schema.text(options.content))
        );

        tr.insert(docSize - 1, footnoteNode);
        return true;
      },
    } as any;
  },
});

// Footnote Node - hiển thị ở cuối document
export const Footnote = Node.create({
  name: 'footnote',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-id'),
        renderHTML: attributes => {
          if (!attributes.id) {
            return {};
          }
          return { 'data-footnote-id': attributes.id };
        },
      },
      number: {
        default: null,
        parseHTML: element => element.getAttribute('data-footnote-number'),
        renderHTML: attributes => {
          if (!attributes.number) {
            return {};
          }
          return { 'data-footnote-number': attributes.number };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="footnote"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'footnote',
        class: 'flex gap-2 py-2 border-t border-gray-200 mt-4',
        id: `footnote-${HTMLAttributes.id}`,
      }),
      [
        'span',
        {
          class: 'flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-semibold text-blue-600 bg-blue-50 rounded-full',
        },
        HTMLAttributes.number || '?',
      ],
      ['div', { class: 'flex-1' }, 0],
    ];
  },
});

