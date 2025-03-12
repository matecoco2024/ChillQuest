'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/login', { email, password });
      console.log('Login successful:', response.data);
      // Save the username to localStorage
      localStorage.setItem('username', response.data.username);
      router.push('/dashboard'); // or wherever your main menu is rendered
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '1rem' }}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '1rem' }}
          />
        </label>
        <button type="submit" style={{ width: '100%' }}>Login</button>
      </form>
      <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <p>Don't have an account?</p>
        <button
          onClick={() => router.push('/signup')}
          style={{ padding: '0.5rem 1rem' }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
}
