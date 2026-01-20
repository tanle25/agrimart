import React from 'react';
import { ArrowRight, Star, ShoppingCart, Calendar, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/shared/utils';
import ProductCard from '@/components/products/ProductCard';
import { AgriImage } from '@/components/ui/AgriImage';
import OptimizedHero from '@/components/home/OptimizedHero';
import { getGlobalSettings } from '@/lib/settings';

// Server actions/fetchers
async function getCategories() {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
        const res = await fetch(`${backendUrl}/api/products/categories`, { next: { revalidate: 300 } });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch categories', e);
        return [];
    }
}

async function getProductsByCategory(category: string, limit: number = 4) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
        const res = await fetch(`${backendUrl}/api/products?limit=${limit}&category=${encodeURIComponent(category)}`, { next: { revalidate: 60 } });
        if (!res.ok) return { products: [] };
        return await res.json();
    } catch (e) {
        console.error(`Failed to fetch products for ${category}`, e);
        return { products: [] };
    }
}

async function getBlogPosts(limit: number = 3) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';
        const res = await fetch(`${backendUrl}/api/blog?limit=${limit}`, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error('Failed to fetch blog posts', e);
        return [];
    }
}

export default async function Home() {
    // Parallel fetching for performance
    const settingsPromise = getGlobalSettings();
    const categoriesPromise = getCategories();
    const blogPostsPromise = getBlogPosts();

    const [settings, categoriesData, blogPosts] = await Promise.all([
        settingsPromise,
        categoriesPromise,
        blogPostsPromise
    ]);

    // Process Hero Settings
    let hero = {
        title: "Mang hương vị thiên nhiên \n về ngôi nhà bạn",
        subtitle: "Chúng tôi kết nối trực tiếp với các nông trại đạt chuẩn VietGAP để mang đến những sản phẩm tươi ngon nhất mỗi ngày.",
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2938&auto=format&fit=crop",
        buttonText: "Mua ngay",
        buttonLink: "/san-pham",
        showButton: true
    };

    if (settings.appearance?.hero) {
        const heroSettings = settings.appearance.hero;
        let availableItems: any[] = [];
        if (Array.isArray(heroSettings.items)) {
            availableItems = heroSettings.items.filter((i: any) => i.active);
        }

        if (availableItems.length > 0) {
            // Server-side random might mismatch with client hydration if we aren't careful, 
            // but for a Server Component it's fine as it sends HTML.
            // However, to keep it consistent cache-wise, we might want to pick the first one 
            // OR accept that random is determined at render time.
            if (heroSettings.mode === 'random') {
                const randomIndex = Math.floor(Math.random() * availableItems.length);
                hero = { ...hero, ...availableItems[randomIndex] };
            } else {
                hero = { ...hero, ...availableItems[0] };
            }
        }
    }

    // Process Categories (Top 4)
    let homeCategories: any[] = [];
    let categoryProducts: Record<string, any[]> = {};

    if (Array.isArray(categoriesData)) {
        homeCategories = categoriesData
            .filter((c: any) => c.count > 0)
            .slice(0, 4)
            .map((c: any) => ({
                title: c.name,
                filter: c.name,
                link: `/san-pham?category=${encodeURIComponent(c.name)}`
            }));

        // Fetch products for these categories in parallel
        const productsPromises = homeCategories.map(cat =>
            getProductsByCategory(cat.filter).then(data => ({ category: cat.filter, products: data.products }))
        );

        try {
            const results = await Promise.all(productsPromises);
            results.forEach(res => {
                categoryProducts[res.category] = res.products || [];
            });
        } catch (e) {
            console.error('Failed to fetch category products', e);
        }
    }

    return (
        <div className="pb-16">
            {/* Optimized Hero Section */}
            <OptimizedHero
                title={hero.title}
                subtitle={hero.subtitle}
                image={hero.image}
                buttonText={hero.buttonText}
                buttonLink={hero.buttonLink}
                showButton={hero.showButton}
            />

            {/* Features Grid */}
            <section className="container mx-auto px-4 -mt-8 relative z-20">
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                    <div className="bg-white p-3 md:p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center md:flex-row md:text-left gap-2 md:gap-4 h-full">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-emerald-50 rounded-full flex items-center justify-center text-xl md:text-2xl shrink-0 text-emerald-600">
                            🌿
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-xs md:text-lg leading-tight mb-0.5">100% Tự nhiên</h2>
                            <p className="text-[10px] md:text-sm text-gray-500 hidden md:block">Chuẩn VietGAP</p>
                        </div>
                    </div>
                    <div className="bg-white p-3 md:p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center md:flex-row md:text-left gap-2 md:gap-4 h-full">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-50 rounded-full flex items-center justify-center text-xl md:text-2xl shrink-0 text-blue-600">
                            🚛
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-xs md:text-lg leading-tight mb-0.5">Giao hàng 2H</h2>
                            <p className="text-[10px] md:text-sm text-gray-500 hidden md:block">Nội thành TP.HCM</p>
                        </div>
                    </div>
                    <div className="bg-white p-3 md:p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col items-center justify-center text-center md:flex-row md:text-left gap-2 md:gap-4 h-full">
                        <div className="w-10 h-10 md:w-14 md:h-14 bg-amber-50 rounded-full flex items-center justify-center text-xl md:text-2xl shrink-0 text-amber-600">
                            🛡️
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-xs md:text-lg leading-tight mb-0.5">Đổi trả 1-1</h2>
                            <p className="text-[10px] md:text-sm text-gray-500 hidden md:block">Bảo hành uy tín</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section className="bg-gray-50 py-10 md:py-16 mt-10 md:mt-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-6 md:mb-10">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Tin tức & Mẹo vặt</h2>
                            <p className="text-sm md:text-base text-gray-500">Kiến thức nông nghiệp và sức khỏe</p>
                        </div>
                        <Link href="/tin-tuc" className="hidden md:flex items-center text-emerald-700 font-semibold hover:text-emerald-800">
                            Xem tất cả bài viết <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {Array.isArray(blogPosts) && blogPosts.length > 0 ? (
                            blogPosts.map((post: any) => (
                                <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col group">
                                    <div className="aspect-[16/10] overflow-hidden">
                                        <AgriImage
                                            src={getImageUrl(post.image) || 'https://via.placeholder.com/400x250'}
                                            alt={post.title}
                                            aspectRatio="16/10"
                                            className="group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4 md:p-6 flex-grow flex flex-col">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString('vi-VN')}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                                        </div>
                                        <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 md:mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors cursor-pointer">
                                            <Link href={`/tin-tuc/${post.slug || post.id}`}>{post.title}</Link>
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                                            {post.excerpt}
                                        </p>
                                        <Link href={`/tin-tuc/${post.slug || post.id}`} className="inline-flex items-center text-emerald-700 font-semibold hover:text-emerald-800 text-xs md:text-sm mt-auto">
                                            Đọc chi tiết <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                                        </Link>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-8 text-gray-500">Chưa có tin tức nào.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Product Categories Sections */}
            <div className="container mx-auto px-4 space-y-16">
                {homeCategories.map((cat, index) => {
                    const products = categoryProducts[cat.filter] || [];

                    if (products.length === 0) return null;

                    return (
                        <section key={index}>
                            <div className="flex justify-between items-end mb-8 border-b border-gray-100 pb-4">
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                        <span className="w-2 h-8 bg-emerald-500 rounded-full block"></span>
                                        {cat.title}
                                    </h2>
                                </div>
                                <Link href={cat.link} className="hidden md:flex items-center text-emerald-700 font-semibold hover:text-emerald-800 bg-emerald-50 px-4 py-2 rounded-full transition-colors">
                                    Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                                {products.map((product: any) => (
                                    <div key={product.id} className="h-full">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 text-center md:hidden">
                                <Link href={cat.link} className="inline-flex items-center text-emerald-700 font-semibold border border-emerald-200 px-6 py-2 rounded-full hover:bg-emerald-50">
                                    Xem thêm {cat.title} <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
};
