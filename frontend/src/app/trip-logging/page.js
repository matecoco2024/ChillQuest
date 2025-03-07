// src/app/trip-logging/page.js
import React from 'react';
import TripLog from '../../components/TripLog'; // adjust the path if necessary

export default function TripLoggingPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Trip Logging</h1>
      <TripLog />
    </main>
  );
}
