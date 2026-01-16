"use client";

import React, { useState, useEffect } from 'react';
import { Award, Heart, Leaf, Target, ShieldCheck } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

type HeroSettings = {
    title: string;
    heading: string;
    description: string;
    image: string;
};

type StatItem = {
    label: string;
    value: string;
};

type StorySettings = {
    title: string;
    content: string;
    image: string;
    stats: StatItem[];
};

type ValueItem = {
    title: string;
    description: string;
    icon: 'leaf' | 'shield' | 'heart';
};

type AboutSettings = {
    hero: HeroSettings;
    story: StorySettings;
    values: ValueItem[];
};

const DEFAULT_SETTINGS: AboutSettings = {
    hero: {
        title: "Về chúng tôi",
        heading: "Hành trình mang nông sản sạch \nđến mọi gia đình Việt",
        description: "AgriMart không chỉ là nơi bán hàng, chúng tôi là cầu nối giữa những người nông dân tâm huyết và người tiêu dùng thông thái.",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=3132&auto=format&fit=crop"
    },
    story: {
        title: "Câu chuyện của AgriMart",
        content: "Xuất phát từ trăn trở về thực phẩm bẩn tràn lan trên thị trường, AgriMart được thành lập vào năm 2020 với sứ mệnh đơn giản nhưng kiên định: \"Sạch từ nông trại, ngon tại bàn ăn\".\n\nChúng tôi hợp tác trực tiếp với hơn 50 hộ nông dân tại Đà Lạt và các vùng trồng trọt hữu cơ trên cả nước. Mỗi sản phẩm tại AgriMart đều trải qua quy trình kiểm định nghiêm ngặt, đảm bảo không dư lượng thuốc bảo vệ thực vật, không chất kích thích tăng trưởng.",
        image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&q=80&w=800",
        stats: [
            { value: "50+", label: "Đối tác nông trại" },
            { value: "10k+", label: "Khách hàng tin dùng" }
        ]
    },
    values: [
        { title: "Tự nhiên & Hữu cơ", description: "Cam kết 100% sản phẩm có nguồn gốc tự nhiên, canh tác theo hướng hữu cơ bền vững.", icon: 'leaf' },
        { title: "Minh bạch nguồn gốc", description: "Mọi sản phẩm đều có mã QR truy xuất nguồn gốc, quy trình trồng trọt và thu hoạch.", icon: 'shield' },
        { title: "Tận tâm phục vụ", description: "Coi khách hàng như người thân, luôn lắng nghe và hoàn tiền nếu sản phẩm không đạt chất lượng.", icon: 'heart' }
    ]
};

// Icon Mapping
const ICON_MAP = {
    leaf: Leaf,
    shield: ShieldCheck,
    heart: Heart
};

const COLOR_MAP = {
    leaf: 'emerald',
    shield: 'blue',
    heart: 'red'
};

export default function AboutPage() {
    const [data, setData] = useState<AboutSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch(`${BACKEND_URL}/api/settings`);
                if (res.ok) {
                    const settings = await res.json();
                    if (settings.about) {
                        // Merge with default to ensure structure exists
                        setData(prev => ({
                            ...prev,
                            ...settings.about,
                            // Ensure nested objects merge correctly
                            hero: { ...prev.hero, ...settings.about.hero },
                            story: {
                                ...prev.story,
                                ...settings.about.story,
                                stats: settings.about.story?.stats || prev.story.stats
                            },
                            values: settings.about.values || prev.values
                        }));
                    }
                }
            } catch (err) {
                console.error("Failed to load about data", err);
            }
        }
        loadData();
    }, []);

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={data.hero.image}
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
                <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
                    <span className="text-emerald-300 font-bold tracking-wider uppercase mb-4 block">{data.hero.title}</span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 whitespace-pre-line leading-tight">
                        {data.hero.heading}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
                        {data.hero.description}
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="w-full md:w-1/2">
                        <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                            <img src={data.story.image} alt="Story" className="w-full h-full object-cover" />
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-emerald-100 rounded-full z-[-1]"></div>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">{data.story.title}</h2>
                        <div className="text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
                            {data.story.content}
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-8">
                            {data.story.stats.map((stat, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <span className="text-4xl font-bold text-emerald-600 mb-1">{stat.value}</span>
                                    <span className="text-gray-500 text-sm">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Giá trị cốt lõi</h2>
                        <p className="text-gray-500">Những nguyên tắc vàng mà AgriMart luôn tuân thủ để mang lại giá trị tốt nhất cho cộng đồng.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {data.values.map((val, idx) => {
                            const IconComp = ICON_MAP[val.icon] || Leaf;
                            const color = COLOR_MAP[val.icon] || 'emerald';

                            // Dynamic Tailwind classes usually don't work with full interpolation if not safelisted
                            // But we have fixed set: emerald, blue, red.
                            // We can use style objects or helper function.
                            // Let's use specific classes based on color map for simplicity
                            let bgClass = "bg-emerald-100";
                            let textClass = "text-emerald-600";
                            if (val.icon === 'shield') { bgClass = "bg-blue-100"; textClass = "text-blue-600"; }
                            if (val.icon === 'heart') { bgClass = "bg-red-100"; textClass = "text-red-600"; }

                            return (
                                <div key={idx} className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100 hover:shadow-lg transition-shadow">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${bgClass}`}>
                                        <IconComp className={`w-8 h-8 ${textClass}`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{val.title}</h3>
                                    <p className="text-gray-500">{val.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Team/Certifications - Static for now as requested plan, but can be dynamic later */}
            <section className="py-20 container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Đội ngũ & Chứng nhận</h2>
                </div>

                <div className="flex flex-wrap justify-center gap-10 md:gap-20 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2">
                        <Award className="w-10 h-10 text-emerald-600" />
                        <span className="font-bold text-xl text-gray-800">VietGAP</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Target className="w-10 h-10 text-emerald-600" />
                        <span className="font-bold text-xl text-gray-800">ISO 22000</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Leaf className="w-10 h-10 text-emerald-600" />
                        <span className="font-bold text-xl text-gray-800">Organic Standard</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
