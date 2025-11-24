/**
 * ตัวอย่างการใช้งาน API Service
 * 
 * ไฟล์นี้แสดงวิธีการใช้งาน api-service.ts
 * ในหน้าต่างๆ ของ Frontend
 */

import {
    login,
    register,
    logout,
    getCurrentUser,
    dormitoriesAPI,
    roomsAPI,
    bookingsAPI,
    paymentsAPI,
    dashboardAPI,
    isAuthenticated,
    isAdmin,
    getUserRole,
    getUserName,
} from '@/lib/api';

// ==================== Authentication Examples ====================

/**
 * ตัวอย่าง: Login
 */
async function exampleLogin() {
    const result = await login('user@example.com', 'password123');

    if (result.success) {
        console.log('Login successful!');
        console.log('User:', result.data.user);
        console.log('Role:', result.data.user.role);

        // Redirect ตาม role
        if (result.data.user.role === 'ADMIN') {
            window.location.href = '/admin/dashboard';
        } else {
            window.location.href = '/book';
        }
    } else {
        console.error('Login failed:', result.error);
        alert(result.error);
    }
}

/**
 * ตัวอย่าง: Register
 */
async function exampleRegister() {
    const result = await register({
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '0812345678', // optional
    });

    if (result.success) {
        console.log('Registration successful!');
        // Auto login หลังสมัครสมาชิก
        window.location.href = '/book';
    } else {
        console.error('Registration failed:', result.error);
        alert(result.error);
    }
}

/**
 * ตัวอย่าง: Get Current User
 */
async function exampleGetCurrentUser() {
    const result = await getCurrentUser();

    if (result.success) {
        console.log('Current user:', result.data);
        console.log('Bookings:', result.data.bookings);
        console.log('Payments:', result.data.payments);
    } else {
        console.error('Failed to get user:', result.error);
    }
}

/**
 * ตัวอย่าง: Logout
 */
function exampleLogout() {
    logout(); // จะ redirect ไป /login อัตโนมัติ
}

// ==================== Dormitories Examples ====================

/**
 * ตัวอย่าง: Get All Dormitories
 */
async function exampleGetDormitories() {
    const result = await dormitoriesAPI.getAll({ page: 1, limit: 10 });

    if (result.success) {
        console.log('Dormitories:', result.data);
        console.log('Total:', result.pagination.total);
        console.log('Pages:', result.pagination.totalPages);
    }
}

/**
 * ตัวอย่าง: Get Dormitory by ID
 */
async function exampleGetDormitoryById() {
    const result = await dormitoriesAPI.getById('dorm-id-123');

    if (result.success) {
        console.log('Dormitory:', result.data);
        console.log('Rooms:', result.data.rooms);
    }
}

/**
 * ตัวอย่าง: Create Dormitory (Admin/Owner only)
 */
async function exampleCreateDormitory() {
    const result = await dormitoriesAPI.create({
        name: 'หอพักใหม่',
        address: '123 ถนนสุขุมวิท',
        description: 'หอพักสะอาด ปลอดภัย',
        facilities: ['WiFi', 'ที่จอดรถ', 'ซักรีด'],
    });

    if (result.success) {
        console.log('Created dormitory:', result.data);
    } else {
        console.error('Failed to create:', result.error);
    }
}

// ==================== Rooms Examples ====================

/**
 * ตัวอย่าง: Get Rooms by Dormitory
 */
async function exampleGetRoomsByDormitory() {
    const result = await roomsAPI.getAll({
        dormitoryId: 'dorm-id-123',
        status: 'AVAILABLE'
    });

    if (result.success) {
        console.log('Available rooms:', result.data);
    }
}

/**
 * ตัวอย่าง: Create Room (Admin/Owner only)
 */
async function exampleCreateRoom() {
    const result = await roomsAPI.create({
        dormitoryId: 'dorm-id-123',
        roomNumber: '201',
        floor: 2,
        type: 'SINGLE',
        price: 3500,
        status: 'AVAILABLE',
        facilities: ['แอร์', 'เตียง', 'ตู้เสื้อผ้า'],
    });

    if (result.success) {
        console.log('Created room:', result.data);
    }
}

// ==================== Bookings Examples ====================

/**
 * ตัวอย่าง: Get My Bookings
 */
async function exampleGetMyBookings() {
    const result = await bookingsAPI.getAll();

    if (result.success) {
        console.log('My bookings:', result.data);

        // แสดงเฉพาะ active bookings
        const activeBookings = result.data.filter(
            (b: any) => b.status === 'ACTIVE'
        );
        console.log('Active bookings:', activeBookings);
    }
}

/**
 * ตัวอย่าง: Create Booking
 */
