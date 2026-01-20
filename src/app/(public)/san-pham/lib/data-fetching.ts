// app/(public)/san-pham/lib/data-fetching.ts
'use server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

export interface ProductsData {
    products: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface FiltersData {
    categories: Array<{ name: string; count: number }>;
    maxPrice: number;
}

/**
 * Fetch products with smart caching (1 minute revalidation)
 * This is the LCP-critical data, so we prioritize it
 */
export async function fetchProducts(searchParams: URLSearchParams): Promise<ProductsData> {
    const params = new URLSearchParams();
    params.set('page', searchParams.get('page') || '1');
    params.set('limit', searchParams.get('limit') || '12');
    params.set('sort', searchParams.get('sort') || 'newest');

    if (searchParams.get('search')) params.set('search', searchParams.get('search')!);
    if (searchParams.get('category')) params.set('category', searchParams.get('category')!);
    if (searchParams.get('minPrice')) params.set('minPrice', searchParams.get('minPrice')!);
    if (searchParams.get('maxPrice')) params.set('maxPrice', searchParams.get('maxPrice')!);

    try {
        const res = await fetch(`${BACKEND_URL}/api/products?${params.toString()}`, {
            next: {
                revalidate: 60,  // Cache for 1 minute (products change frequently)
                tags: ['products']
            }
        });

        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();
        return {
            products: data.products || [],
            pagination: data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 }
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            products: [],
            pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
        };
    }
}

/**
 * Fetch filter data (categories + price range) with longer caching (1 hour)
 * This data changes infrequently, so we can cache aggressively
 */
export async function fetchFiltersData(): Promise<FiltersData> {
    try {
        const [categoriesRes, priceRangeRes] = await Promise.all([
            fetch(`${BACKEND_URL}/api/products/categories`, {
                next: {
                    revalidate: 3600,  // Cache for 1 hour (rarely changes)
                    tags: ['categories']
                }
            }),
            fetch(`${BACKEND_URL}/api/products/price-range`, {
                next: {
                    revalidate: 3600,  // Cache for 1 hour
                    tags: ['price-range']
                }
            })
        ]);

        const [categoriesData, priceRangeData] = await Promise.all([
            categoriesRes.json(),
            priceRangeRes.json()
        ]);

        return {
            categories: Array.isArray(categoriesData) ? categoriesData : [],
            maxPrice: priceRangeData.max || 0
        };
    } catch (error) {
        console.error('Error fetching filters data:', error);
        return {
            categories: [],
            maxPrice: 0
        };
    }
}
