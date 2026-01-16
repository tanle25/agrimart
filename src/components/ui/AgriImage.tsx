"use client";

import React, { useState, useEffect } from 'react';

interface AgriImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallback?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const AgriImage: React.FC<AgriImageProps> = ({
    src,
    alt = '',
    className = '',
    fallback = '/placeholder.png',
    ...props
}) => {
    const [imgSrc, setImgSrc] = useState<string>((src as string) || fallback);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (!src) {
            setImgSrc(fallback);
            setIsLoading(false);
            return;
        }

        const source = src as string;
        // Handle relative paths from our backend
        const finalSrc = source.startsWith('/api/')
            ? `${BACKEND_URL}${source}`
            : source;

        setImgSrc(finalSrc);
        setIsLoading(true);
        setHasError(false);
    }, [src, fallback]);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
            <img
                {...props}
                src={imgSrc}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setImgSrc(fallback);
                    setHasError(true);
                    setIsLoading(false);
                }}
            />
        </div>
    );
};
