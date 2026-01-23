import React from 'react';
import Link from 'next/link';
import { Calendar, User, Clock, ChevronRight, Facebook, Twitter, Linkedin, Search, MessageSquare } from 'lucide-react';
import PromoBanner from '@/components/common/PromoBanner';
import { AgriImage } from '@/components/ui/AgriImage';
import { getImageUrl } from '@/shared/utils';

// Use same BACKEND_URL as homepage or internal network URL if server-to-server
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

// Safe date formatter
function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Chưa cập nhật';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Chưa cập nhật';
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
        return 'Chưa cập nhật';
    }
}

async function getBlogPost(slug: string) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/blog/${slug}`, {
            next: { revalidate: 60 } // Cache for 60 seconds, enable BFCache
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
        const res = await fetch(`${BACKEND_URL}/api/blog?limit=4`, { next: { revalidate: 300 } });
        if (!res.ok) return [];
        const data = await res.json();
        // API returns { items, total } when limit is provided
        const posts = Array.isArray(data) ? data : (data.items || []);
        return posts.filter((p: any) => p.id !== excludeId).slice(0, 3);
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

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.image ? [
            post.image.startsWith('http') ? post.image : `${BACKEND_URL}/api/media/${post.image}`
        ] : [],
        datePublished: post.date,
        dateModified: post.date, // Should be updated date if available
        author: [{
            '@type': 'Person',
            name: post.author || 'AgriMart',
            url: 'https://agrimart.vn'
        }]
    };

    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Hero Section - Immersive Design */}
            <div className="relative h-[50vh] md:h-[60vh] min-h-[350px] md:min-h-[500px] w-full overflow-hidden">
                <AgriImage
                    src={getImageUrl(post.image) || 'https://via.placeholder.com/1200x600'}
                    alt={post.title}
                    aspectRatio="16/9"
                    priority={true}
                    fetchPriority="high"
                    className="w-full h-full"
                    objectFit="cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>

                <div className="absolute inset-0 flex items-end pb-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-4xl">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <span className="bg-emerald-500 text-white text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    {post.category?.name || 'Tin tức'}
                                </span>
                                <span className="text-gray-300 text-xs md:text-sm flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> {formatDate(post.date)}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
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
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

                    {/* Main Content Area */}
                    <div className="lg:w-2/3">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-gray-500 mb-6 md:mb-10 overflow-x-auto whitespace-nowrap pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                            <Link href="/" className="hover:text-emerald-600 transition-colors shrink-0">Trang chủ</Link>
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-300 shrink-0" />
                            <Link href="/tin-tuc" className="hover:text-emerald-600 transition-colors shrink-0">Blog</Link>
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-300 shrink-0" />
                            <span className="text-gray-900 font-medium truncate max-w-[120px] md:max-w-[200px]">{post.title}</span>
                        </nav>

                        {/* Article */}
                        <article className="prose prose-lg prose-emerald max-w-none text-gray-700 leading-relaxed">
                            <p className="text-xl md:text-2xl font-serif text-gray-600 leading-relaxed mb-10 border-l-4 border-emerald-500 pl-6 italic">
                                {post.excerpt}
                            </p>

                            <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
                        </article>

                        {/* Tags & Share */}
                        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-100">
                            <div className="flex flex-col gap-4 md:gap-6">
                                {/* Tags Row */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-gray-500 font-medium text-sm">Tags:</span>
                                    {post.mainKeyword && (
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs md:text-sm hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer transition-colors max-w-[150px] truncate">
                                            #{post.mainKeyword.replace(/\s+/g, '').slice(0, 20)}
                                        </span>
                                    )}
                                    <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full text-xs md:text-sm hover:bg-emerald-50 hover:text-emerald-600 cursor-pointer transition-colors">
                                        #NongSanSach
                                    </span>
                                </div>
                                {/* Share Row */}
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-900 font-bold text-sm">Chia sẻ:</span>
                                    <button aria-label="Chia sẻ lên Facebook" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Facebook className="w-4 h-4 md:w-5 md:h-5" /></button>
                                    <button aria-label="Chia sẻ lên Twitter" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-sky-100 text-sky-500 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-all"><Twitter className="w-4 h-4 md:w-5 md:h-5" /></button>
                                    <button aria-label="Chia sẻ lên LinkedIn" className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center hover:bg-indigo-700 hover:text-white transition-all"><Linkedin className="w-4 h-4 md:w-5 md:h-5" /></button>
                                </div>
                            </div>
                        </div>

                        {/* Author Box */}
                        <div className="mt-8 md:mt-12 bg-gray-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-emerald-200 overflow-hidden flex-shrink-0">
                                <img src={`https://ui-avatars.com/api/?name=${post.author || 'AgriMart'}&background=10b981&color=fff`} alt={post.author || 'Author'} width={80} height={80} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">Về tác giả: {post.author || 'AgriMart'}</h4>
                                <p className="text-gray-600 text-sm mb-4">Chuyên gia hệ thống tại AgriMart. Luôn mong muốn mang đến những kiến thức bổ ích nhất cho cộng đồng.</p>
                                <button className="text-emerald-600 font-bold text-sm hover:underline">Xem thêm bài viết</button>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar (Sticky) */}
                    <aside className="lg:w-1/3">
                        <div className="sticky top-24 space-y-10">

                            {/* Related Posts Widget */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-6 text-lg flex items-center justify-between">
                                    Bài viết liên quan
                                    <span className="w-12 h-1 bg-emerald-500 rounded-full"></span>
                                </h3>
                                <div className="space-y-6">
                                    {relatedPosts.map((p: any) => (
                                        <Link key={p.id} href={`/tin-tuc/${p.slug || p.id}`} className="flex gap-4 group items-start">
                                            <div className="w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-xl overflow-hidden relative">
                                                <AgriImage
                                                    src={getImageUrl(p.image) || 'https://via.placeholder.com/150'}
                                                    alt={p.title}
                                                    width={96}
                                                    height={96}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 block bg-emerald-50 w-fit px-2 py-0.5 rounded">{p.category?.name || 'Tin tức'}</span>
                                                <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug mb-2">
                                                    {p.title}
                                                </h4>
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" /> {formatDate(p.date)}
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

// Enable static generation with ISR
export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = 'force-static';
export const dynamicParams = true;

// Generate static params for recent posts
export async function generateStaticParams() {
    const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001').replace('localhost', '127.0.0.1');
    try {
        const res = await fetch(`${BACKEND_URL}/api/blog?limit=10`);
        if (!res.ok) return [];
        const data = await res.json();
        // API returns { items, total } or array depending on version, handle safe
        const posts = Array.isArray(data) ? data : (data.items || []);

        return posts.map((post: any) => ({
            slug: post.slug || post.id.toString()
        }));
    } catch (e) {
        return [];
    }
}