async function exampleCreateBooking() {
    const result = await bookingsAPI.create({
        roomId: 'room-id-123',
        startDate: '2025-12-01',
        endDate: '2026-11-30',
    });

    if (result.success) {
        console.log('Booking created:', result.data);
        console.log('Booking ID:', result.data.id);
    } else {
        console.error('Booking failed:', result.error);
    }
}

// ==================== Payments Examples ====================

/**
 * ตัวอย่าง: Get My Payments
 */
async function exampleGetMyPayments() {
    const result = await paymentsAPI.getAll();

    if (result.success) {
        console.log('My payments:', result.data);

        // แสดงเฉพาะ pending payments
        const pendingPayments = result.data.filter(
            (p: any) => p.status === 'PENDING'
        );
        console.log('Pending payments:', pendingPayments);
    }
}

/**
 * ตัวอย่าง: Create Payment
 */
async function exampleCreatePayment() {
    const result = await paymentsAPI.create({
        bookingId: 'booking-id-123',
        amount: 3500,
        paymentDate: '2025-12-01',
        slipImage: 'base64-image-data', // optional
    });

    if (result.success) {
        console.log('Payment created:', result.data);
    }
}

/**
 * ตัวอย่าง: Verify Payment (Admin only)
 */
async function exampleVerifyPayment() {
    const result = await paymentsAPI.verify('payment-id-123', {
        status: 'VERIFIED',
        verifiedBy: 'admin-id-123',
    });

    if (result.success) {
        console.log('Payment verified:', result.data);
    }
}

// ==================== Dashboard Examples ====================

/**
 * ตัวอย่าง: Get Dashboard Stats (Admin only)
 */
async function exampleGetDashboardStats() {
    const result = await dashboardAPI.getStats();

    if (result.success) {
        console.log('Dashboard stats:', result.data);
        console.log('Total rooms:', result.data.totalRooms);
        console.log('Occupied rooms:', result.data.occupiedRooms);
        console.log('Revenue:', result.data.monthlyRevenue);
    }
}

// ==================== Utility Examples ====================

/**
 * ตัวอย่าง: Check Authentication
 */
function exampleCheckAuth() {
    if (isAuthenticated()) {
        console.log('User is logged in');
        console.log('Role:', getUserRole());
        console.log('Name:', getUserName());
    } else {
        console.log('User is not logged in');
        window.location.href = '/login';
    }
}

/**
 * ตัวอย่าง: Check Admin Role
 */
function exampleCheckAdmin() {
    if (isAdmin()) {
        console.log('User is admin');
        // Show admin features
    } else {
        console.log('User is not admin');
        // Hide admin features
    }
}

// ==================== React Component Examples ====================

/**
 * ตัวอย่าง: Login Component
 */
export function LoginComponent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            // Redirect based on role
            if (result.data.user.role === 'ADMIN') {
                window.location.href = '/admin/dashboard';
            } else {
                window.location.href = '/book';
            }
        } else {
            setError(result.error || 'Login failed');
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Login'}
            </button>
        </form>
    );
}

/**
 * ตัวอย่าง: Dormitories List Component
 */
export function DormitoriesListComponent() {
    const [dormitories, setDormitories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDormitories() {
            const result = await dormitoriesAPI.getAll({ page: 1, limit: 20 });

            if (result.success) {
                setDormitories(result.data);
            }

            setLoading(false);
        }

        loadDormitories();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            {dormitories.map((dorm: any) => (
                <div key={dorm.id}>
                    <h3>{dorm.name}</h3>
                    <p>{dorm.address}</p>
                    <p>Available rooms: {dorm.availableRooms}</p>
                </div>
            ))}
        </div>
    );
}

/**
 * ตัวอย่าง: Protected Route Component
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (!isAuthenticated()) {
            window.location.href = '/login';
        }
    }, []);

    if (!isAuthenticated()) {
        return <div>Redirecting to login...</div>;
    }

    return <>{children}</>;
}

/**
 * ตัวอย่าง: Admin Only Component
 */
export function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (!isAuthenticated()) {
            window.location.href = '/login';
        } else if (!isAdmin()) {
            window.location.href = '/';
        }
    }, []);

    if (!isAuthenticated() || !isAdmin()) {
        return <div>Access denied</div>;
    }

    return <>{children}</>;
}

// ==================== Export Examples ====================

export {
    exampleLogin,
    exampleRegister,
    exampleGetCurrentUser,
    exampleLogout,
    exampleGetDormitories,
    exampleGetDormitoryById,
    exampleCreateDormitory,
    exampleGetRoomsByDormitory,
    exampleCreateRoom,
    exampleGetMyBookings,
    exampleCreateBooking,
    exampleGetMyPayments,
    exampleCreatePayment,
    exampleVerifyPayment,
    exampleGetDashboardStats,
    exampleCheckAuth,
    exampleCheckAdmin,
};
