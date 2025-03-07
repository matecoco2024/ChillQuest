// src/app/explore/page.js
export default async function ExplorePage() {
    // Fetch logged trips from the API.
    // Using a relative URL here works in Next.js 13 server components.
    const res = await fetch('http://localhost:3000/api/trips', { cache: 'no-store' });
    const trips = await res.json();
  
    // Extract unique cities from logged trips
    const loggedCities = [...new Set(trips.map((trip) => trip.city))];
  
    // Dummy recommendations mapping for demonstration
    const recommendationsMapping = {
      'Paris': 'Lyon',
      'New York': 'Boston',
      'Tokyo': 'Osaka',
      'London': 'Birmingham',
    };
  
    // Generate recommendations based on logged cities
    const recommendedLocations = loggedCities.map((city) => {
      return recommendationsMapping[city] || `Discover a new city near ${city}`;
    });
  
    // Remove any duplicate recommendations
    const uniqueRecommendations = [...new Set(recommendedLocations)];
  
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Location Recommendations</h1>
        {trips.length > 0 ? (
          <div>
            <p>Based on your logged trips, we recommend exploring:</p>
            <ul>
              {uniqueRecommendations.map((loc, index) => (
                <li key={index}>{loc}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No trips logged yet. Please log a trip first!</p>
        )}
      </main>
    );
  }
  