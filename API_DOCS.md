# Backend API สำหรับระบบจัดการหอพัก

Backend API สำหรับโปรเจกต์ระบบจัดการหอพัก พัฒนาด้วย Next.js 16, TypeScript, และ Prisma ORM

## 📋 Features

- 🔐 User Management - จัดการข้อมูลผู้ใช้ (นักศึกษา, ผู้ดูแล, พนักงาน)
- 🏠 Dormitory Management - จัดการข้อมูลหอพัก
- 🚪 Room Management - จัดการห้องพักพร้อมระบบกรองและค้นหา
- 📅 Booking System - ระบบจองห้องพัก
- 💰 Payment Tracking - ติดตามการชำระเงิน

## 🛠️ Technology Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** SQLite (development) - สามารถเปลี่ยนเป็น PostgreSQL/MySQL ได้
- **Validation:** Zod
- **Authentication:** bcryptjs

## 📁 Project Structure

```
backend_dormitory/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── users/         # User API routes
│   │       ├── dormitories/   # Dormitory API routes
│   │       ├── rooms/         # Room API routes
│   │       ├── bookings/      # Booking API routes
│   │       └── payments/      # Payment API routes
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client
│   │   ├── response.ts       # Response helpers
│   │   ├── validation.ts     # Zod schemas
│   │   └── auth.ts           # Auth helpers
│   └── types/
│       └── index.ts          # TypeScript types
└── .env                      # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm/yarn/pnpm

### Installation

1. Clone repository
```bash
git clone <repository-url>
cd backend_dormitory
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. ตั้งค่า environment variables
```bash
cp .env.example .env
```

4. สร้าง database และ run migrations
```bash
npx prisma migrate dev
```

5. Generate Prisma Client
```bash
npx prisma generate
```

6. Run development server
```bash
npm run dev
```

API จะทำงานที่ `http://localhost:3000`

## 📚 API Endpoints

### Users
- `GET /api/users` - ดึงรายการผู้ใช้ทั้งหมด (รองรับ pagination, search, filter)
- `POST /api/users` - สร้างผู้ใช้ใหม่
- `GET /api/users/[id]` - ดึงข้อมูลผู้ใช้ตาม ID
- `PUT /api/users/[id]` - อัปเดตข้อมูลผู้ใช้
- `DELETE /api/users/[id]` - ลบผู้ใช้

### Dormitories
- `GET /api/dormitories` - ดึงรายการหอพักทั้งหมด (รองรับ pagination, search)
- `POST /api/dormitories` - สร้างหอพักใหม่
- `GET /api/dormitories/[id]` - ดึงข้อมูลหอพักตาม ID
- `PUT /api/dormitories/[id]` - อัปเดตข้อมูลหอพัก
- `DELETE /api/dormitories/[id]` - ลบหอพัก

### Rooms
- `GET /api/rooms` - ดึงรายการห้องพักทั้งหมด (รองรับ pagination, filter ตามหอพัก, ประเภท, สถานะ, ราคา)
- `POST /api/rooms` - สร้างห้องพักใหม่
- `GET /api/rooms/[id]` - ดึงข้อมูลห้องพักตาม ID
- `PUT /api/rooms/[id]` - อัปเดตข้อมูลห้องพัก
- `DELETE /api/rooms/[id]` - ลบห้องพัก

### Bookings
- `GET /api/bookings` - ดึงรายการการจองทั้งหมด (รองรับ pagination, filter)
- `POST /api/bookings` - สร้างการจองใหม่
- `GET /api/bookings/[id]` - ดึงข้อมูลการจองตาม ID
- `PUT /api/bookings/[id]` - อัปเดตข้อมูลการจอง
- `DELETE /api/bookings/[id]` - ยกเลิกการจอง

### Payments
- `GET /api/payments` - ดึงรายการการชำระเงินทั้งหมด (รองรับ pagination, filter)
- `POST /api/payments` - บันทึกการชำระเงินใหม่
- `GET /api/payments/[id]` - ดึงข้อมูลการชำระเงินตาม ID
- `PUT /api/payments/[id]` - อัปเดตข้อมูลการชำระเงิน
- `DELETE /api/payments/[id]` - ลบข้อมูลการชำระเงิน

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## 🗄️ Database Schema

### User
- บทบาท: STUDENT, ADMIN, STAFF
- ข้อมูล: อีเมล, รหัสผ่าน, ชื่อ, เบอร์โทร

### Dormitory
- ข้อมูลหอพัก: ชื่อ, ที่อยู่, คำอธิบาย, รูปภาพ, สิ่งอำนวยความสะดวก

### Room
- ประเภท: SINGLE, DOUBLE, TRIPLE, QUAD
- สถานะ: AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED
- ข้อมูล: หมายเลขห้อง, ความจุ, ราคา, ชั้น

### Booking
- สถานะ: PENDING, CONFIRMED, CANCELLED, COMPLETED
- ข้อมูล: วันเริ่มต้น, วันสิ้นสุด, ยอดเงินรวม

### Payment
- วิธีชำระเงิน: CASH, BANK_TRANSFER, CREDIT_CARD, PROMPTPAY
- สถานะ: PENDING, COMPLETED, FAILED, REFUNDED
- ข้อมูล: จำนวนเงิน, สลิปการโอนเงิน

## 🔧 Development

### Prisma Commands

```bash
# สร้าง migration ใหม่
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# เปิด Prisma Studio (GUI สำหรับดู database)
npx prisma studio
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔐 Security Notes

- รหัสผ่านถูกเข้ารหัสด้วย bcryptjs ก่อนบันทึกลง database
- ควรเพิ่ม JWT authentication สำหรับ production
- ควรเพิ่ม rate limiting
- ควรเพิ่ม CORS configuration ตามความเหมาะสม

## 📄 License

MIT
