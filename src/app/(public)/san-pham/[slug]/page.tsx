import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

// Helper to fetch data for metadata
async function getProduct(slug: string) {
    const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001').replace('localhost', '127.0.0.1');
    try {
        const res = await fetch(`${BACKEND_URL}/api/products/${slug}`, {
            next: { revalidate: 60 } // Revalidate every minute
        });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        return {
            title: 'Không tìm thấy sản phẩm',
            description: 'Sản phẩm bạn tìm kiếm không tồn tại.'
        }
    }

    const imageUrl = product.image
        ? (product.image.startsWith('http') ? product.image : `${(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001').replace('localhost', '127.0.0.1')}/${product.image}`)
        : '/placeholder.png';

    return {
        title: product.name,
        description: product.description ? product.description.substring(0, 160) : `Mua ${product.name} chất lượng cao, giá tốt tại AgriMart.`,
        openGraph: {
            title: product.name,
            description: product.description ? product.description.substring(0, 160) : `Mua ${product.name} tại AgriMart`,
            images: [{ url: imageUrl }],
            type: 'website'
        }
    };
}

async function getRelatedProducts(category: string, currentId: string | number) {
    const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001').replace('localhost', '127.0.0.1');
    if (!category) return [];
    try {
        const res = await fetch(`${BACKEND_URL}/api/products?limit=4&category=${encodeURIComponent(category)}`, {
            next: { revalidate: 300 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.products || []).filter((p: any) => p.id !== currentId);
    } catch (e) {
        console.error("Failed to fetch related products server-side", e);
        return [];
    }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const product = await getProduct(slug);

    let relatedProducts: any[] = [];
    if (product) {
        relatedProducts = await getRelatedProducts(product.category, product.id);
    }

    return <ProductDetailClient slug={slug} initialProduct={product} initialRelatedProducts={relatedProducts} />;
}

// Enable static generation with ISR
export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = 'force-static';
export const dynamicParams = true;

// Generate static params for common products
export async function generateStaticParams() {
    const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001').replace('localhost', '127.0.0.1');
    try {
        const res = await fetch(`${BACKEND_URL}/api/products?limit=20`);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.products || []).map((product: any) => ({
            slug: product.slug || product.id.toString()
        }));
    } catch (e) {
        return [];
    }
}
