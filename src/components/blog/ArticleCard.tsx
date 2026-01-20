
import React, { memo } from 'react';
import Link from 'next/link';
import { BlogPost } from '@/shared/types';
import { AgriImage } from '@/components/ui/AgriImage';

// Helper to construct image URL (duplicated logic, ideally shared but keeping localized for now or can import if moved to utils)
// But since this is a component, props should pass full logic or we rely on AgriImage's loader if configured globally.
// AgriImage now handles /api/media. The getImageUrl in BlogList helps prepend domain if needed. 
// We will pass the full ready-to-use src to ArticleCard to keep it dumb.

interface ArticleCardProps {
    post: BlogPost;
    getImageUrl: (path: string) => string;
}

const ArticleCard = memo(({ post, getImageUrl }: ArticleCardProps) => {
    return (
        <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col group h-full">
            <div className="aspect-[3/2] overflow-hidden relative">
                <AgriImage
                    src={getImageUrl(post.image)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    // Optimized sizes for mobile grid (1 col) -> tablet (2 cols) -> desktop (2 cols inside 2/3 width)
                    // Mobile: 100vw - padding (approx 92vw)
                    // Tablet (md): 50vw - padding (approx 45vw)
                    // Desktop (lg): 2/3 container / 2 cols = approx 33vw
                    sizes="(max-width: 768px) 92vw, (max-width: 1024px) 45vw, 33vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <span className="text-white text-xs font-bold bg-emerald-700/90 px-2 py-1 rounded backdrop-blur-sm">
                        {post.category?.name}
                    </span>
                </div>
            </div>
            <div className="p-5 flex-grow flex flex-col">
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime || '3 min'} đọc</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors cursor-pointer">
                    <Link href={`/tin-tuc/${post.slug || post.id}`}>{post.title}</Link>
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-grow">
                    {post.excerpt}
                </p>
            </div>
        </article>
    );
});

ArticleCard.displayName = 'ArticleCard';

export default ArticleCard;
