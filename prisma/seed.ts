import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // สร้าง Admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@dorm.com' },
        update: {},
        create: {
            email: 'admin@dorm.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'User',
            role: 'ADMIN',
        },
    });

    console.log('✅ Admin user created:', {
        id: admin.id,
        email: admin.email,
        role: admin.role,
    });

    // สร้าง Demo Dormitory
    const dormitory = await prisma.dormitory.upsert({
        where: { id: 'demo-dorm-1' },
        update: {},
        create: {
            id: 'demo-dorm-1',
            name: 'หอพักตัวอย่าง',
            address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
            description: 'หอพักสะอาด ปลอดภัย ใกล้ BTS',
            facilities: JSON.stringify(['WiFi', 'ที่จอดรถ', 'ซักรีด', 'ความปลอดภัย 24 ชม.']),
        },
    });

    console.log('✅ Demo dormitory created:', {
        id: dormitory.id,
        name: dormitory.name,
    });

    // สร้าง Demo Rooms
    const rooms = await Promise.all([
        prisma.room.upsert({
            where: { id: 'demo-room-101' },
            update: {},
            create: {
                id: 'demo-room-101',
                roomNumber: '101',
                dormitoryId: dormitory.id,
                type: 'SINGLE',
                capacity: 1,
                price: 3500,
                floor: 1,
                status: 'AVAILABLE',
                description: 'ห้องเดี่ยว พร้อมเฟอร์นิเจอร์',
            },
        }),
        prisma.room.upsert({
            where: { id: 'demo-room-201' },
            update: {},
            create: {
                id: 'demo-room-201',
                roomNumber: '201',
                dormitoryId: dormitory.id,
                type: 'DOUBLE',
                capacity: 2,
                price: 5000,
                floor: 2,
                status: 'AVAILABLE',
                description: 'ห้องคู่ พร้อมเฟอร์นิเจอร์',
            },
        }),
    ]);

    console.log('✅ Demo rooms created:', rooms.length);

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
