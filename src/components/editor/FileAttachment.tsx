'use client';
import { Node, mergeAttributes } from '@tiptap/core';
import { FileText, Download, X } from 'lucide-react';

// File Attachment Node
export const FileAttachmentNode = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: element => element.getAttribute('data-name'),
        renderHTML: attributes => {
          if (!attributes.name) {
            return {};
          }
          return { 'data-name': attributes.name };
        },
      },
      url: {
        default: null,
        parseHTML: element => element.getAttribute('data-url') || element.getAttribute('href'),
        renderHTML: attributes => {
          if (!attributes.url) {
            return {};
          }
          return { 'data-url': attributes.url, href: attributes.url };
        },
      },
      size: {
        default: null,
        parseHTML: element => element.getAttribute('data-size'),
        renderHTML: attributes => {
          if (!attributes.size) {
            return {};
          }
          return { 'data-size': attributes.size };
        },
      },
      type: {
        default: null,
        parseHTML: element => element.getAttribute('data-type'),
        renderHTML: attributes => {
          if (!attributes.type) {
            return {};
          }
          return { 'data-type': attributes.type };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-attachment"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const size = HTMLAttributes.size ? formatFileSize(Number(HTMLAttributes.size)) : '';
    const fileType = HTMLAttributes.type || 'file';
    
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'file-attachment',
        class: 'my-4 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group',
      }),
      [
        'div',
        { class: 'flex items-center gap-3' },
        [
          'div',
          { class: 'p-3 bg-blue-100 rounded-lg' },
          [
            'svg',
            {
              width: '24',
              height: '24',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
            },
            [
              'path',
              {
                d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
              },
            ],
            [
              'polyline',
              { points: '14 2 14 8 20 8' },
            ],
            [
              'line',
              { x1: '16', y1: '13', x2: '8', y2: '13' },
            ],
            [
              'line',
              { x1: '16', y1: '17', x2: '8', y2: '17' },
            ],
            [
              'polyline',
              { points: '10 9 9 9 8 9' },
            ],
          ],
        ],
        [
          'div',
          { class: 'flex-1 min-w-0' },
          [
            'div',
            { class: 'font-medium text-gray-800 truncate' },
            HTMLAttributes.name || 'Untitled File',
          ],
          [
            'div',
            { class: 'text-xs text-gray-500 mt-0.5' },
            [
              fileType.toUpperCase(),
              size && ` • ${size}`,
            ].filter(Boolean).join(' '),
          ],
        ],
        [
          'a',
          {
            href: HTMLAttributes.url,
            download: HTMLAttributes.name,
            class: 'px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 text-sm font-medium',
          },
          [
            'svg',
            {
              width: '16',
              height: '16',
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              'stroke-width': '2',
            },
            [
              'path',
              {
                d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
              },
            ],
            [
              'polyline',
              { points: '7 10 12 15 17 10' },
            ],
            [
              'line',
              { x1: '12', y1: '15', x2: '12', y2: '3' },
            ],
          ],
          ' Download',
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setFileAttachment: (options: { name: string; url: string; size?: number; type?: string }) => ({ commands }: any) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    } as any;
  },
});

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

