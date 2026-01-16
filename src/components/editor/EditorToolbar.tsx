'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
    Bold, Italic, Underline, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Type,
    Link as LinkIcon, Image as ImageIcon, Table as TableIcon,
    ChevronDown, Code, Quote,
    Baseline, Highlighter, Indent, Outdent,
    Eraser, Video, Superscript, Subscript,
    Undo, Redo, Check, Minus,
    ListTodo, ArrowUpDown, Smile, Sigma, Calendar,
    TerminalSquare, Pilcrow,
    FileCode2, Replace, MessageSquarePlus, Unlink,
    ArrowDownToLine, ArrowRightToLine, Trash2,
    CaseUpper, CaseLower, AlertCircle, Layers, Music,
    Calculator, MapPin, Mic, Download,
    X, ExternalLink,
    Info, CheckCircle2, AlertTriangle, AlertOctagon,
    Grid3X3, Film, Monitor, UploadCloud, Loader2,
    FileAudio, FileVideo, FileImage, ArrowLeft, MoreHorizontal, Laptop, Cloud,
    FunctionSquare, EyeOff, LayoutGrid, FileCode, LayoutTemplate,
    GripHorizontal, Equal, Bookmark, StickyNote, Clock, Keyboard, History,
    Globe, TrendingUp, Code2
} from 'lucide-react';
import { EditorProps } from './types';
import ColorPicker from './ColorPicker';
import { EmojiPicker, CalculatorPopup, MathDialog, FindReplaceDialog, DownloadDialog } from './EditorTools';
import { ToolbarButton } from '../ui/ToolbarButton';

// Define BlockTypes locally
const BlockType = {
    PARAGRAPH: 'paragraph',
    HEADING_1: 'heading-1',
    HEADING_2: 'heading-2',
    HEADING_3: 'heading-3',
    QUOTE: 'blockquote',
    CODE_BLOCK: 'code-block',
};

