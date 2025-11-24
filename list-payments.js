const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listPayments() {
  try {
    const payments = await prisma.payment.findMany({
      select: {
        id: true,
        amount: true,
        status: true,
        paymentMethod: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('=== ALL PAYMENTS ===');
    payments.forEach(p => {
      console.log(`ID: ${p.id}`);
      console.log(`Amount: ${p.amount}`);
      console.log(`Status: ${p.status}`);
      console.log(`Method: ${p.paymentMethod}`);
      console.log(`Created: ${p.createdAt}`);
      console.log('---');
    });

    if (payments.length > 0) {
      console.log(`\n✅ ใช้ Payment ID นี้สำหรับ GET by ID:`);
      console.log(`GET http://localhost:3000/api/payments/${payments[0].id}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listPayments();
