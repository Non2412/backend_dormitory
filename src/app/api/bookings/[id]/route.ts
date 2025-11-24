import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/response';
import { updateBookingSchema } from '@/lib/validation';

// GET /api/bookings/[id] - ดึงข้อมูลการจองตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
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
        room: {
          include: {
            dormitory: true,
          },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!booking) {
      return notFoundResponse('ไม่พบการจอง');
    }

    return successResponse(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลการจอง');
  }
}

// PUT /api/bookings/[id] - อัปเดตข้อมูลการจอง
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = updateBookingSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const existingBooking = await prisma.booking.findUnique({
      where: { id },
      include: { room: true },
    });

    if (!existingBooking) {
      return notFoundResponse('ไม่พบการจอง');
    }

    const updateData: any = { ...validation.data };

    // แปลง date strings เป็น Date objects
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    // ถ้ามีการเปลี่ยนสถานะ อัปเดตสถานะห้องพักด้วย
    if (updateData.status) {
      if (updateData.status === 'CONFIRMED') {
        await prisma.room.update({
          where: { id: existingBooking.roomId },
          data: { status: 'OCCUPIED' },
        });
      } else if (updateData.status === 'CANCELLED' || updateData.status === 'COMPLETED') {
        await prisma.room.update({
          where: { id: existingBooking.roomId },
          data: { status: 'AVAILABLE' },
        });
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: updateData,
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
        room: {
          include: {
            dormitory: true,
          },
        },
        payments: true,
      },
    });

    return successResponse(booking, 'อัปเดตข้อมูลการจองสำเร็จ');
  } catch (error) {
    console.error('Error updating booking:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการอัปเดตข้อมูลการจอง');
  }
}

// DELETE /api/bookings/[id] - ยกเลิกการจอง
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return notFoundResponse('ไม่พบการจอง');
    }

    // เปลี่ยนสถานะเป็น CANCELLED แทนการลบ
    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    // อัปเดตสถานะห้องพักเป็น AVAILABLE
    await prisma.room.update({
      where: { id: booking.roomId },
      data: { status: 'AVAILABLE' },
    });

    return successResponse(null, 'ยกเลิกการจองสำเร็จ');
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการยกเลิกการจอง');
  }
}
