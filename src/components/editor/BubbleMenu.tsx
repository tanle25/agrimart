'use client';
import React, { useState, useEffect } from 'react';
import { BubbleMenu as TiptapBubbleMenu, isNodeSelection, Editor } from '@tiptap/react';
import { CellSelection } from '@tiptap/pm/tables';

import { ColorPalette } from './ColorPalette';
import {
    Bold, Italic, Underline, Strikethrough, Code, Link as LinkIcon,
    Trash2, AlignLeft, AlignCenter, AlignRight,
    Type, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, List, ListOrdered, Quote,
    ChevronDown, Check, Unlink,
    Combine, Split, PaintBucket,
    MoreVertical, Subscript, Superscript,
    MessageSquarePlus, Download, Copy, FileCode2,
    Settings2, Captions, Info, CheckCircle2, AlertTriangle, AlertOctagon,
    Minus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    Layout, Shield, Globe, X, Percent, Replace,
    MoreHorizontal, GripHorizontal, Equal, Crop
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                SUB-COMPONENTS                              */
/* -------------------------------------------------------------------------- */

// 1. Divider
const Divider = () => <div className="w-[1px] h-4 bg-gray-200 mx-1 self-center" />;

// Common interface for components with editor
interface EditorComponentProps {
    editor: Editor;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

// 2. Node Selector (Turn Into...)
interface NodeSelectorProps {
    editor: Editor;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}
const NodeSelector = ({ editor, isOpen, setIsOpen }: NodeSelectorProps) => {
    const items = [
        { name: 'Text', icon: Type, command: () => editor.chain().focus().setParagraph().run(), isActive: () => editor.isActive('paragraph') },
        { name: 'Heading 1', icon: Heading1, command: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive('heading', { level: 1 }) },
        { name: 'Heading 2', icon: Heading2, command: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive('heading', { level: 2 }) },
        { name: 'Heading 3', icon: Heading3, command: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.isActive('heading', { level: 3 }) },
        { name: 'Heading 4', icon: Heading4, command: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), isActive: () => editor.isActive('heading', { level: 4 }) },
        { name: 'Heading 5', icon: Heading5, command: () => editor.chain().focus().toggleHeading({ level: 5 }).run(), isActive: () => editor.isActive('heading', { level: 5 }) },
        { name: 'Heading 6', icon: Heading6, command: () => editor.chain().focus().toggleHeading({ level: 6 }).run(), isActive: () => editor.isActive('heading', { level: 6 }) },
        { name: 'Bullet List', icon: List, command: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive('bulletList') },
        { name: 'Numbered List', icon: ListOrdered, command: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive('orderedList') },
        { name: 'Quote', icon: Quote, command: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote') },
        { name: 'Code Block', icon: FileCode2, command: () => editor.chain().focus().toggleCodeBlock().run(), isActive: () => editor.isActive('codeBlock') },
    ];

    const activeItem = items.find(item => item.isActive());

    return (
        <div className="relative">
            <button
                className="flex items-center gap-1 p-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors h-full"
                onClick={() => setIsOpen(!isOpen)}
                title="Change Block Type"
            >
                <span className="whitespace-nowrap max-w-[70px] text-left truncate">
                    {activeItem?.name || 'Text'}
                </span>
                <ChevronDown size={10} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-100 max-h-[300px] overflow-y-auto">
                    <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-white border-b border-gray-50">Turn into</div>
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                item.command();
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-700 ${item.isActive() ? 'bg-blue-50 text-blue-600' : ''}`}
                        >
                            <item.icon size={14} className={item.isActive() ? 'text-blue-500' : 'text-gray-400'} />
                            {item.name}
                            {item.isActive() && <Check size={12} className="ml-auto text-blue-600" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// 3. Font Family Selector
interface FontFamilySelectorProps {
    editor: Editor;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}
const FontFamilySelector = ({ editor, isOpen, setIsOpen }: FontFamilySelectorProps) => {
    const fonts = [
        { name: 'Inter', value: 'Inter' },
        { name: 'Serif', value: 'serif' },
        { name: 'Mono', value: 'monospace' },
        { name: 'Comic', value: 'Comic Sans MS' },
        { name: 'Arial', value: 'Arial' },
    ];

    const currentFont = editor.getAttributes('textStyle').fontFamily || 'Inter';
    const activeFontName = fonts.find(f => f.value === currentFont)?.name || 'Font';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 p-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors h-full min-w-[60px] justify-between"
                title="Font Family"
            >
                <span className="truncate">{activeFontName}</span>
                <ChevronDown size={10} className="text-gray-400 shrink-0" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Font</div>
                    {fonts.map((font) => (
                        <button
                            key={font.value}
                            onClick={() => {
                                editor.chain().focus().setFontFamily(font.value).run();
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center justify-between ${currentFont === font.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                            style={{ fontFamily: font.value }}
                        >
                            {font.name}
                            {currentFont === font.value && <Check size={12} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// 5. Color Selector
const ColorSelector = ({ editor, isOpen, setIsOpen }: EditorComponentProps) => {
    const [tab, setTab] = useState<'text' | 'highlight'>('text');

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 ${isOpen ? 'bg-gray-100' : ''}`}
                title="Text Color"
            >
                <div className="flex flex-col gap-0.5 items-center">
                    <span className="font-serif font-bold text-xs leading-none text-gray-700">A</span>
                    <div className="w-3 h-0.5 bg-gray-800 rounded-full"></div>
                </div>
                <ChevronDown size={10} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-[270px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex bg-gray-100 p-1 rounded-md mb-2">
                        <button
                            onClick={() => setTab('text')}
                            className={`flex-1 py-1 text-xs font-medium rounded-sm transition-all ${tab === 'text' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Text Color
                        </button>
                        <button
                            onClick={() => setTab('highlight')}
                            className={`flex-1 py-1 text-xs font-medium rounded-sm transition-all ${tab === 'highlight' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Highlight
                        </button>
                    </div>

                    <ColorPalette
                        selectedColor={tab === 'text' ? editor.getAttributes('textStyle').color : editor.getAttributes('highlight').color}
                        onSelect={(color) => {
                            if (tab === 'text') {
                                editor.chain().focus().setColor(color).run();
                            } else {
                                editor.chain().focus().toggleHighlight({ color: color }).run();
                            }
                            setIsOpen(false);
                        }}
                    />

                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => {
                                if (tab === 'text') {
                                    editor.chain().focus().unsetColor().run();
                                } else {
                                    editor.chain().focus().unsetHighlight().run();
                                }
                                setIsOpen(false);
                            }}
                            className="w-full text-center text-xs text-gray-500 hover:text-red-500 hover:bg-gray-50 py-1 rounded transition-colors"
                        >
                            Reset to Default
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// 5.2 Table Cell Background Color Selector
const TableCellColorSelector = ({ editor, isOpen, setIsOpen }: EditorComponentProps) => {
    const currentBgColor = editor.getAttributes('tableCell').backgroundColor || null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 ${isOpen ? 'bg-gray-100' : ''}`}
                title="Cell Background Color"
            >
                <div className="relative">
                    <PaintBucket size={16} className="text-gray-600" />
                    {currentBgColor && (
                        <div
                            className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: currentBgColor }}
                        />
                    )}
                </div>
                <ChevronDown size={10} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[270px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Cell Background</div>

                    <ColorPalette
                        selectedColor={currentBgColor}
                        onSelect={(color) => {
                            (editor.chain().focus() as any).setCellBackgroundColor(color).run();
                            setIsOpen(false);
                        }}
                    />

                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => {
                                (editor.chain().focus() as any).setCellBackgroundColor(null).run();
                                setIsOpen(false);
                            }}
                            className="w-full text-center text-xs text-gray-500 hover:text-red-500 hover:bg-gray-50 py-1 rounded transition-colors"
                        >
                            Reset Background
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// 5.3 Table Cell Text Color Selector
const TableCellTextColorSelector = ({ editor, isOpen, setIsOpen }: EditorComponentProps) => {
    const currentTextColor = editor.getAttributes('tableCell').color || null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 ${isOpen ? 'bg-gray-100' : ''}`}
                title="Cell Text Color"
            >
                <div className="relative">
                    <div className="flex flex-col gap-0.5 items-center">
                        <span className="font-serif font-bold text-xs leading-none text-gray-700">A</span>
                        <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: currentTextColor || '#1f2937' }}></div>
                    </div>
                    {currentTextColor && (
                        <div
                            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: currentTextColor }}
                        />
                    )}
                </div>
                <ChevronDown size={10} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[270px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Cell Text Color</div>

                    <ColorPalette
                        selectedColor={currentTextColor}
                        onSelect={(color) => {
                            const { state, dispatch } = editor.view;
                            const { selection } = state;
                            const tr = state.tr;
                            let cellsUpdated = 0;

                            // Check if it's a CellSelection (multiple cells selected)
                            if (selection instanceof CellSelection) {
                                // Apply to all selected cells
                                selection.forEachCell((cell, pos) => {
                                    tr.setNodeMarkup(pos, undefined, {
                                        ...cell.attrs,
                                        color: color,
                                    });
                                    cellsUpdated++;
                                });
                            } else if (!selection.empty) {
                                // Regular selection - find all table cells in range
                                const { from, to } = selection;

                                state.doc.nodesBetween(from, to, (node: any, pos: number) => {
                                    if (node.type.name === 'tableCell') {
                                        tr.setNodeMarkup(pos, undefined, {
                                            ...node.attrs,
                                            color: color,
                                        });
                                        cellsUpdated++;
                                    }
                                });
                            } else {
                                // No selection - apply to current cell
                                const { $anchor } = selection;

                                for (let depth = $anchor.depth; depth > 0; depth--) {
                                    const node = $anchor.node(depth);
                                    if (node.type.name === 'tableCell') {
                                        const cellPos = $anchor.before(depth);
                                        tr.setNodeMarkup(cellPos, undefined, {
                                            ...node.attrs,
                                            color: color,
                                        });
                                        cellsUpdated++;
                                        break;
                                    }
                                }
                            }

                            if (cellsUpdated > 0) {
                                dispatch(tr);
                            }

                            setIsOpen(false);
                        }}
                    />

                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => {
                                const { state, dispatch } = editor.view;
                                const { selection } = state;
                                const tr = state.tr;
                                let cellsUpdated = 0;

                                // Check if it's a CellSelection (multiple cells selected)
                                if (selection instanceof CellSelection) {
                                    selection.forEachCell((cell, pos) => {
                                        const attrs = { ...cell.attrs };
                                        delete attrs.color;
                                        tr.setNodeMarkup(pos, undefined, attrs);
                                        cellsUpdated++;
                                    });
                                } else if (!selection.empty) {
                                    // Regular selection - find all table cells in range
                                    const { from, to } = selection;

                                    state.doc.nodesBetween(from, to, (node: any, pos: number) => {
                                        if (node.type.name === 'tableCell') {
                                            const attrs = { ...node.attrs };
                                            delete attrs.color;
                                            tr.setNodeMarkup(pos, undefined, attrs);
                                            cellsUpdated++;
                                        }
                                    });
                                } else {
                                    // No selection - apply to current cell
                                    const { $anchor } = selection;

                                    for (let depth = $anchor.depth; depth > 0; depth--) {
                                        const node = $anchor.node(depth);
                                        if (node.type.name === 'tableCell') {
                                            const cellPos = $anchor.before(depth);
                                            const attrs = { ...node.attrs };
                                            delete attrs.color;
                                            tr.setNodeMarkup(cellPos, undefined, attrs);
                                            cellsUpdated++;
                                            break;
                                        }
                                    }
                                }

                                if (cellsUpdated > 0) {
                                    dispatch(tr);
                                }

                                setIsOpen(false);
                            }}
                            className="w-full text-center text-xs text-gray-500 hover:text-red-500 hover:bg-gray-50 py-1 rounded transition-colors"
                        >
                            Reset Text Color
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// 5.3 Divider Style Selector
const DividerStyleSelector = ({ editor, isOpen, setIsOpen }: EditorComponentProps) => {
    const styles = [
        { label: 'Solid', value: 'solid', icon: <Minus size={14} /> },
        { label: 'Dashed', value: 'dashed', icon: <MoreHorizontal size={14} /> },
        { label: 'Dotted', value: 'dotted', icon: <GripHorizontal size={14} /> },
        { label: 'Double', value: 'double', icon: <Equal size={14} /> },
        { label: 'Gradient', value: 'gradient', icon: <div className="w-4 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div> },
    ];

    const currentStyle = editor.getAttributes('horizontalRule').lineStyle || 'solid';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 ${isOpen ? 'bg-gray-100' : ''}`}
                title="Divider Style"
            >
                <Settings2 size={16} className="text-gray-600" />
                <ChevronDown size={10} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Line Style</div>
                    {styles.map((style) => (
                        <button
                            key={style.value}
                            onClick={() => {
                                editor.chain().focus().updateAttributes('horizontalRule', { lineStyle: style.value }).run();
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center justify-between ${currentStyle === style.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                {style.icon}
                                {style.label}
                            </div>
                            {currentStyle === style.value && <Check size={12} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// 5.4 Divider Color Selector
const DividerColorSelector = ({ editor, isOpen, setIsOpen }: EditorComponentProps) => {
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 ${isOpen ? 'bg-gray-100' : ''}`}
                title="Divider Color"
            >
                <div className="flex flex-col gap-0.5 items-center">
                    <PaintBucket size={16} className="text-gray-600" />
                    <div className="w-3 h-0.5 bg-gray-800 rounded-full"></div>
                </div>
                <ChevronDown size={10} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[270px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Divider Color</div>

                    <ColorPalette
                        selectedColor={editor.getAttributes('horizontalRule').color}
                        onSelect={(color) => {
                            editor.chain().focus().updateAttributes('horizontalRule', { color }).run();
                            setIsOpen(false);
                        }}
                    />

                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => {
                                editor.chain().focus().updateAttributes('horizontalRule', { color: null }).run();
                                setIsOpen(false);
                            }}
                            className="w-full text-center text-xs text-gray-500 hover:text-red-500 hover:bg-gray-50 py-1 rounded transition-colors"
                        >
                            Reset Color
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// 10. Table Border Style Selector
const TableBorderStyleSelector = ({ editor, isOpen, setIsOpen }: EditorComponentProps) => {
    const styles = [
        { label: 'Solid', value: 'solid', icon: <Minus size={14} /> },
        { label: 'Dashed', value: 'dashed', icon: <MoreHorizontal size={14} /> },
        { label: 'Dotted', value: 'dotted', icon: <GripHorizontal size={14} /> },
        { label: 'Double', value: 'double', icon: <Equal size={14} /> },
    ];

    const currentStyle = editor.getAttributes('tableCell').borderStyle || 'solid';

    const applyToSelectedCells = (style: string) => {
        const { state, dispatch } = editor.view;
        const { selection } = state;
        const tr = state.tr;
        let cellsUpdated = 0;

        if (selection instanceof CellSelection) {
            selection.forEachCell((cell, pos) => {
                tr.setNodeMarkup(pos, undefined, {
                    ...cell.attrs,
                    borderStyle: style,
                });
                cellsUpdated++;
            });
        } else if (!selection.empty) {
            const { from, to } = selection;
            state.doc.nodesBetween(from, to, (node: any, pos: number) => {
                if (node.type.name === 'tableCell') {
                    tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        borderStyle: style,
                    });
                    cellsUpdated++;
                }
            });
        } else {
            const { $anchor } = selection;
            for (let depth = $anchor.depth; depth > 0; depth--) {
                const node = $anchor.node(depth);
                if (node.type.name === 'tableCell') {
                    const cellPos = $anchor.before(depth);
                    tr.setNodeMarkup(cellPos, undefined, {
                        ...node.attrs,
                        borderStyle: style,
                    });
                    cellsUpdated++;
                    break;
                }
            }
        }

        if (cellsUpdated > 0) {
            dispatch(tr);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 ${isOpen ? 'bg-gray-100' : ''}`}
                title="Border Style"
            >
                <div className="w-4 h-4 border-2 border-gray-600" style={{ borderStyle: currentStyle }}></div>
                <ChevronDown size={10} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Border Style</div>
                    {styles.map((style) => (
                        <button
                            key={style.value}
                            onClick={() => applyToSelectedCells(style.value)}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center justify-between ${currentStyle === style.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-gray-600" style={{ borderStyle: style.value }}></div>
                                {style.label}
                            </div>
                            {currentStyle === style.value && <Check size={12} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// 10.1 Table Border Width Selector
const TableBorderWidthSelector = ({ editor, isOpen, setIsOpen }: EditorComponentProps) => {
    const widths = [
        { label: 'Thin', value: '1px' },
        { label: 'Medium', value: '2px' },
        { label: 'Thick', value: '3px' },
        { label: 'Extra Thick', value: '4px' },
    ];

    const currentWidth = editor.getAttributes('tableCell').borderWidth || '1px';

    const applyToSelectedCells = (width: string) => {
        const { state, dispatch } = editor.view;
        const { selection } = state;
        const tr = state.tr;
        let cellsUpdated = 0;

        if (selection instanceof CellSelection) {
            selection.forEachCell((cell, pos) => {
                tr.setNodeMarkup(pos, undefined, {
                    ...cell.attrs,
                    borderWidth: width,
                });
                cellsUpdated++;
            });
        } else if (!selection.empty) {
            const { from, to } = selection;
            state.doc.nodesBetween(from, to, (node: any, pos: number) => {
                if (node.type.name === 'tableCell') {
                    tr.setNodeMarkup(pos, undefined, {
                        ...node.attrs,
                        borderWidth: width,
                    });
                    cellsUpdated++;
                }
            });
        } else {
            const { $anchor } = selection;
            for (let depth = $anchor.depth; depth > 0; depth--) {
                const node = $anchor.node(depth);
                if (node.type.name === 'tableCell') {
                    const cellPos = $anchor.before(depth);
                    tr.setNodeMarkup(cellPos, undefined, {
                        ...node.attrs,
                        borderWidth: width,
                    });
                    cellsUpdated++;
                    break;
                }
            }
        }

        if (cellsUpdated > 0) {
            dispatch(tr);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 ${isOpen ? 'bg-gray-100' : ''}`}
                title="Border Width"
            >
                <div className="w-4 h-0.5 bg-gray-600" style={{ height: currentWidth }}></div>
                <ChevronDown size={10} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Border Width</div>
                    {widths.map((width) => (
                        <button
                            key={width.value}
                            onClick={() => applyToSelectedCells(width.value)}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center justify-between ${currentWidth === width.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-4 bg-gray-600" style={{ height: width.value }}></div>
                                {width.label} ({width.value})
                            </div>
                            {currentWidth === width.value && <Check size={12} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// 10.2 Table Border Color Selector
const TableBorderColorSelector = ({ editor, isOpen, setIsOpen }: EditorComponentProps) => {
    const currentBorderColor = editor.getAttributes('tableCell').borderColor || null;

    const applyToSelectedCells = (color: string | null) => {
        const { state, dispatch } = editor.view;
        const { selection } = state;
        const tr = state.tr;
        let cellsUpdated = 0;

        if (selection instanceof CellSelection) {
            selection.forEachCell((cell, pos) => {
                const attrs = { ...cell.attrs };
                if (color) {
                    attrs.borderColor = color;
                } else {
                    delete attrs.borderColor;
                }
                tr.setNodeMarkup(pos, undefined, attrs);
                cellsUpdated++;
            });
        } else if (!selection.empty) {
            const { from, to } = selection;
            state.doc.nodesBetween(from, to, (node: any, pos: number) => {
                if (node.type.name === 'tableCell') {
                    const attrs = { ...node.attrs };
                    if (color) {
                        attrs.borderColor = color;
                    } else {
                        delete attrs.borderColor;
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
                    if (color) {
                        attrs.borderColor = color;
                    } else {
                        delete attrs.borderColor;
                    }
                    tr.setNodeMarkup(cellPos, undefined, attrs);
                    cellsUpdated++;
                    break;
                }
            }
        }

        if (cellsUpdated > 0) {
            dispatch(tr);
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 ${isOpen ? 'bg-gray-100' : ''}`}
                title="Border Color"
            >
                <div className="w-4 h-4 border-2" style={{ borderColor: currentBorderColor || '#d1d5db' }}></div>
                <ChevronDown size={10} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[270px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Border Color</div>

                    <ColorPalette
                        selectedColor={currentBorderColor}
                        onSelect={(color) => applyToSelectedCells(color)}
                    />

                    <div className="mt-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => applyToSelectedCells(null)}
                            className="w-full text-center text-xs text-gray-500 hover:text-red-500 hover:bg-gray-50 py-1 rounded transition-colors"
                        >
                            Reset Border Color
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 10.3 Table Operations Menu (Clean Dropdown)
const TableOperationsMenu = ({ editor, isOpen, setIsOpen }: EditorComponentProps) => {
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-1.5 hover:bg-gray-100 rounded-md transition-colors flex items-center gap-1 ${isOpen ? 'bg-gray-100' : ''}`}
                title="More Options"
            >
                <MoreVertical size={16} className="text-gray-600" />
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 py-1.5 animate-in fade-in zoom-in-95 duration-100">

                    <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">Insert</div>
                    <div className="py-1">
                        <button onClick={() => { editor.chain().focus().addRowBefore().run(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors">
                            <ArrowUp size={14} className="text-gray-400" /> Row Above
                        </button>
                        <button onClick={() => { editor.chain().focus().addRowAfter().run(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors">
                            <ArrowDown size={14} className="text-gray-400" /> Row Below
                        </button>
                        <button onClick={() => { editor.chain().focus().addColumnBefore().run(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors">
                            <ArrowLeft size={14} className="text-gray-400" /> Column Left
                        </button>
                        <button onClick={() => { editor.chain().focus().addColumnAfter().run(); setIsOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors">
                            <ArrowRight size={14} className="text-gray-400" /> Column Right
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// 7. Notion Style Link Editor
interface LinkEditorProps {
    editor: Editor;
    onBack: () => void;
}
const LinkEditor = ({ editor, onBack }: LinkEditorProps) => {
    // ... (same implementation as before, keeping brevity)
    const currentAttrs = editor.getAttributes('link');
    const [url, setUrl] = useState(currentAttrs.href || '');
    const [openInNewTab, setOpenInNewTab] = useState(currentAttrs.target === '_blank');
    const [relState, setRelState] = useState<'Default' | 'Nofollow' | 'Sponsored'>(() => {
        const r = currentAttrs.rel || '';
        if (r.includes('sponsored')) return 'Sponsored';
        if (r.includes('nofollow')) return 'Nofollow';
        return 'Default';
    });

    const [showSettings, setShowSettings] = useState(false);
    const [isRelOpen, setIsRelOpen] = useState(false);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            onBack();
            return;
        }

        const rels = [];
        if (relState === 'Nofollow') rels.push('nofollow');
        if (relState === 'Sponsored') rels.push('sponsored');
        if (openInNewTab) rels.push('noopener', 'noreferrer');

        const relString = rels.length > 0 ? rels.join(' ') : null;

        editor.chain().focus().extendMarkRange('link').setLink({
            href: url,
            target: openInNewTab ? '_blank' : null,
            rel: relString
        }).run();

        onBack();
    };

    const handleUnlink = () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        onBack();
    };

    const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
        >
            <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-1'}`}
                style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
            />
        </button>
    );

    return (
        <div className="w-[340px] bg-white rounded-xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
            <form onSubmit={handleSubmit} className="flex items-center p-1.5">
                <div className="flex items-center flex-1 gap-2 pl-2 pr-1 h-9 bg-gray-50/50 hover:bg-gray-100/50 rounded-lg transition-colors border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-200">
                    <LinkIcon size={14} className="text-gray-400 shrink-0" />
                    <input
                        autoFocus
                        type="text"
                        placeholder="Paste link..."
                        className="flex-1 min-w-0 text-[13px] leading-none outline-none text-gray-800 placeholder-gray-400 bg-transparent h-full"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Escape') onBack(); }}
                    />
                    {url && (
                        <button type="button" onClick={() => setUrl('')} className="text-gray-400 hover:text-gray-600">
                            <X size={12} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-0.5 ml-1">
                    <button
                        type="button"
                        onClick={() => setShowSettings(!showSettings)}
                        className={`w-8 h-9 rounded-md flex items-center justify-center transition-all ${showSettings ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                        title="Link Options"
                    >
                        <Settings2 size={16} />
                    </button>
                    <button
                        type="submit"
                        className="w-8 h-9 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-all"
                        title="Apply Link"
                    >
                        <Check size={16} />
                    </button>
                </div>
            </form>

            {showSettings && (
                <div className="bg-[#fcfcfc] border-t border-gray-100 px-3 py-3 space-y-3 rounded-b-xl animate-in slide-in-from-top-1 duration-200">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-gray-700">Open in new tab</span>
                            <span className="text-[11px] text-gray-400">Opens the link in a separate tab</span>
                        </div>
                        <Toggle checked={openInNewTab} onChange={setOpenInNewTab} />
                    </div>

                    <div className="relative">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[13px] font-medium text-gray-700">Relationship</span>
                            <span className="text-[11px] text-gray-400">SEO Attribute</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsRelOpen(!isRelOpen)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md shadow-sm hover:border-gray-300 transition-all text-[13px] text-gray-700"
                        >
                            <span className="flex items-center gap-2">
                                {relState === 'Default' && <Globe size={13} className="text-gray-400" />}
                                {relState === 'Nofollow' && <Shield size={13} className="text-orange-500" />}
                                {relState === 'Sponsored' && <Check size={13} className="text-green-500" />}
                                {relState}
                            </span>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isRelOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isRelOpen && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                {['Default', 'Nofollow', 'Sponsored'].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => { setRelState(opt as any); setIsRelOpen(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] hover:bg-gray-50 text-left text-gray-700"
                                    >
                                        {opt === relState && <Check size={12} className="text-blue-600" />}
                                        <span className={opt === relState ? "font-medium text-blue-700 ml-0" : "ml-5"}>{opt}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={handleUnlink}
                            className="text-[12px] font-medium text-red-500 hover:text-red-600 flex items-center gap-1 px-1.5 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                            <Unlink size={12} />
                            Remove link
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// 8. Image Size Selector
const ImageSizeSelector = ({ editor, isOpen, setIsOpen }: EditorComponentProps) => {
    const sizes = [
        { label: '25%', value: '25%' },
        { label: '50%', value: '50%' },
        { label: '75%', value: '75%' },
        { label: '100%', value: '100%' },
    ];

    const currentWidth = editor.getAttributes('image').width || '100%';

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-600 flex items-center gap-1"
                title="Image Size"
            >
                <Percent size={16} />
                <ChevronDown size={10} className="text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Width</div>
                    {sizes.map((size) => (
                        <button
                            key={size.value}
                            onClick={() => {
                                editor.chain().focus().updateAttributes('image', { width: size.value }).run();
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 flex items-center justify-between ${currentWidth === size.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                        >
                            {size.label}
                            {currentWidth === size.value && <Check size={12} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// 9. Image SEO / Settings Editor
interface ImageSeoEditorProps {
    editor: Editor;
    onBack: () => void;
}
const ImageSeoEditor = ({ editor, onBack }: ImageSeoEditorProps) => {
    const [altText, setAltText] = useState(editor.getAttributes('image').alt || '');
    const [titleText, setTitleText] = useState(editor.getAttributes('image').title || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        editor.chain().focus().updateAttributes('image', {
            alt: altText,
            title: titleText
        }).run();
        onBack();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 min-w-[280px]">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Image Options (SEO)</div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-xs text-gray-600 font-medium">Alt Text</label>
                    <input
                        autoFocus
                        type="text"
                        placeholder="Description for SEO & Screen readers"
                        className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs text-gray-600 font-medium">Title (Tooltip)</label>
                    <input
                        type="text"
                        placeholder="Text shown on hover"
                        className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
                        value={titleText}
                        onChange={(e) => setTitleText(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-gray-100">
                <button type="button" onClick={onBack} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm">Save</button>
            </div>
        </form>
    );
};


/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

interface BubbleMenuProps {
    editor: any;
    onOpenDialog: (type: 'image' | 'video' | 'audio') => void;
    onOpenImageEditor: (imageSrc: string) => void;
}

export const BubbleMenu: React.FC<BubbleMenuProps> = ({ editor, onOpenDialog, onOpenImageEditor }) => {
    const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
    const [isFontFamilyOpen, setIsFontFamilyOpen] = useState(false);
    const [isColorSelectorOpen, setIsColorSelectorOpen] = useState(false);
    const [isImageSizeOpen, setIsImageSizeOpen] = useState(false);
    const [isTableCellColorOpen, setIsTableCellColorOpen] = useState(false);
    const [isTableCellTextColorOpen, setIsTableCellTextColorOpen] = useState(false);
    const [isTableOperationsOpen, setIsTableOperationsOpen] = useState(false);

    // Divider States
    const [isDividerStyleOpen, setIsDividerStyleOpen] = useState(false);
    const [isDividerColorOpen, setIsDividerColorOpen] = useState(false);

    // Modes for specialized sub-menus
    const [mode, setMode] = useState<'default' | 'link' | 'image-seo'>('default');

    useEffect(() => {
        if (editor && !editor.isActive('link')) {
            if (mode === 'link') setMode('default');
        }
    }, [editor?.isActive('link')]);

    const closeAllDropdowns = () => {
        setIsNodeSelectorOpen(false);
        setIsFontFamilyOpen(false);
        setIsColorSelectorOpen(false);
        setIsImageSizeOpen(false);
        setIsTableCellColorOpen(false);
        setIsTableCellTextColorOpen(false);
        setIsTableOperationsOpen(false);
        setIsDividerStyleOpen(false);
        setIsDividerColorOpen(false);
    };

    if (!editor) return null;

    /* --- Context Checks --- */
    const isImage = editor.isActive('image') || editor.isActive('youtube');
    const isTable = editor.isActive('table');
    const isAlert = editor.isActive('alert');
    const isDivider = editor.isActive('horizontalRule');

    // Custom logic to determine when to show the menu
    const shouldShow = ({ editor, view, state, from, to }: any) => {
        // DO NOT SHOW IF NOT EDITABLE
        if (!editor.isEditable) return false;

        const { selection } = state;
        const { empty } = selection;

        // Always show for node selections (images, tables, horizontal rules, etc.)
        if (isNodeSelection(selection)) {
            return true;
        }

        // Show for specific node types even if selection is empty
        if (editor.isActive('image') || editor.isActive('youtube') || editor.isActive('table') || editor.isActive('alert') || editor.isActive('horizontalRule')) {
            return true;
        }

        // For horizontal rule specifically, check if cursor is near it
        if (empty) {
            const { $from } = selection;
            const nodeBefore = $from.nodeBefore;
            const nodeAfter = $from.nodeAfter;

            // Check if adjacent nodes are horizontal rules
            if (nodeBefore?.type.name === 'horizontalRule' || nodeAfter?.type.name === 'horizontalRule') {
                return true;
            }

            // Check if current node is horizontal rule
            const currentNode = $from.parent;
            if (currentNode.type.name === 'horizontalRule') {
                return true;
            }

            // Check if there's a horizontal rule in the document near the cursor
            const { doc } = state;
            const pos = $from.pos;
            let foundHR = false;

            // Check nodes before and after cursor position
            const start = Math.max(0, pos - 50);
            const end = Math.min(doc.content.size, pos + 50);

            doc.nodesBetween(start, end, (node: any, nodePos: number) => {
                if (node.type.name === 'horizontalRule') {
                    // Check if this HR is close to cursor (within 5 positions)
                    if (Math.abs(nodePos - pos) <= 5) {
                        foundHR = true;
                        return false; // Stop traversal
                    }
                }
            });

            if (foundHR) {
                return true;
            }

            return false;
        }

        return true;
    };

    /* --- Helper: Insert Caption --- */
    const insertCaption = () => {
        // Check if current selection is image
        if (editor.isActive('image')) {
            const currentCaption = editor.getAttributes('image').caption;
            if (!currentCaption) {
                editor.chain().focus().updateAttributes('image', { caption: 'Image Caption' }).run();
            }
        }
    }

    /* --- Renders --- */

    const renderAlertMenu = () => {
        const currentType = editor.getAttributes('alert').type || 'info';
        const setType = (type: string) => editor.chain().focus().updateAttributes('alert', { type }).run();

        return (
            <div className="flex items-center gap-1 p-1">
                <button onClick={() => setType('info')} className={`p-1.5 rounded hover:bg-gray-100 ${currentType === 'info' ? 'bg-blue-50 text-blue-600' : 'text-gray-500'}`} title="Info"><Info size={16} /></button>
                <button onClick={() => setType('success')} className={`p-1.5 rounded hover:bg-gray-100 ${currentType === 'success' ? 'bg-green-50 text-green-600' : 'text-gray-500'}`} title="Success"><CheckCircle2 size={16} /></button>
                <button onClick={() => setType('warning')} className={`p-1.5 rounded hover:bg-gray-100 ${currentType === 'warning' ? 'bg-amber-50 text-amber-600' : 'text-gray-500'}`} title="Warning"><AlertTriangle size={16} /></button>
                <button onClick={() => setType('danger')} className={`p-1.5 rounded hover:bg-gray-100 ${currentType === 'danger' ? 'bg-red-50 text-red-600' : 'text-gray-500'}`} title="Danger"><AlertOctagon size={16} /></button>
                <Divider />
                <button onClick={() => editor.chain().focus().lift('alert').run()} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Remove Alert Block"><Trash2 size={16} /></button>
            </div>
        )
    };

    const renderDividerMenu = () => {
        return (
            <div className="flex items-center gap-1 p-1">
                <div className="text-xs text-gray-500 px-2 font-medium">Divider</div>
                <Divider />
                <DividerStyleSelector editor={editor} isOpen={isDividerStyleOpen} setIsOpen={(val) => { closeAllDropdowns(); setIsDividerStyleOpen(val); }} />
                <DividerColorSelector editor={editor} isOpen={isDividerColorOpen} setIsOpen={(val) => { closeAllDropdowns(); setIsDividerColorOpen(val); }} />
                <Divider />
                <button onClick={() => editor.chain().focus().deleteSelection().run()} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete Divider"><Trash2 size={16} /></button>
            </div>
        )
    }

    const renderImageMenu = () => {
        const imageSrc = editor.getAttributes('image').src;

        return (
            <div className="flex items-center gap-1 p-1">
                <div className="flex items-center gap-1 px-1">
                    <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Align Left"><AlignLeft size={16} /></button>
                    <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Align Center"><AlignCenter size={16} /></button>
                    <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1.5 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`} title="Align Right"><AlignRight size={16} /></button>
                </div>
                <Divider />
                {onOpenImageEditor && imageSrc && (
                    <>
                        <button
                            onClick={() => onOpenImageEditor(imageSrc)}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                            title="Chỉnh sửa ảnh"
                        >
                            <Crop size={16} />
                        </button>
                        <Divider />
                    </>
                )}
                <button onClick={() => onOpenDialog('image')} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Replace Image"><Replace size={16} /></button>
                <ImageSizeSelector editor={editor} isOpen={isImageSizeOpen} setIsOpen={(val) => { closeAllDropdowns(); setIsImageSizeOpen(val); }} />
                <button onClick={() => setMode('image-seo')} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Settings & SEO"><Settings2 size={16} /></button>
                <button onClick={insertCaption} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Add Caption"><Captions size={16} /></button>
                <Divider />
                <button onClick={() => editor.chain().focus().deleteSelection().run()} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete Image"><Trash2 size={16} /></button>
            </div>
        );
    };

    const renderTableMenu = () => (
        <div className="flex items-center gap-1 p-1">
            {/* 1. Cell Operations (Frequent) */}
            <div className="px-1 flex items-center gap-1">
                <button onClick={() => editor.chain().focus().mergeCells().run()} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30" title="Merge Cells" disabled={!editor.can().mergeCells()}><Combine size={16} /></button>
                <button onClick={() => editor.chain().focus().splitCell().run()} className="p-1.5 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-30" title="Split Cell" disabled={!editor.can().splitCell()}><Split size={16} /></button>
                <TableCellColorSelector editor={editor} isOpen={isTableCellColorOpen} setIsOpen={(val) => { closeAllDropdowns(); setIsTableCellColorOpen(val); }} />
                <TableCellTextColorSelector editor={editor} isOpen={isTableCellTextColorOpen} setIsOpen={(val) => { closeAllDropdowns(); setIsTableCellTextColorOpen(val); }} />
            </div>

            <Divider />

            {/* 3. Visual Toggles */}
            <button onClick={() => editor.chain().focus().toggleHeaderCell().run()} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Toggle Header"><Heading1 size={16} /></button>
            <button onClick={() => editor.chain().focus().toggleHeaderRow().run()} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Toggle Header Row"><Layout size={16} /></button>

            <Divider />

            {/* 3. Structure Operations (Add/Delete/Move) */}
            <TableOperationsMenu
                editor={editor}
                isOpen={isTableOperationsOpen}
                setIsOpen={(val) => { closeAllDropdowns(); setIsTableOperationsOpen(val); }}
            />
        </div>
    );

    const renderTextMenu = () => (
        <div className="flex items-center gap-0.5 p-1">
            <NodeSelector editor={editor} isOpen={isNodeSelectorOpen} setIsOpen={(val) => { closeAllDropdowns(); setIsNodeSelectorOpen(val); }} />
            <Divider />
            <FontFamilySelector editor={editor} isOpen={isFontFamilyOpen} setIsOpen={(val) => { closeAllDropdowns(); setIsFontFamilyOpen(val); }} />

            <Divider />

            <div className="flex items-center gap-0.5">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-1.5 rounded hover:bg-gray-100 transition ${editor.isActive('bold') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`} title="Bold"><Bold size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-1.5 rounded hover:bg-gray-100 transition ${editor.isActive('italic') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`} title="Italic"><Italic size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-1.5 rounded hover:bg-gray-100 transition ${editor.isActive('underline') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`} title="Underline"><Underline size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-1.5 rounded hover:bg-gray-100 transition ${editor.isActive('strike') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`} title="Strike"><Strikethrough size={16} /></button>
                <button onClick={() => editor.chain().focus().toggleCode().run()} className={`p-1.5 rounded hover:bg-gray-100 transition ${editor.isActive('code') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`} title="Code"><Code size={16} /></button>
            </div>

            <Divider />

            <ColorSelector editor={editor} isOpen={isColorSelectorOpen} setIsOpen={(val) => { closeAllDropdowns(); setIsColorSelectorOpen(val); }} />
            <button onClick={() => setMode('link')} className={`p-1.5 rounded hover:bg-gray-100 transition ${editor.isActive('link') ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`} title="Link"><LinkIcon size={16} /></button>
        </div>
    );

    const isDefaultMode = mode === 'default';

    return (
        <TiptapBubbleMenu
            editor={editor}
            tippyOptions={{
                duration: 150,
                animation: 'shift-away',
                placement: (isImage || isAlert || isDivider) ? 'top' : 'top-start',
                maxWidth: 600,
                zIndex: 99,
                interactive: true,
            }}
            shouldShow={shouldShow}
            className={
                isDefaultMode
                    ? "bg-white rounded-lg shadow-xl border border-gray-200 flex items-center overflow-visible p-0.5"
                    : "flex items-center overflow-visible"
            }
        >
            {mode === 'link' ? (
                <LinkEditor editor={editor} onBack={() => setMode('default')} />
            ) : mode === 'image-seo' ? (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                    <ImageSeoEditor editor={editor} onBack={() => setMode('default')} />
                </div>
            ) : (
                <>
                    {isAlert && renderAlertMenu()}
                    {isDivider && renderDividerMenu()}
                    {isImage && !isAlert && renderImageMenu()}
                    {isTable && !isImage && !isAlert && !isDivider && renderTableMenu()}
                    {!isImage && !isTable && !isAlert && !isDivider && renderTextMenu()}
                </>
            )}
        </TiptapBubbleMenu>
    );
};