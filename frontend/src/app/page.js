import React from 'react';
import MainMenu from '../components/MainMenu';

export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Welcome to ChillQuest</h1>
      <p>Your intelligent travel companion</p>
      <MainMenu />
    </main>
  );
}
