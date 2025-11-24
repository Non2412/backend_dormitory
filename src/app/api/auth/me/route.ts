import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, serverErrorResponse } from '@/lib/response';
import { requireJWTAuth } from '@/lib/auth-middleware';
import { excludePassword } from '@/lib/auth';

/**
 * GET /api/auth/me
 * ดึงข้อมูลผู้ใช้ปัจจุบันจาก JWT token
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "...",
 *     "email": "...",
 *     "firstName": "...",
 *     "lastName": "...",
 *     "phone": "...",
 *     "role": "...",
 *     "createdAt": "...",
 *     "updatedAt": "..."
 *   }
 * }
 */
export async function GET(request: NextRequest) {
    try {
        // ตรวจสอบ authentication
        const auth = await requireJWTAuth(request);

        if (!auth.authorized) {
            return auth.response;
        }

        // ดึงข้อมูลผู้ใช้จาก database
        const user = await prisma.user.findUnique({
            where: { id: auth.user!.userId },
            include: {
                bookings: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        room: {
                            include: {
                                dormitory: true,
                            },
                        },
                    },
                },
                payments: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) {
            return serverErrorResponse('ไม่พบข้อมูลผู้ใช้');
        }

        // ลบ password ออก
        const userWithoutPassword = excludePassword(user);

        return successResponse(userWithoutPassword);
    } catch (error) {
        console.error('Get current user error:', error);
        return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
    }
}

/**
 * PUT /api/auth/me
 * อัปเดตข้อมูลผู้ใช้ปัจจุบัน
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "firstName": "...",
 *   "lastName": "...",
 *   "phone": "..."
 * }
 */
export async function PUT(request: NextRequest) {
    try {
        // ตรวจสอบ authentication
        const auth = await requireJWTAuth(request);

        if (!auth.authorized) {
            return auth.response;
        }

        const body = await request.json();
        const { firstName, lastName, phone } = body;

        // อัปเดตข้อมูล
        const user = await prisma.user.update({
            where: { id: auth.user!.userId },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(phone && { phone }),
            },
        });

        const userWithoutPassword = excludePassword(user);

        return successResponse(userWithoutPassword, 'อัปเดตข้อมูลสำเร็จ');
    } catch (error) {
        console.error('Update current user error:', error);
        return serverErrorResponse('เกิดข้อผิดพลาดในการอัปเดตข้อมูล');
    }
}
