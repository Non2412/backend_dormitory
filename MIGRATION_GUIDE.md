# 🔄 Migration Guide: SQLite → PostgreSQL

## 📋 Overview

คู่มือการย้ายข้อมูลจาก SQLite (Development) ไป PostgreSQL (Production)

---

## ⚠️ ทำไมต้องเปลี่ยน?

### SQLite
- ✅ ดีสำหรับ Development
- ❌ ไม่รองรับ Vercel (serverless)
- ❌ ไม่มี file system ถาวร

### PostgreSQL
- ✅ รองรับ Vercel
- ✅ Production-ready
- ✅ Scalable
- ✅ ฟรีจาก Vercel/Neon/Supabase

---

## 🚀 วิธีการ Migration

### ขั้นตอนที่ 1: Backup ข้อมูลเดิม (Optional)

```bash
# Export ข้อมูลจาก SQLite
npx prisma db pull
npx prisma generate

# หรือ backup ไฟล์ database
cp prisma/dev.db prisma/dev.db.backup
```

---

### ขั้นตอนที่ 2: สร้าง PostgreSQL Database

#### ตัวเลือกที่ 1: Vercel Postgres (แนะนำ)

1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. Storage → Create Database → Postgres
3. เลือก Region: Singapore (sin1)
4. คัดลอก `DATABASE_URL`

**Connection String Format:**
```
postgresql://user:password@host:5432/database?sslmode=require
```

#### ตัวเลือกที่ 2: Neon (ฟรี 512 MB)

