"use client";
import React, { useState, useEffect } from 'react';
import LocationCard from '@/components/LocationCard';

export default function LocationListClient() {
  const [trips, setTrips] = useState([]);

  const fetchTrips = async () => {
    const res = await fetch('/api/trips', { cache: 'no-store' });
    const data = await res.json();
    setTrips(data);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // Update the state to remove a location after deletion
  const handleDeleteLocation = (locationId, tripId) => {
    setTrips((prevTrips) =>
      prevTrips.map((trip) => {
        if (trip.id === tripId) {
          return { ...trip, locations: trip.locations.filter(loc => loc.id !== locationId) };
        }
        return trip;
      })
    );
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Logged Trips</h1>
      {trips.length > 0 ? (
        trips.map((trip) => (
          <div key={trip.id} style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                borderBottom: '2px solid #ccc',
                paddingBottom: '0.5rem',
                marginBottom: '1rem'
              }}
            >
              Trip on {new Date(trip.startDate).toLocaleDateString()}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1rem'
              }}
            >
              {trip.locations.map((location) => (
                <LocationCard 
                  key={location.id} 
                  location={location} 
                  tripId={trip.id}
                  onDelete={handleDeleteLocation}
                />
              ))}
            </div>
          </div>
        ))
      ) : (
        <p style={{ textAlign: 'center' }}>No trips logged yet.</p>
      )}
    </main>
  );
}
