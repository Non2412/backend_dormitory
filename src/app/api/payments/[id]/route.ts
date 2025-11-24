import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/response';
import { updatePaymentSchema } from '@/lib/validation';

// GET /api/payments/[id] - ดึงข้อมูลการชำระเงินตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
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

    if (!payment) {
      return notFoundResponse('ไม่พบข้อมูลการชำระเงิน');
    }

    return successResponse(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลการชำระเงิน');
  }
}

// PUT /api/payments/[id] - อัปเดตข้อมูลการชำระเงิน
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const validation = updatePaymentSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!existingPayment) {
      return notFoundResponse('ไม่พบข้อมูลการชำระเงิน');
    }

    // ถ้าสถานะเปลี่ยนเป็น COMPLETED ให้อัปเดตสถานะการจอง
    if (validation.data.status === 'COMPLETED' && existingPayment.status !== 'COMPLETED') {
      // ตรวจสอบว่าชำระเงินครบแล้วหรือยัง
      const totalPaid = await prisma.payment.aggregate({
        where: {
          bookingId: existingPayment.bookingId,
          status: 'COMPLETED',
        },
        _sum: {
          amount: true,
        },
      });

      const currentTotal = (totalPaid._sum.amount || 0) + (validation.data.amount || existingPayment.amount);
      
      if (currentTotal >= existingPayment.booking.totalAmount) {
        await prisma.booking.update({
          where: { id: existingPayment.bookingId },
          data: { status: 'CONFIRMED' },
        });

        await prisma.room.update({
          where: { id: existingPayment.booking.roomId },
          data: { status: 'OCCUPIED' },
        });
      }
    }

    const payment = await prisma.payment.update({
      where: { id },
      data: validation.data,
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

    return successResponse(payment, 'อัปเดตข้อมูลการชำระเงินสำเร็จ');
  } catch (error) {
    console.error('Error updating payment:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการอัปเดตข้อมูลการชำระเงิน');
  }
}

// DELETE /api/payments/[id] - ลบการชำระเงิน
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return notFoundResponse('ไม่พบข้อมูลการชำระเงิน');
    }

    // ตรวจสอบว่าชำระเงินเสร็จสิ้นแล้วหรือไม่
    if (payment.status === 'COMPLETED') {
      return errorResponse('ไม่สามารถลบการชำระเงินที่เสร็จสิ้นแล้วได้', 400);
    }

    await prisma.payment.delete({
      where: { id },
    });

    return successResponse(null, 'ลบข้อมูลการชำระเงินสำเร็จ');
  } catch (error) {
    console.error('Error deleting payment:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการลบข้อมูลการชำระเงิน');
  }
}
