export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🏢 Backend Dormitory API</h1>
      <p>RESTful API for dormitory management system</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>📚 Documentation</h2>
        <ul>
          <li><a href="/api-docs" style={{ color: '#0070f3' }}>API Documentation</a></li>
          <li><a href="https://github.com" style={{ color: '#0070f3' }}>GitHub Repository</a></li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>🚀 Quick Start</h3>
        <p><strong>Base URL:</strong> <code>http://localhost:3000/api</code></p>
        <p><strong>Authentication:</strong> JWT Bearer Token</p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>📍 Main Endpoints</h3>
        <ul>
          <li><code>POST /api/auth/register</code> - ลงทะเบียน</li>
          <li><code>POST /api/auth/login</code> - เข้าสู่ระบบ</li>
          <li><code>GET /api/dormitories</code> - รายการหอพัก</li>
          <li>
            <code>GET /api/rooms</code> - รายการห้องพัก
            <a href="/api/rooms" style={{
              display: 'inline-block',
              marginLeft: '10px',
              padding: '4px 12px',
              background: '#0070f3',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(0,112,243,0.2)'
            }}>
              ไปที่หน้านี้
            </a>
          </li>
          <li><code>GET /api/bookings</code> - รายการจอง</li>
          <li><code>GET /api/dashboard</code> - Dashboard สรุป</li>
        </ul>
      </div>
    </div>
  );
}
