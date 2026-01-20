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

/**
 * Vietnamese currency formatter using Intl API
 */
const formatVietnameseCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
};

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {

    /**
     * Calculate price display logic
     * Logic: For variable products with multiple variants:
     * - Current price = LOWEST sale/promotional price
     * - Old price = HIGHEST original price
     */
    const getPriceInfo = () => {
        if (product.type === 'variable' && product.variants && product.variants.length > 0) {
            // Calculate current prices (sale price if available, else regular price)
            const currentPrices = product.variants.map((v: any) =>
                v.salePrice > 0 ? v.salePrice : v.price
            );

            // Calculate original prices
            const originalPrices = product.variants.map((v: any) => v.price);

            // Get min current price and max original price
            const minCurrentPrice = Math.min(...currentPrices);
            const maxOriginalPrice = Math.max(...originalPrices);

            return {
                display: formatVietnameseCurrency(minCurrentPrice),
                oldPrice: minCurrentPrice < maxOriginalPrice
                    ? formatVietnameseCurrency(maxOriginalPrice)
                    : null
            };
        }

        // Simple product
        // Assuming undefined/null salePrice means no sale, or check strict logic
        const currentPrice = (product.salePrice && product.salePrice > 0) ? product.salePrice : product.price;
        const hasDiscount = product.salePrice && product.salePrice < product.price;

        return {
            display: formatVietnameseCurrency(currentPrice),
            oldPrice: hasDiscount ? formatVietnameseCurrency(product.price) : null
        };
    };

    const priceInfo = getPriceInfo();
    const imageUrl = getImageUrl(product.image || product.images?.[0] || '');

    return (
        <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:translate-y-[-4px] transition-all duration-300 group font-sans flex flex-col relative">
            {/* Image Section */}
            <div className="relative w-full bg-white shrink-0 aspect-[4/3]">
                <Link href={`/san-pham/${product.slug || product.id}`} className="block w-full h-full relative">
                    <AgriImage
                        src={imageUrl || '/placeholder.png'}
                        alt={`Ảnh sản phẩm ${product.name}`}
                        sizes="(max-width: 768px) 180px, 25vw"
                        objectFit="cover"
                        className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                        priority={priority}
                        fetchPriority={priority ? 'high' : 'auto'}
                        decoding="async"
                        quality={60}
                    />
                </Link>

                {/* Discount Badge */}
                {((product.discount || 0) > 0 || (product.salePrice && product.salePrice < product.price)) && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            -{product.discount ? product.discount : Math.round(((product.price - product.salePrice!) / product.price) * 100)}%
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
                        {priceInfo.display}
                    </span>
                    {priceInfo.oldPrice && (
                        <span className="price-display text-xs md:text-sm text-gray-500 line-through">
                            {priceInfo.oldPrice}
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
