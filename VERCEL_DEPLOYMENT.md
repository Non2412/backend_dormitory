# 🚀 Deploy Backend ขึ้น Vercel

## ⚠️ สิ่งที่ต้องแก้ไข

### 1. **เปลี่ยนจาก SQLite เป็น PostgreSQL**

Vercel ไม่รองรับ SQLite เพราะเป็น serverless environment (ไม่มี file system ถาวร)

**ต้องเปลี่ยนเป็น:**
- ✅ PostgreSQL (แนะนำ - ฟรีจาก Vercel Postgres)
- ✅ MySQL (PlanetScale)
- ✅ MongoDB (MongoDB Atlas)

---

## 📋 ขั้นตอนการ Deploy

### ขั้นตอนที่ 1: เปลี่ยน Database เป็น PostgreSQL

#### 1.1 แก้ไข `prisma/schema.prisma`

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

#### 1.2 สร้าง PostgreSQL Database

**ตัวเลือกที่ 1: Vercel Postgres (แนะนำ - ฟรี)**
1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือก Storage → Create Database → Postgres
3. เลือก Region ใกล้ที่สุด
4. คัดลอก `DATABASE_URL`

**ตัวเลือกที่ 2: Neon (ฟรี)**
1. ไปที่ [Neon.tech](https://neon.tech)
2. สร้าง account และ project
3. คัดลอก `DATABASE_URL`

**ตัวเลือกที่ 3: Supabase (ฟรี)**
1. ไปที่ [Supabase.com](https://supabase.com)
2. สร้าง project
3. ไปที่ Settings → Database → Connection String
4. คัดลอก `DATABASE_URL`

---

### ขั้นตอนที่ 2: อัปเดต Environment Variables

#### 2.1 สร้างไฟล์ `.env.production`

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# App
NODE_ENV="production"
```

#### 2.2 ตั้งค่าใน Vercel Dashboard

1. ไปที่ Project Settings → Environment Variables
2. เพิ่ม variables:
   - `DATABASE_URL` = (PostgreSQL connection string)
   - `JWT_SECRET` = (random string ยาวๆ)
   - `JWT_EXPIRES_IN` = `7d`
   - `NODE_ENV` = `production`

---

### ขั้นตอนที่ 3: เพิ่ม Vercel Configuration

#### 3.1 สร้างไฟล์ `vercel.json`

```json
{
  "version": 2,
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "DATABASE_URL": "@database_url",
    "JWT_SECRET": "@jwt_secret"
  }
}
```

#### 3.2 แก้ไข `package.json`

เพิ่ม scripts:

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "prisma generate && prisma migrate deploy && next build",
    "start": "next start",
    "lint": "eslint",
    "postinstall": "prisma generate"
  }
}
```

---

### ขั้นตอนที่ 4: เพิ่ม Prisma Configuration

#### 4.1 สร้างไฟล์ `prisma/seed.ts` (optional)

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // สร้าง Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dorm.com' },
    update: {},
    create: {
      email: 'admin@dorm.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Seed data created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 4.2 เพิ่มใน `package.json`

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

### ขั้นตอนที่ 5: แก้ไข CORS (สำคัญ!)

#### 5.1 แก้ไข `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { 
            key: "Access-Control-Allow-Origin", 
            value: process.env.FRONTEND_URL || "*" 
          },
          { 
            key: "Access-Control-Allow-Methods", 
            value: "GET,POST,PUT,DELETE,OPTIONS" 
          },
          { 
            key: "Access-Control-Allow-Headers", 
            value: "Content-Type, Authorization" 
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true"
          }
        ],
      },
    ];
  },
};

export default nextConfig;
```

---

### ขั้นตอนที่ 6: Deploy ขึ้น Vercel

#### 6.1 ติดตั้ง Vercel CLI

```bash
npm install -g vercel
```

#### 6.2 Login

```bash
vercel login
```

#### 6.3 Deploy

```bash
# Deploy แบบ preview
vercel

