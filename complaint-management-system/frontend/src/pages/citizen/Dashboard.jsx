import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/complaints/mine').then((res) => {
      setComplaints(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">My complaints</h1>
        <Link to="/citizen/submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          + New complaint
        </Link>
      </div>

      {loading && <p>Loading…</p>}
      {!loading && complaints.length === 0 && (
        <p className="text-gray-500">You haven't submitted any complaints yet.</p>
      )}

      <div className="space-y-3">
        {complaints.map((c) => (
          <div key={c.complaint_id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <p className="font-medium">{c.title}</p>
              <p className="text-sm text-gray-500">
                {c.reference_no} · {c.category} · submitted {new Date(c.date_submitted).toLocaleDateString()}
              </p>
              {c.officer_name && <p className="text-sm text-gray-500">Assigned to {c.officer_name}</p>}
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[c.status]}`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
