"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AgriImage } from '@/components/ui/AgriImage';

interface OptimizedHeroProps {
    title: string;
    subtitle: string;
    image: string;
    buttonText?: string;
    buttonLink?: string;
    showButton?: boolean;
}

export default function OptimizedHero({
    title,
    subtitle,
    image,
    buttonText = "Mua ngay",
    buttonLink = "/san-pham",
    showButton = true
}: OptimizedHeroProps) {
    return (
        <section className="relative bg-emerald-900 overflow-hidden">
            {/* Optimized background image with AgriImage for responsive loading */}
            <div className="absolute inset-0 w-full h-full opacity-20">
                <AgriImage
                    src={image}
                    alt=""
                    width={1920}
                    height={1080}
                    priority={true}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
                <div className="max-w-2xl text-white">
                    <span className="bg-emerald-500/20 text-emerald-100 text-sm font-semibold px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-sm border border-emerald-500/30">
                        Nông sản sạch 100% Organic
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight whitespace-pre-line">
                        {title}
                    </h1>
                    <p className="text-xl text-emerald-100 mb-8 max-w-lg">
                        {subtitle}
                    </p>
                    <div className="flex gap-4">
                        {showButton && (
                            <Link
                                href={buttonLink}
                                className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-4 rounded-lg font-bold transition-all transform hover:translate-y-[-2px] shadow-lg shadow-emerald-900/20"
                            >
                                {buttonText}
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        )}
                        <Link
                            href="/gioi-thieu"
                            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-lg font-bold transition-all backdrop-blur-sm"
                        >
                            Tìm hiểu thêm
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
