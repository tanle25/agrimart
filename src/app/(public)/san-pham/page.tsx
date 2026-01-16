import { Suspense } from 'react';
import ProductsClient from './ProductsClient';

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-8">Đang tải...</div>}>
            <ProductsClient />
        </Suspense>
    );
}
