"use client";

import React from 'react';
import { Search, X, Check } from 'lucide-react';
import PromoBanner from '@/components/common/PromoBanner';

// Reusing constants from parent or passing them?
// It's better to pass them or define them if they are static constants.
const MIN_PRICE_LIMIT = 0;
const PRICE_STEP = 1000;

interface CategoryCount {
    name: string;
    count: number;
}

interface ProductFiltersProps {
    showMobileFilter: boolean;
    onCloseMobileFilter: () => void;
    searchTerm: string;
    onSearchChange: (val: string) => void;
    categories: CategoryCount[];
    currentCategories: string[];
    onToggleCategory: (categoryName: string) => void;
    onClearCategory: () => void;
    priceRange: [number, number];
    maxPriceLimit: number;
    onPriceChange: (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
    showMobileFilter,
    onCloseMobileFilter,
    searchTerm,
    onSearchChange,
    categories,
    currentCategories,
    onToggleCategory,
    onClearCategory,
    priceRange,
    maxPriceLimit,
    onPriceChange,
}) => {

    const minPercent = Math.min(100, Math.max(0, ((priceRange[0] - MIN_PRICE_LIMIT) / (maxPriceLimit - MIN_PRICE_LIMIT)) * 100));
    const maxPercent = Math.min(100, Math.max(0, ((priceRange[1] - MIN_PRICE_LIMIT) / (maxPriceLimit - MIN_PRICE_LIMIT)) * 100));

    return (
        <aside className={`
            space-y-8
            ${showMobileFilter ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden lg:block'}
          `}>
            <div className="flex justify-between items-center lg:hidden mb-6">
                <h2 className="text-xl font-bold text-gray-900">Bộ lọc tìm kiếm</h2>
                <button onClick={onCloseMobileFilter} aria-label="Đóng bộ lọc"><X className="w-6 h-6" /></button>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    aria-label="Tìm kiếm sản phẩm"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Categories Multi-select List */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">Danh mục</h3>
                    {currentCategories.length > 0 && (
                        <button
                            onClick={onClearCategory}
                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                            Xóa chọn
                        </button>
                    )}
                </div>

                <ul className="space-y-3">
                    {categories.map((cat) => {
                        const isSelected = currentCategories.includes(cat.name);
                        return (
                            <li key={cat.name}>
                                <button
                                    onClick={() => onToggleCategory(cat.name)}
                                    className={`flex items-center justify-between w-full group p-2 rounded-lg transition-all ${isSelected ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-gray-50 text-gray-600'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`
                            w-5 h-5 rounded border flex items-center justify-center transition-colors
                            ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 bg-white group-hover:border-emerald-400'}
                          `}>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <span className={`text-sm ${isSelected ? 'font-semibold' : 'font-medium'}`}>{cat.name}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {cat.count}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                    {categories.length === 0 && (
                        <li className="text-gray-400 text-sm text-center py-2">Chưa có danh mục nào</li>
                    )}
                </ul>
            </div>

            {/* Price Filter - Dual Slider */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 text-lg">Khoảng giá</h3>

                <div className="relative w-full h-6 mb-6">
                    <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 rounded-full -translate-y-1/2"></div>
                    <div
                        className="absolute top-1/2 h-1.5 bg-emerald-500 rounded-full -translate-y-1/2 z-10"
                        style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                    ></div>
                    <input
                        type="range"
                        aria-label="Giá thấp nhất"
                        min={MIN_PRICE_LIMIT}
                        max={maxPriceLimit}
                        step={PRICE_STEP}
                        value={priceRange[0]}
                        onChange={(e) => onPriceChange(e, 0)}
                        className={`absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none focus:outline-none ${priceRange[0] > (maxPriceLimit * 0.9) ? 'z-30' : 'z-20'}`}
                    />
                    <input
                        type="range"
                        aria-label="Giá cao nhất"
                        min={MIN_PRICE_LIMIT}
                        max={maxPriceLimit}
                        step={PRICE_STEP}
                        value={priceRange[1]}
                        onChange={(e) => onPriceChange(e, 1)}
                        className="absolute top-0 left-0 w-full h-full appearance-none bg-transparent pointer-events-none z-20 focus:outline-none"
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="border border-gray-200 rounded-lg p-2 w-full text-center">
                        <span className="block text-xs text-gray-400 mb-1">Thấp nhất</span>
                        <span className="font-semibold text-gray-900 text-sm">{priceRange[0].toLocaleString()}đ</span>
                    </div>
                    <div className="text-gray-400">-</div>
                    <div className="border border-gray-200 rounded-lg p-2 w-full text-center">
                        <span className="block text-xs text-gray-400 mb-1">Cao nhất</span>
                        <span className="font-semibold text-gray-900 text-sm">{priceRange[1].toLocaleString()}đ</span>
                    </div>
                </div>
            </div>

            {/* Promotion Banner */}
            <PromoBanner />
        </aside>
    );
};

export default ProductFilters;
