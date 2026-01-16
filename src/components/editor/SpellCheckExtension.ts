'use client';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// Simple spell check extension using browser's spellcheck API
// For production, you'd want to use a proper spellcheck service
export const SpellCheckExtension = Extension.create({
  name: 'spellCheck',

  addOptions() {
    return {
      enabled: true,
      language: 'vi', // Vietnamese by default
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading'],
        attributes: {
          spellcheck: {
            default: true,
            parseHTML: () => true,
            renderHTML: () => ({
              spellcheck: 'true',
            }),
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('spellCheck'),
        props: {
          decorations: (state) => {
            if (!this.options.enabled) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const { doc } = state;

            // This is a simplified version - real spellcheck would use a service
            // For now, we'll just enable browser's native spellcheck
            doc.descendants((node, pos) => {
              if (node.isText) {
                // Browser will handle spellcheck via spellcheck attribute
                // We could add custom decorations here for highlighting
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

