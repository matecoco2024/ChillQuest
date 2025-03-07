// src/app/api/trips/route.js

// NOTE: In a production app you would use a proper database,
// not an in-memory variable. In-memory storage is just for demo.
let trips = [];

export async function GET(request) {
  return new Response(JSON.stringify(trips), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request) {
  const trip = await request.json();
  trips.push(trip);
  console.log("Received trip data:", trip);
  return new Response(JSON.stringify({ message: 'Trip logged successfully' }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}
