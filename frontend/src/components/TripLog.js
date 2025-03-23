"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LocationSearch from '@/components/LocationSearch';
import StarRating from './StarRating';
import { useDropzone } from 'react-dropzone';
import styles from '../app/TripLog.module.css';

// Toggle personalization on/off:
const PERSONALIZATION = true;

// PhotoUpload component using react-dropzone.
function PhotoUpload({ onFilesAdded }) {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: 'image/*',
    onDrop: onFilesAdded,
  });

  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <section className={styles.photoUpload}>
      <div {...getRootProps({ className: styles.dropzone })}>
        <input {...getInputProps()} />
        <p>Drag your files here, or click to select files</p>
      </div>
      {acceptedFiles.length > 0 && (
        <aside>
          <h4>Files:</h4>
          <ul>{files}</ul>
        </aside>
      )}
    </section>
  );
}

export default function TripLog() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [username, setUsername] = useState('User');

  // New state for friend tags.
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

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
    photos: []  // To store photo files.
  });

  // On mount, fetch user geolocation and basic user info.
  useEffect(() => {
    const storedName = localStorage.getItem('username');
    if (storedName) {
      setUsername(storedName);
    }
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

  // Fetch past trips from API and compute recommendations if personalization is ON.
  useEffect(() => {
    if (!PERSONALIZATION) return;
    async function fetchPastLocations() {
      try {
        const res = await fetch('/api/user-past-trips');
        if (!res.ok) {
          console.warn("Failed to fetch past trips, personalization disabled");
          return;
        }
        const tripsData = await res.json();
        console.log("Fetched past trips:", tripsData);
        const pastLocations = tripsData.flatMap(trip => trip.locations);
        console.log("Flattened past locations:", pastLocations);

        if (pastLocations.length > 0) {
          const validCosts = pastLocations
            .map(loc => parseFloat(loc.cost))
            .filter(cost => !isNaN(cost));
          console.log("Valid costs:", validCosts);
          const avgCost = validCosts.length > 0 
            ? (validCosts.reduce((sum, cost) => sum + cost, 0) / validCosts.length).toFixed(2)
            : '';
          console.log("Average cost computed:", avgCost);

          const frequency = {};
          pastLocations.forEach(loc => {
            if (loc.category) {
              frequency[loc.category] = (frequency[loc.category] || 0) + 1;
            }
          });
          console.log("Category frequency:", frequency);
          const defaultCategory = Object.keys(frequency).reduce((a, b) => 
            frequency[a] > frequency[b] ? a : b, ''
          );
          console.log("Default category computed:", defaultCategory);

          setTrip((prev) => {
            const updatedLocations = [...prev.locations];
            if (!updatedLocations[0].cost && avgCost) {
              updatedLocations[0].cost = avgCost;
            }
            if (!updatedLocations[0].category && defaultCategory) {
              updatedLocations[0].category = defaultCategory;
            }
            console.log("Updated first location:", updatedLocations[0]);
            return { ...prev, locations: updatedLocations };
          });
        }
      } catch (error) {
        console.error("Error fetching past locations:", error);
      }
    }
    fetchPastLocations();
  }, []);

  // When user selects a location from LocationSearch.
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

  // Helper to update location fields.
  const handleFieldChange = (index, fieldName, value) => {
    setTrip((prev) => {
      const updatedLocations = prev.locations.map((loc, i) =>
        i === index ? { ...loc, [fieldName]: value } : loc
      );
      return { ...prev, locations: updatedLocations };
    });
  };

  // Handle photo drop.
  const handlePhotoDrop = useCallback((acceptedFiles) => {
    console.log("Photos dropped:", acceptedFiles);
    setTrip(prev => ({ ...prev, photos: [...prev.photos, ...acceptedFiles] }));
  }, []);

  // Handle adding a new friend tag.
  const handleAddTag = () => {
    if (tagInput.trim() !== '') {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
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
        lat: loc.coordinates ? loc.coordinates.lat : null,
        lon: loc.coordinates ? loc.coordinates.lon : null,
      })),
      photos: trip.photos.map(file => file.name), // For now, just sending file names.
      tags, // Friend tags added.
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
      <h1 className={styles.title}>Welcome back, {username}! Log a Trip</h1>
      
      <h2 className={styles.subTitle}>Locations</h2>
      {trip.locations.map((location, index) => (
        <div key={index} className={styles.card}>
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

      {/* Photo Upload Section */}
      <h2 className={styles.subTitle}>Photos</h2>
      <PhotoUpload onFilesAdded={handlePhotoDrop} />

      {/* Tag Your Friends Section */}
      <h2 className={styles.subTitle}>Tag Your Friends</h2>
      <div className={styles.tagsContainer}>
        <input
          type="text"
          placeholder="Enter friend's name"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          className={styles.tagInput}
        />
        <button type="button" onClick={handleAddTag} className={styles.addTagBtn}>
          Add Tag
        </button>
      </div>
      <div className={styles.tagsList}>
        {tags.map((tag, idx) => (
          <span key={idx} className={styles.tagItem}>{tag}</span>
        ))}
      </div>

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
