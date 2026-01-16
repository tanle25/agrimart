import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

// Helper to fetch data for metadata
async function getProduct(slug: string) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
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
        ? (product.image.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/${product.image}`)
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

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <ProductDetailClient slug={slug} />;
}
