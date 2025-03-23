"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix marker icons (if not set globally)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

/**
 * A helper component that forces the map to re-center.
 */
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

/**
 * @param {Object} props
 * @param {{lat: number, lon: number} | null} props.coords - The lat/lon from parent
 * @param {string} props.initialValue - The display name from parent
 * @param {Function} props.onSelect - Called with { name, lat, lon } when the user picks a location
 */
export default function LocationSearch({ coords, initialValue, onSelect }) {
  // Local state for the input query.
  const [query, setQuery] = useState(initialValue || '');
  // Suggestions array from Nominatim.
  const [suggestions, setSuggestions] = useState([]);
  // Currently "selected" location for marker display.
  const [selected, setSelected] = useState(null);
  // Map center state.
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]);

  // Debug logging.
  useEffect(() => {
    console.log("LocationSearch MOUNTED");
    return () => console.log("LocationSearch UNMOUNTED");
  }, []);
  useEffect(() => {
    console.log("props.coords changed to:", coords);
  }, [coords]);
  useEffect(() => {
    console.log("props.initialValue changed to:", initialValue);
    setQuery(initialValue || '');
  }, [initialValue]);

  // When parent's coords (or initialValue) change, update the map center and marker.
  useEffect(() => {
    if (coords && coords.lat && coords.lon) {
      const newCenter = [coords.lat, coords.lon];
      setMapCenter(newCenter);
      setSelected({
        lat: coords.lat,
        lon: coords.lon,
        display_name: initialValue || `${coords.lat}, ${coords.lon}`,
      });
      // Notice: we do NOT call onSelect here, to avoid looping.
    }
  }, [coords, initialValue]);

  // Fetch suggestions from Nominatim when the query length > 2.
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

  // Handle clicks on the map.
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        const newDisplayName = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setSelected({ lat, lon: lng, display_name: newDisplayName });
        setQuery(newDisplayName);
        // Call onSelect only when the user clicks the map.
        onSelect({ name: newDisplayName, lat, lon: lng });
      }
    });
    return selected ? <Marker position={[selected.lat, selected.lon]} /> : null;
  }

  const handleSuggestionClick = (sug) => {
    setSelected(sug);
    setQuery(sug.display_name);
    setSuggestions([]);
    onSelect({ name: sug.display_name, lat: parseFloat(sug.lat), lon: parseFloat(sug.lon) });
  };

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
              onClick={() => handleSuggestionClick(sug)}
            >
              {sug.display_name}
            </li>
          ))}
        </ul>
      )}
      <div style={{ height: '200px', marginTop: '1rem' }}>
        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={mapCenter} zoom={13} />
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  );
}
