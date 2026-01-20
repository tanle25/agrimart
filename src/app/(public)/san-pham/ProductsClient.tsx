"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Filter,
    ChevronDown,
    Star,
    ShoppingCart,
    LayoutGrid,
    List as ListIcon,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowRight,
    Check,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Product } from '@/shared/types';
import { getImageUrl } from '@/shared/utils';
import ProductCard from '@/components/products/ProductCard';

const ProductFilters = dynamic(() => import('@/components/products/ProductFilters'), {
    loading: () => <div className="lg:w-1/4 h-[800px] bg-gray-100 rounded-xl animate-pulse hidden lg:block"></div>,
});

const MIN_PRICE_LIMIT = 0;
const PRICE_STEP = 1000;
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface CategoryCount {
    name: string;
    count: number;
}

interface ProductsClientProps {
    initialProducts: Product[];
    initialPagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    initialCategories: CategoryCount[];
    initialMaxPrice: number;
}

export default function ProductsClient({
    initialProducts,
    initialPagination,
    initialCategories,
    initialMaxPrice
}: ProductsClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [showMobileFilter, setShowMobileFilter] = useState(false);

    // Data States - Initialize with server data
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [categories, setCategories] = useState<CategoryCount[]>(initialCategories);
    const [isLoading, setIsLoading] = useState(false); // Start false because we have data

    // For max price logic
    // We'll trust initialMaxPrice from server for the slider limit initially
    const [maxPriceLimit, setMaxPriceLimit] = useState(initialMaxPrice > 0 ? Math.ceil(initialMaxPrice / 100000) * 100000 : 0);

    // Determine current filter state from URL
    const currentSearch = searchParams.get('search') || '';
    const currentCategories = searchParams.get('category') ? searchParams.get('category')!.split(',') : [];
    const currentSort = searchParams.get('sort') || 'newest';
    const currentMinPrice = Number(searchParams.get('minPrice')) || MIN_PRICE_LIMIT;
    const currentMaxPrice = Number(searchParams.get('maxPrice')) || maxPriceLimit;
    const currentPage = Number(searchParams.get('page')) || 1;

    const [priceRange, setPriceRange] = useState<[number, number]>([currentMinPrice, currentMaxPrice]);
    const [searchTerm, setSearchTerm] = useState(currentSearch);

    const [pagination, setPagination] = useState(initialPagination);

    // Use a ref to prevent double-fetching if props update or on strict mode mount
    // Not strictly necessary if we rely on searchParams changes, but good for safety.
    const isFirstRender = React.useRef(true);

    // Data States - Initialize with server data
    // We trust server data; no need to re-fetch on mount for LCP optimization.
    // If specific fields are missing, the UI will just handle empty states gracefully.

    // Sync local state when URL changes (e.g. back button)
    useEffect(() => {
        setSearchTerm(currentSearch);
        // Sync price range from URL or default if URL param missing (and not initial load)
        if (searchParams.get('minPrice') || searchParams.get('maxPrice')) {
            setPriceRange([currentMinPrice, currentMaxPrice]);
        } else if (!isFirstRender.current && maxPriceLimit > 0) {
            // Reset to defaults if params removed
            setPriceRange([MIN_PRICE_LIMIT, maxPriceLimit]);
        }
    }, [currentSearch, currentMinPrice, currentMaxPrice, searchParams, maxPriceLimit]);

    // Fetch Products
    useEffect(() => {
        // Skip fetch on first render because we have initialData
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        setIsLoading(true);
        const params = new URLSearchParams();
        params.set('page', currentPage.toString());
        params.set('limit', '12');
        if (currentSearch) params.set('search', currentSearch);
        if (currentCategories.length > 0) params.set('category', currentCategories.join(','));
        if (currentSort) params.set('sort', currentSort);
        if (currentMinPrice > MIN_PRICE_LIMIT) params.set('minPrice', currentMinPrice.toString());

        if (currentMaxPrice < maxPriceLimit && currentMaxPrice > 0) params.set('maxPrice', currentMaxPrice.toString());

        fetch(`${BACKEND_URL}/api/products?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setProducts(data.products || []);
                setPagination(data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 });
            })
            .catch(err => console.error("Failed to fetch products", err))
            .finally(() => setIsLoading(false));
    }, [currentPage, currentSearch, currentCategories.join(','), currentSort, currentMinPrice, currentMaxPrice]);

    // Update URL Helper
    const updateUrl = useCallback((updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null) {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });

        // Reset page to 1 when filters change (except when page itself changes)
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

    // Debounced Search Handler
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== currentSearch) {
                updateUrl({ search: searchTerm || null });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, currentSearch, updateUrl]);

    // Debounced Price Handler
    useEffect(() => {
        const timer = setTimeout(() => {
            if (priceRange[0] !== currentMinPrice || priceRange[1] !== currentMaxPrice) {
                // Determine if we should clear the params (if strictly equal to limits)
                // Actually, if dynamic load changes limits, we might want to be careful.
                // Safest: if val == default min or val == maxPriceLimit (dynamic), avoid sending?
                // Actually, if maxPriceLimit matches, it implies "no upper bound filter".

                const isMaxAtLimit = priceRange[1] === maxPriceLimit;

                updateUrl({
                    minPrice: priceRange[0] === MIN_PRICE_LIMIT ? null : priceRange[0].toString(),
                    maxPrice: isMaxAtLimit ? null : priceRange[1].toString()
                });
            }
        }, 800);
        return () => clearTimeout(timer);
    }, [priceRange, currentMinPrice, currentMaxPrice, maxPriceLimit, updateUrl]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, index: 0 | 1) => {
        const val = parseInt(e.target.value);
        const newRange: [number, number] = [...priceRange];
        if (index === 0) {
            newRange[0] = Math.min(val, priceRange[1] - PRICE_STEP);
        } else {
            newRange[1] = Math.max(val, priceRange[0] + PRICE_STEP);
        }
        setPriceRange(newRange);
    };

    const minPercent = Math.min(100, Math.max(0, ((priceRange[0] - MIN_PRICE_LIMIT) / (maxPriceLimit - MIN_PRICE_LIMIT)) * 100));
    const maxPercent = Math.min(100, Math.max(0, ((priceRange[1] - MIN_PRICE_LIMIT) / (maxPriceLimit - MIN_PRICE_LIMIT)) * 100));

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <style>{`
        input[type=range]::-webkit-slider-thumb {
          pointer-events: all;
          width: 20px;
          height: 20px;
          -webkit-appearance: none;
          background-color: #ffffff;
          border: 2px solid #10b981;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        input[type=range]::-moz-range-thumb {
          pointer-events: all;
          width: 20px;
          height: 20px;
          background-color: #ffffff;
          border: 2px solid #10b981;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>

            {/* Header Banner */}
            <div className="bg-emerald-900 py-12 mb-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Cửa hàng</h1>
                    <div className="flex items-center gap-2 text-emerald-200 text-sm">
                        <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-white">Sản phẩm</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <ProductFilters
                        showMobileFilter={showMobileFilter}
                        onCloseMobileFilter={() => setShowMobileFilter(false)}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        categories={categories}
                        currentCategories={currentCategories}
                        onToggleCategory={toggleCategory}
                        onClearCategory={() => updateUrl({ category: null })}
                        priceRange={priceRange}
                        maxPriceLimit={maxPriceLimit}
                        onPriceChange={handlePriceChange}
                    />

                    {/* Main Content */}
                    <div className="lg:w-3/4">
                        {/* Toolbar */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setShowMobileFilter(true)}
                                    className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                                >
                                    <Filter className="w-4 h-4" /> Bộ lọc
                                </button>
                                <div className="flex items-center gap-2">
                                    {currentCategories.length > 0 && (
                                        <div className="hidden sm:flex flex-wrap gap-2">
                                            {currentCategories.map(cat => (
                                                <span key={cat} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                    {cat} <button onClick={() => toggleCategory(cat)} aria-label={`Xóa danh mục ${cat}`}><X className="w-3 h-3" /></button>
                                                </span>
                                            ))}
                                            {currentCategories.length > 1 && (
                                                <button onClick={() => updateUrl({ category: null })} className="text-xs text-red-500 hover:text-red-600 font-medium underline">
                                                    Xóa tất cả
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-gray-500 text-sm">Hiển thị <span className="font-bold text-gray-900">{pagination.total}</span> kết quả</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500 hidden sm:inline">Sắp xếp theo:</span>
                                <div className="relative">
                                    <select
                                        value={currentSort}
                                        aria-label="Sắp xếp sản phẩm"
                                        onChange={(e) => updateUrl({ sort: e.target.value })}
                                        className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                                    >
                                        <option value="newest">Mới nhất</option>
                                        <option value="price_asc">Giá tăng dần</option>
                                        <option value="price_desc">Giá giảm dần</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                                <div className="hidden sm:flex border border-gray-200 rounded-lg overflow-hidden ml-2">
                                    <button className="p-2 bg-emerald-50 text-emerald-600" aria-label="Xem dạng lưới"><LayoutGrid className="w-4 h-4" /></button>
                                    <button className="p-2 bg-white text-gray-400 hover:text-gray-600" aria-label="Xem dạng danh sách"><ListIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="relative min-h-[80vh]">
                            {/* Loading Overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-start justify-center pt-20 transition-all duration-300">
                                    <div className="flex flex-col items-center gap-4 text-emerald-600 bg-white p-4 rounded-xl shadow-lg border border-emerald-100">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <span className="text-sm font-medium">Đang tải...</span>
                                    </div>
                                </div>
                            )}

                            {products.length > 0 ? (
                                <div className={`grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 md:gap-6 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                                    {products.map((product, index) => (
                                        <div key={product.id} className="h-full">
                                            <ProductCard product={product} priority={index < 6} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !isLoading && (
                                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                                        <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm nào</h3>
                                        <p className="text-gray-500">Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.</p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Pagination */}
                        {!isLoading && products.length > 0 && pagination.totalPages > 1 && (
                            <div className="mt-12 flex justify-center">
                                <nav className="flex items-center gap-2">
                                    <button
                                        disabled={pagination.page <= 1}
                                        onClick={() => updateUrl({ page: (pagination.page - 1).toString() })}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Trang trước"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>

                                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                        // Simple Logic for pagination display, can be improved for many pages
                                        let pageNum = i + 1;
                                        if (pagination.totalPages > 5 && pagination.page > 3) {
                                            pageNum = pagination.page - 2 + i;
                                        }
                                        if (pageNum > pagination.totalPages) return null;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => updateUrl({ page: pageNum.toString() })}
                                                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium shadow-sm transition-all ${pagination.page === pageNum
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600'
                                                    }`}
                                                aria-label={`Trang ${pageNum}`}
                                                aria-current={pagination.page === pageNum ? 'page' : undefined}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    })}

                                    <button
                                        disabled={pagination.page >= pagination.totalPages}
                                        onClick={() => updateUrl({ page: (pagination.page + 1).toString() })}
                                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Trang sau"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

