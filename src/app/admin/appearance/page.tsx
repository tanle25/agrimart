"use client";

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Monitor, Square, Plus, Trash2, Edit2, GripVertical, Check, X as XIcon, Shuffle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import ImageUploader from '@/components/common/ImageUploader';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

// --- Types ---

type BannerItem = {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonLink: string;
    showButton: boolean;
    active: boolean;
    tag?: string; // Only for Promo
};

type SectionSettings = {
    mode: 'manual' | 'random';
    items: BannerItem[];
};

type AppearanceState = {
    hero: SectionSettings;
    promoBanner: SectionSettings;
};

// --- Defaults ---

const DEFAULT_HERO_ITEM: BannerItem = {
    id: 'default_hero',
    title: "Tiêu đề mới",
    subtitle: "Mô tả ngắn gọn về chương trình",
    image: "",
    buttonText: "Mua ngay",
    buttonLink: "/san-pham",
    showButton: true,
    active: true
};

const DEFAULT_PROMO_ITEM: BannerItem = {
    id: 'default_promo',
    title: "Tiêu đề khuyến mãi",
    subtitle: "Phụ đề",
    tag: "HOT",
    image: "",
    buttonText: "Xem ngay",
    buttonLink: "/san-pham",
    showButton: true,
    active: true
};

