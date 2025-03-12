"use client";

import React from 'react';

export default function StarRating({ rating, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {stars.map((star) => (
        <span
          key={star}
          style={{
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: star <= rating ? '#ffc107' : '#e4e5e9'
          }}
          onClick={() => onChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
