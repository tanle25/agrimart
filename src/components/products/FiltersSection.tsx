// components/products/FiltersSection.tsx
import { use } from 'react';
import { FilterControls } from './FilterControls';
import type { FiltersData } from '@/app/(public)/san-pham/lib/data-fetching';

interface FiltersSectionProps {
    filtersPromise: Promise<FiltersData>;
}

/**
 * Server Component that unwraps the filters promise
 * Desktop only: Sticky sidebar (lg:w-80)
 * Mobile: Handled by ClientFilterWrapper at page level
 */
export function FiltersSection({ filtersPromise }: FiltersSectionProps) {
    const { categories, maxPrice } = use(filtersPromise);

    return (
        <div className="hidden lg:block lg:w-96 lg:flex-shrink-0">
            <div className="sticky top-24 space-y-6">
                <FilterControls
                    initialCategories={categories}
                    initialMaxPrice={maxPrice}
                />
            </div>
        </div>
    );
}
