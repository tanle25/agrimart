'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
    Sigma, X, Delete, Check, RotateCcw, 
    Search, Smile, Users, Leaf, Pizza, 
    Car, Lightbulb, Heart, Flag,
    FunctionSquare, Grid2X2, Type, Divide,
    Globe, FileJson, FileType, FileCode, ArrowDown, Replace, ArrowRight, ArrowUp, ChevronRight, Settings2, Minimize2, ChevronLeft, CaseSensitive,
    FileText, Copy
} from 'lucide-react';
import katex from 'katex';

/* -------------------------------------------------------------------------- */
/*                          ADVANCED EMOJI PICKER                             */
/* -------------------------------------------------------------------------- */
// ... (EmojiPicker and other components remain unchanged, focusing update on FindReplaceDialog)

const EMOJI_DATA = {
    'Smileys': [
        "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "🥰", "😍", "🤩", "😘", "😗", "☺", "😚", "😙",
        "😋", "😛", "😜", "🤪", "😝", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "🤥",
        "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤮", "🤧", "🥵", "🥶", "🥴", "😵", "🤯", "🤠", "🥳", "😎", "🤓",
        "🧐", "😕", "😟", "🙁", "😮", "😯", "😲", "😳", "🥺", "😦", "😧", "😨", "😰", "😥", "😢", "😭", "😱", "😖", "😣", "😞",
        "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "👿", "💀", "☠", "💩", "🤡", "👹", "👺", "👻", "👽", "👾", "🤖"
    ],
    'People': [
        "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝", "👍", "👎",
        "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻",
        "👃", "🧠", "🦷", "🦴", "👀", "👁", "👅", "👄", "👶", "🧒", "👦", "👧", "🧑", "👱", "👨", "🧔", "👩", "🧓", "👴", "👵",
        "👮", "🕵", "💂", "👷", "🤴", "👸", "👳", "👲", "🧕", "🤵", "👰", "🤰", "🤱", "👼", "🎅", "🤶", "🦸", "🦹", "🧙", "🧚"
    ],
    'Nature': [
        "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🐵", "🙉", "🙊", "🐒",
        "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺", "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜",
        "🦟", "🦗", "🕷", "🕸", "🦂", "🐢", "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳",
        "🐋", "🦈", "🐊", "🐅", "🐆", "🦓", "🦍", "🦧", "🐘", "🦛", "🦏", "🐪", "🐫", "🦒", "🦘", "🐃", "🐂", "🐄", "🐎", "🐖"
    ],
    'Food': [
        "🍇", "🍈", "🍉", "🍊", "🍋", "🍌", "🍍", "🥭", "🍎", "🍏", "🍐", "🍑", "🍒", "🍓", "🥝", "🍅", "🥥", "🥑", "🍆", "🥔",
        "🥕", "🌽", "🌶", "🥒", "🥬", "🥦", "🧄", "🧅", "🍄", "🥜", "🌰", "🍞", "🥐", "🥖", "🥨", "🥯", "🥞", "🧇", "🧀", "🍖",
        "🍗", "🥩", "🥓", "🍔", "🍟", "🍕", "🌭", "🥪", "🌮", "🌯", "🥙", "🧆", "🥚", "🍳", "🥘", "🍲", "🥣", "🥗", "🍿", "🧈",
        "🧂", "🥫", "🍱", "🍘", "🍙", "🍚", "🍛", "🍜", "🍝", "🍠", "🍢", "🍣", "🍤", "🍥", "🥮", "🍡", "🥟", "🥠", "🥡", "🦀"
    ],
    'Objects': [
        "👓", "🕶", "🥽", "🥼", "🦺", "👔", "👕", "👖", "🧣", "🧤", "🧥", "🧦", "👗", "👘", "🥻", "🩱", "🩲", "🩳", "👙", "👚",
        "👛", "👜", "👝", "🛍", "🎒", "👞", "👟", "🥾", "🥿", "👠", "👡", "🩰", "👢", "👑", "👒", "🎩", "🎓", "🧢", "⛑", "📿",
        "💄", "💍", "💎", "🔇", "🔈", "🔉", "🔊", "📢", "📣", "📯", "🔔", "🔕", "🎼", "🎵", "🎶", "🎙", "🎚", "🎛", "🎤", "🎧",
        "📻", "🎷", "🎸", "🎹", "🎺", "🎻", "🪕", "🥁", "📱", "📲", "☎", "📞", "📟", "📠", "🔋", "🔌", "💻", "🖥", "🖨", "⌨"
    ],
    'Symbols': [
        "❤", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "💔", "❣", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
        "☮", "✝", "☪", "🕉", "☸", "✡", "🔯", "🕎", "🕎", "☯", "☦", "🛐", "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐",
        "♑", "♒", "♓", "🆔", "⚛", "🉑", "☢", "☣", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷", "✴", "🆚", "💮", "🉐", "㊙", "㊗",
        "🛑", "⛔", "📛", "🚫", "💯", "💢", "♨", "🚷", "🚯", "🚳", "🚱", "🔞", "📵", "🚭", "❗", "❕", "❓", "❔", "‼", "⁉"
    ]
};

