# ✅ เปลี่ยน Database เสร็จแล้ว!

## 🎉 สิ่งที่ทำเสร็จแล้ว

✅ **แก้ไข `prisma/schema.prisma`**
- เปลี่ยนจาก `provider = "sqlite"` 
- เป็น `provider = "postgresql"`

---

## 🚀 ขั้นตอนถัดไป

### Step 1: สร้าง PostgreSQL Database

คุณต้องสร้าง PostgreSQL database ก่อน มี 3 ตัวเลือก:

#### ตัวเลือกที่ 1: Vercel Postgres (แนะนำ) ⭐

1. ไปที่ https://vercel.com/dashboard
2. คลิก **Storage** (เมนูซ้าย)
3. คลิก **Create Database**
4. เลือก **Postgres**
5. ตั้งชื่อ database: `dormitory-db`
6. เลือก Region: **Singapore (sin1)**
7. คลิก **Create**
8. คัดลอก **DATABASE_URL** (จะมีรูปแบบ: `postgresql://...`)

#### ตัวเลือกที่ 2: Neon (ฟรี 512 MB)

1. ไปที่ https://neon.tech
2. Sign up / Login
3. คลิก **Create Project**
4. ตั้งชื่อ: `dormitory-db`
5. เลือก Region: **Singapore**
6. คลิก **Create Project**
7. คัดลอก **Connection String**

#### ตัวเลือกที่ 3: Supabase (ฟรี 500 MB)

1. ไปที่ https://supabase.com
2. Sign up / Login
3. คลิก **New Project**
4. ตั้งชื่อ: `dormitory-db`
5. เลือก Region: **Southeast Asia (Singapore)**
6. คลิก **Create Project**
7. ไปที่ Settings → Database
8. คัดลอก **Connection String** (URI format)

---

### Step 2: ตั้งค่า DATABASE_URL

หลังจากได้ `DATABASE_URL` แล้ว:

#### 2.1 สร้างไฟล์ `.env.production` (ใหม่)

```env
# PostgreSQL Database (Production)
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long"
JWT_EXPIRES_IN="7d"

# App
NODE_ENV="production"
```

**⚠️ สำคัญ:** แทนที่ `DATABASE_URL` ด้วยที่คัดลอกมา

#### 2.2 อัปเดตไฟล์ `.env` (Development - Optional)

ถ้าต้องการใช้ PostgreSQL ใน development ด้วย:

```env
# Development - PostgreSQL
DATABASE_URL="postgresql://localhost:5432/dormitory_dev"

# หรือยังใช้ SQLite ใน development
DATABASE_URL="file:./dev.db"
```

---

### Step 3: Generate Prisma Client

เปิด Terminal และรันคำสั่ง:

```bash
# ไปที่โฟลเดอร์ backend
cd "c:\Users\Notebook Lenovo\Documents\Nextjs_proj\backend_dormitory"

# Generate Prisma Client สำหรับ PostgreSQL
npx prisma generate
```

---

### Step 4: สร้าง Migration (สำหรับ Production)

```bash
# สร้าง migration สำหรับ PostgreSQL
npx prisma migrate dev --name init_postgresql

# หรือถ้าใช้ production database โดยตรง
npx prisma migrate deploy
```

---

### Step 5: Seed Database (Optional)

สร้างข้อมูลเริ่มต้น:

```bash
npx prisma db seed
```

**ข้อมูลที่จะถูกสร้าง:**
- Admin user: `admin@dorm.com` / `admin123`
- Demo dormitory
- Demo rooms (101, 201)

---

## 🧪 ทดสอบ Connection

```bash
# ทดสอบว่าเชื่อมต่อ database ได้
npx prisma db pull

# เปิด Prisma Studio ดูข้อมูล
npx prisma studio
```

---

## ✅ Checklist

- [ ] สร้าง PostgreSQL database (Vercel/Neon/Supabase)
- [ ] คัดลอก `DATABASE_URL`
- [ ] สร้างไฟล์ `.env.production` และใส่ `DATABASE_URL`
- [ ] รัน `npx prisma generate`
- [ ] รัน `npx prisma migrate deploy`
- [ ] รัน `npx prisma db seed` (optional)
- [ ] ทดสอบ connection

---

## 🎯 หลังจากนี้

เมื่อทำครบทุกขั้นตอนแล้ว:

1. ✅ Database เปลี่ยนเป็น PostgreSQL แล้ว
2. 🚀 พร้อม Deploy ขึ้น Vercel
3. 📝 ขั้นตอนถัดไป: Push code ขึ้น GitHub

---

## 💡 Tips

### ถ้าใช้ Vercel Postgres:
- ไม่ต้อง run migration ก่อน deploy
- Deploy แล้วค่อย run migration ผ่าน Vercel CLI

### ถ้าใช้ Neon หรือ Supabase:
- ควร run migration ก่อน deploy
- เพื่อให้ database พร้อมใช้งาน

---

## 🐛 Troubleshooting

### ปัญหา: Connection Failed

**Error:**
```
Error: Can't reach database server
```

**วิธีแก้:**
1. ตรวจสอบ `DATABASE_URL` ถูกต้อง
2. ตรวจสอบมี `?sslmode=require` ต่อท้าย URL
3. ตรวจสอบ database ยังทำงานอยู่

### ปัญหา: Migration Failed

**Error:**
```
Error: Migration failed to apply
```

**วิธีแก้:**
```bash
# Reset database
npx prisma migrate reset

# Apply migrations ใหม่
npx prisma migrate deploy
```

---

## 📞 ต้องการความช่วยเหลือ?

ถ้าติดปัญหาตรงไหน บอกฉันได้เลยครับ! 😊

---

**Created:** 2025-11-24  
**Status:** ✅ Schema แก้เสร็จแล้ว - รอสร้าง PostgreSQL database
