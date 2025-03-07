"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TripLog() {
  const router = useRouter();
  const [trip, setTrip] = useState({
    city: '',
    date: '',
    cost: '',
    rating: '',
    travelStyle: '',
  });
  
  const handleChange = (e) => {
    setTrip({ ...trip, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trip),
    });
    if (res.ok) {
      console.log("Trip logged successfully!");
      // Redirect to the location list page
      router.push('/location-list');
    } else {
      console.error("Error logging trip");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input type="text" name="city" placeholder="City" value={trip.city} onChange={handleChange} required />
      <input type="date" name="date" value={trip.date} onChange={handleChange} required />
      <input type="number" name="cost" placeholder="Cost" value={trip.cost} onChange={handleChange} required />
      <input type="number" name="rating" placeholder="Rating" value={trip.rating} onChange={handleChange} required />
      <input type="text" name="travelStyle" placeholder="Travel Style" value={trip.travelStyle} onChange={handleChange} required />
      <button type="submit">Log Trip</button>
    </form>
  );
}