const CATEGORIES = [
    { id: 'Smileys', icon: Smile },
    { id: 'People', icon: Users },
    { id: 'Nature', icon: Leaf },
    { id: 'Food', icon: Pizza },
    { id: 'Objects', icon: Lightbulb },
    { id: 'Symbols', icon: Heart },
];

export const EmojiPicker = ({ onSelect, onClose }: { onSelect: (emoji: string) => void, onClose: () => void }) => {
    const [activeCat, setActiveCat] = useState('Smileys');
    const [search, setSearch] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Flatten emojis for search
    const allEmojis = Object.values(EMOJI_DATA).flat();
    
    // Naive search implementation
    const displayedEmojis = search.length > 0 
        ? allEmojis.filter(e => true).slice(0, 100) 
        : EMOJI_DATA[activeCat as keyof typeof EMOJI_DATA];

    return (
        <div ref={ref} className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 w-80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 h-96">
            {/* Header / Search */}
            <div className="p-3 border-b border-gray-100">
                <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search emojis..." 
                        className="w-full pl-8 pr-3 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Emoji Grid */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-200">
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                    {search ? 'Search Results' : activeCat}
                </div>
                <div className="grid grid-cols-8 gap-1">
                    {displayedEmojis.map((emoji, idx) => (
                        <button
                            key={idx}
                            onClick={() => { onSelect(emoji); onClose(); }}
                            className="w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-100 hover:scale-125 rounded transition-all cursor-pointer select-none"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer / Categories */}
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => { setActiveCat(cat.id); setSearch(''); }}
                        className={`p-1.5 rounded-lg transition-colors ${activeCat === cat.id && !search ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                        title={cat.id}
                    >
                        <cat.icon size={18} />
                    </button>
                ))}
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*                               CALCULATOR                                   */
/* -------------------------------------------------------------------------- */
export const CalculatorPopup = ({ onInsert, onClose }: { onInsert: (result: string) => void, onClose: () => void }) => {
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleNum = (num: string) => {
        if (display === '0') {
            setDisplay(num);
        } else {
            setDisplay(display + num);
        }
    };

    const handleOp = (op: string) => {
        setEquation(display + ' ' + op + ' ');
        setDisplay('0');
    };

    const handleClear = () => {
        setDisplay('0');
        setEquation('');
    };

    const handleEqual = () => {
        try {
            // Basic sanitized calculation
            const fullExpr = equation + display;
            const sanitized = fullExpr.replace(/[^0-9+\-*/(). ]/g, '');
            // eslint-disable-next-line no-new-func
            const result = new Function('return ' + sanitized)();
            const finalResult = String(Number(result).toFixed(2)).replace(/\.00$/, '');
            setDisplay(finalResult);
            setEquation('');
        } catch (e) {
            setDisplay('Error');
        }
    };

    const insertResult = () => {
        onInsert(display);
        onClose();
    };

    return (
        <div ref={ref} className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4 w-64 animate-in fade-in zoom-in-95 duration-100">
             <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 z-0" />
            
            <div className="relative z-10">
                {/* Screen */}
                <div className="bg-gray-100 rounded-lg p-3 mb-3 text-right">
                    <div className="text-xs text-gray-500 h-4">{equation}</div>
                    <div className="text-2xl font-mono font-bold text-gray-800 truncate">{display}</div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                    <button onClick={handleClear} className="col-span-1 bg-red-50 text-red-500 rounded p-2 hover:bg-red-100 font-medium">C</button>
                    <button onClick={() => handleOp('/')} className="bg-gray-50 text-blue-600 rounded p-2 hover:bg-gray-100 font-medium">÷</button>
                    <button onClick={() => handleOp('*')} className="bg-gray-50 text-blue-600 rounded p-2 hover:bg-gray-100 font-medium">×</button>
                    <button onClick={() => {
                        const str = display;
                        setDisplay(str.substring(0, str.length - 1) || '0');
                    }} className="bg-gray-50 text-gray-500 rounded p-2 hover:bg-gray-100"><Delete size={16} className="mx-auto"/></button>

                    {['7','8','9','-'].map(b => (
                        <button key={b} onClick={() => isNaN(Number(b)) ? handleOp(b) : handleNum(b)} className={`${isNaN(Number(b)) ? 'bg-gray-50 text-blue-600' : 'bg-white border border-gray-100 text-gray-700'} rounded p-2 hover:bg-gray-50 font-medium shadow-sm`}>{b}</button>
                    ))}
                     {['4','5','6','+'].map(b => (
                        <button key={b} onClick={() => isNaN(Number(b)) ? handleOp(b) : handleNum(b)} className={`${isNaN(Number(b)) ? 'bg-gray-50 text-blue-600' : 'bg-white border border-gray-100 text-gray-700'} rounded p-2 hover:bg-gray-50 font-medium shadow-sm`}>{b}</button>
                    ))}
                    <div className="col-span-4 grid grid-cols-4 gap-2">
                         <div className="col-span-3 grid grid-cols-3 gap-2">
                            {['1','2','3'].map(b => (
                                <button key={b} onClick={() => handleNum(b)} className="bg-white border border-gray-100 text-gray-700 rounded p-2 hover:bg-gray-50 font-medium shadow-sm">{b}</button>
                            ))}
                            <button onClick={() => handleNum('0')} className="col-span-2 bg-white border border-gray-100 text-gray-700 rounded p-2 hover:bg-gray-50 font-medium shadow-sm">0</button>
                            <button onClick={() => handleNum('.')} className="bg-white border border-gray-100 text-gray-700 rounded p-2 hover:bg-gray-50 font-medium shadow-sm">.</button>
                         </div>
                         <button onClick={handleEqual} className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 font-medium shadow-sm flex items-center justify-center">=</button>
                    </div>
                </div>

                <button 
                    onClick={insertResult}
                    className="w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    Insert Result
                </button>
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/*                          ADVANCED MATH DIALOG                              */
/* -------------------------------------------------------------------------- */

const MATH_TABS = [
    { id: 'common', label: 'Common', icon: Sigma },
    { id: 'calculus', label: 'Calculus', icon: FunctionSquare },
    { id: 'matrix', label: 'Matrix', icon: Grid2X2 },
    { id: 'greek', label: 'Greek', icon: Type },
    { id: 'logic', label: 'Logic', icon: Divide },
];

const MATH_SYMBOLS = {
    'common': [
        { label: 'Fraction', tex: '\\frac{a}{b}' },
        { label: 'Power', tex: 'x^n' },
        { label: 'Subscript', tex: 'x_n' },
        { label: 'Root', tex: '\\sqrt{x}' },
        { label: 'N-Root', tex: '\\sqrt[n]{x}' },
        { label: 'Sum', tex: '\\sum' },
        { label: 'Sum (Limits)', tex: '\\sum_{i=0}^{n}' },
        { label: 'Infinity', tex: '\\infty' },
        { label: 'Plus/Minus', tex: '\\pm' },
        { label: 'Not Equal', tex: '\\neq' },
        { label: 'Approx', tex: '\\approx' },
        { label: 'Times', tex: '\\times' },
    ],
    'calculus': [
        { label: 'Integral', tex: '\\int' },
        { label: 'Definite Int', tex: '\\int_{a}^{b}' },
        { label: 'Double Int', tex: '\\iint' },
        { label: 'Limit', tex: '\\lim_{x \\to \\infty}' },
        { label: 'Derivative', tex: '\\frac{d}{dx}' },
        { label: 'Partial', tex: '\\frac{\\partial}{\\partial x}' },
        { label: 'Gradient', tex: '\\nabla' },
        { label: 'Delta', tex: '\\Delta' },
        { label: 'Prime', tex: 'f\'(x)' },
        { label: 'Vector', tex: '\\vec{v}' },
    ],
    'matrix': [
        { label: 'Parentheses', tex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
        { label: 'Brackets', tex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
        { label: 'Determinant', tex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}' },
        { label: 'Cases', tex: '\\begin{cases} x & x > 0 \\\\ -x & x < 0 \\end{cases}' },
        { label: 'Vector Col', tex: '\\begin{pmatrix} x \\\\ y \\end{pmatrix}' },
        { label: 'Dots', tex: '\\dots' },
    ],
    'greek': [
        { label: 'α', tex: '\\alpha' },
        { label: 'β', tex: '\\beta' },
        { label: 'γ', tex: '\\gamma' },
        { label: 'δ', tex: '\\delta' },
        { label: 'θ', tex: '\\theta' },
        { label: 'λ', tex: '\\lambda' },
        { label: 'μ', tex: '\\mu' },
        { label: 'π', tex: '\\pi' },
        { label: 'σ', tex: '\\sigma' },
        { label: 'φ', tex: '\\phi' },
        { label: 'ω', tex: '\\omega' },
        { label: 'Ω', tex: '\\Omega' },
    ],
    'logic': [
        { label: 'For All', tex: '\\forall' },
        { label: 'Exists', tex: '\\exists' },
        { label: 'In', tex: '\\in' },
        { label: 'Not In', tex: '\\notin' },
        { label: 'Subset', tex: '\\subset' },
        { label: 'Union', tex: '\\cup' },
        { label: 'Intersect', tex: '\\cap' },
        { label: 'Arrow R', tex: '\\rightarrow' },
        { label: 'Arrow L', tex: '\\leftarrow' },
        { label: 'Implies', tex: '\\implies' },
        { label: 'Iff', tex: '\\iff' },
        { label: 'Therefore', tex: '\\therefore' },
    ]
};

// Safe helper to prevent crashes in quirks mode
const safeRenderKaTeX = (tex: string) => {
    try {
        return katex.renderToString(tex, { throwOnError: false, displayMode: false });
    } catch (e) {
        // Fallback for visual representation if render fails
        return `<span class="font-mono text-xs">${tex}</span>`;
    }
};

export const MathDialog = ({ onInsert, onClose }: { onInsert: (tex: string) => void, onClose: () => void }) => {
     const [latex, setLatex] = useState('');
     const [activeTab, setActiveTab] = useState('common');
     const ref = useRef<HTMLDivElement>(null);
     const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Live Preview
    useEffect(() => {
        if(previewRef.current) {
            try {
                // If latex is empty, show nothing or placeholder
                if (!latex) {
                    previewRef.current.innerHTML = '<span class="text-gray-400 text-sm italic">Preview Area</span>';
                    return;
                }
                katex.render(latex, previewRef.current, {
                    throwOnError: false,
                    displayMode: true,
                    errorColor: '#ef4444'
                });
            } catch (e: any) {
                // Specific handling for quirks mode to show a better error
                if (e.message && e.message.includes('quirks mode')) {
                     previewRef.current.innerHTML = '<span class="text-red-500 text-xs">Error: Document is in Quirks Mode. Add &lt;!DOCTYPE html&gt;.</span>';
                } else {
                     previewRef.current.innerHTML = '<span class="text-red-400 text-xs font-mono">Invalid LaTeX</span>';
                }
            }
        }
    }, [latex]);

    return (
        <div ref={ref} className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-[420px] animate-in fade-in zoom-in-95 duration-100 flex flex-col overflow-hidden">
             <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 z-0" />
             
             {/* Header & Tabs */}
             <div className="bg-gray-50 border-b border-gray-100 flex overflow-x-auto no-scrollbar">
                {MATH_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2
                            ${activeTab === tab.id ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'}
                        `}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
             </div>
             
             <div className="p-4 relative z-10 space-y-4">
                
                {/* Symbol Grid */}
                <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-gray-200">
                    {MATH_SYMBOLS[activeTab as keyof typeof MATH_SYMBOLS].map((item, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setLatex(prev => prev + item.tex)}
                            className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100 transition-all text-gray-700"
                            title={item.label}
                        >
                            <span className="text-sm truncate w-full text-center" dangerouslySetInnerHTML={{ 
                                __html: safeRenderKaTeX(item.tex)
                            }} />
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>LaTeX Expression</span>
                        <button onClick={() => setLatex('')} className="text-red-400 hover:text-red-500">Clear</button>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-2 py-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                        <span className="text-gray-400 font-mono text-sm select-none">$</span>
                        <textarea 
                            autoFocus
                            rows={2}
                            className="flex-1 min-w-0 bg-transparent outline-none font-mono text-sm text-gray-800 resize-none"
                            placeholder="Type LaTeX here..."
                            value={latex}
                            onChange={(e) => setLatex(e.target.value)}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onInsert(latex);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Preview Box */}
                <div className="bg-gray-50 rounded-lg p-3 min-h-[60px] flex items-center justify-center border border-dashed border-gray-200 text-center">
                    <div ref={previewRef} className="text-lg text-gray-800" />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-gray-50">
                     <button onClick={onClose} className="flex-1 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                     <button onClick={() => onInsert(latex)} className="flex-1 py-2 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm">Insert Formula</button>
                </div>
             </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/*                          FIND & REPLACE DIALOG                             */
/* -------------------------------------------------------------------------- */

// Regex Helper
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const FindReplaceDialog = ({ editor, onClose }: { editor: any, onClose: () => void }) => {
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [matchCase, setMatchCase] = useState(false);
    const [results, setResults] = useState<{from: number, to: number}[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0); // 0-based index of results
    
    // 1. Scan document for matches & Update Search Extension
    useEffect(() => {
        // Update the Search Extension for visual highlighting (does not steal focus)
        editor.commands.setSearchTerm({ term: findText, caseSensitive: matchCase });

        if (!findText) {
            setResults([]);
            setCurrentIndex(0);
            return;
        }

        const matches: {from: number, to: number}[] = [];
        const { doc } = editor.state;
        
        try {
            const regex = new RegExp(escapeRegExp(findText), matchCase ? 'g' : 'gi');
            
                doc.descendants((node: any, pos: number) => {
                if (node.isText && node.text) {
                    let match;
                    while ((match = regex.exec(node.text)) !== null) {
                        matches.push({
                            from: pos + match.index,
                            to: pos + match.index + match[0].length
                        });
                    }
                }
            });
        } catch (e) {
            console.error("Search error", e);
        }

        setResults(matches);
        
        // Update current index based on cursor position
        if (matches.length > 0) {
            const currentPos = editor.state.selection.from;
            const nextMatchIndex = matches.findIndex(m => m.from >= currentPos);
            const newIndex = nextMatchIndex !== -1 ? nextMatchIndex : 0;
            setCurrentIndex(newIndex);
            
            // NOTE: We do NOT automatically select the text here to avoid stealing focus from input.
            // Highlighting is handled by the SearchExtension.
        } else {
            setCurrentIndex(0);
        }

    }, [findText, matchCase, editor.state.doc]); // editor.commands ref is stable

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            editor.commands.clearSearch();
        };
    }, []);

    // Navigation (This DOES select text and focus editor)
    const goToMatch = (index: number) => {
        if (results.length === 0) return;
        const safeIndex = (index + results.length) % results.length; // Handle wrap around
        setCurrentIndex(safeIndex);
        
        const match = results[safeIndex];
        if (match) {
            editor.chain().focus().setTextSelection({ from: match.from, to: match.to }).scrollIntoView().run();
        }
    };

    const next = () => goToMatch(currentIndex + 1);
    const prev = () => goToMatch(currentIndex - 1);

    // Actions
    const replace = () => {
        if (results.length === 0) return;
        const match = results[currentIndex];
        
        if (match) {
            editor.chain().focus()
                .setTextSelection({ from: match.from, to: match.to })
                .insertContent(replaceText)
                .run();
        }
    };

    const replaceAll = () => {
        if (!findText || results.length === 0) return;
        
        const { tr } = editor.state;
        let count = 0;
        
        [...results].reverse().forEach(match => {
            tr.insertText(replaceText, match.from, match.to);
            count++;
        });
        
        editor.view.dispatch(tr);
        // alert(`Replaced ${count} occurrences.`);
    };

    const displayIndex = results.length > 0 ? currentIndex + 1 : 0;

    return (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-80 animate-in fade-in zoom-in-95 duration-100 p-0 overflow-hidden">
             {/* Header */}
             <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 drag-handle cursor-move">
                 <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                    <Search size={12} /> Find & Replace
                 </span>
                 <div className="flex gap-1">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded p-0.5"><X size={14}/></button>
                 </div>
             </div>
             
             <div className="p-3 space-y-3">
                 <div className="space-y-2">
                     <div className="relative group">
                         <input 
                            autoFocus
                            placeholder="Find..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-md pl-8 pr-24 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-gray-800"
                            value={findText}
                            onChange={(e) => setFindText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (e.shiftKey) prev(); else next();
                                }
                            }}
                         />
                         <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                         
                         {/* Controls inside input */}
                         <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                             <button
                                onClick={() => setMatchCase(!matchCase)}
                                className={`p-1 rounded-md transition-colors ${matchCase ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
                                title="Match Case"
                             >
                                 <CaseSensitive size={14} />
                             </button>
                             <div className="w-px h-3 bg-gray-200"></div>
                             <span className="text-[10px] text-gray-400 font-mono px-1 min-w-[30px] text-center">
                                 {results.length > 0 ? `${displayIndex}/${results.length}` : '0/0'}
                             </span>
                         </div>
                     </div>

                     <div className="relative">
                         <input 
                            placeholder="Replace with..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-md pl-8 pr-2 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-gray-800"
                            value={replaceText}
                            onChange={(e) => setReplaceText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && replace()}
                         />
                         <Replace size={14} className="absolute left-2.5 top-2 text-gray-400" />
                     </div>
                 </div>

                 {/* Navigation & Actions */}
                 <div className="flex justify-between items-center gap-2">
                     <div className="flex bg-gray-100 rounded-md p-0.5">
                         <button onClick={prev} disabled={results.length === 0} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded shadow-sm disabled:opacity-50 transition-all" title="Previous (Shift+Enter)">
                             <ChevronLeft size={16} />
                         </button>
                         <div className="w-px bg-gray-300 my-1"></div>
                         <button onClick={next} disabled={results.length === 0} className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded shadow-sm disabled:opacity-50 transition-all" title="Next (Enter)">
                             <ChevronRight size={16} />
                         </button>
                     </div>

                     <div className="flex gap-2">
                         <button 
                            onClick={replace} 
                            disabled={results.length === 0}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-md shadow-sm disabled:opacity-50 transition-all"
                        >
                            Replace
                         </button>
                         <button 
                            onClick={replaceAll}
                            disabled={results.length === 0}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-50 transition-all"
                        >
                            All
                         </button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*                          DOWNLOAD DIALOG                                   */
/* -------------------------------------------------------------------------- */

import { exportAsPDF, exportAsMarkdown, copyAsMarkdown } from './ExportUtils';

export const DownloadDialog = ({ editor, onClose }: { editor: any, onClose: () => void }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const downloadFile = (format: 'html' | 'json' | 'txt' | 'markdown') => {
        let content = '';
        let type = '';
        let ext = '';

        if (format === 'html') {
            content = editor.getHTML();
            type = 'text/html';
            ext = 'html';
        } else if (format === 'json') {
            content = JSON.stringify(editor.getJSON(), null, 2);
            type = 'application/json';
            ext = 'json';
        } else if (format === 'markdown') {
            exportAsMarkdown(editor.getHTML(), 'document.md');
            onClose();
            return;
        } else {
            content = editor.getText();
            type = 'text/plain';
            ext = 'txt';
        }

        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `document.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onClose();
    };

    const handlePrint = () => {
        window.print();
        onClose();
    };

    const handlePDFExport = async () => {
        setIsExporting(true);
        try {
            await exportAsPDF(editor.getHTML(), 'document.pdf');
        } catch (err) {
            console.error('PDF export failed:', err);
            alert('Không thể xuất PDF. Vui lòng thử lại hoặc sử dụng Print.');
        } finally {
            setIsExporting(false);
            onClose();
        }
    };

    const handleCopyMarkdown = async () => {
        const success = await copyAsMarkdown(editor.getHTML());
        if (success) {
            // Show toast or notification
            alert('Đã sao chép nội dung dạng Markdown vào clipboard!');
        } else {
            alert('Không thể sao chép. Vui lòng thử lại.');
        }
        onClose();
    };

    return (
        <div ref={ref} className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-64 animate-in fade-in zoom-in-95 duration-100 p-2">
            <div className="absolute -top-1.5 right-4 w-3 h-3 bg-white border-t border-l border-gray-200 rotate-45 z-0" />
            <div className="relative z-10">
                <div className="px-2 py-1.5 text-xs font-bold text-gray-500 uppercase mb-1">Export Document</div>
                
                <button 
                    onClick={handlePDFExport} 
                    disabled={isExporting}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left group disabled:opacity-50"
                >
                    <div className="p-1.5 bg-red-50 text-red-600 rounded group-hover:bg-white group-hover:shadow-sm transition-all"><FileText size={14}/></div>
                    <span>{isExporting ? 'Đang xuất...' : 'Export as PDF'}</span>
                </button>
                <button onClick={() => downloadFile('markdown')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left group">
                    <div className="p-1.5 bg-purple-50 text-purple-600 rounded group-hover:bg-white group-hover:shadow-sm transition-all"><FileCode size={14}/></div>
                    <span>Export as Markdown</span>
                </button>
                <button onClick={handleCopyMarkdown} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left group">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded group-hover:bg-white group-hover:shadow-sm transition-all"><Copy size={14}/></div>
                    <span>Copy as Markdown</span>
                </button>
                <div className="h-px bg-gray-200 my-1"></div>
                <button onClick={() => downloadFile('html')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left group">
                    <div className="p-1.5 bg-orange-50 text-orange-600 rounded group-hover:bg-white group-hover:shadow-sm transition-all"><Globe size={14}/></div>
                    <span>Export as HTML</span>
                </button>
                <button onClick={() => downloadFile('json')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left group">
                    <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded group-hover:bg-white group-hover:shadow-sm transition-all"><FileJson size={14}/></div>
                    <span>Export as JSON</span>
                </button>
                <button onClick={() => downloadFile('txt')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-left group">
                    <div className="p-1.5 bg-gray-100 text-gray-600 rounded group-hover:bg-white group-hover:shadow-sm transition-all"><FileType size={14}/></div>
                    <span>Export as Text</span>
                </button>
            </div>
        </div>
    );
};