"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
// import NextImage from 'next/image'; 
import { Product } from '@/shared/types';
import ProductCard from '@/components/products/ProductCard';
import { AgriImage } from '@/components/ui/AgriImage';
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
    Loader2,
    X
} from 'lucide-react';
import { getImageUrl } from '@/shared/utils';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001').replace('localhost', '127.0.0.1');

export default function ProductDetailClient({
    slug,
    initialProduct,
    initialRelatedProducts = []
}: {
    slug: string,
    initialProduct?: any,
    initialRelatedProducts?: any[]
}) {
    // Helper helpers for initialization
    const getInitialImage = (p: any) => {
        if (!p) return '/placeholder.png';
        const raw = p.image || ((p.images && p.images.length > 0) ? p.images[0] : '');
        return getImageUrl(raw) || '/placeholder.png';
    };

    const getInitialVariant = (p: any) => {
        if (p?.type === 'variable' && p?.variants?.length > 0) return p.variants[0];
        return null;
    };

    const getInitialAttributes = (p: any) => {
        if (p?.type === 'variable' && p?.variants?.length > 0 && p.variants[0].attributes) {
            return p.variants[0].attributes;
        }
        return {};
    };

    const [product, setProduct] = useState<any>(initialProduct || null);
    const [activeImage, setActiveImage] = useState<string>(getInitialImage(initialProduct));
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState<any>(getInitialVariant(initialProduct));
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(getInitialAttributes(initialProduct));
    const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'shipping'>('desc');
    const [isLoading, setIsLoading] = useState(!initialProduct);
    const [error, setError] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState<any[]>(initialRelatedProducts);
    const { addToCart } = useCart();

    const { success, error: toastError } = useToast();

    // Animation States
    const [shouldRender, setShouldRender] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'cart' | 'buy'>('cart');

    const openDrawer = (mode: 'cart' | 'buy') => {
        setDrawerMode(mode);
        setShouldRender(true);
        // Small delay to allow mount before transition
        setTimeout(() => setIsVisible(true), 10);
    };

    const closeDrawer = () => {
        setIsVisible(false);
        // Wait for transition to finish before unmounting
        setTimeout(() => setShouldRender(false), 500);
    };

    const handleDrawerConfirm = () => {
        if (product.type === 'variable' && !selectedVariant) {
            toastError("Vui lòng chọn phân loại hàng");
            return;
        }

        addToCart(product, quantity, selectedVariant || undefined);
        closeDrawer();
        if (drawerMode === 'buy') {
            // Logic for buy now -> redirect to checkout (mock)
            success(`Đã thêm vào giỏ hàng và chuyển đến thanh toán (Mock)`);
        } else {
            success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
        }
    };

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
        if (initialProduct) {
            return;
        }
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
    }, [slug, initialProduct]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-emerald-700">
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
                    <Link href="/san-pham" className="bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-800 transition-colors">
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
        <div className="bg-white min-h-screen pb-24 md:pb-20 font-sans">
            {/* Breadcrumbs */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="container mx-auto px-4 py-4 text-xs md:text-sm text-gray-600 flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar">
                    <Link href="/" className="hover:text-emerald-700 transition-colors flex-shrink-0">Trang chủ</Link>
                    <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
                    <Link href="/san-pham" className="hover:text-emerald-700 transition-colors flex-shrink-0">Sản phẩm</Link>
                    <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
                    <span className="text-gray-900 font-medium truncate">{product.name}</span>
                </div>
            </div>

            <div className="container mx-auto px-4 py-4 md:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">

                    {/* LEFT: Image Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-[4/3] md:aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 relative group">
                            <AgriImage
                                src={activeImage || '/placeholder.png'}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            {(product.discount > 0 || (displayOldPrice > displayPrice)) && (
                                <div className="absolute top-4 left-4 bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-red-600/30">
                                    Giảm giá
                                </div>
                            )}

                            {/* Carousel Navigation Arrows */}
                            {productImages.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        aria-label="Xem ảnh trước"
                                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-emerald-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="Xem ảnh tiếp theo"
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
                                            type="button"
                                            aria-label={`Xem ảnh ${idx + 1}`}
                                            onClick={() => setActiveImage(getImageUrl(img))}
                                            className={`
                                                flex-shrink-0 relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-500 ease-out snap-start
                                                ${activeImage === getImageUrl(img)
                                                    ? 'border-emerald-700 ring-2 ring-emerald-100 ring-offset-2 scale-105 shadow-xl opacity-100 z-10'
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
                                    <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                                        {product.category}
                                    </span>
                                )}
                                <div className="flex items-center text-yellow-400 text-sm">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span className="text-gray-900 font-bold ml-1">{product.rating || 0}</span>
                                    <span className="text-gray-500 mx-1">·</span>
                                    <span className="text-gray-600 underline decoration-gray-300 underline-offset-2">{product.reviews || 0} Đánh giá</span>
                                </div>
                            </div>

                            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>

                            <div className="flex items-end gap-3 mb-6">
                                <span className="text-2xl md:text-4xl font-bold text-emerald-700">{displayPrice.toLocaleString()}đ</span>
                                {(displayOldPrice || 0) > 0 && (
                                    <span className="text-lg md:text-xl text-gray-500 line-through font-medium mb-1">{displayOldPrice.toLocaleString()}đ</span>
                                )}
                            </div>

                            <div
                                className="text-gray-600 text-lg leading-relaxed prose prose-emerald"
                                dangerouslySetInnerHTML={{ __html: product.description || '' }} // Assuming simple description or HTML. If description is safe text, direct render is better.
                            />
                        </div>

                        {/* Selectors & Actions (Desktop) */}
                        <div className="space-y-8 mb-8 hidden md:block">
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
                                                            type="button"
                                                            aria-label={`Chọn ${attr.name} ${value}`}
                                                            aria-pressed={isSelected}
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
                                        type="button"
                                        aria-label="Giảm số lượng"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 text-gray-500 hover:text-emerald-700 transition-colors"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        aria-label="Số lượng sản phẩm"
                                        value={quantity}
                                        readOnly
                                        className="w-12 bg-transparent text-center text-gray-900 font-bold focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Tăng số lượng"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-3 text-gray-500 hover:text-emerald-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>


                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center justify-center gap-2 transform active:scale-[0.98]"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    Thêm vào giỏ hàng
                                </button>

                                <button
                                    type="button"
                                    aria-label="Thêm vào yêu thích"
                                    className="p-4 border-2 border-gray-100 rounded-xl text-gray-500 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all"
                                >
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
                                <div className="bg-white p-2 rounded-lg shadow-sm text-emerald-700">
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
                        <div className="w-full md:w-64 flex-shrink-0 flex md:flex-col gap-2 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0 md:pr-4 overflow-x-auto snap-x scrollbar-hide">
                            <button
                                onClick={() => setActiveTab('desc')}
                                className={`text-left px-4 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap snap-start ${activeTab === 'desc' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                Mô tả sản phẩm
                            </button>
                            <button
                                onClick={() => setActiveTab('reviews')}
                                className={`text-left px-4 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap snap-start ${activeTab === 'reviews' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                Đánh giá ({product.reviews || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('shipping')}
                                className={`text-left px-4 py-3 rounded-lg font-bold text-sm transition-all whitespace-nowrap snap-start ${activeTab === 'shipping' ? 'bg-emerald-50 text-emerald-800' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                Chính sách giao hàng
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 bg-gray-50 rounded-2xl p-0 md:p-8 min-h-[300px]">
                            {activeTab === 'desc' && (
                                <div className="prose prose-emerald max-w-none animate-in fade-in slide-in-from-left-2 duration-300">
                                    <h2 className="text-xl text-gray-900 font-bold mb-4">Chi tiết về {product.name}</h2>
                                    <div dangerouslySetInnerHTML={{ __html: product.content || product.description || 'Đang cập nhật...' }} />
                                </div>
                            )}
                            {activeTab === 'reviews' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <h2 className="text-xl text-gray-900 font-bold mb-6">Đánh giá từ khách hàng</h2>
                                    {/* Mock Reviews for now, unless API provides reviews */}
                                    <p className="text-gray-500 italic">Chưa có đánh giá nào.</p>
                                </div>
                            )}
                            {activeTab === 'shipping' && (
                                <div className="prose prose-emerald max-w-none animate-in fade-in slide-in-from-left-2 duration-300">
                                    <h2 className="text-xl text-gray-900 font-bold mb-4">Thông tin giao hàng</h2>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                            <div className="flex items-center gap-3 mb-3 text-emerald-700">
                                                <Truck className="w-6 h-6" />
                                                <h3 className="font-bold m-0 text-base">Nội thành TP.HCM</h3>
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
                                                <h3 className="font-bold m-0 text-base">Tỉnh thành khác</h3>
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
                        <div className="flex flex-col items-start gap-2 md:flex-row md:justify-between md:items-end mb-6 md:mb-8">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Sản phẩm có thể bạn thích</h2>
                            <Link href={`/san-pham?category=${encodeURIComponent(product.category || '')}`} className="text-emerald-700 font-bold hover:text-emerald-800 flex items-center gap-1 whitespace-nowrap text-sm md:text-base">
                                Xem tất cả <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {relatedProducts.map(p => (
                                <div key={p.id} className="h-full">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Mobile Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 md:hidden z-40 flex gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-bottom">
                <button
                    onClick={() => openDrawer('cart')}
                    className="flex-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-base py-3 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <ShoppingCart className="w-5 h-5" />
                    Thêm vào giỏ
                </button>
                <button
                    onClick={() => openDrawer('buy')}
                    className="flex-1 bg-emerald-700 text-white rounded-xl font-bold text-base py-3 shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    Mua ngay
                </button>
            </div>

            {/* iOS-style Variant Drawer */}
            {shouldRender && (
                <>
                    <div
                        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                        onClick={closeDrawer}
                    />
                    <div
                        className={`fixed bottom-0 left-0 right-0 md:max-w-xl md:mx-auto md:bottom-4 md:rounded-3xl bg-white rounded-t-3xl z-50 p-6 max-h-[85vh] overflow-y-auto flex flex-col pb-safe shadow-2xl transition-transform duration-500 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
                    >

                        {/* Drawer Header */}
                        <div className="flex gap-4 mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-gray-100">
                            <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                                <img
                                    src={activeImage || '/placeholder.png'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-end pb-1">
                                <div className="flex items-end gap-2 mb-1">
                                    <span className="text-2xl font-bold text-emerald-700">{displayPrice.toLocaleString()}đ</span>
                                    {(displayOldPrice || 0) > 0 && (
                                        <span className="text-sm text-gray-600 line-through mb-1">{displayOldPrice.toLocaleString()}đ</span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">Kho: {selectedVariant ? (selectedVariant.stock || 'Còn hàng') : (product.stock || 'Còn hàng')}</div>
                            </div>
                            <button
                                type="button"
                                aria-label="Đóng"
                                onClick={closeDrawer}
                                className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-600 bg-gray-100 rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Drawer Body: Selectors */}
                        <div className="space-y-6 mb-8 flex-1">
                            {/* Variants */}
                            {product.type === 'variable' && product.attributes && product.attributes.length > 0 && product.variants && (
                                <div className="space-y-5">
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
                                                            type="button"
                                                            aria-label={`Chọn ${attr.name} ${value}`}
                                                            aria-pressed={isSelected}
                                                            onClick={() => handleAttributeSelect(attr.name, value)}
                                                            className={`
                                                                relative rounded-xl border-2 transition-all duration-200
                                                                ${hasVisual
                                                                    ? (isSelected ? 'border-emerald-700 ring-2 ring-emerald-100 p-0.5' : 'border-gray-200 hover:border-emerald-200 p-0.5')
                                                                    : (isSelected ? 'border-emerald-700 bg-emerald-50 text-emerald-800 font-bold px-4 py-2 text-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 font-medium px-4 py-2 text-sm')
                                                                }
                                                            `}
                                                        >
                                                            {hasVisual ? (
                                                                <div className="w-12 h-12 rounded-lg overflow-hidden relative">
                                                                    <img
                                                                        src={getImageUrl(attr.valueImages[value])}
                                                                        alt={value}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                    {isSelected && (
                                                                        <div className="absolute inset-0 bg-black/10 z-10"></div>
                                                                    )}
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

                            {/* Quantity */}
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Số lượng:</span>
                                </div>
                                <div className="flex items-center border border-gray-300 rounded-xl w-32">
                                    <button
                                        type="button"
                                        aria-label="Giảm số lượng"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 text-gray-500 hover:text-emerald-700 active:bg-gray-100 rounded-l-xl transition-colors"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        aria-label="Số lượng sản phẩm"
                                        value={quantity}
                                        readOnly
                                        className="w-10 flex-1 bg-transparent text-center text-gray-900 font-bold focus:outline-none"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Tăng số lượng"
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-3 text-gray-500 hover:text-emerald-700 active:bg-gray-100 rounded-r-xl transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer: Action Button */}
                        <div className="pt-2">
                            <button
                                onClick={handleDrawerConfirm}
                                className="w-full bg-emerald-700 text-white rounded-xl font-bold text-lg py-4 shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {drawerMode === 'buy' ? 'Mua ngay' : 'Thêm vào giỏ hàng'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
