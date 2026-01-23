"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { ArrowLeft, Loader2, MapPin, Truck, CreditCard, CheckCircle, ShieldCheck, Banknote, QrCode } from "lucide-react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { getImageUrl } from "@/shared/utils";
import { AgriImage } from "@/components/ui/AgriImage";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001';

interface Province {
    code: string;
    fullName: string;
    name: string;
}

interface District {
    code: string;
    fullName: string;
    name: string;
}

interface Ward {
    code: string;
    fullName: string;
    name: string;
}

export default function CheckoutPage() {
    const { cartItems, cartTotal, clearCart } = useCart();
    const router = useRouter();
    const { toast, success, error } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        note: "",
        paymentMethod: "cod"
    });

    // Location State
    const [configVersion, setConfigVersion] = useState<string>('v1'); // Default to v1, fetch from settings
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [selectedCity, setSelectedCity] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");

    // Fetch Settings and Provinces on Mount
    useEffect(() => {
        const initCheckout = async () => {
            setIsLoading(true);
            try {
                // 1. Fetch Location Version Setting
                let version = 'v1';
                try {
                    const settingsRes = await fetch(`${BACKEND_URL}/api/settings`);
                    if (settingsRes.ok) {
                        const settings = await settingsRes.json();
                        if (settings.LOCATION_VERSION) {
                            version = settings.LOCATION_VERSION;
                        }
                    }
                } catch (err) {
                    console.warn("Failed to fetch settings, defaulting to v1", err);
                }
                setConfigVersion(version);

                // 2. Fetch Provinces based on version
                const endpoint = version === 'v2'
                    ? `${BACKEND_URL}/api/locations/v2/provinces`
                    : `${BACKEND_URL}/api/locations/provinces`;

                const res = await fetch(endpoint);
                const data = await res.json();
                setProvinces(data);

            } catch (err) {
                console.error("Failed to load initial data", err);
                error("Không thể tải danh sách tỉnh/thành phố");
            } finally {
                setIsLoading(false);
            }
        };

        if (cartItems.length === 0) {
            router.push('/gio-hang');
        } else {
            initCheckout();
        }
    }, [cartItems, router]);

    // Fetch Districts (Only for V1)
    useEffect(() => {
        if (!selectedCity || configVersion === 'v2') {
            setDistricts([]);
            setSelectedDistrict("");
            return;
        }

        const fetchDistricts = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/locations/districts/${selectedCity}`);
                const data = await res.json();
                setDistricts(data);
                setSelectedDistrict("");
                setSelectedWard("");
            } catch (err) {
                console.error("Failed to load districts", err);
            }
        };
        fetchDistricts();
    }, [selectedCity, configVersion]);

    // Fetch Wards
    useEffect(() => {
        const shouldFetchWards = configVersion === 'v1' ? selectedDistrict : selectedCity;

        if (!shouldFetchWards) {
            setWards([]);
            setSelectedWard("");
            return;
        }

        const fetchWards = async () => {
            try {
                let endpoint = '';
                if (configVersion === 'v2') {
                    endpoint = `${BACKEND_URL}/api/locations/v2/wards/${selectedCity}`;
                } else {
                    endpoint = `${BACKEND_URL}/api/locations/wards/${selectedDistrict}`;
                }

                const res = await fetch(endpoint);
                const data = await res.json();
                setWards(data);
                setSelectedWard("");
            } catch (err) {
                console.error("Failed to load wards", err);
            }
        };
        fetchWards();
    }, [selectedDistrict, selectedCity, configVersion]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, paymentMethod: e.target.value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedCity || !selectedWard || (configVersion === 'v1' && !selectedDistrict)) {
            error("Vui lòng chọn đầy đủ địa chỉ giao hàng");
            return;
        }

        setSubmitting(true);

        try {
            // Get Readable Names
            const cityName = provinces.find(p => p.code === selectedCity)?.name || selectedCity;
            const districtName = configVersion === 'v1'
                ? districts.find(d => d.code === selectedDistrict)?.name || ""
                : ""; // V2 has no district
            const wardName = wards.find(w => w.code === selectedWard)?.name || selectedWard;

            const fullAddress = [formData.address, wardName, districtName, cityName].filter(Boolean).join(", ");

            const items = cartItems.map(item => ({
                productId: item.id,
                variantId: item.selectedVariant?.id,
                quantity: item.quantity
            }));

            const payload = {
                customerName: formData.fullName,
                customerPhone: formData.phone,
                customerEmail: formData.email,
                shippingAddress: fullAddress, // Combine for display
                city: cityName,
                district: districtName,
                ward: wardName,
                paymentMethod: formData.paymentMethod,
                note: formData.note,
                items: items
            };

            const res = await fetch(`${BACKEND_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Order failed");
            }

            // Success
            success("Đặt hàng thành công!");
            clearCart();
            router.push('/dat-hang-thanh-cong');

        } catch (err: any) {
            console.error(err);
            error(err.message || "Đặt hàng thất bại. Vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    if (cartItems.length === 0) return null;

    const shippingFee = cartTotal > 500000 ? 0 : 30000;
    const finalTotal = cartTotal + shippingFee;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <Link href="/gio-hang" className="text-gray-500 hover:text-emerald-600 flex items-center mb-2 transition-colors text-sm font-medium">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại giỏ hàng
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Thanh toán</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Customer Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Delivery Info */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center pb-4 border-b border-gray-50">
                                <MapPin className="w-5 h-5 mr-3 text-emerald-600" /> Thông tin giao hàng
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                        placeholder="0912345678"
                                    />
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Tùy chọn)</label>
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="email@example.com"
                                />
                            </div>

                            {/* Dynamic Address Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
                                    <SearchableSelect
                                        options={provinces.map(p => ({ value: p.code, label: p.name || p.fullName }))}
                                        value={selectedCity}
                                        onChange={setSelectedCity}
                                        placeholder="Chọn Tỉnh/Thành"
                                    />
                                </div>

                                {configVersion === 'v1' && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Quận / Huyện <span className="text-red-500">*</span></label>
                                        <SearchableSelect
                                            options={districts.map(d => ({ value: d.code, label: d.name || d.fullName }))}
                                            value={selectedDistrict}
                                            onChange={setSelectedDistrict}
                                            placeholder="Chọn Quận/Huyện"
                                            disabled={!selectedCity}
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {configVersion === 'v2' ? 'Phường / Xã / Thị trấn' : 'Phường / Xã'} <span className="text-red-500">*</span>
                                    </label>
                                    <SearchableSelect
                                        options={wards.map(w => ({ value: w.code, label: w.name || w.fullName }))}
                                        value={selectedWard}
                                        onChange={setSelectedWard}
                                        placeholder="Chọn Phường/Xã"
                                        disabled={configVersion === 'v1' ? !selectedDistrict : !selectedCity}
                                    />
                                </div>
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Số nhà, tên đường..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú vận chuyển</label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:border-transparent outline-none transition-all placeholder:text-gray-400 resize-none"
                                    placeholder="Ví dụ: Giao hàng giờ hành chính..."
                                />
                            </div>
                        </div>

                        {/* 2. Payment Method */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center pb-4 border-b border-gray-50">
                                <CreditCard className="w-5 h-5 mr-3 text-emerald-600" /> Phương thức thanh toán
                            </h2>

                            <div className="flex flex-col gap-3">
                                {/* COD Option */}
                                <label className={`relative border rounded-xl p-4 cursor-pointer flex items-center transition-all ${formData.paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 shadow-sm z-10' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-colors ${formData.paymentMethod === 'cod' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <Banknote className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`block font-bold ${formData.paymentMethod === 'cod' ? 'text-emerald-900' : 'text-gray-900'}`}>Thanh toán khi nhận hàng (COD)</span>
                                            {formData.paymentMethod === 'cod' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                                        </div>
                                        <span className="block text-sm text-gray-500 mt-0.5">Thanh toán bằng tiền mặt khi giao hàng</span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handlePaymentChange}
                                        className="hidden"
                                    />
                                </label>

                                {/* Banking Option */}
                                <label className={`relative border rounded-xl p-4 cursor-pointer flex items-center transition-all ${formData.paymentMethod === 'banking' ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 shadow-sm z-10' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 transition-colors ${formData.paymentMethod === 'banking' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <QrCode className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className={`block font-bold ${formData.paymentMethod === 'banking' ? 'text-emerald-900' : 'text-gray-900'}`}>Chuyển khoản ngân hàng</span>
                                            {formData.paymentMethod === 'banking' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                                        </div>
                                        <span className="block text-sm text-gray-500 mt-0.5">Quét mã QR VietQR (Xử lý tức thì)</span>
                                    </div>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="banking"
                                        checked={formData.paymentMethod === 'banking'}
                                        onChange={handlePaymentChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center pb-4 border-b border-gray-50">
                                <Truck className="w-5 h-5 mr-3 text-emerald-600" /> Đơn hàng của bạn
                            </h2>

                            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                                {cartItems.map((item, idx) => {
                                    const variant = item.selectedVariant;
                                    const price = variant
                                        ? ((variant.salePrice && variant.salePrice > 0) ? variant.salePrice : variant.price)
                                        : (item.salePrice && item.salePrice > 0 ? item.salePrice : item.price);

                                    const variantName = variant ? variant.name : null;
                                    const imageUrl = getImageUrl(variant?.image || item.image || item.images?.[0] || '');

                                    return (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
                                                <AgriImage
                                                    src={imageUrl || "https://placehold.co/100"}
                                                    alt={item.name}
                                                    width={64}
                                                    height={64}
                                                    className="object-cover group-hover:scale-105 transition-transform"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</h4>
                                                {variantName && <p className="text-xs text-gray-500 mt-1 bg-gray-100 inline-block px-1.5 py-0.5 rounded">{variantName}</p>}
                                                <div className="flex justify-between items-center mt-2">
                                                    <p className="text-sm text-gray-500">x {item.quantity}</p>
                                                    <p className="text-sm font-bold text-emerald-600">
                                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="border-t border-gray-50 pt-4 space-y-3">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Tạm tính</span>
                                    <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Phí vận chuyển</span>
                                    {shippingFee === 0 ? (
                                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">Miễn phí</span>
                                    ) : (
                                        <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-end pt-4 border-t border-dashed border-gray-200">
                                    <span className="text-base font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-2xl font-bold text-emerald-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20 active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                                {submitting ? "Đang xử lý..." : "Đặt hàng ngay"}
                            </button>

                            <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500 text-center">
                                <div className="flex items-center justify-center gap-1.5 opacity-80">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Thông tin được bảo mật tuyệt đối 100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
