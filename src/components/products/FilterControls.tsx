// components/products/FilterControls.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Search, X, Check } from 'lucide-react';
import PromoBanner from '@/components/common/PromoBanner';

import { DualRangeSlider } from './DualRangeSlider';

interface FilterControlsProps {
    initialCategories: Array<{ name: string; count: number }>;
    initialMaxPrice: number;
}

const MIN_PRICE_LIMIT = 0;
const PRICE_STEP = 1000;

/**
 * Client Component for interactive filters
 * Renders filter UI directly (no wrapper)
 * Reusable for both desktop sidebar and mobile drawer
 */
export function FilterControls({ initialCategories, initialMaxPrice }: FilterControlsProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Fallback if max price is 0 (API error or empty DB)
    const effectiveMaxPrice = initialMaxPrice > 0 ? initialMaxPrice : 50000000;

    // Parse current state from URL
    const currentSearch = searchParams.get('search') || '';
    const currentCategories = searchParams.get('category') ? searchParams.get('category')!.split(',') : [];
    const currentMinPrice = Number(searchParams.get('minPrice')) || MIN_PRICE_LIMIT;

    // Use effective max price for default
    const currentMaxPrice = Number(searchParams.get('maxPrice')) || effectiveMaxPrice;

    const [priceRange, setPriceRange] = useState<[number, number]>([currentMinPrice, currentMaxPrice]);
    const [searchTerm, setSearchTerm] = useState(currentSearch);

    // Sync local state when URL changes
    useEffect(() => {
        setSearchTerm(currentSearch);
        if (searchParams.get('minPrice') || searchParams.get('maxPrice')) {
            setPriceRange([currentMinPrice, currentMaxPrice]);
        }
    }, [currentSearch, currentMinPrice, currentMaxPrice, searchParams]);

    // Update URL helper
    const updateUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        // Reset page to 1 when filters change
        if (!updates.hasOwnProperty('page')) {
            params.set('page', '1');
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

    // Handlers
    const toggleCategory = (categoryName: string) => {
        const newCategories = currentCategories.includes(categoryName)
            ? currentCategories.filter(c => c !== categoryName)
            : [...currentCategories, categoryName];

        updateUrl({ category: newCategories.length > 0 ? newCategories.join(',') : null });
    };

    const clearCategories = () => {
        updateUrl({ category: null });
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== currentSearch) {
                updateUrl({ search: searchTerm || null });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentSearch, updateUrl]);

    // Debounced price
    useEffect(() => {
        const timer = setTimeout(() => {
            if (priceRange[0] !== currentMinPrice || priceRange[1] !== currentMaxPrice) {
                const isMaxAtLimit = priceRange[1] === effectiveMaxPrice;
                updateUrl({
                    minPrice: priceRange[0] === MIN_PRICE_LIMIT ? null : priceRange[0].toString(),
                    maxPrice: isMaxAtLimit ? null : priceRange[1].toString()
                });
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [priceRange, currentMinPrice, currentMaxPrice, effectiveMaxPrice, updateUrl]);

    return (
        <div className="space-y-6">
            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    aria-label="Tìm kiếm sản phẩm"
                    placeholder="Tìm kiếm sản phẩm..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Categories */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-gray-900 text-lg">Danh mục</h2>
                    {currentCategories.length > 0 && (
                        <button
                            onClick={clearCategories}
                            className="text-xs text-red-500 hover:text-red-600 font-medium"
                        >
                            Xóa chọn
                        </button>
                    )}
                </div>

                <ul className="space-y-3">
                    {initialCategories.map((cat) => {
                        const isSelected = currentCategories.includes(cat.name);
                        return (
                            <li key={cat.name}>
                                <button
                                    onClick={() => toggleCategory(cat.name)}
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
                    {initialCategories.length === 0 && (
                        <li className="text-gray-400 text-sm text-center py-2">Chưa có danh mục nào</li>
                    )}
                </ul>
            </div>

            {/* Price Filter */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h2 className="font-bold text-gray-900 mb-6 text-lg">Khoảng giá</h2>

                <div className="mb-6">
                    <DualRangeSlider
                        min={MIN_PRICE_LIMIT}
                        max={effectiveMaxPrice}
                        step={PRICE_STEP}
                        value={priceRange}
                        onChange={setPriceRange}
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

            {/* Promotion Banner - Desktop only */}
            <div className="hidden lg:block">
                <PromoBanner />
            </div>
        </div>
    );
}
