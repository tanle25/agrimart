'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { GripVertical, Trash2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Settings2, Plus, Layout, Columns, Grid3X3, MinusSquare, Square, Rows, AlignJustify, Eraser, Minus, MoreHorizontal, GripHorizontal, Equal, ChevronDown, Check, PaintBucket } from 'lucide-react';
import { ColorPalette } from './ColorPalette';

interface Props {
  editor: Editor | null;
}

export const TableHoverControls: React.FC<Props> = ({ editor }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [activeTableNode, setActiveTableNode] = useState<HTMLElement | null>(null);
  const [rowCoords, setRowCoords] = useState<{ top: number; height: number; index: number }[]>([]);
  const [colCoords, setColCoords] = useState<{ left: number; width: number; index: number }[]>([]);
  
  // State for hover detection
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [isHoveringHandle, setIsHoveringHandle] = useState(false);

  // State for Menus
  const [activeMenu, setActiveMenu] = useState<{ type: 'row' | 'col' | 'table', index: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // State for Border Options
  const [isBorderStyleOpen, setIsBorderStyleOpen] = useState(false);
  const [isBorderWidthOpen, setIsBorderWidthOpen] = useState(false);
  const [isBorderColorOpen, setIsBorderColorOpen] = useState(false);
  
  // State to track current border attributes for UI updates
  const [currentBorderStyle, setCurrentBorderStyle] = useState<string>('solid');
  const [currentBorderWidth, setCurrentBorderWidth] = useState<string>('1px');
  const [currentBorderColor, setCurrentBorderColor] = useState<string | null>(null);

  // State for Drag & Drop
  const [dragState, setDragState] = useState<{ type: 'row' | 'col', fromIndex: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ type: 'row' | 'col', index: number } | null>(null);

  const updateTableData = useCallback(() => {
    if (!editor) return;
    
    const isTableActive = editor.isActive('table');
    
    // Only clear if no menu is open OR if table is truly gone from DOM
    if (!isTableActive && !dragState) {
        if (!activeTableNode || !document.contains(activeTableNode)) {
             if (activeMenu) setActiveMenu(null);
             setRect(null);
             setActiveTableNode(null);
             return;
        }
    }

    const domSelection = window.getSelection();
    let tableEl: HTMLElement | null = null;
    
    if (domSelection && domSelection.anchorNode) {
        const anchor = domSelection.anchorNode instanceof Element 
            ? domSelection.anchorNode 
            : domSelection.anchorNode.parentElement;
            
        tableEl = anchor?.closest('table') as HTMLElement;
    }

    if (!tableEl && activeTableNode && document.contains(activeTableNode)) {
        tableEl = activeTableNode;
    }

    if (tableEl) {
        const tableRect = tableEl.getBoundingClientRect();
        setRect(tableRect);
        setActiveTableNode(tableEl);

        const rows = Array.from(tableEl.querySelectorAll('tr'));
        const newRowCoords = rows.map((r, i) => {
            const rRect = r.getBoundingClientRect();
            return { top: rRect.top, height: rRect.height, index: i };
        });
        setRowCoords(newRowCoords);

        const firstRow = rows[0];
        if (firstRow) {
            const cells = Array.from(firstRow.children);
            const newColCoords = cells.map((c, i) => {
                const cRect = c.getBoundingClientRect();
                return { left: cRect.left, width: cRect.width, index: i };
            });
            setColCoords(newColCoords);
        }
    }
  }, [editor, activeMenu, activeTableNode, dragState]);

  useEffect(() => {
    if (!editor) return;
    editor.on('selectionUpdate', updateTableData);
    editor.on('update', updateTableData);
    editor.on('blur', updateTableData);
    window.addEventListener('scroll', updateTableData, true);
    window.addEventListener('resize', updateTableData);
    
    const handleMouseMove = (e: MouseEvent) => {
        if (!rect) return;
        const hitBuffer = 30; // Increased buffer
        
        // Detect if mouse is over the handle area (Top Left corner where the settings button is)
        // Button is roughly at rect.top - 14, rect.left - 14. 
        // We define a generous zone around it.
        const isOverHandle = 
            e.clientX >= rect.left - 30 && 
            e.clientX <= rect.left + 10 && 
            e.clientY >= rect.top - 30 && 
            e.clientY <= rect.top + 10;
            
        setIsHoveringHandle(isOverHandle);

        let foundCol = null;
        if (e.clientY >= rect.top - hitBuffer && e.clientY <= rect.bottom + hitBuffer) {
             colCoords.forEach(col => {
                 if (e.clientX >= col.left && e.clientX <= col.left + col.width) {
                     foundCol = col.index;
                 }
             });
        }
        setHoveredCol(foundCol);

        let foundRow = null;
         if (e.clientX >= rect.left - hitBuffer && e.clientX <= rect.right + hitBuffer) {
             rowCoords.forEach(row => {
                 if (e.clientY >= row.top && e.clientY <= row.top + row.height) {
                     foundRow = row.index;
                 }
             });
        }
        setHoveredRow(foundRow);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
        editor.off('selectionUpdate', updateTableData);
        editor.off('update', updateTableData);
        editor.off('blur', updateTableData);
        window.removeEventListener('scroll', updateTableData, true);
        window.removeEventListener('resize', updateTableData);
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [editor, rect, colCoords, rowCoords]);

  useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
              setActiveMenu(null);
          }
      };
      if (activeMenu) {
          document.addEventListener('mousedown', handleClickOutside);
      }
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  const focusCell = (rowIndex: number, colIndex: number) => {
      if (!activeTableNode || !editor) return;
      const rows = Array.from(activeTableNode.querySelectorAll('tr')) as HTMLElement[];
      const row = rows[rowIndex];
      if (row) {
          const cell = row.children[colIndex];
          if (cell) {
              // Ensure we are focusing inside the cell to activate Tiptap's table logic
              // posAtDOM with 0 offset usually points to start of content
              const pos = editor.view.posAtDOM(cell, 0); 
              if (pos >= 0) {
                  try {
                      // Attempt to set selection inside the cell
                      // +1 is often safer to be inside the node content
                      editor.chain().setTextSelection(pos + 1).run();
                  } catch (e) {
                      console.warn("Could not set focus", e);
                  }
              }
          }
      }
  };

  /* --- Drag & Drop Handlers --- */
  const handleDragStart = (e: React.DragEvent, type: 'row' | 'col', index: number) => {
      setDragState({ type, fromIndex: index });
      
      if (activeTableNode) {
          const ghost = document.createElement('div');
          ghost.style.position = 'absolute';
          ghost.style.top = '-9999px';
          ghost.style.backgroundColor = '#3b82f6'; 
          ghost.style.borderRadius = '99px';
          ghost.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.6)';
          ghost.style.zIndex = '1000';
          ghost.style.pointerEvents = 'none';

          if (type === 'row') {
              ghost.style.width = '300px'; 
              ghost.style.height = '4px';
          } else {
              ghost.style.width = '4px';
              ghost.style.height = '100px';
          }

          document.body.appendChild(ghost);
          e.dataTransfer.setDragImage(ghost, type === 'row' ? 150 : 2, type === 'row' ? 2 : 50);
          e.dataTransfer.effectAllowed = 'move';
          setTimeout(() => document.body.removeChild(ghost), 0);
      }
  };

  const handleDragOver = (e: React.DragEvent, type: 'row' | 'col', index: number) => {
      e.preventDefault();
      if (!dragState || dragState.type !== type) return;
      if (dropTarget?.index !== index) setDropTarget({ type, index });
  };

  const handleDrop = (e: React.DragEvent, type: 'row' | 'col', index: number) => {
      e.preventDefault();
      if (!dragState || !editor || !activeTableNode) return;

      const from = dragState.fromIndex;
      const to = index;

      if (from === to) {
          setDragState(null);
          setDropTarget(null);
          return;
      }

      const pos = editor.view.posAtDOM(activeTableNode, 0);
      const $pos = editor.state.doc.resolve(pos);
      let tableDepth = -1;
      for (let d = $pos.depth; d >= 0; d--) {
          if ($pos.node(d).type.name === 'table') {
              tableDepth = d;
              break;
          }
      }

      if (tableDepth !== -1) {
          const tableNode = $pos.node(tableDepth);
          const tableStartPos = $pos.start(tableDepth);
          const tableJSON = tableNode.toJSON();
          const rows = tableJSON.content;

          if (type === 'row') {
              if (from < rows.length && to <= rows.length) {
                  const [movedRow] = rows.splice(from, 1);
                  let insertIndex = to;
                  if (from < to) insertIndex = to - 1; 
                  if (insertIndex < 0) insertIndex = 0;
                  if (insertIndex > rows.length) insertIndex = rows.length;
                  rows.splice(insertIndex, 0, movedRow);
              }
          } 
          else if (type === 'col') {
             let insertIndex = to;
             if (from < to) insertIndex = to - 1;
             
             const newRows = rows.map((row: any) => {
                 if (row.content) {
                     const cells = [...row.content];
                     if (from < cells.length) {
                         const [movedCell] = cells.splice(from, 1);
                         let cellInsertIndex = insertIndex;
                         if (cellInsertIndex > cells.length) cellInsertIndex = cells.length;
                         cells.splice(cellInsertIndex, 0, movedCell);
                         return { ...row, content: cells };
                     }
                 }
                 return row;
             });
             tableJSON.content = newRows;
          }

          const newTableNode = editor.schema.nodeFromJSON(tableJSON);
          const tr = editor.state.tr.replaceWith(
               tableStartPos - 1, 
               tableStartPos - 1 + tableNode.nodeSize, 
               newTableNode
          );
          editor.view.dispatch(tr);
      }

      setDragState(null);
      setDropTarget(null);
      setTimeout(updateTableData, 50);
  };

  /* --- Styling Logic --- */
  const toggleTableClass = (className: string) => {
      if (!editor || !activeTableNode) return;
      
      // CRITICAL: Ensure the editor is focused inside the specific table we are modifying.
      // If we clicked the floating menu, focus might have been lost or shifted.
      focusCell(0, 0);

      // Get current classes directly from DOM to ensure sync state
      const currentClasses = (activeTableNode.getAttribute('class') || '').split(' ');
      let newClasses = [...currentClasses];

      // Groups of mutually exclusive classes
      const BORDER_CLASSES = ['no-borders', 'borders-outer', 'default']; // 'default' removes others
      const THEME_CLASSES = ['theme-modern-blue', 'theme-dark-header', 'theme-minimal', 'theme-gray', 'theme-green', 'theme-purple'];

      if (BORDER_CLASSES.includes(className)) {
          // Remove existing border classes
          newClasses = newClasses.filter(c => !BORDER_CLASSES.includes(c) && c !== 'default');
          if (className !== 'default') newClasses.push(className);
      } 
      else if (THEME_CLASSES.includes(className)) {
          // Remove existing themes
          newClasses = newClasses.filter(c => !THEME_CLASSES.includes(c));
          // If we are toggling the SAME theme, it turns off (back to default)
          if (!currentClasses.includes(className)) {
              newClasses.push(className);
          }
      }
      else {
          // Standard toggle (Striped, Compact)
          if (currentClasses.includes(className)) {
              newClasses = newClasses.filter(c => c !== className);
          } else {
              newClasses.push(className);
          }
      }
      
      // Apply to editor state
      const finalClassString = newClasses.join(' ').trim();
      editor.chain().updateAttributes('table', { class: finalClassString }).run();
      
      // Force update local state immediately so UI reflects change
      if (activeTableNode) {
          activeTableNode.setAttribute('class', finalClassString);
      }
      setTimeout(() => updateTableData(), 50); 
  };

  const hasClass = (className: string) => activeTableNode?.classList.contains(className);

  // Apply border to all cells in the table
  const applyBorderToAllCells = (attr: 'borderStyle' | 'borderWidth' | 'borderColor', value: string | null) => {
    if (!editor || !activeTableNode) return;
    
    focusCell(0, 0);
    
    const { state, dispatch } = editor.view;
    const pos = editor.view.posAtDOM(activeTableNode, 0);
    const $pos = state.doc.resolve(pos);
    
    // Find table node
    let tableDepth = -1;
    for (let d = $pos.depth; d >= 0; d--) {
      if ($pos.node(d).type.name === 'table') {
        tableDepth = d;
        break;
      }
    }
    
    if (tableDepth === -1) return;
    
    const tableStartPos = $pos.start(tableDepth);
    const tableEndPos = $pos.end(tableDepth);
    const tr = state.tr;
    
    // Apply to all cells in the table
    state.doc.nodesBetween(tableStartPos, tableEndPos, (node, nodePos) => {
      if (node.type.name === 'tableCell') {
        const attrs = { ...node.attrs };
        if (value) {
          attrs[attr] = value;
        } else {
          delete attrs[attr];
        }
        tr.setNodeMarkup(nodePos, undefined, attrs);
      }
    });
    
    dispatch(tr);
    
    // Update local state immediately
    if (attr === 'borderStyle') {
      setCurrentBorderStyle(value || 'solid');
    } else if (attr === 'borderWidth') {
      setCurrentBorderWidth(value || '1px');
    } else if (attr === 'borderColor') {
      setCurrentBorderColor(value);
    }
  };

  // Get current border attribute from first cell
  const getCurrentBorderAttr = (attr: 'borderStyle' | 'borderWidth' | 'borderColor') => {
    if (!editor || !activeTableNode) return null;
    
    const firstCell = activeTableNode.querySelector('td, th');
    if (!firstCell) return null;
    
    const pos = editor.view.posAtDOM(firstCell, 0);
    if (pos < 0) return null;
    
    const $pos = editor.state.doc.resolve(pos);
    for (let depth = $pos.depth; depth > 0; depth--) {
      const node = $pos.node(depth);
      if (node.type.name === 'tableCell') {
        return node.attrs[attr] || null;
      }
    }
    return null;
  };

  // Update border state from editor
  useEffect(() => {
    if (!editor || !activeTableNode) return;
    
    const updateBorderState = () => {
      const style = getCurrentBorderAttr('borderStyle') || 'solid';
      const width = getCurrentBorderAttr('borderWidth') || '1px';
      const color = getCurrentBorderAttr('borderColor');
      
      setCurrentBorderStyle(style);
      setCurrentBorderWidth(width);
      setCurrentBorderColor(color);
    };
    
    updateBorderState();
    
    // Listen to editor updates
    const handleUpdate = () => {
      setTimeout(updateBorderState, 10);
    };
    
    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);
    
    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor, activeTableNode]);

  const renderMenu = () => {
      if (!activeMenu || !editor) return null;
      
      const { type, index } = activeMenu;
      const isRow = type === 'row';
      const isCol = type === 'col';
      const isTable = type === 'table';

      let style: React.CSSProperties = {};
      if (isRow) {
          const row = rowCoords[index];
          style = { top: row.top + 20, left: rect!.left - 10 };
      } else if (isCol) {
          const col = colCoords[index];
          style = { top: rect!.top + 20, left: col.left + 10 };
      } else {
          style = { top: rect!.top + 30, left: rect!.left };
      }

      if (isTable) {
          return (
            <div 
                ref={menuRef}
                className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 p-3 z-[70] flex flex-col min-w-[280px] animate-in fade-in zoom-in-95 duration-100 pointer-events-auto"
                style={style}
                onMouseDown={(e) => e.stopPropagation()} 
            >
                {/* 1. Themes */}
                <div className="mb-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Themes</div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => toggleTableClass('theme-modern-blue')} className={`px-2 py-1.5 text-xs border rounded transition-all ${hasClass('theme-modern-blue') ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' : 'hover:bg-gray-50 border-gray-200 text-gray-600'}`}>Modern Blue</button>
                        <button onClick={() => toggleTableClass('theme-dark-header')} className={`px-2 py-1.5 text-xs border rounded transition-all ${hasClass('theme-dark-header') ? 'bg-gray-800 border-gray-900 text-white font-medium' : 'hover:bg-gray-50 border-gray-200 text-gray-600'}`}>Dark Header</button>
                        <button onClick={() => toggleTableClass('theme-minimal')} className={`px-2 py-1.5 text-xs border rounded transition-all ${hasClass('theme-minimal') ? 'bg-gray-50 border-gray-300 text-black font-medium' : 'hover:bg-gray-50 border-gray-200 text-gray-600'}`}>Minimal</button>
                        <button onClick={() => toggleTableClass('theme-gray')} className={`px-2 py-1.5 text-xs border rounded transition-all ${hasClass('theme-gray') ? 'bg-gray-100 border-gray-300 text-gray-800 font-medium' : 'hover:bg-gray-50 border-gray-200 text-gray-600'}`}>Professional</button>
                        <button onClick={() => toggleTableClass('theme-green')} className={`px-2 py-1.5 text-xs border rounded transition-all ${hasClass('theme-green') ? 'bg-green-50 border-green-300 text-green-700 font-medium' : 'hover:bg-gray-50 border-gray-200 text-gray-600'}`}>Success</button>
                        <button onClick={() => toggleTableClass('theme-purple')} className={`px-2 py-1.5 text-xs border rounded transition-all ${hasClass('theme-purple') ? 'bg-purple-50 border-purple-300 text-purple-700 font-medium' : 'hover:bg-gray-50 border-gray-200 text-gray-600'}`}>Elegant</button>
                    </div>
                    
                    <button onClick={() => { 
                             // Reset all themes
                             focusCell(0,0);
                             const classes = (activeTableNode?.getAttribute('class') || '').split(' ').filter(c => !c.startsWith('theme-') && !c.startsWith('is-') && c !== 'no-borders' && c !== 'borders-outer');
                             editor.chain().updateAttributes('table', { class: classes.join(' ') }).run();
                             if(activeTableNode) activeTableNode.setAttribute('class', classes.join(' '));
                        }} className="mt-2 w-full px-2 py-1.5 text-xs border border-gray-200 rounded hover:bg-red-50 hover:text-red-600 text-gray-500 transition-all flex items-center justify-center gap-1">
                             <Eraser size={12} /> Reset to Default
                    </button>
                </div>

                <div className="h-px bg-gray-100 mb-3"></div>

                {/* 2. Toggles */}
                <div className="mb-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Toggles</div>
                    <div className="grid grid-cols-2 gap-2">
                         <button onClick={() => { focusCell(0,0); editor.chain().toggleHeaderRow().run(); }} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${activeTableNode?.querySelector('th') ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                            <Layout size={14} /> Header Row
                         </button>
                         <button onClick={() => { focusCell(0,0); editor.chain().toggleHeaderColumn().run(); }} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${activeTableNode?.querySelector('th[scope="row"]') ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                            <Columns size={14} /> Header Col
                         </button>
                         <button onClick={() => toggleTableClass('is-striped')} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${hasClass('is-striped') ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                            <Rows size={14} /> Striped
                         </button>
                         <button onClick={() => toggleTableClass('is-compact')} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors ${hasClass('is-compact') ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                            <AlignJustify size={14} /> Compact
                         </button>
                    </div>
                </div>

                <div className="h-px bg-gray-100 mb-3"></div>

                {/* 3. Border Style */}
                <div className="mb-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Border Style</div>
                    <div className="relative">
                        <button
                            onClick={() => setIsBorderStyleOpen(!isBorderStyleOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-gray-600" style={{ borderStyle: currentBorderStyle }}></div>
                                <span>{currentBorderStyle.charAt(0).toUpperCase() + currentBorderStyle.slice(1)}</span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isBorderStyleOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isBorderStyleOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 py-1">
                                {[
                                    { label: 'Solid', value: 'solid', icon: <Minus size={14} /> },
                                    { label: 'Dashed', value: 'dashed', icon: <MoreHorizontal size={14} /> },
                                    { label: 'Dotted', value: 'dotted', icon: <GripHorizontal size={14} /> },
                                    { label: 'Double', value: 'double', icon: <Equal size={14} /> },
                                ].map((style) => (
                                    <button
                                        key={style.value}
                                        onClick={() => {
                                            applyBorderToAllCells('borderStyle', style.value);
                                            setIsBorderStyleOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${currentBorderStyle === style.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-gray-600" style={{ borderStyle: style.value }}></div>
                                            {style.label}
                                        </div>
                                        {currentBorderStyle === style.value && <Check size={12} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Border Width */}
                <div className="mb-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Border Width</div>
                    <div className="relative">
                        <button
                            onClick={() => setIsBorderWidthOpen(!isBorderWidthOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-4 bg-gray-600" style={{ height: currentBorderWidth }}></div>
                                <span>{currentBorderWidth}</span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isBorderWidthOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isBorderWidthOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 py-1">
                                {[
                                    { label: 'Thin', value: '1px' },
                                    { label: 'Medium', value: '2px' },
                                    { label: 'Thick', value: '3px' },
                                    { label: 'Extra Thick', value: '4px' },
                                ].map((width) => (
                                    <button
                                        key={width.value}
                                        onClick={() => {
                                            applyBorderToAllCells('borderWidth', width.value);
                                            setIsBorderWidthOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${currentBorderWidth === width.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 bg-gray-600" style={{ height: width.value }}></div>
                                            {width.label} ({width.value})
                                        </div>
                                        {currentBorderWidth === width.value && <Check size={12} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. Border Color */}
                <div className="mb-3">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Border Color</div>
                    <div className="relative">
                        <button
                            onClick={() => setIsBorderColorOpen(!isBorderColorOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2" style={{ borderColor: currentBorderColor || '#d1d5db' }}></div>
                                <span>{currentBorderColor ? 'Custom' : 'Default'}</span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isBorderColorOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isBorderColorOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 p-2">
                                <ColorPalette 
                                    selectedColor={currentBorderColor}
                                    onSelect={(color) => {
                                        applyBorderToAllCells('borderColor', color);
                                        setIsBorderColorOpen(false);
                                    }}
                                />
                                <div className="mt-2 pt-2 border-t border-gray-100">
                                    <button 
                                        onClick={() => {
                                            applyBorderToAllCells('borderColor', null);
                                            setIsBorderColorOpen(false);
                                        }}
                                        className="w-full text-center text-xs text-gray-500 hover:text-red-500 hover:bg-gray-50 py-1 rounded transition-colors"
                                    >
                                        Reset Border Color
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 6. Border Visibility (Old) */}
                <div className="mb-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Border Visibility</div>
                    <div className="grid grid-cols-3 gap-1">
                        <button onClick={() => toggleTableClass('default')} className={`flex flex-col items-center justify-center p-1.5 rounded border ${!hasClass('no-borders') && !hasClass('borders-outer') ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-transparent hover:bg-gray-50'}`} title="Grid">
                            <Grid3X3 size={16} />
                        </button>
                        <button onClick={() => toggleTableClass('borders-outer')} className={`flex flex-col items-center justify-center p-1.5 rounded border ${hasClass('borders-outer') ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-transparent hover:bg-gray-50'}`} title="Outer Only">
                            <Square size={16} />
                        </button>
                        <button onClick={() => toggleTableClass('no-borders')} className={`flex flex-col items-center justify-center p-1.5 rounded border ${hasClass('no-borders') ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-transparent hover:bg-gray-50'}`} title="None">
                            <MinusSquare size={16} />
                        </button>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-2"></div>

                <button 
                    onClick={() => { editor.chain().deleteTable().run(); setActiveMenu(null); }}
                    className="flex items-center justify-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 w-full rounded-lg transition-colors font-medium"
                >
                    <Trash2 size={16} /> Delete Table
                </button>
            </div>
          )
      }

      // Row/Col Menu
      return (
        <div 
            ref={menuRef}
            className="fixed bg-white rounded-lg shadow-xl border border-gray-200 p-1 z-[70] flex flex-col min-w-[140px] animate-in fade-in zoom-in-95 duration-100 pointer-events-auto"
            style={style}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                {isRow ? `Row ${index + 1}` : `Column ${index + 1}`}
            </div>
            
            {isRow && (
                <>
                    <button onClick={() => { focusCell(index, 0); editor.chain().addRowBefore().run(); setActiveMenu(null); }} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full text-left rounded">
                        <ArrowUp size={14} /> Insert Above
                    </button>
                    <button onClick={() => { focusCell(index, 0); editor.chain().addRowAfter().run(); setActiveMenu(null); }} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full text-left rounded">
                        <ArrowDown size={14} /> Insert Below
                    </button>
                </>
            )}
            
            {isCol && (
                <>
                    <button onClick={() => { focusCell(0, index); editor.chain().addColumnBefore().run(); setActiveMenu(null); }} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full text-left rounded">
                        <ArrowLeft size={14} /> Insert Left
                    </button>
                    <button onClick={() => { focusCell(0, index); editor.chain().addColumnAfter().run(); setActiveMenu(null); }} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 w-full text-left rounded">
                        <ArrowRight size={14} /> Insert Right
                    </button>
                </>
            )}
            
            <div className="h-px bg-gray-100 my-1"></div>
            
            <button 
                onClick={() => {
                    if (isRow) { focusCell(index, 0); editor.chain().deleteRow().run(); }
                    if (isCol) { focusCell(0, index); editor.chain().deleteColumn().run(); }
                    setActiveMenu(null);
                }}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 w-full text-left rounded"
            >
                <Trash2 size={14} /> Delete
            </button>
        </div>
      );
  };

  if (!rect || !editor) return null;

  return (
    <>
        {/* Overlay Layer */}
        <div className="fixed inset-0 pointer-events-none z-[60]">
            
            {/* 1. TABLE OPTION BUTTON (Top-Left) */}
            <div 
                className="absolute pointer-events-auto transition-all duration-150"
                style={{ 
                    top: rect.top - 14, 
                    left: rect.left - 14,
                    opacity: (hoveredRow !== null || hoveredCol !== null || activeMenu?.type === 'table' || isHoveringHandle) ? 1 : 0
                }}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // This toggle needs to prevent the menu from immediately closing due to outside click logic
                        // But since it's a button click, we handle state update directly
                        setActiveMenu(activeMenu?.type === 'table' ? null : { type: 'table', index: 0 });
                    }}
                    className={`p-1 bg-white hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded-sm border shadow-sm cursor-pointer transition-colors ${activeMenu?.type === 'table' ? 'border-blue-400 text-blue-600 ring-2 ring-blue-100' : 'border-gray-200'}`}
                    title="Table Properties"
                >
                    <Settings2 size={14} />
                </button>
            </div>

            {/* 2. COLUMN CONTROLS (Top) */}
            {colCoords.map((col) => {
                const isHovered = hoveredCol === col.index;
                const isActive = activeMenu?.type === 'col' && activeMenu.index === col.index;
                const isDropTarget = dropTarget?.type === 'col' && dropTarget.index === col.index;
                
                return (
                    <div key={`col-${col.index}`}>
                        {/* Grip Handle */}
                        <div
                            className={`absolute pointer-events-auto flex justify-center transition-opacity duration-150 ${isHovered || isActive || dragState ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                top: rect.top - 14,
                                left: col.left,
                                width: col.width,
                                height: '14px',
                            }}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, 'col', col.index)}
                            onDragOver={(e) => handleDragOver(e, 'col', col.index)}
                            onDrop={(e) => handleDrop(e, 'col', col.index)}
                        >
                             <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(isActive ? null : { type: 'col', index: col.index });
                                }}
                                className={`
                                    w-10 h-4 rounded-t-sm flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-blue-50 transition-colors
                                    ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}
                                `}
                             >
                                 <GripVertical size={12} />
                             </button>
                        </div>
                        
                        {/* Expanded Drop Target Zone (Invisible) */}
                        <div 
                             className="absolute z-[65] pointer-events-auto"
                             style={{
                                 top: rect.top - 40, 
                                 left: col.left - 20, 
                                 width: '40px',
                                 height: rect.height + 80,
                                 display: dragState?.type === 'col' ? 'block' : 'none'
                             }}
                             onDragOver={(e) => handleDragOver(e, 'col', col.index)}
                             onDrop={(e) => handleDrop(e, 'col', col.index)}
                        />

                        {/* Drop Indicator (Visible Blue Line) */}
                        {isDropTarget && (
                            <div 
                                className="absolute w-[4px] h-full bg-blue-500 z-[70] pointer-events-none rounded-full shadow-sm ring-2 ring-white"
                                style={{
                                    top: rect.top,
                                    left: col.left - 2, // Centered
                                    height: rect.height
                                }}
                            />
                        )}

                        {/* Add Button (On Hover - Right Edge) */}
                        <div
                            className={`absolute pointer-events-auto flex items-center justify-center z-10 transition-opacity duration-150 ${(isHovered) && !dragState ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                top: rect.top - 16,
                                left: col.left + col.width - 8,
                                width: '16px',
                                height: '16px',
                            }}
                        >
                            <button
                                onClick={() => {
                                    focusCell(0, col.index);
                                    editor.chain().addColumnAfter().run();
                                }}
                                className="w-4 h-4 bg-white text-blue-600 border border-blue-200 rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform"
                                title="Add Column"
                            >
                                <Plus size={10} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                );
            })}

            {/* 3. ROW CONTROLS (Left) */}
            {rowCoords.map((row) => {
                const isHovered = hoveredRow === row.index;
                const isActive = activeMenu?.type === 'row' && activeMenu.index === row.index;
                const isDropTarget = dropTarget?.type === 'row' && dropTarget.index === row.index;

                return (
                    <div key={`row-${row.index}`}>
                        {/* Grip Handle */}
                        <div
                            className={`absolute pointer-events-auto flex items-center transition-opacity duration-150 ${isHovered || isActive || dragState ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                top: row.top,
                                left: rect.left - 14,
                                width: '14px',
                                height: row.height,
                            }}
                            draggable="true"
                            onDragStart={(e) => handleDragStart(e, 'row', row.index)}
                            onDragOver={(e) => handleDragOver(e, 'row', row.index)}
                            onDrop={(e) => handleDrop(e, 'row', row.index)}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(isActive ? null : { type: 'row', index: row.index });
                                }}
                                className={`
                                    w-4 h-6 rounded-l-sm flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-blue-50 transition-colors
                                    ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}
                                `}
                             >
                                 <GripVertical size={12} />
                             </button>
                        </div>

                         {/* Expanded Drop Target Zone (Invisible) */}
                         <div 
                             className="absolute z-[65] pointer-events-auto"
                             style={{
                                 top: row.top - 20, // 40px tall trigger zone
                                 left: rect.left - 40,
                                 width: rect.width + 80,
                                 height: '40px',
                                 display: dragState?.type === 'row' ? 'block' : 'none'
                             }}
                             onDragOver={(e) => handleDragOver(e, 'row', row.index)}
                             onDrop={(e) => handleDrop(e, 'row', row.index)}
                        />

                        {/* Drop Indicator */}
                        {isDropTarget && (
                            <div 
                                className="absolute h-[4px] w-full bg-blue-500 z-[70] pointer-events-none rounded-full shadow-sm ring-2 ring-white"
                                style={{
                                    top: row.top - 2, // Centered
                                    left: rect.left,
                                    width: rect.width
                                }}
                            />
                        )}

                        {/* Add Button (On Hover - Bottom Edge) */}
                        <div
                            className={`absolute pointer-events-auto flex items-center justify-center z-10 transition-opacity duration-150 ${(isHovered) && !dragState ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                top: row.top + row.height - 8,
                                left: rect.left - 16,
                                width: '16px',
                                height: '16px'
                            }}
                        >
                            <button
                                onClick={() => {
                                    focusCell(row.index, 0);
                                    editor.chain().addRowAfter().run();
                                }}
                                className="w-4 h-4 bg-white text-blue-600 border border-blue-200 rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-transform"
                                title="Add Row"
                            >
                                <Plus size={10} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                );
            })}
            
            {renderMenu()}
        </div>
    </>
  );
};