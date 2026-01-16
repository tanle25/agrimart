import React from 'react';
import Link from 'next/link';
import { Check, ShoppingBag } from 'lucide-react';

export default function OrderSuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center border border-gray-100">

                {/* Success Animation Circle */}
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                        <Check className="w-10 h-10 text-white stroke-[3]" />
                    </div>
                    {/* Confetti decoration circles */}
                    <div className="absolute top-0 right-0 w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
                    <div className="absolute bottom-2 left-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-300"></div>
                    <div className="absolute top-1/2 -left-2 w-2 h-2 bg-red-400 rounded-full animate-bounce delay-200"></div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h1>
                <p className="text-gray-500 mb-8">
                    Cảm ơn bạn đã tin tưởng AgriMart. Mã đơn hàng của bạn là <span className="font-bold text-gray-900">#ORD-9988</span>. Chúng tôi sẽ liên hệ xác nhận sớm nhất.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 border-b border-gray-200 pb-2">Thông tin nhận hàng</h3>
                    <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Người nhận:</span> Nguyễn Văn A</p>
                    <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Số điện thoại:</span> 0912 345 ***</p>
                    <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Địa chỉ:</span> 123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                    <p className="text-sm text-gray-600"><span className="font-medium">Thanh toán:</span> COD (Tiền mặt)</p>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        href="/"
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 block text-center"
                    >
                        Về trang chủ
                    </Link>
                    <Link
                        href="/san-pham"
                        className="w-full bg-white text-gray-700 py-3 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <ShoppingBag className="w-4 h-4" /> Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
}
