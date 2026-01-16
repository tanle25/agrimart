"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Download,
    X,
    MapPin,
    Phone,
    Mail,
    Package,
    CreditCard,
    Printer,
    Send,
    User,
    Calendar,
    Eye,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface OrderItem {
    id: number;
    productId: number;
    variantId?: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
}

interface Order {
    id: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: string;
    city?: string;
    district?: string;
    ward?: string; // Corrected from ward?
    note?: string;
    paymentMethod: string;
    totalAmount: number;
    shippingFee: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
}

const ORDER_STEPS = [
    { key: 'pending', label: 'Chờ xử lý' },
    { key: 'processing', label: 'Đang đóng gói' },
    { key: 'shipped', label: 'Đang giao' },
    { key: 'completed', label: 'Hoàn thành' }
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
        case 'pending': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
        case 'processing': return 'bg-blue-100 text-blue-700 border border-blue-200';
        case 'shipped': return 'bg-purple-100 text-purple-700 border border-purple-200';
        case 'cancelled': return 'bg-red-100 text-red-700 border border-red-200';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'completed': return 'Hoàn thành';
        case 'pending': return 'Chờ xử lý';
        case 'processing': return 'Đang đóng gói';
        case 'shipped': return 'Đang giao';
        case 'cancelled': return 'Đã hủy';
        default: return status;
    }
};

