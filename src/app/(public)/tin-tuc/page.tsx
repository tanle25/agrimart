"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, User, Search, ArrowRight, Tag, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { BlogPost, BlogCategory } from '@/shared/types';
import { AgriImage } from '@/components/ui/AgriImage';
import PromoBanner from '@/components/common/PromoBanner';

// Helper to construct image URL
const getImageUrl = (path: string) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    return `${BACKEND_URL}${path}`;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';



export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<string[]>(["Tất cả"]);
    const [isLoading, setIsLoading] = useState(true);

    // Initial fetch
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postsRes, catsRes] = await Promise.all([
                    fetch(`${BACKEND_URL}/api/blog`),
                    fetch(`${BACKEND_URL}/api/blog-categories`)
                ]);

                if (postsRes.ok) {
                    const data = await postsRes.json();
                    setPosts(data);
                }

                if (catsRes.ok) {
                    const data: BlogCategory[] = await catsRes.json();
                    setCategories(["Tất cả", ...data.map(c => c.name)]);
                }
            } catch (error) {
                console.error("Failed to fetch blog data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const featuredPost = posts.find(p => p.featured) || posts[0];
    const initialOtherPosts = featuredPost ? posts.filter(p => p.id !== featuredPost.id) : [];

    const [visibleCount, setVisibleCount] = useState(6);
    const visiblePosts = initialOtherPosts.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-16">
            {/* Header */}
            <div className="bg-emerald-900 py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Góc chia sẻ</h1>
                    <p className="text-emerald-100 max-w-2xl mx-auto text-lg">
                        Nơi cập nhật những kiến thức nông nghiệp bổ ích, mẹo vặt nhà bếp và các công thức nấu ăn ngon từ nông sản sạch.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Featured Post */}
                        {featuredPost && (
                            <div className="bg-white rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                                <div className="aspect-video overflow-hidden relative">
                                    <AgriImage
                                        src={getImageUrl(featuredPost.image)}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Nổi bật
                                    </div>
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {featuredPost.date}</span>
                                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {featuredPost.author || 'Admin'}</span>
                                        <span className="flex items-center gap-1 text-emerald-600 font-medium"><Tag className="w-4 h-4" /> {featuredPost.category?.name}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                                        <Link href={`/tin-tuc/${featuredPost.slug || featuredPost.id}`}>{featuredPost.title}</Link>
                                    </h2>
                                    <p className="text-gray-600 mb-6 line-clamp-3">
                                        {featuredPost.excerpt}
                                    </p>
                                    <Link href={`/tin-tuc/${featuredPost.slug || featuredPost.id}`} className="text-emerald-600 font-bold hover:text-emerald-700 inline-flex items-center gap-2">
                                        Đọc tiếp <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Grid Posts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {visiblePosts.map((post) => (
                                <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col group h-full">
                                    <div className="aspect-[3/2] overflow-hidden relative">
                                        <AgriImage
                                            src={getImageUrl(post.image)}
                                            alt={post.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                            <span className="text-white text-xs font-bold bg-emerald-600/90 px-2 py-1 rounded backdrop-blur-sm">
                                                {post.category?.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-5 flex-grow flex flex-col">
                                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                                            <span>{post.date}</span>
                                            <span>•</span>
                                            <span>{post.readTime || '3 min'} đọc</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors cursor-pointer">
                                            <Link href={`/tin-tuc/${post.slug || post.id}`}>{post.title}</Link>
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                                            {post.excerpt}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {visibleCount < initialOtherPosts.length && (
                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors text-gray-600"
                                >
                                    Xem thêm bài viết cũ hơn
                                </button>
                            </div>
                        )}

                        {!featuredPost && posts.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                Chưa có bài viết nào.
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-8">
                        {/* Search */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Tìm kiếm</h3>
                            <div className="relative">
                                <input type="text" placeholder="Tìm bài viết..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Chuyên mục</h3>
                            <ul className="space-y-2">
                                {categories.map((cat, idx) => (
                                    <li key={idx}>
                                        <button className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 group transition-colors">
                                            <span className="text-gray-600 group-hover:text-emerald-600">{cat}</span>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-400" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Promotion Banner */}
                        <PromoBanner />
                    </aside>

                </div>
            </div>
        </div>
    );
}
