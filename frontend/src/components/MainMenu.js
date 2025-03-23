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

// Component to update the map view when the position changes.
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function MainMenu() {
  const [position, setPosition] = useState([40.7128, -74.0060]);
  const [hasPosition, setHasPosition] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('User'); // default fallback

  // Travel tools state.
  const [currencyRate, setCurrencyRate] = useState(null);
  const [localPhrase, setLocalPhrase] = useState('');
  const [weatherForecast, setWeatherForecast] = useState('');

  useEffect(() => {
    setMounted(true);
    
    // Retrieve the username from localStorage.
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setHasPosition(true);
          
          // Fetch actual currency conversion rate (EUR to USD) using exchangerate.host.
          try {
            const currencyRes = await fetch(`https://api.exchangerate.host/latest?base=EUR&symbols=USD`);
            const currencyData = await currencyRes.json();
            if (currencyData && currencyData.rates && currencyData.rates.USD) {
              setCurrencyRate(currencyData.rates.USD);
            } else {
              setCurrencyRate("N/A");
            }
          } catch (error) {
            console.error("Error fetching currency rate:", error);
            setCurrencyRate("N/A");
          }
          
          // Reverse geocode to get country code using Nominatim.
          try {
            const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
            const revData = await revRes.json();
            const country = revData.address.country_code; // e.g., 'fr', 'nl', etc.
            if (country === 'fr') {
              setLocalPhrase("Bonjour!");
            } else if (country === 'nl') {
              setLocalPhrase("Hoi!");
            } else if (country === 'es') {
              setLocalPhrase("¡Hola!");
            } else {
              setLocalPhrase("Hello!");
            }
          } catch (error) {
            console.error("Error reverse geocoding:", error);
            setLocalPhrase("Hello!");
          }
          
          // Fetch current weather from OpenWeatherMap.
          try {
            // Use fallback key if environment variable not set.
            const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '15ab8d5a8a68060257b990c795d5de2b';
            if (!apiKey) {
              throw new Error("Missing OpenWeather API key");
            }
            const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`);
            const weatherData = await weatherRes.json();
            if (
              weatherData &&
              weatherData.weather &&
              weatherData.weather.length > 0 &&
              weatherData.main
            ) {
              const description = weatherData.weather[0].description;
              const temp = weatherData.main.temp;
              setWeatherForecast(`${description}, ${temp}°C`);
            } else {
              setWeatherForecast("Unavailable");
            }
          } catch (error) {
            console.error("Error fetching weather:", error);
            setWeatherForecast("Unavailable");
          }
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
      
      {/* Travel Tools Section */}
      <div style={{
          margin: '2rem auto',
          maxWidth: '500px',
          textAlign: 'left',
          background: '#2a2a2a',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)'
        }}>
        <h3 style={{ color: '#f0f0f0', marginBottom: '1rem' }}>Travel Tools</h3>
        <div style={{ marginBottom: '1rem', color: '#f0f0f0' }}>
          <strong>Currency Converter:</strong> 1 EUR = {currencyRate ? `${currencyRate} USD` : "Loading..."}
        </div>
        <div style={{ marginBottom: '1rem', color: '#f0f0f0' }}>
          <strong>Local Phrase:</strong> {localPhrase || "Loading..."}
        </div>
        <div style={{ marginBottom: '1rem', color: '#f0f0f0' }}>
          <strong>Weather Forecast:</strong> {weatherForecast || "Loading..."}
        </div>
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
