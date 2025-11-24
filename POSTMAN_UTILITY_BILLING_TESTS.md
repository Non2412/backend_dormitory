# 🧪 ทดสอบ API ระบบค่าน้ำ ค่าไฟ ใน Postman

## 📋 เตรียมความพร้อม

### Step 1: Generate Prisma Client (สำคัญ!)

```bash
npx prisma generate
```

### Step 2: รัน Backend Server

```bash
npm run dev
```

Server จะรันที่: `http://localhost:3000`

---

## 🔐 Step 1: สร้าง User และ Login

### 1.1 Register User

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/register`  
**Body (JSON):**

```json
{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User",
  "phone": "0812345678"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      "role": "STUDENT"
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  },
  "message": "ลงทะเบียนสำเร็จ"
}
```

**📝 บันทึก:** คัดลอก `user.id` และ `tokens.accessToken` ไว้ใช้

---

## 🏠 Step 2: สร้าง Dormitory และ Room

### 2.1 สร้าง Dormitory

**Method:** `POST`  
**URL:** `http://localhost:3000/api/dormitories`  
**Body (JSON):**

```json
{
  "name": "หอพักทดสอบ",
  "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
  "description": "หอพักสำหรับทดสอบระบบ",
  "facilities": ["WiFi", "ที่จอดรถ", "ซักรีด"]
}
```

**📝 บันทึก:** คัดลอก `id` ของ dormitory

### 2.2 สร้าง Room

**Method:** `POST`  
**URL:** `http://localhost:3000/api/rooms`  
**Body (JSON):**

```json
{
  "dormitoryId": "DORMITORY_ID_HERE",
  "roomNumber": "101",
  "type": "SINGLE",
  "capacity": 1,
  "price": 3500,
  "floor": 1,
  "status": "AVAILABLE",
  "description": "ห้องเดี่ยว พร้อมเฟอร์นิเจอร์"
}
```

**📝 บันทึก:** คัดลอก `id` ของ room

---

## 📅 Step 3: สร้าง Booking

**Method:** `POST`  
**URL:** `http://localhost:3000/api/bookings`  
**Body (JSON):**

```json
{
  "userId": "USER_ID_HERE",
  "roomId": "ROOM_ID_HERE",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "totalAmount": 42000,
  "notes": "จองห้องพักประจำปี 2025"
}
```

**📝 บันทึก:** คัดลอก `id` ของ booking

---

## 💰 Step 4: ทดสอบ Payment API (ระบบค่าน้ำ ค่าไฟ)

### Test Case 1: ค่าเช่าอย่างเดียว

**Method:** `POST`  
**URL:** `http://localhost:3000/api/payments`  
**Body (JSON):**

```json
{
  "bookingId": "BOOKING_ID_HERE",
  "userId": "USER_ID_HERE",
  "amount": 3500,
  "rentAmount": 3500,
  "paymentMethod": "CASH",
  "notes": "ชำระค่าเช่าเดือนมกราคม 2025"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "id": "payment-id-123",
    "amount": 3500,
    "rentAmount": 3500,
    "waterAmount": null,
    "electricAmount": null,
    "otherAmount": null,
    "waterUsage": null,
    "electricUsage": null,
    "paymentMethod": "CASH",
    "status": "PENDING",
    "user": { ... },
    "booking": { ... }
  },
  "message": "บันทึกการชำระเงินสำเร็จ"
}
```

---

### Test Case 2: ค่าเช่า + ค่าน้ำ + ค่าไฟ

**Method:** `POST`  
**URL:** `http://localhost:3000/api/payments`  
**Body (JSON):**

```json
{
  "bookingId": "BOOKING_ID_HERE",
  "userId": "USER_ID_HERE",
  "amount": 5200,
  "rentAmount": 3500,
  "waterAmount": 500,
  "electricAmount": 1200,
  "waterUsage": 50,
  "electricUsage": 150,
  "paymentMethod": "BANK_TRANSFER",
  "notes": "ชำระค่าเช่า + ค่าน้ำ + ค่าไฟ เดือนกุมภาพันธ์ 2025"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "id": "payment-id-456",
    "amount": 5200,
    "rentAmount": 3500,
    "waterAmount": 500,
    "electricAmount": 1200,
    "otherAmount": null,
    "waterUsage": 50,
    "electricUsage": 150,
    "paymentMethod": "BANK_TRANSFER",
    "status": "PENDING"
  }
}
```

---

### Test Case 3: ครบทุกรายการ

**Method:** `POST`  
**URL:** `http://localhost:3000/api/payments`  
**Body (JSON):**

```json
{
  "bookingId": "BOOKING_ID_HERE",
  "userId": "USER_ID_HERE",
  "amount": 5500,
  "rentAmount": 3500,
  "waterAmount": 500,
  "electricAmount": 1200,
  "otherAmount": 300,
  "waterUsage": 50,
  "electricUsage": 150,
  "paymentMethod": "PROMPTPAY",
  "slipUrl": "https://example.com/slip.jpg",
  "notes": "ชำระครบทุกรายการ เดือนมีนาคม 2025"
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "id": "payment-id-789",
    "amount": 5500,
    "rentAmount": 3500,
    "waterAmount": 500,
    "electricAmount": 1200,
    "otherAmount": 300,
    "waterUsage": 50,
    "electricUsage": 150,
    "paymentMethod": "PROMPTPAY",
    "slipUrl": "https://example.com/slip.jpg",
    "status": "PENDING"
  }
}
```

---

