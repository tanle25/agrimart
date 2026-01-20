// components/products/ProductsGridSkeleton.tsx
export function ProductsGridSkeleton() {
    return (
        <>
            {/* Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                        {/* Image skeleton */}
                        <div className="w-full bg-gray-200" style={{ height: '280px' }} />

                        {/* Content skeleton */}
                        <div className="p-5 space-y-3">
                            <div className="h-3 bg-gray-200 rounded w-1/3" />
                            <div className="h-4 bg-gray-200 rounded w-full" />
                            <div className="h-4 bg-gray-200 rounded w-2/3" />
                            <div className="h-6 bg-gray-200 rounded w-1/2 mt-4" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination skeleton */}
            <div className="mt-8 text-center">
                <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
            </div>
        </>
    );
}
