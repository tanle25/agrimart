import { Metadata } from 'next';
import BlogList from './BlogList';
import { BlogPost, BlogCategory } from '@/shared/types';

export const metadata: Metadata = {
    title: 'Góc chia sẻ & Tin tức nông nghiệp | AgriMart',
    description: 'Cập nhật kiến thức nông nghiệp, mẹo vặt nhà bếp và các công thức nấu ăn ngon từ nông sản sạch tại AgriMart.',
    openGraph: {
        title: 'Góc chia sẻ & Tin tức nông nghiệp | AgriMart',
        description: 'Cập nhật kiến thức nông nghiệp, mẹo vặt nhà bếp và các công thức nấu ăn ngon từ nông sản sạch tại AgriMart.',
    }
};

async function getInitialData() {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001';
    try {
        const [postsRes, catsRes] = await Promise.all([
            fetch(`${BACKEND_URL}/api/blog?page=1&limit=7`, { next: { revalidate: 60 } }), // Revalidate every minute
            fetch(`${BACKEND_URL}/api/blog-categories`, { next: { revalidate: 3600 } })
        ]);

        const postsData = postsRes.ok ? await postsRes.json() : { items: [], total: 0 };
        const categories = catsRes.ok ? await catsRes.json() : [];

        // Handle both new structure { items, total } and fallback
        const initialPosts = Array.isArray(postsData) ? postsData : postsData.items;

        return {
            initialPosts,
            initialCategories: ["Tất cả", ...categories.map((c: any) => c.name)]
        };
    } catch (e) {
        console.error("Failed to fetch initial blog data", e);
        return { initialPosts: [], initialCategories: ["Tất cả"] };
    }
}

export default async function BlogPage() {
    const { initialPosts, initialCategories } = await getInitialData();

    const featuredPost = initialPosts?.find((p: BlogPost) => p.featured) || initialPosts?.[0];
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001';

    let preloadLink = null;

    if (featuredPost?.image) {
        const src = featuredPost.image.startsWith('http') ? featuredPost.image : `${BACKEND_URL}${featuredPost.image}`;

        // Only preload if it's our backend image (matching AgriImage logic)
        if (src.includes('/api/media')) {
            const separator = src.includes('?') ? '&' : '?';
            const makeUrl = (w: number) => `${src}${separator}w=${w}&q=65&fmt=webp ${w}w`;

            // Next.js default device sizes
            const deviceSizes = [360, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];
            const imageSrcSet = deviceSizes.map(w => makeUrl(w)).join(', ');

            preloadLink = (
                <link
                    rel="preload"
                    as="image"
                    href={`${src}${separator}w=1080&q=65&fmt=webp`} // Fallback
                    imageSrcSet={imageSrcSet}
                    imageSizes="(max-width: 768px) 92vw, (max-width: 1024px) 92vw, 66vw"
                />
            );
        }
    }

    return (
        <>
            {preloadLink}
            <BlogList initialPosts={initialPosts} initialCategories={initialCategories} />
        </>
    );
}
