'use client';
import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import katex from 'katex';
import { Sigma, Check, X } from 'lucide-react';

/* -------------------------------------------------------------------------------- */
/*                               SHARED NODE VIEW                                   */
/* -------------------------------------------------------------------------------- */

interface MathNodeViewProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  selected: boolean;
  getPos: () => number | undefined;
  editor: any;
  extension: any;
}
const MathNodeView = ({ node, updateAttributes, selected, getPos, editor, extension }: MathNodeViewProps) => {
  const [source, setSource] = useState(node.attrs.latex || '');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const renderRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isBlock = node.type.name === 'equationBlock';

  // Sync internal state with node attributes
  useEffect(() => {
    setSource(node.attrs.latex);
  }, [node.attrs.latex]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
        inputRef.current.focus();
        // Move cursor to end
        inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [isEditing]);

  // Render KaTeX
  useEffect(() => {
    if (renderRef.current) {
        try {
            // Reset error
            setError(null);
            
            // If empty, render a placeholder or nothing
            if (!source.trim()) {
               if (isEditing) {
                   renderRef.current.innerHTML = ''; // Empty when editing to avoid clutter
                   return;
               }
               // Placeholder for empty math
               renderRef.current.innerHTML = `<span class="text-gray-300 font-mono text-sm select-none">(Empty ${isBlock ? 'Equation' : 'Math'})</span>`;
               return;
            }

            katex.render(source, renderRef.current, {
                throwOnError: false, // Prevent crash
                displayMode: isBlock, // Block vs Inline mode
                errorColor: '#ef4444', // Red color for errors
                strict: false,
                trust: true,
                macros: {
                    "\\f": "#1f(#2)", // Custom macro example
                }
            });
        } catch (e: any) {
            // Check for the specific quirks mode error
            if (e.message && e.message.includes('quirks mode')) {
                // Do NOT console.error this specific environment error to avoid noise
                setError("Browser in Quirks Mode");
                renderRef.current.innerHTML = ""; 
            } else {
                console.error("KaTeX Error", e);
                setError(e.message || "Invalid LaTeX");
                renderRef.current.innerHTML = ""; // Clear bad render
            }
        }
    }
  }, [source, isBlock, isEditing]);

  const commitChange = useCallback(() => {
      if (source !== node.attrs.latex) {
        updateAttributes({ latex: source });
      }
      setIsEditing(false);
  }, [source, node.attrs.latex, updateAttributes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
      // Enter key behavior
      if (e.key === 'Enter') {
          // If shift+enter, allow new line in block mode only? 
          // LaTeX usually ignores single newlines, but for inputting it's nice.
          if (!e.shiftKey) {
            e.preventDefault();
            commitChange();
          }
      }
      // Escape to cancel changes (revert)
      if (e.key === 'Escape') {
          setSource(node.attrs.latex);
          setIsEditing(false);
      }
  };

  // Click outside to close editor
  useEffect(() => {
      if (!isEditing) return;
      
      const handleClickOutside = (event: MouseEvent) => {
          if (containerRef.current && event.target && !containerRef.current.contains(event.target as HTMLElement)) {
              commitChange();
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, commitChange]);

  return (
    <NodeViewWrapper className={`math-node-wrapper relative group ${isBlock ? 'my-4 w-full flex justify-center' : 'inline-block align-middle'}`}>
        
        {/* RENDER VIEW */}
        <div 
            ref={containerRef}
            onClick={() => !isEditing && setIsEditing(true)}
            className={`
                relative cursor-pointer transition-all duration-200 border rounded
                ${isBlock ? 'p-4 min-w-[50%] text-center' : 'px-1 py-0.5'}
                ${selected && !isEditing ? 'ring-2 ring-blue-400 bg-blue-50/50' : ''}
                ${!isEditing && !selected ? 'border-transparent hover:bg-gray-100' : 'border-transparent'}
                ${isEditing ? 'z-50 shadow-2xl bg-white border-gray-200 ring-2 ring-blue-500 scale-105' : ''}
            `}
        >
            {/* The Actual Math Rendered Here */}
            <span ref={renderRef} className={`${error ? 'hidden' : ''} pointer-events-none`} />

            {/* Error Fallback Display */}
            {error && (
                <span className="text-red-500 font-mono text-sm bg-red-50 px-1 rounded border border-red-200 flex items-center gap-1" title={error}>
                    <Sigma size={12} className="text-red-400" />
                    {source}
                </span>
            )}

            {/* Editing UI Overlay */}
            {isEditing && (
                <div className={`
                    absolute left-1/2 -translate-x-1/2 flex flex-col gap-2 p-1.5 bg-gray-900 text-white rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-150
                    ${isBlock ? 'bottom-full mb-2 w-[400px]' : 'top-full mt-2 w-[300px]'}
                `}>
                    {/* Input Field */}
                    <div className="flex items-start gap-2">
                        <div className="pt-2 text-gray-400">
                             <Sigma size={14} />
                        </div>
                        <textarea
                            ref={inputRef}
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={isBlock ? 3 : 1}
                            className="flex-1 bg-transparent text-sm font-mono text-white placeholder-gray-500 outline-none resize-none overflow-hidden"
                            placeholder={isBlock ? "\\sum_{i=0}^n x_i" : "E = mc^2"}
                            style={{ minHeight: '24px' }}
                        />
                    </div>

                    {/* Toolbar / Helper (Bottom of tooltip) */}
                    <div className="flex justify-between items-center border-t border-gray-700 pt-1.5 mt-1">
                        <span className="text-[10px] text-gray-400 font-medium truncate pr-2">
                            {error ? <span className="text-red-400">{error}</span> : <span>Press Enter to save</span>}
                        </span>
                        <div className="flex gap-1 shrink-0">
                            <button onClick={() => { setSource(node.attrs.latex); setIsEditing(false); }} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white" title="Cancel">
                                <X size={12} />
                            </button>
                            <button onClick={commitChange} className="p-1 bg-blue-600 hover:bg-blue-500 rounded text-white" title="Save">
                                <Check size={12} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Tiny arrow */}
                    <div className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 ${isBlock ? '-bottom-1' : '-top-1'}`}></div>
                </div>
            )}
        </div>
    </NodeViewWrapper>
  );
};

/* -------------------------------------------------------------------------------- */
/*                                EXTENSIONS                                        */
/* -------------------------------------------------------------------------------- */

// 1. Inline Math: $...$
export const MathInline = Node.create({
  name: 'mathInline',
  group: 'inline',
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: 'x',
        parseHTML: element => element.getAttribute('data-latex'),
        renderHTML: attributes => ({ 'data-latex': attributes.latex }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="math-inline"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math-inline' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /\$([^$]+)\$/, // Matches $...$ but not $$...$$ (handled by order usually, but block needs priority)
        type: this.type,
        getAttributes: (match) => ({ latex: match[1] }),
      }),
    ];
  },
});

// 2. Block Equation: $$...$$
export const EquationBlock = Node.create({
  name: 'equationBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      latex: {
        default: 'x = y',
        parseHTML: element => element.getAttribute('data-latex'),
        renderHTML: attributes => ({ 'data-latex': attributes.latex }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="equation-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'equation-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /\$\$([^$]+)\$\$/,
        type: this.type,
        getAttributes: (match) => ({ latex: match[1] }),
      }),
    ];
  },
});
