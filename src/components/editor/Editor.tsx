'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import { Extension, Node, mergeAttributes } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { CellSelection } from '@tiptap/pm/tables';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import CharacterCount from '@tiptap/extension-character-count';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Youtube from '@tiptap/extension-youtube';
import FontFamily from '@tiptap/extension-font-family';
import Focus from '@tiptap/extension-focus';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import hljs from 'highlight.js';

import { EditorToolbar } from './EditorToolbar';
import { BubbleMenu } from './BubbleMenu';
import { EditorFooter } from './EditorFooter';
import { ResizableImage } from './ResizableImage';
import { CodeBlockComponent } from './CodeBlockComponent';
import { MediaDialog } from './MediaDialog';
import { MapDialog } from './MapDialog';
import { HelpDialog } from './HelpDialog';
import { TemplatesDialog } from './TemplatesDialog';
import { MathInline, EquationBlock } from './MathExtension';
import { SearchExtension } from './SearchExtension';
import { TableHoverControls } from './TableHoverControls';
import { SlashCommand, renderItems } from './SlashCommand';
import { getSuggestionItems } from './SlashCommandList';
import { TableOfContents } from './TableOfContents';
import { BookmarkNode, InternalLink } from './BookmarkExtension';
import { FootnoteReference, Footnote } from './FootnoteExtension';
import { SpellCheckExtension } from './SpellCheckExtension';
import { HistoryViewer } from './HistoryViewer';
import { ShortcutsManager } from './ShortcutsManager';
import { VersionHistory } from './VersionHistory';
import { BookmarkDialog } from './BookmarkDialog';
import { FootnoteDialog } from './FootnoteDialog';
import { ImageEditor } from './ImageEditor';
import { EmbedDialog } from './EmbedDialog';
import { PDFExportDialog } from './PDFExportDialog';
import { AccessibilityChecker } from './AccessibilityChecker';
import { SEOAnalyzer } from './SEOAnalyzer';
import { CommandPalette } from './CommandPalette';
import { FileAttachmentNode } from './FileAttachment';
import { CodeExecutorNode } from './CodeExecutor';
import { ContextMenu } from './ContextMenu';
import { HTMLEditor } from './HTMLEditor';
import { uploadFile, EditorConfig, defaultEditorConfig } from './editorConfig';
import { FileText, Save, Settings, Search, HelpCircle, Maximize, Download, Share2, Eye, FileCode, PanelRight, TrendingUp } from 'lucide-react';

// Setup Lowlight for syntax highlighting
const lowlight = createLowlight(common);

