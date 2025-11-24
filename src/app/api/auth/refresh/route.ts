import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/response';
import { verifyToken, createTokenResponse } from '@/lib/jwt';

/**
 * POST /api/auth/refresh
 * รีเฟรช access token ด้วย refresh token
 * 
 * Request Body:
 * {
 *   "refreshToken": "..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "tokens": {
 *       "accessToken": "...",
 *       "refreshToken": "...",
 *       "tokenType": "Bearer",
 *       "expiresIn": "7d"
 *     }
 *   },
 *   "message": "รีเฟรช token สำเร็จ"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return errorResponse('กรุณาระบุ refresh token', 400);
        }

        // ตรวจสอบ refresh token
        const decoded = verifyToken(refreshToken);

        if (!decoded) {
            return errorResponse('Refresh token ไม่ถูกต้องหรือหมดอายุ', 401);
        }

        // ตรวจสอบว่าผู้ใช้ยังมีอยู่ในระบบ
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            return errorResponse('ไม่พบผู้ใช้', 404);
        }

        // สร้าง tokens ใหม่
        const tokens = createTokenResponse({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return successResponse(
            { tokens },
            'รีเฟรช token สำเร็จ',
            200
        );
    } catch (error) {
        console.error('Refresh token error:', error);
        return serverErrorResponse('เกิดข้อผิดพลาดในการรีเฟรช token');
    }
}
