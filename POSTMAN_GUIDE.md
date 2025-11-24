# 🚀 วิธีใช้ Postman ทดสอบ API

## 📥 Import Collection เข้า Postman

### วิธีที่ 1: Import ไฟล์ JSON
1. เปิด Postman
2. คลิก **Import** (มุมซ้ายบน)
3. เลือก **File** → เลือกไฟล์ `postman_collection.json`
4. คลิก **Import**

### วิธีที่ 2: Import ด้วย Raw JSON
1. เปิด Postman
2. คลิก **Import** → เลือก **Raw text**
3. Copy เนื้อหาจากไฟล์ `postman_collection.json` แล้ว Paste
4. คลิก **Continue** → **Import**

---

## 🎯 ขั้นตอนการทดสอบ

### 1️⃣ เริ่ม Dev Server
```bash
npm run dev
```
Server จะรันที่ `http://localhost:3000`

---

### 2️⃣ ทดสอบ Authentication (เริ่มที่นี่เสมอ!)

#### A. Register User (สมัครสมาชิก)
📍 **POST** `/api/auth/register`

1. เปิด Collection **Backend Dormitory API**
2. ไปที่ **🔐 Authentication** → **Register User**
3. ดูที่ Tab **Body** → ข้อมูลตัวอย่างจะมีให้แล้ว:
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "firstName": "Admin",
  "lastName": "User",
  "phone": "0812345678",
  "role": "ADMIN"
}
```
4. คลิก **Send**
5. ✅ ถ้าสำเร็จจะได้ Status `201 Created`
6. 🎉 **Token จะถูกเก็บอัตโนมัติ!** (ดูที่ Variables)

#### B. Login (เข้าสู่ระบบ)
📍 **POST** `/api/auth/login`

1. ไปที่ **Login**
2. ดูที่ Tab **Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```
3. คลิก **Send**
4. ✅ จะได้ Status `200 OK` พร้อม access token และ refresh token

#### C. Get Current User (ดึงข้อมูลตัวเอง)
📍 **GET** `/api/auth/me`

1. ไปที่ **Get Current User**
2. คลิก **Send** (Token จะถูกส่งอัตโนมัติใน Header)
3. ✅ จะเห็นข้อมูลผู้ใช้ที่ login อยู่

---

### 3️⃣ ทดสอบ Dormitories (หอพัก)

#### A. Create Dormitory (สร้างหอพัก)
📍 **POST** `/api/dormitories`

1. ไปที่ **🏠 Dormitories** → **Create Dormitory**
2. ดูที่ Tab **Body**:
```json
{
  "name": "หอพักมหาวิทยาลัย A",
  "address": "123 ถนนพระราม 4 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330",
  "description": "หอพักสำหรับนักศึกษา ใกล้มหาวิทยาลัย",
  "facilities": ["WiFi", "แอร์", "ตู้เย็น", "เครื่องซักผ้า", "รักษาความปลอดภัย 24 ชม."]
}
```
3. คลิก **Send**
4. ✅ Status `201 Created` และ `dormitory_id` จะถูกเก็บอัตโนมัติ

#### B. Get All Dormitories (ดึงรายการหอพักทั้งหมด)
📍 **GET** `/api/dormitories`

1. ไปที่ **Get All Dormitories**
2. คลิก **Send**
3. ✅ จะเห็นรายการหอพักทั้งหมด

#### C. Get Dormitory by ID (ดึงข้อมูลหอพักเฉพาะ)
📍 **GET** `/api/dormitories/:id`

1. ไปที่ **Get Dormitory by ID**
2. คลิก **Send** (จะใช้ `dormitory_id` ที่เก็บไว้อัตโนมัติ)

#### D. Update Dormitory (แก้ไขหอพัก)
📍 **PUT** `/api/dormitories/:id`

1. ไปที่ **Update Dormitory**
2. แก้ไขข้อมูลใน Body ตามต้องการ
3. คลิก **Send**

#### E. Delete Dormitory (ลบหอพัก)
📍 **DELETE** `/api/dormitories/:id`

1. ไปที่ **Delete Dormitory**
2. คลิก **Send**

---

### 4️⃣ ทดสอบ Rooms (ห้องพัก)

#### A. Create Room (สร้างห้องพัก)
📍 **POST** `/api/rooms`

