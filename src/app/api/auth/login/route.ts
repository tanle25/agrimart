import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8001';

        // Call Backend API
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            return NextResponse.json(
                { success: false, message: data.message || 'Đăng nhập thất bại' },
                { status: 401 }
            );
        }

        // Create success response
        const response = NextResponse.json({
            success: true,
            user: data.user
        });

        // Set HttpOnly Cookie
        // Max Age: 24h = 86400s
        response.cookies.set('token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 86400
        });

        return response;

    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Lỗi kết nối server' },
            { status: 500 }
        );
    }
}
