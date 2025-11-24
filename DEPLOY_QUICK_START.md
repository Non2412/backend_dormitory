# ⚡ Quick Deploy Guide - Vercel

## 🎯 สรุปสั้นๆ: ต้องแก้อะไรบ้าง?

### ✅ สิ่งที่ต้องแก้:

1. **เปลี่ยน Database** จาก SQLite → PostgreSQL
2. **เพิ่ม CORS** ใน next.config.ts (✅ แก้แล้ว)
3. **อัปเดต Scripts** ใน package.json (✅ แก้แล้ว)
4. **สร้าง vercel.json** (✅ สร้างแล้ว)

---

## 🚀 Deploy ใน 5 นาที

### Step 1: เปลี่ยน Database (สำคัญที่สุด!)

#### 1.1 สร้าง PostgreSQL Database

**ตัวเลือกที่ 1: Vercel Postgres (แนะนำ)**
```bash
# 1. ไปที่ https://vercel.com/dashboard
# 2. Storage → Create Database → Postgres
# 3. เลือก Region: Singapore (sin1)
# 4. คัดลอก DATABASE_URL
```

**ตัวเลือกที่ 2: Neon (ฟรี)**
```bash
# 1. ไปที่ https://neon.tech
# 2. สร้าง project
# 3. คัดลอก Connection String
```

#### 1.2 แก้ไข `prisma/schema.prisma`

**คัดลอกจากไฟล์ที่สร้างให้:**
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
```

**หรือแก้ไขเอง:**
```prisma
datasource db {
  provider = "postgresql"  // เปลี่ยนจาก "sqlite"
  url      = env("DATABASE_URL")
}
```

---

### Step 2: Deploy ผ่าน GitHub (แนะนำ)

#### 2.1 Push Code ขึ้น GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

#### 2.2 Deploy บน Vercel

1. ไปที่ [vercel.com/new](https://vercel.com/new)
2. Import GitHub Repository
3. ตั้งค่า Environment Variables:
   - `DATABASE_URL` = (PostgreSQL connection string)
   - `JWT_SECRET` = `your-super-secret-key-change-this`
   - `JWT_EXPIRES_IN` = `7d`
4. กด **Deploy**!

---

### Step 3: Run Database Migrations

หลัง deploy เสร็จ:

```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Login
vercel login

# Pull environment variables
vercel env pull .env.production.local

# Run migrations
npx prisma migrate deploy

# (Optional) Seed database
npx prisma db seed
```

---

## 🎯 หรือ Deploy ด้วย Vercel CLI

```bash
# 1. Login
vercel login

# 2. Deploy (preview)
vercel

# 3. ตั้งค่า Environment Variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET

# 4. Deploy (production)
vercel --prod
```

---

## 📝 Environment Variables ที่ต้องตั้ง

```env
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_EXPIRES_IN="7d"
NODE_ENV="production"
FRONTEND_URL="https://your-frontend.vercel.app"
```

---

## ✅ Checklist

- [ ] เปลี่ยน `prisma/schema.prisma` เป็น PostgreSQL
- [ ] สร้าง PostgreSQL database (Vercel/Neon)
- [ ] Push code ขึ้น GitHub
- [ ] Import repository ใน Vercel
- [ ] ตั้งค่า Environment Variables
- [ ] Deploy!
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] (Optional) Seed data: `npx prisma db seed`
- [ ] ทดสอบ API: `https://your-app.vercel.app/api/health`

---

## 🧪 ทดสอบหลัง Deploy

```bash
# ทดสอบ API
curl https://your-backend.vercel.app/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dorm.com","password":"admin123"}'

# ควรได้ response:
# {
#   "success": true,
#   "data": {
#     "user": {...},
#     "tokens": {...}
#   }
# }
```

---

## 🔗 อัปเดต Frontend

หลัง deploy Backend เสร็จ แก้ไข Frontend `.env.local`:

```env
# Production
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

---

## 🐛 แก้ปัญหาเร็ว

### Build Failed?
```bash
# ลบ .next และ build ใหม่
rm -rf .next
npm run build
```

### Database Connection Failed?
- ตรวจสอบ `DATABASE_URL` มี `?sslmode=require`
- ตรวจสอบ database ยังทำงานอยู่

### CORS Error?
- ตรวจสอบ `next.config.ts` มี headers (✅ แก้แล้ว)
- ตั้งค่า `FRONTEND_URL` ใน Vercel

---

## 📊 ไฟล์ที่สร้างให้แล้ว

- ✅ `vercel.json` - Vercel configuration
- ✅ `next.config.ts` - เพิ่ม CORS headers
- ✅ `package.json` - อัปเดต build scripts
- ✅ `prisma/schema.postgresql.prisma` - PostgreSQL schema
- ✅ `prisma/seed.ts` - Database seed script

---

## 💡 Tips

1. **ใช้ Vercel Postgres**: ฟรี 256 MB, เชื่อมต่อง่าย
2. **ตั้ง Region**: เลือก Singapore (sin1) ใกล้ที่สุด
3. **Enable Auto Deploy**: Push code = Auto deploy
4. **ดู Logs**: Vercel Dashboard → Deployments → Logs

---

## 📚 เอกสารเพิ่มเติม

- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - คู่มือละเอียด
- [Vercel Docs](https://vercel.com/docs)
- [Prisma + Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**พร้อม Deploy แล้ว!** 🚀

ถ้ามีปัญหาอะไร ดูใน `VERCEL_DEPLOYMENT.md` หรือถามได้เลยครับ!

---

**Created:** 2025-11-24  
**Author:** Antigravity AI Assistant
