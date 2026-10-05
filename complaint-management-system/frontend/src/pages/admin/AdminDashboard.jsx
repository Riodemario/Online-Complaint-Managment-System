import React, { useEffect, useState } from 'react';
import client from '../../api/client';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    client.get('/admin/complaints').then((res) => setComplaints(res.data));
    client.get('/admin/reports').then((res) => setReport(res.data));
  }, []);

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 space-y-8">
      <div>
        <h1 className="text-xl font-bold mb-4">Complaint volumes by category</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {report?.volumeByCategory.map((row) => (
            <div key={row.category} className="bg-white rounded shadow p-4 text-center">
              <p className="text-2xl font-bold">{row.total}</p>
              <p className="text-sm text-gray-500">{row.category}</p>
              <p className="text-xs text-green-700">{row.resolved} resolved</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Officer performance</h2>
        <table className="w-full bg-white rounded shadow overflow-hidden">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="text-left p-2">Officer</th>
              <th className="text-left p-2">Assigned</th>
              <th className="text-left p-2">Resolved</th>
              <th className="text-left p-2">Avg. resolution (hrs)</th>
            </tr>
          </thead>
          <tbody>
            {report?.officerPerformance.map((o) => (
              <tr key={o.full_name} className="border-t text-sm">
                <td className="p-2">{o.full_name}</td>
                <td className="p-2">{o.assigned}</td>
                <td className="p-2">{o.resolved}</td>
                <td className="p-2">{o.avg_resolution_hours ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">All complaints</h2>
        <div className="space-y-2">
          {complaints.map((c) => (
            <div key={c.complaint_id} className="bg-white p-3 rounded shadow flex justify-between text-sm">
              <span>{c.reference_no} — {c.title} ({c.citizen_name})</span>
              <span>{c.status} · {c.officer_name || 'Unassigned'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
