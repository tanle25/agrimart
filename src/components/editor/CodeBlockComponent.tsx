'use client';
import React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Check, Copy, ChevronDown } from 'lucide-react';

interface CodeBlockComponentProps {
  node: any;
  updateAttributes: (attrs: any) => void;
  extension: any;
}

export const CodeBlockComponent = ({ node, updateAttributes, extension }: CodeBlockComponentProps) => {
  const [isCopied, setIsCopied] = React.useState(false);

  const languages = extension.options.lowlight.listLanguages().sort();

  const handleCopy = () => {
    // Determine content: Tiptap stores text content in the node's content property
    const content = node.textContent;
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <NodeViewWrapper className="code-block relative my-6 rounded-lg overflow-hidden shadow-lg border border-gray-700 bg-[#282c34] group">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-gray-700 select-none">
        
        {/* Mac-like Window Controls */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* Language Selector */}
        <div className="relative group/select">
            <div className="flex items-center gap-1 text-xs text-gray-400 font-sans hover:text-white transition-colors cursor-pointer">
                <span>{node.attrs.language || 'auto'}</span>
                <ChevronDown size={10} />
            </div>
            <select 
                contentEditable={false} 
                defaultValue={node.attrs.language} 
                onChange={(event) => updateAttributes({ language: event.target.value })}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
                <option value="null">auto</option>
                <option disabled>---</option>
                {languages.map((lang: string, index: number) => (
                    <option key={index} value={lang}>
                        {lang}
                    </option>
                ))}
            </select>
        </div>

        {/* Copy Button */}
        <button 
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
            title="Copy Code"
        >
            {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            <span className="hidden sm:inline">{isCopied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Area */}
      {/* Note: 'hljs' class is required for highlight.js themes to apply background colors correctly, 
          but we are setting our own container background, so we just let the theme handle text colors */}
      <pre className="!m-0 !p-0 !bg-transparent font-mono text-sm leading-relaxed">
        <NodeViewContent as="code" className={`language-${node.attrs.language} !p-4 block !bg-transparent !font-['JetBrains_Mono']`} />
      </pre>
    </NodeViewWrapper>
  );
};
