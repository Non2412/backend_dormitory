import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/response';
import { hashPassword, excludePassword } from '@/lib/auth';
import { updateUserSchema } from '@/lib/validation';

// GET /api/users/[id] - ดึงข้อมูลผู้ใช้ตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            room: {
              include: {
                dormitory: true,
              },
            },
          },
        },
        payments: true,
      },
    });

    if (!user) {
      return notFoundResponse('ไม่พบผู้ใช้');
    }

    const userWithoutPassword = excludePassword(user);

    return successResponse(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
  }
}

// PUT /api/users/[id] - อัปเดตข้อมูลผู้ใช้
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = updateUserSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return notFoundResponse('ไม่พบผู้ใช้');
    }

    const updateData: any = { ...validation.data };

    // ถ้ามีการเปลี่ยนอีเมล ตรวจสอบว่าซ้ำกับใครหรือไม่
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        return errorResponse('อีเมลนี้ถูกใช้งานแล้ว', 409);
      }
    }

    // อัปเดตข้อมูลผู้ใช้
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const userWithoutPassword = excludePassword(user);

    return successResponse(userWithoutPassword, 'อัปเดตข้อมูลผู้ใช้สำเร็จ');
  } catch (error) {
    console.error('Error updating user:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้');
  }
}

// DELETE /api/users/[id] - ลบผู้ใช้
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return notFoundResponse('ไม่พบผู้ใช้');
    }

    await prisma.user.delete({
      where: { id },
    });

    return successResponse(null, 'ลบผู้ใช้สำเร็จ');
  } catch (error) {
    console.error('Error deleting user:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการลบผู้ใช้');
  }
}
