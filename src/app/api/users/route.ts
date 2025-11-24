import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, notFoundResponse, serverErrorResponse, paginatedResponse } from '@/lib/response';
import { hashPassword, excludePassword } from '@/lib/auth';
import { createUserSchema, updateUserSchema } from '@/lib/validation';

// GET /api/users - ดึงข้อมูลผู้ใช้ทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (role) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const usersWithoutPasswords = users.map((user: any) => excludePassword(user));

    return paginatedResponse(usersWithoutPasswords, page, limit, total);
  } catch (error) {
    console.error('Error fetching users:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้');
  }
}

// POST /api/users - สร้างผู้ใช้ใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(validation.error.issues[0].message);
    }

    const { email, password, firstName, lastName, phone, role } = validation.data;

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('อีเมลนี้ถูกใช้งานแล้ว', 409);
    }

    // เข้ารหัสรหัสผ่าน
    const hashedPassword = await hashPassword(password);

    // สร้างผู้ใช้ใหม่
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: role || 'STUDENT',
      },
    });

    const userWithoutPassword = excludePassword(user);

    return successResponse(userWithoutPassword, 'สร้างผู้ใช้สำเร็จ', 201);
  } catch (error) {
    console.error('Error creating user:', error);
    return serverErrorResponse('เกิดข้อผิดพลาดในการสร้างผู้ใช้');
  }
}
