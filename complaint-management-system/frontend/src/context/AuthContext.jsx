import React, { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  function persist(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }

  async function registerCitizen(payload) {
    const { data } = await client.post('/auth/citizen/register', payload);
    persist(data.token, data.user);
    return data.user;
  }

  async function loginCitizen(email, password) {
    const { data } = await client.post('/auth/citizen/login', { email, password });
    persist(data.token, data.user);
    return data.user;
  }

  // Handles both officer and admin login - the backend returns the correct role
  async function loginOfficer(email, password) {
    const { data } = await client.post('/auth/officer/login', { email, password });
    persist(data.token, data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, registerCitizen, loginCitizen, loginOfficer, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
