// src/app/location-list/page.js
export default async function LocationListPage() {
    // Fetch trips from our API route; 'cache: "no-store"' ensures fresh data
    const res = await fetch('http://localhost:3000/api/trips', { cache: 'no-store' });
    const trips = await res.json();
  
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Logged Trips</h1>
        {trips.length > 0 ? (
          <ul>
            {trips.map((trip, index) => (
              <li key={index}>
                <strong>{trip.city}</strong> on {trip.date} — Cost: {trip.cost}, Rating: {trip.rating}, Style: {trip.travelStyle}
              </li>
            ))}
          </ul>
        ) : (
          <p>No trips logged yet.</p>
        )}
      </main>
    );
  }
  