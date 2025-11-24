# 🔧 แก้ไขปัญหา Database Error

## ✅ สิ่งที่ทำแล้ว

เปลี่ยน schema กลับเป็น **SQLite** สำหรับ development

```prisma
datasource db {
  provider = "sqlite"  // ใช้ sqlite สำหรับ development
  url      = env("DATABASE_URL")
}
```

---

## 🚀 ขั้นตอนถัดไป

### Step 1: Generate Prisma Client ใหม่

```bash
npx prisma generate
```

### Step 2: สร้าง Migration

```bash
npx prisma migrate dev --name add_utility_billing
```

### Step 3: Restart Server

กด `Ctrl+C` ใน terminal ที่รัน server แล้วรันใหม่:

```bash
npm run dev
```

### Step 4: ทดสอบใน Postman อีกครั้ง

---

## 📝 หมายเหตุ

### Development (ตอนนี้)
- ใช้ **SQLite** (`file:./dev.db`)
- ทดสอบได้ทันที
- ไม่ต้องสร้าง PostgreSQL database

### Production (ตอนจะ Deploy)
- เปลี่ยนเป็น **PostgreSQL**
- ใช้ `schema.postgresql.prisma`
- Deploy ขึ้น Vercel

---

## 💡 คำแนะนำ

**ตอนนี้ใช้ SQLite ก่อน** เพื่อ:
1. ✅ ทดสอบระบบค่าน้ำ ค่าไฟ
2. ✅ ทดสอบ API ทั้งหมด
3. ✅ แน่ใจว่าทุกอย่างทำงาน

**ตอนจะ Deploy** ค่อยเปลี่ยนเป็น PostgreSQL:
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

---

**Created:** 2025-11-24  
**Status:** ✅ แก้ไขแล้ว - รอ generate และ migrate
