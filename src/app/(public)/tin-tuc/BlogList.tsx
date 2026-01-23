// src/app/(public)/tin-tuc/BlogList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, User, Search, ArrowRight, Tag, Loader2, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { BlogPost, BlogCategory } from '@/shared/types';
import { AgriImage } from '@/components/ui/AgriImage';
import BlogFilters from './BlogFilters';
import PromoBanner from '@/components/common/PromoBanner';
import { Drawer } from 'vaul';
import ArticleCard from '@/components/blog/ArticleCard';

// Helper to construct image URL
const getImageUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001';
    return `${BACKEND_URL}${path}`;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001';

interface BlogListProps {
    initialPosts?: BlogPost[];
    initialCategories?: string[];
}

export default function BlogList({ initialPosts = [], initialCategories = ["Tất cả"] }: BlogListProps) {
    const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
    const [categories, setCategories] = useState<string[]>(initialCategories);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const POSTS_PER_PAGE = 7;

    // Fetch categories only once if needed
    useEffect(() => {
        if (categories.length === 1 && categories[0] === "Tất cả" && initialCategories.length > 1) {
            setCategories(initialCategories);
        }
    }, [initialCategories]);

    // Fetch posts when page or filters change
    useEffect(() => {
        // Skip first fetch if we have initial data AND no filters are active
        if (page === 1 && !searchTerm && selectedCategories.length === 0) {
            if (posts.length === 0 && initialPosts.length > 0) {
                setPosts(initialPosts);
            }
            return;
        }

        const fetchPosts = async () => {
            if (page === 1) setIsLoading(true);
            else setIsLoadingMore(true);

            try {
                // Build Query
                const params = new URLSearchParams();
                params.set('page', page.toString());
                params.set('limit', POSTS_PER_PAGE.toString());
                if (searchTerm) params.set('search', searchTerm);

                // Join categories with comma
                const activeCats = selectedCategories.filter(c => c !== "Tất cả");
                if (activeCats.length > 0) {
                    params.set('category', activeCats.join(','));
                }

                const res = await fetch(`${BACKEND_URL}/api/blog?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    const newItems = Array.isArray(data) ? data : data.items;
                    const total = Array.isArray(data) ? data.length : data.total;

                    setPosts(prev => page === 1 ? newItems : [...prev, ...newItems]);

                    if (Array.isArray(data)) {
                        setHasMore(false);
                    } else {
                        setHasMore((page * POSTS_PER_PAGE) < total);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch posts", error);
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        };

        const timer = setTimeout(() => {
            fetchPosts();
        }, 300);

        return () => clearTimeout(timer);
    }, [page, searchTerm, selectedCategories]);

    // Handle Filter Changes
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        setPage(1); // Reset to page 1
    };

    const handleToggleCategory = (cat: string) => {
        setPage(1); // Reset pagination

        if (cat === "Tất cả") {
            setSelectedCategories([]);
            return;
        }

        setSelectedCategories(prev => {
            if (prev.includes(cat)) {
                return prev.filter(c => c !== cat);
            } else {
                return [...prev, cat];
            }
        });
    };

    // Logic for Featured Post: Only show if NO filters active and on Page 1
    const isFiltering = !!searchTerm || selectedCategories.length > 0;
    const showFeatured = !isFiltering && page === 1 && posts.length > 0;

    const featuredPost = showFeatured ? (posts.find(p => p.featured) || posts[0]) : null;
    const gridPosts = featuredPost ? posts.filter(p => p.id !== featuredPost.id) : posts;

    const handleLoadMore = () => {
        if (!isLoadingMore && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-16">
            {/* Header */}
            <div className="bg-emerald-900 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Góc chia sẻ</h1>
                    <p className="text-emerald-100 max-w-2xl mx-auto text-lg">
                        Nơi cập nhật những kiến thức nông nghiệp bổ ích, mẹo vặt nhà bếp và các công thức nấu ăn ngon từ nông sản sạch tại AgriMart.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Loading State for Filter Change */}
                        {isLoading && page === 1 ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                            </div>
                        ) : (
                            <>
                                {/* Featured Post */}
                                {featuredPost && (
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                                        <div className="aspect-video overflow-hidden relative">
                                            <AgriImage
                                                src={getImageUrl(featuredPost.image)}
                                                alt={featuredPost.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                priority={true}
                                                fetchPriority="high"
                                            />
                                            <div className="absolute top-4 left-4 bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                Nổi bật
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {featuredPost.date}</span>
                                                <span className="flex items-center gap-1"><User className="w-4 h-4" /> {featuredPost.author || 'Admin'}</span>
                                                <span className="flex items-center gap-1 text-emerald-700 font-medium"><Tag className="w-4 h-4" /> {featuredPost.category?.name}</span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-700 transition-colors">
                                                <Link href={`/tin-tuc/${featuredPost.slug || featuredPost.id}`}>{featuredPost.title}</Link>
                                            </h2>
                                            <p className="text-gray-600 mb-6 line-clamp-3">
                                                {featuredPost.excerpt}
                                            </p>
                                            <Link href={`/tin-tuc/${featuredPost.slug || featuredPost.id}`} className="text-emerald-700 font-bold hover:text-emerald-800 inline-flex items-center gap-2">
                                                Đọc tiếp <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Filter Status (Mobile/Desktop feedback) */}
                                {isFiltering && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm border border-emerald-100 flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                                            <span>Đang lọc:</span>
                                            {selectedCategories.map(cat => (
                                                <span key={cat} className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{cat}</span>
                                            ))}
                                            {searchTerm && <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">"{searchTerm}"</span>}
                                        </div>
                                        <button
                                            onClick={() => { setSearchTerm(''); setSelectedCategories([]); }}
                                            className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 ml-auto"
                                        >
                                            <X className="w-3 h-3" /> Xóa lọc
                                        </button>
                                    </div>
                                )}

                                {/* Grid Posts */}
                                {gridPosts.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {gridPosts.map((post) => (
                                            <ArticleCard key={post.id} post={post} getImageUrl={getImageUrl} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                                        <p className="text-gray-500 text-lg">Không tìm thấy bài viết nào phù hợp.</p>
                                        <button
                                            onClick={() => { setSearchTerm(''); setSelectedCategories([]); }}
                                            className="mt-4 text-emerald-600 font-medium hover:underline"
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    </div>
                                )}

                                {/* Pagination */}
                                {hasMore && gridPosts.length > 0 && (
                                    <div className="flex justify-center pt-8">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={isLoadingMore}
                                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors text-gray-600 disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                                            {isLoadingMore ? 'Đang tải...' : 'Xem thêm bài viết cũ hơn'}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar Desktop */}
                    <aside className="hidden lg:block space-y-8">
                        <BlogFilters
                            categories={categories}
                            selectedCategories={selectedCategories}
                            onToggleCategory={handleToggleCategory}
                            onSearch={handleSearch}
                            currentSearchTerm={searchTerm}
                        />
                        <PromoBanner />
                    </aside>

                    {/* Mobile Drawer */}
                    <div className="lg:hidden">
                        <Drawer.Root>
                            <Drawer.Trigger asChild>
                                <button
                                    aria-label="Mở bộ lọc tìm kiếm"
                                    className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-transform active:scale-95 flex items-center justify-center"
                                >
                                    <SlidersHorizontal className="w-6 h-6" />
                                </button>
                            </Drawer.Trigger>
                            <Drawer.Portal>
                                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
                                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-gray-100 rounded-t-[20px] max-h-[85vh] flex flex-col outline-none">
                                    <div className="px-4 pt-3 pb-2 bg-white rounded-t-[20px] border-b border-gray-100">
                                        <div className="bg-gray-300 w-10 h-1 rounded-full mx-auto mb-3" />
                                        <div className="flex justify-between items-center">
                                            <Drawer.Title className="text-base font-bold text-gray-900">Bộ lọc & Tìm kiếm</Drawer.Title>
                                            <Drawer.Close asChild>
                                                <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                                                    <X className="w-4 h-4 text-gray-600" />
                                                </button>
                                            </Drawer.Close>
                                        </div>
                                    </div>
                                    <div className="p-4 overflow-y-auto flex-1">
                                        <BlogFilters
                                            categories={categories}
                                            selectedCategories={selectedCategories}
                                            onToggleCategory={handleToggleCategory}
                                            onSearch={handleSearch}
                                            currentSearchTerm={searchTerm}
                                        />
                                    </div>
                                    {/* Action Bar inside Drawer */}
                                    <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
                                        <Drawer.Close asChild>
                                            <button className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl shadow-lg shadow-emerald-200">
                                                Xem {posts.length} kết quả
                                            </button>
                                        </Drawer.Close>
                                    </div>
                                </Drawer.Content>
                            </Drawer.Portal>
                        </Drawer.Root>
                    </div>

                </div>
            </div>
        </div>
    );
}
