import React from 'react';
import ProductEditor from '@/components/admin/ProductEditor';
import { PRODUCTS } from '@/data/mockData';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
    const { slug } = await params;

    // Find product by slug
    // Note: In a real app this would be an API call or DB query
    // Since mockData doesn't strictly enforce slugs for all items in existing logic (unless I updated all),
    // we try to match by slug property.
    const product = PRODUCTS.find((p) => p.slug === slug);

    if (!product) {
        notFound();
    }

    return <ProductEditor initialProduct={product} />;
}
