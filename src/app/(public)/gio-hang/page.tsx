"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShieldCheck, Truck, RefreshCw, Smartphone, ShoppingBag, Ticket } from 'lucide-react';
// Removed mock data imports

// Mock cart data based on existing products
import { useCart } from '@/contexts/CartContext';
import { getImageUrl, formatCurrency } from '@/shared/utils';

export default function CartPage() {
    const router = useRouter();
    const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
    const [coupon, setCoupon] = useState('');

    const subtotal = cartTotal;

    // Mock shipping logic
    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50 px-4">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
                <p className="text-gray-500 mb-8 text-center max-w-md">
                    Có vẻ như bạn chưa chọn sản phẩm nào. Hãy dạo một vòng cửa hàng để tìm những nông sản tươi ngon nhé!
                </p>
                <Link
                    href="/san-pham"
                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
                >
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-emerald-600">Trang chủ</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">Giỏ hàng</span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng ({cartItems.length} sản phẩm)</h1>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Cart Items List */}
                    <div className="lg:w-2/3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase">
                                <div className="col-span-6">Sản phẩm</div>
                                <div className="col-span-2 text-center">Đơn giá</div>
                                <div className="col-span-2 text-center">Số lượng</div>
                                <div className="col-span-2 text-right">Thành tiền</div>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item, idx) => {
                                    const variant = item.selectedVariant;
                                    const price = variant
                                        ? ((variant.salePrice && variant.salePrice > 0) ? variant.salePrice : variant.price)
                                        : (item.salePrice && item.salePrice > 0 ? item.salePrice : item.price);

                                    const itemTotal = price * item.quantity;
                                    const variantName = variant ? variant.name : null;
                                    const imageUrl = getImageUrl(variant?.image || item.image || item.images?.[0] || '');

                                    return (
                                        <div key={idx} className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center group hover:bg-gray-50/50 transition-colors">
                                            {/* Product Info */}
                                            <div className="col-span-6 w-full flex items-center gap-4">
                                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                    <img src={imageUrl || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/san-pham/${item.slug || item.id}`} className="font-bold text-gray-900 hover:text-emerald-600 transition-colors text-lg line-clamp-1">
                                                        {item.name}
                                                    </Link>
                                                    {variantName && (
                                                        <div className="text-sm text-gray-500 mt-1 bg-gray-100 px-2 py-0.5 rounded w-fit">
                                                            Phân loại: {variantName}
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => removeFromCart(idx)}
                                                        className="text-red-500 text-sm font-medium hover:underline mt-2 flex items-center gap-1 md:hidden"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Xóa
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Price (Desktop) */}
                                            <div className="col-span-2 text-center hidden md:block font-medium text-gray-600">
                                                {price.toLocaleString()}đ
                                            </div>

                                            {/* Quantity Control */}
                                            <div className="col-span-2 w-full flex justify-between md:justify-center items-center">
                                                <span className="md:hidden text-sm font-medium text-gray-500">Số lượng:</span>
                                                <div className="flex items-center bg-white border border-gray-200 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(idx, -1)}
                                                        className="p-2 text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="w-8 text-center font-bold text-sm text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(idx, 1)}
                                                        className="p-2 text-gray-600 hover:bg-gray-50 hover:text-emerald-600 transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Total & Action */}
                                            <div className="col-span-2 w-full flex justify-between md:block md:text-right items-center">
                                                <span className="md:hidden text-sm font-medium text-gray-500">Thành tiền:</span>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="font-bold text-emerald-600 text-lg">
                                                        {itemTotal.toLocaleString()}đ
                                                    </span>
                                                    <button
                                                        onClick={() => removeFromCart(idx)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors hidden md:block"
                                                        title="Xóa sản phẩm"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link href="/san-pham" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
                                <ArrowLeft className="w-4 h-4" /> Tiếp tục xem sản phẩm
                            </Link>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Cộng giỏ hàng</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span className="font-medium">{subtotal.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    {shippingFee === 0 ? (
                                        <span className="text-emerald-600 font-medium">Miễn phí</span>
                                    ) : (
                                        <span className="font-medium">{shippingFee.toLocaleString()}đ</span>
                                    )}
                                </div>
                                {shippingFee === 0 && (
                                    <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg text-center">
                                        Đơn hàng đã đủ điều kiện Freeship
                                    </div>
                                )}
                            </div>

                            {/* Coupon */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mã giảm giá</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            placeholder="Nhập mã..."
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                            value={coupon}
                                            onChange={(e) => setCoupon(e.target.value)}
                                        />
                                        <Ticket className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    </div>
                                    <button className="px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors">
                                        Áp dụng
                                    </button>
                                </div>
                            </div>

                            <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
                                <div className="flex justify-between items-end">
                                    <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                                    <span className="font-extrabold text-2xl text-emerald-600">{total.toLocaleString()}đ</span>
                                </div>
                                <p className="text-xs text-gray-400 text-right mt-1">(Đã bao gồm VAT nếu có)</p>
                            </div>

                            <button
                                onClick={() => router.push('/thanh-toan')}
                                className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 flex items-center justify-center gap-2 active:scale-[0.98]"
                            >
                                Tiến hành thanh toán <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
