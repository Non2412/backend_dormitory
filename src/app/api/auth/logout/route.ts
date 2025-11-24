import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/response';
import { requireJWTAuth } from '@/lib/auth-middleware';

/**
 * POST /api/auth/logout
 * ออกจากระบบ
 * 
 * หมายเหตุ: ใน JWT stateless authentication การ logout จริงๆ 
 * ทำได้โดยการลบ token ฝั่ง client
 * 
 * สำหรับความปลอดภัยเพิ่มเติม สามารถเพิ่ม token blacklist ได้
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "ออกจากระบบสำเร็จ"
 * }
 */
export async function POST(request: NextRequest) {
    try {
        // ตรวจสอบ authentication (optional - เพื่อให้แน่ใจว่า token ถูกต้อง)
        const auth = await requireJWTAuth(request);

        if (!auth.authorized) {
            return auth.response;
        }

        // ในระบบ JWT stateless, การ logout ทำได้โดยการลบ token ฝั่ง client
        // ถ้าต้องการ invalidate token จริงๆ ต้องใช้ token blacklist
        // หรือเก็บ token ใน database และลบออกตอน logout

        // TODO: เพิ่ม token blacklist ถ้าต้องการ
        // await addToBlacklist(token);

        return successResponse(
            null,
            'ออกจากระบบสำเร็จ',
            200
        );
    } catch (error) {
        console.error('Logout error:', error);
        return successResponse(
            null,
            'ออกจากระบบสำเร็จ',
            200
        );
    }
}
