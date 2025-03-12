// src/components/LocationSearch.js
"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix marker icons (if not set globally)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

export default function LocationSearch({ initialValue, onSelect }) {
  const [query, setQuery] = useState(initialValue || '');
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // default center

  // Fetch suggestions from Nominatim when query length > 2
  useEffect(() => {
    if (query.length > 2) {
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      )
        .then((res) => res.json())
        .then((data) => setSuggestions(data))
        .catch((err) => console.error(err));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // When a suggestion is selected, update the map center and notify parent.
  // This effect now only depends on "selected" (assuming onSelect is stable).
  useEffect(() => {
    if (selected) {
      const lat = parseFloat(selected.lat);
      const lon = parseFloat(selected.lon);
      setMapCenter([lat, lon]);
      onSelect({
        name: selected.display_name,
        lat,
        lon,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Allow user to click on the map to select a location.
  // Here we update the query with coordinates as a fallback.
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        // Optionally, you can implement reverse geocoding here.
        const newDisplayName = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setSelected({ lat, lon: lng, display_name: newDisplayName });
        setQuery(newDisplayName);
        onSelect({
          name: newDisplayName,
          lat,
          lon: lng,
        });
      },
    });
    return selected ? <Marker position={mapCenter} /> : null;
  }

  return (
    <div style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter location"
        style={{
          width: '100%',
          padding: '0.5rem',
          backgroundColor: '#222',
          color: '#fff',
          border: '1px solid #444',
        }}
      />
      {suggestions.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: '0.5rem',
            margin: 0,
            backgroundColor: '#333',
            border: '1px solid #444',
            maxHeight: '150px',
            overflowY: 'auto',
            color: '#fff',
          }}
        >
          {suggestions.map((sug, index) => (
            <li
              key={index}
              style={{ padding: '0.5rem', cursor: 'pointer' }}
              onClick={() => {
                setSelected(sug);
                setQuery(sug.display_name);
                setSuggestions([]);
              }}
            >
              {sug.display_name}
            </li>
          ))}
        </ul>
      )}
      <div style={{ height: '200px', marginTop: '1rem' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>
      {selected && (
        <button
          type="button"
          style={{
            marginTop: '0.5rem',
            backgroundColor: '#444',
            color: '#fff',
            border: 'none',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
          }}
          onClick={() =>
            onSelect({
              name: selected.display_name,
              lat: parseFloat(selected.lat),
              lon: parseFloat(selected.lon),
            })
          }
        >
          Select Location
        </button>
      )}
    </div>
  );
}
