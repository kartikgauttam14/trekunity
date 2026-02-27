import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Trekunity database...');

    // Clean existing data (Optional but recommended to ensure a fresh start)
    // Be careful with this in production, but here it seems requested
    console.log('🗑️ Clearing existing data...');
    await prisma.policyAcceptance.deleteMany();
    await prisma.verification.deleteMany();
    await prisma.rideBooking.deleteMany();
    await prisma.rentalBooking.deleteMany();
    await prisma.rentalListing.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.announcement.deleteMany();
    await prisma.pollVote.deleteMany();
    await prisma.poll.deleteMany();
    await prisma.message.deleteMany();
    await prisma.expenseShare.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.itineraryItem.deleteMany();
    await prisma.tripMember.deleteMany();
    await prisma.trip.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.user.deleteMany();

    // Create primary admin user
    const adminPassword = await bcrypt.hash('Kartik@@Gauttam2026', 12);
    const admin = await prisma.user.create({
        data: {
            name: 'Kartik Gauttam',
            email: 'kartikguatttam@trekunity.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
            bio: 'Chief Executive Administrator of Trekunity.',
        },
    });

    console.log('✅ Trekunity setup complete!');
    console.log(`   Admin: Kartikguatttam@trekunity.com / Kartik@@Gauttam2026`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
