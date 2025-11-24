import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/response';
import { hashPassword, excludePassword } from '@/lib/auth';
import { createTokenResponse } from '@/lib/jwt';
import { createUserSchema } from '@/lib/validation';

/**
 * POST /api/auth/register
 * ลงทะเบียนผู้ใช้ใหม่
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "firstName": "John",
 *   "lastName": "Doe",
 *   "phone": "0812345678" (optional)
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
 *   "message": "ลงทะเบียนสำเร็จ"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = createUserSchema.safeParse(body);
        if (!validation.success) {
            return errorResponse(validation.error.issues[0].message, 400);
        }

        const { email, password, firstName, lastName, phone, role } = validation.data;

        // ตรวจสอบว่าอีเมลซ้ำหรือไม่
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return errorResponse('อีเมลนี้ถูกใช้งานแล้ว', 409);
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await hashPassword(password);

        // สร้างผู้ใช้ใหม่
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: role || 'STUDENT', // Default เป็น STUDENT
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
            },
        });

        // สร้าง JWT tokens
        const tokens = createTokenResponse({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return successResponse(
            {
                user,
                tokens,
            },
            'ลงทะเบียนสำเร็จ',
            201
        );
    } catch (error) {
        console.error('Register error:', error);
        return serverErrorResponse('เกิดข้อผิดพลาดในการลงทะเบียน');
    }
}
