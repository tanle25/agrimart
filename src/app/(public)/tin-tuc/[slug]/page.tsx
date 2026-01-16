import React from 'react';
import Link from 'next/link';
import { Calendar, User, Clock, ChevronRight, Facebook, Twitter, Linkedin, Search, MessageSquare } from 'lucide-react';
import PromoBanner from '@/components/common/PromoBanner';

// Use same BACKEND_URL as homepage or internal network URL if server-to-server
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

async function getBlogPost(slug: string) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/blog/${slug}`, {
            cache: 'no-store' // Ensure fresh data
        });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error("Failed to fetch blog post", e);
        return null;
    }
}

async function getRelatedPosts(excludeId: number) {
    try {
        // Fetch latest 4 and filter (simple limitation of current API)
        // Or better, update API to support related/exclude. For now, fetch latest 3.
        const res = await fetch(`${BACKEND_URL}/api/blog?limit=4`, { cache: 'no-store' });
        if (!res.ok) return [];
        const posts = await res.json();
        return Array.isArray(posts) ? posts.filter((p: any) => p.id !== excludeId).slice(0, 3) : [];
    } catch (e) {
        console.error("Failed to fetch related posts", e);
        return [];
    }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getBlogPost(slug);

    if (!post) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Bài viết không tồn tại</h2>
                    <p className="text-gray-500 mb-6">Có thể bài viết đã bị xóa hoặc đường dẫn không đúng.</p>
                    <Link href="/tin-tuc" className="inline-flex items-center text-emerald-600 hover:underline font-medium">
                        <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                        Quay lại trang tin tức
                    </Link>
                </div>
            </div>
        );
    }

    const relatedPosts = await getRelatedPosts(post.id);

    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            {/* Hero Section - Immersive Design */}
            <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
                <img
                    src={post.image || 'https://via.placeholder.com/1200x600'}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transform scale-105"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

                <div className="absolute inset-0 flex items-end pb-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl">
                            <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {post.category?.name || 'Tin tức'}
                                </span>
                                <span className="text-gray-300 text-sm flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> {new Date(post.date).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                {post.title}
                            </h1>
                            <div className="flex items-center gap-6 text-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wide">Tác giả</div>
                                        <div className="font-bold text-white leading-none">{post.author || 'AgriMart'}</div>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/20"></div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-emerald-400" />
                                    <span className="font-medium">{post.readTime || '5 phút'} đọc</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Main Content Area */}
                    <div className="lg:w-2/3">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-10">
                            <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <Link href="/tin-tuc" className="hover:text-emerald-600 transition-colors">Blog</Link>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            <span className="text-gray-900 font-medium truncate max-w-[200px]">{post.title}</span>
                        </nav>

                        {/* Article */}
                        <article className="prose prose-lg prose-emerald max-w-none text-gray-700 leading-relaxed">
                            <p className="text-xl md:text-2xl font-serif text-gray-600 leading-relaxed mb-10 border-l-4 border-emerald-500 pl-6 italic">
                                {post.excerpt}
                            </p>

                            <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
                        </article>

                        {/* Tags & Share */}
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex gap-2">
                                    <span className="text-gray-500 font-medium mr-2">Tags:</span>
                                    {post.mainKeyword && (
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer transition-colors">#{post.mainKeyword.replace(/\s+/g, '')}</span>
                                    )}
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer transition-colors">#NongSanSach</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-900 font-bold">Chia sẻ:</span>
                                    <button className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Facebook className="w-5 h-5" /></button>
                                    <button className="w-10 h-10 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><Twitter className="w-5 h-5" /></button>
                                    <button className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center hover:bg-indigo-700 hover:text-white transition-all"><Linkedin className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>

                        {/* Author Box */}
                        <div className="mt-12 bg-gray-50 rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                            <div className="w-20 h-20 rounded-full bg-emerald-200 overflow-hidden flex-shrink-0">
                                <img src={`https://ui-avatars.com/api/?name=${post.author || 'AgriMart'}&background=10b981&color=fff`} alt={post.author} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Về tác giả: {post.author || 'AgriMart'}</h4>
                                <p className="text-gray-600 text-sm mb-4">Chuyên gia hệ thống tại AgriMart. Luôn mong muốn mang đến những kiến thức bổ ích nhất cho cộng đồng.</p>
                                <button className="text-emerald-600 font-bold text-sm hover:underline">Xem thêm bài viết</button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-16">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-emerald-600" />
                                Bình luận (0)
                            </h3>
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <textarea
                                    className="w-full bg-white border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[120px] transition-all resize-none"
                                    placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                                ></textarea>
                                <div className="flex justify-end mt-4">
                                    <button className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                                        Gửi bình luận
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (Sticky) */}
                    <aside className="lg:w-1/3">
                        <div className="sticky top-24 space-y-10">
                            {/* Search Widget */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 text-lg">Tìm kiếm</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm bài viết..."
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent hover:bg-white hover:border-gray-200 focus:bg-white focus:border-emerald-500 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                    />
                                    <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            {/* Related Posts Widget */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-6 text-lg flex items-center justify-between">
                                    Bài viết liên quan
                                    <span className="w-12 h-1 bg-emerald-500 rounded-full"></span>
                                </h3>
                                <div className="space-y-6">
                                    {relatedPosts.map((p: any) => (
                                        <Link key={p.id} href={`/tin-tuc/${p.slug || p.id}`} className="flex gap-4 group items-start">
                                            <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden relative">
                                                <img src={p.image || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 block bg-emerald-50 w-fit px-2 py-0.5 rounded">{p.category?.name || 'Tin tức'}</span>
                                                <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug mb-2">
                                                    {p.title}
                                                </h4>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {new Date(p.date).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Newsletter Widget */}
                            {/* Promotion Banner */}
                            <PromoBanner />
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
