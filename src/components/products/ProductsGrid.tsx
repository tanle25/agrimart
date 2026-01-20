// components/products/ProductsGrid.tsx
import { use } from 'react';
import ProductCard from './ProductCard';
import type { ProductsData } from '@/app/(public)/san-pham/lib/data-fetching';

interface ProductsGridProps {
    productsPromise: Promise<ProductsData>;
}

/**
 * Server Component that unwraps the products promise
 * This enables streaming - component renders as soon as data arrives
 */
export function ProductsGrid({ productsPromise }: ProductsGridProps) {
    const { products, pagination } = use(productsPromise);

    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào</p>
            </div>
        );
    }

    return (
        <>
            {/* Products Grid */}
            <h2 className="sr-only">Danh sách sản phẩm</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product, index) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        priority={index < 4} // LCP optimization: First 4 items (2 rows active) get priority
                    />
                ))}
            </div>

            {/* Pagination Info */}
            {pagination.total > 0 && (
                <div className="mt-8 text-center text-sm text-gray-600">
                    Hiển thị {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} sản phẩm
                </div>
            )}
        </>
    );
}
