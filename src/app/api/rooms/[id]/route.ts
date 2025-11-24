import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/response';
import { updateRoomSchema } from '@/lib/validation';

// GET /api/rooms/[id] - ดึงข้อมูลห้องพักตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        dormitory: true,
        bookings: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!room) {
      return notFoundResponse('ไม่พบห้องพัก');
    }

    return successResponse(room);
  } catch (error) {
    console.error('Error fetching room:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลห้องพัก');
  }
}

// PUT /api/rooms/[id] - อัปเดตข้อมูลห้องพัก
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = updateRoomSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const existingRoom = await prisma.room.findUnique({
      where: { id },
    });

    if (!existingRoom) {
      return notFoundResponse('ไม่พบห้องพัก');
    }

    // ถ้ามีการเปลี่ยนหมายเลขห้อง ตรวจสอบว่าซ้ำหรือไม่
    if (validation.data.roomNumber && validation.data.roomNumber !== existingRoom.roomNumber) {
      const roomExists = await prisma.room.findUnique({
        where: {
          dormitoryId_roomNumber: {
            dormitoryId: existingRoom.dormitoryId,
            roomNumber: validation.data.roomNumber,
          },
        },
      });

      if (roomExists) {
        return errorResponse('หมายเลขห้องนี้มีอยู่แล้วในหอพักนี้', 409);
      }
    }

    const room = await prisma.room.update({
      where: { id },
      data: validation.data,
      include: {
        dormitory: true,
      },
    });

    return successResponse(room, 'อัปเดตข้อมูลห้องพักสำเร็จ');
  } catch (error) {
    console.error('Error updating room:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการอัปเดตข้อมูลห้องพัก');
  }
}

// DELETE /api/rooms/[id] - ลบห้องพัก
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: {
              in: ['PENDING', 'CONFIRMED'],
            },
          },
        },
      },
    });

    if (!room) {
      return notFoundResponse('ไม่พบห้องพัก');
    }

    if (room.bookings.length > 0) {
      return errorResponse('ไม่สามารถลบห้องพักที่มีการจองอยู่ได้', 400);
    }

    await prisma.room.delete({
      where: { id },
    });

    return successResponse(null, 'ลบห้องพักสำเร็จ');
  } catch (error) {
    console.error('Error deleting room:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการลบห้องพัก');
  }
}
