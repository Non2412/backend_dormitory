const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('=== USERS ===');
    const users = await prisma.user.findMany();
    users.forEach(u => {
      console.log(`ID: ${u.id}`);
      console.log(`Email: ${u.email}`);
      console.log(`Name: ${u.firstName} ${u.lastName}`);
      console.log('---');
    });

    console.log('\n=== BOOKINGS ===');
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { email: true } },
        room: { select: { roomNumber: true } }
      }
    });
    bookings.forEach(b => {
      console.log(`ID: ${b.id}`);
      console.log(`User: ${b.user.email}`);
      console.log(`Room: ${b.room.roomNumber}`);
      console.log(`Status: ${b.status}`);
      console.log(`Amount: ${b.totalAmount}`);
      console.log('---');
    });

    console.log('\n=== CHECKING YOUR IDs ===');
    const userId = 'cmid9aup6080ccb5vb1no8h8';
    const bookingId = 'cmid2x4mae90s59k74vyxsgxo';
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    
    console.log(`User ID "${userId}": ${user ? '✓ EXISTS' : '✗ NOT FOUND'}`);
    console.log(`Booking ID "${bookingId}": ${booking ? '✓ EXISTS' : '✗ NOT FOUND'}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
