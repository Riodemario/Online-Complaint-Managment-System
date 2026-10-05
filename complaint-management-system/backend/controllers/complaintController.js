// Complaint Submission, Tracking, and Officer Management Modules
// (Sections 4.4.2, 4.4.3, 4.4.4)
const pool = require('../config/db');
const { notifyComplaintSubmitted, notifyStatusChange } = require('../utils/notify');

function generateReferenceNo() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `CMP-${year}-${random}`;
}

// POST /api/complaints  (citizen only) - TC04 / TC05
async function submitComplaint(req, res) {
  const { title, description, category, location, photo_url } = req.body;
  const citizen_id = req.user.id;

  if (!title || !description || !category || !location) {
    return res.status(400).json({ error: 'title, description, category and location are required' }); // TC05
  }

  const reference_no = generateReferenceNo();

  try {
    // Auto-route to the department/officer matching the category (Section 2.3.2 gap this fills)
    const [deptRows] = await pool.query('SELECT dept_id FROM department WHERE dept_name = ?', [category]);
    const dept_id = deptRows[0]?.dept_id || null;
    const [officerRows] = dept_id
      ? await pool.query('SELECT officer_id FROM officer WHERE department_id = ? LIMIT 1', [dept_id])
      : [[]];
    const officer_id = officerRows[0]?.officer_id || null;

    const [result] = await pool.query(
      `INSERT INTO complaint (reference_no, title, description, category, location, photo_url, citizen_id, officer_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [reference_no, title, description, category, location, photo_url || null, citizen_id, officer_id]
    );

    const [[citizen]] = await pool.query('SELECT * FROM citizen WHERE citizen_id = ?', [citizen_id]);
    const complaint = { complaint_id: result.insertId, reference_no, status: 'Pending' };
    await notifyComplaintSubmitted(citizen, complaint); // SMS + email acknowledgement

    res.status(201).json({ message: 'Complaint submitted', complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit complaint' });
  }
}

// GET /api/complaints/mine  (citizen tracking dashboard) - TC06
async function getMyComplaints(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, o.full_name AS officer_name
       FROM complaint c
       LEFT JOIN officer o ON c.officer_id = o.officer_id
       WHERE c.citizen_id = ?
       ORDER BY c.date_submitted DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

// GET /api/complaints/:reference_no/timeline  (status history + responses)
async function getComplaintTimeline(req, res) {
  try {
    const [[complaint]] = await pool.query('SELECT * FROM complaint WHERE reference_no = ?', [req.params.reference_no]);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const [responses] = await pool.query(
      `SELECT r.*, o.full_name AS officer_name
       FROM response r JOIN officer o ON r.officer_id = o.officer_id
       WHERE r.complaint_id = ? ORDER BY r.date_responded ASC`,
      [complaint.complaint_id]
    );
    res.json({ complaint, responses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
}

// GET /api/complaints/assigned  (officer dashboard, Section 4.4.4)
async function getAssignedComplaints(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, ci.full_name AS citizen_name, ci.phone_number
       FROM complaint c JOIN citizen ci ON c.citizen_id = ci.citizen_id
       WHERE c.officer_id = ?
       ORDER BY FIELD(c.status,'Pending','In Progress','Resolved','Rejected'), c.date_submitted DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assigned complaints' });
  }
}

// PATCH /api/complaints/:id/status  (officer updates status + adds a response) - TC07/TC08
// The module enforces a response before a complaint can be marked Resolved.
async function updateComplaintStatus(req, res) {
  const { status, message } = req.body;
  const { id } = req.params;
  const officer_id = req.user.id;
  const valid = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

  if (!valid.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }
  if (status === 'Resolved' && !message) {
    return res.status(400).json({ error: 'A response message is required to mark a complaint as Resolved' });
  }

  try {
    const [[complaint]] = await pool.query('SELECT * FROM complaint WHERE complaint_id = ? AND officer_id = ?', [id, officer_id]);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found or not assigned to you' });

    const date_resolved = status === 'Resolved' ? new Date() : complaint.date_resolved;
    await pool.query('UPDATE complaint SET status = ?, date_resolved = ? WHERE complaint_id = ?', [status, date_resolved, id]);

    if (message) {
      await pool.query(
        'INSERT INTO response (complaint_id, officer_id, message) VALUES (?, ?, ?)',
        [id, officer_id, message]
      );
    }

    const [[citizen]] = await pool.query('SELECT * FROM citizen WHERE citizen_id = ?', [complaint.citizen_id]);
    await notifyStatusChange(citizen, { reference_no: complaint.reference_no, status });

    res.json({ message: 'Status updated', status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
}

module.exports = {
  submitComplaint,
  getMyComplaints,
  getComplaintTimeline,
  getAssignedComplaints,
  updateComplaintStatus,
};
