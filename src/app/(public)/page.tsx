"use client";

import React, { useEffect, useState } from 'react';
import { ArrowRight, Star, ShoppingCart, Calendar, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getImageUrl } from '@/shared/utils';
import ProductCard from '@/components/products/ProductCard';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function Home() {
    const [blogPosts, setBlogPosts] = useState<any[]>([]);
    const [homeCategories, setHomeCategories] = useState<any[]>([]);
    const [categoryProducts, setCategoryProducts] = useState<Record<string, any[]>>({});

    // Dynamic Hero Settings
    const [hero, setHero] = useState({
        title: "Mang hương vị thiên nhiên \n về ngôi nhà bạn",
        subtitle: "Chúng tôi kết nối trực tiếp với các nông trại đạt chuẩn VietGAP để mang đến những sản phẩm tươi ngon nhất mỗi ngày.",
        image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2938&auto=format&fit=crop",
        buttonText: "Mua ngay",
        buttonLink: "/san-pham",
        showButton: true
    });

    useEffect(() => {
        async function loadData() {
            // Fetch Settings for Hero
            try {
                const settingsRes = await fetch(`${BACKEND_URL}/api/settings`);
                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    if (data.appearance?.hero) {
                        const settings = data.appearance.hero;
                        let availableItems: any[] = [];
                        if (Array.isArray(settings.items)) {
                            availableItems = settings.items.filter((i: any) => i.active);
                        }

                        if (availableItems.length > 0) {
                            if (settings.mode === 'random') {
                                const randomIndex = Math.floor(Math.random() * availableItems.length);
                                setHero(prev => ({ ...prev, ...availableItems[randomIndex] }));
                            } else {
                                setHero(prev => ({ ...prev, ...availableItems[0] }));
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }

            // Fetch latest 3 blog posts
            fetch(`${BACKEND_URL}/api/blog?limit=3`)
                .then(res => res.json())
                .then(data => setBlogPosts(Array.isArray(data) ? data : []))
                .catch(err => console.error("Failed to fetch blog posts", err));

            // Fetch Categories
            try {
                const catRes = await fetch(`${BACKEND_URL}/api/products/categories`);
                const catData = await catRes.json();

                if (Array.isArray(catData)) {
                    // Take top 4 categories with products
                    const topCategories = catData
                        .filter((c: any) => c.count > 0)
                        .slice(0, 4)
                        .map((c: any) => ({
                            title: c.name,
                            filter: c.name,
                            link: `/san-pham?category=${encodeURIComponent(c.name)}`
                        }));

                    setHomeCategories(topCategories);

                    // Fetch products for each category
                    const productPromises = topCategories.map((cat: any) =>
                        fetch(`${BACKEND_URL}/api/products?limit=4&category=${encodeURIComponent(cat.filter)}`)
                            .then(r => r.json())
                            .then(d => ({ category: cat.filter, products: d.products || [] }))
                    );

                    const results = await Promise.all(productPromises);
                    const newCategoryProducts: Record<string, any[]> = {};
                    results.forEach((res: any) => {
                        newCategoryProducts[res.category] = res.products;
                    });
                    setCategoryProducts(newCategoryProducts);
                }
            } catch (err) {
                console.error("Failed to fetch categories/products", err);
            }
        }

        loadData();
    }, []);

    return (
        <div className="space-y-16 pb-16">
            {/* Hero Section */}
            <section className="relative bg-emerald-900 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center transition-all duration-1000"
                    style={{ backgroundImage: `url('${hero.image}')` }}
                ></div>
                <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
                    <div className="max-w-2xl text-white">
                        <span className="bg-emerald-500/20 text-emerald-100 text-sm font-semibold px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-sm border border-emerald-500/30">
                            Nông sản sạch 100% Organic
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight whitespace-pre-line">
                            {hero.title}
                        </h1>
                        <p className="text-xl text-emerald-100 mb-8 max-w-lg">
                            {hero.subtitle}
                        </p>
                        <div className="flex gap-4">
                            {hero.showButton && (
                                <Link href={hero.buttonLink || '/san-pham'} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-lg font-bold transition-all transform hover:translate-y-[-2px] shadow-lg shadow-emerald-900/20">
                                    {hero.buttonText}
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            )}
                            <Link href="/gioi-thieu" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-bold transition-all backdrop-blur-sm">
                                Tìm hiểu thêm
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="container mx-auto px-4 -mt-8 relative z-20">
                <div className="grid grid-cols-3 gap-2 md:gap-6">
                    <div className="bg-white p-3 md:p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left h-full justify-center md:justify-start">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 rounded-full flex items-center justify-center text-lg md:text-2xl shrink-0">🌿</div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-xs md:text-base leading-tight">100% Tự nhiên</h3>
                            <p className="text-[10px] md:text-sm text-gray-500 hidden md:block">Chuẩn VietGAP an toàn</p>
                        </div>
                    </div>
                    <div className="bg-white p-3 md:p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left h-full justify-center md:justify-start">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg md:text-2xl shrink-0">🚛</div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-xs md:text-base leading-tight">Giao hàng 2H</h3>
                            <p className="text-[10px] md:text-sm text-gray-500 hidden md:block">Nội thành TP.HCM</p>
                        </div>
                    </div>
                    <div className="bg-white p-3 md:p-6 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left h-full justify-center md:justify-start">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center text-lg md:text-2xl shrink-0">🛡️</div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-xs md:text-base leading-tight">Đổi trả 1-1</h3>
                            <p className="text-[10px] md:text-sm text-gray-500 hidden md:block">Nếu không hài lòng</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Tin tức & Mẹo vặt</h2>
                            <p className="text-gray-500">Kiến thức nông nghiệp và sức khỏe cho gia đình bạn</p>
                        </div>
                        <Link href="/tin-tuc" className="hidden md:flex items-center text-emerald-600 font-semibold hover:text-emerald-700">
                            Xem tất cả bài viết <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {blogPosts.length > 0 ? (
                            blogPosts.map((post) => (
                                <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col group">
                                    <div className="aspect-[16/10] overflow-hidden">
                                        <img src={getImageUrl(post.image) || 'https://via.placeholder.com/400x250'} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-6 flex-grow flex flex-col">
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString('vi-VN')}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors cursor-pointer">
                                            <Link href={`/tin-tuc/${post.slug || post.id}`}>{post.title}</Link>
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                                            {post.excerpt}
                                        </p>
                                        <Link href={`/tin-tuc/${post.slug || post.id}`} className="inline-flex items-center text-emerald-600 font-semibold hover:text-emerald-700 text-sm mt-auto">
                                            Đọc chi tiết <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                </article>
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-8 text-gray-500">Đang tải tin tức...</div>
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
                                <Link href={cat.link} className="hidden md:flex items-center text-emerald-600 font-semibold hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full transition-colors">
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
                                <Link href={cat.link} className="inline-flex items-center text-emerald-600 font-semibold border border-emerald-200 px-6 py-2 rounded-full">
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
