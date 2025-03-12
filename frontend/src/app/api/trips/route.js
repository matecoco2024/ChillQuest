import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET: Fetch all trips (for demonstration, fetching all trips)
export async function GET(req) {
  try {
    // You could also filter trips by a specific user, for example:
    // const trips = await prisma.trip.findMany({ where: { userId: 'some-valid-id' }, include: { locations: true } });
    const trips = await prisma.trip.findMany({ include: { locations: true } });
    return new Response(JSON.stringify(trips), { status: 200 });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return new Response(JSON.stringify({ message: 'Error fetching trips' }), { status: 500 });
  }
}

// POST: Create a new trip
export async function POST(req) {
  try {
    const { locations } = await req.json();

    // Use today's date as the default startDate
    const startDate = new Date();
    const endDate = null; // Not provided in this form

    // Replace with the actual logged-in user's id, e.g. from session data.
    let user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: 'test@example.com', password: 'password', name: 'Test User' },
      });
    }
    const userId = user.id;

    const newTrip = await prisma.trip.create({
      data: {
        userId,
        startDate,
        endDate,
        locations: {
          create: locations.map(loc => ({
            name: loc.name,
            date: new Date(loc.date),
            cost: loc.cost,
            rating: loc.rating,
            category: loc.category,
          })),
        },
      },
      include: { locations: true },
    });

    return new Response(JSON.stringify(newTrip), { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return new Response(JSON.stringify({ message: 'Error creating trip' }), { status: 500 });
  }
}