### Test Case 4: เฉพาะค่าน้ำ ค่าไฟ (ไม่มีค่าเช่า)

**Method:** `POST`  
**URL:** `http://localhost:3000/api/payments`  
**Body (JSON):**

```json
{
  "bookingId": "BOOKING_ID_HERE",
  "userId": "USER_ID_HERE",
  "amount": 1700,
  "waterAmount": 500,
  "electricAmount": 1200,
  "waterUsage": 50,
  "electricUsage": 150,
  "paymentMethod": "BANK_TRANSFER",
  "notes": "ชำระค่าน้ำ ค่าไฟเพิ่มเติม"
}
```

---

## 📊 Step 5: ดูรายการ Payments

### 5.1 ดูทั้งหมด

**Method:** `GET`  
**URL:** `http://localhost:3000/api/payments`

### 5.2 กรองตาม User

**Method:** `GET`  
**URL:** `http://localhost:3000/api/payments?userId=USER_ID_HERE`

### 5.3 กรองตาม Booking

**Method:** `GET`  
**URL:** `http://localhost:3000/api/payments?bookingId=BOOKING_ID_HERE`

### 5.4 กรองตาม Status

**Method:** `GET`  
**URL:** `http://localhost:3000/api/payments?status=PENDING`

**Expected Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "payment-id-123",
      "amount": 5500,
      "rentAmount": 3500,
      "waterAmount": 500,
      "electricAmount": 1200,
      "otherAmount": 300,
      "waterUsage": 50,
      "electricUsage": 150,
      "user": {
        "id": "user-id",
        "email": "test@example.com",
        "firstName": "Test",
        "lastName": "User"
      },
      "booking": {
        "id": "booking-id",
        "room": {
          "roomNumber": "101",
          "dormitory": {
            "name": "หอพักทดสอบ"
          }
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## ✅ Validation Tests

### Test Case: ยอดเงินติดลบ (ควร Error)

```json
{
  "amount": -100,
  "rentAmount": -100
}
```

**Expected:** Error 400 - "ยอดเงินต้องเป็นจำนวนบวก"

### Test Case: ไม่ระบุ amount (ควร Error)

```json
{
  "rentAmount": 3500
}
```

**Expected:** Error 400 - "ยอดเงินต้องเป็นจำนวนบวก"

### Test Case: Booking ไม่มีอยู่ (ควร Error)

```json
{
  "bookingId": "invalid-booking-id",
  "amount": 3500
}
```

**Expected:** Error 404 - "ไม่พบการจองที่ระบุ"

---

## 📝 Postman Collection

### สร้าง Collection ใหม่:

1. เปิด Postman
2. คลิก **New** → **Collection**
3. ตั้งชื่อ: `Dormitory API - Utility Billing`
4. เพิ่ม requests ตามด้านบน

### Variables:

สร้าง Collection Variables:
- `baseUrl` = `http://localhost:3000`
- `userId` = (คัดลอกจาก register response)
- `dormitoryId` = (คัดลอกจาก create dormitory)
- `roomId` = (คัดลอกจาก create room)
- `bookingId` = (คัดลอกจาก create booking)

แล้วใช้ใน URL: `{{baseUrl}}/api/payments`

---

## 🎯 Checklist การทดสอบ

- [ ] Register User สำเร็จ
- [ ] สร้าง Dormitory สำเร็จ
- [ ] สร้าง Room สำเร็จ
- [ ] สร้าง Booking สำเร็จ
- [ ] ✅ **ทดสอบ Payment - ค่าเช่าอย่างเดียว**
- [ ] ✅ **ทดสอบ Payment - ค่าเช่า + ค่าน้ำ + ค่าไฟ**
- [ ] ✅ **ทดสอบ Payment - ครบทุกรายการ**
- [ ] ✅ **ทดสอบ Payment - เฉพาะค่าน้ำ ค่าไฟ**
- [ ] ดูรายการ Payments สำเร็จ
- [ ] กรองตาม User สำเร็จ
- [ ] Validation ทำงานถูกต้อง

---

## 💡 Tips

### 1. ใช้ Environment Variables

สร้าง Environment ใน Postman:
- **Development**: `http://localhost:3000`
- **Production**: `https://your-backend.vercel.app`

### 2. Save Responses

ใช้ Tests script ใน Postman เพื่อ save variables อัตโนมัติ:

```javascript
// ใน Tests tab ของ Register request
pm.test("Save userId", function () {
    var jsonData = pm.response.json();
    pm.collectionVariables.set("userId", jsonData.data.user.id);
});
```

### 3. Pre-request Script

คำนวณ amount อัตโนมัติ:

```javascript
// ใน Pre-request Script
const rentAmount = 3500;
const waterAmount = 50 * 10; // 50 หน่วย x 10 บาท
const electricAmount = 150 * 8; // 150 หน่วย x 8 บาท
const otherAmount = 300;

const totalAmount = rentAmount + waterAmount + electricAmount + otherAmount;

pm.collectionVariables.set("totalAmount", totalAmount);
```

---

## 🐛 Troubleshooting

### ปัญหา: "rentAmount does not exist"

**วิธีแก้:** Run `npx prisma generate` ก่อน

### ปัญหา: Connection refused

**วิธีแก้:** ตรวจสอบว่า Backend รันอยู่ที่ `http://localhost:3000`

### ปัญหา: 404 Not Found

**วิธีแก้:** ตรวจสอบ URL และ Method ให้ถูกต้อง

---

**Created:** 2025-11-24  
**Ready to test!** 🚀
