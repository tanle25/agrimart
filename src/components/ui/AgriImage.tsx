"use client";

import React, { useState, useEffect } from 'react';

interface AgriImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
    fallback?: string;
    priority?: boolean;
    aspectRatio?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

// Synchronous helper to calculate image properties
function useImageProps(src: string | undefined, backendUrl: string) {
    if (!src) return { src: '', srcSet: undefined, isBackend: false };

    const source = src;
    const isBackendImage = source.startsWith('/api/');

    let finalSrc = source;
    let finalSrcSet: string | undefined = undefined;

    // Handle relative paths from our backend
    if (isBackendImage) {
        // Append q=75 for compression
        const separator = source.includes('?') ? '&' : '?';
        finalSrc = `${backendUrl}${source}${separator}q=75`;

        // Defined widths for responsive loading
        const widths = [320, 480, 640, 800, 1024, 1200];
        finalSrcSet = widths
            .map(w => `${backendUrl}${source}${separator}w=${w}&q=75 ${w}w`)
            .join(', ');

    } else if (source.includes('images.unsplash.com')) {
        // Unsplash optimization
        const widths = [320, 480, 640, 800, 1024, 1200, 1920];
        finalSrcSet = widths
            .map(w => {
                try {
                    const urlObj = new URL(source);
                    urlObj.searchParams.set('w', w.toString());
                    urlObj.searchParams.set('q', '75'); // Force quality reduction
                    urlObj.searchParams.set('auto', 'format');
                    urlObj.searchParams.set('fit', 'crop');
                    return `${urlObj.toString()} ${w}w`;
                } catch (e) {
                    return `${source} ${w}w`;
                }
            })
            .join(', ');

    } else if (source.includes('picsum.photos')) {
        // Unify Picsum logic for support of random seeds, IDs, and direct dimensions
        // Matches: .../800/600 or .../id/237/800/600
        const sizeMatch = source.match(/\/(\d+)\/(\d+)(?:\?|$)/);

        if (sizeMatch) {
            const originalW = parseInt(sizeMatch[1]);
            const originalH = parseInt(sizeMatch[2]);
            const aspectRatio = (originalH > 0 && originalW > 0) ? originalW / originalH : 1;

            const widths = [320, 480, 640, 800];

            finalSrcSet = widths
                .map(w => {
                    const h = Math.round(w / aspectRatio);
                    // Replace /originalW/originalH with /w/h safely
                    return `${source.replace(new RegExp(`/${originalW}/${originalH}`), `/${w}/${h}`)} ${w}w`;
                })
                .join(', ');
        } else if (source.match(/picsum\.photos\/id\/(\d+)\/(\d+)\/(\d+)/)) {
            // Fallback/Safety Check
        } else if (source.includes('/seed/')) {
            // Specific seed pattern fallback if needed (though regex above usually catches dimensions)
            const match = source.match(/picsum\.photos\/seed\/([^/]+)\/(\d+)\/(\d+)/);
            if (match) {
                const [, seed, wStr, hStr] = match;
                const w = parseInt(wStr);
                const h = parseInt(hStr);
                const ratio = w / h;
                const widths = [320, 480, 640, 800];
                finalSrcSet = widths.map(wd => {
                    const ht = Math.round(wd / ratio);
                    return `https://picsum.photos/seed/${seed}/${wd}/${ht} ${wd}w`;
                }).join(', ');
            }
        }
    }

    return { src: finalSrc, srcSet: finalSrcSet, isBackend: isBackendImage };
}

export const AgriImage: React.FC<AgriImageProps> = ({
    src,
    alt = '',
    className = '',
    fallback = '/placeholder.png',
    priority = false, // If true, eager load and high fetch priority
    aspectRatio,
    width,
    height,
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw', // Default sizes
    ...props
}) => {
    // Synchronous state initialization
    const { src: initialSrc, srcSet: initialSrcSet } = useImageProps(src as string | undefined, BACKEND_URL);

    // We only use state for error handling fallback now
    const [imgSrc, setImgSrc] = useState<string>(initialSrc || fallback);
    const [srcSet, setSrcSet] = useState<string | undefined>(initialSrcSet);
    const [hasError, setHasError] = useState(false);

    // Update if props change
    useEffect(() => {
        const { src: newSrc, srcSet: newSrcSet } = useImageProps(src as string | undefined, BACKEND_URL);
        setImgSrc(newSrc || fallback);
        setSrcSet(newSrcSet);
        setHasError(false);
    }, [src, fallback]);

    // Container styles with optional aspect ratio
    const containerStyles = aspectRatio
        ? { aspectRatio }
        : {};

    // Calculate dimensions based on aspectRatio if not provided
    let imgWidth = width;
    let imgHeight = height;

    if (!width && !height && aspectRatio) {
        // Parse aspect ratio (e.g., "16/9" or "1/1")
        const [w, h] = aspectRatio.split('/').map(Number);
        if (w && h) {
            // Use a base width and calculate height
            imgWidth = 800;
            imgHeight = Math.round((800 * h) / w);
        }
    }

    // Loading strategy based on priority
    const loadingAttr = priority ? 'eager' : 'lazy';
    const fetchPriorityAttr = priority ? 'high' : 'auto';

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={containerStyles}
        >
            <img
                {...props}
                src={hasError ? fallback : imgSrc}
                srcSet={srcSet}
                sizes={sizes}
                alt={alt}
                width={imgWidth}
                height={imgHeight}
                loading={loadingAttr}
                fetchPriority={fetchPriorityAttr}
                decoding={priority ? 'sync' : 'async'}
                className={`w-full h-full object-cover transition-opacity duration-300 ${priority ? 'opacity-100' : 'opacity-100'}`}
                onError={() => {
                    setImgSrc(fallback);
                    setSrcSet(undefined);
                    setHasError(true);
                }}
            />
        </div>
    );
};
