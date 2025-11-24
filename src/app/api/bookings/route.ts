import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse, paginatedResponse } from '@/lib/response';
import { createBookingSchema } from '@/lib/validation';

// GET /api/bookings - ดึงข้อมูลการจองทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');
    const roomId = searchParams.get('roomId');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (roomId) {
      where.roomId = roomId;
    }
    
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
              dormitory: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                },
              },
            },
          },
          payments: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return paginatedResponse(bookings, page, limit, total);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลการจอง');
  }
}

// POST /api/bookings - สร้างการจองใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = createBookingSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { userId, roomId, startDate, endDate, totalAmount, notes } = validation.data;

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse('ไม่พบผู้ใช้ที่ระบุ', 404);
    }

    // ตรวจสอบว่าห้องพักมีอยู่จริง
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return errorResponse('ไม่พบห้องพักที่ระบุ', 404);
    }

    // ตรวจสอบว่าห้องพักว่างหรือไม่
    if (room.status !== 'AVAILABLE') {
      return errorResponse('ห้องพักนี้ไม่ว่างในขณะนี้', 400);
    }

    // สร้างการจอง
    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        totalAmount,
        notes,
        status: 'PENDING',
      },
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
      },
    });

    // อัปเดตสถานะห้องพักเป็น RESERVED
    await prisma.room.update({
      where: { id: roomId },
      data: { status: 'RESERVED' },
    });

    return successResponse(booking, 'สร้างการจองสำเร็จ', 201);
  } catch (error) {
    console.error('Error creating booking:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการสร้างการจอง');
  }
}