# Deploy แบบ production
vercel --prod
```

**หรือ Deploy ผ่าน GitHub:**
1. Push code ขึ้น GitHub
2. ไปที่ [Vercel Dashboard](https://vercel.com)
3. Import GitHub Repository
4. ตั้งค่า Environment Variables
5. Deploy!

---

### ขั้นตอนที่ 7: Run Database Migrations

หลัง deploy เสร็จ ต้อง run migrations:

```bash
# ถ้าใช้ Vercel CLI
vercel env pull .env.production.local
npx prisma migrate deploy

# หรือใช้ Vercel Dashboard
# ไปที่ Deployments → ล่าสุด → ... → Redeploy
```

---

## 📝 Checklist ก่อน Deploy

- [ ] เปลี่ยน database เป็น PostgreSQL
- [ ] สร้าง PostgreSQL database (Vercel/Neon/Supabase)
- [ ] ตั้งค่า Environment Variables ใน Vercel
- [ ] เพิ่ม `vercel.json`
- [ ] แก้ไข `package.json` scripts
- [ ] แก้ไข CORS ใน `next.config.ts`
- [ ] Push code ขึ้น GitHub
- [ ] Deploy ผ่าน Vercel
- [ ] Run migrations
- [ ] ทดสอบ API endpoints

---

## 🔧 ไฟล์ที่ต้องสร้าง/แก้ไข

### 1. `prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"  // เปลี่ยนจาก sqlite
  url      = env("DATABASE_URL")
}
```

### 2. `vercel.json` (สร้างใหม่)
```json
{
  "version": 2,
  "buildCommand": "prisma generate && next build",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

### 3. `package.json`
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

### 4. `next.config.ts`
```typescript
// เพิ่ม CORS headers
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" }
      ]
    }
  ];
}
```

---

## 🌐 หลัง Deploy เสร็จ

### อัปเดต Frontend URL

แก้ไข `.env.local` ใน Frontend:

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Production
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

---

## 🧪 ทดสอบ API

```bash
# ทดสอบ health check
curl https://your-backend.vercel.app/api/health

# ทดสอบ login
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dorm.com","password":"admin123"}'
```

---

## ⚡ Performance Tips

### 1. ใช้ Edge Runtime (optional)

สำหรับ API routes ที่ไม่ต้องการ database:

```typescript
export const runtime = 'edge';

export async function GET() {
  return Response.json({ message: 'Hello from Edge!' });
}
```

### 2. Enable Caching

```typescript
export const revalidate = 60; // cache 60 seconds

export async function GET() {
  const data = await fetchData();
  return Response.json(data);
}
```

### 3. Connection Pooling

ใน `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 🐛 Troubleshooting

### ปัญหา: Build Failed

**วิธีแก้:**
```bash
# ลบ node_modules และ install ใหม่
rm -rf node_modules package-lock.json
npm install

# Generate Prisma Client
npx prisma generate

# Build ใหม่
npm run build
```

### ปัญหา: Database Connection Failed

**วิธีแก้:**
1. ตรวจสอบ `DATABASE_URL` ใน Vercel Dashboard
2. ตรวจสอบว่ามี `?sslmode=require` ใน connection string
3. ตรวจสอบว่า database ยังทำงานอยู่

### ปัญหา: CORS Error

**วิธีแก้:**
1. ตรวจสอบ `next.config.ts` มี headers ครบ
2. เพิ่ม `FRONTEND_URL` ใน environment variables
3. Redeploy

---

## 💰 ค่าใช้จ่าย

### Vercel
- **Hobby Plan**: ฟรี
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Serverless Functions

### Database
- **Vercel Postgres**: ฟรี (256 MB)
- **Neon**: ฟรี (512 MB)
- **Supabase**: ฟรี (500 MB)

---

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

---

**Created:** 2025-11-24  
**Author:** Antigravity AI Assistant
