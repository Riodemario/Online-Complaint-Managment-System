import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { loginCitizen, loginOfficer } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('citizen'); // citizen | officer (covers admin too)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const user = role === 'citizen'
        ? await loginCitizen(email, password)
        : await loginOfficer(email, password);

      if (user.role === 'citizen') navigate('/citizen');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/officer');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Log in</h1>

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setRole('citizen')}
          className={`flex-1 py-2 rounded ${role === 'citizen' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          Citizen
        </button>
        <button
          type="button"
          onClick={() => setRole('officer')}
          className={`flex-1 py-2 rounded ${role === 'officer' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
        >
          Officer / Admin
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="w-full bg-blue-600 text-white rounded py-2 font-medium">
          Log in
        </button>
      </form>
      {role === 'citizen' && (
        <p className="mt-4 text-sm">
          No account yet? <Link className="text-blue-600" to="/register">Register</Link>
        </p>
      )}
    </div>
  );
}