export default function OrderManagerPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { error: toastError, success } = useToast();

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
            });
            if (statusFilter && statusFilter !== 'Tất cả trạng thái') {
                params.append('status', statusFilter);
            }
            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'}/api/orders?${params}`);
            if (!res.ok) throw new Error("Failed to fetch orders");
            const data = await res.json();

            setOrders(data.data);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error(error);
            toastError("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter, debouncedSearch]);

    const handleOpenOrder = (order: Order) => {
        setSelectedOrder(order);
        setTimeout(() => setIsVisible(true), 10);
    };

    const handleCloseOrder = () => {
        setIsVisible(false);
        setTimeout(() => setSelectedOrder(null), 300);
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedOrder) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8001'}/api/orders/${selectedOrder.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error("Failed to update status");

            const updatedOrder = await res.json();
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
            setSelectedOrder(updatedOrder);
            success(`Đã cập nhật trạng thái đơn hàng #${updatedOrder.id}`);
        } catch (error) {
            console.error(error);
            toastError("Cập nhật trạng thái thất bại");
        }
    };

    // Helper to determine active step in timeline
    const getCurrentStepIndex = (status: string) => {
        if (status === 'cancelled') return -1;
        return ORDER_STEPS.findIndex(s => s.key === status);
    };

    return (
        <div className="space-y-6 relative h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
                    <p className="text-gray-500 text-sm">Quản lý và xử lý đơn đặt hàng.</p>
                </div>
                {/* <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 flex items-center gap-2">
                    <Download className="w-5 h-5" />
                    Xuất báo cáo
                </button> */}
            </div>

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <input
                        type="text"
                        placeholder="Tìm mã đơn (ID), tên khách hàng..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="flex gap-2 w-full sm:w-auto items-center">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang đóng gói</option>
                        <option value="shipped">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Mã đơn</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Khách hàng</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Ngày đặt</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tổng tiền</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Thanh toán</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        Không tìm thấy đơn hàng nào.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        onClick={() => handleOpenOrder(order)}
                                        className={`group hover:bg-emerald-50 transition-colors cursor-pointer ${selectedOrder?.id === order.id ? 'bg-emerald-50' : ''}`}
                                    >
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">#{order.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="font-medium">{order.customerName}</div>
                                            <div className="text-xs text-gray-400">{order.items.length} sản phẩm</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-emerald-600">{order.totalAmount.toLocaleString()}đ</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 uppercase">{order.paymentMethod}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-emerald-600 p-2 hover:bg-emerald-100 rounded-lg transition-colors">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {!loading && orders.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Trang {page} / {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 
        ------------------------------------------
        SMOOTH ORDER DETAIL SIDEBAR
        ------------------------------------------
      */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-gray-600/75 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                        onClick={handleCloseOrder}
                    ></div>

                    {/* Sidebar Panel Container */}
                    <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex pointer-events-none">
                        <div
                            className={`w-screen max-w-md transform transition-transform duration-300 ease-in-out pointer-events-auto ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
                        >
                            <div className="h-full flex flex-col bg-white shadow-2xl">

                                {/* 1. Sidebar Header (Fixed) */}
                                <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between z-10">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            #{selectedOrder.id}
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedOrder.status)}`}>
                                            {getStatusLabel(selectedOrder.status)}
                                        </span>
                                        <button
                                            onClick={handleCloseOrder}
                                            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* 2. Scrollable Content */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/50">

                                    {/* Status Timeline (Visual Enhancement) */}
                                    {selectedOrder.status !== 'cancelled' && (
                                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Tiến độ đơn hàng</h3>
                                            <div className="relative flex justify-between items-center z-0">
                                                {/* Connecting Line */}
                                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2 rounded"></div>

                                                {ORDER_STEPS.map((step, idx) => {
                                                    const currentIdx = getCurrentStepIndex(selectedOrder.status);
                                                    const isActive = idx <= currentIdx;
                                                    const isCurrent = idx === currentIdx;

                                                    return (
                                                        <div key={step.key} className="flex flex-col items-center gap-2 bg-white px-2">
                                                            <div
                                                                className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 ${isActive
                                                                    ? 'bg-emerald-500 border-emerald-500 ring-2 ring-emerald-100'
                                                                    : 'bg-white border-gray-300'
                                                                    }`}
                                                            ></div>
                                                            <span className={`text-[10px] font-medium ${isCurrent ? 'text-emerald-700' : 'text-gray-400'}`}>
                                                                {step.label}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Customer Info */}
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-500" /> Khách hàng
                                            </h3>
                                            {/* <button className="text-emerald-600 text-xs font-medium hover:underline">Xem hồ sơ</button> */}
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center text-emerald-700 font-bold text-xl shadow-inner">
                                                    {selectedOrder.customerName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg">{selectedOrder.customerName}</p>
                                                    <p className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">Khách mới</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                {selectedOrder.customerEmail && (
                                                    <div className="flex items-center gap-3 text-gray-600">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                                                            <Mail className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                        <span className="truncate">{selectedOrder.customerEmail}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 text-gray-600">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <span>{selectedOrder.customerPhone}</span>
                                                </div>
                                                <div className="flex items-start gap-3 text-gray-600">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <span className="leading-tight py-1.5">{selectedOrder.shippingAddress}, {selectedOrder.ward}, {selectedOrder.district}, {selectedOrder.city}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <Package className="w-4 h-4 text-gray-500" /> Sản phẩm ({selectedOrder.items.length})
                                            </h3>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {selectedOrder.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 relative group">
                                                        <img src={item.image || '/placeholder.png'} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-900 text-sm truncate">{item.productName}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">Mã: SP-{item.productId}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-medium text-gray-900 text-sm">{item.price.toLocaleString()}đ</div>
                                                        <div className="text-xs text-gray-500">x{item.quantity}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-gray-500" /> Thanh toán
                                            </h3>
                                        </div>
                                        <div className="p-5 space-y-3">
                                            {selectedOrder.note && (
                                                <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg mb-4">
                                                    <strong>Ghi chú:</strong> {selectedOrder.note}
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Tạm tính</span>
                                                <span>{(selectedOrder.totalAmount - selectedOrder.shippingFee).toLocaleString()}đ</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Phí vận chuyển</span>
                                                <span>{selectedOrder.shippingFee.toLocaleString()}đ</span>
                                            </div>
                                            <div className="border-t border-dashed border-gray-200 my-2 pt-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-bold text-gray-900">Tổng cộng</span>
                                                    <span className="text-xl font-bold text-emerald-600">{selectedOrder.totalAmount.toLocaleString()}đ</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Phương thức</span>
                                                <span className="font-medium text-gray-900 uppercase">{selectedOrder.paymentMethod}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. Sticky Footer (Actions) */}
                                <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                                    {selectedOrder.status === 'pending' && (
                                        <button
                                            onClick={() => handleUpdateStatus('processing')}
                                            className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold transition-all active:scale-[0.98] shadow-sm hover:shadow-emerald-200"
                                        >
                                            <Send className="w-4 h-4" /> Xác nhận đơn hàng
                                        </button>
                                    )}

                                    {selectedOrder.status === 'processing' && (
                                        <button
                                            onClick={() => handleUpdateStatus('shipped')}
                                            className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold transition-all active:scale-[0.98]"
                                        >
                                            <Send className="w-4 h-4" /> Bắt đầu giao hàng
                                        </button>
                                    )}

                                    {selectedOrder.status === 'shipped' && (
                                        <button
                                            onClick={() => handleUpdateStatus('completed')}
                                            className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all active:scale-[0.98]"
                                        >
                                            <Send className="w-4 h-4" /> Hoàn thành đơn hàng
                                        </button>
                                    )}

                                    {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
                                                    handleUpdateStatus('cancelled');
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-bold transition-all active:scale-[0.98]"
                                        >
                                            <X className="w-4 h-4" /> Hủy đơn hàng
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
