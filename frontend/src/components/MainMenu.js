"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';

// Fix for missing default marker icons:
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

// Component to update the map view when the position changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MainMenu() {
  // Default position (fallback, e.g., New York City)
  const [position, setPosition] = useState([40.7128, -74.0060]);
  const [hasPosition, setHasPosition] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      // watchPosition continuously tracks the location
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const userPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(userPos);
          setHasPosition(true);
        },
        (error) => {
          console.error('Error fetching geolocation:', error.code, error.message);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  return (
    <div>
      <h2>Main Menu</h2>
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasPosition && (
          <>
            <ChangeView center={position} zoom={13} />
            <Marker position={position}>
              <Popup>You are here!</Popup>
            </Marker>
          </>
        )}
      </MapContainer>
      
      {/* Navigation Buttons */}
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link href="/trip-logging">
          <button style={{ padding: '0.5rem 1rem', fontSize: '16px', marginRight: '1rem' }}>
            Add location!
          </button>
        </Link>
        <Link href="/explore">
          <button style={{ padding: '0.5rem 1rem', fontSize: '16px' }}>
            Explore New Location!
          </button>
        </Link>
      </div>
    </div>
  );
}
