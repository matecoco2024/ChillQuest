import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET: Fetch past trips for the logged-in user.
// For demonstration, we use a hardcoded email; replace with session or JWT-based logic.
export async function GET(req) {
  try {
    // Replace with logic to extract the user from your session or token.
    const userEmail = 'test@example.com';
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }
    const trips = await prisma.trip.findMany({
      where: { userId: user.id },
      include: { locations: true },
    });
    return new Response(JSON.stringify(trips), { status: 200 });
  } catch (error) {
    console.error('Error fetching past trips:', error);
    return new Response(JSON.stringify({ message: 'Error fetching past trips' }), { status: 500 });
  }
}
