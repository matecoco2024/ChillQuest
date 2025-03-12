// src/components/TripLog.js
"use client";

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LocationSearch from '@/components/LocationSearch';
import StarRating from './StarRating';

export default function TripLog() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [trip, setTrip] = useState({
    locations: [
      { name: '', date: today, cost: '', rating: 0, category: '', coordinates: null },
    ],
  });

  // Memoize the callback to keep its reference stable
  const handleLocationSelect = useCallback((index, selected) => {
    setTrip((prev) => {
      const updatedLocations = prev.locations.map((location, i) =>
        i === index
          ? { ...location, name: selected.name, coordinates: { lat: selected.lat, lon: selected.lon } }
          : location
      );
      return { ...prev, locations: updatedLocations };
    });
  }, []);

  // Update individual location fields by index (for non-location-search fields)
  const handleLocationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLocations = trip.locations.map((location, i) =>
      i === index ? { ...location, [name]: value } : location
    );
    setTrip({ ...trip, locations: updatedLocations });
  };

  // Update rating for a specific location
  const handleRatingChange = (index, newRating) => {
    const updatedLocations = trip.locations.map((location, i) =>
      i === index ? { ...location, rating: newRating } : location
    );
    setTrip({ ...trip, locations: updatedLocations });
  };

  // Add a new location entry
  const addLocation = () => {
    setTrip({
      ...trip,
      locations: [
        ...trip.locations,
        { name: '', date: today, cost: '', rating: 0, category: '', coordinates: null },
      ],
    });
  };

  // Remove a location entry (if more than one)
  const removeLocation = (index) => {
    const updatedLocations = trip.locations.filter((_, i) => i !== index);
    setTrip({ ...trip, locations: updatedLocations });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prepare the payload (converting cost to number when provided)
    const payload = {
      locations: trip.locations.map((loc) => ({
        name: loc.name,
        date: loc.date,
        cost: loc.cost ? parseFloat(loc.cost) : null,
        rating: loc.rating,
        category: loc.category,
        // Coordinates could be sent if your database schema is updated accordingly
        // coordinates: loc.coordinates,
      })),
    };

    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log("Trip logged successfully!");
      router.push('/location-list');
    } else {
      console.error("Error logging trip");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <h1>Log a Trip</h1>
      <h2>Locations</h2>
      {trip.locations.map((location, index) => (
        <div
          key={index}
          style={{
            border: '1px solid #ccc',
            padding: '1rem',
            borderRadius: '8px',
          }}
        >
          {/* Use the LocationSearch component for the location input */}
          <LocationSearch
            initialValue={location.name}
            onSelect={(selected) => handleLocationSelect(index, selected)}
          />
          <div>
            <label>
              Date:
              <input
                type="date"
                name="date"
                value={location.date}
                onChange={(e) => handleLocationChange(index, e)}
                required
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>
          <div>
            <label>
              Cost (€):
              <input
                type="number"
                name="cost"
                value={location.cost}
                onChange={(e) => handleLocationChange(index, e)}
                step="0.01"
                placeholder="e.g. 20.00"
                style={{ marginLeft: '0.5rem' }}
              />
            </label>
          </div>
          <div>
            <label>
              Rating:
              <StarRating
                rating={location.rating}
                onChange={(newRating) => handleRatingChange(index, newRating)}
              />
            </label>
          </div>
          <div>
            <label>
              Category:
              <select
                name="category"
                value={location.category}
                onChange={(e) => handleLocationChange(index, e)}
                required
                style={{ marginLeft: '0.5rem' }}
              >
                <option value="">Select category</option>
                <option value="NATURE_OUTDOORS">Nature & Outdoors</option>
                <option value="RECREATIONAL_AMUSEMENT">
                  Recreational & Amusement
                </option>
                <option value="NIGHTLIFE_ENTERTAINMENT">
                  Nightlife & Entertainment
                </option>
                <option value="CULTURAL_HISTORICAL">
                  Cultural & Historical
                </option>
                <option value="FOOD_CULINARY">Food & Culinary</option>
                <option value="FRIENDS_FAMILY">Friends & Family</option>
                <option value="CITY_URBAN">City & Urban</option>
                <option value="SPORTS_ACTIVITY">Sports Activity</option>
                <option value="SHOPPING_FASHION">
                  Shopping & Fashion
                </option>
                <option value="WELLNESS_RELAXATION">
                  Wellness & Relaxation
                </option>
              </select>
            </label>
          </div>
          {trip.locations.length > 1 && (
            <button
              type="button"
              onClick={() => removeLocation(index)}
              style={{ marginTop: '0.5rem' }}
            >
              Remove Location
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addLocation}>
        Add Another Location
      </button>
      <button type="submit">Log Trip</button>
    </form>
  );
}
