import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const metadata = {
    title: 'Điều khoản dịch vụ | AgriMart',
    description: 'Quy định và điều khoản sử dụng dịch vụ tại AgriMart.',
};

export default function TermsOfServicePage() {
    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            {/* Header / Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100 mb-10">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Điều khoản dịch vụ</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-emerald-700">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Điều khoản dịch vụ</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="prose prose-emerald prose-lg mx-auto text-gray-600">
                    <p className="lead text-xl text-gray-700 font-medium leading-relaxed mb-8">
                        Chào mừng bạn đến với AgriMart. Khi truy cập và sử dụng website này, bạn đồng ý tuân thủ các điều khoản và điều kiện sau đây. Vui lòng đọc kỹ trước khi mua hàng.
                    </p>

                    <h2>1. Giới thiệu</h2>
                    <p>
                        AgriMart là nền tảng thương mại điện tử chuyên cung cấp nông sản sạch và vật tư nông nghiệp. Chúng tôi cam kết cung cấp sản phẩm chất lượng và dịch vụ tốt nhất cho khách hàng.
                    </p>

                    <h2>2. Hướng dẫn đặt hàng</h2>
                    <ul className="list-none pl-0 space-y-2">
                        <li className="flex gap-3">
                            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                            <span>Khách hàng có thể đặt hàng trực tuyến 24/7 thông qua website.</span>
                        </li>
                        <li className="flex gap-3">
                            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                            <span>Vui lòng cung cấp thông tin chính xác về địa chỉ và số điện thoại để đảm bảo giao hàng thành công.</span>
                        </li>
                        <li className="flex gap-3">
                            <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                            <span>Chúng tôi sẽ liên hệ xác nhận đơn hàng trước khi gửi đi.</span>
                        </li>
                    </ul>

                    <h2>3. Chính sách giá và thanh toán</h2>
                    <p>
                        Giá sản phẩm được niêm yết rõ ràng trên website đã bao gồm thuế VAT (nếu có). Phí vận chuyển sẽ được tính toán ở bước thanh toán dựa trên địa chỉ nhận hàng của bạn.
                    </p>
                    <p>
                        Chúng tôi chấp nhận các hình thức thanh toán: tiền mặt khi nhận hàng (COD) và chuyển khoản ngân hàng.
                    </p>

                    <h2>4. Quyền và trách nhiệm</h2>
                    <h3>Trách nhiệm của AgriMart</h3>
                    <ul>
                        <li>Đảm bảo chất lượng sản phẩm đúng như mô tả.</li>
                        <li>Bảo mật thông tin khách hàng.</li>
                        <li>Hỗ trợ giải quyết khiếu nại nhanh chóng.</li>
                    </ul>

                    <h3>Trách nhiệm của khách hàng</h3>
                    <ul>
                        <li>Kiểm tra hàng kỹ trước khi nhận.</li>
                        <li>Thanh toán đầy đủ giá trị đơn hàng.</li>
                        <li>Không sử dụng website vào mục đích vi phạm pháp luật.</li>
                    </ul>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-r-xl my-8">
                        <div className="flex gap-3">
                            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-gray-900 m-0">Lưu ý quan trọng</h4>
                                <p className="text-sm text-gray-700 mt-1 mb-0">AgriMart có quyền từ chối hoặc hủy đơn hàng nếu phát hiện dấu hiệu gian lận hoặc thông tin sai lệch.</p>
                            </div>
                        </div>
                    </div>

                    <h2>5. Thay đổi điều khoản</h2>
                    <p>
                        Chúng tôi có quyền thay đổi các điều khoản này vào bất kỳ lúc nào. Những thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.
                    </p>
                </div>
            </div>
        </div>
    );
}
