/**
 * Automated API Testing Script
 * ทดสอบ API อัตโนมัติ
 * 
 * วิธีใช้งาน:
 * 1. เปิด terminal
 * 2. รัน: npm run dev (ใน terminal อื่น)
 * 3. รัน: node test-api-automated.js
 */

const BASE_URL = 'http://localhost:3000/api';

// เก็บ IDs สำหรับใช้ในการทดสอบ
const testData = {
    adminId: null,
    studentId: null,
    dorm1Id: null,
    dorm2Id: null,
    room101Id: null,
    room102Id: null,
    room201Id: null,
    booking1Id: null,
    booking2Id: null,
    payment1Id: null,
};

// สถิติการทดสอบ
const stats = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
};

// Helper function สำหรับทำ HTTP request
async function request(method, path, body = null) {
    const url = `${BASE_URL}${path}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        return { status: 500, error: error.message };
    }
}

// Helper function สำหรับแสดงผลการทดสอบ
function logTest(name, passed, details = '') {
    stats.total++;
    if (passed) {
        stats.passed++;
        console.log(`✅ ${name}`);
    } else {
        stats.failed++;
        console.log(`❌ ${name}`);
        if (details) console.log(`   ${details}`);
        stats.errors.push({ test: name, details });
    }
}

// Helper function สำหรับรอ
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// TEST SUITE
// ==========================================

async function runTests() {
    console.log('\n🧪 เริ่มทดสอบ API...\n');
    console.log('='.repeat(60));

    // TEST 1: สร้างผู้ใช้
    console.log('\n📝 TEST 1: สร้างผู้ใช้');
    console.log('-'.repeat(60));

    const adminResult = await request('POST', '/users', {
        email: 'admin@test.com',
        password: 'admin123',
        firstName: 'ผู้ดูแล',
        lastName: 'ระบบ',
        role: 'ADMIN',
    });
    logTest(
        'สร้าง Admin User',
        adminResult.status === 201 && adminResult.data.success,
        adminResult.data.error
    );
    if (adminResult.data.success) {
        testData.adminId = adminResult.data.data.id;
    }

    await sleep(100);

    const studentResult = await request('POST', '/users', {
        email: 'student@test.com',
        password: 'student123',
        firstName: 'นักศึกษา',
        lastName: 'ทดสอบ',
        phone: '0812345678',
        role: 'STUDENT',
    });
    logTest(
        'สร้าง Student User',
        studentResult.status === 201 && studentResult.data.success,
        studentResult.data.error
    );
    if (studentResult.data.success) {
        testData.studentId = studentResult.data.data.id;
    }

    // TEST 2: ทดสอบ Type Safety & Search
    console.log('\n📝 TEST 2: Type Safety & Search');
    console.log('-'.repeat(60));

    const searchResult = await request('GET', '/users?search=นัก');
    logTest(
        'ค้นหา Users (SQLite compatibility)',
        searchResult.status === 200 && searchResult.data.success,
        searchResult.data.error
    );

    const filterResult = await request('GET', '/users?role=STUDENT');
    logTest(
        'Filter Users by Role (Prisma types)',
        filterResult.status === 200 && filterResult.data.success,
        filterResult.data.error
    );

    // TEST 3: สร้าง Dormitories (ทดสอบ JSON parsing)
    console.log('\n📝 TEST 3: Dormitories & JSON Parsing');
    console.log('-'.repeat(60));

    const dorm1Result = await request('POST', '/dormitories', {
        name: 'หอพักทดสอบ 1',
        address: '123 ถนนทดสอบ',
        description: 'หอพักสำหรับทดสอบ',
        facilities: ['WiFi', 'ลิฟต์', 'ที่จอดรถ'],
    });
    logTest(
        'สร้าง Dormitory 1 (JSON.stringify facilities)',
        dorm1Result.status === 201 && dorm1Result.data.success,
        dorm1Result.data.error
    );
    if (dorm1Result.data.success) {
        testData.dorm1Id = dorm1Result.data.data.id;
        logTest(
            'Facilities เป็น Array',
            Array.isArray(dorm1Result.data.data.facilities),
            'facilities ควรเป็น array'
        );
    }

    await sleep(100);

    const dorm2Result = await request('POST', '/dormitories', {
        name: 'หอพักทดสอบ 2',
        address: '456 ถนนทดสอบ',
        facilities: ['WiFi', 'ฟิตเนส'],
    });
    logTest(
        'สร้าง Dormitory 2',
        dorm2Result.status === 201 && dorm2Result.data.success,
        dorm2Result.data.error
    );
    if (dorm2Result.data.success) {
        testData.dorm2Id = dorm2Result.data.data.id;
    }

    // TEST 4: สร้าง Rooms
    console.log('\n📝 TEST 4: Rooms');
    console.log('-'.repeat(60));

    if (testData.dorm1Id) {
        const room101Result = await request('POST', '/rooms', {
            roomNumber: '101',
            dormitoryId: testData.dorm1Id,
            type: 'SINGLE',
            capacity: 1,
            price: 3000,
            floor: 1,
            description: 'ห้องทดสอบ 101',
        });
        logTest(
            'สร้าง Room 101',
            room101Result.status === 201 && room101Result.data.success,
            room101Result.data.error
        );
        if (room101Result.data.success) {
            testData.room101Id = room101Result.data.data.id;
            logTest(
                'Room status = AVAILABLE',
                room101Result.data.data.status === 'AVAILABLE',
                `Status: ${room101Result.data.data.status}`
            );
        }

        await sleep(100);

        const room102Result = await request('POST', '/rooms', {
            roomNumber: '102',
            dormitoryId: testData.dorm1Id,
            type: 'DOUBLE',
            capacity: 2,
            price: 4500,
            floor: 1,
        });
        logTest(
            'สร้าง Room 102',
            room102Result.status === 201 && room102Result.data.success,
            room102Result.data.error
        );
        if (room102Result.data.success) {
            testData.room102Id = room102Result.data.data.id;
        }

        await sleep(100);

        const room201Result = await request('POST', '/rooms', {
            roomNumber: '201',
            dormitoryId: testData.dorm1Id,
            type: 'SINGLE',
            capacity: 1,
            price: 3500,
            floor: 2,
        });
        logTest(
            'สร้าง Room 201',
            room201Result.status === 201 && room201Result.data.success,
            room201Result.data.error
        );
        if (room201Result.data.success) {
            testData.room201Id = room201Result.data.data.id;
        }
    }

    // TEST 5: Transactions (Bookings)
    console.log('\n📝 TEST 5: Transactions (Bookings)');
    console.log('-'.repeat(60));

    if (testData.studentId && testData.room101Id) {
        const bookingResult = await request('POST', '/bookings', {
            userId: testData.studentId,
            roomId: testData.room101Id,
            startDate: '2025-12-01',
            endDate: '2026-05-31',
            totalAmount: 18000,
            notes: 'ทดสอบ transaction',
        });
        logTest(
            'สร้าง Booking (transaction)',
            bookingResult.status === 201 && bookingResult.data.success,
            bookingResult.data.error
        );
        if (bookingResult.data.success) {
            testData.booking1Id = bookingResult.data.data.id;
        }

        await sleep(200);

        // ตรวจสอบว่า Room status เปลี่ยน
        const roomCheckResult = await request('GET', `/rooms/${testData.room101Id}`);
        logTest(
            'Room status เปลี่ยนเป็น RESERVED (transaction)',
            roomCheckResult.data.data.status === 'RESERVED',
            `Status: ${roomCheckResult.data.data.status}`
        );

        await sleep(100);

        // Update booking เป็น CONFIRMED
        const updateBookingResult = await request('PUT', `/bookings/${testData.booking1Id}`, {
            status: 'CONFIRMED',
        });
        logTest(
            'Update Booking เป็น CONFIRMED',
            updateBookingResult.status === 200 && updateBookingResult.data.success,
            updateBookingResult.data.error
        );

        await sleep(200);

        // ตรวจสอบว่า Room status เปลี่ยนเป็น OCCUPIED
        const roomCheck2Result = await request('GET', `/rooms/${testData.room101Id}`);
        logTest(
            'Room status เปลี่ยนเป็น OCCUPIED (transaction)',
            roomCheck2Result.data.data.status === 'OCCUPIED',
            `Status: ${roomCheck2Result.data.data.status}`
        );
    }

    // TEST 6: Cancel Booking (Transaction Rollback)
    console.log('\n📝 TEST 6: Cancel Booking (Transaction)');
    console.log('-'.repeat(60));

    if (testData.studentId && testData.room102Id) {
        const booking2Result = await request('POST', '/bookings', {
            userId: testData.studentId,
            roomId: testData.room102Id,
            startDate: '2025-12-01',
            totalAmount: 4500,
        });
        logTest(
            'สร้าง Booking 2',
            booking2Result.status === 201 && booking2Result.data.success,
            booking2Result.data.error
        );
        if (booking2Result.data.success) {
            testData.booking2Id = booking2Result.data.data.id;
        }

        await sleep(200);

        // Cancel booking
        const cancelResult = await request('DELETE', `/bookings/${testData.booking2Id}`);
        logTest(
            'Cancel Booking',
            cancelResult.status === 200 && cancelResult.data.success,
            cancelResult.data.error
        );

        await sleep(200);

        // ตรวจสอบว่า Room กลับเป็น AVAILABLE
        const roomCheck3Result = await request('GET', `/rooms/${testData.room102Id}`);
        logTest(
            'Room กลับเป็น AVAILABLE หลัง cancel',
            roomCheck3Result.data.data.status === 'AVAILABLE',
            `Status: ${roomCheck3Result.data.data.status}`
        );
    }

    // TEST 7: Payments
    console.log('\n📝 TEST 7: Payments');
    console.log('-'.repeat(60));

    if (testData.booking1Id && testData.studentId) {
        const paymentResult = await request('POST', '/payments', {
            bookingId: testData.booking1Id,
            userId: testData.studentId,
            amount: 3000,
            paymentMethod: 'BANK_TRANSFER',
            notes: 'ทดสอบการชำระเงิน',
        });
        logTest(
            'สร้าง Payment',
            paymentResult.status === 201 && paymentResult.data.success,
            paymentResult.data.error
        );
        if (paymentResult.data.success) {
            testData.payment1Id = paymentResult.data.data.id;
        }
    }

    // TEST 8: Dashboard Stats
    console.log('\n📝 TEST 8: Dashboard Stats (groupBy fix)');
    console.log('-'.repeat(60));

    const statsResult = await request('GET', '/dashboard/stats?period=7');
    logTest(
        'ดึงสถิติ Dashboard',
        statsResult.status === 200 && statsResult.data.success,
        statsResult.data.error
    );
    if (statsResult.data.success) {
        logTest(
            'Stats มี bookingsPerDay',
            Array.isArray(statsResult.data.data.trends.bookingsPerDay),
            'bookingsPerDay ควรเป็น array'
        );
    }

    // TEST 9: Error Handling
    console.log('\n📝 TEST 9: Error Handling');
    console.log('-'.repeat(60));

    const duplicateEmailResult = await request('POST', '/users', {
        email: 'admin@test.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
    });
    logTest(
        'Email ซ้ำ (ควร error 409)',
        duplicateEmailResult.status === 409,
        `Status: ${duplicateEmailResult.status}`
    );

    const invalidUserResult = await request('GET', '/users/invalid_id');
    logTest(
        'User ไม่มี (ควร error 404)',
        invalidUserResult.status === 404,
        `Status: ${invalidUserResult.status}`
    );

    // TEST 10: Validation
    console.log('\n📝 TEST 10: Validation');
    console.log('-'.repeat(60));

    const invalidEmailResult = await request('POST', '/users', {
        email: 'invalid-email',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
    });
    logTest(
        'Email ไม่ถูกต้อง (ควร error 400)',
        invalidEmailResult.status === 400,
        `Status: ${invalidEmailResult.status}`
    );

    const shortPasswordResult = await request('POST', '/users', {
        email: 'test@test.com',
        password: '123',
        firstName: 'Test',
        lastName: 'User',
    });
    logTest(
        'Password สั้นเกินไป (ควร error 400)',
        shortPasswordResult.status === 400,
        `Status: ${shortPasswordResult.status}`
    );

    // สรุปผลการทดสอบ
    console.log('\n' + '='.repeat(60));
    console.log('📊 สรุปผลการทดสอบ');
    console.log('='.repeat(60));
    console.log(`✅ ผ่าน: ${stats.passed}/${stats.total}`);
    console.log(`❌ ไม่ผ่าน: ${stats.failed}/${stats.total}`);
    console.log(`📈 อัตราความสำเร็จ: ${((stats.passed / stats.total) * 100).toFixed(2)}%`);

    if (stats.failed > 0) {
        console.log('\n❌ รายการที่ไม่ผ่าน:');
        stats.errors.forEach((err, index) => {
            console.log(`${index + 1}. ${err.test}`);
            if (err.details) console.log(`   ${err.details}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ เสร็จสิ้นการทดสอบ!\n');
}

// รันการทดสอบ
runTests().catch(console.error);
