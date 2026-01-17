import React from 'react';
import Link from 'next/link';
import { Truck, Clock, MapPin, PackageCheck } from 'lucide-react';

export const metadata = {
    title: 'Chính sách vận chuyển | AgriMart',
    description: 'Thông tin về thời gian và chi phí giao hàng của AgriMart.',
};

export default function ShippingPolicyPage() {
    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            {/* Header / Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100 mb-10">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Chính sách vận chuyển</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-emerald-700">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Chính sách vận chuyển</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="prose prose-emerald prose-lg mx-auto text-gray-600">
                    <p className="lead text-xl text-gray-700 font-medium leading-relaxed mb-8">
                        AgriMart hợp tác với các đơn vị vận chuyển uy tín để đảm bảo sản phẩm đến tay bạn nhanh chóng và an toàn nhất. Dưới đây là quy định chi tiết về vận chuyển.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-12 not-prose">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-4">
                            <div className="bg-emerald-100 p-3 rounded-full h-fit">
                                <Truck className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Giao hàng toàn quốc</h3>
                                <p className="text-sm text-gray-600 mt-1">Phục vụ 63 tỉnh thành Việt Nam.</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-4">
                            <div className="bg-orange-100 p-3 rounded-full h-fit">
                                <Clock className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Thời gian linh hoạt</h3>
                                <p className="text-sm text-gray-600 mt-1">Giao hàng từ Thứ 2 - Thứ 7.</p>
                            </div>
                        </div>
                    </div>

                    <h2>1. Phí vận chuyển</h2>
                    <p>
                        Phí vận chuyển sẽ được tính dựa trên trọng lượng đơn hàng và khoảng cách địa lý.
                    </p>
                    <ul>
                        <li><strong>Nội thành:</strong> Đồng giá 20.000đ (cho đơn dưới 5kg).</li>
                        <li><strong>Ngoại thành / Tỉnh:</strong> Tính theo biểu phí của đơn vị vận chuyển (Giao Hàng Nhanh, Viettel Post).</li>
                        <li><strong>Miễn phí vận chuyển:</strong> Áp dụng cho đơn hàng có giá trị từ 500.000đ trở lên (khu vực nội thành).</li>
                    </ul>

                    <h2>2. Thời gian giao hàng dự kiến</h2>
                    <div className="overflow-x-auto not-prose mb-8">
                        <table className="w-full text-sm text-left border-collapse border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-100 text-gray-900 font-bold">
                                <tr>
                                    <th className="p-4 border border-gray-200">Khu vực</th>
                                    <th className="p-4 border border-gray-200">Thời gian dự kiến</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <tr>
                                    <td className="p-4 border border-gray-200 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-emerald-600" /> Nội thành Hà Nội / TP.HCM
                                    </td>
                                    <td className="p-4 border border-gray-200">1 - 2 ngày</td>
                                </tr>
                                <tr>
                                    <td className="p-4 border border-gray-200 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-emerald-600" /> Các tỉnh thành khác
                                    </td>
                                    <td className="p-4 border border-gray-200">3 - 5 ngày</td>
                                </tr>
                                <tr>
                                    <td className="p-4 border border-gray-200 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-emerald-600" /> Vùng sâu vùng xa
                                    </td>
                                    <td className="p-4 border border-gray-200">5 - 7 ngày</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2>3. Quy định kiểm hàng</h2>
                    <p>
                        Để đảm bảo quyền lợi, khách hàng được phép <strong>kiểm tra ngoại quan</strong> sản phẩm trước khi thanh toán (đồng kiểm).
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-gray-600">
                        <li>Kiểm tra tình trạng bao bì, niêm phong.</li>
                        <li>Kiểm tra số lượng và chủng loại sản phẩm.</li>
                        <li>Không hỗ trợ dùng thử hoặc mở seal sản phẩm công nghệ/mỹ phẩm (nếu có).</li>
                    </ul>

                    <h2>4. Trường hợp giao hàng không thành công</h2>
                    <p>
                        Nếu đơn vị vận chuyển không liên lạc được với bạn 3 lần, đơn hàng sẽ được hoàn trả về kho. Vui lòng để ý điện thoại trong thời gian dự kiến giao hàng.
                    </p>
                </div>
            </div>
        </div>
    );
}
