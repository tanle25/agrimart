import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Chính sách bảo mật | AgriMart',
    description: 'Cam kết bảo mật thông tin khách hàng của AgriMart.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="bg-white min-h-screen pb-20 font-sans">
            {/* Header / Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100 mb-10">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Chính sách bảo mật</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-emerald-700">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Chính sách bảo mật</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl">
                <div className="prose prose-emerald prose-lg mx-auto text-gray-600">
                    <p className="lead text-xl text-gray-700 font-medium leading-relaxed mb-8">
                        Tại AgriMart, chúng tôi coi trọng sự riêng tư của khách hàng. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng website của chúng tôi.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 mb-12 not-prose">
                        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                            <Shield className="w-8 h-8 text-emerald-600 mb-3" />
                            <h3 className="font-bold text-gray-900 mb-2 text-lg">Bảo mật tuyệt đối</h3>
                            <p className="text-sm text-gray-600">Dữ liệu của bạn được mã hóa và bảo vệ theo tiêu chuẩn an ninh mạng cao nhất.</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                            <Lock className="w-8 h-8 text-blue-600 mb-3" />
                            <h3 className="font-bold text-gray-900 mb-2 text-lg">Không chia sẻ</h3>
                            <p className="text-sm text-gray-600">Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba.</p>
                        </div>
                    </div>

                    <h2>1. Thu thập thông tin</h2>
                    <p>
                        Chúng tôi thu thập thông tin khi bạn đăng ký trên trang web của chúng tôi, đặt hàng, đăng ký nhận bản tin hoặc điền vào biểu mẫu. Các thông tin thu thập bao gồm:
                    </p>
                    <ul>
                        <li>Tên và thông tin liên hệ (email, số điện thoại, địa chỉ).</li>
                        <li>Thông tin giao dịch và lịch sử mua hàng.</li>
                        <li>Thông tin kỹ thuật như địa chỉ IP, loại trình duyệt khi bạn truy cập website.</li>
                    </ul>

                    <h2>2. Sử dụng thông tin</h2>
                    <p>
                        Bất kỳ thông tin nào chúng tôi thu thập từ bạn có thể được sử dụng để:
                    </p>
                    <ul>
                        <li>Cá nhân hóa trải nghiệm của bạn và đáp ứng nhu cầu cá nhân của bạn tốt hơn.</li>
                        <li>Cải thiện trang web của chúng tôi dựa trên thông tin và phản hồi chúng tôi nhận được từ bạn.</li>
                        <li>Cải thiện dịch vụ khách hàng và nhu cầu hỗ trợ.</li>
                        <li>Xử lý các giao dịch nhanh chóng và an toàn.</li>
                    </ul>

                    <h2>3. Bảo vệ thông tin</h2>
                    <p>
                        Chúng tôi thực hiện nhiều biện pháp bảo mật để duy trì sự an toàn của thông tin cá nhân của bạn. Dữ liệu nhạy cảm được truyền qua công nghệ Lớp cổng bảo mật (SSL) và sau đó được mã hóa vào cơ sở dữ liệu của chúng tôi để chỉ những người có quyền truy cập đặc biệt mới có thể truy cập được.
                    </p>

                    <h2>4. Quyền của bạn</h2>
                    <p>
                        Bạn có quyền yêu cầu truy cập, sửa đổi hoặc xóa thông tin cá nhân của mình bất cứ lúc nào bằng cách liên hệ với bộ phận chăm sóc khách hàng của chúng tôi.
                    </p>

                    <div className="bg-gray-50 border-l-4 border-emerald-500 p-6 rounded-r-xl my-8 italic">
                        "Sự tin tưởng của bạn là tài sản quý giá nhất của AgriMart."
                    </div>
                </div>
            </div>
        </div>
    );
}
