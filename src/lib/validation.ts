import { z } from 'zod';

// User Validation Schemas
export const createUserSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'),
  firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  phone: z.string().optional(),
  role: z.enum(['STUDENT', 'ADMIN', 'STAFF']).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง').optional(),
  firstName: z.string().min(1, 'กรุณากรอกชื่อ').optional(),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล').optional(),
  phone: z.string().optional(),
  role: z.enum(['STUDENT', 'ADMIN', 'STAFF']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

// Dormitory Validation Schemas
export const createDormitorySchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหอพัก'),
  address: z.string().min(1, 'กรุณากรอกที่อยู่'),
  description: z.string().optional(),
  imageUrl: z.string().url('URL รูปภาพไม่ถูกต้อง').optional(),
  facilities: z.array(z.string()).optional(),
});

export const updateDormitorySchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อหอพัก').optional(),
  address: z.string().min(1, 'กรุณากรอกที่อยู่').optional(),
  description: z.string().optional(),
  imageUrl: z.string().url('URL รูปภาพไม่ถูกต้อง').optional(),
  facilities: z.array(z.string()).optional(),
});

// Room Validation Schemas
export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, 'กรุณากรอกหมายเลขห้อง'),
  dormitoryId: z.string().min(1, 'กรุณาระบุหอพัก'),
  type: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD']),
  capacity: z.number().int().positive('จำนวนที่พักต้องเป็นจำนวนเต็มบวก'),
  price: z.number().positive('ราคาต้องเป็นจำนวนบวก'),
  floor: z.number().int('ชั้นต้องเป็นจำนวนเต็ม'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url('URL รูปภาพไม่ถูกต้อง').optional(),
});

export const updateRoomSchema = z.object({
  roomNumber: z.string().min(1, 'กรุณากรอกหมายเลขห้อง').optional(),
  type: z.enum(['SINGLE', 'DOUBLE', 'TRIPLE', 'QUAD']).optional(),
  capacity: z.number().int().positive('จำนวนที่พักต้องเป็นจำนวนเต็มบวก').optional(),
  price: z.number().positive('ราคาต้องเป็นจำนวนบวก').optional(),
  floor: z.number().int('ชั้นต้องเป็นจำนวนเต็ม').optional(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).optional(),
  description: z.string().optional(),
  imageUrl: z.string().url('URL รูปภาพไม่ถูกต้อง').optional(),
});

// Booking Validation Schemas
export const createBookingSchema = z.object({
  userId: z.string().min(1, 'กรุณาระบุผู้ใช้'),
  roomId: z.string().min(1, 'กรุณาระบุห้องพัก'),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  totalAmount: z.number().positive('ยอดเงินต้องเป็นจำนวนบวก'),
  notes: z.string().optional(),
});

export const updateBookingSchema = z.object({
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']).optional(),
  totalAmount: z.number().positive('ยอดเงินต้องเป็นจำนวนบวก').optional(),
  notes: z.string().optional(),
});

// Payment Validation Schemas
export const createPaymentSchema = z.object({
  bookingId: z.string().min(1, 'กรุณาระบุการจอง'),
  userId: z.string().min(1, 'กรุณาระบุผู้ใช้'),
  amount: z.number().positive('ยอดเงินต้องเป็นจำนวนบวก'),

  // รายละเอียดค่าใช้จ่าย
  rentAmount: z.number().nonnegative('ค่าเช่าต้องเป็นจำนวนบวกหรือศูนย์').optional(),
  waterAmount: z.number().nonnegative('ค่าน้ำต้องเป็นจำนวนบวกหรือศูนย์').optional(),
  electricAmount: z.number().nonnegative('ค่าไฟต้องเป็นจำนวนบวกหรือศูนย์').optional(),
  otherAmount: z.number().nonnegative('ค่าอื่นๆ ต้องเป็นจำนวนบวกหรือศูนย์').optional(),

  // ข้อมูลการใช้งาน
  waterUsage: z.number().nonnegative('หน่วยน้ำต้องเป็นจำนวนบวกหรือศูนย์').optional(),
  electricUsage: z.number().nonnegative('หน่วยไฟต้องเป็นจำนวนบวกหรือศูนย์').optional(),

  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'PROMPTPAY']),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  slipUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  amount: z.number().positive('ยอดเงินต้องเป็นจำนวนบวก').optional(),

  // รายละเอียดค่าใช้จ่าย
  rentAmount: z.number().nonnegative('ค่าเช่าต้องเป็นจำนวนบวกหรือศูนย์').optional(),
  waterAmount: z.number().nonnegative('ค่าน้ำต้องเป็นจำนวนบวกหรือศูนย์').optional(),
  electricAmount: z.number().nonnegative('ค่าไฟต้องเป็นจำนวนบวกหรือศูนย์').optional(),
  otherAmount: z.number().nonnegative('ค่าอื่นๆ ต้องเป็นจำนวนบวกหรือศูนย์').optional(),

  // ข้อมูลการใช้งาน
  waterUsage: z.number().nonnegative('หน่วยน้ำต้องเป็นจำนวนบวกหรือศูนย์').optional(),
  electricUsage: z.number().nonnegative('หน่วยไฟต้องเป็นจำนวนบวกหรือศูนย์').optional(),

  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'PROMPTPAY']).optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']).optional(),
  slipUrl: z.string().optional(),
  notes: z.string().optional(),
});
