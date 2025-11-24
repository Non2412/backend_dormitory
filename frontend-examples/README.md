# Frontend Examples

ไฟล์ตัวอย่างสำหรับเชื่อมต่อ Frontend กับ Backend API

## 📁 ไฟล์ในโฟลเดอร์นี้

### 1. **login-page.tsx**
หน้า Login ที่ปรับให้เข้ากับ Backend API

**Features:**
- ✅ รองรับ Backend response format
- ✅ Auto redirect ตาม role (ADMIN, DORM_OWNER, STUDENT)
- ✅ Error handling และแสดง error message
- ✅ Loading state
- ✅ Token management (accessToken, refreshToken)

**วิธีใช้:**
```bash
# คัดลอกไฟล์ไปที่ Frontend project
cp login-page.tsx ../web-dormitory/src/app/login/page.tsx
```

---

### 2. **signup-page.tsx**
หน้า Signup ที่ปรับให้เข้ากับ Backend API

**Features:**
- ✅ รองรับ Backend response format
- ✅ Form validation (password match, length)
- ✅ Error handling
- ✅ Auto login หลังสมัครสมาชิก
- ✅ Optional phone field

**วิธีใช้:**
```bash
# คัดลอกไฟล์ไปที่ Frontend project
cp signup-page.tsx ../web-dormitory/src/app/signup/page.tsx
```

---

### 3. **admin-login-page.tsx**
หน้า Admin Login พร้อม role verification

**Features:**
- ✅ ตรวจสอบว่าเป็น ADMIN role
- ✅ แสดง error ถ้าไม่ใช่ admin
- ✅ Redirect ไป admin dashboard

**วิธีใช้:**
```bash
# คัดลอกไฟล์ไปที่ Frontend project
cp admin-login-page.tsx ../web-dormitory/src/app/admin/login/page.tsx
```

---

### 4. **api-service.ts**
API Service Helper สำหรับเรียก Backend API

**Features:**
- ✅ Auto token refresh
- ✅ Centralized error handling
- ✅ Type-safe API calls
- ✅ Authentication utilities
- ✅ Pre-configured endpoints (dormitories, rooms, bookings, payments)

**วิธีใช้:**
```bash
# คัดลอกไฟล์ไปที่ Frontend project
cp api-service.ts ../web-dormitory/src/lib/api.ts
```

**ตัวอย่างการใช้งาน:**
```typescript
import { login, dormitoriesAPI, isAuthenticated } from '@/lib/api';

// Login
const result = await login('user@example.com', 'password123');

// Get dormitories
const dormitories = await dormitoriesAPI.getAll({ page: 1, limit: 10 });

// Check authentication
if (isAuthenticated()) {
  // User is logged in
}
```

---

### 5. **error-styles.css**
CSS Styles สำหรับ error messages และ loading states

**วิธีใช้:**
```bash
# เพิ่ม styles เหล่านี้ลงใน login.module.css และ signup.module.css
```

---

## 🚀 Quick Start

### 1. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ใน Frontend project:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. คัดลอกไฟล์

```bash
# ไปที่ Frontend project
cd ../web-dormitory

# คัดลอก API service
cp ../backend_dormitory/frontend-examples/api-service.ts ./src/lib/api.ts

# คัดลอก Login page
cp ../backend_dormitory/frontend-examples/login-page.tsx ./src/app/login/page.tsx

# คัดลอก Signup page
cp ../backend_dormitory/frontend-examples/signup-page.tsx ./src/app/signup/page.tsx

# คัดลอก Admin Login page
cp ../backend_dormitory/frontend-examples/admin-login-page.tsx ./src/app/admin/login/page.tsx
```

### 3. เพิ่ม Error Styles

เปิดไฟล์ `src/app/login/login.module.css` และเพิ่ม:

```css
.errorMessage {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

ทำเหมือนกันกับ `src/app/signup/signup.module.css`

### 4. รัน Backend และ Frontend

```bash
# Terminal 1: Backend
cd backend_dormitory
npm run dev

# Terminal 2: Frontend
cd web-dormitory
npm run dev
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "firstName": "...",
      "lastName": "...",
      "role": "STUDENT"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "tokenType": "Bearer",
      "expiresIn": "7d"
    }
  },
  "message": "เข้าสู่ระบบสำเร็จ"
}
```

### Error Response
```json
{
  "success": false,
  "error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
}
```

---

## 🔐 User Roles

- **STUDENT** - ผู้เช่าทั่วไป → redirect to `/book`
- **DORM_OWNER** - เจ้าของหอพัก → redirect to `/owner/dashboard`
- **ADMIN** - ผู้ดูแลระบบ → redirect to `/admin/dashboard`

---

## 🛠️ Advanced Usage

### Protected Routes

สร้าง middleware สำหรับป้องกันหน้าที่ต้อง login:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/owner/:path*', '/book/:path*'],
};
```

### Custom Hooks

สร้าง custom hooks สำหรับ authentication:

```typescript
// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { isAuthenticated, getUserRole, getCurrentUser } from '@/lib/api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (isAuthenticated()) {
        const result = await getCurrentUser();
        if (result.success) {
          setUser(result.data);
        }
      }
      setLoading(false);
    }
    
    loadUser();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: isAuthenticated(),
    role: getUserRole(),
  };
}
```

---

## 📚 เอกสารเพิ่มเติม

- [FRONTEND_INTEGRATION.md](../FRONTEND_INTEGRATION.md) - คู่มือการเชื่อมต่อ Frontend
- [API_DOCS.md](../API_DOCS.md) - API Documentation
- [TESTING_GUIDE.md](../TESTING_GUIDE.md) - คู่มือการทดสอบ

---

## ❓ FAQ

### Q: ทำไม login แล้วไม่ redirect?
A: ตรวจสอบว่า Backend ส่ง `role` มาใน response หรือไม่

### Q: Error "Cannot connect to server"?
A: ตรวจสอบว่า Backend รันอยู่ที่ `http://localhost:3000` หรือไม่

### Q: Token หมดอายุเร็วเกินไป?
A: แก้ไขใน Backend `.env`:
```env
JWT_EXPIRES_IN=30d  # เปลี่ยนเป็น 30 วัน
```

---

**Last Updated:** 2025-11-24
