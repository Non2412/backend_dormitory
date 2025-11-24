import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/response';
import { verifyPassword, excludePassword } from '@/lib/auth';
import { createTokenResponse } from '@/lib/jwt';
import { loginSchema } from '@/lib/validation';

/**
 * POST /api/auth/login
 * เข้าสู่ระบบด้วย email และ password
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { id, email, firstName, lastName, role },
 *     "tokens": {
 *       "accessToken": "...",
 *       "refreshToken": "...",
 *       "tokenType": "Bearer",
 *       "expiresIn": "7d"
 *     }
 *   },
 *   "message": "เข้าสู่ระบบสำเร็จ"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const { email, password } = validation.data;

        // ค้นหาผู้ใช้
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            return errorResponse('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
        }

        // ตรวจสอบรหัสผ่าน
        const isValidPassword = await verifyPassword(password, user.password);

        if (!isValidPassword) {
            return errorResponse('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 401);
        }

        // สร้าง JWT tokens
        const tokens = createTokenResponse({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        // ลบ password ออกจาก response
        const { password: _, ...userWithoutPassword } = user;

        return successResponse(
            {
                user: userWithoutPassword,
                tokens,
            },
            'เข้าสู่ระบบสำเร็จ',
            200
        );
    } catch (error) {
        console.error('Login error:', error);
        return serverErrorResponse('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
}
