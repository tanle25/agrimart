import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Only run on admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {

        // Exclude login page from protection
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Check for token in cookies
        const token = request.cookies.get('token')?.value;

        if (!token) {
            // Redirect to login if no token
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
