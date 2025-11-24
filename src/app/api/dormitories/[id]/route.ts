import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse } from '@/lib/response';
import { updateDormitorySchema } from '@/lib/validation';

// GET /api/dormitories/[id] - ดึงข้อมูลหอพักตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dormitory = await prisma.dormitory.findUnique({
      where: { id },
      include: {
        rooms: {
          orderBy: { roomNumber: 'asc' },
        },
      },
    });

    if (!dormitory) {
      return notFoundResponse('ไม่พบหอพัก');
    }

    const formattedDormitory = {
      ...dormitory,
      facilities: (() => {
        if (!dormitory.facilities) return [];
        try {
          return JSON.parse(dormitory.facilities);
        } catch (error) {
          console.error(`Error parsing facilities for dormitory ${id}:`, error);
          return [];
        }
      })(),
    };

    return successResponse(formattedDormitory);
  } catch (error) {
    console.error('Error fetching dormitory:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลหอพัก');
  }
}

// PUT /api/dormitories/[id] - อัปเดตข้อมูลหอพัก
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = updateDormitorySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const existingDormitory = await prisma.dormitory.findUnique({
      where: { id },
    });

    if (!existingDormitory) {
      return notFoundResponse('ไม่พบหอพัก');
    }

    const updateData: any = { ...validation.data };

    if (updateData.facilities) {
      updateData.facilities = JSON.stringify(updateData.facilities);
    }

    const dormitory = await prisma.dormitory.update({
      where: { id },
      data: updateData,
    });

    const formattedDormitory = {
      ...dormitory,
      facilities: (() => {
        if (!dormitory.facilities) return [];
        try {
          return JSON.parse(dormitory.facilities);
        } catch (error) {
          console.error(`Error parsing facilities for dormitory ${id}:`, error);
          return [];
        }
      })(),
    };

    return successResponse(formattedDormitory, 'อัปเดตข้อมูลหอพักสำเร็จ');
  } catch (error) {
    console.error('Error updating dormitory:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการอัปเดตข้อมูลหอพัก');
  }
}

// DELETE /api/dormitories/[id] - ลบหอพัก
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dormitory = await prisma.dormitory.findUnique({
      where: { id },
      include: {
        rooms: true,
      },
    });

    if (!dormitory) {
      return notFoundResponse('ไม่พบหอพัก');
    }

    if (dormitory.rooms.length > 0) {
      return errorResponse('ไม่สามารถลบหอพักที่มีห้องพักอยู่ได้ กรุณาลบห้องพักก่อน', 400);
    }

    await prisma.dormitory.delete({
      where: { id },
    });

    return successResponse(null, 'ลบหอพักสำเร็จ');
  } catch (error) {
    console.error('Error deleting dormitory:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการลบหอพัก');
  }
}
