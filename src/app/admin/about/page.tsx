"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Layout, BookOpen, Heart, Plus, Trash2, HelpCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import ImageUploader from '@/components/common/ImageUploader';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

// --- Types ---

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
    content: string; // Multi-line text
    image: string;
    stats: StatItem[];
};

type ValueItem = {
    title: string;
    description: string;
    icon: 'leaf' | 'shield' | 'heart'; // Simplified for now
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

export default function AboutAdminPage() {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<AboutSettings>(DEFAULT_SETTINGS);
    const [activeTab, setActiveTab] = useState<'hero' | 'story' | 'values'>('hero');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/settings`);
                if (res.ok) {
                    const resData = await res.json();
                    if (resData.about) {
                        // Merge with default to ensure structure exists
                        setData(prev => ({
                            ...prev,
                            ...resData.about,
                            // Ensure nested objects merge correctly if partial data exists
                            hero: { ...prev.hero, ...resData.about.hero },
                            story: {
                                ...prev.story,
                                ...resData.about.story,
                                stats: resData.about.story?.stats || prev.story.stats
                            },
                            values: resData.about.values || prev.values
                        }));
                    }
                }
            } catch (err) {
                console.error("Failed to load settings", err);
                error("Không thể tải nội dung trang giới thiệu");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const currentRes = await fetch(`${BACKEND_URL}/api/settings`);
            const currentData = await currentRes.json();

            const updatedSettings = {
                ...currentData,
                about: data
            };

            const res = await fetch(`${BACKEND_URL}/api/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings)
            });

            if (res.ok) {
                success("Đã lưu nội dung thành công!");
            } else {
                throw new Error("Save failed");
            }
        } catch (err) {
            console.error(err);
            error("Lỗi khi lưu nội dung");
        } finally {
            setSaving(false);
        }
    };

    const updateHero = (key: keyof HeroSettings, value: string) => {
        setData(prev => ({ ...prev, hero: { ...prev.hero, [key]: value } }));
    };

    const updateStory = (key: keyof StorySettings, value: any) => {
        setData(prev => ({ ...prev, story: { ...prev.story, [key]: value } }));
    };

    const updateStat = (index: number, key: keyof StatItem, value: string) => {
        const newStats = [...data.story.stats];
        newStats[index] = { ...newStats[index], [key]: value };
        updateStory('stats', newStats);
    };

    const updateValue = (index: number, key: keyof ValueItem, value: string) => {
        const newValues = [...data.values];
        newValues[index] = { ...newValues[index], [key]: value };
        setData(prev => ({ ...prev, values: newValues }));
    };

    if (loading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Trang Giới thiệu</h1>
                    <p className="text-gray-500 text-sm">Chỉnh sửa nội dung hiển thị trên trang /gioi-thieu.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                        <button
                            onClick={() => setActiveTab('hero')}
                            className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all border-l-4 ${activeTab === 'hero' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium' : 'border-transparent hover:bg-gray-50 text-gray-700'}`}
                        >
                            <Layout className="w-5 h-5" /> Hero Section
                        </button>
                        <button
                            onClick={() => setActiveTab('story')}
                            className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all border-l-4 ${activeTab === 'story' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium' : 'border-transparent hover:bg-gray-50 text-gray-700'}`}
                        >
                            <BookOpen className="w-5 h-5" /> Câu chuyện
                        </button>
                        <button
                            onClick={() => setActiveTab('values')}
                            className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all border-l-4 ${activeTab === 'values' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium' : 'border-transparent hover:bg-gray-50 text-gray-700'}`}
                        >
                            <Heart className="w-5 h-5" /> Giá trị cốt lõi
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">

                    {/* HERO TAB */}
                    {activeTab === 'hero' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Phần mở đầu (Hero)</h3>

                            <ImageUploader
                                label="Hình nền (1920x800)"
                                value={data.hero.image}
                                onChange={(url) => updateHero('image', url)}
                            />

                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề nhỏ (Trên cùng)</label>
                                    <input
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={data.hero.title}
                                        onChange={(e) => updateHero('title', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề chính (Heading)</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none h-20"
                                        value={data.hero.heading}
                                        onChange={(e) => updateHero('heading', e.target.value)}
                                        placeholder="Hỗ trợ xuống dòng"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Gợi ý: Dùng Enter để xuống dòng trong tiêu đề</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none h-24"
                                        value={data.hero.description}
                                        onChange={(e) => updateHero('description', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STORY TAB */}
                    {activeTab === 'story' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Câu chuyện thương hiệu</h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <ImageUploader
                                        label="Hình ảnh minh họa"
                                        value={data.story.image}
                                        onChange={(url) => updateStory('image', url)}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề mục</label>
                                        <input
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={data.story.title}
                                            onChange={(e) => updateStory('title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung câu chuyện</label>
                                        <textarea
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none h-64 resize-y leading-relaxed"
                                            value={data.story.content}
                                            onChange={(e) => updateStory('content', e.target.value)}
                                            placeholder="Nội dung chi tiết..."
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Dùng Enter 2 lần để tách đoạn văn.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-sm font-bold text-gray-900 mb-3">Số liệu thống kê (Stats)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {data.story.stats.map((stat, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100">
                                            <div className="mb-2">
                                                <label className="text-xs text-gray-500 block">Con số (VD: 50+)</label>
                                                <input
                                                    className="w-full font-bold text-emerald-600 border-b border-gray-200 focus:border-emerald-500 outline-none py-1"
                                                    value={stat.value}
                                                    onChange={(e) => updateStat(idx, 'value', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 block">Nhãn (VD: Đối tác)</label>
                                                <input
                                                    className="w-full text-gray-700 border-b border-gray-200 focus:border-emerald-500 outline-none py-1 text-sm"
                                                    value={stat.label}
                                                    onChange={(e) => updateStat(idx, 'label', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VALUES TAB */}
                    {activeTab === 'values' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Giá trị cốt lõi (3 Cột)</h3>

                            <div className="grid gap-6">
                                {data.values.map((val, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                                        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded text-xs font-bold text-gray-400 border">
                                            Cột #{idx + 1}
                                        </div>
                                        <div className="flex gap-4 items-start">
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                                                    <input
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                                                        value={val.title}
                                                        onChange={(e) => updateValue(idx, 'title', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                                    <textarea
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none text-sm"
                                                        value={val.description}
                                                        onChange={(e) => updateValue(idx, 'description', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-gray-600">Icon:</span>
                                                    {(['leaf', 'shield', 'heart'] as const).map(icon => (
                                                        <label key={icon} className="flex items-center gap-1 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`icon-${idx}`}
                                                                checked={val.icon === icon}
                                                                onChange={() => updateValue(idx, 'icon', icon)}
                                                                className="text-emerald-600 focus:ring-emerald-500"
                                                            />
                                                            <span className="capitalize text-sm">{icon}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