1. ไปที่ [Neon.tech](https://neon.tech)
2. Sign up และสร้าง project
3. คัดลอก Connection String

#### ตัวเลือกที่ 3: Supabase (ฟรี 500 MB)

1. ไปที่ [Supabase.com](https://supabase.com)
2. สร้าง project
3. Settings → Database → Connection String
4. เลือก "URI" และคัดลอก

---

### ขั้นตอนที่ 3: อัปเดต Prisma Schema

#### 3.1 แก้ไข `prisma/schema.prisma`

**เดิม:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**ใหม่:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**หรือใช้ไฟล์ที่สร้างให้:**
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

---

### ขั้นตอนที่ 4: อัปเดต Environment Variables

#### 4.1 สร้างไฟล์ `.env.production`

```env
# PostgreSQL Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# App
NODE_ENV="production"
```

#### 4.2 อัปเดต `.env` (Development)

```env
# Development - ยังใช้ SQLite ได้
DATABASE_URL="file:./dev.db"

# หรือใช้ PostgreSQL ทั้ง dev และ prod
DATABASE_URL="postgresql://localhost:5432/dormitory_dev"
```

---

### ขั้นตอนที่ 5: สร้าง Migration

```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. สร้าง migration สำหรับ PostgreSQL
npx prisma migrate dev --name init_postgresql

# หรือถ้าใช้ production database
npx prisma migrate deploy
```

---

### ขั้นตอนที่ 6: Seed Database (Optional)

```bash
# Run seed script
npx prisma db seed

# หรือ
npm run seed
```

**ไฟล์ `prisma/seed.ts` สร้างให้แล้ว:**
- Admin user: `admin@dorm.com` / `admin123`
- Demo dormitory
- Demo rooms

---

## 📊 เปรียบเทียบ Schema

### SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Data Types | Limited | Full support |
| Constraints | Basic | Advanced |
| Performance | Good for small | Excellent for large |
| Concurrent Writes | Limited | Excellent |
| Vercel Support | ❌ | ✅ |

### Schema Changes

**ไม่มีการเปลี่ยนแปลง!** Schema เหมือนกัน 100%

```prisma
// ทั้ง SQLite และ PostgreSQL ใช้ schema เดียวกัน
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  // ...
}
```

---

## 🔄 Migration ข้อมูลจาก SQLite

### วิธีที่ 1: Export/Import (แนะนำสำหรับข้อมูลน้อย)

```bash
# 1. Export ข้อมูลจาก SQLite
npx prisma db pull --schema=prisma/schema.sqlite.prisma

# 2. Generate SQL dump (ใช้ tool เช่น sqlite3)
sqlite3 prisma/dev.db .dump > backup.sql

# 3. แปลงเป็น PostgreSQL format
# (ต้องแก้ไข SQL syntax เล็กน้อย)

# 4. Import เข้า PostgreSQL
psql $DATABASE_URL < backup.sql
```

### วิธีที่ 2: Manual Migration (แนะนำสำหรับข้อมูลน้อย)

```typescript
// scripts/migrate-data.ts
import { PrismaClient as SQLiteClient } from '@prisma/client';
import { PrismaClient as PostgresClient } from '@prisma/client';

const sqlite = new SQLiteClient({
  datasources: { db: { url: 'file:./dev.db' } }
});

const postgres = new PostgresClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

async function migrate() {
  // Migrate Users
  const users = await sqlite.user.findMany();
  for (const user of users) {
    await postgres.user.create({ data: user });
  }
  
  // Migrate Dormitories
  const dormitories = await sqlite.dormitory.findMany();
  for (const dorm of dormitories) {
    await postgres.dormitory.create({ data: dorm });
  }
  
  // ... migrate other tables
}

migrate();
```

### วิธีที่ 3: เริ่มใหม่ (แนะนำสำหรับ Development)

```bash
# ใช้ seed script เพื่อสร้างข้อมูลใหม่
npx prisma db seed
```

---

## 🧪 ทดสอบหลัง Migration

### 1. ทดสอบ Connection

```bash
# ทดสอบว่าเชื่อมต่อได้
npx prisma db pull
```

### 2. ทดสอบ Queries

```bash
# เปิด Prisma Studio
npx prisma studio

# ตรวจสอบข้อมูลใน browser
```

### 3. ทดสอบ API

```bash
# รัน Backend
npm run dev

# ทดสอบ API
curl http://localhost:3000/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dorm.com","password":"admin123"}'
```

---

## 🔧 Troubleshooting

### ปัญหา: Connection Failed

**Error:**
```
Error: Can't reach database server
```

**วิธีแก้:**
1. ตรวจสอบ `DATABASE_URL` ถูกต้อง
2. ตรวจสอบมี `?sslmode=require` ใน connection string
3. ตรวจสอบ database ยังทำงานอยู่

---

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

### ปัญหา: Data Type Mismatch

**Error:**
```
Type 'String' is not compatible with 'Int'
```

**วิธีแก้:**
- ตรวจสอบ schema ว่า data types ถูกต้อง
- PostgreSQL เข้มงวดกว่า SQLite

---

## 📝 Best Practices

### 1. ใช้ Environment Variables

```bash
# Development
DATABASE_URL="file:./dev.db"

# Production
DATABASE_URL="postgresql://..."
```

### 2. ใช้ Connection Pooling

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 3. Backup ก่อน Deploy

```bash
# Backup SQLite
cp prisma/dev.db prisma/dev.db.backup

# Backup PostgreSQL
pg_dump $DATABASE_URL > backup.sql
```

---

## 🎯 Checklist

- [ ] สร้าง PostgreSQL database
- [ ] คัดลอก `DATABASE_URL`
- [ ] แก้ไข `prisma/schema.prisma`
- [ ] อัปเดต `.env.production`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma migrate deploy`
- [ ] Run `npx prisma db seed` (optional)
- [ ] ทดสอบ connection
- [ ] ทดสอบ API
- [ ] Deploy ขึ้น Vercel

---

## 💰 ค่าใช้จ่าย

### Free Tier Comparison

| Provider | Storage | Bandwidth | Price |
|----------|---------|-----------|-------|
| Vercel Postgres | 256 MB | Unlimited | ฟรี |
| Neon | 512 MB | Unlimited | ฟรี |
| Supabase | 500 MB | 2 GB | ฟรี |

**แนะนำ:** Vercel Postgres (ใช้ร่วมกับ Vercel deployment ได้ดี)

---

## 📚 Resources

- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Documentation](https://neon.tech/docs)
- [Supabase Database](https://supabase.com/docs/guides/database)

---

**Created:** 2025-11-24  
**Author:** Antigravity AI Assistant
