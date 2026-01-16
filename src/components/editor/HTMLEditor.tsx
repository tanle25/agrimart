'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Replace, ChevronRight, ChevronDown, X, Settings, WrapText } from 'lucide-react';
import hljs from 'highlight.js';

interface HTMLEditorProps {
  content: string;
  onChange: (val: string) => void;
}

interface FoldState {
  [lineNumber: number]: boolean;
}

export const HTMLEditor: React.FC<HTMLEditorProps> = ({ content, onChange }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [selectedText, setSelectedText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [replaceMode, setReplaceMode] = useState(false);
  const [wordWrap, setWordWrap] = useState(false);
  const [foldState, setFoldState] = useState<FoldState>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const editorClassRef = useRef<string>(`html-editor-${Math.random().toString(36).substr(2, 9)}`);

  // Common styles - IDE-like appearance
  const fontSize = '14px';
  const lineHeight = '21px';
  const padding = '16px';
  const fontFamily = "'JetBrains Mono', 'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace";

  // Base styles that must match exactly between textarea and highlight layer
  const baseTextStyles: React.CSSProperties = {
    fontFamily,
    fontSize,
    lineHeight,
    tabSize: 2,
    padding,
    margin: 0,
    border: 'none',
    outline: 'none',
    boxSizing: 'border-box',
    letterSpacing: 'normal',
    wordSpacing: 'normal',
    textIndent: 0,
    textAlign: 'left',
    textTransform: 'none',
    textDecoration: 'none',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontVariant: 'normal',
    verticalAlign: 'baseline',
  };

  // Dynamic styles based on wordWrap
  const dynamicTextStyles: React.CSSProperties = {
    whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
    wordBreak: wordWrap ? 'break-word' : 'normal',
    overflowWrap: wordWrap ? 'break-word' : 'normal',
  };

  const commonTextStyles: React.CSSProperties = {
    ...baseTextStyles,
    ...dynamicTextStyles,
  };

  // Generate line numbers
  const lines = content.split('\n');
  const lineCount = Math.max(1, lines.length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Detect HTML/XML tags for folding
  const getFoldableLines = useCallback(() => {
    const foldable: { [key: number]: { start: number; end: number; level: number } } = {};
    const stack: Array<{ tag: string; line: number; level: number }> = [];
    let level = 0;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const openTagMatch = line.match(/<(\w+)[^>]*>/);
      const closeTagMatch = line.match(/<\/(\w+)>/);

      if (openTagMatch && !line.match(/\/>/)) {
        // Opening tag (not self-closing)
        level++;
        stack.push({ tag: openTagMatch[1], line: lineNum, level });
      } else if (closeTagMatch) {
        // Closing tag
        const matchingOpen = stack.findLast((item) => item.tag === closeTagMatch[1]);
        if (matchingOpen) {
          foldable[matchingOpen.line] = {
            start: matchingOpen.line,
            end: lineNum,
            level: matchingOpen.level,
          };
          const idx = stack.findLastIndex((item) => item.tag === closeTagMatch[1]);
          if (idx !== -1) {
            stack.splice(idx, 1);
            level--;
          }
        }
      }
    });

    return foldable;
  }, [lines]);

  const foldableLines = getFoldableLines();

  // Toggle fold state
  const toggleFold = (lineNumber: number) => {
    setFoldState((prev) => ({
      ...prev,
      [lineNumber]: !prev[lineNumber],
    }));
  };

  // Check if line should be hidden (folded)
  const isLineHidden = (lineNumber: number): boolean => {
    for (const [foldLine, foldInfo] of Object.entries(foldableLines)) {
      const foldLineNum = parseInt(foldLine);
      if (foldState[foldLineNum] === true && lineNumber > foldLineNum && lineNumber < foldInfo.end) {
        return true;
      }
    }
    return false;
  };

  // Get visible lines (for rendering)
  const getVisibleLines = () => {
    return lines.map((line, index) => {
      const lineNum = index + 1;
      return {
        lineNum,
        content: line,
        isHidden: isLineHidden(lineNum),
        isFoldable: !!foldableLines[lineNum],
        foldInfo: foldableLines[lineNum],
      };
    }).filter(item => !item.isHidden);
  };

  // Update syntax highlighting
  useEffect(() => {
    if (!content) {
      setHighlightedCode('');
      return;
    }

    try {
      const result = hljs.highlight(content, { language: 'xml' }).value;
      setHighlightedCode(result);
    } catch (e) {
      try {
        const result = hljs.highlight(content, { language: 'html' }).value;
        setHighlightedCode(result);
      } catch (e2) {
        // Fallback: escape HTML
        setHighlightedCode(
          content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
        );
      }
    }
  }, [content]);

  // Sync scroll between all scrollable elements
  const handleScroll = useCallback(() => {
    if (!textareaRef.current) return;

    const scrollTop = textareaRef.current.scrollTop;
    const scrollLeft = textareaRef.current.scrollLeft;

    // Sync highlight layer scroll using transform (since it has overflow: hidden)
    if (highlightRef.current) {
      highlightRef.current.style.transform = `translate(-${scrollLeft}px, -${scrollTop}px)`;
    }

    // Sync line numbers scroll
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  }, []);

  // Update cursor position
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    setCursorPosition({ line, column });

    // Update selected text
    const selected = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
    setSelectedText(selected);
  }, []);

  // Auto-indentation on Enter
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, start);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines[lines.length - 1];

      // Detect indentation
      const indentMatch = currentLine.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';

      // Check if previous line ends with opening tag
      const prevLine = lines[lines.length - 2] || '';
      const isOpeningTag = prevLine.trim().match(/<(\w+)[^>]*>$/);

      if (isOpeningTag) {
        // Add extra indent for nested content
        const extraIndent = indent.match(/^(\s{2}|\t)/) ? (indent.match(/^(\s{2})/) ? '  ' : '\t') : '  ';
        setTimeout(() => {
          const newStart = start + indent.length + extraIndent.length + 1;
          textarea.setSelectionRange(newStart, newStart);
        }, 0);
      }
    }

    // Toggle search (Cmd/Ctrl + F)
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      setShowSearch(true);
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    // Escape to close search
    if (e.key === 'Escape' && showSearch) {
      e.preventDefault();
      setShowSearch(false);
    }
  }, [showSearch]);

  // Search functionality
  const findMatches = useCallback(() => {
    if (!searchQuery) return [];
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches: Array<{ line: number; column: number }> = [];
    lines.forEach((line, index) => {
      let match;
      while ((match = regex.exec(line)) !== null) {
        matches.push({ line: index + 1, column: match.index + 1 });
      }
    });
    return matches;
  }, [searchQuery, lines]);

  const searchMatches = findMatches();
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Replace functionality
  const handleReplace = useCallback(() => {
    if (!searchQuery || !replaceQuery) return;

    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newContent = content.replace(regex, replaceQuery);
    onChange(newContent);
  }, [searchQuery, replaceQuery, content, onChange]);

  const handleReplaceAll = useCallback(() => {
    if (!searchQuery || !replaceQuery) return;

    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newContent = content.replace(regex, replaceQuery);
    onChange(newContent);
    setSearchQuery('');
    setReplaceQuery('');
  }, [searchQuery, replaceQuery, content, onChange]);

  // Navigate to next/previous match
  const navigateMatch = useCallback((direction: 'next' | 'prev') => {
    if (searchMatches.length === 0) return;

    const newIndex = direction === 'next'
      ? (currentMatchIndex + 1) % searchMatches.length
      : (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;

    setCurrentMatchIndex(newIndex);

    // Scroll to match
    const match = searchMatches[newIndex];
    if (textareaRef.current && match) {
      const textarea = textareaRef.current;
      const textBeforeMatch = lines.slice(0, match.line - 1).join('\n') + '\n' + lines[match.line - 1].substring(0, match.column - 1);
      const position = textBeforeMatch.length;
      textarea.setSelectionRange(position, position + searchQuery.length);
      textarea.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [searchMatches, currentMatchIndex, searchQuery, lines]);

  // Auto-resize and ensure proper dimensions
  useEffect(() => {
    if (textareaRef.current) {
      // Reset to get accurate dimensions
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.width = '100%';
      textareaRef.current.style.minWidth = 'auto';

      // Force a reflow to get accurate scrollWidth
      void textareaRef.current.offsetHeight;

      const scrollHeight = textareaRef.current.scrollHeight;
      const scrollWidth = textareaRef.current.scrollWidth;
      const clientWidth = textareaRef.current.clientWidth;
      const minHeight = Math.max(400, scrollHeight);

      // Set textarea height only - width stays at 100% to allow scrolling
      textareaRef.current.style.height = `${minHeight}px`;

      // Sync highlight layer dimensions - code element needs to be as wide as scrollWidth
      if (highlightRef.current) {
        highlightRef.current.style.height = `${minHeight}px`;

        const codeElement = highlightRef.current.querySelector('code') as HTMLElement;
        if (codeElement) {
          codeElement.style.minHeight = `${minHeight}px`;

          if (!wordWrap) {
            // Code element must be exactly as wide as scrollWidth to show all content
            // This allows scrolling when content is wider than container
            const codeWidth = Math.max(scrollWidth, clientWidth);
            codeElement.style.minWidth = `${codeWidth}px`;
            codeElement.style.width = `${codeWidth}px`;
            // Pre element needs to be at least as wide as code element
            highlightRef.current.style.width = `${codeWidth}px`;
            highlightRef.current.style.minWidth = `${codeWidth}px`;
          } else {
            codeElement.style.width = '100%';
            codeElement.style.minWidth = '100%';
            highlightRef.current.style.width = '100%';
          }
        }
      }

      // Sync line numbers height
      if (lineNumbersRef.current) {
        lineNumbersRef.current.style.height = `${minHeight}px`;
      }
    }
  }, [content, highlightedCode, wordWrap]);

  // Focus search input when shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.select();
    }
  }, [showSearch]);

  // Force transparency on textarea to fix visibility issues
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.setProperty('color', 'transparent', 'important');
    }
  }, [content]);

  // Add CSS to override highlight.js styles that might affect alignment
  useEffect(() => {
    const styleId = 'html-editor-override-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    const editorClass = editorClassRef.current;

    styleElement.textContent = `
      /* Reset highlight.js styles for HTML editor - scoped to prevent conflicts */
      .${editorClass} .hljs.language-xml,
      .${editorClass} .hljs.language-xml * {
        font-family: ${fontFamily} !important;
        font-size: ${fontSize} !important;
        line-height: ${lineHeight} !important;
        letter-spacing: normal !important;
        word-spacing: normal !important;
        text-indent: 0 !important;
        text-align: left !important;
        text-transform: none !important;
        font-style: normal !important;
        font-weight: normal !important;
        font-variant: normal !important;
        vertical-align: baseline !important;
        text-shadow: none !important;
        font-variant-ligatures: none !important;
        font-feature-settings: normal !important;
        font-kerning: auto !important;
        font-optical-sizing: auto !important;
        font-variation-settings: normal !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-sizing: border-box !important;
        white-space: ${wordWrap ? 'pre-wrap' : 'pre'} !important;
        tab-size: 2 !important;
      }
      
      /* Ensure span elements inside don't break alignment */
      .${editorClass} .hljs.language-xml span {
        display: inline !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        line-height: inherit !important;
        font-size: inherit !important;
        font-family: inherit !important;
        letter-spacing: inherit !important;
        word-spacing: inherit !important;
        vertical-align: baseline !important;
        white-space: inherit !important;
        tab-size: inherit !important;
      }
      
      /* Ensure pre element matches textarea exactly */
      .${editorClass} pre {
        font-family: ${fontFamily} !important;
        font-size: ${fontSize} !important;
        line-height: ${lineHeight} !important;
        padding: ${padding} !important;
        margin: 0 !important;
        border: none !important;
        box-sizing: border-box !important;
        letter-spacing: normal !important;
        word-spacing: normal !important;
        text-indent: 0 !important;
        text-align: left !important;
        white-space: ${wordWrap ? 'pre-wrap' : 'pre'} !important;
        tab-size: 2 !important;
        overflow: hidden !important;
        overflow-x: hidden !important;
        overflow-y: hidden !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
      }
      
      /* Hide scrollbars on code element and ensure it can expand */
      .${editorClass} .hljs.language-xml {
        overflow: visible !important;
        overflow-x: visible !important;
        overflow-y: visible !important;
        min-width: ${wordWrap ? '100%' : 'max-content'} !important;
        width: ${wordWrap ? '100%' : 'max-content'} !important;
      }
      
      /* Hide any scrollbars on container divs */
      .${editorClass} > div {
        overflow-x: hidden !important;
      }
      
      .${editorClass} > div > div {
        overflow-x: hidden !important;
      }
      
      /* Improved Syntax Highlighting Colors - High Contrast & Easy to Read */
      .${editorClass} .hljs {
        background: #1e1e1e !important;
        color: #d4d4d4 !important;
      }
      
      /* HTML Tags - Bright Blue */
      .${editorClass} .hljs-tag,
      .${editorClass} .hljs-name {
        color: #4ec9b0 !important;
        font-weight: 500 !important;
      }
      
      /* Opening/Closing Brackets - Cyan */
      .${editorClass} .hljs-punctuation {
        color: #d4d4d4 !important;
      }
      
      /* Attribute Names - Light Orange */
      .${editorClass} .hljs-attr {
        color: #9cdcfe !important;
        font-weight: 400 !important;
      }
      
      /* Attribute Values - Yellow/Orange */
      .${editorClass} .hljs-string {
        color: #ce9178 !important;
        font-weight: 400 !important;
      }
      
      /* Comments - Green */
      .${editorClass} .hljs-comment {
        color: #6a9955 !important;
        font-style: italic !important;
      }
      
      /* DOCTYPE and XML Declaration - Purple */
      .${editorClass} .hljs-meta,
      .${editorClass} .hljs-meta-keyword {
        color: #c586c0 !important;
        font-weight: 500 !important;
      }
      
      /* Numbers - Light Blue */
      .${editorClass} .hljs-number {
        color: #b5cea8 !important;
      }
      
      /* Keywords - Blue */
      .${editorClass} .hljs-keyword {
        color: #569cd6 !important;
        font-weight: 500 !important;
      }
      
      /* Operators - White */
      .${editorClass} .hljs-operator {
        color: #d4d4d4 !important;
      }
      
      /* Function names - Yellow */
      .${editorClass} .hljs-function,
      .${editorClass} .hljs-title {
        color: #dcdcaa !important;
      }
      
      /* Variables - Light Blue */
      .${editorClass} .hljs-variable {
        color: #9cdcfe !important;
      }
      
      /* Selection highlight */
      .${editorClass} .hljs::selection,
      .${editorClass} .hljs *::selection {
        background: rgba(0, 122, 204, 0.3) !important;
      }
    `;

    // Add class to container if not already added
    if (containerRef.current && !containerRef.current.classList.contains(editorClass)) {
      containerRef.current.classList.add(editorClass);
    }

    return () => {
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [fontFamily, fontSize, lineHeight, wordWrap]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col bg-[#1e1e1e] rounded-md border border-gray-700 overflow-hidden ${editorClassRef.current}`}
      style={{ minHeight: '400px' }}
    >
      {/* IDE Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#3e3e42]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`p-1.5 rounded hover:bg-[#2d2d30] transition ${wordWrap ? 'text-blue-400' : 'text-gray-400'}`}
            title="Toggle Word Wrap"
          >
            <WrapText size={14} />
          </button>
          <div className="h-4 w-px bg-[#3e3e42] mx-1" />
          <span className="text-xs text-gray-400 font-mono">
            Ln {cursorPosition.line}, Col {cursorPosition.column}
            {selectedText && ` • ${selectedText.length} selected`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowSearch(true);
              setReplaceMode(false);
            }}
            className="p-1.5 rounded hover:bg-[#2d2d30] text-gray-400 transition"
            title="Search (Cmd/Ctrl + F)"
          >
            <Search size={14} />
          </button>
        </div>
      </div>

      {/* Search & Replace Bar */}
      {showSearch && (
        <div className="px-3 py-2 bg-[#252526] border-b border-[#3e3e42] flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2">
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentMatchIndex(0);
              }}
              placeholder="Search"
              className="flex-1 bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <span className="text-xs text-gray-400">
                {searchMatches.length > 0 ? `${currentMatchIndex + 1}/${searchMatches.length}` : '0'}
              </span>
            )}
            <button
              onClick={() => navigateMatch('prev')}
              disabled={searchMatches.length === 0}
              className="p-1 rounded hover:bg-[#2d2d30] text-gray-400 disabled:opacity-50"
              title="Previous (Shift + Enter)"
            >
              ↑
            </button>
            <button
              onClick={() => navigateMatch('next')}
              disabled={searchMatches.length === 0}
              className="p-1 rounded hover:bg-[#2d2d30] text-gray-400 disabled:opacity-50"
              title="Next (Enter)"
            >
              ↓
            </button>
          </div>
          <button
            onClick={() => setReplaceMode(!replaceMode)}
            className="p-1.5 rounded hover:bg-[#2d2d30] text-gray-400 transition"
            title="Toggle Replace"
          >
            <Replace size={14} />
          </button>
          {replaceMode && (
            <>
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace"
                className="w-40 bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleReplace();
                }}
              />
              <button
                onClick={handleReplace}
                disabled={!searchQuery}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-50"
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                disabled={!searchQuery}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded disabled:opacity-50"
              >
                Replace All
              </button>
            </>
          )}
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
              setReplaceQuery('');
              setCurrentMatchIndex(0);
            }}
            className="p-1.5 rounded hover:bg-[#2d2d30] text-gray-400"
            title="Close (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editor Area */}
      <div className="relative w-full flex flex-1 overflow-hidden">
        {/* Line Numbers Column */}
        <div
          ref={lineNumbersRef}
          className="w-14 bg-[#252526] text-[#858585] text-right select-none overflow-y-auto overflow-x-hidden border-r border-[#3e3e42] flex-shrink-0"
          style={{
            paddingTop: padding,
            paddingBottom: padding,
            paddingLeft: '8px',
            paddingRight: '8px',
            fontFamily,
            fontSize,
          }}
        >
          {lineNumbers.map((num) => {
            const isHidden = isLineHidden(num);
            if (isHidden) return null;

            const isFoldable = foldableLines[num];
            const isFolded = foldState[num] === true;

            return (
              <div
                key={num}
                className="flex items-center justify-end gap-1"
                style={{
                  lineHeight,
                  minHeight: lineHeight,
                }}
              >
                {isFoldable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFold(num);
                    }}
                    className="text-gray-500 hover:text-gray-300 p-0.5 -mr-1 flex-shrink-0"
                    title={isFolded ? 'Expand' : 'Collapse'}
                  >
                    {isFolded ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
                {!isFoldable && <span className="w-3" />}
                <span className="select-none">{num}</span>
              </div>
            );
          })}
        </div>

        {/* Code Editor Area */}
        <div className="relative flex-1" style={{ minWidth: 0, overflow: 'hidden' }}>
          {/* Syntax Highlighted Background Layer - No scroll, syncs with textarea */}
          <pre
            ref={highlightRef}
            className="absolute pointer-events-none"
            style={{
              ...commonTextStyles,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              overflowX: 'hidden',
              overflowY: 'hidden',
            }}
          >
            <code
              className="hljs language-xml"
              style={{
                ...commonTextStyles,
                background: 'transparent',
                display: 'block',
                color: 'inherit',
                // Reset all highlight.js theme styles that might affect alignment
                textShadow: 'none',
                fontVariantLigatures: 'none',
                fontFeatureSettings: 'normal',
                fontKerning: 'auto',
                fontOpticalSizing: 'auto',
                fontVariationSettings: 'normal',
                overflow: 'visible',
                overflowX: 'visible',
                overflowY: 'visible',
                // Ensure code element can expand to full content width
                minWidth: wordWrap ? '100%' : 'max-content',
                width: wordWrap ? '100%' : 'max-content',
                // Prevent wrapping to ensure full width
                whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
              }}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>

          {/* Editable Textarea - Only this has scrollbar */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              onChange(e.target.value);
              updateCursorPosition();
            }}
            onScroll={handleScroll}
            onInput={handleScroll}
            onKeyDown={handleKeyDown}
            onSelect={updateCursorPosition}
            onMouseUp={updateCursorPosition}
            onKeyUp={updateCursorPosition}
            spellCheck={false}
            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-[#aeafad] outline-none resize-none z-10 text-editor-input"
            style={{
              ...commonTextStyles,
              overflowX: wordWrap ? 'hidden' : 'scroll',
              overflowY: 'scroll',
            }}
          />
        </div>
      </div>
    </div>
  );
};

