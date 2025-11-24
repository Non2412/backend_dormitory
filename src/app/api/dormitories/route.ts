import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse, paginatedResponse } from '@/lib/response';
import { createDormitorySchema, updateDormitorySchema } from '@/lib/validation';

// GET /api/dormitories - ดึงข้อมูลหอพักทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: Prisma.DormitoryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const [dormitories, total] = await Promise.all([
      prisma.dormitory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          rooms: {
            select: {
              id: true,
              roomNumber: true,
              type: true,
              price: true,
              status: true,
            },
          },
        },
      }),
      prisma.dormitory.count({ where }),
    ]);

    // แปลง facilities จาก JSON string เป็น array
    const formattedDormitories = dormitories.map((dorm: any) => {
      let facilities = [];
      if (dorm.facilities) {
        try {
          facilities = JSON.parse(dorm.facilities);
        } catch (error) {
          console.error(`Error parsing facilities for dormitory ${dorm.id}:`, error);
          facilities = [];
        }
      }
      return {
        ...dorm,
        facilities,
      };
    });

    return paginatedResponse(formattedDormitories, page, limit, total);
  } catch (error) {
    console.error('Error fetching dormitories:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลหอพัก');
  }
}

// POST /api/dormitories - สร้างหอพักใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = createDormitorySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { name, address, description, imageUrl, facilities } = validation.data;

    const dormitory = await prisma.dormitory.create({
      data: {
        name,
        address,
        description,
        imageUrl,
        facilities: facilities ? JSON.stringify(facilities) : null,
      },
    });

    const formattedDormitory = {
      ...dormitory,
      facilities: (() => {
        if (!dormitory.facilities) return [];
        try {
          return JSON.parse(dormitory.facilities);
        } catch (error) {
          console.error(`Error parsing facilities:`, error);
          return [];
        }
      })(),
    };

    return successResponse(formattedDormitory, 'สร้างหอพักสำเร็จ', 201);
  } catch (error) {
    console.error('Error creating dormitory:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการสร้างหอพัก');
  }
}
