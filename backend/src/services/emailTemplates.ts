/**
 * Email Templates for AgriMart
 * HTML email templates with responsive design
 */

interface OrderEmailData {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        total: number;
    }>;
    subtotal: number;
    shippingFee: number;
    total: number;
    paymentMethod: string;
    notes?: string;
}

/**
 * Base email template with AgriMart branding
 */
function baseTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgriMart</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
        }
        .header p {
            margin: 8px 0 0 0;
            color: #d1fae5;
            font-size: 14px;
        }
        .content {
            padding: 40px 30px;
        }
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 5px 0;
            font-size: 13px;
            color: #6b7280;
        }
        .footer a {
            color: #10b981;
            text-decoration: none;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #10b981;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
        }
        .order-info {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .order-info h3 {
            margin: 0 0 15px 0;
            color: #10b981;
            font-size: 16px;
        }
        .order-info p {
            margin: 8px 0;
            font-size: 14px;
            line-height: 1.6;
        }
        .order-info strong {
            color: #1f2937;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 13px;
            text-transform: uppercase;
        }
        td {
            font-size: 14px;
        }
        .total-row {
            font-weight: 600;
            font-size: 16px;
            color: #10b981;
        }
        .alert {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .alert p {
            margin: 0;
            font-size: 14px;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌾 AgriMart</h1>
            <p>Nông Sản Sạch Việt Nam</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>AgriMart - Nông Sản Sạch Việt Nam</strong></p>
            <p>📞 Hotline: 1900 1234 | 📧 Email: contact@agrimart.vn</p>
            <p>📍 123 Đường Nguyễn Huệ, TP.HCM</p>
            <p style="margin-top: 15px;">
                <a href="https://agrimart.vn">Website</a> • 
                <a href="https://facebook.com/agrimart">Facebook</a> • 
                <a href="https://instagram.com/agrimart">Instagram</a>
            </p>
            <p style="margin-top: 15px; font-size: 12px; color: #9ca3af;">
                Email này được gửi tự động, vui lòng không trả lời.
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Format currency to VND
 */
function formatCurrency(amount: number): string {
    return amount.toLocaleString('vi-VN') + 'đ';
}

/**
 * New Order Confirmation Email for Customer
 */
export function newOrderCustomerEmail(data: OrderEmailData): string {
    const itemsHtml = data.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatCurrency(item.price)}</td>
            <td style="text-align: right; font-weight: 600;">${formatCurrency(item.total)}</td>
        </tr>
    `).join('');

    const content = `
        <h2 style="color: #10b981; margin: 0 0 10px 0;">✅ Đơn hàng đã được tiếp nhận!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
            Xin chào <strong>${data.customerName}</strong>,
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">
            Cảm ơn bạn đã đặt hàng tại AgriMart! Đơn hàng của bạn đã được tiếp nhận và đang được xử lý.
        </p>

        <div class="order-info">
            <h3>📦 Thông tin đơn hàng</h3>
            <p><strong>Mã đơn hàng:</strong> #${data.orderNumber}</p>
            <p><strong>Người nhận:</strong> ${data.customerName}</p>
            <p><strong>Số điện thoại:</strong> ${data.customerPhone}</p>
            <p><strong>Địa chỉ giao hàng:</strong> ${data.customerAddress}</p>
            <p><strong>Phương thức thanh toán:</strong> ${data.paymentMethod}</p>
            ${data.notes ? `<p><strong>Ghi chú:</strong> ${data.notes}</p>` : ''}
        </div>

        <h3 style="margin: 30px 0 15px 0; color: #374151;">Chi tiết đơn hàng:</h3>
        <table>
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th style="text-align: center;">SL</th>
                    <th style="text-align: right;">Đơn giá</th>
                    <th style="text-align: right;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
                <tr>
                    <td colspan="3" style="text-align: right; font-weight: 600;">Tạm tính:</td>
                    <td style="text-align: right;">${formatCurrency(data.subtotal)}</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: right; font-weight: 600;">Phí vận chuyển:</td>
                    <td style="text-align: right;">${formatCurrency(data.shippingFee)}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3" style="text-align: right;">TỔNG CỘNG:</td>
                    <td style="text-align: right;">${formatCurrency(data.total)}</td>
                </tr>
            </tbody>
        </table>

        ${data.paymentMethod.includes('Chuyển khoản') ? `
        <div class="alert">
            <p><strong>⚠️ Lưu ý:</strong> Vui lòng chuyển khoản với nội dung: <strong>AGRIMART ${data.orderNumber}</strong></p>
        </div>
        ` : ''}

        <p style="font-size: 15px; line-height: 1.6; color: #6b7280; margin-top: 30px;">
            Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận đơn hàng. Nếu có bất kỳ thắc mắc nào, 
            vui lòng liên hệ hotline <strong>1900 1234</strong>.
        </p>

        <p style="font-size: 15px; margin-top: 30px;">
            Trân trọng,<br>
            <strong style="color: #10b981;">Đội ngũ AgriMart</strong>
        </p>
    `;

    return baseTemplate(content);
}

/**
 * New Order Notification Email for Admin
 */
export function newOrderAdminEmail(data: OrderEmailData): string {
    const itemsHtml = data.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatCurrency(item.total)}</td>
        </tr>
    `).join('');

    const content = `
        <h2 style="color: #10b981; margin: 0 0 10px 0;">🔔 Đơn hàng mới #${data.orderNumber}</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
            Có đơn hàng mới cần xử lý!
        </p>

        <div class="order-info">
            <h3>👤 Thông tin khách hàng</h3>
            <p><strong>Tên:</strong> ${data.customerName}</p>
            <p><strong>SĐT:</strong> ${data.customerPhone}</p>
            <p><strong>Địa chỉ:</strong> ${data.customerAddress}</p>
            <p><strong>Thanh toán:</strong> ${data.paymentMethod}</p>
            ${data.notes ? `<p><strong>Ghi chú:</strong> ${data.notes}</p>` : ''}
        </div>

        <h3 style="margin: 30px 0 15px 0; color: #374151;">Chi tiết đơn hàng:</h3>
        <table>
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th style="text-align: center;">Số lượng</th>
                    <th style="text-align: right;">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
                <tr class="total-row">
                    <td colspan="2" style="text-align: right;">TỔNG CỘNG:</td>
                    <td style="text-align: right;">${formatCurrency(data.total)}</td>
                </tr>
            </tbody>
        </table>

        <a href="https://agrimart.vn/admin/orders" class="button">Xem chi tiết đơn hàng →</a>

        <p style="font-size: 13px; color: #9ca3af; margin-top: 30px;">
            Vui lòng xử lý đơn hàng trong vòng 24h.
        </p>
    `;

    return baseTemplate(content);
}

/**
 * Welcome Email for New Members
 */
export function welcomeMemberEmail(name: string): string {
    const content = `
        <h2 style="color: #10b981; margin: 0 0 10px 0;">🎉 Chào mừng bạn đến với AgriMart!</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #4b5563;">
            Xin chào <strong>${name}</strong>,
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #6b7280;">
            Cảm ơn bạn đã đăng ký tài khoản tại AgriMart - nơi cung cấp nông sản sạch, 
            tươi ngon được chọn lọc kỹ càng từ các vùng nông nghiệp sạch trên toàn quốc.
        </p>

        <div class="order-info">
            <h3>🌟 Ưu đãi dành cho thành viên mới</h3>
            <p>✓ Giảm 10% cho đơn hàng đầu tiên</p>
            <p>✓ Miễn phí vận chuyển cho đơn từ 500.000đ</p>
            <p>✓ Tích điểm đổi quà hấp dẫn</p>
            <p>✓ Cập nhật sản phẩm mới và khuyến mãi sớm nhất</p>
        </div>

        <a href="https://agrimart.vn/san-pham" class="button">Khám phá sản phẩm →</a>

        <p style="font-size: 15px; line-height: 1.6; color: #6b7280; margin-top: 30px;">
            Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi qua 
            hotline <strong>1900 1234</strong> hoặc email <strong>contact@agrimart.vn</strong>.
        </p>

        <p style="font-size: 15px; margin-top: 30px;">
            Chúc bạn có trải nghiệm mua sắm tuyệt vời!<br>
            <strong style="color: #10b981;">Đội ngũ AgriMart</strong>
        </p>
    `;

    return baseTemplate(content);
}
