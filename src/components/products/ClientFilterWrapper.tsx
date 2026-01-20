// components/products/ClientFilterWrapper.tsx
'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import type { FiltersData } from '@/app/(public)/san-pham/lib/data-fetching';

// Lazy load MobileFilterDrawer (Heavy component)
const MobileFilterDrawer = dynamic(
    () => import('./MobileFilterDrawer').then(mod => mod.MobileFilterDrawer),
    { ssr: false } // Only needed on client interaction
);

interface ClientFilterWrapperProps {
    filtersPromise: Promise<FiltersData>;
}

/**
 * Client Component wrapper để render MobileFilterDrawer
 * Unwrap promise ở client side để drawer có thể hydrate properly
 */
export function ClientFilterWrapper({ filtersPromise }: ClientFilterWrapperProps) {
    const { categories, maxPrice } = use(filtersPromise);

    return (
        <MobileFilterDrawer
            categories={categories}
            maxPrice={maxPrice}
        />
    );
}
