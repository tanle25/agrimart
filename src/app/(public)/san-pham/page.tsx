import { Suspense } from 'react';
import { fetchProducts, fetchFiltersData } from './lib/data-fetching';
import { ProductsGrid } from '@/components/products/ProductsGrid';
import { ProductsGridSkeleton } from '@/components/products/ProductsGridSkeleton';
import { FiltersSection } from '@/components/products/FiltersSection';
import { ClientFilterWrapper } from '@/components/products/ClientFilterWrapper';

/**
 * Product Listing Page with Streaming Architecture
 * 
 * Key Optimizations:
 * 1. Parallel data fetching (no sequential awaits)
 * 2. Separated Suspense boundaries (products vs filters)
 * 3. Smart caching (60s products, 1h filters)
 * 4. use() hook for streaming
 * 
 * Performance Impact:
 * - LCP: Products render immediately (not blocked by filters)
 * - TTFB: Reduced by eliminating sequential awaits
 * - UX: Progressive loading (products → filters)
 */
export default async function ProductsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Unwrap searchParams once
    const searchParams = await props.searchParams;
    const params = new URLSearchParams(searchParams as Record<string, string>);

    // Start both fetches in parallel (no await yet!)
    const productsPromise = fetchProducts(params);
    const filtersPromise = fetchFiltersData();

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-white py-8 mb-8">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl font-bold mb-2">Cửa hàng</h1>
                    <p className="text-emerald-100">Khám phá sản phẩm hữu cơ chất lượng cao</p>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters - Stream independently */}
                    <Suspense fallback={
                        <div className="hidden lg:block lg:w-96 lg:flex-shrink-0 h-[800px] bg-gray-100 rounded-xl animate-pulse" />
                    }>
                        <FiltersSection filtersPromise={filtersPromise} />
                    </Suspense>

                    {/* Products Grid - Priority stream (LCP candidate) */}
                    <div className="lg:flex-1">
                        <Suspense fallback={<ProductsGridSkeleton />} key={params.toString()}>
                            <ProductsGrid productsPromise={productsPromise} />
                        </Suspense>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer - Rendered at page level for proper hydration */}
            <Suspense fallback={null}>
                <ClientFilterWrapper filtersPromise={filtersPromise} />
            </Suspense>
        </div>
    );
}

// Enable caching with revalidation (allows BFCache unlike force-dynamic)
export const revalidate = 10;

// Force static generation for better performance
export const dynamic = 'force-static';
export const dynamicParams = true;

//Generate static params for common cases
export async function generateStaticParams() {
    // Generate static version for default page (no params)
    return [{}];
}

// Add metadata for SEO and performance hints
export async function generateMetadata() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

    return {
        title: 'Sản phẩm - AgriMart',
        description: 'Khám phá các sản phẩm hữu cơ chất lượng cao',
        other: {
            // Preconnect to backend for faster TTFB
            'dns-prefetch': backendUrl,
            'preconnect': backendUrl,
        }
    };
}