1. ไปที่ **🛏️ Rooms** → **Create Room**
2. ตรวจสอบว่า `dormitory_id` ใน Body ถูกต้อง:
```json
{
  "roomNumber": "101",
  "dormitoryId": "{{dormitory_id}}",
  "floor": 1,
  "capacity": 2,
  "price": 3000,
  "status": "AVAILABLE"
}
```
3. คลิก **Send**
4. ✅ `room_id` จะถูกเก็บอัตโนมัติ

#### B. Get All Rooms
📍 **GET** `/api/rooms`

- ทดสอบ Filter:
  - เปิด Query Parameter `dormitoryId` เพื่อกรองตามหอพัก
  - เปิด Query Parameter `status` เพื่อกรองตามสถานะ

#### C. Update & Delete Room
- ใช้วิธีเดียวกับ Dormitories

---

### 5️⃣ ทดสอบ Bookings (การจอง)

#### A. Create Booking (สร้างการจอง)
📍 **POST** `/api/bookings`

1. ไปที่ **📅 Bookings** → **Create Booking**
2. ตรวจสอบ Body:
```json
{
  "roomId": "{{room_id}}",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30"
}
```
3. คลิก **Send**

#### B. Get All Bookings
📍 **GET** `/api/bookings`

- ทดสอบ Filter ตาม `userId` หรือ `status`

---

### 6️⃣ ทดสอบ Payments (การชำระเงิน)

#### A. Create Payment
📍 **POST** `/api/payments`

```json
{
  "bookingId": "{{booking_id}}",
  "amount": 3000,
  "paymentMethod": "CREDIT_CARD"
}
```

---

### 7️⃣ ทดสอบ Dashboard

#### A. Get Dashboard Summary
📍 **GET** `/api/dashboard`

- ดูสรุปข้อมูลทั้งหมด (จำนวนหอพัก, ห้อง, การจอง, รายได้)

#### B. Get Stats with Period
📍 **GET** `/api/dashboard/stats?period=month`

- เปลี่ยน period เป็น: `day`, `week`, `month`, `year`

---

### 8️⃣ ทดสอบ Users Management

📍 **GET** `/api/users` - ดูรายการผู้ใช้ทั้งหมด (Admin only)

---

## 🔧 Tips & Tricks

### ✅ Variables (ตัวแปรอัตโนมัติ)
Collection นี้มีการเก็บค่าอัตโนมัติ:
- `access_token` - เก็บหลัง Login/Register
- `refresh_token` - เก็บหลัง Login/Register
- `user_id` - เก็บหลัง Register
- `dormitory_id` - เก็บหลัง Create Dormitory
- `room_id` - เก็บหลัง Create Room
- `booking_id` - เก็บหลัง Create Booking

### 📝 ดู Variables
1. คลิกที่ Collection **Backend Dormitory API**
2. ไปที่ Tab **Variables**
3. จะเห็นค่าที่ถูกเก็บไว้ทั้งหมด

### 🔑 Authorization Header
ทุก Request (ยกเว้น auth) จะมี Header:
```
Authorization: Bearer {{access_token}}
```
Token จะถูกส่งอัตโนมัติ!

### 🔄 Refresh Token เมื่อหมดอายุ
1. ไปที่ **🔐 Authentication** → **Refresh Token**
2. คลิก **Send**
3. Access token ใหม่จะถูกเก็บอัตโนมัติ

---

## 🎯 ลำดับการทดสอบที่แนะนำ

```
1. Register/Login ✅
2. Get Current User ✅
3. Create Dormitory → Get Dormitories ✅
4. Create Room → Get Rooms ✅
5. Create Booking → Get Bookings ✅
6. Create Payment ✅
7. Dashboard Summary & Stats ✅
8. Users Management ✅
```

---

## ❗ Common Errors

### 401 Unauthorized
- ❌ ไม่มี Token หรือ Token หมดอายุ
- ✅ Login ใหม่หรือ Refresh Token

### 403 Forbidden
- ❌ ไม่มีสิทธิ์ (ต้องเป็น ADMIN)
- ✅ Login ด้วย account ที่มี role ADMIN

### 404 Not Found
- ❌ ไม่พบข้อมูลที่ค้นหา
- ✅ ตรวจสอบ ID ที่ใช้

### 409 Conflict
- ❌ ข้อมูลซ้ำ (เช่น email ซ้ำ)
- ✅ ใช้ข้อมูลอื่น

---

## 🎊 Happy Testing!

มีปัญหาหรือข้อสงสัย ลองดูที่:
- 📚 API Docs: http://localhost:3000/api-docs
- 📝 README.md
- 📖 API_DOCS.md
