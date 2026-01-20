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

            <div className="container mx-auto px-4 py-16 md:py-32 relative z-10">
                <div className="max-w-2xl text-white">
                    <span className="bg-emerald-500/20 text-emerald-100 text-xs md:text-sm font-semibold px-3 py-1 rounded-full mb-4 inline-block backdrop-blur-sm border border-emerald-500/30">
                        Nông sản sạch 100% Organic
                    </span>
                    <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight whitespace-pre-line">
                        {title}
                    </h1>
                    <p className="text-base md:text-xl text-emerald-100 mb-6 md:mb-8 max-w-lg">
                        {subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        {showButton && (
                            <Link
                                href={buttonLink}
                                className="inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold transition-all transform hover:translate-y-[-2px] shadow-lg shadow-emerald-900/20 text-sm md:text-base"
                            >
                                {buttonText}
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                            </Link>
                        )}
                        <Link
                            href="/gioi-thieu"
                            className="inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl font-bold transition-all backdrop-blur-sm text-sm md:text-base hover:bg-white/20"
                        >
                            Tìm hiểu thêm
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
