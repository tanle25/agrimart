"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/shared/types';
import {
    Star,
    Minus,
    Plus,
    ShoppingCart,
    Heart,
    Share2,
    Truck,
    ShieldCheck,
    RotateCcw,
    ChevronRight,
    ChevronLeft,
    Package,
    Loader2
} from 'lucide-react';
import { getImageUrl } from '@/shared/utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function ProductDetailClient({ slug }: { slug: string }) {
    const [product, setProduct] = useState<any>(null);
    const [activeImage, setActiveImage] = useState<string>(getImageUrl(product?.image || '') || '/placeholder.png');
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'shipping'>('desc');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const { addToCart } = useCart();
    const { success, error: toastError } = useToast();

    const handleAttributeSelect = (attributeName: string, value: string) => {
        if (!product) return;

        const newAttributes = { ...selectedAttributes, [attributeName]: value };
        setSelectedAttributes(newAttributes);

        // Find matching variant
        const variant = product.variants?.find((v: any) => {
            return Object.entries(v.attributes || {}).every(([key, val]) => newAttributes[key] === val);
        });

        if (variant) {
            setSelectedVariant(variant);
            if (variant.image) {
                setActiveImage(getImageUrl(variant.image));
            }
        }
    };

    useEffect(() => {
        setIsLoading(true);
        setError(false);
        fetch(`${BACKEND_URL}/api/products/${slug}`)
            .then(res => {
                if (!res.ok) throw new Error("Product not found");
                return res.json();
            })
            .then(data => {
                setProduct(data);
                // Prioritize main image, then first gallery image
                const rawInitialImage = data.image || ((data.images && data.images.length > 0) ? data.images[0] : '');
                setActiveImage(getImageUrl(rawInitialImage));

                if (data.type === 'variable' && data.variants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                    if (data.variants[0].attributes) {
                        setSelectedAttributes(data.variants[0].attributes);
                    }
                }

                // Fetch related products based on category
                if (data.category) {
                    fetch(`${BACKEND_URL}/api/products?limit=4&category=${encodeURIComponent(data.category)}`)
                        .then(res => res.json())
                        .then(relatedData => {
                            if (relatedData.products) {
                                setRelatedProducts(relatedData.products.filter((p: any) => p.id !== data.id));
                            }
                        })
                        .catch(err => console.error("Failed to load related products", err));
                }
            })
            .catch(err => {
                console.error(err);
                setError(true);
            })
            .finally(() => setIsLoading(false));
    }, [slug]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-emerald-600">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p>Đang tải chi tiết sản phẩm...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
                    <p className="text-gray-500 mb-6">Sản phẩm có thể đã bị xóa hoặc đường dẫn không tồn tại.</p>
                    <Link href="/san-pham" className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors">
                        Quay lại cửa hàng
                    </Link>
                </div>
            </div>
        );
    }

    // Calculate Display Price logic for variable products
    let displayPrice = product.price;
    let displayOldPrice = product.oldPrice;

    if (selectedVariant) {
        displayPrice = selectedVariant.salePrice > 0 ? selectedVariant.salePrice : selectedVariant.price;
        // Logic for old price on variant is loose, depends on schema. 
        // Assuming variant has no oldPrice explicit field in schema shown earlier, but checking 'price' vs 'salePrice'
        if (selectedVariant.salePrice > 0 && selectedVariant.price > selectedVariant.salePrice) {
            displayOldPrice = selectedVariant.price;
        } else {
            displayOldPrice = 0;
        }
    } else {
        displayPrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;
    }

    // Safe images array
    const productImages = (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : []);

    const handlePrevImage = () => {
        const currentIndex = productImages.findIndex((img: string) => getImageUrl(img) === activeImage);
        if (currentIndex === -1) return;
        const newIndex = currentIndex === 0 ? productImages.length - 1 : currentIndex - 1;
        setActiveImage(getImageUrl(productImages[newIndex]));
    };

    const handleNextImage = () => {
        const currentIndex = productImages.findIndex((img: string) => getImageUrl(img) === activeImage);
        if (currentIndex === -1) return;
        const newIndex = currentIndex === productImages.length - 1 ? 0 : currentIndex + 1;
        setActiveImage(getImageUrl(productImages[newIndex]));
    };

    const handleAddToCart = () => {
        if (!product) return;

        // If variable product, ensure variant is selected (though we auto-select)
        if (product.type === 'variable' && !selectedVariant) {
            toastError("Vui lòng chọn phân loại hàng");
            return;
        }

        addToCart(product, quantity, selectedVariant || undefined);
        success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    };

    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            {/* Breadcrumbs */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-4 text-sm text-gray-500 flex items-center gap-2">
                    <Link href="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <Link href="/san-pham" className="hover:text-emerald-600 transition-colors">Sản phẩm</Link>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">

                    {/* LEFT: Image Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 relative group">
                            <img
                                src={activeImage || '/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {(product.discount > 0 || (displayOldPrice > displayPrice)) && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-red-500/30">
                                    Giảm giá
                                </div>
                            )}

                            {/* Carousel Navigation Arrows */}
                            {productImages.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-emerald-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-emerald-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>

                        {productImages.length > 1 && (
                            <div className="relative group/thumbs">
                                {/* Thumbnails Carousel */}
                                <div className="flex gap-4 overflow-x-auto pb-0 scroll-smooth snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] p-2">
                                    {productImages.map((img: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImage(getImageUrl(img))}
                                            className={`
                                                flex-shrink-0 relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-500 ease-out snap-start
                                                ${activeImage === getImageUrl(img)
                                                    ? 'border-emerald-600 ring-2 ring-emerald-100 ring-offset-2 scale-105 shadow-xl opacity-100 z-10'
                                                    : 'border-transparent opacity-50 hover:opacity-100 hover:border-emerald-200 hover:scale-105 grayscale hover:grayscale-0'
                                                }
                                            `}
                                        >
                                            <img src={getImageUrl(img) || '/placeholder.png'} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-8 border-b border-gray-100 pb-8">
                            <div className="flex items-center gap-3 mb-4">
                                {product.category && (
                                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                                        {product.category}
                                    </span>
                                )}
                                <div className="flex items-center text-yellow-400 text-sm">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-gray-900 font-bold ml-1">{product.rating || 0}</span>
                                    <span className="text-gray-400 mx-1">·</span>
                                    <span className="text-gray-500 underline decoration-gray-300 underline-offset-2">{product.reviews || 0} Đánh giá</span>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>

                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-4xl font-bold text-emerald-600">{displayPrice.toLocaleString()}đ</span>
                                {(displayOldPrice || 0) > 0 && (
                                    <span className="text-xl text-gray-400 line-through font-medium mb-1">{displayOldPrice.toLocaleString()}đ</span>
                                )}
                            </div>

                            <div
                                className="text-gray-600 text-lg leading-relaxed prose prose-emerald"
                                dangerouslySetInnerHTML={{ __html: product.description || '' }} // Assuming simple description or HTML. If description is safe text, direct render is better.
                            />
                        </div>

                        {/* Selectors & Actions */}
                        <div className="space-y-8 mb-8">
                            {/* Variants */}
                            {/* Variants Selection */}
                            {product.type === 'variable' && product.attributes && product.attributes.length > 0 && product.variants && (
                                <div className="space-y-6">
                                    {product.attributes.map((attr: any, idx: number) => (
                                        <div key={idx}>
                                            <span className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">{attr.name}:</span>
                                            <div className="flex flex-wrap gap-3">
                                                {attr.values.map((value: string) => {
                                                    const isSelected = selectedAttributes[attr.name] === value;
                                                    const hasVisual = attr.isVisual && attr.valueImages?.[value];

                                                    return (
                                                        <button
                                                            key={value}
                                                            onClick={() => handleAttributeSelect(attr.name, value)}
                                                            className={`
                                                                relative rounded-xl border-2 transition-all duration-200
                                                                ${hasVisual
                                                                    ? (isSelected ? 'border-emerald-500 ring-2 ring-emerald-100 p-0.5' : 'border-gray-200 hover:border-emerald-200 p-0.5')
                                                                    : (isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold px-6 py-2.5' : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 font-medium px-6 py-2.5')
                                                                }
                                                            `}
                                                        >
                                                            {hasVisual ? (
                                                                <div className="w-16 h-16 rounded-lg overflow-hidden relative">
                                                                    <img
                                                                        src={getImageUrl(attr.valueImages[value])}
                                                                        alt={value}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    {isSelected && (
                                                                        <div className="absolute inset-0 bg-black/10 z-10"></div>
                                                                    )}
                                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-0.5 text-center truncate px-1">
                                                                        {value}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <span>{value}</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quantity & Add to Cart */}
                            <div className="flex flex-wrap md:flex-nowrap items-stretch gap-4">
                                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-2 w-32 md:w-auto">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 text-gray-500 hover:text-emerald-600 transition-colors"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        value={quantity}
                                        readOnly
                                        className="w-12 bg-transparent text-center text-gray-900 font-bold focus:outline-none"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-3 text-gray-500 hover:text-emerald-600 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>


                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    Thêm vào giỏ hàng
                                </button>

                                <button className="p-4 border-2 border-gray-100 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all">
                                    <Heart className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Policy Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                                    <Truck className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">Giao siêu tốc 2H</div>
                                    <div className="text-xs text-gray-500 mt-1">Nội thành TP.HCM</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">Chuẩn VietGAP</div>
                                    <div className="text-xs text-gray-500 mt-1">100% Organic</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                                <div className="bg-white p-2 rounded-lg shadow-sm text-amber-600">
                                    <RotateCcw className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">Đổi trả 24h</div>
                                    <div className="text-xs text-gray-500 mt-1">Nếu không hài lòng</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                                <div className="bg-white p-2 rounded-lg shadow-sm text-purple-600">
                                    <Share2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">Hỗ trợ 24/7</div>
                                    <div className="text-xs text-gray-500 mt-1">Hotline miễn phí</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-20">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Tab Headers */}
                        <div className="w-full md:w-64 flex-shrink-0 flex md:flex-col gap-2 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4">
                            <button
                                onClick={() => setActiveTab('desc')}
                                className={`text-left px-4 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'desc' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                Mô tả sản phẩm
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`text-left px-4 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'reviews' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                Đánh giá ({product.reviews || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('shipping')}
                                className={`text-left px-4 py-3 rounded-lg font-bold text-sm transition-all ${activeTab === 'shipping' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                Chính sách giao hàng
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 bg-gray-50 rounded-2xl p-8 min-h-[300px]">
                            {activeTab === 'desc' && (
                                <div className="prose prose-emerald max-w-none animate-in fade-in slide-in-from-left-2 duration-300">
                                    <h3 className="text-gray-900 font-bold mb-4">Chi tiết về {product.name}</h3>
                                    <div dangerouslySetInnerHTML={{ __html: product.content || product.description || 'Đang cập nhật...' }} />
                                </div>
                            )}
                            {activeTab === 'reviews' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <h3 className="text-gray-900 font-bold mb-6">Đánh giá từ khách hàng</h3>
                                    {/* Mock Reviews for now, unless API provides reviews */}
                                    <p className="text-gray-500 italic">Chưa có đánh giá nào.</p>
                                </div>
                            )}
                            {activeTab === 'shipping' && (
                                <div className="prose prose-emerald max-w-none animate-in fade-in slide-in-from-left-2 duration-300">
                                    <h3 className="text-gray-900 font-bold mb-4">Thông tin giao hàng</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex items-center gap-3 mb-3 text-emerald-600">
                                                <Truck className="w-6 h-6" />
                                                <h4 className="font-bold m-0">Nội thành TP.HCM</h4>
                                            </div>
                                            <ul className="text-sm text-gray-600 space-y-2 mb-0">
                                                <li>Giao siêu tốc 2H: 35.000đ</li>
                                                <li>Giao tiêu chuẩn (Trong ngày): 20.000đ</li>
                                                <li><strong>Freeship</strong> cho đơn từ 300.000đ</li>
                                            </ul>
                                        </div>
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex items-center gap-3 mb-3 text-blue-600">
                                                <Package className="w-6 h-6" />
                                                <h4 className="font-bold m-0">Tỉnh thành khác</h4>
                                            </div>
                                            <ul className="text-sm text-gray-600 space-y-2 mb-0">
                                                <li>Giao nhanh (1-2 ngày): 35.000đ</li>
                                                <li>Đóng gói thùng xốp bảo quản lạnh.</li>
                                                <li><strong>Freeship</strong> cho đơn từ 1.000.000đ</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 border-t border-gray-100 pt-16">
                        <div className="flex justify-between items-end mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Sản phẩm có thể bạn thích</h2>
                            <Link href={`/san-pham?category=${encodeURIComponent(product.category || '')}`} className="text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-1">
                                Xem tất cả <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map(p => (
                                <div key={p.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                                        <img src={getImageUrl(p.image || p.images?.[0] || '') || '/placeholder.png'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        {(p.salePrice > 0 && p.price > p.salePrice) && (
                                            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                                -{Math.round(((p.price - p.salePrice) / p.price) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4 flex-grow flex flex-col">
                                        <div className="text-xs text-emerald-600 font-medium mb-1 uppercase tracking-wider">{p.category}</div>
                                        <Link href={`/san-pham/${p.slug || p.id}`} className="block">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                                                {p.name}
                                            </h3>
                                        </Link>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                                            <div className="flex flex-col">
                                                {(p.type === 'variable' && p.variants && p.variants.length > 0) ? (
                                                    (() => {
                                                        const variants = p.variants;
                                                        const currentPrices = variants.map((v: any) => v.salePrice > 0 ? v.salePrice : v.price);
                                                        const originalPrices = variants.map((v: any) => v.price);

                                                        const minCurrent = Math.min(...currentPrices);
                                                        const maxCurrent = Math.max(...currentPrices);
                                                        const minOriginal = Math.min(...originalPrices);
                                                        const maxOriginal = Math.max(...originalPrices);

                                                        const hasChange = minCurrent !== minOriginal || maxCurrent !== maxOriginal;

                                                        return (
                                                            <div className="flex flex-wrap items-baseline gap-x-2">
                                                                <span className="text-lg font-bold text-emerald-600">
                                                                    {minCurrent === maxCurrent
                                                                        ? `${minCurrent.toLocaleString()}đ`
                                                                        : `${minCurrent.toLocaleString()}đ - ${maxCurrent.toLocaleString()}đ`}
                                                                </span>
                                                                {hasChange && (
                                                                    <span className="text-sm text-gray-400 line-through">
                                                                        {minOriginal === maxOriginal
                                                                            ? `${minOriginal.toLocaleString()}đ`
                                                                            : `${minOriginal.toLocaleString()}đ - ${maxOriginal.toLocaleString()}đ`}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })()
                                                ) : (
                                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                                        <span className="text-lg font-bold text-emerald-600">{(p.salePrice || p.price).toLocaleString()}đ</span>
                                                        {(p.oldPrice || 0) > 0 && (
                                                            <span className="text-sm text-gray-400 line-through">{p.oldPrice?.toLocaleString()}đ</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 flex items-center gap-2 transition-colors shadow-sm active:scale-95">
                                                <ShoppingCart className="w-4 h-4" />
                                                Mua
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
