// Administrative Module (Section 4.4.5)
const pool = require('../config/db');
const { notifyStatusChange } = require('../utils/notify');

// GET /api/admin/complaints  (view all complaints regardless of status/assignment)
async function getAllComplaints(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, ci.full_name AS citizen_name, o.full_name AS officer_name
       FROM complaint c
       JOIN citizen ci ON c.citizen_id = ci.citizen_id
       LEFT JOIN officer o ON c.officer_id = o.officer_id
       ORDER BY c.date_submitted DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

// PATCH /api/admin/complaints/:id/reassign  - TC09
async function reassignComplaint(req, res) {
  const { officer_id } = req.body;
  const { id } = req.params;
  try {
    const [[complaint]] = await pool.query('SELECT * FROM complaint WHERE complaint_id = ?', [id]);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const [[officer]] = await pool.query('SELECT * FROM officer WHERE officer_id = ?', [officer_id]);
    if (!officer) return res.status(404).json({ error: 'Officer not found' });

    await pool.query('UPDATE complaint SET officer_id = ? WHERE complaint_id = ?', [officer_id, id]);

    const [[citizen]] = await pool.query('SELECT * FROM citizen WHERE citizen_id = ?', [complaint.citizen_id]);
    await notifyStatusChange(citizen, { reference_no: complaint.reference_no, status: complaint.status });

    res.json({ message: `Complaint reassigned to ${officer.full_name}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reassign complaint' });
  }
}

// GET /api/admin/reports?from=YYYY-MM-DD&to=YYYY-MM-DD&category=Roads  - TC10
// Complaint volumes by category/department/time period + officer performance metrics.
async function generateReport(req, res) {
  const { from, to, category } = req.query;
  try {
    const params = [];
    let where = 'WHERE 1=1';
    if (from) { where += ' AND date_submitted >= ?'; params.push(from); }
    if (to) { where += ' AND date_submitted <= ?'; params.push(to); }
    if (category) { where += ' AND category = ?'; params.push(category); }

    const [volumeByCategory] = await pool.query(
      `SELECT category, COUNT(*) AS total,
              SUM(status = 'Resolved') AS resolved
       FROM complaint ${where}
       GROUP BY category`,
      params
    );

    const [officerPerformance] = await pool.query(
      `SELECT o.full_name,
              COUNT(c.complaint_id) AS assigned,
              SUM(c.status = 'Resolved') AS resolved,
              ROUND(AVG(TIMESTAMPDIFF(HOUR, c.date_submitted, c.date_resolved)), 1) AS avg_resolution_hours
       FROM officer o LEFT JOIN complaint c ON c.officer_id = o.officer_id ${from || to || category ? 'AND ' + where.replace('WHERE 1=1 AND ', '') : ''}
       GROUP BY o.officer_id`,
      params
    );

    res.json({ volumeByCategory, officerPerformance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
}

// POST /api/admin/officers  (manage user accounts / department mappings)
async function createOfficer(req, res) {
  const bcrypt = require('bcrypt');
  const { full_name, email, department_id, password, is_admin } = req.body;
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO officer (full_name, email, department_id, password_hash, is_admin) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, department_id, password_hash, !!is_admin]
    );
    res.status(201).json({ officer_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create officer account' });
  }
}

module.exports = { getAllComplaints, reassignComplaint, generateReport, createOfficer };
