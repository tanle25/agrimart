'use client';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export const SearchExtension = Extension.create({
  name: 'search',

  addStorage() {
    return {
      term: '',
      caseSensitive: false,
    };
  },

  addCommands() {
    return {
      setSearchTerm: (options: { term: string; caseSensitive: boolean }) => ({ editor, tr, dispatch }: any) => {
        editor.storage.search.term = options.term;
        editor.storage.search.caseSensitive = options.caseSensitive;
        if (dispatch) dispatch(tr);
        return true;
      },
      clearSearch: () => ({ editor, tr, dispatch }: any) => {
        editor.storage.search.term = '';
        if (dispatch) dispatch(tr);
        return true;
      },
    } as any;
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('search'),
        props: {
          decorations: (state) => {
            const { term, caseSensitive } = this.editor.storage.search;
            if (!term) return DecorationSet.empty;

            const decorations: Decoration[] = [];
            const doc = state.doc;

            const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            try {
                const regex = new RegExp(escapeRegExp(term), caseSensitive ? 'g' : 'gi');

                doc.descendants((node: any, pos: number) => {
                if (!node.isText || !node.text) return;

                const text = node.text;
                regex.lastIndex = 0;
                
                let match;
                while ((match = regex.exec(text))) {
                    const from = pos + match.index;
                    const to = from + match[0].length;
                    decorations.push(
                    Decoration.inline(from, to, { 
                        class: 'bg-yellow-300 text-black selection:bg-yellow-400', 
                    })
                    );
                }
                });
            } catch (e) {
                // Ignore regex errors
            }

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});