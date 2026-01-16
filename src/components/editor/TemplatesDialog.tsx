'use client';
import React, { useState } from 'react';
import { X, LayoutTemplate, Search } from 'lucide-react';
import { BLOCK_TEMPLATES } from './blockTemplates';

interface TemplatesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string) => void;
}

export const TemplatesDialog: React.FC<TemplatesDialogProps> = ({ isOpen, onClose, onInsert }) => {
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const categories = ['All', ...Array.from(new Set(BLOCK_TEMPLATES.map(t => t.category)))];

  const filteredTemplates = BLOCK_TEMPLATES.filter(template => {
    const matchesCategory = category === 'All' || template.category === category;
    const matchesSearch = template.label.toLowerCase().includes(search.toLowerCase()) || 
                          template.category.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-[900px] h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <LayoutTemplate size={20} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-800">Block Templates</h3>
                <p className="text-xs text-gray-500">Insert pre-designed Tailwind CSS blocks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Categories */}
            <div className="w-48 bg-gray-50 border-r border-gray-100 p-4 space-y-1 overflow-y-auto">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${category === cat ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search templates..." 
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <div className="grid grid-cols-2 gap-6">
                        {filteredTemplates.map(template => (
                            <div 
                                key={template.id} 
                                className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer overflow-hidden flex flex-col"
                                onClick={() => {
                                    onInsert(template.content);
                                    onClose();
                                }}
                            >
                                <div className="aspect-[16/9] bg-gray-100 relative overflow-hidden border-b border-gray-100">
                                    {/* Preview Image (Placeholder) */}
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-50">
                                        <img src={template.preview} alt={template.label} className="w-full h-full object-cover opacity-80" />
                                    </div>
                                    
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center">
                                        <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            Insert Block
                                        </button>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-gray-800 text-sm">{template.label}</h4>
                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{template.category}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {filteredTemplates.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <LayoutTemplate size={48} className="mb-4 opacity-50" />
                            <p>No templates found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};