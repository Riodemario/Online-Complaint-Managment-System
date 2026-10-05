import React, { useState } from 'react';
import client from '../../api/client';

const CATEGORIES = ['Roads', 'Water', 'Sanitation', 'Public Health', 'Other'];

export default function SubmitComplaint() {
  const [form, setForm] = useState({ title: '', description: '', category: CATEGORIES[0], location: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const { data } = await client.post('/complaints', form);
      setResult(data.complaint);
      setForm({ title: '', description: '', category: CATEGORIES[0], location: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Submit a complaint</h1>

      {result && (
        <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded">
          Complaint received — reference number <strong>{result.reference_no}</strong>.
          You'll get an SMS and email confirmation shortly.
        </div>
      )}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Short title (e.g. Broken streetlight on Kenyatta Ave)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={4}
          placeholder="Describe the issue"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
        <select
          className="w-full border rounded px-3 py-2"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />
        <button className="w-full bg-blue-600 text-white rounded py-2 font-medium">
          Submit complaint
        </button>
      </form>
    </div>
  );
}
