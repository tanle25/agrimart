"use client";

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Check, X } from 'lucide-react';

interface BlogFiltersProps {
    categories: string[];
    selectedCategories: string[]; // Changed from selectedCategory: string
    onToggleCategory: (category: string) => void; // Changed handler name for clarity
    onSearch: (term: string) => void;
    currentSearchTerm: string;
}

export default function BlogFilters({
    categories,
    selectedCategories,
    onToggleCategory,
    onSearch,
    currentSearchTerm
}: BlogFiltersProps) {
    const [searchTerm, setSearchTerm] = useState(currentSearchTerm);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== currentSearchTerm) {
                onSearch(searchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentSearchTerm, onSearch]);

    // Sync local state if parent updates it (e.g. clear filters)
    useEffect(() => {
        setSearchTerm(currentSearchTerm);
    }, [currentSearchTerm]);

    const isAllSelected = selectedCategories.length === 0 || (selectedCategories.length === 1 && selectedCategories[0] === "Tất cả");

    return (
        <div className="space-y-8">
            {/* Search */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Tìm kiếm</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm bài viết..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Chuyên mục</h3>
                    {!isAllSelected && (
                        <button
                            onClick={() => onToggleCategory("Tất cả")} // Reset to All
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                        >
                            Xóa chọn
                        </button>
                    )}
                </div>
                <ul className="space-y-2">
                    {categories.map((cat, idx) => {
                        // "Tất cả" is special case
                        const isCatSelected = cat === "Tất cả"
                            ? isAllSelected
                            : selectedCategories.includes(cat);

                        return (
                            <li key={idx}>
                                <button
                                    onClick={() => onToggleCategory(cat)}
                                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors group ${isCatSelected ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <span className={`flex items-center gap-2 ${isCatSelected ? 'font-semibold' : ''}`}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isCatSelected ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 bg-white'}`}>
                                            {isCatSelected && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        {cat}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>

        </div>
    );
}
