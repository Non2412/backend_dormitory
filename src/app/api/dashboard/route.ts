import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, serverErrorResponse } from '@/lib/response';

// GET /api/dashboard - ดึงข้อมูลสรุปสำหรับ Dashboard
export async function GET(request: NextRequest) {
  try {
    // 1. นับจำนวนข้อมูลพื้นฐาน
    const [
      totalUsers,
      totalDormitories,
      totalRooms,
      totalBookings,
      totalPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.dormitory.count(),
      prisma.room.count(),
      prisma.booking.count(),
      prisma.payment.count(),
    ]);

    // 2. สถิติห้องพัก (ว่าง, ถูกจอง, ซ่อมบำรุง)
    const roomsByStatus = await prisma.room.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const roomStats = {
      available: roomsByStatus.find(r => r.status === 'AVAILABLE')?._count.id || 0,
      occupied: roomsByStatus.find(r => r.status === 'OCCUPIED')?._count.id || 0,
      maintenance: roomsByStatus.find(r => r.status === 'MAINTENANCE')?._count.id || 0,
      reserved: roomsByStatus.find(r => r.status === 'RESERVED')?._count.id || 0,
      total: totalRooms,
    };

    // 3. สถิติการจอง
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const bookingStats = {
      pending: bookingsByStatus.find(b => b.status === 'PENDING')?._count.id || 0,
      confirmed: bookingsByStatus.find(b => b.status === 'CONFIRMED')?._count.id || 0,
      cancelled: bookingsByStatus.find(b => b.status === 'CANCELLED')?._count.id || 0,
      completed: bookingsByStatus.find(b => b.status === 'COMPLETED')?._count.id || 0,
      total: totalBookings,
    };

    // 4. สถิติการชำระเงิน
    const paymentsByStatus = await prisma.payment.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    });

    const completedPayments = paymentsByStatus.find(p => p.status === 'COMPLETED');
    const pendingPayments = paymentsByStatus.find(p => p.status === 'PENDING');
    const failedPayments = paymentsByStatus.find(p => p.status === 'FAILED');
    const refundedPayments = paymentsByStatus.find(p => p.status === 'REFUNDED');

    const paymentStats = {
      completed: {
        count: completedPayments?._count.id || 0,
        amount: completedPayments?._sum.amount || 0,
      },
      pending: {
        count: pendingPayments?._count.id || 0,
        amount: pendingPayments?._sum.amount || 0,
      },
      failed: {
        count: failedPayments?._count.id || 0,
        amount: failedPayments?._sum.amount || 0,
      },
      refunded: {
        count: refundedPayments?._count.id || 0,
        amount: refundedPayments?._sum.amount || 0,
      },
      total: {
        count: totalPayments,
        amount: paymentsByStatus.reduce((sum, p) => sum + (p._sum.amount || 0), 0),
      },
    };

    // 5. สรุปยอดเงินทั้งหมด
    const financialSummary = {
      totalRevenue: completedPayments?._sum.amount || 0, // เงินที่จ่ายแล้วทั้งหมด
      pendingAmount: pendingPayments?._sum.amount || 0, // ยอดที่ค้างชำระ
      totalBookingAmount: await prisma.booking.aggregate({
        _sum: {
          totalAmount: true,
        },
      }).then(result => result._sum.totalAmount || 0),
    };

    // 6. การจองล่าสุด (5 รายการ)
    const recentBookings = await prisma.booking.findMany({
      take: 5,
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
        room: {
          select: {
            id: true,
            roomNumber: true,
            dormitory: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // 7. การชำระเงินล่าสุด (5 รายการ)
    const recentPayments = await prisma.payment.findMany({
      take: 5,
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
          select: {
            id: true,
            room: {
              select: {
                roomNumber: true,
                dormitory: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 8. สถิติผู้ใช้งานตาม role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    const userStats = {
      students: usersByRole.find(u => u.role === 'STUDENT')?._count.id || 0,
      admins: usersByRole.find(u => u.role === 'ADMIN')?._count.id || 0,
      staff: usersByRole.find(u => u.role === 'STAFF')?._count.id || 0,
      total: totalUsers,
    };

    // 9. หอพักที่มีห้องว่างมากที่สุด
    const dormitoriesWithAvailableRooms = await prisma.dormitory.findMany({
      include: {
        rooms: {
          where: {
            status: 'AVAILABLE',
          },
        },
        _count: {
          select: {
            rooms: true,
          },
        },
      },
      orderBy: {
        rooms: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const topDormitories = dormitoriesWithAvailableRooms.map(dorm => ({
      id: dorm.id,
      name: dorm.name,
      address: dorm.address,
      totalRooms: dorm._count.rooms,
      availableRooms: dorm.rooms.length,
      occupancyRate: dorm._count.rooms > 0 
        ? ((dorm._count.rooms - dorm.rooms.length) / dorm._count.rooms * 100).toFixed(2)
        : 0,
    }));

    // รวมข้อมูลทั้งหมด
    const dashboardData = {
      summary: {
        users: totalUsers,
        dormitories: totalDormitories,
        rooms: totalRooms,
        bookings: totalBookings,
        payments: totalPayments,
      },
      rooms: roomStats,
      bookings: bookingStats,
      payments: paymentStats,
      financial: {
        totalRevenue: financialSummary.totalRevenue, // เงินที่ได้รับแล้ว
        pendingAmount: financialSummary.pendingAmount, // ยอดค้างชำระ
        totalBookingValue: financialSummary.totalBookingAmount, // มูลค่าการจองทั้งหมด
        collectionRate: financialSummary.totalBookingAmount > 0
          ? ((financialSummary.totalRevenue / financialSummary.totalBookingAmount) * 100).toFixed(2)
          : 0, // อัตราการเก็บเงิน (%)
      },
      users: userStats,
      recentBookings: recentBookings.map(booking => ({
        id: booking.id,
        user: `${booking.user.firstName} ${booking.user.lastName}`,
        room: booking.room.roomNumber,
        dormitory: booking.room.dormitory.name,
        status: booking.status,
        totalAmount: booking.totalAmount,
        startDate: booking.startDate,
        createdAt: booking.createdAt,
      })),
      recentPayments: recentPayments.map(payment => ({
        id: payment.id,
        user: `${payment.user.firstName} ${payment.user.lastName}`,
        room: payment.booking.room.roomNumber,
        dormitory: payment.booking.room.dormitory.name,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentDate: payment.paymentDate,
        createdAt: payment.createdAt,
      })),
      topDormitories,
    };

    return successResponse(dashboardData, 'ดึงข้อมูล Dashboard สำเร็จ');
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard');
  }
}
