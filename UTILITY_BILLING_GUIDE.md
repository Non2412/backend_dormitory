# ✅ เพิ่มระบบค่าน้ำ ค่าไฟ ค่าเช่าเสร็จแล้ว!

## 🎉 สิ่งที่ทำเสร็จแล้ว

### 1. ✅ อัปเดต Database Schema (`prisma/schema.prisma`)

เพิ่ม fields ใหม่ใน Payment model:

```prisma
model Payment {
  // ... existing fields
  amount        Float         // ยอดรวมทั้งหมด
  
  // รายละเอียดค่าใช้จ่าย
  rentAmount    Float?        // ค่าเช่า
  waterAmount   Float?        // ค่าน้ำ
  electricAmount Float?       // ค่าไฟ
  otherAmount   Float?        // ค่าอื่นๆ (ค่าส่วนกลาง, ค่าขยะ, etc.)
  
  // ข้อมูลการใช้งาน (optional)
  waterUsage    Float?        // หน่วยน้ำที่ใช้
  electricUsage Float?        // หน่วยไฟที่ใช้
  // ...
}
```

### 2. ✅ อัปเดต Validation Schema (`src/lib/validation.ts`)

เพิ่ม validation สำหรับ fields ใหม่:
- `rentAmount` - ค่าเช่า
- `waterAmount` - ค่าน้ำ
- `electricAmount` - ค่าไฟ
- `otherAmount` - ค่าอื่นๆ
- `waterUsage` - หน่วยน้ำที่ใช้
- `electricUsage` - หน่วยไฟที่ใช้

### 3. ✅ อัปเดต Payment API (`src/app/api/payments/route.ts`)

รองรับการส่งข้อมูลค่าน้ำ ค่าไฟ ค่าเช่า

---

## 🚀 ขั้นตอนถัดไป (สำคัญ!)

### Step 1: Generate Prisma Client ใหม่

```bash
npx prisma generate
```

**⚠️ สำคัญ:** ต้อง run คำสั่งนี้เพื่อให้ Prisma Client รู้จัก fields ใหม่

### Step 2: สร้าง Migration (ถ้าต้องการ)

```bash
# สำหรับ Development
npx prisma migrate dev --name add_utility_billing

# หรือสำหรับ Production
npx prisma migrate deploy
```

---

## 📝 วิธีใช้งาน

### ตัวอย่างการสร้าง Payment พร้อมค่าน้ำ ค่าไฟ

```typescript
// POST /api/payments
{
  "bookingId": "booking-id-123",
  "userId": "user-id-123",
  "amount": 5500,           // ยอดรวมทั้งหมด
  
  // รายละเอียดค่าใช้จ่าย
  "rentAmount": 3500,       // ค่าเช่า
  "waterAmount": 500,       // ค่าน้ำ (50 หน่วย x 10 บาท)
  "electricAmount": 1200,   // ค่าไฟ (150 หน่วย x 8 บาท)
  "otherAmount": 300,       // ค่าส่วนกลาง/ค่าขยะ
  
  // ข้อมูลการใช้งาน
  "waterUsage": 50,         // 50 หน่วย
  "electricUsage": 150,     // 150 หน่วย
  
  "paymentMethod": "BANK_TRANSFER",
  "slipUrl": "https://example.com/slip.jpg"
}
```

### Response:

```json
{
  "success": true,
  "data": {
    "id": "payment-id-123",
    "amount": 5500,
    "rentAmount": 3500,
    "waterAmount": 500,
    "electricAmount": 1200,
    "otherAmount": 300,
    "waterUsage": 50,
    "electricUsage": 150,
    "paymentMethod": "BANK_TRANSFER",
    "status": "PENDING",
    "user": { ... },
    "booking": { ... }
  },
  "message": "บันทึกการชำระเงินสำเร็จ"
}
```

---

## 💡 Use Cases

### 1. ค่าเช่าอย่างเดียว

```json
{
  "amount": 3500,
  "rentAmount": 3500,
  "paymentMethod": "CASH"
}
```

### 2. ค่าเช่า + ค่าน้ำ + ค่าไฟ

```json
{
  "amount": 5200,
  "rentAmount": 3500,
  "waterAmount": 500,
  "electricAmount": 1200,
  "waterUsage": 50,
  "electricUsage": 150,
  "paymentMethod": "BANK_TRANSFER"
}
```

### 3. ครบทุกรายการ

```json
{
  "amount": 5500,
  "rentAmount": 3500,
  "waterAmount": 500,
  "electricAmount": 1200,
  "otherAmount": 300,
  "waterUsage": 50,
  "electricUsage": 150,
  "paymentMethod": "PROMPTPAY",
  "notes": "ชำระค่าเช่าประจำเดือน มกราคม 2025"
}
```

---

## 📊 Fields ทั้งหมด

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | Float | ✅ Yes | ยอดรวมทั้งหมด |
| `rentAmount` | Float? | ❌ No | ค่าเช่า |
| `waterAmount` | Float? | ❌ No | ค่าน้ำ |
| `electricAmount` | Float? | ❌ No | ค่าไฟ |
| `otherAmount` | Float? | ❌ No | ค่าอื่นๆ (ส่วนกลาง, ขยะ) |
| `waterUsage` | Float? | ❌ No | หน่วยน้ำที่ใช้ |
| `electricUsage` | Float? | ❌ No | หน่วยไฟที่ใช้ |

---

## 🧪 ทดสอบ API

### ใช้ curl:

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking-id-123",
    "userId": "user-id-123",
    "amount": 5500,
    "rentAmount": 3500,
    "waterAmount": 500,
    "electricAmount": 1200,
    "otherAmount": 300,
    "waterUsage": 50,
    "electricUsage": 150,
    "paymentMethod": "BANK_TRANSFER"
  }'
```

### ใช้ Postman:

1. Method: `POST`
2. URL: `http://localhost:3000/api/payments`
3. Body → raw → JSON
4. ใส่ JSON ตามตัวอย่างข้างบน

---

## ✅ Checklist

- [x] อัปเดต Prisma Schema
- [x] อัปเดต Validation Schema
- [x] อัปเดต Payment API
- [ ] **Run `npx prisma generate`** ← ต้องทำ!
- [ ] Run migration (optional)
- [ ] ทดสอบ API

---

## 🎯 ขั้นตอนถัดไป

หลังจาก run `npx prisma generate` แล้ว:

1. ✅ ระบบค่าน้ำ ค่าไฟ พร้อมใช้งาน
2. 🚀 พร้อม Deploy ขึ้น Vercel
3. 📝 อัปเดต Frontend ให้รองรับ fields ใหม่

---

## 💡 Tips

### คำนวณ amount อัตโนมัติ:

```typescript
const rentAmount = 3500;
const waterAmount = waterUsage * 10; // 10 บาท/หน่วย
const electricAmount = electricUsage * 8; // 8 บาท/หน่วย
const otherAmount = 300;

const amount = rentAmount + waterAmount + electricAmount + otherAmount;
```

### Validation:

```typescript
// ตรวจสอบว่า amount ตรงกับผลรวม
const calculatedAmount = 
  (rentAmount || 0) + 
  (waterAmount || 0) + 
  (electricAmount || 0) + 
  (otherAmount || 0);

if (Math.abs(amount - calculatedAmount) > 0.01) {
  throw new Error('ยอดรวมไม่ตรงกับรายละเอียด');
}
```

---

**Created:** 2025-11-24  
**Status:** ✅ เพิ่ม fields เสร็จแล้ว - รอ run `npx prisma generate`
