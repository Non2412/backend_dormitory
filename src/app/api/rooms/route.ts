import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse, paginatedResponse } from '@/lib/response';
import { createRoomSchema } from '@/lib/validation';

// GET /api/rooms - ดึงข้อมูลห้องพักทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const dormitoryId = searchParams.get('dormitoryId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    const skip = (page - 1) * limit;

    const where: Prisma.RoomWhereInput = {};

    if (dormitoryId) {
      where.dormitoryId = dormitoryId;
    }

    if (type) {
      where.type = type as any;
    }

    if (status) {
      where.status = status as any;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [rooms, total] = await Promise.all([
      prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { dormitoryId: 'asc' },
          { floor: 'asc' },
          { roomNumber: 'asc' },
        ],
        include: {
          dormitory: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      }),
      prisma.room.count({ where }),
    ]);

    return paginatedResponse(rooms, page, limit, total);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลห้องพัก');
  }
}

// POST /api/rooms - สร้างห้องพักใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createRoomSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { roomNumber, dormitoryId, type, capacity, price, floor, status, description, imageUrl } = validation.data;

    // ตรวจสอบว่าหอพักมีอยู่จริง
    const dormitory = await prisma.dormitory.findUnique({
      where: { id: dormitoryId },
    });

    if (!dormitory) {
      return errorResponse('ไม่พบหอพักที่ระบุ', 404);
    }

    // ตรวจสอบว่าหมายเลขห้องซ้ำในหอพักเดียวกันหรือไม่
    const existingRoom = await prisma.room.findUnique({
      where: {
        dormitoryId_roomNumber: {
          dormitoryId,
          roomNumber,
        },
      },
    });

    if (existingRoom) {
      return errorResponse('หมายเลขห้องนี้มีอยู่แล้วในหอพักนี้', 409);
    }

    const room = await prisma.room.create({
      data: {
        roomNumber,
        dormitoryId,
        type,
        capacity,
        price,
        floor,
        status: status || 'AVAILABLE',
        description,
        imageUrl,
      },
      include: {
        dormitory: true,
      },
    });

    return successResponse(room, 'สร้างห้องพักสำเร็จ', 201);
  } catch (error) {
    console.error('Error creating room:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการสร้างห้องพัก');
  }
}
