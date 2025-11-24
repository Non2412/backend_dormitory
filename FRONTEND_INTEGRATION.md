# Frontend Integration Guide

## 📌 Overview
คู่มือการเชื่อมต่อ Frontend (web-dormitory) กับ Backend (backend_dormitory)

---

## 🔗 API Endpoints

### Base URL
```
http://localhost:3000/api  # Backend URL
```

### Authentication Endpoints

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
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

#### 2. Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0812345678"
}
```

**Response:** (เหมือน Login)

#### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "role": "...",
    "bookings": [...],
    "payments": [...]
  }
}
```

#### 4. Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "tokenType": "Bearer",
      "expiresIn": "7d"
    }
  },
  "message": "รีเฟรช token สำเร็จ"
}
```

---

## 💻 Frontend Implementation

### 1. Login Page Example

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        // บันทึก tokens และข้อมูลผู้ใช้
        localStorage.setItem("accessToken", result.data.tokens.accessToken);
        localStorage.setItem("refreshToken", result.data.tokens.refreshToken);
        localStorage.setItem("userRole", result.data.user.role);
        localStorage.setItem("userEmail", result.data.user.email);
        localStorage.setItem("userName", 
          `${result.data.user.firstName} ${result.data.user.lastName}`
        );

        // Redirect ตาม role
        if (result.data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else if (result.data.user.role === "DORM_OWNER") {
          router.push("/owner/dashboard");
        } else {
          router.push("/book");
        }
      } else {
        alert(`Login failed: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... JSX
  );
}
```

### 2. API Service Helper

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("accessToken");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const result = await response.json();

  // Auto refresh token if expired
  if (!result.success && response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry request with new token
      return apiRequest(endpoint, options);
    }
  }

  return result;
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const result = await response.json();

    if (result.success) {
      localStorage.setItem("accessToken", result.data.tokens.accessToken);
      localStorage.setItem("refreshToken", result.data.tokens.refreshToken);
      return true;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }

  return false;
}

// Usage:
// const result = await apiRequest("/auth/me");
// const result = await apiRequest("/dormitories", { method: "GET" });
```

---

## 🔐 User Roles

Backend รองรับ 3 roles:
- `STUDENT` - ผู้เช่าทั่วไป
- `DORM_OWNER` - เจ้าของหอพัก
- `ADMIN` - ผู้ดูแลระบบ

---

## 📝 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
}
```

### Common Error Codes
- `400` - Bad Request (ข้อมูลไม่ถูกต้อง)
- `401` - Unauthorized (ไม่มีสิทธิ์เข้าถึง)
- `404` - Not Found (ไม่พบข้อมูล)
- `409` - Conflict (ข้อมูลซ้ำ เช่น email ซ้ำ)
- `500` - Internal Server Error

---

## 🚀 Quick Start

### 1. ตั้งค่า Environment Variables

สร้างไฟล์ `.env.local` ใน Frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. ติดตั้ง Dependencies (ถ้าจำเป็น)
```bash
npm install
```

### 3. รัน Backend
```bash
cd backend_dormitory
npm run dev
```

### 4. รัน Frontend
```bash
cd web-dormitory
npm run dev
```

---

## 📚 Additional Resources

- [API Documentation](./API_DOCS.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [Postman Collection](./postman_collection.json)

---

## 🐛 Troubleshooting

### CORS Issues
ถ้าเจอปัญหา CORS ให้เพิ่มใน `next.config.ts` ของ Backend:
```typescript
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "*" },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
      ],
    },
  ];
}
```

### Token Expiration
- Access Token หมดอายุใน 7 วัน
- Refresh Token หมดอายุใน 30 วัน
- ใช้ `/api/auth/refresh` เพื่อรีเฟรช token

---

**Last Updated:** 2025-11-24
