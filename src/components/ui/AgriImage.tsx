"use client";
import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface AgriImageProps extends Omit<ImageProps, 'src'> {
    src?: string | null;
    fallback?: string;
    aspectRatio?: string;
    objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
    fetchPriority?: "high" | "low" | "auto";
}

// Custom Loader for Backend Images - Defined outside to avoid recreation
const imageLoader = ({ src, width, quality }: { src: string, width: number, quality?: number }) => {
    // If it's a backend image (starts with /api/media or http.../api/media)
    if (src.includes('/api/media')) {
        const separator = src.includes('?') ? '&' : '?';
        return `${src}${separator}w=${width}&q=${quality || 75}&fmt=webp`;
    }
    // For other images, return as is (Next.js default loader will handle if domain configured)
    return src;
};

export const AgriImage: React.FC<AgriImageProps> = ({
    src,
    alt,
    className = '',
    fallback = '/placeholder.png',
    priority = false,
    aspectRatio,
    width,
    height,
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    style,
    objectFit = 'cover',
    fetchPriority,
    ...props
}) => {
    // State for error handling - only used if primary image fails
    const [error, setError] = useState(false);

    // Normalizing the source
    const finalSrc = (error || !src) ? fallback : src;

    // CONTAINER STYLE
    const containerStyles: React.CSSProperties = aspectRatio
        ? { aspectRatio, position: 'relative', overflow: 'hidden', ...style }
        : { position: 'relative', overflow: 'hidden', width, height, ...style };

    return (
        <div className={className} style={containerStyles}>
            <Image
                src={finalSrc}
                loader={finalSrc.includes('/api/media') ? imageLoader : undefined}
                alt={alt || ''}
                fill={!!aspectRatio || (!width && !height)}
                width={(!aspectRatio && width) ? Number(width) : undefined}
                height={(!aspectRatio && height) ? Number(height) : undefined}
                sizes={sizes}
                priority={priority}
                fetchPriority={fetchPriority}
                className={priority ? 'opacity-100' : 'transition-opacity duration-300'}
                style={{ objectFit }}
                // Simple error handler
                onError={() => {
                    if (!error) setError(true);
                }}
                {...props}
            />
        </div>
    );
};