const DEFAULT_SETTINGS: AppearanceState = {
    hero: {
        mode: 'manual',
        items: []
    },
    promoBanner: {
        mode: 'manual',
        items: []
    }
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function AppearancePage() {
    const { success, error } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<AppearanceState>(DEFAULT_SETTINGS);
    const [activeTab, setActiveTab] = useState<'hero' | 'promoBanner'>('hero');

    // UI State for Editing
    const [editingItem, setEditingItem] = useState<BannerItem | null>(null);
    const [isEditingHero, setIsEditingHero] = useState(true); // true = hero, false = promoBanner

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/settings`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.appearance) {
                        // Migration logic: Handle old format if exists
                        const loaded = data.appearance;

                        // Ensure structure exists (migration from V1 single object to list)
                        const finalSettings = { ...DEFAULT_SETTINGS };

                        if (loaded.hero && !Array.isArray(loaded.hero.items)) {
                            // Convert old single object to list
                            finalSettings.hero.items = [{ ...DEFAULT_HERO_ITEM, ...loaded.hero, id: generateId(), active: true }];
                        } else if (loaded.hero) {
                            finalSettings.hero = loaded.hero;
                        }

                        if (loaded.promoBanner && !Array.isArray(loaded.promoBanner.items)) {
                            // Convert old single object to list
                            finalSettings.promoBanner.items = [{ ...DEFAULT_PROMO_ITEM, ...loaded.promoBanner, id: generateId(), active: true }];
                        } else if (loaded.promoBanner) {
                            finalSettings.promoBanner = loaded.promoBanner;
                        }

                        setSettings(finalSettings);
                    }
                }
            } catch (err) {
                console.error("Failed to load settings", err);
                error("Không thể tải cài đặt giao diện");
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
                appearance: settings
            };

            const res = await fetch(`${BACKEND_URL}/api/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings)
            });

            if (res.ok) {
                success("Đã lưu giao diện thành công!");
            } else {
                throw new Error("Save failed");
            }
        } catch (err) {
            console.error(err);
            error("Lỗi khi lưu giao diện");
        } finally {
            setSaving(false);
        }
    };

    // --- Actions ---

    const addNewItem = (section: 'hero' | 'promoBanner') => {
        const newItem = section === 'hero' ? { ...DEFAULT_HERO_ITEM } : { ...DEFAULT_PROMO_ITEM };
        newItem.id = generateId();

        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                items: [...prev[section].items, newItem]
            }
        }));

        // Automatically open edit for new item
        setEditingItem(newItem);
        setIsEditingHero(section === 'hero');
    };

    const deleteItem = (section: 'hero' | 'promoBanner', id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa banner này?")) return;
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                items: prev[section].items.filter(i => i.id !== id)
            }
        }));
        if (editingItem?.id === id) setEditingItem(null);
    };

    const toggleActive = (section: 'hero' | 'promoBanner', id: string) => {
        setSettings(prev => {
            const currentItems = prev[section].items;
            const updatedItems = currentItems.map(item => {
                if (item.id === id) return { ...item, active: !item.active };

                // If Manual Mode, enforce single active? 
                // Let's implement Radio behavior if desired, or simpler: Allow multiple actives, 
                // but Frontend just picks the FIRST active one in Manual Mode.
                // It's less confusing for user if they can toggle freely.
                return item;
            });
            return {
                ...prev,
                [section]: { ...prev[section], items: updatedItems }
            };
        });
    };

    const toggleMode = (section: 'hero' | 'promoBanner') => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                mode: prev[section].mode === 'manual' ? 'random' : 'manual'
            }
        }));
    };

    const updateEditingItem = (key: keyof BannerItem, value: any) => {
        if (!editingItem) return;
        const updated = { ...editingItem, [key]: value };
        setEditingItem(updated);

        // Reflect change in main state immediately
        const section = isEditingHero ? 'hero' : 'promoBanner';
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                items: prev[section].items.map(i => i.id === updated.id ? updated : i)
            }
        }));
    };

    // --- Renderers ---

    const renderList = (section: 'hero' | 'promoBanner') => {
        const data = settings[section];
        const isHero = section === 'hero';

        return (
            <div className="space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${data.mode === 'random' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {data.mode === 'random' ? <Shuffle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="font-bold text-gray-900 text-sm">Chế độ hiển thị: {data.mode === 'random' ? 'Ngẫu nhiên' : 'Thủ công (Ưu tiên)'}</div>
                            <div className="text-xs text-gray-500">
                                {data.mode === 'random'
                                    ? 'Hệ thống sẽ chọn ngẫu nhiên 1 trong các banner đang bật.'
                                    : 'Hệ thống sẽ hiển thị banner ĐẦU TIÊN đang bật trong danh sách.'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => toggleMode(section)}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                    >
                        Đổi chế độ
                    </button>
                </div>

                {/* Items List */}
                <div className="grid grid-cols-1 gap-4">
                    {data.items.map((item, index) => (
                        <div
                            key={item.id}
                            className={`
                                relative border rounded-xl p-4 flex gap-4 items-center bg-white transition-all
                                ${!item.active ? 'opacity-60 grayscale bg-gray-50' : 'shadow-sm hover:shadow-md border-gray-200'}
                                ${editingItem?.id === item.id ? 'ring-2 ring-emerald-500 border-emerald-500' : ''}
                            `}
                        >
                            {/* Drag Handle (Visual only for now) */}
                            <GripVertical className="w-5 h-5 text-gray-300 cursor-move" />

                            {/* Thumbnail */}
                            <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                {item.image ? (
                                    <img src={item.image} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate text-sm">{item.title || 'Chưa đặt tên'}</h4>
                                <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {item.showButton && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded border border-emerald-100">CTA: ON</span>}
                                    {isHero ? null : <span className="text-[10px] bg-yellow-50 text-yellow-600 px-1.5 py-0.5 rounded border border-yellow-100">{item.tag || 'No Tag'}</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleActive(section, item.id)}
                                    title={item.active ? "Đang bật (Click để tắt)" : "Đang tắt (Click để bật)"}
                                    className={`p-2 rounded-lg transition-colors ${item.active ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setEditingItem(item); setIsEditingHero(isHero); }}
                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => deleteItem(section, item.id)}
                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => addNewItem(section)}
                        className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-medium hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm Banner mới
                    </button>
                </div>
            </div>
        );
    };

    if (loading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý giao diện Nâng cao</h1>
                    <p className="text-gray-500 text-sm">Quản lý banner, chuyển đổi chế độ hiển thị và nút kêu gọi hành động.</p>
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
                <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                        <button
                            onClick={() => { setActiveTab('hero'); setEditingItem(null); }}
                            className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all border-l-4 ${activeTab === 'hero'
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-transparent hover:bg-gray-50'
                                }`}
                        >
                            <Monitor className={`w-5 h-5 flex-shrink-0 ${activeTab === 'hero' ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <div>
                                <div className={`font-medium text-sm ${activeTab === 'hero' ? 'text-emerald-900' : 'text-gray-700'}`}>Hero Section</div>
                                <div className={`text-xs mt-0.5 ${activeTab === 'hero' ? 'text-emerald-600' : 'text-gray-400'}`}>{settings.hero.items.filter(i => i.active).length} đang bật</div>
                            </div>
                        </button>
                        <button
                            onClick={() => { setActiveTab('promoBanner'); setEditingItem(null); }}
                            className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all border-l-4 ${activeTab === 'promoBanner'
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-transparent hover:bg-gray-50'
                                }`}
                        >
                            <Square className={`w-5 h-5 flex-shrink-0 ${activeTab === 'promoBanner' ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <div>
                                <div className={`font-medium text-sm ${activeTab === 'promoBanner' ? 'text-emerald-900' : 'text-gray-700'}`}>Promo Banner</div>
                                <div className={`text-xs mt-0.5 ${activeTab === 'promoBanner' ? 'text-emerald-600' : 'text-gray-400'}`}>{settings.promoBanner.items.filter(i => i.active).length} đang bật</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                    {/* List View */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                            {activeTab === 'hero' ? 'Danh sách Banner Hero' : 'Danh sách Banner Quảng cáo'}
                        </h3>
                        {renderList(activeTab)}
                    </div>
                </div>

                {/* Edit Panel (Right Sidebar or Modal) */}
                {editingItem && (
                    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 p-6 overflow-y-auto border-l border-gray-200 animate-in slide-in-from-right duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa Banner</h3>
                            <button onClick={() => setEditingItem(null)} className="p-2 hover:bg-gray-100 rounded-full">
                                <XIcon className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <ImageUploader
                                label={isEditingHero ? "Hình nền (1920x800)" : "Hình ảnh (600x800)"}
                                value={editingItem.image}
                                onChange={(url) => updateEditingItem('image', url)}
                                placeholder="Tải ảnh lên"
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề chính</label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    value={editingItem.title}
                                    onChange={(e) => updateEditingItem('title', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phụ đề / Mô tả</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                                    value={editingItem.subtitle}
                                    onChange={(e) => updateEditingItem('subtitle', e.target.value)}
                                />
                            </div>

                            {!isEditingHero && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tag / Nhãn dán</label>
                                    <input
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={editingItem.tag || ''}
                                        onChange={(e) => updateEditingItem('tag', e.target.value)}
                                        placeholder="VD: KHUYẾN MÃI"
                                    />
                                </div>
                            )}

                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm font-bold text-gray-900">Nút kêu gọi hành động (CTA)</label>
                                    <div
                                        onClick={() => updateEditingItem('showButton', !editingItem.showButton)}
                                        className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${editingItem.showButton ? 'bg-emerald-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${editingItem.showButton ? 'translate-x-6' : ''}`} />
                                    </div>
                                </div>

                                {editingItem.showButton && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Chữ trên nút</label>
                                            <input
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                value={editingItem.buttonText}
                                                onChange={(e) => updateEditingItem('buttonText', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Liên kết (Link)</label>
                                            <input
                                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                                                value={editingItem.buttonLink}
                                                onChange={(e) => updateEditingItem('buttonLink', e.target.value)}
                                                placeholder="/san-pham"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-8 flex gap-4">
                                <button
                                    onClick={() => setEditingItem(null)} // Close panel
                                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700"
                                >
                                    Xong (Đóng)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
