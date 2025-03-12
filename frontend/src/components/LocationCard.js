"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function LocationCard({ location, tripId, onDelete }) {
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm("Are you sure you want to delete this location?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/locations/${location.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        // Call the onDelete callback to update parent state
        onDelete(location.id, tripId);
      } else {
        console.error("Failed to delete location");
      }
    } catch (err) {
      console.error("Error deleting location", err);
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      padding: '1rem', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
      backgroundColor: '#1B4D3E', 
      position: 'relative'
    }}>
      {/* Bin icon in top right corner */}
      <div
        style={{ 
          position: 'absolute', 
          top: '8px', 
          right: '8px', 
          cursor: 'pointer',
          fontSize: '1.2rem'
        }}
        onClick={handleDelete}
        title="Delete location"
      >
        🗑️
      </div>
      <h3 style={{ margin: '0 0 0.5rem' }}>{location.name}</h3>
      <p style={{ margin: '0.25rem 0' }}>
        <strong>Date:</strong> {new Date(location.date).toLocaleDateString()}
      </p>
      <p style={{ margin: '0.25rem 0' }}>
        <strong>Cost:</strong> {location.cost ? `€${location.cost.toFixed(2)}` : 'N/A'}
      </p>
      <p style={{ margin: '0.25rem 0', display: 'flex', alignItems: 'center' }}>
        <strong style={{ marginRight: '0.5rem' }}>Rating:</strong>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            style={{
              fontSize: '1.2rem',
              color: i < location.rating ? '#ffc107' : '#e4e5e9'
            }}
          >
            ★
          </span>
        ))}
      </p>
      <p style={{ margin: '0.25rem 0' }}>
        <strong>Category:</strong> {location.category}
      </p>
    </div>
  );
}
