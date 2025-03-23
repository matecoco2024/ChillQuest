// src/components/LocationListClient.js
"use client";

import React, { useState, useEffect } from 'react';
import LocationCard from '@/components/LocationCard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix marker icons (if not set globally)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

export default function LocationListClient() {
  const [trips, setTrips] = useState([]);
  const [debugOutput, setDebugOutput] = useState("");

  const fetchTrips = async () => {
    try {
      const res = await fetch('/api/trips', { cache: 'no-store' });
      const data = await res.json();
      console.log("Fetched trips:", data);
      setTrips(data);
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // When a location is deleted, update the state.
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

  // Gather all locations with coordinates from trips.
  const allLocations = trips
    .flatMap(trip => trip.locations)
    .filter(loc => loc.coordinates && !isNaN(loc.coordinates.lat) && !isNaN(loc.coordinates.lon));

  // Log debugging info to the console and update a debug output state.
  useEffect(() => {
    console.log("Trips data:", trips);
    console.log("All locations with coordinates:", allLocations);
    const debugText = `
Trips Data:
${JSON.stringify(trips, null, 2)}

All Locations:
${JSON.stringify(allLocations, null, 2)}
    `;
    setDebugOutput(debugText);
  }, [trips, allLocations]);

  // Set a default map center based on the first available location, or fallback.
  const defaultCenter =
    allLocations.length > 0
      ? [allLocations[0].coordinates.lat, allLocations[0].coordinates.lon]
      : [51.505, -0.09];

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Logged Trips</h1>
      
      {/* Global Map showing all pins */}
      <div style={{ height: '300px', marginBottom: '2rem' }}>
        <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {allLocations.map((loc, idx) => (
            <Marker key={idx} position={[loc.coordinates.lat, loc.coordinates.lon]}>
              <Popup>
                {loc.name} <br /> {new Date(loc.date).toLocaleDateString()}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      {/* Trips List */}
      {trips.filter(trip => trip.locations && trip.locations.length > 0).length > 0 ? (
        trips.filter(trip => trip.locations && trip.locations.length > 0).map((trip) => (
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

      {/* Debug output */}
      <pre style={{
        backgroundColor: '#222',
        color: '#0f0',
        padding: '1rem',
        marginTop: '2rem',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        {debugOutput}
      </pre>
    </main>
  );
}
