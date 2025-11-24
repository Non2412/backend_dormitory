export default function ApiDocsPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🏢 Backend Dormitory API Documentation</h1>
      <p style={{ color: '#666' }}>RESTful API สำหรับระบบจัดการหอพัก</p>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f9ff', borderLeft: '4px solid #0070f3', borderRadius: '4px' }}>
        <strong>Base URL:</strong> <code>http://localhost:3000/api</code><br />
        <strong>Authentication:</strong> JWT Bearer Token
      </div>

      {/* Authentication */}
      <section style={{ marginTop: '3rem' }}>
        <h2>🔐 Authentication</h2>
        
        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>POST /api/auth/register</h3>
          <p>ลงทะเบียนผู้ใช้ใหม่</p>
          <strong>Request Body:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "0812345678"
}`}</pre>
          <strong>Response:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "STUDENT" },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "tokenType": "Bearer",
      "expiresIn": "7d"
    }
  }
}`}</pre>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>POST /api/auth/login</h3>
          <p>เข้าสู่ระบบ</p>
          <strong>Request Body:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`{
  "email": "user@example.com",
  "password": "password123"
}`}</pre>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>POST /api/auth/refresh</h3>
          <p>รีเฟรช Access Token</p>
          <strong>Request Body:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`{
  "refreshToken": "..."
}`}</pre>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/auth/me</h3>
          <p>ดึงข้อมูลผู้ใช้ปัจจุบัน</p>
          <strong>Headers:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`Authorization: Bearer <access_token>`}</pre>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>POST /api/auth/logout</h3>
          <p>ออกจากระบบ</p>
        </div>
      </section>

      {/* Dormitories */}
      <section style={{ marginTop: '3rem' }}>
        <h2>🏠 Dormitories (หอพัก)</h2>
        
        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/dormitories</h3>
          <p>ดึงรายการหอพักทั้งหมด</p>
          <strong>Query Parameters:</strong>
          <ul>
            <li><code>search</code> - ค้นหาชื่อหอพัก</li>
            <li><code>page</code> - หน้าที่ต้องการ (default: 1)</li>
            <li><code>limit</code> - จำนวนรายการต่อหน้า (default: 10)</li>
          </ul>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>POST /api/dormitories</h3>
          <p>สร้างหอพักใหม่ (Admin only)</p>
          <strong>Request Body:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`{
  "name": "หอพักตัวอย่าง",
  "address": "123 ถนนตัวอย่าง",
  "description": "คำอธิบายหอพัก",
  "facilities": ["WiFi", "แอร์", "ตู้เย็น"]
}`}</pre>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/dormitories/:id</h3>
          <p>ดึงข้อมูลหอพักตาม ID</p>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>PUT /api/dormitories/:id</h3>
          <p>แก้ไขข้อมูลหอพัก (Admin only)</p>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>DELETE /api/dormitories/:id</h3>
          <p>ลบหอพัก (Admin only)</p>
        </div>
      </section>

      {/* Rooms */}
      <section style={{ marginTop: '3rem' }}>
        <h2>🛏️ Rooms (ห้องพัก)</h2>
        
        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/rooms</h3>
          <p>ดึงรายการห้องพักทั้งหมด</p>
          <strong>Query Parameters:</strong>
          <ul>
            <li><code>dormitoryId</code> - กรองตามหอพัก</li>
            <li><code>status</code> - กรองตามสถานะ (AVAILABLE, OCCUPIED, MAINTENANCE)</li>
            <li><code>page</code>, <code>limit</code></li>
          </ul>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>POST /api/rooms</h3>
          <p>สร้างห้องพักใหม่ (Admin only)</p>
          <strong>Request Body:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`{
  "roomNumber": "101",
  "dormitoryId": "...",
  "floor": 1,
  "capacity": 2,
  "price": 3000,
  "status": "AVAILABLE"
}`}</pre>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/rooms/:id</h3>
          <p>ดึงข้อมูลห้องพักตาม ID</p>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>PUT /api/rooms/:id</h3>
          <p>แก้ไขข้อมูลห้องพัก (Admin only)</p>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>DELETE /api/rooms/:id</h3>
          <p>ลบห้องพัก (Admin only)</p>
        </div>
      </section>

      {/* Bookings */}
      <section style={{ marginTop: '3rem' }}>
        <h2>📅 Bookings (การจอง)</h2>
        
        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/bookings</h3>
          <p>ดึงรายการจองทั้งหมด</p>
          <strong>Query Parameters:</strong>
          <ul>
            <li><code>userId</code> - กรองตามผู้ใช้</li>
            <li><code>status</code> - กรองตามสถานะ (PENDING, CONFIRMED, CANCELLED)</li>
          </ul>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>POST /api/bookings</h3>
          <p>สร้างการจองใหม่</p>
          <strong>Request Body:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`{
  "roomId": "...",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30"
}`}</pre>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/bookings/:id</h3>
          <p>ดึงข้อมูลการจองตาม ID</p>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>PUT /api/bookings/:id</h3>
          <p>แก้ไขการจอง</p>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>DELETE /api/bookings/:id</h3>
          <p>ยกเลิกการจอง</p>
        </div>
      </section>

      {/* Payments */}
      <section style={{ marginTop: '3rem' }}>
        <h2>💰 Payments (การชำระเงิน)</h2>
        
        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/payments</h3>
          <p>ดึงรายการชำระเงินทั้งหมด</p>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>POST /api/payments</h3>
          <p>สร้างรายการชำระเงินใหม่</p>
          <strong>Request Body:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`{
  "bookingId": "...",
  "amount": 3000,
  "paymentMethod": "CREDIT_CARD"
}`}</pre>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/payments/:id</h3>
          <p>ดึงข้อมูลการชำระเงินตาม ID</p>
        </div>
      </section>

      {/* Dashboard */}
      <section style={{ marginTop: '3rem' }}>
        <h2>📊 Dashboard</h2>
        
        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/dashboard</h3>
          <p>ดึงข้อมูลสรุปสำหรับ Dashboard</p>
          <strong>Response:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`{
  "totalDormitories": 5,
  "totalRooms": 100,
  "occupiedRooms": 75,
  "availableRooms": 25,
  "totalBookings": 80,
  "totalRevenue": 225000
}`}</pre>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/dashboard/stats</h3>
          <p>ดึงสถิติแบบละเอียด</p>
          <strong>Query Parameters:</strong>
          <ul>
            <li><code>period</code> - ช่วงเวลา (day, week, month, year)</li>
          </ul>
        </div>
      </section>

      {/* Users */}
      <section style={{ marginTop: '3rem' }}>
        <h2>👥 Users (ผู้ใช้)</h2>
        
        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/users</h3>
          <p>ดึงรายการผู้ใช้ทั้งหมด (Admin only)</p>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>GET /api/users/:id</h3>
          <p>ดึงข้อมูลผู้ใช้ตาม ID</p>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>PUT /api/users/:id</h3>
          <p>แก้ไขข้อมูลผู้ใช้</p>
        </div>

        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>DELETE /api/users/:id</h3>
          <p>ลบผู้ใช้ (Admin only)</p>
        </div>
      </section>

      {/* Error Responses */}
      <section style={{ marginTop: '3rem' }}>
        <h2>⚠️ Error Responses</h2>
        <div style={{ marginTop: '1rem', padding: '1.5rem', background: '#fff5f5', borderRadius: '8px', borderLeft: '4px solid #e53e3e' }}>
          <strong>Standard Error Format:</strong>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>{`{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}`}</pre>
          
          <div style={{ marginTop: '1rem' }}>
            <strong>Common Status Codes:</strong>
            <ul>
              <li><code>400</code> - Bad Request (ข้อมูลไม่ถูกต้อง)</li>
              <li><code>401</code> - Unauthorized (ไม่ได้ล็อกอิน)</li>
              <li><code>403</code> - Forbidden (ไม่มีสิทธิ์)</li>
              <li><code>404</code> - Not Found (ไม่พบข้อมูล)</li>
              <li><code>409</code> - Conflict (ข้อมูลซ้ำ)</li>
              <li><code>500</code> - Internal Server Error</li>
            </ul>
          </div>
        </div>
      </section>

      <footer style={{ marginTop: '4rem', padding: '2rem', borderTop: '1px solid #e5e5e5', textAlign: 'center', color: '#666' }}>
        <p>Backend Dormitory API v0.1.0</p>
        <p>สร้างด้วย Next.js 16 + Prisma + JWT</p>
      </footer>
    </div>
  );
}