const TOOLBAR_FONTS = [
    { label: 'Mặc định (Inter)', value: 'Inter' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'monospace' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Comic Sans', value: 'Comic Sans MS' },
    { label: 'Cursive', value: 'cursive' }
];

const TOOLBAR_SIZES = [
    { label: '10px', value: '10' },
    { label: '12px', value: '12' },
    { label: '14px', value: '14' },
    { label: '16px', value: '16' },
    { label: '18px', value: '18' },
    { label: '24px', value: '24' },
    { label: '30px', value: '30' },
    { label: '36px', value: '36' },
    { label: '48px', value: '48' },
    { label: '60px', value: '60' },
    { label: '72px', value: '72' },
];

const TOOLBAR_LINE_HEIGHTS = [
    { label: 'Single (1.0)', value: '1.0' },
    { label: '1.15', value: '1.15' },
    { label: '1.5', value: '1.5' },
    { label: 'Double (2.0)', value: '2.0' },
];

const TOOLBAR_TYPES = [
    { label: 'Văn bản thường', value: BlockType.PARAGRAPH, icon: <Type size={14} /> },
    { label: 'Tiêu đề 1', value: BlockType.HEADING_1, icon: <Type size={14} className="font-bold" /> },
    { label: 'Tiêu đề 2', value: BlockType.HEADING_2, icon: <Type size={12} className="font-bold" /> },
    { label: 'Tiêu đề 3', value: BlockType.HEADING_3, icon: <Type size={11} className="font-bold" /> },
    { label: 'Trích dẫn', value: BlockType.QUOTE, icon: <Quote size={14} /> },
    { label: 'Code Block', value: BlockType.CODE_BLOCK, icon: <Code size={14} /> },
];

const TOOLBAR_ALERTS = [
    { label: 'Info (Blue)', value: 'info', icon: <Info size={14} className="text-blue-500" /> },
    { label: 'Success (Green)', value: 'success', icon: <CheckCircle2 size={14} className="text-green-500" /> },
    { label: 'Warning (Amber)', value: 'warning', icon: <AlertTriangle size={14} className="text-amber-500" /> },
    { label: 'Danger (Red)', value: 'danger', icon: <AlertOctagon size={14} className="text-red-500" /> },
];

const TOOLBAR_DIVIDERS = [
    { label: 'Nét liền (Solid)', value: 'solid', icon: <Minus size={14} /> },
    { label: 'Nét đứt (Dashed)', value: 'dashed', icon: <MoreHorizontal size={14} /> },
    { label: 'Nét chấm (Dotted)', value: 'dotted', icon: <GripHorizontal size={14} /> },
    { label: 'Nét đôi (Double)', value: 'double', icon: <Equal size={14} /> },
    { label: 'Gradient', value: 'gradient', icon: <div className="w-4 h-1 bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div> },
];

// --- Internal Helper Components ---

const DropdownButton = ({
    label, tooltip, options, onSelect, width = "w-32", icon, highlightActive, currentValue, active, disabled
}: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={ref} title={tooltip}>
            <button
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-md border border-transparent hover:border-gray-200 transition-all ${width} ${isOpen ? 'bg-gray-100 border-gray-200' : ''} ${active ? 'bg-blue-50 text-blue-600' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className={`flex items-center truncate ${label ? 'gap-2' : 'justify-center w-full'}`}>
                    {icon}
                    {label && <span className="truncate">{label}</span>}
                </div>
                {label && <ChevronDown size={10} className="text-gray-400 ml-1 shrink-0" />}
                {!label && <div className="absolute right-0 bottom-0 text-[8px] text-gray-300">▼</div>}
            </button>

            {isOpen && !disabled && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto min-w-[140px] w-auto">
                    {options.map((opt: any) => (
                        <button
                            key={opt.value}
                            onClick={() => { onSelect(opt.value); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between gap-2 ${highlightActive && currentValue === opt.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'}`}
                            style={{ fontFamily: opt.label.includes('Font') || opt.value.includes('Font') || opt.value.includes(' ') ? opt.value : undefined }}
                        >
                            <span className="flex items-center gap-2">
                                {opt.icon}
                                {opt.label}
                            </span>
                            {highlightActive && currentValue === opt.value && <Check size={12} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const LinkToolbarButton = ({ editor, disabled }: { editor: any, disabled: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [url, setUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState<'_self' | '_blank'>('_self');
    const [rel, setRel] = useState<string>('');
    const ref = useRef<HTMLDivElement>(null);

    // Close when click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Load current link attrs when opening
    const open = () => {
        if (disabled) return;

        const attrs = editor.getAttributes('link');
        const { from, to } = editor.state.selection;
        const selectedText = from === to ? '' : editor.state.doc.textBetween(from, to);
        const currentRel = attrs.rel || '';
        const currentTarget = attrs.target || '_self';

        setUrl(attrs.href || '');
        setLinkText(selectedText || attrs.href || '');
        setTitle(attrs.title || '');
        setTarget(currentTarget === '_blank' ? '_blank' : '_self');
        setRel(currentRel);

        setIsOpen(true);
    };

    const applyLink = () => {
        if (!url.trim()) {
            // Nếu không có URL -> bỏ link
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            setIsOpen(false);
            return;
        }

        const href = url.trim();
        const text = linkText.trim() || href;

        // Build rel attribute: thêm noopener/noreferrer nếu target="_blank", sau đó thêm rel từ dropdown
        const relParts: string[] = [];
        if (target === '_blank') {
            relParts.push('noopener', 'noreferrer');
        }
        if (rel.trim()) {
            // Thêm các giá trị từ dropdown (nofollow, sponsored, ugc...)
            rel.trim().split(' ').forEach(r => {
                if (r && !relParts.includes(r)) {
                    relParts.push(r);
                }
            });
        }
        const finalRel = relParts.length > 0 ? Array.from(new Set(relParts)).join(' ') : undefined;

        if (editor.state.selection.empty) {
            // Không có selection -> chèn mới 1 thẻ a với text
            const attrs: string[] = [`href="${href}"`];
            if (target === '_blank') attrs.push('target="_blank"');
            if (finalRel) attrs.push(`rel="${finalRel}"`);
            if (title.trim()) attrs.push(`title="${title.trim().replace(/"/g, '&quot;')}"`);

            editor
                .chain()
                .focus()
                .insertContent(`<a ${attrs.join(' ')}>${text}</a>`)
                .run();
        } else {
            // Đang chọn text -> setLink với thuộc tính SEO
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({
                    href,
                    target: target === '_blank' ? '_blank' : null,
                    rel: finalRel || null,
                    title: title.trim() || null,
                })
                .run();
        }

        setIsOpen(false);
    };

    const removeLink = () => {
        editor.chain().focus().extendMarkRange('link').unsetLink().run();
        setIsOpen(false);
    };

    const isActive = editor.isActive('link');

    return (
        <div className="relative" ref={ref}>
            <ToolbarButton
                icon={<LinkIcon size={15} />}
                tooltip="Chèn / sửa liên kết"
                active={isActive}
                onClick={open}
                disabled={disabled}
            />

            {isOpen && !disabled && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-3 animate-in fade-in zoom-in-95 duration-100">
                    <div className="absolute -top-1.5 left-6 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 z-0" />
                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                                Liên kết & SEO
                            </span>
                            {isActive && (
                                <button
                                    type="button"
                                    onClick={removeLink}
                                    className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-600"
                                >
                                    <Unlink size={13} />
                                    Gỡ link
                                </button>
                            )}
                        </div>

                        {/* URL */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-gray-500">URL</label>
                            <div className="relative">
                                <span className="absolute left-2 top-2 text-gray-400">
                                    <ExternalLink size={13} />
                                </span>
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/..."
                                    className="w-full pl-7 pr-2 py-1.5 rounded-md border border-gray-200 text-xs text-gray-800 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>

                        {/* Anchor text */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-gray-500">
                                Anchor text (văn bản hiển thị)
                            </label>
                            <input
                                type="text"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                placeholder="Nếu bỏ trống sẽ dùng URL"
                                className="w-full px-2 py-1.5 rounded-md border border-gray-200 text-xs text-gray-800 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            />
                        </div>

                        {/* SEO options */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-medium text-gray-500">Thuộc tính SEO</label>
                            <div className="grid grid-cols-2 gap-2">
                                {/* Target dropdown */}
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500">Mở link ở đâu</label>
                                    <DropdownButton
                                        label={target === '_blank' ? 'Tab mới' : 'Cùng tab'}
                                        tooltip="Mở link ở đâu"
                                        options={[
                                            { label: 'Cùng tab', value: '_self' },
                                            { label: 'Tab mới', value: '_blank' },
                                        ]}
                                        onSelect={(val: string) => setTarget(val as '_self' | '_blank')}
                                        width="w-full"
                                        highlightActive
                                        currentValue={target}
                                    />
                                </div>

                                {/* Rel dropdown */}
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-500">Thuộc tính rel</label>
                                    <DropdownButton
                                        label={rel || 'Không có'}
                                        tooltip="Thuộc tính rel"
                                        options={[
                                            { label: 'Không có', value: '' },
                                            { label: 'nofollow', value: 'nofollow' },
                                            { label: 'sponsored', value: 'sponsored' },
                                            { label: 'ugc', value: 'ugc' },
                                            { label: 'nofollow sponsored', value: 'nofollow sponsored' },
                                            { label: 'nofollow ugc', value: 'nofollow ugc' },
                                            { label: 'sponsored ugc', value: 'sponsored ugc' },
                                            { label: 'nofollow sponsored ugc', value: 'nofollow sponsored ugc' },
                                        ]}
                                        onSelect={(val: string) => setRel(val)}
                                        width="w-full"
                                        highlightActive
                                        currentValue={rel}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Title attribute */}
                        <div className="space-y-1">
                            <label className="text-[11px] font-medium text-gray-500">
                                Title (tooltip / mô tả link)
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ví dụ: Tải ebook SEO miễn phí"
                                className="w-full px-2 py-1.5 rounded-md border border-gray-200 text-xs text-gray-800 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100 rounded-md"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={applyLink}
                                className="px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm"
                            >
                                Lưu liên kết
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TableSelector = ({ editor, disabled }: { editor: any, disabled: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [hoveredRow, setHoveredRow] = useState(0);
    const [hoveredCol, setHoveredCol] = useState(0);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const insertTable = (rows: number, cols: number) => {
        editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={ref}>
            <ToolbarButton
                icon={<TableIcon size={15} />}
                tooltip="Chèn bảng"
                active={isOpen || editor.isActive('table')}
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
            />
            {isOpen && !disabled && (
                <div className="absolute top-full left-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-xs font-semibold text-gray-500 mb-2">Insert Table {hoveredRow + 1}x{hoveredCol + 1}</div>
                    <div className="grid grid-cols-10 gap-1" onMouseLeave={() => { setHoveredRow(0); setHoveredCol(0); }}>
                        {[...Array(10)].map((_, r) => (
                            [...Array(10)].map((_, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    className={`w-4 h-4 border rounded-sm cursor-pointer ${r <= hoveredRow && c <= hoveredCol ? 'bg-blue-500 border-blue-600' : 'bg-gray-50 border-gray-200'}`}
                                    onMouseEnter={() => { setHoveredRow(r); setHoveredCol(c); }}
                                    onClick={() => insertTable(r + 1, c + 1)}
                                />
                            ))
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

interface EditorToolbarProps {
    editor: any;
    onOpenDialog: (type: 'image' | 'video' | 'audio') => void;
    onOpenMap: () => void;
    onOpenHelp: () => void;
    onOpenTemplates: () => void;
    onOpenBookmark?: () => void;
    onOpenFootnote?: () => void;
    onOpenHistory?: () => void;
    onOpenShortcuts?: () => void;
    onOpenVersionHistory?: () => void;
    onOpenEmbed?: () => void;
    isSourceMode: boolean;
    onToggleSourceMode: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    editor, onOpenDialog, onOpenMap, onOpenHelp, onOpenTemplates,
    onOpenBookmark, onOpenFootnote,
    onOpenHistory, onOpenShortcuts, onOpenVersionHistory,
    onOpenEmbed,
    isSourceMode, onToggleSourceMode
}) => {
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // State for popover tools
    const [activeTool, setActiveTool] = useState<'emoji' | 'calc' | 'math' | 'findReplace' | 'download' | null>(null);
    const [isEditable, setIsEditable] = useState(true);

    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync internal state with editor state if needed
    useEffect(() => {
        if (editor) {
            setIsEditable(editor.isEditable);
        }
    }, [editor?.isEditable]);

    if (!editor) return null;

    const showToast = (message: string) => {
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        setToastMessage(message);
        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage(null);
        }, 2000);
    };

    const getActiveBlockType = () => {
        if (editor.isActive('heading', { level: 1 })) return BlockType.HEADING_1;
        if (editor.isActive('heading', { level: 2 })) return BlockType.HEADING_2;
        if (editor.isActive('heading', { level: 3 })) return BlockType.HEADING_3;
        if (editor.isActive('blockquote')) return BlockType.QUOTE;
        if (editor.isActive('codeBlock')) return BlockType.CODE_BLOCK;
        return BlockType.PARAGRAPH;
    };

    const getActiveFont = () => editor.getAttributes('textStyle').fontFamily || 'Inter';
    const getActiveSize = () => editor.getAttributes('textStyle').fontSize || '16';

    const getActiveLineHeight = () => {
        return editor.getAttributes('paragraph').lineHeight ||
            editor.getAttributes('heading').lineHeight ||
            '1.6';
    };

    const toggleEditable = (state?: boolean) => {
        const newState = state !== undefined ? state : !isEditable;
        editor.setEditable(newState);
        setIsEditable(newState);
        showToast(newState ? "Editor Unlocked" : "Read-Only Mode Enabled");
    };

    const onAction = (action: string, value?: any) => {
        if (isSourceMode && action !== 'read-mode' && action !== 'lock' && action !== 'help' && action !== 'print' && action !== 'download') {
            // Disable most actions in source mode
            return;
        }

        switch (action) {
            // History & System
            case 'undo': editor.chain().focus().undo().run(); break;
            case 'redo': editor.chain().focus().redo().run(); break;
            case 'print': window.print(); break;
            case 'select-all': editor.chain().focus().selectAll().run(); break;

            // Clipboard operations
            case 'cut':
                const selCut = editor.state.selection;
                const textCut = editor.state.doc.textBetween(selCut.from, selCut.to);
                if (textCut) {
                    navigator.clipboard.writeText(textCut).then(() => {
                        editor.chain().focus().deleteSelection().run();
                        showToast("Đã cắt vào bộ nhớ tạm");
                    }).catch(err => console.error("Cut failed:", err));
                }
                break;

            case 'copy':
                const selCopy = editor.state.selection;
                const textCopy = editor.state.doc.textBetween(selCopy.from, selCopy.to);
                if (textCopy) {
                    navigator.clipboard.writeText(textCopy)
                        .then(() => showToast("Đã sao chép"))
                        .catch(err => console.error("Copy failed:", err));
                }
                break;

            case 'paste':
                navigator.clipboard.readText()
                    .then(text => {
                        if (text) {
                            editor.chain().focus().insertContent(text).run();
                        }
                    })
                    .catch(err => {
                        alert('Trình duyệt chặn truy cập bộ nhớ đệm. Vui lòng sử dụng phím tắt Ctrl+V.');
                        console.error("Paste failed:", err);
                    });
                break;

            case 'format-painter': alert('Tính năng Format Painter'); break;

            // Typography
            case 'font-family': editor.chain().focus().setFontFamily(value).run(); break;
            case 'font-size': (editor.chain().focus() as any).setFontSize(value).run(); break;
            case 'block-type':
                if (value === BlockType.PARAGRAPH) editor.chain().focus().setParagraph().run();
                if (value === BlockType.HEADING_1) editor.chain().focus().toggleHeading({ level: 1 }).run();
                if (value === BlockType.HEADING_2) editor.chain().focus().toggleHeading({ level: 2 }).run();
                if (value === BlockType.HEADING_3) editor.chain().focus().toggleHeading({ level: 3 }).run();
                if (value === BlockType.QUOTE) editor.chain().focus().toggleBlockquote().run();
                if (value === BlockType.CODE_BLOCK) editor.chain().focus().toggleCodeBlock().run();
                break;
            case 'line-height':
                (editor.chain().focus() as any).setLineHeight(value).run();
                break;

            // Formatting
            case 'bold': editor.chain().focus().toggleBold().run(); break;
            case 'italic': editor.chain().focus().toggleItalic().run(); break;
            case 'underline': editor.chain().focus().toggleUnderline().run(); break;
            case 'strikethrough': editor.chain().focus().toggleStrike().run(); break;
            case 'superscript': editor.chain().focus().toggleSuperscript().run(); break;
            case 'subscript': editor.chain().focus().toggleSubscript().run(); break;
            case 'code': editor.chain().focus().toggleCode().run(); break;
            case 'remove-format': editor.chain().focus().unsetAllMarks().run(); break;
            case 'hard-break': editor.chain().focus().setHardBreak().run(); break;

            // Casing
            case 'uppercase':
                editor.chain().focus().command(({ tr, state, dispatch }: any) => {
                    const { from, to } = state.selection;
                    if (from === to) return false;
                    state.doc.nodesBetween(from, to, (node: any, pos: number) => {
                        if (node.isText) {
                            const slicedFrom = Math.max(from, pos);
                            const slicedTo = Math.min(to, pos + node.nodeSize);
                            const content = node.text?.slice(slicedFrom - pos, slicedTo - pos);
                            if (content && dispatch) {
                                tr.insertText(content.toUpperCase(), slicedFrom, slicedTo);
                            }
                        }
                    });
                    return true;
                }).run();
                break;

            case 'lowercase':
                editor.chain().focus().command(({ tr, state, dispatch }: any) => {
                    const { from, to } = state.selection;
                    if (from === to) return false;
                    state.doc.nodesBetween(from, to, (node: any, pos: number) => {
                        if (node.isText) {
                            const slicedFrom = Math.max(from, pos);
                            const slicedTo = Math.min(to, pos + node.nodeSize);
                            const content = node.text?.slice(slicedFrom - pos, slicedTo - pos);
                            if (content && dispatch) {
                                tr.insertText(content.toLowerCase(), slicedFrom, slicedTo);
                            }
                        }
                    });
                    return true;
                }).run();
                break;

            // Colors
            case 'format-color': editor.chain().focus().setColor(value).run(); break;
            case 'format-highlight': editor.chain().focus().toggleHighlight({ color: value }).run(); break;

            // Align
            case 'align-left': editor.chain().focus().setTextAlign('left').run(); break;
            case 'align-center': editor.chain().focus().setTextAlign('center').run(); break;
            case 'align-right': editor.chain().focus().setTextAlign('right').run(); break;
            case 'align-justify': editor.chain().focus().setTextAlign('justify').run(); break;

            // Lists
            case 'insert-unordered-list': editor.chain().focus().toggleBulletList().run(); break;
            case 'insert-ordered-list': editor.chain().focus().toggleOrderedList().run(); break;
            case 'insert-task-list': editor.chain().focus().toggleTaskList().run(); break;
            case 'outdent': editor.chain().focus().liftListItem('listItem').run(); break;
            case 'indent': editor.chain().focus().sinkListItem('listItem').run(); break;

            // Inserts
            case 'set-link':
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                if (url === null) return;
                if (url === '') {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    return;
                }
                if (editor.state.selection.empty) {
                    editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
                } else {
                    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
                }
                break;
            case 'insert-image':
                onOpenDialog('image');
                break;
            case 'insert-video':
                onOpenDialog('video');
                break;
            case 'insert-table': break;
            case 'insert-audio':
                onOpenDialog('audio');
                break;

            // Table Operations
            case 'table-add-row': editor.chain().focus().addRowAfter().run(); break;
            case 'table-add-col': editor.chain().focus().addColumnAfter().run(); break;
            case 'table-delete': editor.chain().focus().deleteTable().run(); break;

            // Advanced Inserts
            case 'insert-emoji':
                setActiveTool(activeTool === 'emoji' ? null : 'emoji');
                break;
            case 'insert-math':
                setActiveTool(activeTool === 'math' ? null : 'math');
                break;
            case 'insert-date':
                const date = new Date().toLocaleDateString('vi-VN');
                editor.chain().focus().insertContent(date).run();
                break;
            case 'insert-map':
                onOpenMap();
                break;
            case 'insert-bookmark':
                // Handled by parent component via onOpenBookmark
                break;
            case 'insert-footnote':
                // Handled by parent component via onOpenFootnote
                break;
            case 'calculator':
                setActiveTool(activeTool === 'calc' ? null : 'calc');
                break;
            case 'mic': alert('Ghi âm'); break;

            // Blocks
            case 'insert-divider':
                (editor.chain().focus() as any).setHorizontalRule({ lineStyle: value || 'solid' }).run();
                break;
            case 'insert-alert':
                const alertType = value || 'info';
                if (editor.isActive('alert')) {
                    editor.chain().focus().updateAttributes('alert', { type: alertType }).run();
                } else {
                    (editor.chain().focus() as any).setAlert({ type: alertType }).run();
                }
                break;
            case 'insert-layers':
                (editor.chain().focus() as any).setDetails().run();
                break;

            // Utilities
            case 'source-code': alert(editor.getHTML()); break;
            case 'find-replace':
                setActiveTool(activeTool === 'findReplace' ? null : 'findReplace');
                break;
            case 'add-comment': alert('Thêm bình luận'); break;
            case 'download':
                setActiveTool(activeTool === 'download' ? null : 'download');
                break;
            case 'share': alert('Chia sẻ tài liệu'); break;
            case 'read-mode':
                toggleEditable();
                break;
            case 'fullscreen':
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                break;
            case 'lock':
                toggleEditable();
                break;
            case 'help':
                onOpenHelp();
                break;
        }
    };

    const getCurrentTypeLabel = () => {
        const match = TOOLBAR_TYPES.find(t => t.value === getActiveBlockType());
        return match ? match.label : 'Văn bản thường';
    };

    const getCurrentFontLabel = () => {
        const match = TOOLBAR_FONTS.find(t => t.value === getActiveFont());
        return match ? match.label : 'Mặc định';
    }

    const getCurrentSizeLabel = () => {
        const match = TOOLBAR_SIZES.find(t => t.value === getActiveSize());
        return match ? match.label : `${getActiveSize()}px`;
    }

    const isTableActive = editor.isActive('table');

    return (
        <>
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-300 py-2 px-3 z-40 shadow-[0_2px_8px_rgba(0,0,0,0.04)] select-none print:hidden">

                {/* Toast Notification */}
                {toastMessage && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-none transition-opacity duration-300">
                        <div className="bg-gray-800/90 text-white px-6 py-3 rounded-lg shadow-2xl backdrop-blur-sm flex items-center gap-3">
                            <Check size={18} className="text-green-400" />
                            <span className="font-medium text-sm">{toastMessage}</span>
                        </div>
                    </div>
                )}

                {/* Global Dialogs */}
                {(activeTool as any) === 'help' && (
                    // Help Dialog handled by parent
                    null
                )}

                {/* Flex Wrap Container */}
                <div className={`flex flex-wrap items-center gap-x-0.5 gap-y-1.5 ${isSourceMode ? 'opacity-70 pointer-events-none grayscale' : ''}`}>

                    {/* 1. History & Clipboard */}
                    <ToolbarButton icon={<Undo size={15} />} tooltip="Hoàn tác (Ctrl+Z)" onClick={() => onAction('undo')} disabled={!editor.can().undo()} />
                    <ToolbarButton icon={<Redo size={15} />} tooltip="Làm lại (Ctrl+Y)" onClick={() => onAction('redo')} disabled={!editor.can().redo()} />
                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>


                    {/* 2. Text Style */}
                    <DropdownButton
                        label={getCurrentFontLabel()}
                        tooltip="Phông chữ"
                        options={TOOLBAR_FONTS}
                        onSelect={(val: any) => onAction('font-family', val)}
                        width="w-32"
                        currentValue={getActiveFont()}
                        highlightActive
                        disabled={isSourceMode}
                    />
                    <DropdownButton
                        label={getCurrentSizeLabel()}
                        tooltip="Cỡ chữ"
                        options={TOOLBAR_SIZES}
                        onSelect={(val: any) => onAction('font-size', val)}
                        width="w-20"
                        currentValue={getActiveSize()}
                        highlightActive
                        disabled={isSourceMode}
                    />
                    <DropdownButton
                        label={getCurrentTypeLabel()}
                        tooltip="Kiểu văn bản"
                        options={TOOLBAR_TYPES}
                        onSelect={(val: any) => onAction('block-type', val)}
                        width="w-36"
                        highlightActive
                        currentValue={getActiveBlockType()}
                        disabled={isSourceMode}
                    />

                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>

                    {/* 3. Basic Formatting */}
                    <ToolbarButton icon={<Bold size={15} />} tooltip="In đậm (Ctrl+B)" active={editor.isActive('bold')} onClick={() => onAction('bold')} />
                    <ToolbarButton icon={<Italic size={15} />} tooltip="In nghiêng (Ctrl+I)" active={editor.isActive('italic')} onClick={() => onAction('italic')} />
                    <ToolbarButton icon={<Underline size={15} />} tooltip="Gạch chân (Ctrl+U)" active={editor.isActive('underline')} onClick={() => onAction('underline')} />
                    <ToolbarButton icon={<Strikethrough size={15} />} tooltip="Gạch ngang" active={editor.isActive('strike')} onClick={() => onAction('strikethrough')} />

                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>

                    {/* 4. Advanced Formatting */}
                    <ToolbarButton icon={<Superscript size={15} />} tooltip="Chỉ số trên" active={editor.isActive('superscript')} onClick={() => onAction('superscript')} />
                    <ToolbarButton icon={<Subscript size={15} />} tooltip="Chỉ số dưới" active={editor.isActive('subscript')} onClick={() => onAction('subscript')} />
                    <ToolbarButton icon={<CaseUpper size={15} />} tooltip="VIẾT HOA" onClick={() => onAction('uppercase')} />
                    <ToolbarButton icon={<CaseLower size={15} />} tooltip="viết thường" onClick={() => onAction('lowercase')} />
                    <ToolbarButton icon={<Code size={15} />} tooltip="Code nội dòng" active={editor.isActive('code')} onClick={() => onAction('code')} />
                    <ToolbarButton icon={<Eraser size={15} />} tooltip="Xóa định dạng" onClick={() => onAction('remove-format')} />

                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>

                    {/* 5. Colors */}
                    {/* We need to manually disable clicks in CSS for custom components or pass disabled prop */}
                    <div className={isSourceMode ? 'pointer-events-none opacity-50' : ''}>
                        <ColorPicker
                            type="text"
                            icon={<Baseline size={15} />}
                            defaultColor="#000000"
                            tooltip="Màu chữ"
                            onSelect={(color) => onAction('format-color', color)}
                        />
                    </div>
                    <div className={isSourceMode ? 'pointer-events-none opacity-50' : ''}>
                        <ColorPicker
                            type="highlight"
                            icon={<Highlighter size={15} />}
                            defaultColor="#fef08a"
                            tooltip="Màu nền"
                            onSelect={(color) => onAction('format-highlight', color)}
                        />
                    </div>

                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>

                    {/* 6. Alignment & Spacing */}
                    <ToolbarButton icon={<AlignLeft size={15} />} tooltip="Căn trái" active={editor.isActive({ textAlign: 'left' })} onClick={() => onAction('align-left')} />
                    <ToolbarButton icon={<AlignCenter size={15} />} tooltip="Căn giữa" active={editor.isActive({ textAlign: 'center' })} onClick={() => onAction('align-center')} />
                    <ToolbarButton icon={<AlignRight size={15} />} tooltip="Căn phải" active={editor.isActive({ textAlign: 'right' })} onClick={() => onAction('align-right')} />
                    <ToolbarButton icon={<AlignJustify size={15} />} tooltip="Căn đều" active={editor.isActive({ textAlign: 'justify' })} onClick={() => onAction('align-justify')} />

                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>

                    <DropdownButton
                        label=""
                        tooltip="Giãn dòng"
                        options={TOOLBAR_LINE_HEIGHTS}
                        onSelect={(val: any) => onAction('line-height', val)}
                        width="w-12"
                        icon={<ArrowUpDown size={14} />}
                        highlightActive
                        currentValue={getActiveLineHeight()}
                        disabled={isSourceMode}
                    />
                    <ToolbarButton icon={<Outdent size={15} />} tooltip="Giảm thụt lề" onClick={() => onAction('outdent')} disabled={!editor.can().liftListItem('listItem')} />
                    <ToolbarButton icon={<Indent size={15} />} tooltip="Tăng thụt lề" onClick={() => onAction('indent')} disabled={!editor.can().sinkListItem('listItem')} />

                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>

                    {/* 7. Lists & Blocks */}
                    <ToolbarButton icon={<List size={15} />} tooltip="Danh sách chấm" active={editor.isActive('bulletList')} onClick={() => onAction('insert-unordered-list')} />
                    <ToolbarButton icon={<ListOrdered size={15} />} tooltip="Danh sách số" active={editor.isActive('orderedList')} onClick={() => onAction('insert-ordered-list')} />
                    <ToolbarButton icon={<ListTodo size={15} />} tooltip="Checklist" active={editor.isActive('taskList')} onClick={() => onAction('insert-task-list')} />

                    <ToolbarButton icon={<Quote size={15} />} tooltip="Trích dẫn" active={editor.isActive('blockquote')} onClick={() => onAction('block-type', BlockType.QUOTE)} />

                    <DropdownButton
                        label=""
                        tooltip="Chèn thông báo"
                        options={TOOLBAR_ALERTS}
                        onSelect={(val: any) => onAction('insert-alert', val)}
                        width="w-12"
                        icon={<AlertCircle size={15} />}
                        highlightActive={true}
                        active={editor.isActive('alert')}
                        currentValue={editor.isActive('alert') ? editor.getAttributes('alert').type : null}
                        disabled={isSourceMode}
                    />

                    <ToolbarButton icon={<Layers size={15} />} tooltip="Nhóm nội dung" active={editor.isActive('details')} onClick={() => onAction('insert-layers')} />

                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>

                    {/* 8. Inserts */}
                    <ToolbarButton
                        icon={<LayoutTemplate size={15} />}
                        tooltip="Chèn khối mẫu (Templates)"
                        onClick={onOpenTemplates}
                    />

                    <LinkToolbarButton editor={editor} disabled={isSourceMode} />

                    <ToolbarButton icon={<ImageIcon size={15} />} tooltip="Chèn ảnh" onClick={() => onAction('insert-image')} />
                    <ToolbarButton icon={<Film size={15} />} tooltip="Chèn video" onClick={() => onAction('insert-video')} />

                    {/* Table & Table Contextual Actions */}
                    <div className={`flex items-center rounded ${isTableActive ? 'bg-blue-50/50 pr-1 border border-blue-100' : ''} transition-all duration-200`}>
                        <TableSelector editor={editor} disabled={isSourceMode} />

                        {isTableActive && !isSourceMode && (
                            <>
                                <div className="w-[1px] h-4 bg-blue-200 mx-1"></div>
                                <ToolbarButton icon={<ArrowDownToLine size={15} />} tooltip="Thêm hàng" onClick={() => onAction('table-add-row')} className="text-blue-600 hover:bg-blue-100" />
                                <ToolbarButton icon={<ArrowRightToLine size={15} />} tooltip="Thêm cột" onClick={() => onAction('table-add-col')} className="text-blue-600 hover:bg-blue-100" />
                                <ToolbarButton icon={<Trash2 size={15} />} tooltip="Xóa bảng" onClick={() => onAction('table-delete')} className="text-red-600 hover:bg-red-100" />
                            </>
                        )}
                    </div>

                    {/* Divider Dropdown */}
                    <DropdownButton
                        label=""
                        tooltip="Chèn dòng kẻ ngang"
                        options={TOOLBAR_DIVIDERS}
                        onSelect={(val: any) => onAction('insert-divider', val)}
                        width="w-12"
                        icon={<Minus size={15} />}
                        disabled={isSourceMode}
                    />

                    {/* Special Tools with Popovers */}
                    <div className="relative">
                        <ToolbarButton
                            icon={<Smile size={15} />}
                            tooltip="Chèn Emoji"
                            onClick={() => onAction('insert-emoji')}
                            active={activeTool === 'emoji'}
                        />
                        {activeTool === 'emoji' && (
                            <EmojiPicker
                                onSelect={(emoji) => editor.chain().focus().insertContent(emoji).run()}
                                onClose={() => setActiveTool(null)}
                            />
                        )}
                    </div>

                    <div className="relative flex items-center gap-1">
                        <ToolbarButton
                            icon={<Sigma size={15} />}
                            tooltip="Chèn công thức toán học"
                            onClick={() => onAction('insert-math')}
                            active={activeTool === 'math'}
                        />
                        {activeTool === 'math' && (
                            <MathDialog
                                onInsert={(tex) => {
                                    // Insert as Block Equation
                                    editor.chain().focus().insertContent({
                                        type: 'equationBlock',
                                        attrs: { latex: tex }
                                    }).run();
                                    setActiveTool(null);
                                }}
                                onClose={() => setActiveTool(null)}
                            />
                        )}
                    </div>

                    <div className="relative">
                        <ToolbarButton
                            icon={<Calculator size={15} />}
                            tooltip="Tính toán nhanh"
                            onClick={() => onAction('calculator')}
                            active={activeTool === 'calc'}
                        />
                        {activeTool === 'calc' && (
                            <CalculatorPopup
                                onInsert={(result) => editor.chain().focus().insertContent(result).run()}
                                onClose={() => setActiveTool(null)}
                            />
                        )}
                    </div>

                    <ToolbarButton icon={<Calendar size={15} />} tooltip="Ngày tháng" onClick={() => onAction('insert-date')} />

                    <ToolbarButton
                        icon={<MapPin size={15} />}
                        tooltip="Bản đồ"
                        onClick={() => onAction('insert-map')}
                    />

                    {onOpenBookmark && (
                        <ToolbarButton
                            icon={<Bookmark size={15} />}
                            tooltip="Chèn bookmark (anchor)"
                            onClick={onOpenBookmark}
                            disabled={isSourceMode}
                        />
                    )}

                    {onOpenFootnote && (
                        <ToolbarButton
                            icon={<StickyNote size={15} />}
                            tooltip="Chèn footnote"
                            onClick={onOpenFootnote}
                            disabled={isSourceMode}
                        />
                    )}

                    <ToolbarButton icon={<Mic size={15} />} tooltip="Ghi âm" onClick={() => onAction('mic')} />

                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>

                    {/* 9. Utilities */}
                    <div className="relative">
                        <ToolbarButton
                            icon={<Replace size={15} />}
                            tooltip="Tìm kiếm & Thay thế"
                            onClick={() => onAction('find-replace')}
                            active={activeTool === 'findReplace'}
                        />
                        {activeTool === 'findReplace' && (
                            <FindReplaceDialog
                                editor={editor}
                                onClose={() => setActiveTool(null)}
                            />
                        )}
                    </div>



                    <div className="relative">
                        <ToolbarButton
                            icon={<Download size={15} />}
                            tooltip="Tải về (PDF/Docx)"
                            onClick={() => onAction('download')}
                            active={activeTool === 'download'}
                        />
                        {activeTool === 'download' && (
                            <DownloadDialog
                                editor={editor}
                                onClose={() => setActiveTool(null)}
                            />
                        )}
                    </div>











                    {/* Advanced Features */}
                    {onOpenHistory && (
                        <ToolbarButton
                            icon={<Clock size={15} />}
                            tooltip="Lịch sử Undo/Redo"
                            onClick={onOpenHistory}
                        />
                    )}
                    {onOpenShortcuts && (
                        <ToolbarButton
                            icon={<Keyboard size={15} />}
                            tooltip="Tùy chỉnh phím tắt"
                            onClick={onOpenShortcuts}
                        />
                    )}
                    {onOpenVersionHistory && (
                        <ToolbarButton
                            icon={<History size={15} />}
                            tooltip="Lịch sử phiên bản"
                            onClick={onOpenVersionHistory}
                        />
                    )}

                    <div className="w-[1px] h-4 bg-gray-200 mx-0.5"></div>

                    {/* Media & Embeds */}
                    {onOpenEmbed && (
                        <ToolbarButton
                            icon={<Globe size={15} />}
                            tooltip="Chèn Embed (Twitter, Instagram, CodePen...)"
                            onClick={onOpenEmbed}
                            disabled={isSourceMode}
                        />
                    )}

                </div>
            </div>
        </>
    );
};