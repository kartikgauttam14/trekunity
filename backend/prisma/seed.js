import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@triptogether.app' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@triptogether.app',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    });

    // Create demo organizer
    const orgPassword = await bcrypt.hash('Demo@123', 12);
    const organizer = await prisma.user.upsert({
        where: { email: 'organizer@demo.com' },
        update: {},
        create: {
            name: 'Alex Jordan',
            email: 'organizer@demo.com',
            passwordHash: orgPassword,
            role: 'ORGANIZER',
            bio: 'Passionate traveler and trip organizer. 20+ trips organized!',
        },
    });

    // Create demo user
    const userPassword = await bcrypt.hash('Demo@123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'user@demo.com' },
        update: {},
        create: {
            name: 'Sam Rivera',
            email: 'user@demo.com',
            passwordHash: userPassword,
            bio: 'Adventure seeker. Always up for a new destination.',
        },
    });

    // Create demo trips
    const trip1 = await prisma.trip.upsert({
        where: { id: 'seed-trip-1' },
        update: {},
        create: {
            id: 'seed-trip-1',
            title: 'Bali Adventure 2025',
            description: 'A week of surfing, temples, and jungle trekking in beautiful Bali.',
            destination: 'Bali, Indonesia',
            startDate: new Date('2025-08-10'),
            endDate: new Date('2025-08-17'),
            maxParticipants: 12,
            budgetEstimate: 1500,
            status: 'OPEN',
            organizerId: organizer.id,
        },
    });

    const trip2 = await prisma.trip.upsert({
        where: { id: 'seed-trip-2' },
        update: {},
        create: {
            id: 'seed-trip-2',
            title: 'Swiss Alps Hiking',
            description: 'Multi-day hike through the stunning Swiss Alps with breathtaking views.',
            destination: 'Interlaken, Switzerland',
            startDate: new Date('2025-09-05'),
            endDate: new Date('2025-09-12'),
            maxParticipants: 8,
            budgetEstimate: 2800,
            status: 'OPEN',
            organizerId: organizer.id,
        },
    });

    // Add itinerary items to trip1
    await prisma.itineraryItem.createMany({
        skipDuplicates: true,
        data: [
            { tripId: trip1.id, dayNumber: 1, title: 'Arrival & Welcome Dinner', location: 'Seminyak', startTime: '18:00', type: 'FOOD', order: 1 },
            { tripId: trip1.id, dayNumber: 2, title: 'Tanah Lot Temple Visit', location: 'Tanah Lot', startTime: '09:00', endTime: '12:00', type: 'ACTIVITY', order: 1 },
            { tripId: trip1.id, dayNumber: 2, title: 'Canggu Beach Surfing', location: 'Canggu', startTime: '14:00', endTime: '17:00', type: 'ACTIVITY', order: 2 },
            { tripId: trip1.id, dayNumber: 3, title: 'Ubud Rice Terraces', location: 'Tegalalang, Ubud', startTime: '08:00', endTime: '13:00', type: 'ACTIVITY', order: 1 },
        ],
    });

    // Add members
    await prisma.tripMember.createMany({
        skipDuplicates: true,
        data: [
            { tripId: trip1.id, userId: organizer.id, status: 'APPROVED' },
            { tripId: trip1.id, userId: user.id, status: 'APPROVED' },
            { tripId: trip2.id, userId: organizer.id, status: 'APPROVED' },
        ],
    });

    console.log('✅ Seed complete!');
    console.log(`   Admin: admin@triptogether.app / Admin@123`);
    console.log(`   Organizer: organizer@demo.com / Demo@123`);
    console.log(`   User: user@demo.com / Demo@123`);
}

main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
