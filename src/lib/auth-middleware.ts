import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt';

export interface AuthenticatedUser extends JWTPayload {
    userId: string;
    email: string;
    role: string;
}

/**
 * JWT Authentication Middleware
 * ตรวจสอบ JWT token จาก Authorization header
 */
export async function authenticateJWT(
    request: NextRequest
): Promise<{ authenticated: boolean; user?: AuthenticatedUser; error?: string }> {
    try {
        const authHeader = request.headers.get('authorization');
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return { authenticated: false, error: 'ไม่พบ token' };
        }

        // ตรวจสอบ token
        const decoded = verifyToken(token);

        if (!decoded) {
            return { authenticated: false, error: 'Token ไม่ถูกต้องหรือหมดอายุ' };
        }

        return {
            authenticated: true,
            user: decoded as AuthenticatedUser,
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return { authenticated: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์' };
    }
}

/**
 * ตรวจสอบว่าผู้ใช้มีสิทธิ์ตาม role ที่กำหนด
 */
export function authorizeRoles(user: AuthenticatedUser, allowedRoles: string[]): boolean {
    return allowedRoles.includes(user.role);
}

/**
 * Middleware helper สำหรับ protected routes
 */
export async function requireJWTAuth(
    request: NextRequest,
    allowedRoles?: string[]
): Promise<{ authorized: boolean; user?: AuthenticatedUser; response?: NextResponse }> {
    const authResult = await authenticateJWT(request);

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
    if (allowedRoles && !authorizeRoles(authResult.user!, allowedRoles)) {
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

/**
 * Optional authentication - ไม่บังคับต้อง login แต่ถ้า login จะได้ข้อมูล user
 */
export async function optionalAuth(
    request: NextRequest
): Promise<{ user?: AuthenticatedUser }> {
    const authResult = await authenticateJWT(request);

    if (authResult.authenticated) {
        return { user: authResult.user };
    }

    return {};
}