// -----------------------------------------------------------------------------
// HELPER: HTML FORMATTER (Pretty Print)
// -----------------------------------------------------------------------------
const formatHTML = (html: string) => {
  let formatted = '';
  const reg = /(>)(<)(\/*)/g;
  const xml = html.replace(reg, '$1\r\n$2$3');
  let pad = 0;

  xml.split('\r\n').forEach((node) => {
    let indent = 0;
    if (node.match(/.+<\/\w[^>]*>$/)) {
      indent = 0;
    } else if (node.match(/^<\/\w/)) {
      if (pad !== 0) pad -= 1;
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indent = 1;
    } else {
      indent = 0;
    }

    let padding = '';
    for (let i = 0; i < pad; i++) {
      padding += '  ';
    }

    formatted += padding + node + '\r\n';
    pad += indent;
  });
  return formatted.trim();
};

// -----------------------------------------------------------------------------
// HTML Editor Component - Now using HTMLEditor (IDE-style)
// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// CUSTOM EXTENSIONS
// -----------------------------------------------------------------------------

// 1. Generic Block Container (div, section, article)
// This allows Tailwind layouts to persist
const BlockContainer = Node.create({
  name: 'blockContainer',
  group: 'block',
  content: 'block+', // Important: Can only contain other blocks (paragraphs, divs, etc.)
  defining: true,
  priority: 1000, // High priority to ensure div tags are caught by this node

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          return { class: attributes.class };
        },
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          return { style: attributes.style };
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div' },
      { tag: 'section' },
      { tag: 'article' },
      { tag: 'main' },
      { tag: 'header' },
      { tag: 'footer' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Render everything as a div to maintain consistent editing behavior, 
    // but pass through the classes which carry the visual layout
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },
});

// 2. Button Node
// Allows <button> tags to exist within the document
const ButtonNode = Node.create({
  name: 'button',
  group: 'block', // Treating as block to fit easily into block+ content rules of containers
  content: 'text*', // Can contain text
  inline: false,
  priority: 1000,

  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'button' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['button', mergeAttributes(HTMLAttributes), 0];
  },
});

// Map Node Extension
const MapNode = Node.create({
  name: 'map',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: '350',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="map"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, { 'data-type': 'map', class: 'my-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm relative' }),
      ['iframe', {
        src: HTMLAttributes.src,
        width: HTMLAttributes.width,
        height: HTMLAttributes.height,
        frameborder: '0',
        scrolling: 'no',
        marginheight: '0',
        marginwidth: '0',
        style: 'border: 0; width: 100%; display: block;',
        allowfullscreen: '',
        loading: 'lazy'
      }]
    ];
  },

  addCommands() {
    return {
      setMap: (options: any) => ({ commands }: any) => {
        return commands.insertContent({
          type: 'map',
          attrs: options,
        });
      },
    } as any;
  },
});

// Custom Horizontal Rule with styles
const CustomHorizontalRule = HorizontalRule.extend({
  addAttributes() {
    return {
      lineStyle: {
        default: 'solid',
        parseHTML: element => element.getAttribute('data-line-style'),
        renderHTML: attributes => {
          return {
            'data-line-style': attributes.lineStyle,
            class: `hr-${attributes.lineStyle}`
          }
        },
      },
      color: {
        default: null,
        parseHTML: element => element.style.borderColor || element.style.borderTopColor,
        renderHTML: attributes => {
          // Generate inline styles based on color and lineStyle
          const style: Record<string, string> = {};

          if (attributes.color) {
            if (attributes.lineStyle === 'gradient') {
              // If gradient, we change the linear-gradient stops
              style.background = `linear-gradient(to right, transparent, ${attributes.color}, transparent)`;
              style.border = 'none'; // Ensure no border overrides
            } else {
              // Standard borders
              style.borderColor = attributes.color;
              style.borderTopColor = attributes.color; // Specificity
            }
          }

          return {
            'data-line-style': attributes.lineStyle,
            class: `hr-${attributes.lineStyle}`,
            style: Object.entries(style).map(([k, v]) => `${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}: ${v}`).join('; ')
          };
        }
      }
    }
  },
  addCommands() {
    return {
      setHorizontalRule: (options: any) => ({ chain }: any) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: options
          })
          .run()
      },
    } as any;
  },
});

// 3. Alert Node
const Alert = Node.create({
  name: 'alert',
  group: 'block',
  content: 'block+', // Allow paragraphs, lists, etc. inside
  draggable: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        renderHTML: attributes => ({
          'data-alert-type': attributes.type,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.alert-block',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'alert-block' }), 0];
  },

  addCommands() {
    return {
      setAlert: (attributes: any) => ({ commands }: any) => {
        return commands.wrapIn('alert', attributes);
      },
      toggleAlert: (attributes: any) => ({ commands }: any) => {
        return commands.toggleWrap('alert', attributes);
      },
      unsetAlert: () => ({ commands }: any) => {
        return commands.lift('alert');
      },
    } as any;
  },
});

// 4. Details (Collapsible) Node
const Details = Node.create({
  name: 'details',
  group: 'block',
  content: 'summary block+', // Must have a summary followed by content
  draggable: true,

  addAttributes() {
    return {
      open: {
        default: true,
        parseHTML: element => element.hasAttribute('open'),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'details' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['details', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('details');
      // Sync 'open' state from node attributes to DOM
      if (node.attrs.open) {
        dom.setAttribute('open', '');
      }

      const contentDOM = document.createElement('div');
      dom.appendChild(contentDOM);

      // Listen for toggle event to update node attributes
      dom.addEventListener('toggle', () => {
        if (typeof getPos === 'function') {
          const isOpen = dom.hasAttribute('open');
          // We use a transaction to update the attribute without re-rendering everything destructively
          editor.commands.updateAttributes(node.type, { open: isOpen });
        }
      });

      return {
        dom,
        contentDOM,
        update: (updatedNode) => {
          if (updatedNode.type !== node.type) return false;
          // Sync external updates (e.g. from collab or history) back to DOM
          if (updatedNode.attrs.open) {
            dom.setAttribute('open', '');
          } else {
            dom.removeAttribute('open');
          }
          return true;
        }
      };
    };
  },

  addCommands() {
    return {
      setDetails: () => ({ commands }: any) => {
        return commands.insertContent({
          type: 'details',
          attrs: { open: true },
          content: [
            { type: 'summary', content: [{ type: 'text', text: 'Tiêu đề nhóm (Nhấn để sửa)' }] },
            { type: 'paragraph', content: [{ type: 'text', text: 'Nội dung chi tiết bên trong...' }] },
          ],
        });
      },
    } as any;
  },
});

const Summary = Node.create({
  name: 'summary',
  group: 'block',
  content: 'text*', // Summary contains only inline text

  parseHTML() {
    return [{ tag: 'summary' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['summary', mergeAttributes(HTMLAttributes, { 'class': 'cursor-pointer select-none font-semibold text-gray-700' }), 0];
  },
});

// 5. Audio Node
const Audio = Node.create({
  name: 'audio',
  group: 'block',
  atom: true, // It's a leaf node, doesn't have content
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'audio[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(HTMLAttributes, { controls: 'true', class: 'w-full my-4' })];
  },

  addCommands() {
    return {
      setAudio: (attributes: any) => ({ commands }: any) => {
        return commands.insertContent({
          type: 'audio',
          attrs: attributes,
        });
      },
    } as any;
  },
});

// 6. Video Node (HTML5)
const Video = Node.create({
  name: 'video',
  group: 'block',
  atom: true, // Leaf node
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'video[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, {
      controls: 'true',
      class: 'w-full h-auto my-4 rounded-lg bg-black/5'
    })];
  },

  addCommands() {
    return {
      setVideo: (attributes: any) => ({ commands }: any) => {
        return commands.insertContent({
          type: 'video',
          attrs: attributes,
        });
      },
    } as any;
  },
});


// Define custom FontSize extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: any) => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    } as any;
  },
});

// Define custom LineHeight extension
const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return {
      types: ['paragraph', 'heading', 'bulletList', 'orderedList'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight: any) => ({ commands }: any) => {
        return this.options.types.every((type: any) => commands.updateAttributes(type, { lineHeight }));
      },
      unsetLineHeight: () => ({ commands }: any) => {
        return this.options.types.every((type: any) => commands.resetAttributes(type, 'lineHeight'));
      },
    } as any;
  },
});

// Extend Image to use custom Node View
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: attributes => ({
          width: attributes.width,
        }),
      },
      caption: {
        default: '',
        parseHTML: element => element.getAttribute('data-caption'),
        renderHTML: attributes => ({
          'data-caption': attributes.caption,
        }),
      }
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },
});

// Extend Table to support 'class' attribute for styling
const CustomTable = Table.extend({
  addAttributes() {
    return {
      class: {
        default: null,
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          if (!attributes.class) return {};
          return {
            class: attributes.class,
          }
        },
      },
    }
  },
}).configure({
  resizable: true,
});

// Extend TableCell to support Background Color and Text Color
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => {
          const dataBg = element.getAttribute('data-background-color');
          const styleBg = element.style.backgroundColor;
          return dataBg || styleBg || null;
        },
        renderHTML: attributes => {
          const styles: string[] = [];

          // Always include backgroundColor if it exists
          if (attributes.backgroundColor) {
            styles.push(`background-color: ${attributes.backgroundColor}`);
          }

          // Merge border styles if they exist
          if (attributes.borderStyle && attributes.borderStyle !== 'solid') {
            styles.push(`border-style: ${attributes.borderStyle}`);
          }
          if (attributes.borderWidth && attributes.borderWidth !== '1px') {
            styles.push(`border-width: ${attributes.borderWidth}`);
          }
          if (attributes.borderColor) {
            styles.push(`border-color: ${attributes.borderColor}`);
          }

          const result: Record<string, any> = {};

          if (attributes.backgroundColor) {
            result['data-background-color'] = attributes.backgroundColor;
          }

          if (attributes.borderStyle) result['data-border-style'] = attributes.borderStyle;
          if (attributes.borderWidth) result['data-border-width'] = attributes.borderWidth;
          if (attributes.borderColor) result['data-border-color'] = attributes.borderColor;

          if (styles.length > 0) {
            result.style = styles.join('; ');
          }

          return result;
        },
      },
      color: {
        default: null,
        parseHTML: element => {
          const dataColor = element.getAttribute('data-color');
          const styleColor = element.style.color;
          return dataColor || styleColor || null;
        },
        renderHTML: attributes => {
          const result: Record<string, any> = {};

          if (attributes.color) {
            result['data-color'] = attributes.color;
            result.style = `color: ${attributes.color}`;
          }

          return result;
        },
      },
      borderStyle: {
        default: 'solid',
        parseHTML: element => {
          const borderStyle = element.style.borderStyle || element.getAttribute('data-border-style');
          return borderStyle || 'solid';
        },
        renderHTML: attributes => {
          if (attributes.borderStyle && attributes.borderStyle !== 'solid') {
            return {
              'data-border-style': attributes.borderStyle,
              style: `border-style: ${attributes.borderStyle}`,
            };
          }
          return {};
        },
      },
      borderWidth: {
        default: '1px',
        parseHTML: element => {
          const borderWidth = element.style.borderWidth || element.getAttribute('data-border-width');
          return borderWidth || '1px';
        },
        renderHTML: attributes => {
          if (attributes.borderWidth && attributes.borderWidth !== '1px') {
            return {
              'data-border-width': attributes.borderWidth,
              style: `border-width: ${attributes.borderWidth}`,
            };
          }
          return {};
        },
      },
      borderColor: {
        default: null,
        parseHTML: element => {
          const borderColor = element.style.borderColor || element.getAttribute('data-border-color');
          return borderColor || null;
        },
        renderHTML: attributes => {
          if (attributes.borderColor) {
            return {
              'data-border-color': attributes.borderColor,
              style: `border-color: ${attributes.borderColor}`,
            };
          }
          return {};
        },
      },
    }
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setCellAttribute: (attribute: string, value: string | null) => ({ tr, state, dispatch }: any) => {
        const { selection } = state;
        let cellsUpdated = 0;

        if (selection instanceof CellSelection) {
          selection.forEachCell((cell: any, pos: number) => {
            const attrs = { ...cell.attrs };
            if (value) {
              attrs[attribute] = value;
            } else {
              delete attrs[attribute];
            }
            tr.setNodeMarkup(pos, undefined, attrs);
            cellsUpdated++;
          });
        } else if (!selection.empty) {
          state.doc.nodesBetween(selection.from, selection.to, (node: any, pos: number) => {
            if (node.type.name === 'tableCell') {
              const attrs = { ...node.attrs };
              if (value) {
                attrs[attribute] = value;
              } else {
                delete attrs[attribute];
              }
              tr.setNodeMarkup(pos, undefined, attrs);
              cellsUpdated++;
            }
          });
        } else {
          const { $anchor } = selection;
          for (let depth = $anchor.depth; depth > 0; depth--) {
            const node = $anchor.node(depth);
            if (node.type.name === 'tableCell') {
              const cellPos = $anchor.before(depth);
              const attrs = { ...node.attrs };
              if (value) {
                attrs[attribute] = value;
              } else {
                delete attrs[attribute];
              }
              tr.setNodeMarkup(cellPos, undefined, attrs);
              cellsUpdated++;
              break;
            }
          }
        }

        if (cellsUpdated > 0) {
          dispatch(tr);
          return true;
        }
        return false;
      },
      setCellColor: (color: string | null) => ({ commands }: any) => {
        return commands.setCellAttribute('color', color);
      },
      setCellBackgroundColor: (backgroundColor: string | null) => ({ commands }: any) => {
        return commands.setCellAttribute('backgroundColor', backgroundColor);
      },
    } as any;
  },
});


// Top Bar Component
const TopBar = ({
  editor,
  isSourceMode,
  onToggleSourceMode,
  showToC,
  toggleToC,
  onOpenPDFExport,
  onOpenAccessibility,
  onOpenSEO,
  onOpenCommandPalette
}: {
  editor: any,
  isSourceMode: boolean,
  onToggleSourceMode: () => void,
  showToC: boolean,
  toggleToC: () => void,
  onOpenPDFExport?: () => void,
  onOpenAccessibility?: () => void,
  onOpenSEO?: () => void,
  onOpenCommandPalette?: () => void,
}) => {
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 print:hidden">
      <div className="flex items-center gap-4">
        {/* Left side empty for now or add back button if needed */}
      </div>

      <div className="flex items-center gap-2">
        {/* System Icons */}
        <button
          className={`p-2 rounded-md transition ${showToC ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
          onClick={toggleToC}
          title="Toggle Table of Contents"
        >
          <PanelRight size={18} />
        </button>
        {onOpenCommandPalette && (
          <button
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition"
            onClick={onOpenCommandPalette}
            title="Command Palette (Cmd/Ctrl + K)"
          >
            <Search size={18} />
          </button>
        )}
        {onOpenAccessibility && (
          <button
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition"
            onClick={onOpenAccessibility}
            title="Kiểm tra Accessibility"
          >
            <Eye size={18} />
          </button>
        )}
        {onOpenSEO && (
          <button
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition"
            onClick={onOpenSEO}
            title="Phân tích SEO"
          >
            <TrendingUp size={18} />
          </button>
        )}
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition" onClick={handleFullscreen} title="Fullscreen">
          <Maximize size={18} />
        </button>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* Mode Switcher */}
        <div className="flex bg-gray-100 p-0.5 rounded-md border border-gray-200 mr-2">
          <button
            onClick={() => isSourceMode && onToggleSourceMode()}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-sm transition-all ${!isSourceMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            title="Visual Mode"
          >
            <Eye size={14} />
            <span className="hidden xl:inline">Visual</span>
          </button>
          <button
            onClick={() => !isSourceMode && onToggleSourceMode()}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-sm transition-all ${isSourceMode ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            title="Source Code Mode"
          >
            <FileCode size={14} />
            <span className="hidden xl:inline">Source</span>
          </button>
        </div>

        {/* Action Buttons */}
        {onOpenPDFExport && (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-md text-sm font-medium transition"
            onClick={onOpenPDFExport}
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        )}
      </div>
    </div>
  )
}

const defaultContent = '';

export interface EditorComponentProps {
  config?: EditorConfig;
  onContentChange?: (content: { html: string; json: any; text: string }) => void;
  initialContent?: string;
  editorRef?: React.MutableRefObject<any>;
}

export const Editor: React.FC<EditorComponentProps> = ({
  config = defaultEditorConfig,
  onContentChange,
  initialContent,
  editorRef: externalEditorRef
}) => {
  const [activeMediaDialog, setActiveMediaDialog] = useState<'image' | 'video' | 'audio' | null>(null);
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [isBookmarkDialogOpen, setIsBookmarkDialogOpen] = useState(false);
  const [isFootnoteDialogOpen, setIsFootnoteDialogOpen] = useState(false);
  const [isHistoryViewerOpen, setIsHistoryViewerOpen] = useState(false);
  const [isShortcutsManagerOpen, setIsShortcutsManagerOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imageEditorSrc, setImageEditorSrc] = useState('');
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
  const [isPDFExportDialogOpen, setIsPDFExportDialogOpen] = useState(false);
  const [isAccessibilityCheckerOpen, setIsAccessibilityCheckerOpen] = useState(false);
  const [isSEOAnalyzerOpen, setIsSEOAnalyzerOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Source Mode State
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceContent, setSourceContent] = useState('');

  // Table of Contents Toggle State
  const [showToC, setShowToC] = useState(false);

  // Drag & Drop state
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Memoize extensions to prevent re-creation on every render
  const extensions = React.useMemo(() => [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
      codeBlock: false,
      horizontalRule: false,
    }),
    CustomHorizontalRule,
    Underline,
    CustomImage.configure({
      inline: true,
      allowBase64: true,
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    Placeholder.configure({
      placeholder: 'Type something... or type / for commands',
    }),
    CharacterCount,
    BubbleMenuExtension,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    CustomTable,
    TableRow,
    TableHeader,
    CustomTableCell,
    Subscript,
    Superscript,
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color,
    FontFamily,
    Youtube.configure({
      controls: false,
      nocookie: true,
    }),
    Focus.configure({
      className: 'has-focus',
      mode: 'all',
    }),
    FontSize,
    LineHeight,
    Alert,
    Details,
    Summary,
    Audio,
    Video,
    MapNode,
    BlockContainer,
    ButtonNode,
    SlashCommand.configure({
      suggestion: {
        items: getSuggestionItems,
        render: renderItems,
      },
    }),
    CodeBlockLowlight
      .configure({
        lowlight,
      })
      .extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        }
      }),
    MathInline,
    EquationBlock,
    SearchExtension,
    BookmarkNode,
    InternalLink,
    FootnoteReference,
    Footnote,
    SpellCheckExtension.configure({
      enabled: true,
      language: 'vi',
    }),
    FileAttachmentNode,
    CodeExecutorNode
  ], []); // Constant extensions

  const editor = useEditor({
    extensions,
    content: initialContent || defaultContent,
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[400px] py-4 outline-none text-gray-900',
      },
      handlePaste: (view, event, slice) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData.getData('text/html');
        const text = clipboardData.getData('text/plain');

        if (html) {
          event.preventDefault();
          editor?.chain().focus().insertContent(html).run();
          return true;
        } else if (text) {
          return false;
        }
        return false;
      },
      // Note: handleDrop is defined here but relies on closures. 
      // Since useEditor has [] dep, this closure is STALE if config changes.
      // But we will access current props via ref or assume config is stable enough, 
      // OR better: we move handleDrop logic to a useEffect that adds the listener (which we already have at line 1254!)
      // Wait, we have DUPLICATE handleDrop logic! 
      // One in editorProps (line 1110) and one in useEffect (line 1254).
      // The one in useEffect uses `addEventListener` on the DOM element.
      // The one in editorProps is Prosemirror's handler.
      // We should probably rely on the useEffect one since it handles drag/drop visibly better?
      // Or checking existing code, line 1110 handles drop files.
      // Line 1281 ALSO handles drop files.
      // This DOUBLE HANDLING might be the issue too!
      handleDrop: (view, event, slice, moved) => {
        // Disable prosemirror's default drop handler for files to let our custom listener handle it
        // actually, if we return false, prosemirror handles it.
        // If we want our useEffect to handle it, we should maybe disable this one or return false.
        // BUT `event.preventDefault()` in useEffect prevents Prosemirror from getting it?
        // Let's keep this as minimal or remove file handling here if useEffect covers it.
        // For safely, let's allow text drop but defer file drop to the manual listener which has better UI feedback (isDragging state).

        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
          // Let the custom listener handle files
          return true;
        }
        return false;
      },
    },
  }, []); // Fix: Add dependency array to prevent re-creation loop

  // Command Palette keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add CSS for horizontal rule to make it easier to click and show bubble menu
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ProseMirror hr {
        position: relative;
        padding: 2px 0;
        margin: 16px 0;
        cursor: pointer;
        transition: opacity 0.2s;
      }
      .ProseMirror hr:hover {
        opacity: 0.7;
      }
      .ProseMirror hr::before {
        content: '';
        position: absolute;
        top: -2px;
        left: 0;
        right: 0;
        bottom: -2px;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Make horizontal rule selectable on click to show bubble menu
  useEffect(() => {
    if (!editor || !editorRef.current) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const hrElement = target.tagName === 'HR' ? target : (target as HTMLElement).closest('hr') as HTMLElement | null;

      if (hrElement && editorRef.current?.contains(hrElement)) {
        e.preventDefault();
        e.stopPropagation();

        try {
          const view = editor.view;
          const pos = view.posAtDOM(hrElement, 0);

          if (pos !== null && pos >= 0) {
            const { state } = view;
            const resolvedPos = state.doc.resolve(pos);
            const nodeAfter = resolvedPos.nodeAfter;
            const nodeBefore = resolvedPos.nodeBefore;

            let hrNode = null;
            let hrPos = -1;

            if (nodeAfter && nodeAfter.type.name === 'horizontalRule') {
              hrNode = nodeAfter;
              hrPos = pos;
            } else if (nodeBefore && nodeBefore.type.name === 'horizontalRule') {
              hrNode = nodeBefore;
              hrPos = pos - nodeBefore.nodeSize;
            }

            if (hrNode && hrPos >= 0) {
              const selection = NodeSelection.create(state.doc, hrPos);
              view.dispatch(state.tr.setSelection(selection));
              editor.view.focus();
            }
          }
        } catch (error) {
          // Silently fail if selection fails
          console.debug('Failed to select horizontal rule:', error);
        }
      }
    };

    const editorElement = editorRef.current;
    editorElement.addEventListener('click', handleClick, true);
    return () => {
      editorElement.removeEventListener('click', handleClick, true);
    };
  }, [editor]);

  // Drag & Drop handlers
  useEffect(() => {
    if (!editor || !editorRef.current) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.relatedTarget && !editorRef.current?.contains(e.relatedTarget as HTMLElement)) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
          try {
            let result: string;

            // Tự động upload nếu có uploadUrl, nếu không thì dùng base64
            if (config.uploadUrl) {
              result = await uploadFile(file, config);
            } else {
              // Fallback to base64
              result = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.readAsDataURL(file);
              });
            }

            if (result && editor) {
              if (file.type.startsWith('image/')) {
                editor.chain().focus().setImage({ src: result }).run();
              } else if (file.type.startsWith('video/')) {
                (editor.chain().focus() as any).setVideo({ src: result }).run();
              } else if (file.type.startsWith('audio/')) {
                (editor.chain().focus() as any).setAudio({ src: result }).run();
              }
            }
          } catch (error) {
            console.error('Failed to upload file:', error);
            // Fallback to base64 on error
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              if (result && editor) {
                if (file.type.startsWith('image/')) {
                  editor.chain().focus().setImage({ src: result }).run();
                } else if (file.type.startsWith('video/')) {
                  (editor.chain().focus() as any).setVideo({ src: result }).run();
                } else if (file.type.startsWith('audio/')) {
                  (editor.chain().focus() as any).setAudio({ src: result }).run();
                }
              }
            };
            reader.readAsDataURL(file);
          }
        }
      }
    };

    const editorElement = editorRef.current;
    editorElement.addEventListener('dragenter', handleDragEnter);
    editorElement.addEventListener('dragover', handleDragOver);
    editorElement.addEventListener('dragleave', handleDragLeave);
    editorElement.addEventListener('drop', handleDrop);

    return () => {
      editorElement.removeEventListener('dragenter', handleDragEnter);
      editorElement.removeEventListener('dragover', handleDragOver);
      editorElement.removeEventListener('dragleave', handleDragLeave);
      editorElement.removeEventListener('drop', handleDrop);
    };
  }, [editor, config]);

  // Expose editor instance via ref
  useEffect(() => {
    if (externalEditorRef) {
      externalEditorRef.current = editor;
    }
  }, [editor, externalEditorRef]);

  // Call onContentChange when content changes
  useEffect(() => {
    if (!editor || !onContentChange) return;

    const handleUpdate = () => {
      onContentChange({
        html: editor.getHTML(),
        json: editor.getJSON(),
        text: editor.getText(),
      });
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor, onContentChange]);

  const toggleSourceMode = () => {
    if (isSourceMode) {
      // Switch back to Visual Mode
      if (editor && sourceContent) {
        try {
          editor.commands.setContent(sourceContent);
        } catch (error) {
          console.error('Failed to set content from source:', error);
        }
      }
      setIsSourceMode(false);
    } else {
      // Switch to Source Mode
      if (editor) {
        // Always get fresh content from editor when switching to source mode
        // Use requestAnimationFrame to ensure editor state is fully updated
        requestAnimationFrame(() => {
          const html = editor.getHTML();
          const formatted = formatHTML(html);
          // Update sourceContent with current editor content
          setSourceContent(formatted);
        });
        editor.commands.blur();
      }
      setIsSourceMode(true);
    }
  };

  // Sync sourceContent when editor content changes (only in visual mode)
  useEffect(() => {
    if (!isSourceMode && editor) {
      const html = editor.getHTML();
      // Always sync sourceContent with editor content in visual mode
      const formatted = formatHTML(html);
      if (formatted.trim() !== '') {
        setSourceContent(formatted);
      } else if (formatted.trim() === '' && sourceContent.trim() !== '') {
        // Clear sourceContent if editor is empty
        setSourceContent('');
      }
    }
  }, [editor?.state, isSourceMode]);

  // Initialize sourceContent when editor is ready (first load)
  useEffect(() => {
    if (!editor) return;

    // Wait for editor to be fully ready before syncing
    const syncContent = () => {
      const html = editor.getHTML();
      const formatted = formatHTML(html);
      // Initialize sourceContent with current editor content
      if (formatted.trim() !== '') {
        setSourceContent(formatted);
      } else if (initialContent) {
        // If editor is empty but we have initialContent, use that
        setSourceContent(formatHTML(initialContent));
      }
    };

    // Sync immediately
    syncContent();

    // Also sync after a short delay to ensure editor is fully rendered
    const timeoutId = setTimeout(syncContent, 100);

    // Listen to editor create event
    const handleCreate = () => {
      syncContent();
    };

    editor.on('create', handleCreate);

    return () => {
      clearTimeout(timeoutId);
      editor.off('create', handleCreate);
    };
  }, [editor, initialContent]); // Run when editor is created or initialContent changes

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] relative">
      <div className="sticky top-0 z-10 bg-white print:hidden">
        <TopBar
          editor={editor}
          isSourceMode={isSourceMode}
          onToggleSourceMode={toggleSourceMode}
          showToC={showToC}
          toggleToC={() => setShowToC(!showToC)}
          onOpenPDFExport={() => setIsPDFExportDialogOpen(true)}
          onOpenAccessibility={() => setIsAccessibilityCheckerOpen(true)}
          onOpenSEO={() => setIsSEOAnalyzerOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <EditorToolbar
          editor={editor}
          onOpenDialog={setActiveMediaDialog}
          onOpenMap={() => setIsMapDialogOpen(true)}
          onOpenHelp={() => setIsHelpDialogOpen(true)}
          onOpenTemplates={() => setIsTemplatesDialogOpen(true)}
          onOpenBookmark={() => setIsBookmarkDialogOpen(true)}
          onOpenFootnote={() => setIsFootnoteDialogOpen(true)}
          onOpenHistory={() => setIsHistoryViewerOpen(true)}
          onOpenShortcuts={() => setIsShortcutsManagerOpen(true)}
          onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
          onOpenEmbed={() => setIsEmbedDialogOpen(true)}
          isSourceMode={isSourceMode}
          onToggleSourceMode={toggleSourceMode}
        />
      </div>

      {/* Editor Layout with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth print:overflow-visible print:h-auto print:p-0 relative" onClick={() => !isSourceMode && editor?.chain().focus().run()}>
          <div className="flex justify-center">
            <div className="max-w-[816px] w-full print:max-w-none print:w-full" ref={editorRef}> {/* 816px is approx A4 width at 96dpi */}
              <div
                className={`
                        ${isSourceMode ? 'p-0 bg-[#282c34] border border-gray-700' : 'min-h-[400px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] rounded-sm cursor-text relative print:shadow-none print:border-none print:m-0 print:p-0 bg-white border border-gray-200/60 px-12 py-12'}
                        ${isDragging ? 'ring-2 ring-blue-500 ring-offset-2 bg-blue-50/50' : ''}
                    `}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drag & Drop Overlay */}
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-sm flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-white px-6 py-4 rounded-lg shadow-lg text-center">
                      <p className="text-lg font-semibold text-blue-600 mb-1">Thả file vào đây</p>
                      <p className="text-sm text-gray-600">Hỗ trợ: Ảnh, Video, Audio</p>
                    </div>
                  </div>
                )}
                {/* Source Mode Editor - IDE Style */}
                {isSourceMode && (
                  <HTMLEditor
                    content={sourceContent}
                    onChange={setSourceContent}
                  />
                )}

                {/* Visual Mode - Hidden when source mode is active but kept in DOM to prevent Tiptap unmount errors */}
                <div className={isSourceMode ? 'hidden' : 'block'}>
                  <BubbleMenu
                    editor={editor}
                    onOpenDialog={setActiveMediaDialog}
                    onOpenImageEditor={(imageSrc) => {
                      setImageEditorSrc(imageSrc);
                      setIsImageEditorOpen(true);
                    }}
                  />
                  <ContextMenu
                    editor={editor}
                    onOpenDialog={setActiveMediaDialog}
                    onOpenTemplates={() => setIsTemplatesDialogOpen(true)}
                  />
                  <EditorContent editor={editor} />
                </div>
              </div>

              {/* Visual spacer for bottom of page */}
              <div className="h-16 print:hidden"></div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Table of Contents) */}
        {!isSourceMode && showToC && <TableOfContents editor={editor} />}
      </div>

      {/* Floating Table Controls */}
      {!isSourceMode && <TableHoverControls editor={editor} />}

      {!isSourceMode && <EditorFooter editor={editor} />}

      {/* Media Dialog rendered at root level */}
      <MediaDialog
        isOpen={activeMediaDialog !== null}
        onClose={() => setActiveMediaDialog(null)}
        type={activeMediaDialog || 'image'}
        editor={editor}
        config={config} // Pass the config from props
      />

      <MapDialog
        isOpen={isMapDialogOpen}
        onClose={() => setIsMapDialogOpen(false)}
        onInsert={(src) => (editor?.chain().focus() as any).setMap({ src }).run()}
      />

      <TemplatesDialog
        isOpen={isTemplatesDialogOpen}
        onClose={() => setIsTemplatesDialogOpen(false)}
        onInsert={(content) => {
          if (!editor) return;

          // Trim and clean the HTML content
          const cleanedContent = content.trim();

          // Insert the HTML content directly
          // Tiptap will parse the HTML and convert it to ProseMirror nodes
          // The BlockContainer extension will handle div/section/article tags
          editor.chain()
            .focus()
            .insertContent(cleanedContent)
            .run();
        }}
      />

      {isHelpDialogOpen && <HelpDialog onClose={() => setIsHelpDialogOpen(false)} />}

      {/* Bookmark & Footnote Dialogs */}
      {isBookmarkDialogOpen && editor && (
        <BookmarkDialog
          editor={editor}
          onClose={() => setIsBookmarkDialogOpen(false)}
          onInsert={(id, label) => {
            (editor.chain().focus() as any).setBookmark({ id, label }).run();
          }}
        />
      )}
      {isFootnoteDialogOpen && editor && (
        <FootnoteDialog
          editor={editor}
          onClose={() => setIsFootnoteDialogOpen(false)}
          onInsert={(content) => {
            const footnoteId = `footnote-${Date.now()}`;
            (editor.chain().focus() as any).insertFootnote({ id: footnoteId, content }).run();
          }}
        />
      )}

      {/* New Dialogs */}
      {isHistoryViewerOpen && editor && (
        <HistoryViewer editor={editor} onClose={() => setIsHistoryViewerOpen(false)} />
      )}
      {isShortcutsManagerOpen && editor && (
        <ShortcutsManager editor={editor} onClose={() => setIsShortcutsManagerOpen(false)} />
      )}
      {isVersionHistoryOpen && editor && (
        <VersionHistory editor={editor} onClose={() => setIsVersionHistoryOpen(false)} />
      )}

      {/* Media & Embeds Dialogs */}
      {isImageEditorOpen && imageEditorSrc && (
        <ImageEditor
          imageSrc={imageEditorSrc}
          onSave={(editedSrc) => {
            editor?.chain().focus().setImage({ src: editedSrc }).run();
            setIsImageEditorOpen(false);
            setImageEditorSrc('');
          }}
          onClose={() => {
            setIsImageEditorOpen(false);
            setImageEditorSrc('');
          }}
        />
      )}
      {isEmbedDialogOpen && editor && (
        <EmbedDialog
          editor={editor}
          onClose={() => setIsEmbedDialogOpen(false)}
          onInsert={(html) => {
            editor.chain().focus().insertContent(html).run();
          }}
        />
      )}

      {/* Export & Publishing Dialogs */}
      {isPDFExportDialogOpen && editor && (
        <PDFExportDialog
          editor={editor}
          onClose={() => setIsPDFExportDialogOpen(false)}
        />
      )}

      {/* Accessibility & SEO Dialogs */}
      {isAccessibilityCheckerOpen && editor && (
        <AccessibilityChecker
          editor={editor}
          onClose={() => setIsAccessibilityCheckerOpen(false)}
        />
      )}
      {isSEOAnalyzerOpen && editor && (
        <SEOAnalyzer
          editor={editor}
          onClose={() => setIsSEOAnalyzerOpen(false)}
        />
      )}

      {/* Command Palette */}
      {isCommandPaletteOpen && editor && (
        <CommandPalette
          editor={editor}
          onClose={() => setIsCommandPaletteOpen(false)}
          onAction={(action, value) => {
            // Map command actions to editor commands
            if (action === 'bold') {
              editor.chain().focus().toggleBold().run();
            } else if (action === 'italic') {
              editor.chain().focus().toggleItalic().run();
            } else if (action === 'underline') {
              editor.chain().focus().toggleUnderline().run();
            } else if (action === 'h1') {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            } else if (action === 'h2') {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            } else if (action === 'h3') {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            } else if (action === 'image') {
              setActiveMediaDialog('image');
            } else if (action === 'link') {
              // Will be handled by toolbar
            } else if (action === 'table') {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            } else if (action === 'code') {
              editor.chain().focus().toggleCodeBlock().run();
            } else if (action === 'undo') {
              editor.chain().focus().undo().run();
            } else if (action === 'redo') {
              editor.chain().focus().redo().run();
            }
            setIsCommandPaletteOpen(false);
          }}
        />
      )}
    </div>
  );
};