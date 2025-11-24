import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, serverErrorResponse } from '@/lib/response';

// GET /api/dashboard/stats - ดึงสถิติเพิ่มเติมสำหรับ Dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // จำนวนวันย้อนหลัง (default 30 วัน)

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1. สถิติการจองในช่วงเวลาที่กำหนด
    const bookingsInPeriod = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        payments: true,
      },
    });

    // 2. สถิติการชำระเงินในช่วงเวลาที่กำหนด
    const paymentsInPeriod = await prisma.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    });

    // 3. รายได้ต่อวัน
    const dailyRevenue = await prisma.payment.groupBy({
      by: ['paymentDate'],
      where: {
        status: 'COMPLETED',
        paymentDate: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        paymentDate: 'asc',
      },
    });

    // 4. การจองต่อวัน - ดึงข้อมูลแล้วจัดกลุ่มเอง
    const allBookingsInPeriod = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // จัดกลุ่มการจองตามวัน
    const dailyBookingsMap = new Map<string, number>();
    allBookingsInPeriod.forEach((booking) => {
      const dateKey = booking.createdAt.toISOString().split('T')[0];
      dailyBookingsMap.set(dateKey, (dailyBookingsMap.get(dateKey) || 0) + 1);
    });

    const dailyBookings = Array.from(dailyBookingsMap.entries()).map(([date, count]) => ({
      date: new Date(date),
      count,
    }));

    // 5. สถิติการชำระเงินตาม method
    const paymentsByMethod = await prisma.payment.groupBy({
      by: ['paymentMethod'],
      where: {
        createdAt: {
          gte: startDate,
        },
        status: 'COMPLETED',
      },
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    // 6. อัตราการยกเลิกการจอง
    const totalBookingsInPeriod = bookingsInPeriod.length;
    const cancelledBookings = bookingsInPeriod.filter((b: any) => b.status === 'CANCELLED').length;
    const cancellationRate = totalBookingsInPeriod > 0
      ? ((cancelledBookings / totalBookingsInPeriod) * 100).toFixed(2)
      : '0';

    // 7. ห้องที่ได้รับความนิยมมากที่สุด
    const popularRooms = await prisma.booking.groupBy({
      by: ['roomId'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const popularRoomsWithDetails = await Promise.all(
      popularRooms.map(async (item: any) => {
        const room = await prisma.room.findUnique({
          where: { id: item.roomId },
          include: {
            dormitory: {
              select: {
                name: true,
              },
            },
          },
        });
        return {
          roomId: item.roomId,
          roomNumber: room?.roomNumber,
          dormitory: room?.dormitory.name,
          type: room?.type,
          price: room?.price,
          bookingCount: item._count.id,
        };
      })
    );

    // 8. ยอดเงินค้างชำระจาก booking ที่ยังไม่ชำระ
    const unpaidBookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      include: {
        payments: {
          where: {
            status: 'COMPLETED',
          },
        },
      },
    });

    let totalUnpaidAmount = 0;
    unpaidBookings.forEach((booking: any) => {
      const totalPaid = booking.payments.reduce((sum: any, p: any) => sum + p.amount, 0);
      const unpaid = booking.totalAmount - totalPaid;
      if (unpaid > 0) {
        totalUnpaidAmount += unpaid;
      }
    });

    // 9. Average booking value
    const avgBookingValue = totalBookingsInPeriod > 0
      ? (bookingsInPeriod.reduce((sum: any, b: any) => sum + b.totalAmount, 0) / totalBookingsInPeriod).toFixed(2)
      : '0';

    // 10. Payment success rate
    const totalPaymentsInPeriod = paymentsInPeriod.length;
    const successfulPayments = paymentsInPeriod.filter((p: any) => p.status === 'COMPLETED').length;
    const paymentSuccessRate = totalPaymentsInPeriod > 0
      ? ((successfulPayments / totalPaymentsInPeriod) * 100).toFixed(2)
      : '0';

    const statsData = {
      period: {
        days: days,
        startDate: startDate,
        endDate: new Date(),
      },
      bookings: {
        total: totalBookingsInPeriod,
        cancelled: cancelledBookings,
        cancellationRate: parseFloat(cancellationRate),
        averageValue: parseFloat(avgBookingValue),
      },
      payments: {
        total: totalPaymentsInPeriod,
        successful: successfulPayments,
        successRate: parseFloat(paymentSuccessRate),
        totalAmount: paymentsInPeriod.reduce((sum: any, p: any) => sum + p.amount, 0),
        completedAmount: paymentsInPeriod
          .filter((p: any) => p.status === 'COMPLETED')
          .reduce((sum: any, p: any) => sum + p.amount, 0),
      },
      revenue: {
        daily: dailyRevenue.map((item: any) => ({
          date: item.paymentDate,
          amount: item._sum.amount || 0,
        })),
        total: dailyRevenue.reduce((sum: any, item: any) => sum + (item._sum.amount || 0), 0),
        average: dailyRevenue.length > 0
          ? (dailyRevenue.reduce((sum: any, item: any) => sum + (item._sum.amount || 0), 0) / dailyRevenue.length).toFixed(2)
          : 0,
      },
      paymentMethods: paymentsByMethod.map((method: any) => ({
        method: method.paymentMethod,
        count: method._count.id,
        totalAmount: method._sum.amount || 0,
      })),
      unpaidAmount: totalUnpaidAmount,
      popularRooms: popularRoomsWithDetails,
      trends: {
        bookingsPerDay: dailyBookings.map((item) => ({
          date: item.date,
          count: item.count,
        })),
      },
    };

    return successResponse(statsData, 'ดึงข้อมูลสถิติสำเร็จ');
  } catch (error) {
    console.error('Error fetching stats:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ');
  }
}
