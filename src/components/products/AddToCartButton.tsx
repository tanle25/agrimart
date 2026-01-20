"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import { Product } from '@/shared/types';

interface AddToCartButtonProps {
    product: Product;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product }) => {
    const { addToCart } = useCart();
    const { success } = useToast();
    const router = useRouter();

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

    return (
        <button
            onClick={handleAddToCart}
            aria-label={`Thêm ${product.name} vào giỏ hàng`}
            className={`w-full py-2 md:py-2.5 px-2 md:px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 md:gap-2 font-medium text-[13px] md:text-sm border whitespace-nowrap
                ${product.type === 'variable'
                    ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 cursor-pointer'
                    : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
                }`}
        >
            <ShoppingCart size={16} className="shrink-0" />
            <span>Thêm vào giỏ</span>
        </button>
    );
};
