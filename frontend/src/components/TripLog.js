"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LocationSearch from '@/components/LocationSearch';
import StarRating from './StarRating';
import styles from '../app/TripLog.module.css';

export default function TripLog() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  const [trip, setTrip] = useState({
    locations: [
      { 
        name: '', 
        date: today, 
        cost: '', 
        rating: 0, 
        category: '', 
        coordinates: null 
      },
    ],
  });

  // On mount, fetch the user's geolocation and update the first location.
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("TripLog geolocation:", { latitude, longitude });
          setTrip((prev) => {
            const updatedLocations = [...prev.locations];
            updatedLocations[0] = {
              ...updatedLocations[0],
              coordinates: { lat: latitude, lon: longitude },
              name: `Current Location (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`,
            };
            return { ...prev, locations: updatedLocations };
          });
        },
        (error) => {
          console.error("Error retrieving geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser.");
    }
  }, []);

  // When the user selects a location in LocationSearch, update that location.
  const handleLocationSelect = useCallback((index, selected) => {
    console.log("TripLog handleLocationSelect:", { index, selected });
    setTrip((prev) => {
      const updatedLocations = prev.locations.map((location, i) =>
        i === index
          ? { 
              ...location, 
              name: selected.name, 
              coordinates: { lat: selected.lat, lon: selected.lon } 
            }
          : location
      );
      return { ...prev, locations: updatedLocations };
    });
  }, []);

  // Helper to update other fields (date, cost, rating, category).
  const handleFieldChange = (index, fieldName, value) => {
    setTrip((prev) => {
      const updatedLocations = prev.locations.map((loc, i) =>
        i === index ? { ...loc, [fieldName]: value } : loc
      );
      return { ...prev, locations: updatedLocations };
    });
  };

  const addLocation = () => {
    setTrip((prev) => ({
      ...prev,
      locations: [
        ...prev.locations,
        { 
          name: '', 
          date: today, 
          cost: '', 
          rating: 0, 
          category: '', 
          coordinates: null 
        },
      ],
    }));
  };

  const removeLocation = (index) => {
    setTrip((prev) => {
      const updatedLocations = prev.locations.filter((_, i) => i !== index);
      return { ...prev, locations: updatedLocations };
    });
  };

  // Form submit logic.
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      locations: trip.locations.map((loc) => ({
        name: loc.name,
        date: loc.date,
        cost: loc.cost ? parseFloat(loc.cost) : null,
        rating: loc.rating,
        category: loc.category,
        // coordinates: loc.coordinates, // Uncomment if your API supports saving coordinates.
      })),
    };
    console.log("Submitting payload:", payload);
    
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
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1 className={styles.title}>Log a Trip</h1>
      <h2 className={styles.subTitle}>Locations</h2>
      {trip.locations.map((location, index) => (
        <div key={index} className={styles.card}>
          {/* Pass the parent's coordinates and name to LocationSearch */}
          <LocationSearch
            coords={location.coordinates}
            initialValue={location.name}
            onSelect={(selected) => handleLocationSelect(index, selected)}
          />
          <div className={styles.field}>
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={location.date}
              onChange={(e) => handleFieldChange(index, 'date', e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Cost (€):</label>
            <input
              type="number"
              name="cost"
              value={location.cost}
              onChange={(e) => handleFieldChange(index, 'cost', e.target.value)}
              step="0.01"
              placeholder="e.g. 20.00"
            />
          </div>
          <div className={styles.field}>
            <label>Rating:</label>
            <StarRating
              rating={location.rating}
              onChange={(newRating) => handleFieldChange(index, 'rating', newRating)}
            />
          </div>
          <div className={styles.field}>
            <label>Category:</label>
            <select
              name="category"
              value={location.category}
              onChange={(e) => handleFieldChange(index, 'category', e.target.value)}
              required
            >
              <option value="">Select category</option>
              <option value="NATURE_OUTDOORS">Nature & Outdoors</option>
              <option value="RECREATIONAL_AMUSEMENT">Recreational & Amusement</option>
              <option value="NIGHTLIFE_ENTERTAINMENT">Nightlife & Entertainment</option>
              <option value="CULTURAL_HISTORICAL">Cultural & Historical</option>
              <option value="FOOD_CULINARY">Food & Culinary</option>
              <option value="FRIENDS_FAMILY">Friends & Family</option>
              <option value="CITY_URBAN">City & Urban</option>
              <option value="SPORTS_ACTIVITY">Sports Activity</option>
              <option value="SHOPPING_FASHION">Shopping & Fashion</option>
              <option value="WELLNESS_RELAXATION">Wellness & Relaxation</option>
            </select>
          </div>
          {trip.locations.length > 1 && (
            <button type="button" className={styles.removeBtn} onClick={() => removeLocation(index)}>
              Remove Location
            </button>
          )}
        </div>
      ))}
      <div className={styles.btnGroup}>
        <button type="button" className={styles.addBtn} onClick={addLocation}>
          Add Another Location
        </button>
        <button type="submit" className={styles.submitBtn}>
          Log Trip
        </button>
      </div>
    </form>
  );
}
