import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';
import { verifyPassword } from './auth';

export interface AuthUser {
    id: string;
    email: string;
    role: string;
}

/**
 * Simple authentication middleware
 * ตรวจสอบ Basic Auth header
 * Format: Authorization: Basic base64(email:password)
 * 
 * หมายเหตุ: นี่เป็น basic authentication เบื้องต้น
 * ในการใช้งานจริงควรใช้ JWT tokens แทน
 */
export async function authenticateRequest(
    request: NextRequest
): Promise<{ authenticated: boolean; user?: AuthUser; error?: string }> {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return { authenticated: false, error: 'ไม่พบ authorization header' };
        }

        // Decode Basic Auth
        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const [email, password] = credentials.split(':');

        if (!email || !password) {
            return { authenticated: false, error: 'รูปแบบ credentials ไม่ถูกต้อง' };
        }

        // ค้นหาผู้ใช้
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                role: true,
            },
        });

        if (!user) {
            return { authenticated: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
        }

        // ตรวจสอบรหัสผ่าน
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            return { authenticated: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
        }

        return {
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return { authenticated: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' };
    }
}

/**
 * ตรวจสอบว่าผู้ใช้มีสิทธิ์ตาม role ที่กำหนด
 */
export function authorizeRole(user: AuthUser, allowedRoles: string[]): boolean {
    return allowedRoles.includes(user.role);
}

/**
 * Middleware helper สำหรับ protected routes
 */
export async function requireAuth(
    request: NextRequest,
    allowedRoles?: string[]
): Promise<{ authorized: boolean; user?: AuthUser; response?: NextResponse }> {
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, error: authResult.error || 'Unauthorized' },
                { status: 401 }
            ),
        };
    }

    // ตรวจสอบ role ถ้ามีการกำหนด
    if (allowedRoles && !authorizeRole(authResult.user!, allowedRoles)) {
        return {
            authorized: false,
            response: NextResponse.json(
                { success: false, error: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้' },
                { status: 403 }
            ),
        };
    }

    return {
        authorized: true,
        user: authResult.user,
    };
}
