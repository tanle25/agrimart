import React from 'react';
import Link from 'next/link';
import { Product } from '@/shared/types';
import { getImageUrl } from '@/shared/utils';
import { AgriImage } from '@/components/ui/AgriImage';
import { AddToCartButton } from './AddToCartButton';

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

const formatVietnameseCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
};

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {

    // Use pre-calculated values from backend
    // Backend now returns 'price' as the current effective price and 'oldPrice' if applicable
    const priceDisplay = formatVietnameseCurrency(product.price);
    const oldPriceDisplay = product.oldPrice ? formatVietnameseCurrency(product.oldPrice) : null;
    const imageUrl = getImageUrl(product.image || product.images?.[0] || '');

    // Optimize rendering for off-screen items, but ensure LCP items (priority=true) paint immediately
    const style: React.CSSProperties = priority ? {} : {
        contentVisibility: 'auto',
        contain: 'paint layout'
    };

    return (
        <div
            className={priority
                ? "w-full h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/50 group font-sans flex flex-col relative"
                : "w-full h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:translate-y-[-4px] transition-all duration-300 group font-sans flex flex-col relative"
            }
            style={style}
        >
            {/* Image Section */}
            <div className="relative w-full bg-white shrink-0 aspect-[4/3]">
                <Link href={`/san-pham/${product.slug || product.id}`} className="block w-full h-full relative">
                    <AgriImage
                        src={imageUrl || '/placeholder.png'}
                        alt={`Ảnh sản phẩm ${product.name}`}
                        sizes="(max-width: 640px) 180px, (max-width: 768px) 180px, 220px"
                        objectFit="cover"
                        className={priority ? "w-full h-full" : "w-full h-full transition-transform duration-500 group-hover:scale-105"}
                        priority={priority}
                        fetchPriority={priority ? 'high' : 'low'}
                        decoding={priority ? "sync" : "async"}
                        quality={priority ? 75 : 50}
                        loading={priority ? undefined : 'lazy'}
                        style={priority ? { willChange: 'auto' } : undefined}
                    />
                </Link>

                {/* Discount Badge */}
                {((product.discount || 0) > 0 || (product.oldPrice && product.oldPrice > product.price)) && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            -{product.discount ? product.discount : Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-3 md:p-5 flex flex-col flex-grow">
                {/* Category */}
                <div className="mb-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md truncate inline-block">
                        {product.category}
                    </span>
                </div>

                {/* Title */}
                <Link href={`/san-pham/${product.slug || product.id}`} className="mb-2 block flex-grow">
                    <h3 className="text-gray-800 font-bold text-sm md:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors" title={product.name}>
                        {product.name}
                    </h3>
                </Link>

                {/* Price Block */}
                <div className="flex items-baseline gap-1 md:gap-2 mb-3 md:mb-4 mt-auto">
                    <span className="price-display text-base md:text-lg font-bold text-emerald-700">
                        {priceDisplay}
                    </span>
                    {oldPriceDisplay && (
                        <span className="price-display text-xs md:text-sm text-gray-500 line-through">
                            {oldPriceDisplay}
                        </span>
                    )}
                </div>

                {/* Action Button */}
                <AddToCartButton product={product} />
            </div>
        </div>
    );
};

export default ProductCard;
