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
  const [position, setPosition] = useState([40.7128, -74.0060]);
  const [hasPosition, setHasPosition] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('User'); // default fallback

  useEffect(() => {
    setMounted(true);
    
    // Retrieve the username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const userPos = [pos.coords.latitude, pos.coords.longitude];
          setPosition(userPos);
          setHasPosition(true);
        },
        (error) => {
          console.error('Error fetching geolocation:', error);
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

  if (!mounted) {
    return null;
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Welcome back, {username}!</h2>
      <h3>Main Menu</h3>
      
      {/* Map Container */}
      <div style={{ margin: '2rem auto', width: '90%', maxWidth: '500px' }}>
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          style={{
            width: '100%',
            height: '300px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
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
      </div>
      
      {/* Navigation Buttons */}
      <div style={{ marginTop: '1rem' }}>
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
