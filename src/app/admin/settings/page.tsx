"use client";

import React, { useState, useEffect } from 'react';
import {
    Save,
    Store,
    Truck,
    CreditCard,
    Bell,
    Lock,
    Globe,
    Mail,
    MapPin,
    Phone,
    Facebook,
    Image as ImageIcon,
    Instagram,
    Youtube,
    Smartphone,
    Server,
    Shield,
    Key,
    Eye,
    EyeOff,
    AlertTriangle,
    Loader2,
    Map,
    Edit
} from 'lucide-react';
import ImageUploader from '@/components/common/ImageUploader';
import { useToast } from '@/contexts/ToastContext';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

type SettingsState = {
    LOCATION_VERSION?: string;
    general?: any;
    store?: any;
    payment?: any;
    shipping?: any;
    notifications?: any;
    security?: any;
    [key: string]: any;
};

export default function SettingsPage() {
    const { toast, success, error } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [showPassword, setShowPassword] = useState(false);
    const [editSmtpPass, setEditSmtpPass] = useState(false);

    // Settings State
    const [settings, setSettings] = useState<SettingsState>({});

    const TABS = [
        { id: 'general', label: 'Thông tin chung', icon: Globe, desc: 'Tiêu đề, logo, ngôn ngữ' },
        { id: 'store', label: 'Cửa hàng & Liên hệ', icon: Store, desc: 'Địa chỉ, hotline, mạng xã hội' },
        { id: 'location', label: 'Địa chỉ (Location)', icon: Map, desc: 'Cấu hình hành chính V1/V2' }, // New Tab
        { id: 'shipping', label: 'Vận chuyển', icon: Truck, desc: 'Phí ship, đối tác vận chuyển' },
        { id: 'payment', label: 'Thanh toán', icon: CreditCard, desc: 'Ngân hàng, ví điện tử' },
        { id: 'notifications', label: 'Thông báo', icon: Bell, desc: 'Email, mẫu tin nhắn' },
        { id: 'security', label: 'Bảo mật', icon: Lock, desc: 'Mật khẩu, phân quyền' },
    ];

    // Fetch initial settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setSettings(data);
                }
            } catch (err) {
                console.error("Failed to load settings", err);
                error("Không thể tải cài đặt");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                success("Đã lưu cài đặt thành công!");
            } else {
                throw new Error("Save failed");
            }
        } catch (err) {
            console.error(err);
            error("Lỗi khi lưu cài đặt");
        } finally {
            setSaving(false);
        }
    };

    const updateNestedSetting = (category: string, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    if (loading) return <div className="p-8 flex items-center justify-center"><Loader2 className="animate-spin mr-2" /> Đang tải dữ liệu...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <style>{`
                /* Hide number input arrows */
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                  -webkit-appearance: none; 
                  margin: 0; 
                }
                input[type=number] {
                  -moz-appearance: textfield;
                }
              `}</style>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Cấu hình hệ thống</h1>
                    <p className="text-gray-500 text-sm">Quản lý thông tin website và các thiết lập vận hành.</p>
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
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-72 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`group flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-xl transition-all ${activeTab === tab.id
                                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-emerald-600'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                                    <div>
                                        <div className="font-semibold text-sm">{tab.label}</div>
                                        <div className={`text-xs mt-0.5 ${activeTab === tab.id ? 'text-emerald-100' : 'text-gray-400'}`}>{tab.desc}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0 space-y-6">

                    {/* --- TAB: GENERAL --- */}
                    {activeTab === 'general' && settings.general && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Nhận diện thương hiệu</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Logo Upload */}
                                    <ImageUploader
                                        label="Logo Website"
                                        value={settings.general.logo}
                                        onChange={(url) => updateNestedSetting('general', 'logo', url)}
                                        placeholder="Tải lên logo mới"
                                    />

                                    {/* Favicon Upload */}
                                    {/* Note: settings.general.favicon is likely missing from initial state, ensure we handle it if user wants it, or just use a generic field */}
                                    <ImageUploader
                                        label="Favicon"
                                        value={settings.general.favicon}
                                        onChange={(url) => updateNestedSetting('general', 'favicon', url)}
                                        placeholder="Tải lên favicon"
                                        description="ICO, PNG 32x32px"
                                    />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Thông tin cơ bản</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề Website (Site Title)</label>
                                        <input
                                            type="text"
                                            value={settings.general.siteTitle || ''}
                                            onChange={(e) => updateNestedSetting('general', 'siteTitle', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Hiển thị trên thanh tiêu đề trình duyệt và kết quả tìm kiếm.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn (Tagline)</label>
                                        <input
                                            type="text"
                                            value={settings.general.tagline || ''}
                                            onChange={(e) => updateNestedSetting('general', 'tagline', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngôn ngữ mặc định</label>
                                            <select
                                                value={settings.general.language || 'vi'}
                                                onChange={(e) => updateNestedSetting('general', 'language', e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
                                            >
                                                <option value="vi">Tiếng Việt</option>
                                                <option value="en">English</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Múi giờ</label>
                                            <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white">
                                                <option>(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Cấu hình SEO Mặc định</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Từ khóa trang chủ (Meta Keywords)</label>
                                        <textarea
                                            rows={2}
                                            value={settings.general.metaKeywords || ''}
                                            onChange={(e) => updateNestedSetting('general', 'metaKeywords', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả trang chủ (Meta Description)</label>
                                        <textarea
                                            rows={3}
                                            value={settings.general.metaDescription || ''}
                                            onChange={(e) => updateNestedSetting('general', 'metaDescription', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: STORE --- */}
                    {activeTab === 'store' && settings.store && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Thông tin liên hệ</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email liên hệ</label>
                                        <div className="relative">
                                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="email"
                                                value={settings.store.email || ''}
                                                onChange={(e) => updateNestedSetting('store', 'email', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hotline</label>
                                        <div className="relative">
                                            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={settings.store.phone || ''}
                                                onChange={(e) => updateNestedSetting('store', 'phone', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cửa hàng</label>
                                        <div className="relative">
                                            <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="text"
                                                value={settings.store.address || ''}
                                                onChange={(e) => updateNestedSetting('store', 'address', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bản đồ (Google Maps Iframe URL)</label>
                                        <input
                                            type="text"
                                            value={settings.store.mapUrl || ''}
                                            onChange={(e) => updateNestedSetting('store', 'mapUrl', e.target.value)}
                                            placeholder="https://www.google.com/maps/embed?..."
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Mạng xã hội</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                            <Facebook className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Facebook Fanpage</label>
                                            <input
                                                type="text"
                                                value={settings.store.facebook || ''}
                                                onChange={(e) => updateNestedSetting('store', 'facebook', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 flex-shrink-0">
                                            <Instagram className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Instagram</label>
                                            <input
                                                type="text"
                                                value={settings.store.instagram || ''}
                                                onChange={(e) => updateNestedSetting('store', 'instagram', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0">
                                            <Youtube className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Youtube Channel</label>
                                            <input
                                                type="text"
                                                value={settings.store.youtube || ''}
                                                onChange={(e) => updateNestedSetting('store', 'youtube', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                                placeholder="https://youtube.com/..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                                            <Smartphone className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Zalo Official Account</label>
                                            <input
                                                type="text"
                                                value={settings.store.zalo || ''}
                                                onChange={(e) => updateNestedSetting('store', 'zalo', e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                                                placeholder="https://zalo.me/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: LOCATION (NEW) --- */}
                    {activeTab === 'location' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100 flex items-center">
                                    <Map className="w-5 h-5 mr-2 text-emerald-600" /> Cấu hình Địa giới hành chính
                                </h3>

                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">Phiên bản dữ liệu sử dụng</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className={`
                                            relative p-4 cursor-pointer rounded-xl border-2 transition-all
                                            ${settings.LOCATION_VERSION === 'v1' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}
                                        `}>
                                            <input
                                                type="radio"
                                                name="location_version"
                                                value="v1"
                                                checked={settings.LOCATION_VERSION === 'v1'}
                                                onChange={(e) => setSettings({ ...settings, LOCATION_VERSION: e.target.value })}
                                                className="absolute top-4 right-4 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                            />
                                            <div className="flex items-center mb-2">
                                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-bold mr-2">V1</span>
                                                <h3 className="font-bold text-gray-900">Hiện hành (Standard)</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Cấu trúc 3 cấp: Tỉnh/Thành - Quận/Huyện - Phường/Xã.
                                            </p>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <MapPin className="w-3 h-3 mr-1" /> Bao gồm 63 Tỉnh thành
                                            </div>
                                        </label>

                                        <label className={`
                                            relative p-4 cursor-pointer rounded-xl border-2 transition-all
                                            ${settings.LOCATION_VERSION === 'v2' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}
                                        `}>
                                            <input
                                                type="radio"
                                                name="location_version"
                                                value="v2"
                                                checked={settings.LOCATION_VERSION === 'v2'}
                                                onChange={(e) => setSettings({ ...settings, LOCATION_VERSION: e.target.value })}
                                                className="absolute top-4 right-4 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                            />
                                            <div className="flex items-center mb-2">
                                                <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded font-bold mr-2">V2</span>
                                                <h3 className="font-bold text-gray-900">Chuẩn hóa 2025</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Cấu trúc 2 cấp: Tỉnh/Thành - Xã/Phường/Thị trấn (Bỏ cấp Quận/Huyện).
                                            </p>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <MapPin className="w-3 h-3 mr-1" /> Tối ưu hóa vận chuyển
                                            </div>
                                        </label>
                                    </div>
                                    <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm border border-yellow-200">
                                        Lưu ý: Thay đổi phiên bản này sẽ ảnh hưởng trực tiếp đến dữ liệu địa chỉ khách hàng nhập tại trang Thanh toán.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: SHIPPING --- */}
                    {activeTab === 'shipping' && settings.shipping && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Phí vận chuyển tiêu chuẩn</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phí nội thành</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={settings.shipping.feeInner || 0}
                                                onChange={(e) => updateNestedSetting('shipping', 'feeInner', Number(e.target.value))}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">VNĐ</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phí ngoại thành / Tỉnh khác</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={settings.shipping.feeOuter || 0}
                                                onChange={(e) => updateNestedSetting('shipping', 'feeOuter', Number(e.target.value))}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">VNĐ</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={settings.shipping.freeShipEnabled || false}
                                        onChange={(e) => updateNestedSetting('shipping', 'freeShipEnabled', e.target.checked)}
                                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                                    />
                                    <div className="flex-1">
                                        <label className="block text-sm font-bold text-emerald-900">Miễn phí vận chuyển (Freeship)</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-emerald-700">Áp dụng cho đơn hàng từ</span>
                                            <input
                                                type="number"
                                                value={settings.shipping.freeShipThreshold || 0}
                                                onChange={(e) => updateNestedSetting('shipping', 'freeShipThreshold', Number(e.target.value))}
                                                className="w-32 px-2 py-1 text-sm border border-emerald-300 rounded bg-white focus:outline-none focus:border-emerald-500"
                                            />
                                            <span className="text-sm text-emerald-700">VNĐ trở lên</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Đối tác vận chuyển</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500">GHN</div>
                                            <div>
                                                <div className="font-bold text-gray-900">Giao Hàng Nhanh</div>
                                                <div className="text-xs text-gray-500">Tích hợp API tính phí tự động</div>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={settings.shipping.ghn || false}
                                                onChange={(e) => updateNestedSetting('shipping', 'ghn', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-500">GHTK</div>
                                            <div>
                                                <div className="font-bold text-gray-900">Giao Hàng Tiết Kiệm</div>
                                                <div className="text-xs text-gray-500">Tích hợp API tính phí tự động</div>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={settings.shipping.ghtk || false}
                                                onChange={(e) => updateNestedSetting('shipping', 'ghtk', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: PAYMENT --- */}
                    {activeTab === 'payment' && settings.payment && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Phương thức thanh toán</h3>

                                {/* COD */}
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Truck className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                                                <div className="text-xs text-gray-500">Khách hàng thanh toán tiền mặt cho shipper</div>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={settings.payment.cod || false}
                                                onChange={(e) => updateNestedSetting('payment', 'cod', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                </div>

                                {/* Bank Transfer */}
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-gray-900">Chuyển khoản ngân hàng</div>
                                                <div className="text-xs text-gray-500">Hiển thị thông tin chuyển khoản khi đặt hàng</div>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={settings.payment.bankTransfer || false}
                                                onChange={(e) => updateNestedSetting('payment', 'bankTransfer', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>

                                    {/* Bank Details */}
                                    {settings.payment.bankTransfer && (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tên Ngân Hàng</label>
                                                <input
                                                    type="text"
                                                    value={settings.payment.bankName || ''}
                                                    onChange={(e) => updateNestedSetting('payment', 'bankName', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Chi nhánh</label>
                                                <input
                                                    type="text"
                                                    value={settings.payment.bankBranch || ''}
                                                    onChange={(e) => updateNestedSetting('payment', 'bankBranch', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Số tài khoản</label>
                                                <input
                                                    type="text"
                                                    value={settings.payment.bankAccount || ''}
                                                    onChange={(e) => updateNestedSetting('payment', 'bankAccount', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Chủ tài khoản</label>
                                                <input
                                                    type="text"
                                                    value={settings.payment.bankHolder || ''}
                                                    onChange={(e) => updateNestedSetting('payment', 'bankHolder', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:border-emerald-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Nội dung chuyển khoản</label>
                                                <div className="text-xs text-gray-600">Hệ thống sẽ tự động tạo nội dung: <strong>AGRIMART [Mã đơn hàng]</strong></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Momo */}
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Smartphone className="w-5 h-5" /></div>
                                            <div>
                                                <div className="font-bold text-gray-900">Ví điện tử MoMo</div>
                                                <div className="text-xs text-gray-500">Quét mã QR để thanh toán</div>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={settings.payment.momo || false}
                                                onChange={(e) => updateNestedSetting('payment', 'momo', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: NOTIFICATIONS --- */}
                    {activeTab === 'notifications' && settings.notifications && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Email Settings */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                                    <Server className="w-5 h-5 text-emerald-600" /> Cấu hình Email Server (SMTP)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                                        <input
                                            type="text"
                                            value={settings.notifications.smtpHost || ''}
                                            onChange={(e) => updateNestedSetting('notifications', 'smtpHost', e.target.value)}
                                            placeholder="smtp.gmail.com"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                                        <input
                                            type="number"
                                            value={settings.notifications.smtpPort || 587}
                                            onChange={(e) => updateNestedSetting('notifications', 'smtpPort', Number(e.target.value))}
                                            placeholder="587"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Username / Email</label>
                                        <input
                                            type="email"
                                            value={settings.notifications.smtpUsername || ''}
                                            onChange={(e) => updateNestedSetting('notifications', 'smtpUsername', e.target.value)}
                                            placeholder="notifications@agrimart.vn"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password / App Password</label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                disabled={!editSmtpPass}
                                                readOnly={!editSmtpPass}
                                                autoComplete="new-password"
                                                value={settings.notifications.smtpPassword || ''}
                                                onChange={(e) => updateNestedSetting('notifications', 'smtpPassword', e.target.value)}
                                                placeholder={editSmtpPass ? "Nhập mật khẩu ứng dụng..." : "••••••••••••••••"}
                                                className={`w-full pl-4 pr-10 py-2 border border-gray-200 rounded-xl outline-none transition-all ${editSmtpPass
                                                    ? 'bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                            />
                                            <button
                                                onClick={() => setEditSmtpPass(!editSmtpPass)}
                                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${editSmtpPass
                                                    ? 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                                                    : 'text-emerald-600 hover:text-emerald-700 hover:bg-white pointer-events-auto'
                                                    }`}
                                                title={editSmtpPass ? "Khóa lại" : "Chỉnh sửa"}
                                                type="button"
                                            >
                                                {editSmtpPass ? <Lock className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <label className="block text-sm font-medium text-gray-700">Tên người gửi</label>
                                            <span className="text-xs text-gray-400">(Hiển thị trong hộp thư khách hàng)</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={settings.notifications.fromName || 'AgriMart Support'}
                                            onChange={(e) => updateNestedSetting('notifications', 'fromName', e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notification Events */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-emerald-600" /> Sự kiện thông báo
                                </h3>
                                <div className="space-y-4">
                                    {[
                                        { key: 'notifyNewOrder', label: 'Gửi email xác nhận khi có đơn hàng mới', desc: 'Gửi cho khách hàng ngay sau khi đặt hàng thành công.' },
                                        { key: 'notifyShipping', label: 'Thông báo khi đơn hàng được vận chuyển', desc: 'Gửi mã vận đơn và link theo dõi.' },
                                        { key: 'notifyCompleted', label: 'Thông báo khi đơn hàng hoàn thành', desc: 'Cảm ơn khách hàng và xin đánh giá.' },
                                        { key: 'notifyNewMember', label: 'Gửi email chào mừng thành viên mới', desc: 'Khi khách hàng đăng ký tài khoản.' },
                                        { key: 'notifyAdminNewOrder', label: 'Thông báo đơn hàng mới cho Admin', desc: 'Gửi email cho ban quản trị khi có đơn mới.' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{item.label}</div>
                                                <div className="text-xs text-gray-500">{item.desc}</div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={settings.notifications[item.key] || false}
                                                    onChange={(e) => updateNestedSetting('notifications', item.key, e.target.checked)}
                                                />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: SECURITY --- */}
                    {activeTab === 'security' && settings.security && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                            {/* Password Change */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                                    <Key className="w-5 h-5 text-emerald-600" /> Đổi mật khẩu quản trị
                                </h3>
                                <div className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                            <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nhập lại mật khẩu</label>
                                            <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
                                        </div>
                                    </div>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                                        Cập nhật mật khẩu
                                    </button>
                                </div>
                            </div>

                            {/* 2FA & Session */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-600" /> Bảo mật nâng cao
                                </h3>

                                <div className="space-y-6">
                                    {/* 2FA Toggle */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-3">
                                            <div className="p-2 bg-emerald-100 rounded-lg h-fit">
                                                <Smartphone className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">Xác thực 2 bước (2FA)</div>
                                                <div className="text-xs text-gray-500 max-w-md">Yêu cầu mã OTP gửi về email hoặc ứng dụng Authenticator khi đăng nhập trên thiết bị mới.</div>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={settings.security.twoFactorEnabled || false}
                                                onChange={(e) => updateNestedSetting('security', 'twoFactorEnabled', e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </label>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6">
                                        <div className="flex gap-3 mb-4">
                                            <div className="p-2 bg-amber-100 rounded-lg h-fit">
                                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">Chính sách phiên đăng nhập</div>
                                                <div className="text-xs text-gray-500">Tự động đăng xuất sau thời gian không hoạt động.</div>
                                            </div>
                                        </div>
                                        <div className="ml-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian timeout (phút)</label>
                                                <input
                                                    type="number"
                                                    value={settings.security.sessionTimeout || 30}
                                                    onChange={(e) => updateNestedSetting('security', 'sessionTimeout', Number(e.target.value))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Số lần đăng nhập sai tối đa</label>
                                                <input
                                                    type="number"
                                                    value={settings.security.maxLoginAttempts || 5}
                                                    onChange={(e) => updateNestedSetting('security', 'maxLoginAttempts', Number(e.target.value))}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div >
    );
};
