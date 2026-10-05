import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import CitizenDashboard from './pages/citizen/Dashboard.jsx';
import SubmitComplaint from './pages/citizen/SubmitComplaint.jsx';
import OfficerDashboard from './pages/officer/OfficerDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

function NavBar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <Link to="/" className="font-bold">County Complaints</Link>
      {user ? (
        <div className="flex items-center gap-4 text-sm">
          <span>{user.full_name} ({user.role})</span>
          <button onClick={logout} className="text-red-600">Log out</button>
        </div>
      ) : (
        <div className="flex gap-4 text-sm">
          <Link to="/login">Log in</Link>
          <Link to="/register">Register</Link>
        </div>
      )}
    </nav>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/citizen"
          element={<ProtectedRoute roles={['citizen']}><CitizenDashboard /></ProtectedRoute>}
        />
        <Route
          path="/citizen/submit"
          element={<ProtectedRoute roles={['citizen']}><SubmitComplaint /></ProtectedRoute>}
        />
        <Route
          path="/officer"
          element={<ProtectedRoute roles={['officer']}><OfficerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>}
        />

        <Route
          path="/"
          element={
            user
              ? <Navigate to={`/${user.role === 'admin' ? 'admin' : user.role}`} replace />
              : <Navigate to="/login" replace />
          }
        />
      </Routes>
    </div>
  );
}
