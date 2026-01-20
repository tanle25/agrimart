// components/products/MobileFilterDrawer.tsx
'use client';

import { Drawer } from 'vaul';
import { SlidersHorizontal, X } from 'lucide-react';
import { FilterControls } from './FilterControls';

interface CategoryCount {
    name: string;
    count: number;
}

interface MobileFilterDrawerProps {
    categories: CategoryCount[];
    maxPrice: number;
}

/**
 * iOS-style Bottom Action Sheet cho mobile filter
 * 
 * Features:
 * - Swipe to dismiss
 * - Drag handle
 * - Spring animations (compositor-friendly)
 * - Touch-optimized
 */
export function MobileFilterDrawer({ categories, maxPrice }: MobileFilterDrawerProps) {
    return (
        <Drawer.Root>
            {/* Floating Trigger Button - Fixed ở bottom-right */}
            <Drawer.Trigger asChild>
                <button
                    className="fixed bottom-6 right-6 z-50 lg:hidden bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center"
                    aria-label="Mở bộ lọc"
                >
                    <SlidersHorizontal className="w-6 h-6" />
                    <span className="sr-only">Bộ lọc</span>
                </button>
            </Drawer.Trigger>

            {/* Portal - Render outside DOM hierarchy */}
            <Drawer.Portal>
                {/* Overlay - Semi-transparent backdrop with blur */}
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />

                {/* Drawer Content - Bottom sheet */}
                <Drawer.Content
                    className="fixed bottom-0 left-0 right-0 z-50 bg-gray-100 rounded-t-[20px] max-h-[90vh] flex flex-col outline-none"
                    style={{
                        transform: 'translate3d(0, 0, 0)',
                        willChange: 'transform',
                    }}
                >
                    {/* Drag Handle Area */}
                    <div className="bg-white rounded-t-[20px] pt-3 pb-3 flex justify-center border-b border-gray-100">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" aria-hidden="true" />
                    </div>

                    {/* Header - Sticky */}
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
                        <Drawer.Title className="text-lg font-bold text-gray-900">
                            Bộ lọc
                        </Drawer.Title>
                        <Drawer.Close asChild>
                            <button
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                aria-label="Đóng"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </Drawer.Close>
                    </div>

                    {/* Scrollable Filter Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 overscroll-contain space-y-4">
                        <FilterControls
                            initialCategories={categories}
                            initialMaxPrice={maxPrice}
                        />
                    </div>

                    {/* Footer Actions - Sticky bottom */}
                    <div className="p-4 bg-white border-t border-gray-100 pb-safe-bottom flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <Drawer.Close asChild>
                            <button className="flex-1 px-4 py-3.5 border border-gray-200 bg-gray-50 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 active:scale-[0.98] transition-all">
                                Đóng
                            </button>
                        </Drawer.Close>
                        <Drawer.Close asChild>
                            <button className="flex-1 px-4 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-emerald-200 shadow-lg">
                                Áp dụng
                            </button>
                        </Drawer.Close>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
