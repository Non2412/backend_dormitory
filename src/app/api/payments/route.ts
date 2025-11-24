import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse, paginatedResponse } from '@/lib/response';
import { createPaymentSchema } from '@/lib/validation';

// GET /api/payments - ดึงข้อมูลการชำระเงินทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const userId = searchParams.get('userId');
    const bookingId = searchParams.get('bookingId');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (bookingId) {
      where.bookingId = bookingId;
    }
    
    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
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
            },
          },
          booking: {
            include: {
              room: {
                include: {
                  dormitory: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    return paginatedResponse(payments, page, limit, total);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน');
  }
}

// POST /api/payments - สร้างการชำระเงินใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = createPaymentSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { bookingId, userId, amount, paymentMethod, status, slipUrl, notes } = validation.data;

    // ตรวจสอบว่าการจองมีอยู่จริง
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return errorResponse('ไม่พบการจองที่ระบุ', 404);
    }

    // ตรวจสอบว่าผู้ใช้มีอยู่จริง
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return errorResponse('ไม่พบผู้ใช้ที่ระบุ', 404);
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount,
        paymentMethod,
        status: status || 'PENDING',
        slipUrl,
        notes,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            room: {
              include: {
                dormitory: true,
              },
            },
          },
        },
      },
    });

    return successResponse(payment, 'บันทึกการชำระเงินสำเร็จ', 201);
  } catch (error) {
    console.error('Error creating payment:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการบันทึกการชำระเงิน');
  }
}
