"use client";

import React, { useState, useEffect, useCallback } from 'react';
import LocationCard from '@/components/LocationCard';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

// Fix marker icons (if not set globally)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Component to update the map view when the position changes.
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function LocationListClient() {
  const [trips, setTrips] = useState([]);
  const [generatedTrip, setGeneratedTrip] = useState(null); // new generated trip object
  const [showTripMaker, setShowTripMaker] = useState(false);
  const [selectedForTrip, setSelectedForTrip] = useState([]); // array of location ids
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
    setTrips(prevTrips =>
      prevTrips.map(trip => {
        if (trip.id === tripId) {
          return { ...trip, locations: trip.locations.filter(loc => loc.id !== locationId) };
        }
        return trip;
      })
    );
  };

  // Normalize locations.
  const formattedLocations = trips
    .flatMap(trip => trip.locations)
    .map(loc => {
      if (loc.coordinates && !isNaN(loc.coordinates.lat) && !isNaN(loc.coordinates.lon)) {
        return loc;
      } else if (loc.lat != null && loc.lon != null && !isNaN(loc.lat) && !isNaN(loc.lon)) {
        return { ...loc, coordinates: { lat: loc.lat, lon: loc.lon } };
      } else {
        return null;
      }
    })
    .filter(loc => loc !== null);

  useEffect(() => {
    console.log("Trips data:", trips);
    console.log("Formatted locations:", formattedLocations);
    const debugText = `
Trips Data:
${JSON.stringify(trips, null, 2)}

Formatted Locations:
${JSON.stringify(formattedLocations, null, 2)}
    `;
    setDebugOutput(debugText);
  }, [trips, formattedLocations]);

  // Map default center.
  const defaultCenter = formattedLocations.length > 0
    ? [formattedLocations[0].coordinates.lat, formattedLocations[0].coordinates.lon]
    : [20, 0];

  // --- Trip Maker functions ---
  const handleGenerateTripClick = () => {
    setShowTripMaker(!showTripMaker);
  };

  const toggleLocationSelection = (locId) => {
    setSelectedForTrip(prev => {
      if (prev.includes(locId)) {
        return prev.filter(id => id !== locId);
      } else {
        return [...prev, locId];
      }
    });
  };

  const handleConfirmGeneratedTrip = () => {
    const selectedLocations = formattedLocations.filter(loc => selectedForTrip.includes(loc.id));
    if (selectedLocations.length === 0) return;
    const newTrip = {
      id: "generated-" + Date.now(),
      userId: "generated",
      startDate: new Date().toISOString(),
      endDate: null,
      locations: selectedLocations,
      generated: true, // flag for generated trip
      color: "orange"
    };
    setTrips(prev => [...prev, newTrip]);
    setGeneratedTrip(newTrip);
    setShowTripMaker(false);
    setSelectedForTrip([]);
  };

  // --- Marker custom icon for generated trip (orange marker) ---
  const orangeIcon = new L.Icon({
    iconUrl: '/orange-marker.png', // ensure this file exists in /public
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png'
  });

  return (
    <main style={{ padding: '1rem', width: '100%', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Logged Trips</h1>
      
      {/* Global Map */}
      <div style={{ height: '80vh', marginBottom: '2rem' }}>
        <MapContainer center={defaultCenter} zoom={formattedLocations.length > 0 ? 13 : 2} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {formattedLocations.map((loc, idx) => {
            const isGenerated = (loc.tripId && loc.tripId.startsWith("generated")) || (generatedTrip && generatedTrip.locations.some(l => l.id === loc.id));
            return (
              <Marker
                key={idx}
                position={[loc.coordinates.lat, loc.coordinates.lon]}
                {...(isGenerated ? { icon: orangeIcon } : {})}
              >
                <Popup>
                  {loc.name} <br /> {new Date(loc.date).toLocaleDateString()}
                </Popup>
              </Marker>
            );
          })}
          {generatedTrip && generatedTrip.locations.length > 0 && (
            <Polyline
              positions={generatedTrip.locations.map(loc => [loc.coordinates.lat, loc.coordinates.lon])}
              color="orange"
              weight={4}
            />
          )}
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
                marginBottom: '1rem',
                color: trip.generated ? "orange" : "green"
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

      {/* Trip Maker Section */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button onClick={handleGenerateTripClick} style={{ padding: '0.75rem 1rem', fontSize: '16px' }}>
          Generate Your Trip
        </button>
      </div>
      
      {showTripMaker && (
        <div style={{
          margin: '2rem auto',
          maxWidth: '600px',
          background: '#333',
          padding: '1rem',
          borderRadius: '8px',
          color: '#f0f0f0'
        }}>
          <h3>Select Locations for Your Generated Trip</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {formattedLocations.map(loc => (
              <li key={loc.id} style={{ marginBottom: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={selectedForTrip.includes(loc.id)}
                  onChange={() => toggleLocationSelection(loc.id)}
                  style={{ marginRight: '0.5rem' }}
                />
                {loc.name}
              </li>
            ))}
          </ul>
          <button onClick={handleConfirmGeneratedTrip} style={{ padding: '0.5rem 1rem', fontSize: '16px', background: 'orange', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Confirm Generated Trip
          </button>
        </div>
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
