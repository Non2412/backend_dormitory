import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CORS Middleware for Backend API
 * จัดการ CORS headers และ preflight requests (OPTIONS)
 * 
 * Note: ใน Next.js 16+ middleware ต้องอยู่ที่ root level (ไม่ใช่ใน src/)
 */
export function middleware(request: NextRequest) {
    // กำหนด allowed origins
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://192.168.56.1:3000',
        process.env.FRONTEND_URL,
    ].filter(Boolean); // กรอง undefined ออก

    const origin = request.headers.get('origin');

    // Handle preflight requests (OPTIONS)
    if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });

        // ตั้งค่า CORS headers
        if (origin && allowedOrigins.includes(origin)) {
            response.headers.set('Access-Control-Allow-Origin', origin);
            response.headers.set('Access-Control-Allow-Credentials', 'true');
        } else {
            response.headers.set('Access-Control-Allow-Origin', '*');
        }

        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

        return response;
    }

    // Handle actual requests
    const response = NextResponse.next();

    // ตั้งค่า CORS headers สำหรับ requests ปกติ
    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
    } else {
        response.headers.set('Access-Control-Allow-Origin', '*');
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    return response;
}

// กำหนดให้ middleware ทำงานกับ API routes เท่านั้น
export const config = {
    matcher: '/api/:path*',
};
