import React, { useEffect, useState } from 'react';
import client from '../../api/client';

const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [drafts, setDrafts] = useState({}); // { [complaint_id]: { status, message } }

  function load() {
    client.get('/complaints/assigned').then((res) => setComplaints(res.data));
  }

  useEffect(load, []);

  function setDraft(id, field, value) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  }

  async function submitUpdate(id) {
    const draft = drafts[id] || {};
    if (!draft.status) return;
    try {
      await client.patch(`/complaints/${id}/status`, { status: draft.status, message: draft.message });
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Update failed');
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6">
      <h1 className="text-xl font-bold mb-6">Assigned complaints</h1>

      <div className="space-y-4">
        {complaints.map((c) => (
          <div key={c.complaint_id} className="bg-white p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-sm text-gray-500">
                  {c.reference_no} · {c.category} · from {c.citizen_name} ({c.phone_number})
                </p>
                <p className="text-sm mt-2">{c.description}</p>
                <p className="text-sm text-gray-500">Location: {c.location}</p>
              </div>
              <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 h-fit">{c.status}</span>
            </div>

            <div className="mt-3 flex gap-2 items-start">
              <select
                className="border rounded px-2 py-1"
                defaultValue=""
                onChange={(e) => setDraft(c.complaint_id, 'status', e.target.value)}
              >
                <option value="" disabled>Update status…</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea
                className="flex-1 border rounded px-2 py-1"
                rows={1}
                placeholder="Response to citizen (required to mark Resolved)"
                onChange={(e) => setDraft(c.complaint_id, 'message', e.target.value)}
              />
              <button
                onClick={() => submitUpdate(c.complaint_id)}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        ))}
        {complaints.length === 0 && <p className="text-gray-500">No complaints assigned to you.</p>}
      </div>
    </div>
  );
}
