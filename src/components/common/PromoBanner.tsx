"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

type PromoItem = {
    id: string;
    title: string;
    subtitle: string;
    tag: string;
    image: string;
    buttonText: string;
    link: string;
    showButton: boolean;
    active: boolean;
};

type PromoSettings = {
    mode: 'manual' | 'random';
    items: PromoItem[];
};

const DEFAULT_ITEM: PromoItem = {
    id: 'default',
    title: "Rau sạch tại vườn - Giảm ngay 20%",
    subtitle: "Khuyến mãi đặc biệt",
    tag: "KHUYẾN MÃI",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600",
    buttonText: "Mua ngay",
    link: "/san-pham",
    showButton: true,
    active: true
};

export default function PromoBanner({ className = "" }: { className?: string }) {
    const [item, setItem] = useState<PromoItem | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.appearance?.promoBanner) {
                        const settings: PromoSettings = data.appearance.promoBanner;

                        // Handle legacy or new format
                        let availableItems: PromoItem[] = [];

                        if (Array.isArray(settings.items)) {
                            availableItems = settings.items.filter(i => i.active);
                        } else if (settings.items) {
                            // Legacy single item fallback?
                            // In admin page migration we handled it, but frontend should be safe too
                            availableItems = [];
                        }

                        // Fallback to default if no active items found from a completely empty state
                        // But if user explicitly disabled all, we should probably hide?
                        // For now, let's fall back to default if array is empty so UI isn't broken
                        if (availableItems.length === 0) {
                            setItem(DEFAULT_ITEM);
                            return;
                        }

                        if (settings.mode === 'random') {
                            const randomIndex = Math.floor(Math.random() * availableItems.length);
                            setItem(availableItems[randomIndex]);
                        } else {
                            // Manual: Pick first active
                            setItem(availableItems[0]);
                        }
                        return;
                    }
                }
                setItem(DEFAULT_ITEM);
            } catch (err) {
                console.error("Failed to load banner settings", err);
                setItem(DEFAULT_ITEM);
            }
        };
        fetchSettings();
    }, []);

    if (!item) return null;

    const Content = (
        <div className={`rounded-2xl overflow-hidden relative aspect-[4/5] group cursor-pointer shadow-sm hover:shadow-md transition-all ${className}`}>
            <img
                src={item.image || DEFAULT_ITEM.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end text-center">
                <span className="text-yellow-400 font-bold tracking-wider text-sm mb-2 uppercase">
                    {item.subtitle || item.tag}
                </span>
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
                    {item.title}
                </h3>
                {item.showButton && (
                    <button className="bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20 transform group-hover:-translate-y-1 mx-auto flex items-center gap-2">
                        {item.buttonText} <ArrowRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );

    // If button is hidden, we still link entire card if link exists? 
    // Usually yes. If showButton is false, the whole card is a link. 
    // If showButton is true, entire card is still link.
    return (
        <Link href={item.link || '#'}>
            {Content}
        </Link>
    );
}
