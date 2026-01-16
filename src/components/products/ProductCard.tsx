import React from 'react';
import Link from 'next/link';
import { Product } from '@/shared/types';
import { formatCurrency, getImageUrl } from '@/shared/utils';
import { ShoppingCart, Star, Heart } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();
    const { success } = useToast();
    const router = useRouter();

    // Logic to determine price display
    let priceDisplay;
    let oldPriceDisplay = null;

    // Map variants to get current and original prices paired
    if (product.type === 'variable' && product.variants && product.variants.length > 0) {
        // Map variants to get current and original prices paired
        const priceMap = product.variants.map((v: any) => ({
            current: v.salePrice > 0 ? v.salePrice : v.price,
            original: v.price
        }));

        // Find the option with the lowest current price
        const bestOption = priceMap.reduce((min, curr) =>
            curr.current < min.current ? curr : min
            , priceMap[0]);

        priceDisplay = formatCurrency(bestOption.current);

        // Only show old price if it's different from current (i.e., on sale)
        if (bestOption.original > bestOption.current) {
            oldPriceDisplay = formatCurrency(bestOption.original);
        }
    } else {
        priceDisplay = formatCurrency(product.salePrice || product.price);
        if (product.salePrice && product.salePrice < product.price) {
            oldPriceDisplay = formatCurrency(product.price);
        } else if ((product.oldPrice || 0) > 0) {
            oldPriceDisplay = formatCurrency(product.oldPrice!);
        }
    }

    const imageUrl = getImageUrl(product.image || product.images?.[0] || '');
    const rating = product.rating || 4.5; // Mock rating if missing for visual check

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.type === 'variable') {
            router.push(`/san-pham/${product.slug || product.id}`);
            return;
        }

        addToCart(product, 1);
        success(`Đã thêm "${product.name}" vào giỏ hàng`);
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5" title={`Đánh giá: ${rating} sao`}>
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={12}
                        className={`${i < Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:translate-y-[-4px] transition-all duration-300 group font-sans flex flex-col relative">
            {/* Image Section */}
            <div className="relative aspect-square overflow-hidden bg-gray-50 shrink-0">
                <Link href={`/san-pham/${product.slug || product.id}`}>
                    <img
                        src={imageUrl || '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </Link>

                {/* Badges */}
                {(product.discount || 0) > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                            -{product.discount}%
                        </span>
                    </div>
                )}

                {/* Wishlist Button */}
                <button className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-500 hover:text-rose-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 duration-300 shadow-sm cursor-pointer">
                    <Heart size={18} />
                </button>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-grow">
                {/* Category & Rating */}
                <div className="flex items-start justify-between mb-2 gap-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md truncate">
                        {product.category}
                    </span>
                    {rating > 0 && renderStars(rating)}
                </div>

                {/* Title */}
                <Link href={`/san-pham/${product.slug || product.id}`} className="mb-2 block flex-grow">
                    <h3 className="text-gray-800 font-bold text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors" title={product.name}>
                        {product.name}
                    </h3>
                </Link>

                {/* Price Block */}
                <div className="flex items-baseline gap-2 mb-4 mt-auto">
                    <span className="text-lg font-bold text-emerald-600">
                        {priceDisplay}
                    </span>
                    {oldPriceDisplay && (
                        <span className="text-sm text-gray-400 line-through">
                            {oldPriceDisplay}
                        </span>
                    )}
                </div>

                {/* Action Button */}
                <button
                    onClick={handleAddToCart}
                    className={`w-full py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm border
                        ${product.type === 'variable'
                            ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer'
                            : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                        }`}
                >
                    {product.type === 'variable' ? (
                        <span>Tùy chọn</span>
                    ) : (
                        <>
                            <ShoppingCart size={16} />
                            <span>Thêm vào giỏ</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
